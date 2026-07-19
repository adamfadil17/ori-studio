"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  LayoutGrid,
  List as ListIconLucide,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
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

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-headline/10 pb-6">
        <div className="relative inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="cursor-pointer appearance-none bg-transparent pr-5 text-xs tracking-widest uppercase text-headline focus-visible:outline-none"
          >
            <option value="ALL">{labels.all}</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-0 h-3 w-3"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            className={`transition-colors ${
              viewMode === "grid"
                ? "text-headline hover:cursor-pointer"
                : "text-headline/30 hover:text-headline/60"
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
                ? "text-headline"
                : "text-headline/30 hover:text-headline/60"
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
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className="mt-14 flex items-center justify-center gap-1 text-xs text-headline">
      <PageButton
        label="First page"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft
          className="h-4 w-4"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </PageButton>
      <PageButton
        label="Previous page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </PageButton>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-body">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage}
            className={`flex h-9 w-9 items-center justify-center transition-colors hover:cursor-pointer ${
              p === currentPage
                ? "bg-headline text-background-main"
                : "text-headline/60 hover:text-headline"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <PageButton
        label="Next page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight
          className="h-4 w-4"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </PageButton>
      <PageButton
        label="Last page"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight
          className="h-4 w-4"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </PageButton>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center text-headline/60 transition-colors hover:text-headline hover:cursor-pointer
      disabled:cursor-not-allowed disabled:text-headline/20"
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
