import { NextRequest } from "next/server";

import {
  created,
  handleError,
  imageFileSchema,
  rateLimit,
  requireAuth,
  requireRole,
  uploadFolderSchema,
  uploadImage,
} from "@/lib";

/**
 * POST /api/uploads/image — admin/editor: upload one image, get its URL back.
 * multipart/form-data: `file` (required), `folder` ("projects"|"articles"|
 * "general"). The returned `url` is then stored on a project image / article
 * cover via the projects / articles APIs.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const limited = rateLimit(req, "upload:image", 30);
    if (limited) return limited;

    const form = await req.formData();
    const file = imageFileSchema.parse(form.get("file"));
    const folder = uploadFolderSchema.parse(form.get("folder") ?? undefined);

    const url = await uploadImage(file, folder);

    return created({ url });
  } catch (error) {
    return handleError(error);
  }
}
