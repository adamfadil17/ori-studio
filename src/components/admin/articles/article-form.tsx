"use client";

/* eslint-disable @next/next/no-img-element -- the preview is a blob: URL, which next/image can't optimise */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  useLeaveGuard,
  useUnsavedChanges,
} from "@/components/admin/ui/unsaved-changes";
import { toast, toastError } from "@/lib/toast";

import LookupSelect from "@/components/admin/ui/lookup-select";
import type { LookupItem } from "@/lib/lookups";
import TiptapEditor, {
  EMPTY_DOC,
  isEmptyDoc,
} from "@/components/admin/articles/tiptap-editor";
import {
  FieldSectionLabel,
  TextAreaField,
  TextField,
} from "@/components/ui/form-fields";
import { toSlug } from "@/lib/slug";
import {
  articleFormSchema,
  type ArticleFormInput,
  type ArticleFormValues,
} from "@/lib/validators";
import {
  makePreview,
  resolveCoverImage,
  revokePreview,
  validateImageFile,
} from "@/lib/upload-client";
import type { TiptapJSON } from "@/lib/types";

// Alt travels WITH the image (same as DraftImage in the project form), so the
// two forms behave identically: describing an image is part of adding it.
type Cover = { alt: string } & (
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; previewUrl: string }
);

export interface ArticleFormInitial {
  id: string;
  featured: boolean;
  published: boolean;
  categoryId: string;
  image: string;
  imageAlt: string | null;
  translations: {
    locale: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: TiptapJSON;
  }[];
}

