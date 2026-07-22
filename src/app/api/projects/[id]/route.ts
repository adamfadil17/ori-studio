import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import {
  getAuthPayload,
  handleError,
  noContent,
  notFound,
  ok,
  prisma,
  requireAuth,
  requireRole,
  updateProjectSchema,
} from "@/lib";
import { PROJECT_INCLUDE, resolveProjectSlug } from "@/lib/projects";

const CONTENT_ROLES = ["admin", "editor"];

/**
 * GET /api/projects/[id] — read one project.
 * Drafts (publishedAt = null) are only visible to admin/editor.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (!project) return notFound("Project");

    if (project.publishedAt === null) {
      const payload = await getAuthPayload(req);
      if (!payload || !CONTENT_ROLES.includes(payload.role)) {
        return notFound("Project");
      }
    }

    return ok(project);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/projects/[id] — admin/editor: update fields, translations, images. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = updateProjectSchema.parse(await req.json());

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });
    if (!existing) return notFound("Project");

    // Scalar fields — only touch what was sent.
    const data: Prisma.ProjectUpdateInput = {};
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.services !== undefined) data.services = dto.services;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.yearStart !== undefined) data.yearStart = dto.yearStart;
    if (dto.yearEnd !== undefined) data.yearEnd = dto.yearEnd ?? null;
    if (dto.client !== undefined) data.client = dto.client ?? null;
    if (dto.siteArea !== undefined) data.siteArea = dto.siteArea ?? null;
    if (dto.buildingArea !== undefined) data.buildingArea = dto.buildingArea ?? null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.architect !== undefined) data.architect = dto.architect;
    if (dto.generalContractor !== undefined) {
      data.generalContractor = dto.generalContractor ?? null;
    }
    // Publish toggle: keep the original publish date when re-publishing.
    if (dto.published !== undefined) {
      data.publishedAt = dto.published ? (existing.publishedAt ?? new Date()) : null;
    }

    // Resolve slugs before the transaction (excluding this project from the check).
    const translations = dto.translations
      ? await Promise.all(
          dto.translations.map(async (t) => ({
            locale: t.locale,
            name: t.name,
            slug: await resolveProjectSlug(t, t.locale, id),
            description: t.description ?? null,
          })),
        )
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id }, data });

      // Upsert translations by locale (add or edit, never orphan).
      if (translations) {
        for (const t of translations) {
          await tx.projectTranslation.upsert({
            where: { projectId_locale: { projectId: id, locale: t.locale } },
            create: { projectId: id, ...t },
            update: { name: t.name, slug: t.slug, description: t.description },
          });
        }
      }

      // Images: full replace (the editor sends the complete set).
      if (dto.images) {
        await tx.projectImage.deleteMany({ where: { projectId: id } });
        if (dto.images.length) {
          await tx.projectImage.createMany({
            data: dto.images.map((img) => ({
              projectId: id,
              url: img.url,
              alt: img.alt ?? null,
              type: img.type,
              order: img.order,
            })),
          });
        }
      }
    });

    const project = await prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });

    return ok(project);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/projects/[id] — admin/editor: delete (cascades translations + images). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    await prisma.project.delete({ where: { id } });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
