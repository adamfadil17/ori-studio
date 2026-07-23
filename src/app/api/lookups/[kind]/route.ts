import { NextRequest } from "next/server";

import {
  badRequest,
  created,
  handleError,
  ok,
  requireAuth,
  requireRole,
} from "@/lib";
import { createLookup, isLookupKind, listLookup } from "@/lib/lookups";

/**
 * One route for all three studio-managed lists (project categories, article
 * categories, locations) — the rules are identical, so `[kind]` keeps the
 * auth and validation in a single place instead of six near-identical files.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  try {
    const { kind } = await params;
    if (!isLookupKind(kind)) return badRequest(`Unknown lookup "${kind}"`);

    // Staff-only: these feed the dashboard's dropdowns, and the public pages
    // read categories through the project/article payloads instead.
    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const search = req.nextUrl.searchParams.get("search") ?? undefined;
    return ok(await listLookup(kind, search));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  try {
    const { kind } = await params;
    if (!isLookupKind(kind)) return badRequest(`Unknown lookup "${kind}"`);

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    return created(await createLookup(kind, await req.json()));
  } catch (error) {
    return handleError(error);
  }
}
