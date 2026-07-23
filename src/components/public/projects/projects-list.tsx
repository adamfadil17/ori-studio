"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { ServiceType } from "@/lib/types";
import Dropdown from "@/components/ui/dropdown";
import Pagination from "@/components/ui/pagination";
import ProjectCardView from "./project-card-view";

export interface ProjectListItem {
  slug: string;
  name: string;
  location: string;
  yearLabel: string;
  // Category names come from the database now, so this is the label itself
  // rather than an enum key needing a lookup table in the client.
  category: string;
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
  pageSize = 6,
}: ProjectsExplorerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [location, setLocation] = useState<string>("ALL");
  const [sector, setSector] = useState<string>("ALL");
  const [service, setService] = useState<ServiceType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const locationOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.location))).sort(),
    [projects],
  );
  const sectorOptions = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.category))).sort(),
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

  const topRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef(false);

  // Scroll AFTER the new page has rendered, not in the click handler. A shorter
  // page shrinks the document, and doing it too early lets the browser's scroll
  // clamp cancel the animation and strand the reader at the bottom. `scroll-mt`
  // on the anchor keeps it clear of the fixed header.
  useEffect(() => {
    if (!pendingScroll.current) return;
    pendingScroll.current = false;
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function handleFilterChange<T>(setter: (value: T) => void, value: T) {
    setter(value);
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
            options={sectorOptions.map((c) => ({ value: c, label: c }))}
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
                ? "text-eyebrow"
                : "text-eyebrow/50 hover:text-eyebrow/80"
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
                ? "text-eyebrow"
                : "text-eyebrow/50 hover:text-eyebrow/80"
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
          onPageChange={handlePageChange}
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
  return (
    <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-eyebrow">
      <span>{label}</span>
      <Dropdown
        ariaLabel={label}
        value={value}
        // "ALL" is this list's cleared state (it filters in memory rather than
        // through the URL, so it needs a real value rather than "").
        options={[{ value: "ALL", label: allLabel }, ...options]}
        onChange={(next) => onChange(next as T | "ALL")}
      />
    </span>
  );
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

