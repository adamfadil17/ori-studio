import { NextRequest } from "next/server";

import {
  created,
  createOpenPositionSchema,
  handleError,
  ok,
  prisma,
  requireAuth,
  requireRole,
} from "@/lib";

/**
 * GET /api/open-positions
 * Public: active positions only (careers section + career form).
 * Admin/editor with `?includeInactive=true`: every position.
 */
export async function GET(req: NextRequest) {
  try {
    const includeInactive =
      req.nextUrl.searchParams.get("includeInactive") === "true";

    if (includeInactive) {
      const payload = await requireAuth(req);
      requireRole(payload, "admin", "editor");
    }

    const positions = await prisma.openPosition.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return ok(positions);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/open-positions — admin/editor: create a position. */
export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = createOpenPositionSchema.parse(await req.json());

    const position = await prisma.openPosition.create({ data: dto });

    return created(position);
  } catch (error) {
    return handleError(error);
  }
}
