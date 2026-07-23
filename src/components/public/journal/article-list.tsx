"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List as ListIconLucide } from "lucide-react";
import type { Locale } from "@/i18n/config";
import Dropdown from "@/components/ui/dropdown";
import Pagination from "@/components/ui/pagination";
import ArticleCardView from "./article-card-view";

export interface ArticleListItem {
  slug: string;
  title: string;
  category: string;
  publishedLabel: string;
  imageUrl?: string;
}

interface JournalExplorerLabels {
  all: string;
  empty: string;
}

interface JournalExplorerProps {
  locale: Locale;
  articles: readonly ArticleListItem[];
  labels: JournalExplorerLabels;
  pageSize?: number;
}

export default function ArticleList({
  locale,
  articles,
  labels,
  pageSize = 8,
}: JournalExplorerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category))).sort(),
    [articles],
  );

  const filtered = useMemo(() => {
    if (category === "ALL") return articles;
    return articles.filter((a) => a.category === category);
  }, [articles, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const topRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef(false);

  // Scroll AFTER the new page renders, not in the click handler. A shorter page
  // shrinks the document, and doing it too early lets the browser's scroll
  // clamp cancel the animation and strand the reader at the bottom.
  useEffect(() => {
    if (!pendingScroll.current) return;
    pendingScroll.current = false;
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handlePageChange(next: number) {
    pendingScroll.current = true;
    setPage(next);
  }

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-headline/10 pb-6">
        <Dropdown
          ariaLabel="Category"
          value={category}
          options={[
            { value: "ALL", label: labels.all },
            ...categoryOptions.map((opt) => ({ value: opt, label: opt })),
          ]}
          onChange={handleCategoryChange}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            className={`transition-colors ${
              viewMode === "grid"
                ? "text-eyebrow hover:cursor-pointer"
                : "text-eyebrow/50 hover:text-eyebrow/80"
            }`}
          >
            <LayoutGrid
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            className={`transition-colors hover:cursor-pointer ${
              viewMode === "list"
                ? "text-eyebrow"
                : "text-eyebrow/50 hover:text-eyebrow/80"
            }`}
          >
            <ListIconLucide
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Results */}
      {paged.length === 0 ? (
        <p className="mt-10 text-sm text-body">{labels.empty}</p>
      ) : viewMode === "grid" ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {paged.map((article) => (
            <ArticleCardView
              key={article.slug}
              locale={locale}
              slug={article.slug}
              title={article.title}
              category={article.category}
              publishedLabel={article.publishedLabel}
              imageUrl={article.imageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="mt-2">
          {paged.map((article) => (
            <ArticleCardView
              key={article.slug}
              locale={locale}
              slug={article.slug}
              title={article.title}
              category={article.category}
              publishedLabel={article.publishedLabel}
              imageUrl={article.imageUrl}
              layout="list"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

