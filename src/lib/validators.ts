import { z } from "zod";

import type { TiptapJSON, TiptapNode } from "./types";

const uuidSchema = z.string().uuid();

const slugSchema = z
  .string()
  .min(2)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-kebab-case");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function parsePagination(
  searchParams: URLSearchParams,
): PaginationQuery {
  return paginationSchema.parse({
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 10,
    search: searchParams.get("search") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? "desc",
  });
}

/**
 * Location of an asset WE store (CV, project image, article cover).
 *
 * Deliberately NOT `z.string().url()`: that demands a protocol, but the local
 * storage driver returns root-relative paths like `/uploads/images/…`, and
 * relative paths are the better default anyway — they survive a domain change
 * and `next/image` serves them without `remotePatterns` config. Absolute URLs
 * (R2/S3) are accepted too, so swapping the driver needs no schema change.
 *
 * Use `z.string().url()` for URLs the USER types (portfolio, LinkedIn) — those
 * really must be absolute.
 */
const assetUrl = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), message);

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export const userRoleSchema = z.enum(["admin", "editor", "user"]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  role: userRoleSchema.default("user"),
});

/**
 * Every field is optional — an absent key means "leave unchanged".
 *
 * `role` is re-declared without the `.default("user")` it carries on create:
 * inheriting that default would silently demote an admin on any PATCH that
 * didn't happen to include a role.
 *
 * `password` stays accepted (unlike the previous version, which omitted it) so
 * an admin can reset a forgotten one. There is no self-service password reset,
 * so without this an editor who forgets their password is locked out for good.
 */
export const updateUserSchema = createUserSchema.partial().extend({
  role: userRoleSchema.optional(),
  password: passwordSchema.optional(),
});

/**
 * Public self-registration. `role` is deliberately NOT accepted from the client
 * — the route always forces "user". Elevated accounts (admin / editor) are
 * created only by an admin through POST /api/users.
 */
export const registerSchema = createUserSchema.omit({ role: true });

/**
 * Self-service password change, for any signed-in staff member.
 *
 * The current password is required even though the session already proves
 * identity: it stops someone who finds an unattended logged-in browser from
 * locking the real owner out of their own account.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Repeat the new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "The two passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "The new password must be different from the current one",
    path: ["newPassword"],
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Admin "create user" form — same rules as the API. */
export const createUserFormSchema = createUserSchema;

/**
 * Admin "edit user" form. A blank password means "keep the current one"; the
 * form strips it from the payload rather than sending an empty string.
 * Validated through `passwordSchema` only when something was typed, so the
 * per-rule messages are preserved instead of collapsing into one.
 */
export const editUserFormSchema = createUserSchema.extend({
  password: z.string().superRefine((value, ctx) => {
    if (value === "") return;
    const result = passwordSchema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message });
      }
    }
  }),
});

export type UserFormInput = z.input<typeof createUserFormSchema>;
export type UserFormValues = z.output<typeof createUserFormSchema>;

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

// ------------------------------------------------------------
// PROJECT INQUIRY
// ------------------------------------------------------------

export const projectInquirySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
  serviceType: z.enum([
    "ARCHITECTURE_DESIGN",
    "INTERIOR_DESIGN",
    "LANDSCAPE_DESIGN",
    "PROJECT_MANAGEMENT",
    "OTHER",
  ]),
  serviceTypeOther: z.string().optional(),
  projectType: z.enum([
    "RESIDENTIAL",
    "HOSPITALITY",
    "COMMERCIAL",
    "LANDSCAPE",
    "INTERIOR",
    "OTHER",
  ]),
  projectTypeOther: z.string().optional(),
  estimatedLocation: z.string().optional(),
  estimatedBudget: z.enum([
    "UNDER_50K",
    "RANGE_50K_150K",
    "ABOVE_150K",
    "PREFER_NOT_TO_SAY",
  ]),
  vision: z.string().min(1, "Please tell us about your vision"),
})
  // When "Other" is picked, the free-text field becomes required so the studio
  // knows exactly what the client is asking for.
  .superRefine((data, ctx) => {
    if (data.serviceType === "OTHER" && !data.serviceTypeOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceTypeOther"],
        message: "Please specify your service type",
      });
    }
    if (data.projectType === "OTHER" && !data.projectTypeOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["projectTypeOther"],
        message: "Please specify your project type",
      });
    }
  });

