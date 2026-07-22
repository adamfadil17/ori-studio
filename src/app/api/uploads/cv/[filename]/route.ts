import { NextRequest, NextResponse } from "next/server";

import {
  handleError,
  notFound,
  readPrivateFile,
  requireAuth,
  requireRole,
} from "@/lib";

/**
 * GET /api/uploads/cv/[filename] — admin-only CV download.
 *
 * Applicant CVs are personal data, so they're stored outside `public/` and are
 * never served as static assets. This route is the only way to read one, and it
 * requires an admin token. `readPrivateFile` rejects unsafe filenames.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const { filename } = await params;
    const cv = await readPrivateFile("cv", filename);
    if (!cv) return notFound("CV");

    return new NextResponse(new Uint8Array(cv), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        // Never let a shared cache hold on to an applicant's CV.
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}