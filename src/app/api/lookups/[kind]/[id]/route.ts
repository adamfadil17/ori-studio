import { NextRequest } from "next/server";

import {
  badRequest,
  handleError,
  noContent,
  notFound,
  ok,
  requireAuth,
  requireRole,
} from "@/lib";
import {
  deleteLookup,
  getLookup,
  isLookupKind,
  lookupLabel,
  updateLookup,
} from "@/lib/lookups";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const { kind, id } = await params;
    if (!isLookupKind(kind)) return badRequest(`Unknown lookup "${kind}"`);

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const item = await getLookup(kind, id);
    if (!item) return notFound(lookupLabel(kind).singular);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const { kind, id } = await params;
    if (!isLookupKind(kind)) return badRequest(`Unknown lookup "${kind}"`);

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    return ok(await updateLookup(kind, id, await req.json()));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const { kind, id } = await params;
    if (!isLookupKind(kind)) return badRequest(`Unknown lookup "${kind}"`);

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    // Refuses with a 409 naming the blocking count when the row is still in use.
    await deleteLookup(kind, id);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
