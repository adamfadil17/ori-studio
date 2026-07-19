"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { ProjectCategory, ServiceType } from "@/lib/types";
import ProjectCardView from "./project-card-view";

export interface ProjectListItem {
  slug: string;
  name: string;
  location: string;
  yearLabel: string;
  category: ProjectCategory;
  services: ServiceType[];
  thumbnailUrl?: string;
}

interface ProjectsExplorerLabels {
  location: string;
  sectors: string;
  services: string;
  all: string;
  empty: string;
}

interface ProjectsExplorerProps {
  locale: Locale;
  projects: readonly ProjectListItem[];
  labels: ProjectsExplorerLabels;
  pageSize?: number;
}

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  RESIDENTIAL: "Residential",
  HOSPITALITY: "Hospitality",
  COMMERCIAL: "Commercial",
  LANDSCAPE: "Landscape",
  INTERIOR: "Interior",
  OTHER: "Other",
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  ARCHITECTURE_DESIGN: "Architecture Design",
  INTERIOR_DESIGN: "Interior Design",
  LANDSCAPE_DESIGN: "Landscape Design",
  PROJECT_MANAGEMENT: "Project Management",
  OTHER: "Other",
};

export default function ProjectsList({
  locale,
  projects,
  labels,
  pageSize = 9,
}: ProjectsExplorerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [location, setLocation] = useState<string>("ALL");
  const [sector, setSector] = useState<ProjectCategory | "ALL">("ALL");
  const [service, setService] = useState<ServiceType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const locationOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.location))).sort(),
    [projects],
  );
  const sectorOptions = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.category))) as ProjectCategory[],
    [projects],
  );
  const serviceOptions = useMemo(
    () =>
      Array.from(new Set(projects.flatMap((p) => p.services))) as ServiceType[],
    [projects],
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (location !== "ALL" && p.location !== location) return false;
      if (sector !== "ALL" && p.category !== sector) return false;
      if (service !== "ALL" && !p.services.includes(service)) return false;
      return true;
    });
  }, [projects, location, sector, service]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleFilterChange<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-headline/10 pb-6">
        <div className="flex flex-wrap items-center gap-6">
          <FilterSelect
            label={labels.location}
            value={location}
            onChange={(v) => handleFilterChange(setLocation, v)}
            options={locationOptions.map((loc) => ({ value: loc, label: loc }))}
            allLabel={labels.all}
          />
          <FilterSelect
            label={labels.sectors}
            value={sector}
            onChange={(v) => handleFilterChange(setSector, v)}
            options={sectorOptions.map((c) => ({
              value: c,
              label: CATEGORY_LABELS[c],
            }))}
            allLabel={labels.all}
          />
          <FilterSelect
            label={labels.services}
            value={service}
            onChange={(v) => handleFilterChange(setService, v)}
            options={serviceOptions.map((s) => ({
              value: s,
              label: SERVICE_LABELS[s],
            }))}
            allLabel={labels.all}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
            className={`transition-colors hover:cursor-pointer ${
              viewMode === "grid"
                ? "text-headline"
                : "text-headline/30 hover:text-headline/60"
            }`}
          >
            <GridIcon />
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
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Results */}
      {paged.length === 0 ? (
        <p className="mt-10 text-sm text-body">{labels.empty}</p>
      ) : viewMode === "grid" ? (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((project) => (
            <ProjectCardView
              key={project.slug}
              locale={locale}
              slug={project.slug}
              name={project.name}
              location={project.location}
              yearLabel={project.yearLabel}
              thumbnailUrl={project.thumbnailUrl}
            />
          ))}
        </div>
      ) : (
        <div className="mt-2">
          {paged.map((project) => (
            <ProjectCardView
              key={project.slug}
              locale={locale}
              slug={project.slug}
              name={project.name}
              location={project.location}
              yearLabel={project.yearLabel}
              thumbnailUrl={project.thumbnailUrl}
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

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: T | "ALL";
  onChange: (value: T | "ALL") => void;
  options: { value: T; label: string }[];
  allLabel: string;
}) {
  const selectedLabel =
    value === "ALL"
      ? allLabel
      : (options.find((opt) => opt.value === value)?.label ?? allLabel);

  return (
    <label className="relative inline-flex cursor-pointer items-center gap-2 text-xs tracking-widest uppercase text-headline">
      <span>{label}</span>
      <span className="relative inline-flex items-center">
        {/* Teks yang tampil, lebarnya ngikutin opsi yang lagi dipilih aja
            (bukan opsi terpanjang), jadi chevron-nya nggak kebawa jauh. */}
        <span className="whitespace-nowrap pr-5 text-xs tracking-widest uppercase text-headline">
          {selectedLabel}
        </span>
        <ChevronDownIcon className="pointer-events-none absolute right-0 h-2.5 w-2.5" />

        {/* Select asli, transparan, nutupin seluruh area buat interaksi/klik
            dan aksesibilitas keyboard — nggak mempengaruhi layout visual. */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T | "ALL")}
          aria-label={label}
          className="absolute inset-0 w-full cursor-pointer appearance-none opacity-0"
        >
          <option value="ALL">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </span>
    </label>
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
        «
      </PageButton>
      <PageButton
        label="Previous page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
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
            className={`flex h-8 w-8 items-center justify-center transition-colors ${
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
        ›
      </PageButton>
      <PageButton
        label="Last page"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        »
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
      className="flex h-8 w-8 items-center justify-center text-headline/60 transition-colors hover:text-headline disabled:cursor-not-allowed disabled:text-headline/20"
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

function GridIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5h12M3 9h12M3 13h12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}