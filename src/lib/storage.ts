import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Public assets (images) live under public/uploads — served statically.
const UPLOAD_ROOT = "uploads";
// Private files (CVs) live OUTSIDE public/ so Next never serves them directly;
// they're only reachable through an authenticated download route.
const PRIVATE_ROOT = "private-uploads";

function safeName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .slice(-60) || "file"
  );
}

/**
 * Local-disk driver (dev / self-hosted): write a file under
 * `public/uploads/<subdir>` and return its root-relative URL. Files placed in
 * `public/` are served statically by the Node server at request time.
 *
 * To move to production object storage (Cloudflare R2 / Supabase Storage / S3),
 * replace the body of this one function with an SDK upload that returns the
 * object's public URL — `uploadCv` / `uploadImage` need no changes.
 *
 * ⚠️ Does NOT work on serverless/read-only filesystems (e.g. Vercel). Swap to
 * R2/S3 before deploying there.
 */
async function persist(file: File, subdir: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/${UPLOAD_ROOT}/${subdir}/${filename}`;
}

/**
 * Write a file to private storage (outside `public/`) and return its filename.
 * Used for applicant CVs, which are personal data and must never be served as
 * static assets. Swap this body for a private S3/R2 bucket in production.
 */
async function persistPrivate(file: File, subdir: string): Promise<string> {
  const dir = path.join(process.cwd(), PRIVATE_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return filename;
}

/**
 * Upload a career CV (PDF) to PRIVATE storage. Returns the authenticated
 * download path (`/api/uploads/cv/<file>`), not a public asset URL — only
 * admins can fetch it through that route.
 */
export async function uploadCv(file: File): Promise<string> {
  const filename = await persistPrivate(file, "cv");
  return `/api/uploads/cv/${filename}`;
}

/**
 * Read a private file for an authenticated download. Returns null when the
 * name is unsafe (path traversal) or the file is missing.
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
    return await readFile(path.join(process.cwd(), PRIVATE_ROOT, subdir, filename));
  } catch {
    return null;
  }
}

/**
 * Read a PUBLIC upload (an image) so a route handler can serve it.
 *
 * In production Next snapshots `public/` once at startup and 404s anything
 * written afterwards — so freshly uploaded images are unreachable as static
 * assets until the next restart. Serving them through a route handler, which
 * reads the disk per request, sidesteps that. `segments` is the URL path after
 * `/uploads/` (e.g. ["images","projects","<file>.jpg"]).
 *
 * Returns null when any segment is unsafe or the file is missing. The resolved
 * path is re-checked against the upload root as a second guard against
 * traversal.
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

  const root = path.join(process.cwd(), "public", UPLOAD_ROOT);
  const target = path.join(root, ...segments);
  // Defence in depth: the resolved path must stay under the upload root.
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  try {
    return await readFile(target);
  } catch {
    return null;
  }
}

/**
 * Upload an image (project hero/gallery, article cover). `folder` groups them
 * on disk — e.g. "projects" → `/uploads/images/projects/…`. Returns the public
 * URL to store on the record; `next/image` handles AVIF/WebP at serve time.
 */
export async function uploadImage(
  file: File,
  folder = "general",
): Promise<string> {
  return persist(file, `images/${folder}`);
}
