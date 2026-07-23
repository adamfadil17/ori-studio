import LookupManager from "@/components/admin/lists/lookup-manager";
import { listLookup } from "@/lib/lookups";

export const dynamic = "force-dynamic";

/**
 * The three studio-managed lists that feed the project and article forms.
 * Gathered on one screen because they are short and rarely touched — the
 * everyday path is creating them inline from the form that needs them.
 */
export default async function ListsPage() {
  const [projectCategories, articleCategories, locations] = await Promise.all([
    listLookup("project-categories"),
    listLookup("article-categories"),
    listLookup("locations"),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs tracking-widest uppercase text-eyebrow">Settings</p>
      <h1 className="mt-3 font-serif text-3xl text-headline">Lists</h1>
      <p className="mt-2 text-sm text-body">
        Options offered by the project and article forms. Anything still in use
        cannot be deleted — reassign the content first.
      </p>

      <div className="mt-8 space-y-6">
        <LookupManager
          kind="project-categories"
          title="Project categories"
          description="Sectors on the projects listing and filters."
          initialItems={projectCategories}
        />
        <LookupManager
          kind="locations"
          title="Locations"
          description="City, province and country a project sits in."
          initialItems={locations}
        />
        <LookupManager
          kind="article-categories"
          title="Article categories"
          description="Categories on the journal listing and filters."
          initialItems={articleCategories}
        />
      </div>
    </div>
  );
}
