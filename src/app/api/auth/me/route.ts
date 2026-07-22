import { handleError, notFound, ok, prisma } from "@/lib";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const payload = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) return notFound("User");
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}
