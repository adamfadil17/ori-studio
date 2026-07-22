import { NextRequest, NextResponse } from "next/server";

import {
  buildPaginationMeta,
  handleError,
  parsePagination,
  requireAuth,
  requireRole,
  submissionStatusSchema,
} from "@/lib";
import { ALL_SUBMISSION_TYPES, listSubmissions } from "@/lib/submissions";
import type { SubmissionType } from "@/lib/types";

/**
 * GET /api/submissions — admin: unified inbox across all three contact channels.
 * Query: `type` (one channel, else all), `status`, `search`, `page`, `limit`.
 * Returns normalized list rows + pagination meta + whole-inbox counts.
 *
 * The merge/count logic lives in lib/submissions so the dashboard page can use
 * it directly without an HTTP round-trip.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const params = req.nextUrl.searchParams;
    const { page, limit, search } = parsePagination(params);

    const statusParam = params.get("status");
    const status = statusParam
      ? submissionStatusSchema.parse(statusParam)
      : undefined;

    const typeParam = params.get("type");
    if (typeParam && !ALL_SUBMISSION_TYPES.includes(typeParam as SubmissionType)) {
      return NextResponse.json(
        { success: false, error: "Unknown submission type" },
        { status: 400 },
      );
    }

    const { data, total, counts } = await listSubmissions({
      type: (typeParam as SubmissionType) || undefined,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data,
      meta: buildPaginationMeta(page, limit, total),
      counts,
    });
  } catch (error) {
    return handleError(error);
  }
}
