import Link from "next/link";

import ArticleGridCard from "@/components/admin/articles/article-grid-card";
import ArticleRowActions from "@/components/admin/articles/article-row-actions";
import FilterBar from "@/components/admin/ui/filter-bar";
import { LocaleBadges, StateBadge } from "@/components/admin/ui/list-badges";
import ViewToggle, { parseView } from "@/components/admin/ui/view-toggle";
import Pagination from "@/components/ui/pagination";
import {
  getArticleFilterOptions,
  listArticlesForAdmin,
} from "@/lib/articles";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    view?: string;
    category?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.q?.trim() || undefined;
  const view = parseView(params.view);
  const category = params.category || undefined;
  const state = params.state === "published" || params.state === "draft"
    ? params.state
    : undefined;

  const [{ data, total, totalPages }, options] = await Promise.all([
    listArticlesForAdmin({
      page,
      limit: PAGE_SIZE,
      search,
      category,
      published: state === undefined ? undefined : state === "published",
    }),
    getArticleFilterOptions(),
  ]);

  // Declared ONCE so a newly added filter can't be forgotten in one of the
  // links: the view toggle carries the filters, pagination carries those plus
  // the current view.
  const filterQuery = { q: search, category, state };
  const query = {
    ...filterQuery,
    view: view === "grid" ? "grid" : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            Content
          </p>
          <h1 className="mt-3 font-serif text-3xl text-headline">Journal</h1>
          <p className="mt-2 text-sm text-body">
            {total} {total === 1 ? "article" : "articles"} total
          </p>
        </div>
        <Link
          href="/dashboard/journal/new"
          className="bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90"
        >
          New article
        </Link>
      </div>

      <div className="mt-6 border-b border-headline/10 pb-6">
        <FilterBar
          basePath="/dashboard/journal"
          search={search}
          searchPlaceholder="Search by title…"
          searchAriaLabel="Search articles by title"
          extraParams={{ view: view === "grid" ? "grid" : undefined }}
          trailing={
            <ViewToggle
              current={view}
              basePath="/dashboard/journal"
              query={filterQuery}
            />
          }
          filters={[
            {
              name: "category",
              label: "Category",
              value: category ?? "",
              options: options.categories.map((c) => ({ value: c, label: c })),
            },
            {
              name: "state",
              label: "State",
              value: state ?? "",
              options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ],
            },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-headline/15 px-4 py-12 text-center text-sm text-body">
          {search || category || state
            ? "No articles match the current filters."
            : "No articles yet. Write the first one."}
        </p>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((article) => {
            const en = article.translations.find((t) => t.locale === "EN");
            return (
              <ArticleGridCard
                key={article.id}
                article={{
                  id: article.id,
                  title: en?.title ?? "(untitled)",
                  hasId: article.translations.some((t) => t.locale === "ID"),
                  featured: article.featured,
                  published: article.publishedAt !== null,
                  category: article.category,
                  publishedLabel: formatDate(article.publishedAt),
                  image: article.image,
                  imageAlt: article.imageAlt ?? undefined,
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto bg-background-main">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-4 py-3 text-left font-normal">Title</th>
                <th className="px-3 py-3 text-left font-normal">Category</th>
                <th className="px-3 py-3 text-left font-normal">Published</th>
                <th className="px-3 py-3 text-left font-normal">State</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((article) => {
                const en = article.translations.find((t) => t.locale === "EN");
                const hasId = article.translations.some(
                  (t) => t.locale === "ID",
                );
                const published = article.publishedAt !== null;
                return (
                  <tr
                    key={article.id}
                    className="border-b border-headline/5 align-top"
                  >
                    <td className="px-4 py-3">
                      <span className="block text-headline">
                        {en?.title ?? "(untitled)"}
                      </span>
                      <span className="mt-0.5 block">
                        <LocaleBadges
                          hasId={hasId}
                          featured={article.featured}
                        />
                      </span>
                    </td>
                    <td className="px-3 py-3 text-body">{article.category}</td>
                    <td
                      className="px-3 py-3 text-body"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-3 py-3">
                      <StateBadge published={published} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ArticleRowActions
                        id={article.id}
                        title={en?.title ?? "this article"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/dashboard/journal"
        query={query}
      />
    </div>
  );
}
