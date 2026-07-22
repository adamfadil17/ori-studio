import { NextRequest } from "next/server";

import {
  created,
  handleError,
  notifyNewSubmission,
  prisma,
  projectInquirySchema,
  rateLimit,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "contact:inquiry");
    if (limited) return limited;

    const body = await req.json();
    const dto = projectInquirySchema.parse(body);

    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        serviceType: dto.serviceType,
        serviceTypeOther: dto.serviceTypeOther,
        projectType: dto.projectType,
        projectTypeOther: dto.projectTypeOther,
        estimatedLocation: dto.estimatedLocation,
        estimatedBudget: dto.estimatedBudget,
        vision: dto.vision,
      },
    });

    await notifyNewSubmission("PROJECT_INQUIRY", inquiry);

    return created({ id: inquiry.id });
  } catch (error) {
    return handleError(error);
  }
}
