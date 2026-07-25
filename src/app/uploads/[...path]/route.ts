import { NextResponse } from "next/server";

import { readPublicUpload } from "@/lib";

// Content types for the image kinds the uploader accepts. Anything not listed
// is served as a generic binary — the browser and next/image never request
// those, so it only matters for a hand-typed URL.
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/**
 * GET /uploads/[...path] — serve a public upload from disk, per request.
 *
 * Next snapshots `public/` once at startup in production, so images uploaded
 * afterwards 404 as static assets (and next/image then returns 400). This
 * handler reads the file on each request instead, which is what makes freshly
 * uploaded images load without a restart. Files present at startup are still
 * served statically by Next before ever reaching here — this only catches the
 * ones the snapshot missed.
 *
 * When a real static server (e.g. an Nginx `alias` on /uploads) fronts the app
 * later, external requests are answered there and never reach this route; it
 * stays as a harmless fallback and still answers the optimizer's own fetch.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const file = await readPublicUpload(segments);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = segments[segments.length - 1].split(".").pop()?.toLowerCase();
  const contentType =
    (ext && CONTENT_TYPES[ext]) || "application/octet-stream";

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Filenames are UUID-prefixed and never rewritten, so the bytes at a
      // given URL never change — safe to cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
