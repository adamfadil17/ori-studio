// Pure-Node storage core. NO `import "server-only"` here on purpose, so the
// cron sweeper (which runs under plain node/tsx via crontab, outside Next's
// runtime) can reuse the exact same URL↔path mapping and promote/trash logic.
//
// APP CODE MUST NOT import this directly — import from `./storage` (or the
// `@/lib` barrel), which adds the `server-only` guard. This module is imported
// only by `storage.ts` and by `scripts/sweep-uploads.ts`.

import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Storage roots
//
// Uploads live OUTSIDE the app/`public/` tree so they survive redeploys and
// aren't subject to Next's startup snapshot of `public/`. Each kind has a
// COMMITTED dir (referenced by the DB, served) and a sibling TMP dir on the
// same filesystem (staging + trash, never served). Keeping tmp on the same FS
// lets promote/trash be a cheap atomic `rename`.
//
// Lifecycle: upload → TMP · commit (DB ok) → promote(TMP→COMMITTED) ·
// replace/delete → trash(COMMITTED→TMP) · cron → sweep old, unreferenced TMP.
//
// Paths come from env in production. Dev falls back to project-local `.data/*`
// (gitignored) so it behaves exactly like prod — served through the route
// handler, not `public/`.
// ---------------------------------------------------------------------------

function envDir(name: string, fallback: string): string {
  const v = process.env[name]?.trim();
  return v ? v : path.join(process.cwd(), ".data", fallback);
}

/** Committed public images — the Nginx `alias` target in production. */
const UPLOADS_DIR = envDir("UPLOADS_DIR", "uploads");
/** Staging + trash for public images. Never served. */
const UPLOADS_TMP_DIR = envDir("UPLOADS_TMP_DIR", "uploads-tmp");
/** Committed private files (CVs). Never served statically. */
const PRIVATE_UPLOADS_DIR = envDir("PRIVATE_UPLOADS_DIR", "private");
/** Staging + trash for private files. Never served. */
const PRIVATE_TMP_DIR = envDir("PRIVATE_TMP_DIR", "private-tmp");

/** How long an unreferenced tmp file lives before the sweeper deletes it. */
export const UPLOADS_TTL_HOURS = Number(process.env.UPLOADS_TTL_HOURS) || 24;

// URL prefixes stored on records. The disk location changed, but these — and
// therefore every URL already in the DB — did not.
const PUBLIC_URL_PREFIX = "/uploads"; //           /uploads/images/<folder>/<file>
const CV_URL_PREFIX = "/api/uploads/cv/"; //        /api/uploads/cv/<file>

// Re-exported for the sweeper, which walks these same roots.
export { UPLOADS_DIR, UPLOADS_TMP_DIR, PRIVATE_UPLOADS_DIR, PRIVATE_TMP_DIR };

function safeName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .slice(-60) || "file"
  );
}

/** Split a relative URL tail into safe path segments, or null if any is unsafe. */
function safeSegments(rel: string): string[] | null {
  const segs = rel.split("/").filter(Boolean);
  if (segs.length === 0) return null;
  if (segs.some((s) => !/^[a-zA-Z0-9._-]+$/.test(s) || s === "..")) return null;
  return segs;
}

/**
 * Map a stored URL to its `{ tmp, committed }` disk paths, or null when the URL
 * isn't one we manage (e.g. an external `https://…` placeholder) or is unsafe.
 * `promote`/`trash` skip anything that returns null.
 */