export default function ArticleForm({
  initial,
  categories: initialCategories,
}: {
  initial?: ArticleFormInitial;
  categories: LookupItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const router = useRouter();
  const isEdit = Boolean(initial);

  const en = initial?.translations.find((t) => t.locale === "EN");
  const id = initial?.translations.find((t) => t.locale === "ID");

  const [cover, setCover] = useState<Cover | null>(
    initial
      ? { kind: "existing", url: initial.image, alt: initial.imageAlt ?? "" }
      : null,
  );
  const [enContent, setEnContent] = useState<TiptapJSON>(
    en?.content ?? EMPTY_DOC,
  );
  const [idContent, setIdContent] = useState<TiptapJSON>(
    id?.content ?? EMPTY_DOC,
  );

  // Slug mirrors the title until edited by hand; an existing slug counts as
  // hand-set so renaming never silently changes a live URL.
  const [enSlugLocked, setEnSlugLocked] = useState(Boolean(en?.slug));
  const [idSlugLocked, setIdSlugLocked] = useState(Boolean(id?.slug));

  const [coverError, setCoverError] = useState<string | null>(null);
  // Flipped by the explicit cover actions below (RHF cannot see them).
  const [coverDirty, setCoverDirty] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ArticleFormInput, unknown, ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      featured: initial?.featured ?? false,
      published: initial?.published ?? false,
      categoryId: initial?.categoryId ?? "",
      en: {
        title: en?.title ?? "",
        slug: en?.slug ?? "",
        excerpt: en?.excerpt ?? "",
      },
      id: {
        title: id?.title ?? "",
        slug: id?.slug ?? "",
        excerpt: id?.excerpt ?? "",
      },
    },
  });

  // Controlled widget: RHF stays the source of truth via setValue on change.
  const categoryId = useWatch({ control, name: "categoryId" }) ?? "";

  // Cover and Tiptap bodies live outside RHF. Content is compared against its
  // initial value rather than flagged on change, because the editor can emit an
  // onChange while mounting — that would mark a pristine form dirty.
  const contentDirty =
    JSON.stringify(enContent) !== JSON.stringify(en?.content ?? EMPTY_DOC) ||
    JSON.stringify(idContent) !== JSON.stringify(id?.content ?? EMPTY_DOC);
  useUnsavedChanges(isDirty || coverDirty || contentDirty);
  const confirmLeave = useLeaveGuard();

  function pickCover(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      setCoverError(problem);
      return;
    }

    setCoverError(null);
    if (cover?.kind === "new") revokePreview(cover.previewUrl);
    // Replacing the image keeps any alt already written for it.
    setCover({
      kind: "new",
      file,
      previewUrl: makePreview(file),
      alt: cover?.alt ?? "",
    });
    setCoverDirty(true);
  }

  function clearCover() {
    if (cover?.kind === "new") revokePreview(cover.previewUrl);
    // Alt is part of the cover, so removing the image removes its description
    // too — no stale value can linger.
    setCover(null);
    setCoverDirty(true);
  }

  async function onSubmit(values: ArticleFormValues) {
    setCoverError(null);
    setContentError(null);

    // The API requires a cover and a body per translation — check here so the
    // admin gets the message next to the field rather than a raw 422.
    if (!cover) {
      setCoverError("A cover image is required.");
      return;
    }
    if (isEmptyDoc(enContent)) {
      setContentError("The English article body cannot be empty.");
      return;
    }
    const wantsId = Boolean(values.id.title?.trim());
    if (wantsId && isEmptyDoc(idContent)) {
      setContentError(
        "The Indonesian body cannot be empty — either write it or clear the Indonesian title.",
      );
      return;
    }

    try {
      // Nothing uploaded until now: cancelling the form leaves no orphan files.
      const image = await resolveCoverImage(
        cover.kind === "new"
          ? { kind: "new", file: cover.file }
          : { kind: "existing", url: cover.url },
        "articles",
      );

      const translations = [
        {
          locale: "EN" as const,
          title: values.en.title,
          slug: values.en.slug?.trim() || undefined,
          excerpt: values.en.excerpt?.trim() || null,
          content: enContent,
        },
        ...(wantsId
          ? [
              {
                locale: "ID" as const,
                title: values.id.title!.trim(),
                slug: values.id.slug?.trim() || undefined,
                excerpt: values.id.excerpt?.trim() || null,
                content: idContent,
              },
            ]
          : []),
      ];

      const payload = {
        featured: values.featured,
        published: values.published,
        categoryId: values.categoryId,
        image,
        imageAlt: cover.alt.trim() || null,
        translations,
      };

      if (initial) {
        await axios.patch(`/api/articles/${initial.id}`, payload);
      } else {
        await axios.post("/api/articles", payload);
      }

      toast.success(initial ? "Article updated" : "Article created");
      router.push("/dashboard/journal");
      router.refresh();
    } catch (err) {
      toastError(err, "Could not save the article");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-10">
      {/* ── Details ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <FieldSectionLabel>Details</FieldSectionLabel>

        <LookupSelect
          kind="article-categories"
          label="Category"
          required
          value={categoryId}
          onChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
          options={categories}
          onOptionsChange={setCategories}
          error={errors.categoryId?.message}
        />

        <div>
          <p className="text-xs tracking-widest uppercase text-headline">
            Cover image <span className="text-eyebrow">*</span>
          </p>
          <p className="mt-1 text-xs text-body">
            JPEG, PNG, WebP or AVIF, max 3MB.
          </p>

          {/* Alt text lives on the image card — same pattern as project images,
              so it only exists while there IS an image to describe. */}
          {cover && (
            <div className="mt-3 max-w-sm border border-headline/10 p-2">
              <img
                src={cover.kind === "new" ? cover.previewUrl : cover.url}
                alt=""
                className="h-40 w-full object-cover"
              />
              <input
                type="text"
                value={cover.alt}
                onChange={(e) => {
                  setCover({ ...cover, alt: e.target.value });
                  setCoverDirty(true);
                }}
                placeholder="Alt text"
                aria-label="Alt text for the cover image"
                className="mt-2 w-full border border-eyebrow/40 bg-transparent px-2 py-1 text-xs text-headline placeholder:text-body/50 focus-visible:outline-none"
              />
              <button
                type="button"
                onClick={clearCover}
                className="mt-2 text-[10px] tracking-widest uppercase text-red-800 hover:opacity-70 hover:cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-eyebrow/40 px-5 py-2 text-xs tracking-widest uppercase text-eyebrow hover:opacity-70">
            {cover ? "Replace image" : "Add image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                pickCover(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {coverError && (
            <p className="mt-1.5 text-xs text-red-700">{coverError}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input type="checkbox" {...register("featured")} />
            Featured
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
          label="Title"
          required
          error={errors.en?.title?.message}
          {...register("en.title", {
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
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setEnSlugLocked(e.target.value.trim() !== ""),
            })}
          />
          <p className="mt-1.5 text-xs text-body">
            {enSlugLocked
              ? "Set manually. Clear the field to follow the title again."
              : "Generated from the title as you type — edit to override."}
          </p>
        </div>
        <TextAreaField label="Excerpt" {...register("en.excerpt")} />
        <TiptapEditor
          label="Body"
          value={enContent}
          onChange={setEnContent}
          error={contentError ?? undefined}
        />
      </section>

      {/* ── Indonesian (optional) ───────────────────────────── */}
      <section className="space-y-6">
        <FieldSectionLabel>Content — Indonesian (optional)</FieldSectionLabel>
        <p className="text-xs text-body">
          Leave the title blank to skip Indonesian for now — you can add it later
          without touching the English version.
        </p>
        <TextField
          label="Judul"
          {...register("id.title", {
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
              ? "Set manually. Clear the field to follow the title again."
              : "Generated from the title as you type — edit to override."}
          </p>
        </div>
        <TextAreaField label="Ringkasan" {...register("id.excerpt")} />
        <TiptapEditor label="Isi" value={idContent} onChange={setIdContent} />
      </section>


      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-eyebrow px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create article"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (await confirmLeave()) router.push("/dashboard/journal");
          }}
          className="text-xs tracking-widest uppercase text-body hover:opacity-70 hover:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