export type ProjectInquiryFormValues = z.infer<typeof projectInquirySchema>;

// ------------------------------------------------------------
// PARTNERSHIP
// ------------------------------------------------------------

export const partnershipSchema = z.object({
  companyName: z.string().min(1, "Company/organization name is required"),
  role: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
  partnershipType: z.enum([
    "DEVELOPER_COLLABORATION",
    "VENDOR_SUPPLIER",
    "MEDIA_PRESS",
    "CO_DESIGN_PROJECT",
    "OTHER",
  ]),
  partnershipOther: z.string().optional(),
  vision: z.string().min(1, "Please tell us about your vision"),
})
  .superRefine((data, ctx) => {
    if (data.partnershipType === "OTHER" && !data.partnershipOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["partnershipOther"],
        message: "Please specify the partnership type",
      });
    }
  });

export type PartnershipFormValues = z.infer<typeof partnershipSchema>;

// ------------------------------------------------------------
// CAREER
// ------------------------------------------------------------

// CV upload constraints — shared client + server (PRD: PDF, 5MB max).
export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_CV_MIME_TYPES = ["application/pdf"] as const;

/**
 * Validates the uploaded CV File. Usable on the client (file input) and on the
 * server (multipart/form-data), since `File` is a global in both the browser
 * and the Node runtime backing the API routes.
 */
export const cvFileSchema = z
  .instanceof(File, { message: "CV is required" })
  .refine((file) => file.size > 0, "CV is required")
  .refine((file) => file.size <= MAX_CV_SIZE_BYTES, "CV must be 5MB or smaller")
  .refine(
    (file) => (ACCEPTED_CV_MIME_TYPES as readonly string[]).includes(file.type),
    "CV must be a PDF file",
  );

/**
 * Location of the CV after upload (server-derived). Accepts an absolute URL
 * (e.g. an R2/S3 public URL) or a root-relative path (e.g. the local-disk
 * driver's `/uploads/cv/…`), since the value is trusted and generated server-side.
 */
export const cvUrlSchema = assetUrl(
  "CV URL must be an uploaded path or an absolute URL",
);

/** Text fields shared by the client form and the server create DTO. */
export const careerFieldsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
  // Chosen from a controlled list of active positions; existence is verified
  // server-side against the DB, so no client-side UUID format check.
  openPositionId: z.string().optional(),
  positionOfInterest: z.string().min(1, "Please select a position"),
  portfolioUrl: z
    .string()
    .min(1, "Portfolio URL is required")
    .url("Enter a valid URL"),
  linkedinUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  yearsOfExperience: z.enum([
    "YEARS_0_2",
    "YEARS_3_5",
    "YEARS_6_10",
    "ABOVE_10_YEARS",
  ]),
});

/** Client form values (React Hook Form): text fields + the raw CV File,
 *  validated by `cvFileSchema`. The file is uploaded to storage before the
 *  record is created; the server then persists the resulting URL (see
 *  `careerSubmissionSchema`). */
export const careerSchema = careerFieldsSchema.extend({
  cvFile: cvFileSchema,
});
export type CareerFormValues = z.infer<typeof careerSchema>;

/** Server create DTO — CV already uploaded to storage, referenced by URL. */
export const careerSubmissionSchema = careerFieldsSchema.extend({
  cvUrl: cvUrlSchema,
});
export type CareerSubmissionDto = z.infer<typeof careerSubmissionSchema>;

// ------------------------------------------------------------
// IMAGE UPLOADS (admin — project hero/gallery, article covers)
// ------------------------------------------------------------

