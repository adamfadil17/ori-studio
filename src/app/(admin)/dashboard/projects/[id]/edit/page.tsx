import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import ProjectForm, {
  type ProjectFormInitial,
} from "@/components/admin/projects/project-form";
import { PROJECT_INCLUDE } from "@/lib/projects";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: PROJECT_INCLUDE,
  });
  if (!project) notFound();

  // Map to a plain, serialisable shape for the client form (no Date objects).
  const initial: ProjectFormInitial = {
    id: project.id,
    featured: project.featured,
    published: project.publishedAt !== null,
    category: project.category,
    services: project.services,
    location: project.location,
    yearStart: project.yearStart,
    yearEnd: project.yearEnd,
    client: project.client,
    siteArea: project.siteArea,
    buildingArea: project.buildingArea,
    status: project.status,
    architect: project.architect,
    generalContractor: project.generalContractor,
    translations: project.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      slug: t.slug,
      description: t.description,
    })),
    images: project.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      type: img.type,
      order: img.order,
    })),
  };

  const en = project.translations.find((t) => t.locale === "EN");

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/projects">Projects</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">
        {en?.name ?? "Edit project"}
      </h1>
      <p className="mt-2 text-sm text-body">
        {project.publishedAt ? "Published" : "Draft"} ·{" "}
        {project.translations.length === 2
          ? "EN + ID"
          : "English only — Indonesian not added yet"}
      </p>

      <ProjectForm initial={initial} />
    </div>
  );
}