export function resolveManaged(
  url: unknown,
): { tmp: string; committed: string } | null {
  if (typeof url !== "string") return null;

  if (url.startsWith(`${PUBLIC_URL_PREFIX}/`)) {
    const segs = safeSegments(url.slice(PUBLIC_URL_PREFIX.length + 1));
    if (!segs) return null;
    return {
      tmp: path.join(UPLOADS_TMP_DIR, ...segs),
      committed: path.join(UPLOADS_DIR, ...segs),
    };
  }

  if (url.startsWith(CV_URL_PREFIX)) {
    const segs = safeSegments(url.slice(CV_URL_PREFIX.length));
    if (!segs || segs.length !== 1) return null;
    return {
      tmp: path.join(PRIVATE_TMP_DIR, "cv", segs[0]),
      committed: path.join(PRIVATE_UPLOADS_DIR, "cv", segs[0]),
    };
  }

  return null;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Move a file, creating the destination dir. Falls back to copy+unlink across mounts. */
async function moveFile(src: string, dest: string): Promise<void> {
  await mkdir(path.dirname(dest), { recursive: true });
  try {
    await rename(src, dest);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EXDEV") {
      await copyFile(src, dest);
      await unlink(src);
    } else {
      throw err;
    }
  }
}

/**
 * Write an uploaded file to TMP and return the URL it will have once committed.
 * The file is NOT servable until `promote` moves it to COMMITTED — which the
 * write APIs do after the DB row referencing it is saved.
 */
