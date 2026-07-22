import ArticleForm from "@/components/admin/articles/article-form";
import BackLink from "@/components/admin/ui/back-link";

export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/journal">Journal</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">New article</h1>
      <p className="mt-2 text-sm text-body">
        English content is required; Indonesian can be added later.
      </p>

      <ArticleForm />
    </div>
  );
}