export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Validates an uploaded image File (client + server). */
export const imageFileSchema = z
  .instanceof(File, { message: "Image file is required" })
  .refine((file) => file.size > 0, "Image file is required")
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE_BYTES,
    "Image must be 3MB or smaller",
  )
  .refine(
    (file) =>
      (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type),
    "Image must be JPEG, PNG, WebP, or AVIF",
  );

/** Allowed upload folders — restricts the storage subpath (no traversal). */
export const uploadFolderSchema = z
  .enum(["projects", "articles", "general"])
  .default("general");
export type UploadFolder = z.infer<typeof uploadFolderSchema>;

// ------------------------------------------------------------
// PROJECT (admin CRUD)
// ------------------------------------------------------------

const localeEnum = z.enum(["EN", "ID"]);
// The ProjectCategory enum that used to live here is a lookup table now —
// see the project/article/location lookup schemas further down.
const projectStatusEnum = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "PLANNED",
]);
const serviceTypeEnum = z.enum([
  "ARCHITECTURE_DESIGN",
  "INTERIOR_DESIGN",
  "LANDSCAPE_DESIGN",
  "PROJECT_MANAGEMENT",
  "OTHER",
]);
const projectImageTypeEnum = z.enum(["HERO", "GALLERY"]);

const projectTranslationInput = z.object({
  locale: localeEnum,
  name: z.string().min(1, "Name is required"),
  // Optional — auto-generated from `name` when omitted. Admin may override for SEO.
  slug: z.string().optional(),
  description: z.string().nullish(),
  philosophy: z.string().nullish(),
});

const projectImageInput = z.object({
  url: assetUrl("Image URL must be an uploaded path or an absolute URL"),
  alt: z.string().nullish(),
  type: projectImageTypeEnum,
  order: z.number().int().min(0).default(0),
});

// Detail layout is a 2-up hero (split/slider) + a 5-image gallery, so cap each
// bucket. Fewer is allowed (drafts in progress); order sequences the gallery.
export const MAX_HERO_IMAGES = 2;
export const MAX_GALLERY_IMAGES = 5;

const projectImagesSchema = z
  .array(projectImageInput)
  .refine(
    (imgs) => imgs.filter((i) => i.type === "HERO").length <= MAX_HERO_IMAGES,
    `A project can have at most ${MAX_HERO_IMAGES} hero images`,
  )
  .refine(
    (imgs) =>
      imgs.filter((i) => i.type === "GALLERY").length <= MAX_GALLERY_IMAGES,
    `A project can have at most ${MAX_GALLERY_IMAGES} gallery images`,
  );

const hasUniqueLocales = (arr: { locale: string }[]) =>
  new Set(arr.map((t) => t.locale)).size === arr.length;

// Create: the full translation set is established here, so EN (the default
// locale) is mandatory. Other locales are optional and can be added later.
const projectTranslationsCreate = z
  .array(projectTranslationInput)
  .min(1, "At least one translation is required")
  .refine(hasUniqueLocales, "Duplicate locale in translations")
  .refine(
    (arr) => arr.some((t) => t.locale === "EN"),
    "An English (EN) translation is required",
  );

// Update: translations are upserted per locale, so a PATCH may carry only the
// locale being added/edited (e.g. just ID). EN stays guaranteed — it was
// required at create and the API never deletes translations.
const projectTranslationsUpdate = z
  .array(projectTranslationInput)
  .min(1, "At least one translation is required")
  .refine(hasUniqueLocales, "Duplicate locale in translations");

// ─────────────────────────────────────────────
// LOOKUPS — project category, article category, location
// ─────────────────────────────────────────────

/**
 * Slugs are derived from the name server-side rather than typed, so the same
 * label always yields the same key and an editor can't accidentally create two
 * categories that differ only by slug. Sent only when an admin overrides it.
 */
const optionalSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-kebab-case")
  .optional();

export const createProjectCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: optionalSlug,
});
export const updateProjectCategorySchema =
  createProjectCategorySchema.partial();

export const createArticleCategorySchema = createProjectCategorySchema;
export const updateArticleCategorySchema = updateProjectCategorySchema;

