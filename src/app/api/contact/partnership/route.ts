import { NextRequest } from "next/server";

import {
  created,
  handleError,
  notifyNewSubmission,
  partnershipSchema,
  prisma,
  rateLimit,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "contact:partnership");
    if (limited) return limited;

    const body = await req.json();
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
