import { NextRequest } from "next/server";

import {
  badRequest,
  created,
  handleError,
  notifyNewSubmission,
  partnershipSchema,
  prisma,
  rateLimit,
  verifyRecaptcha,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "contact:partnership");
    if (limited) return limited;

    const body = await req.json();

    // Spam gate before touching the DB. Disabled when no secret key is set.
    if (!(await verifyRecaptcha(body?.recaptchaToken))) {
      return badRequest("reCAPTCHA verification failed. Please try again.");
    }

    // The schema strips the extra `recaptchaToken` key on parse.
    const dto = partnershipSchema.parse(body);

    const partnership = await prisma.contactPartnership.create({
      data: {
        companyName: dto.companyName,
        role: dto.role,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        partnershipType: dto.partnershipType,
        partnershipOther: dto.partnershipOther,
        vision: dto.vision,
      },
    });

    await notifyNewSubmission("PARTNERSHIP", partnership);

    return created({ id: partnership.id });
  } catch (error) {
    return handleError(error);
  }
}
