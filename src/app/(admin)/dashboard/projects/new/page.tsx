import BackLink from "@/components/admin/ui/back-link";
import ProjectForm from "@/components/admin/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/projects">Projects</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">New project</h1>
      <p className="mt-2 text-sm text-body">
        English content is required; Indonesian can be added later.
      </p>

      <ProjectForm />
    </div>
  );
}
