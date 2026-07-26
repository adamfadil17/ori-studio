import { NextRequest } from "next/server";

import {
  handleError,
  noContent,
  notFound,
  ok,
  prisma,
  requireAuth,
  requireRole,
  submissionKindSchema,
  trash,
  updateSubmissionStatusSchema,
  type SubmissionKind,
} from "@/lib";
import { KIND_TO_TYPE, getSubmissionByKind } from "@/lib/submissions";
import type { SubmissionStatus } from "@/lib/types";

async function updateStatus(
  kind: SubmissionKind,
  id: string,
  status: SubmissionStatus,
) {
  switch (kind) {
    case "inquiry":
      return prisma.contactInquiry.update({ where: { id }, data: { status } });
    case "partnership":
      return prisma.contactPartnership.update({
        where: { id },
        data: { status },
      });
    case "career":
      return prisma.contactCareer.update({ where: { id }, data: { status } });
  }
}

async function deleteByKind(kind: SubmissionKind, id: string) {
  switch (kind) {
    case "inquiry":
      return prisma.contactInquiry.delete({ where: { id } });
    case "partnership":
      return prisma.contactPartnership.delete({ where: { id } });
    case "career":
      return prisma.contactCareer.delete({ where: { id } });
  }
}

type Params = { params: Promise<{ type: string; id: string }> };

/** GET /api/submissions/[type]/[id] — admin: full detail of one submission. */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const { type, id } = await params;
    const kind = submissionKindSchema.parse(type);

    const record = await getSubmissionByKind(kind, id);
    if (!record) return notFound("Submission");

    return ok(record);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/submissions/[type]/[id] — admin: update triage status. */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const { type, id } = await params;
    const kind = submissionKindSchema.parse(type);
    const { status } = updateSubmissionStatusSchema.parse(await req.json());

    const updated = await updateStatus(kind, id, status);

    return ok({ ...updated, type: KIND_TO_TYPE[kind] });
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/submissions/[type]/[id] — admin: delete a submission. */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const { type, id } = await params;
    const kind = submissionKindSchema.parse(type);

    // A career submission owns a CV file; capture it before deleting so it can
    // be trashed for the sweeper. Other kinds have no files.
    let cvUrl: string | null = null;
    if (kind === "career") {
      const record = await prisma.contactCareer.findUnique({
        where: { id },
        select: { cvUrl: true },
      });
      cvUrl = record?.cvUrl ?? null;
    }

    await deleteByKind(kind, id);
    if (cvUrl) await trash([cvUrl]);

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
