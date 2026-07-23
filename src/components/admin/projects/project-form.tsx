"use client";

/* eslint-disable @next/next/no-img-element -- previews are blob: URLs, which next/image can't optimise */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

import {
  FieldSectionLabel,
  NativeSelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/form-fields";
import LookupSelect from "@/components/admin/ui/lookup-select";
import type { LookupItem } from "@/lib/lookups";
import { humanizeEnum } from "@/lib/format";
import { toSlug } from "@/lib/slug";
import {
  MAX_GALLERY_IMAGES,
  MAX_HERO_IMAGES,
  projectFormSchema,
  type ProjectFormInput,
  type ProjectFormValues,
} from "@/lib/validators";
import {
  makePreview,
  resolveDraftImages,
  revokePreview,
  validateImageFile,
  type DraftImage,
} from "@/lib/upload-client";
import type {
  ProjectStatus,
  ServiceType,
} from "@/lib/types";

const STATUSES: ProjectStatus[] = [
  "IN_PROGRESS", "COMPLETED", "ON_HOLD", "PLANNED",
];
const SERVICES: ServiceType[] = [
  "ARCHITECTURE_DESIGN", "INTERIOR_DESIGN", "LANDSCAPE_DESIGN",
  "PROJECT_MANAGEMENT", "OTHER",
];

export interface ProjectFormInitial {
  id: string;
  featured: boolean;
  published: boolean;
  categoryId: string;
  services: ServiceType[];
  locationId: string;
  yearStart: number;
  yearEnd: number | null;
  client: string | null;
  siteArea: number | null;
  buildingArea: number | null;
  status: ProjectStatus;
  architect: string;
  generalContractor: string | null;
  translations: {
    locale: string;
    name: string;
    slug: string;
    description: string | null;
    philosophy: string | null;
  }[];
  images: {
    url: string;
    alt: string | null;
    type: string;
    order: number;
  }[];
}

function toDrafts(
  images: ProjectFormInitial["images"],
  type: "HERO" | "GALLERY",
): DraftImage[] {
  return images
    .filter((img) => img.type === type)
    .sort((a, b) => a.order - b.order)
    .map((img, i) => ({
      kind: "existing" as const,
      url: img.url,
      alt: img.alt,
      type,
      order: i,
    }));
}

export default function ProjectForm({
  initial,
  categories: initialCategories,
  locations: initialLocations,
}: {
  initial?: ProjectFormInitial;
  categories: LookupItem[];
  locations: LookupItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [locations, setLocations] = useState(initialLocations);
  const router = useRouter();
  const isEdit = Boolean(initial);

  const en = initial?.translations.find((t) => t.locale === "EN");
  const id = initial?.translations.find((t) => t.locale === "ID");

  const [hero, setHero] = useState<DraftImage[]>(
    initial ? toDrafts(initial.images, "HERO") : [],
  );
  const [gallery, setGallery] = useState<DraftImage[]>(
    initial ? toDrafts(initial.images, "GALLERY") : [],
  );
  const [imageError, setImageError] = useState<string | null>(null);

  // Slug mirrors the name until the admin edits it by hand. An existing slug
  // (edit mode) counts as hand-set, so renaming never silently changes a live
  // URL. Clearing the field re-enables the mirror.
  const [enSlugLocked, setEnSlugLocked] = useState(Boolean(en?.slug));
  const [idSlugLocked, setIdSlugLocked] = useState(Boolean(id?.slug));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      featured: initial?.featured ?? false,
      published: initial?.published ?? false,
      categoryId: initial?.categoryId ?? "",
      services: initial?.services ?? ["ARCHITECTURE_DESIGN"],
      locationId: initial?.locationId ?? "",
      yearStart: initial?.yearStart ?? new Date().getFullYear(),
      yearEnd: initial?.yearEnd ?? undefined,
      client: initial?.client ?? "",
      siteArea: initial?.siteArea ?? undefined,
      buildingArea: initial?.buildingArea ?? undefined,
      status: initial?.status ?? "COMPLETED",
      architect: initial?.architect ?? "ORI Studio",
      generalContractor: initial?.generalContractor ?? "",
      en: {
        name: en?.name ?? "",
        slug: en?.slug ?? "",
        description: en?.description ?? "",
        philosophy: en?.philosophy ?? "",
      },
      id: {
        name: id?.name ?? "",
        slug: id?.slug ?? "",
        description: id?.description ?? "",
        philosophy: id?.philosophy ?? "",
      },
    },
  });

  // LookupSelect is a controlled widget, so the ids are read back rather than
  // registered — `setValue` on change keeps RHF as the source of truth.
  const categoryId = useWatch({ control, name: "categoryId" }) ?? "";
  const locationId = useWatch({ control, name: "locationId" }) ?? "";

  function addFiles(
    fileList: FileList | null,
    current: DraftImage[],
    setter: (next: DraftImage[]) => void,
    max: number,
    type: "HERO" | "GALLERY",
  ) {
    if (!fileList) return;
    setImageError(null);
    const next = [...current];

    for (const file of Array.from(fileList)) {
      if (next.length >= max) {
        setImageError(`At most ${max} ${type.toLowerCase()} images.`);
        break;
      }
      const problem = validateImageFile(file);
      if (problem) {
        setImageError(problem);
        continue;
      }
      next.push({
        kind: "new",
        file,
        previewUrl: makePreview(file),
        alt: null,
        type,
        order: next.length,
      });
    }
    setter(next);
  }

  function removeAt(
    index: number,
    current: DraftImage[],
    setter: (next: DraftImage[]) => void,
  ) {
    const item = current[index];
    if (item.kind === "new") revokePreview(item.previewUrl); // free the blob
    setter(current.filter((_, i) => i !== index));
  }

  function setAlt(
    index: number,
    alt: string,
    current: DraftImage[],
    setter: (next: DraftImage[]) => void,
  ) {
    setter(current.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  async function onSubmit(values: ProjectFormValues) {
    try {
      // Nothing was uploaded while editing — files go to storage only now.
      const images = await resolveDraftImages(
        [
          ...hero.map((img, i) => ({ ...img, type: "HERO" as const, order: i })),
          ...gallery.map((img, i) => ({
            ...img,
            type: "GALLERY" as const,
            order: i,
          })),
        ],
        "projects",
      );

      const translations = [
        {
          locale: "EN" as const,
          name: values.en.name,
          slug: values.en.slug?.trim() || undefined,
          description: values.en.description?.trim() || null,
          philosophy: values.en.philosophy?.trim() || null,
        },
        // Only send ID when it has a name — EN-anchored, incremental policy.
        ...(values.id.name?.trim()
          ? [
              {
                locale: "ID" as const,
                name: values.id.name.trim(),
                slug: values.id.slug?.trim() || undefined,
                description: values.id.description?.trim() || null,
                philosophy: values.id.philosophy?.trim() || null,
              },
            ]
          : []),
      ];

      const payload = {
        featured: values.featured,
        published: values.published,
        categoryId: values.categoryId,
        services: values.services,
        locationId: values.locationId,
        yearStart: values.yearStart,
        yearEnd: values.yearEnd ?? null,
        client: values.client?.trim() || null,
        siteArea: values.siteArea ?? null,
        buildingArea: values.buildingArea ?? null,
        status: values.status,
        architect: values.architect,
        generalContractor: values.generalContractor?.trim() || null,
        translations,
        images,
      };

      if (initial) {
        await axios.patch(`/api/projects/${initial.id}`, payload);
      } else {
        await axios.post("/api/projects", payload);
      }

      toast.success(initial ? "Project updated" : "Project created");
      router.push("/dashboard/projects");
      router.refresh();
    } catch (err) {
      toastError(err, "Could not save the project");
    }
  }

  const imagePicker = (
    label: string,
    hint: string,
    images: DraftImage[],
    setter: (next: DraftImage[]) => void,
    max: number,
    type: "HERO" | "GALLERY",
  ) => (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs tracking-widest uppercase text-headline">
          {label}
        </p>
        <span className="text-xs text-body">
          {images.length}/{max}
        </span>
      </div>
      <p className="mt-1 text-xs text-body">{hint}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, index) => (
          <div key={index} className="border border-headline/10 p-2">
            <img
              src={img.kind === "new" ? img.previewUrl : img.url}
              alt=""
              className="h-28 w-full object-cover"
            />
            <input
              type="text"
              value={img.alt ?? ""}
              onChange={(e) => setAlt(index, e.target.value, images, setter)}
              placeholder="Alt text"
              aria-label={`Alt text for ${label} image ${index + 1}`}
              className="mt-2 w-full border border-eyebrow/40 bg-transparent px-2 py-1 text-xs text-headline placeholder:text-body/50 focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => removeAt(index, images, setter)}
              className="mt-2 text-[10px] tracking-widest uppercase text-red-800 hover:opacity-70 hover:cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {images.length < max && (
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-eyebrow/40 px-5 py-2 text-xs tracking-widest uppercase text-eyebrow hover:opacity-70">
          Add image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files, images, setter, max, type);
              e.target.value = ""; // allow re-picking the same file
            }}
          />
        </label>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-10">
      {/* ── Details ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <FieldSectionLabel>Details</FieldSectionLabel>

        <div className="grid gap-6 sm:grid-cols-2">
          <LookupSelect
            kind="project-categories"
            label="Category"
            required
            value={categoryId}
            onChange={(v) =>
              setValue("categoryId", v, { shouldValidate: true })
            }
            options={categories}
            onOptionsChange={setCategories}
            error={errors.categoryId?.message}
          />
          <NativeSelectField
            label="Status"
            options={STATUSES.map((s) => ({
              value: s,
              label: humanizeEnum(s),
            }))}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>

        <fieldset>
          <legend className="text-xs tracking-widest uppercase text-headline">
            Services <span className="text-eyebrow">*</span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <label
                key={service}
                className="flex cursor-pointer items-center gap-2 text-sm text-body"
              >
                <input type="checkbox" value={service} {...register("services")} />
                {humanizeEnum(service)}
              </label>
            ))}
          </div>
          {errors.services && (
            <p className="mt-1.5 text-xs text-red-700">
              {errors.services.message}
            </p>
          )}
        </fieldset>

        <LookupSelect
          kind="locations"
          label="Location"
          required
          value={locationId}
          onChange={(v) => setValue("locationId", v, { shouldValidate: true })}
          options={locations}
          onOptionsChange={setLocations}
          error={errors.locationId?.message}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Year start"
            required
            type="number"
            error={errors.yearStart?.message}
            {...register("yearStart")}
          />
          <TextField
            label="Year end"
            type="number"
            placeholder="Leave blank if single year"
            error={errors.yearEnd?.message}
            {...register("yearEnd")}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Site area (m²)"
            type="number"
            step="any"
            error={errors.siteArea?.message}
            {...register("siteArea")}
          />
          <TextField
            label="Building area (m²)"
            type="number"
            step="any"
            error={errors.buildingArea?.message}
            {...register("buildingArea")}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label="Client" {...register("client")} />
          <TextField
            label="General contractor"
            {...register("generalContractor")}
          />
        </div>

        <TextField
          label="Architect"
          required
          error={errors.architect?.message}
          {...register("architect")}
        />

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input type="checkbox" {...register("featured")} />
            Featured on the homepage
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input type="checkbox" {...register("published")} />
            Published (visible on the public site)
          </label>
        </div>
      </section>

      {/* ── English (required) ──────────────────────────────── */}
      <section className="space-y-6">
        <FieldSectionLabel>Content — English</FieldSectionLabel>
        <TextField
          label="Name"
          required
          error={errors.en?.name?.message}
          {...register("en.name", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (!enSlugLocked) setValue("en.slug", toSlug(e.target.value));
            },
          })}
        />
        <div>
          <TextField
            label="Slug"
            error={errors.en?.slug?.message}
            {...register("en.slug", {
              // Typing here takes over; clearing it hands control back.
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setEnSlugLocked(e.target.value.trim() !== ""),
            })}
          />
          <p className="mt-1.5 text-xs text-body">
            {enSlugLocked
              ? "Set manually. Clear the field to follow the name again."
              : "Generated from the name as you type — edit to override."}
          </p>
        </div>
        <TextAreaField label="Description" {...register("en.description")} />
        <TextAreaField
          label="Philosophy"
          hint="Shown under the Philosophy heading on the project detail page."
          {...register("en.philosophy")}
        />
      </section>

      {/* ── Indonesian (optional) ───────────────────────────── */}
      <section className="space-y-6">
        <FieldSectionLabel>Content — Indonesian (optional)</FieldSectionLabel>
        <p className="text-xs text-body">
          Leave the name blank to skip Indonesian for now — you can add it later
          without touching the English version.
        </p>
        <TextField
          label="Nama"
          {...register("id.name", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (!idSlugLocked) setValue("id.slug", toSlug(e.target.value));
            },
          })}
        />
        <div>
          <TextField
            label="Slug"
            {...register("id.slug", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setIdSlugLocked(e.target.value.trim() !== ""),
            })}
          />
          <p className="mt-1.5 text-xs text-body">
            {idSlugLocked
              ? "Set manually. Clear the field to follow the name again."
              : "Generated from the name as you type — edit to override."}
          </p>
        </div>
        <TextAreaField label="Deskripsi" {...register("id.description")} />
        <TextAreaField label="Filosofi" {...register("id.philosophy")} />
      </section>

      {/* ── Images ──────────────────────────────────────────── */}
      <section className="space-y-8">
        <FieldSectionLabel>Images</FieldSectionLabel>
        {imageError && <p className="text-xs text-red-700">{imageError}</p>}
        {imagePicker(
          "Hero images",
          `Up to ${MAX_HERO_IMAGES}, shown as the split/slider header. JPEG, PNG, WebP or AVIF, max 3MB each.`,
          hero,
          setHero,
          MAX_HERO_IMAGES,
          "HERO",
        )}
        {imagePicker(
          "Gallery",
          `Up to ${MAX_GALLERY_IMAGES}, in the order shown.`,
          gallery,
          setGallery,
          MAX_GALLERY_IMAGES,
          "GALLERY",
        )}
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/projects")}
          className="text-xs tracking-widest uppercase text-body hover:opacity-70 hover:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
