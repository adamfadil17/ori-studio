import { NextRequest } from "next/server";

import {
  careerFieldsSchema,
  created,
  cvFileSchema,
  handleError,
  notifyNewSubmission,
  prisma,
  rateLimit,
  uploadCv,
} from "@/lib";

/** Read a form field as a trimmed string, or `undefined` when empty/absent. */
function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "contact:career");
    if (limited) return limited;

    const form = await req.formData();

    // Validate text + file BEFORE uploading, so a bad payload never leaves an
    // orphaned CV on disk.
    const fields = careerFieldsSchema.parse({
      fullName: field(form, "fullName"),
      email: field(form, "email"),
      phoneNumber: field(form, "phoneNumber"),
      openPositionId: field(form, "openPositionId"),
      positionOfInterest: field(form, "positionOfInterest"),
      portfolioUrl: field(form, "portfolioUrl"),
      linkedinUrl: field(form, "linkedinUrl"),
      yearsOfExperience: field(form, "yearsOfExperience"),
    });
    const cvFile = cvFileSchema.parse(form.get("cvFile"));

    // Only link the position FK if it actually exists, and take the title from
    // the DB as the authoritative free-text fallback.
    let openPositionId: string | undefined;
    let positionOfInterest = fields.positionOfInterest;
    if (fields.openPositionId) {
      const position = await prisma.openPosition.findUnique({
        where: { id: fields.openPositionId },
      });
      if (position) {
        openPositionId = position.id;
        positionOfInterest = position.title;
      }
    }

    const cvUrl = await uploadCv(cvFile);

    const career = await prisma.contactCareer.create({
      data: {
        fullName: fields.fullName,
        email: fields.email,
        phoneNumber: fields.phoneNumber,
        openPositionId,
        positionOfInterest,
        portfolioUrl: fields.portfolioUrl,
        linkedinUrl: fields.linkedinUrl || null,
        yearsOfExperience: fields.yearsOfExperience,
        cvUrl,
      },
    });

    await notifyNewSubmission("CAREER", career);

    return created({ id: career.id });
  } catch (error) {
    return handleError(error);
  }
}
