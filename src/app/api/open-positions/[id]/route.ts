import { NextRequest } from "next/server";

import {
  handleError,
  noContent,
  notFound,
  ok,
  prisma,
  requireAuth,
  requireRole,
  updateOpenPositionSchema,
} from "@/lib";

/** GET /api/open-positions/[id] — public: read one position (e.g. detail modal). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const position = await prisma.openPosition.findUnique({ where: { id } });
    if (!position) return notFound("Open position");

    return ok(position);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/open-positions/[id] — admin/editor: update a position. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = updateOpenPositionSchema.parse(await req.json());

    const position = await prisma.openPosition.update({
      where: { id },
      data: dto,
    });

    return ok(position);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/open-positions/[id] — admin/editor: delete a position.
 * Existing career applications keep their `positionOfInterest` text; their
 * `openPositionId` FK is set to null (schema `onDelete: SetNull`).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    await prisma.openPosition.delete({ where: { id } });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
