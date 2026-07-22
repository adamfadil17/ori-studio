import { NextRequest } from "next/server";

import { Prisma, ProjectCategory, ProjectStatus } from "@/generated/prisma";
import {
  created,
  createProjectSchema,
  handleError,
  paginated,
  paginateQuery,
  parsePagination,
  prisma,
  requireAuth,
  requireRole,
} from "@/lib";
import { PROJECT_INCLUDE, resolveProjectSlug } from "@/lib/projects";

/**
 * GET /api/projects — listing with filters + pagination.
 * Public: published projects only. Admin/editor with `?includeUnpublished=true`
 * also sees drafts. Returns full projects (both translations + ordered images);
 * the frontend resolves the active locale into a `ProjectView`.
 */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { page, limit, search } = parsePagination(params);

    const includeUnpublished = params.get("includeUnpublished") === "true";
    if (includeUnpublished) {
      const payload = await requireAuth(req);
      requireRole(payload, "admin", "editor");
    }

    const categoryParam = params.get("category");
    const category =
      categoryParam && categoryParam in ProjectCategory
        ? (categoryParam as ProjectCategory)
        : undefined;

    const statusParam = params.get("status");
    const status =
      statusParam && statusParam in ProjectStatus
        ? (statusParam as ProjectStatus)
        : undefined;

    const location = params.get("location") ?? undefined;
    const featuredParam = params.get("featured");
    const featured =
      featuredParam == null ? undefined : featuredParam === "true";
    const yearParam = params.get("year");
    const year = yearParam ? Number(yearParam) : undefined;

    const where: Prisma.ProjectWhereInput = {
      ...(includeUnpublished ? {} : { publishedAt: { not: null } }),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
      ...(featured !== undefined ? { featured } : {}),
      // A project spans yearStart..(yearEnd ?? yearStart); match if `year` is inside.
      ...(year !== undefined && !Number.isNaN(year)
        ? {
            yearStart: { lte: year },
            OR: [{ yearEnd: { gte: year } }, { yearEnd: null, yearStart: { gte: year } }],
          }
        : {}),
      ...(search
        ? { translations: { some: { name: { contains: search, mode: "insensitive" } } } }
        : {}),
    };

    const { data, meta } = await paginateQuery(
      () => prisma.project.count({ where }),
      (skip, take) =>
        prisma.project.findMany({
          where,
          include: PROJECT_INCLUDE,
          orderBy: [
            { featured: "desc" },
            { yearStart: "desc" },
            { createdAt: "desc" },
          ],
          skip,
          take,
        }),
      page,
      limit,
    );

    return paginated(data, meta);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/projects — admin/editor: create a project with translations + images. */
export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = createProjectSchema.parse(await req.json());

    // Resolve each translation's unique slug before insert.
    const translations = await Promise.all(
      dto.translations.map(async (t) => ({
        locale: t.locale,
        name: t.name,
        slug: await resolveProjectSlug(t, t.locale),
        description: t.description ?? null,
      })),
    );

    const project = await prisma.project.create({
      data: {
        featured: dto.featured,
        publishedAt: dto.published ? new Date() : null,
        category: dto.category,
        services: dto.services,
        location: dto.location,
        yearStart: dto.yearStart,
        yearEnd: dto.yearEnd ?? null,
        client: dto.client ?? null,
        siteArea: dto.siteArea ?? null,
        buildingArea: dto.buildingArea ?? null,
        status: dto.status,
        architect: dto.architect,
        generalContractor: dto.generalContractor ?? null,
        translations: { create: translations },
        images: {
          create: dto.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? null,
            type: img.type,
            order: img.order,
          })),
        },
      },
      include: PROJECT_INCLUDE,
    });

    return created(project);
  } catch (error) {
    return handleError(error);
  }
}