async function persist(file: File, subdir: string): Promise<string> {
  const dir = path.join(UPLOADS_TMP_DIR, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `${PUBLIC_URL_PREFIX}/${subdir}/${filename}`;
}

/** Write a private file (CV) to TMP and return its filename. Promoted on submit. */
async function persistPrivate(file: File, subdir: string): Promise<string> {
  const dir = path.join(PRIVATE_TMP_DIR, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return filename;
}

/**
 * Move freshly-uploaded files from TMP to COMMITTED, so they become servable.
 * Called after a project/article/career row referencing them is written.
 *
 * Idempotent and tolerant: URLs not staged in tmp (already committed, external,
 * or unmanaged) are skipped. Safe to call with a mix of new and existing URLs.
 */
export async function promote(
  urls: ReadonlyArray<string | null | undefined>,
): Promise<void> {
  for (const url of urls) {
    const m = resolveManaged(url);
    if (!m) continue;
    if (!(await exists(m.tmp))) continue; // not staged → nothing to promote
    if (await exists(m.committed)) {
      // Already committed (e.g. a double submit): drop the tmp duplicate.
      await unlink(m.tmp).catch(() => {});
      continue;
    }
    await moveFile(m.tmp, m.committed);
  }
}

/**
 * Move now-unreferenced committed files back to TMP, where the sweeper will
 * delete them after the TTL. Called when an image/CV is replaced or its record
 * is deleted. Best-effort: a delete must never fail because a file wouldn't move.
 */
export async function trash(
  urls: ReadonlyArray<string | null | undefined>,
): Promise<void> {
  for (const url of urls) {
    const m = resolveManaged(url);
    if (!m) continue;
    if (!(await exists(m.committed))) continue; // already gone
    try {
      await moveFile(m.committed, m.tmp);
    } catch {
      // Leave the file in place rather than failing the delete; the reconcile
      // sweeper is the backstop.
    }
  }
}

/**
 * Upload a career CV (PDF) to private TMP. Returns the authenticated download
 * path (`/api/uploads/cv/<file>`), not a public asset URL — only admins can
 * fetch it, and only after it's promoted on submit.
 */
export async function uploadCv(file: File): Promise<string> {
  const filename = await persistPrivate(file, "cv");
  return `${CV_URL_PREFIX}${filename}`;
}

/**
 * Read a committed private file for an authenticated download. Returns null when
 * the name is unsafe (path traversal) or the file is missing.
 */
export async function readPrivateFile(
  subdir: string,
  filename: string,
): Promise<Buffer | null> {
  // Only plain filenames — blocks "..", slashes and absolute paths.
  if (!/^[a-zA-Z0-9._-]+$/.test(filename) || filename.includes("..")) {
    return null;
  }

  try {
    return await readFile(path.join(PRIVATE_UPLOADS_DIR, subdir, filename));
  } catch {
    return null;
  }
}

/**
 * Read a committed PUBLIC upload (an image) so the route handler can serve it.
 * Reads the disk per request, which is what lets images uploaded after startup
 * load without a restart. `segments` is the URL path after `/uploads/`
 * (e.g. ["images","projects","<file>.jpg"]).
 *
 * Returns null when any segment is unsafe or the file is missing. The resolved
 * path is re-checked against the committed root as a second guard against
 * traversal. Only the committed dir is served — never tmp.
 */
export async function readPublicUpload(
  segments: string[],
): Promise<Buffer | null> {
  if (
    segments.length === 0 ||
    segments.some((s) => !/^[a-zA-Z0-9._-]+$/.test(s) || s === "..")
  ) {
    return null;
  }

  const root = UPLOADS_DIR;
  const target = path.join(root, ...segments);
  // Defence in depth: the resolved path must stay under the committed root.
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

/**
 * Upload an image (project hero/gallery, article cover) to TMP. `folder` groups
 * them — e.g. "projects" → `/uploads/images/projects/…`. Returns the URL to
 * store on the record; it becomes servable once promoted on submit.
 */
export async function uploadImage(
  file: File,
  folder = "general",
): Promise<string> {
  return persist(file, `images/${folder}`);
}

// ---------------------------------------------------------------------------
// Sweeper (cron) — see scripts/sweep-uploads.ts
// ---------------------------------------------------------------------------

/** One file sitting in a tmp root, with the URL it maps back to and its mtime. */
interface TmpEntry {
  absPath: string;
  url: string;
  mtimeMs: number;
}

async function walk(dir: string): Promise<string[]> {
  let out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out; // dir doesn't exist yet
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

/** List every file in the tmp roots, each with its stored URL and mtime. */
export async function listTmpFiles(): Promise<TmpEntry[]> {
  const entries: TmpEntry[] = [];

  for (const abs of await walk(UPLOADS_TMP_DIR)) {
    const rel = path.relative(UPLOADS_TMP_DIR, abs).split(path.sep).join("/");
    const s = await stat(abs);
    entries.push({ absPath: abs, url: `${PUBLIC_URL_PREFIX}/${rel}`, mtimeMs: s.mtimeMs });
  }
  for (const abs of await walk(PRIVATE_TMP_DIR)) {
    const segs = path.relative(PRIVATE_TMP_DIR, abs).split(path.sep);
    // Private layout is cv/<file>; anything else is unexpected — skip it.
    if (segs[0] !== "cv" || segs.length !== 2) continue;
    const s = await stat(abs);
    entries.push({ absPath: abs, url: `${CV_URL_PREFIX}${segs[1]}`, mtimeMs: s.mtimeMs });
  }
  return entries;
}

/** What a sweep run did, for logging. */
export interface SweepReport {
  /** URLs found in tmp but still referenced by the DB → promoted (crash backstop). */
  promoted: string[];
  /** Absolute paths of unreferenced tmp files older than the TTL → deleted. */
  deleted: string[];
  /** Unreferenced tmp files still within the grace window → left for a later run. */
  keptFresh: number;
}

/**
 * Reconcile then sweep the tmp roots.
 *
 * 1. A tmp file whose URL the DB still references means `promote` never ran
 *    (a crash between the DB write and the move) — promote it now.
 * 2. A tmp file the DB does not reference AND older than the TTL is an
 *    abandoned upload or a trashed file — delete it.
 * 3. Anything unreferenced but younger than the TTL is left alone: it may be an
 *    upload mid-submit, and the grace window keeps the sweeper from racing it.
 *
 * `now` is injectable for testing.
 */
export async function sweepTmp(
  referencedUrls: ReadonlySet<string>,
  ttlHours: number = UPLOADS_TTL_HOURS,
  now: number = Date.now(),
): Promise<SweepReport> {
  const cutoff = now - ttlHours * 3_600_000;
  const report: SweepReport = { promoted: [], deleted: [], keptFresh: 0 };

  for (const entry of await listTmpFiles()) {
    if (referencedUrls.has(entry.url)) {
      await promote([entry.url]);
      report.promoted.push(entry.url);
    } else if (entry.mtimeMs < cutoff) {
      await unlink(entry.absPath).catch(() => {});
      report.deleted.push(entry.absPath);
    } else {
      report.keptFresh++;
    }
  }

  return report;
}