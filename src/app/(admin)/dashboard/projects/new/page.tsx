import BackLink from "@/components/admin/ui/back-link";
import ProjectForm from "@/components/admin/projects/project-form";
import { listLookup } from "@/lib/lookups";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [categories, locations] = await Promise.all([
    listLookup("project-categories"),
    listLookup("locations"),
  ]);
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/projects">Projects</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">New project</h1>
      <p className="mt-2 text-sm text-body">
        English content is required; Indonesian can be added later.
      </p>

      <ProjectForm categories={categories} locations={locations} />
    </div>
  );
}