export const createLocationSchema = z.object({
  city: z.string().trim().min(1, "City is required").max(80),
  province: z.string().trim().min(1, "Province is required").max(80),
  country: z.string().trim().min(1, "Country is required").max(80),
  slug: optionalSlug,
});
export const updateLocationSchema = createLocationSchema.partial();

export type CreateProjectCategoryDto = z.infer<
  typeof createProjectCategorySchema
>;
export type CreateArticleCategoryDto = z.infer<
  typeof createArticleCategorySchema
>;
export type CreateLocationDto = z.infer<typeof createLocationSchema>;

export const createProjectSchema = z.object({
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  services: z.array(serviceTypeEnum).min(1, "Select at least one service"),
  locationId: z.string().min(1, "Location is required"),
  yearStart: z.number().int().min(1900).max(2100),
  yearEnd: z.number().int().min(1900).max(2100).nullish(),
  client: z.string().nullish(),
  siteArea: z.number().positive().nullish(),
  buildingArea: z.number().positive().nullish(),
  status: projectStatusEnum.default("COMPLETED"),
  architect: z.string().min(1).default("ORI Studio"),
  generalContractor: z.string().nullish(),
  translations: projectTranslationsCreate,
  images: projectImagesSchema.default([]),
});

/**
 * `.partial()` alone is NOT enough: fields carrying `.default()` still fill that
 * default when the key is absent, so a PATCH that omits `published` would set it
 * to false and unpublish the project — likewise `images: []` would wipe every
 * image. Re-declare each defaulted field as plain optional so "absent" really
 * means "leave unchanged" (the route guards on `!== undefined`).
 */
export const updateProjectSchema = createProjectSchema.partial().extend({
  translations: projectTranslationsUpdate.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  status: projectStatusEnum.optional(),
  architect: z.string().min(1).optional(),
  images: projectImagesSchema.optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

/** Empty number inputs arrive as "" — treat those as "not provided". */
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    schema.optional(),
  );

/**
 * Shape of the admin project FORM. It differs from `createProjectSchema` only
 * in how translations are laid out: the form has a fixed EN block plus an
 * optional ID block (easier to render), whereas the API takes an array. The
 * form maps to the API payload on submit — the rules themselves (enums,
 * lengths, ranges) are the same primitives, so there is one source of truth.
 *
 * Images are managed outside RHF (they hold File objects until submit).
 */
export const projectFormSchema = z.object({
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  services: z.array(serviceTypeEnum).min(1, "Select at least one service"),
  locationId: z.string().min(1, "Location is required"),
  yearStart: z.coerce.number().int().min(1900).max(2100),
  yearEnd: optionalNumber(z.number().int().min(1900).max(2100)),
  client: z.string().optional(),
  siteArea: optionalNumber(z.number().positive()),
  buildingArea: optionalNumber(z.number().positive()),
  status: projectStatusEnum.default("COMPLETED"),
  architect: z.string().min(1, "Architect is required").default("ORI Studio"),
  generalContractor: z.string().optional(),
  en: z.object({
    name: z.string().min(1, "English name is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    philosophy: z.string().optional(),
  }),
  // Optional second locale — leave the name blank to skip it entirely.
  id: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    philosophy: z.string().optional(),
  }),
});

/** Values after parsing (numbers coerced) — what `handleSubmit` receives. */
export type ProjectFormValues = z.output<typeof projectFormSchema>;
/** Raw field values as the inputs hold them (numbers still strings). */
export type ProjectFormInput = z.input<typeof projectFormSchema>;

// ------------------------------------------------------------
// ARTICLE / JOURNAL (admin CRUD)
// ------------------------------------------------------------

// Tiptap document — mirrors `TiptapJSON` / `TiptapNode` in lib/types.ts and is
// stored in the Prisma `Json` column. Nodes are validated by their known keys
// (type/attrs/content/marks/text); node-specific data lives in `attrs`, kept as
// an open record so nothing (heading level, link href, image src…) is lost.
const tiptapMarkSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

const tiptapNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    marks: z.array(tiptapMarkSchema).optional(),
    text: z.string().optional(),
  }),
);

