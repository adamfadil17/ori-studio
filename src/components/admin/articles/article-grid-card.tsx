import Image from "next/image";

import ArticleRowActions from "@/components/admin/articles/article-row-actions";
import { LocaleBadges, StateBadge } from "@/components/admin/ui/list-badges";

export interface ArticleGridCardData {
  id: string;
  title: string;
  hasId: boolean;
  featured: boolean;
  published: boolean;
  category: string;
  publishedLabel: string;
  image: string;
  imageAlt?: string;
}

export default function ArticleGridCard({
  article,
}: {
  article: ArticleGridCardData;
}) {
  return (
    <article className="flex flex-col bg-background-main">
      <div className="relative aspect-[4/3] overflow-hidden bg-background-alt">
        <Image
          src={article.image}
          alt={article.imageAlt ?? ""}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute left-2 top-2">
          <StateBadge published={article.published} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[10px] tracking-widest uppercase text-eyebrow">
          {article.category}
        </p>
        <h2 className="font-serif text-lg leading-snug text-headline">
          {article.title}
        </h2>
        <LocaleBadges hasId={article.hasId} featured={article.featured} />
        <p
          className="mt-1 text-xs text-body"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {article.publishedLabel}
        </p>

        <div className="mt-3 border-t border-headline/10 pt-3">
          <ArticleRowActions id={article.id} title={article.title} />
        </div>
      </div>
    </article>
  );
}
