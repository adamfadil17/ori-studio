import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import ArticleForm, {
  type ArticleFormInitial,
} from "@/components/admin/articles/article-form";
import { ARTICLE_INCLUDE } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import type { TiptapJSON } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: ARTICLE_INCLUDE,
  });
  if (!article) notFound();

  // Plain, serialisable shape for the client form (no Date objects). `content`
  // is a Prisma Json column, so cast it back to the Tiptap document type.
  const initial: ArticleFormInitial = {
    id: article.id,
    featured: article.featured,
    published: article.publishedAt !== null,
    category: article.category,
    image: article.image,
    imageAlt: article.imageAlt,
    translations: article.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      slug: t.slug,
      excerpt: t.excerpt,
      content: t.content as unknown as TiptapJSON,
    })),
  };

  const en = article.translations.find((t) => t.locale === "EN");

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/journal">Journal</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">
        {en?.title ?? "Edit article"}
      </h1>
      <p className="mt-2 text-sm text-body">
        {article.publishedAt ? "Published" : "Draft"} ·{" "}
        {article.translations.length === 2
          ? "EN + ID"
          : "English only — Indonesian not added yet"}
      </p>

      <ArticleForm initial={initial} />
    </div>
  );
}