export const tiptapJsonSchema: z.ZodType<TiptapJSON> = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema).optional(),
});

const articleTranslationInput = z.object({
  locale: localeEnum,
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().nullish(),
  content: tiptapJsonSchema,
});

// Same EN-anchored, incremental policy as projects: EN required at create;
// updates upsert per locale (may carry a single locale like ID).
const articleTranslationsCreate = z
  .array(articleTranslationInput)
  .min(1, "At least one translation is required")
  .refine(hasUniqueLocales, "Duplicate locale in translations")
  .refine(
    (arr) => arr.some((t) => t.locale === "EN"),
    "An English (EN) translation is required",
  );

const articleTranslationsUpdate = z
  .array(articleTranslationInput)
  .min(1, "At least one translation is required")
  .refine(hasUniqueLocales, "Duplicate locale in translations");

export const createArticleSchema = z.object({
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  image: assetUrl("Cover image must be an uploaded path or an absolute URL"),
  imageAlt: z.string().nullish(),
  translations: articleTranslationsCreate,
});

// Same defaults-leak-through-partial trap as updateProjectSchema: re-declare
// the defaulted fields as plain optional so omitting them leaves them unchanged.
export const updateArticleSchema = createArticleSchema.partial().extend({
  translations: articleTranslationsUpdate.optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type CreateArticleDto = z.infer<typeof createArticleSchema>;
export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;

/**
 * Shape of the admin article FORM — same idea as `projectFormSchema`: a fixed
 * EN block plus an optional ID block, mapped to the API's translations array on
 * submit. The cover image and the Tiptap bodies live outside RHF (a File and a
 * JSON document respectively), so they're validated separately.
 */
export const articleFormSchema = z.object({
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  // NOTE: `image` and `imageAlt` are NOT here — like project images, the cover
  // and its alt text are held together in component state (the file only
  // becomes a URL on submit) and validated there.
  en: z.object({
    title: z.string().min(1, "English title is required"),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
  }),
  // Leave the title blank to skip Indonesian for now.
  id: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

/** Values after parsing — what `handleSubmit` receives. */
export type ArticleFormValues = z.output<typeof articleFormSchema>;
/** Raw field values as the inputs hold them (defaults not yet applied). */
export type ArticleFormInput = z.input<typeof articleFormSchema>;

// ------------------------------------------------------------
// OPEN POSITION (admin CRUD)
// ------------------------------------------------------------

export const createOpenPositionSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  type: z.enum(["FULL_TIME", "PART_TIME_FREELANCE", "CONTRACT", "INTERNSHIP"]),
  level: z.enum(["ENTRY", "MID_SENIOR", "SENIOR", "ALL_LEVELS"]),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().default(true),
});

export const updateOpenPositionSchema = createOpenPositionSchema.partial();

export type CreateOpenPositionDto = z.infer<typeof createOpenPositionSchema>;
export type UpdateOpenPositionDto = z.infer<typeof updateOpenPositionSchema>;

// The admin form maps 1:1 onto the API schema (no translations or images to
// reshape), so it reuses `createOpenPositionSchema` directly. Only the RHF
// input/output split is needed, because `isActive` has a default.
export type OpenPositionFormValues = z.output<typeof createOpenPositionSchema>;
export type OpenPositionFormInput = z.input<typeof createOpenPositionSchema>;

// ------------------------------------------------------------
// SUBMISSIONS (admin management)
// ------------------------------------------------------------

export const submissionStatusSchema = z.enum([
  "NEW",
  "REVIEWED",
  "QUOTED",
  "BOOKED",
  "ARCHIVED",
]);

/** URL slug → discriminator mapping for the submissions routes. */
export const submissionKindSchema = z.enum([
  "inquiry",
  "partnership",
  "career",
]);
export type SubmissionKind = z.infer<typeof submissionKindSchema>;

export const updateSubmissionStatusSchema = z.object({
  status: submissionStatusSchema,
});
export type UpdateSubmissionStatusDto = z.infer<
  typeof updateSubmissionStatusSchema
>;
