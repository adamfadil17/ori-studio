import { comparePassword, handleError, loginSchema, ok, prisma, setSessionCookie, signToken, unauthorized } from "@/lib";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return unauthorized("Invalid credentials");

    const valid = await comparePassword(password, user.password);
    if (!valid) return unauthorized("Invalid credentials");

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...publicUser } = user;

    // The session travels ONLY in the httpOnly cookie — it is never returned in
    // the body, where it could end up in logs, proxies or browser history.
    return setSessionCookie(
      ok({
        user: publicUser,
        expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
      }),
      token,
    );
  } catch (error) {
    return handleError(error);
  }
}
