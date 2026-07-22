import { created, handleError, hashPassword, prisma, registerSchema, setSessionCookie, signToken } from "@/lib";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // registerSchema has no `role` field, so a client cannot request one.
    const dto = registerSchema.parse(body);

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: "user", // always — elevation happens only via admin POST /api/users
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const { password: _, ...publicUser } = user;

    // Sign the new account in the same way login does — httpOnly cookie only,
    // never a token in the body. (A "user" role still can't reach /dashboard.)
    return setSessionCookie(
      created({
        user: publicUser,
        expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
      }),
      token,
    );
  } catch (error) {
    return handleError(error);
  }
}
