import { NextRequest } from "next/server";

import {
  prisma,
  handleError,
  paginated,
  requireAuth,
  requireRole,
  created,
  parsePagination,
  paginateQuery,
  createUserSchema,
  userRoleSchema,
  hashPassword,
} from "@/lib";

const SELECT_PUBLIC = {
  id: true,
  name: true,
  email: true,
  role: true,
  created_at: true,
};

export async function GET(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const { page, limit, search } = parsePagination(req.nextUrl.searchParams);

    // Kept in step with the dashboard listing (lib/users.ts), which offers the
    // same role filter — an unrecognised value would otherwise be ignored
    // silently and return everyone.
    const roleParam = req.nextUrl.searchParams.get("role");
    const role = userRoleSchema.safeParse(roleParam).data;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    };

    const { data, meta } = await paginateQuery(
      () => prisma.user.count({ where }),
      (skip, take) =>
        prisma.user.findMany({
          where,
          select: SELECT_PUBLIC,
          skip,
          take,
          orderBy: { created_at: "desc" },
        }),
      page,
      limit,
    );

    return paginated(data, meta);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const body = await req.json();
    const dto = createUserSchema.parse(body);

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: { ...dto, password: hashedPassword },
      select: SELECT_PUBLIC,
    });

    return created(user);
  } catch (error) {
    return handleError(error);
  }
}
