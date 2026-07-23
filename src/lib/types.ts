export type Locale = "EN" | "ID";

export const LOCALES: Locale[] = ["EN", "ID"];
export const DEFAULT_LOCALE: Locale = "EN";

// ------------------------------------------------------------
// ENUMS (mirror Prisma enums)
// ------------------------------------------------------------

/**
 * Studio-managed lookups. These used to be a `ProjectCategory` enum and plain
 * strings; they are database rows now so the dashboard can add, rename and
 * remove them without a deploy.
 */
export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Location {
  id: string;
  city: string;
  province: string;
  country: string;
  slug: string;
}

/** "Canggu, Bali, Indonesia" — the single-line form used across the UI. */
export function formatLocation(location: {
  city: string;
  province: string;
  country: string;
}): string {
  return [location.city, location.province, location.country]
    .filter(Boolean)
    .join(", ");
}

export type ProjectStatus = "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "PLANNED";

export type ServiceType =
  | "ARCHITECTURE_DESIGN"
  | "INTERIOR_DESIGN"
  | "LANDSCAPE_DESIGN"
  | "PROJECT_MANAGEMENT"
  | "OTHER";

export type ProjectTypeInquiry =
  | "RESIDENTIAL"
  | "HOSPITALITY"
  | "COMMERCIAL"
  | "LANDSCAPE"
  | "INTERIOR"
  | "OTHER";

export type BudgetRange =
  | "UNDER_50K"
  | "RANGE_50K_150K"
  | "ABOVE_150K"
  | "PREFER_NOT_TO_SAY";

/** Shared triage status for every contact submission (mirrors Prisma `SubmissionStatus`). */
export type SubmissionStatus =
  | "NEW"
  | "REVIEWED"
  | "QUOTED"
  | "BOOKED"
  | "ARCHIVED";

/**
 * Discriminator for the three contact channels. Not a Prisma enum — each form
 * has its own table, so the type is implied by the table. It exists here to
 * unify the three submissions in the admin inbox (list, filter, badge counts).
 */
export type SubmissionType = "PROJECT_INQUIRY" | "PARTNERSHIP" | "CAREER";

export type PartnershipType =
  | "DEVELOPER_COLLABORATION"
  | "VENDOR_SUPPLIER"
  | "MEDIA_PRESS"
  | "CO_DESIGN_PROJECT"
  | "OTHER";

export type ExperienceRange =
  | "YEARS_0_2"
  | "YEARS_3_5"
  | "YEARS_6_10"
  | "ABOVE_10_YEARS";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME_FREELANCE"
  | "CONTRACT"
  | "INTERNSHIP";

export type PositionLevel = "ENTRY" | "MID_SENIOR" | "SENIOR" | "ALL_LEVELS";

export type ProjectImageType = "HERO" | "GALLERY";

// ------------------------------------------------------------
// PROJECT
// ------------------------------------------------------------

export interface ProjectImage {
  id: string;
  url: string;
  alt?: string | null;
  type: ProjectImageType;
  order: number;
}

export interface ProjectTranslation {
  locale: Locale;
  name: string;
  slug: string;
  description?: string | null;
  philosophy?: string | null;
}

export interface Project {
  id: string;
  featured: boolean;
  categoryId: string;
  category: ProjectCategory;
  services: ServiceType[];
  locationId: string;
  location: Location;
  yearStart: number;
  yearEnd?: number | null;
  client?: string | null;
  siteArea?: number | null;
  buildingArea?: number | null;
  status: ProjectStatus;
  architect: string;
  generalContractor?: string | null;
  translations: ProjectTranslation[];
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

/** Flattened shape used on the frontend after resolving current locale */
export interface ProjectView {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  featured: boolean;
  category: ProjectCategory;
  services: ServiceType[];
  location: Location;
  /** "Canggu, Bali, Indonesia" — precomputed so cards don't re-join it. */
  locationLabel: string;
  yearLabel: string; // e.g. "2023-2025"
  client?: string | null;
  siteArea?: number | null;
  buildingArea?: number | null;
  status: ProjectStatus;
  architect: string;
  generalContractor?: string | null;
  heroImages: ProjectImage[]; // exactly 2
  galleryImages: ProjectImage[]; // exactly 5
}

// ------------------------------------------------------------
// ARTICLE (JOURNAL)
// ------------------------------------------------------------

export interface ArticleTranslation {
  locale: Locale;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: TiptapJSON;
}

export interface Article {
  id: string;
  featured: boolean;
  publishedAt?: string | null;
  categoryId: string;
  category: ArticleCategory;
  image: string;
  imageAlt?: string | null;
  translations: ArticleTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleView {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: TiptapJSON;
  featured: boolean;
  publishedAt?: string | null;
  category: ArticleCategory;
  image: string;
  imageAlt?: string | null;
}

/** Minimal Tiptap JSON document type */
export interface TiptapJSON {
  type: "doc";
  content?: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

// ------------------------------------------------------------
// CONTACT — INQUIRY
// ------------------------------------------------------------

export interface ContactInquiryInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  serviceType: ServiceType;
  serviceTypeOther?: string;
  projectType: ProjectTypeInquiry;
  projectTypeOther?: string;
  estimatedLocation?: string;
  estimatedBudget: BudgetRange;
  vision: string;
}

export interface ContactInquiry extends ContactInquiryInput {
  id: string;
  type: "PROJECT_INQUIRY";
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// CONTACT — PARTNERSHIP
// ------------------------------------------------------------

export interface ContactPartnershipInput {
  companyName: string;
  role?: string;
  email: string;
  phoneNumber?: string;
  partnershipType: PartnershipType;
  partnershipOther?: string;
  vision: string;
}

export interface ContactPartnership extends ContactPartnershipInput {
  id: string;
  type: "PARTNERSHIP";
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// CONTACT — CAREER
// ------------------------------------------------------------

export interface ContactCareerInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  openPositionId?: string;
  positionOfInterest: string;
  portfolioUrl: string; // required — the form marks it mandatory
  linkedinUrl?: string;
  yearsOfExperience: ExperienceRange;
  cvFile: File; // client-side, validated: application/pdf, max 5MB → uploaded to cvUrl
}

export interface ContactCareer {
  id: string;
  type: "CAREER";
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  openPositionId?: string | null;
  positionOfInterest: string;
  portfolioUrl: string;
  linkedinUrl?: string | null;
  yearsOfExperience: ExperienceRange;
  cvUrl: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// SUBMISSIONS (unified view over the three contact channels)
// ------------------------------------------------------------
// The three contact forms stay in their own tables for data integrity.
// These types unify them for the admin "Submissions" inbox: one list to
// browse/filter/paginate, discriminated union for full detail, and counts
// for dashboard badges. The API route stamps `type` when reading each table.

/**
 * Full detail of a single submission. Discriminated on `type` — narrow it and
 * TypeScript exposes exactly the fields that channel has:
 *
 *   if (s.type === "CAREER") s.cvUrl // ✅  s.vision // ✗ compile error
 */
export type Submission =
  | ContactInquiry
  | ContactPartnership
  | ContactCareer;

/**
 * Normalized row for the inbox list view. Every channel is projected onto the
 * same shape so one table can render all three. `subject` is a short,
 * human-readable summary of what the submission is about:
 *   - inquiry     → service type (e.g. "Architecture Design")
 *   - partnership → partnership type (e.g. "Developer Collaboration")
 *   - career      → position of interest (e.g. "Junior Architect")
 */
export interface SubmissionListItem {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  name: string; // fullName (inquiry/career) or companyName (partnership)
  email: string;
  phoneNumber?: string | null;
  subject: string;
  createdAt: string;
}

/** Aggregate counts for the admin dashboard badges/filters. */
export interface SubmissionCounts {
  total: number;
  byType: Record<SubmissionType, number>;
  byStatus: Record<SubmissionStatus, number>;
}

/** Query params accepted by the unified submissions list endpoint. */
export interface SubmissionListQuery {
  type?: SubmissionType;
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ------------------------------------------------------------
// OPEN POSITIONS
// ------------------------------------------------------------

export interface OpenPosition {
  id: string;
  title: string;
  type: EmploymentType;
  level: PositionLevel;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// USER (Auth)
// ------------------------------------------------------------
// Catatan: PaginationMeta, ApiResponse tinggal di lib/api-response.ts,
// dan JwtPayload tinggal di lib/auth.ts — tidak didefinisikan ulang di
// sini supaya tidak ada dua sumber kebenaran untuk tipe yang sama.

export type Role = "admin" | "editor" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
}

/** Shape User yang aman dikirim ke client (password sudah tidak ada dari awal di User). */
export type PublicUser = Omit<User, never>;

/**
 * Body returned by login/register. The JWT is deliberately NOT here — it is
 * delivered only as an httpOnly cookie, so client JS can never read it.
 */
export interface AuthResponse {
  user: PublicUser;
  expiresIn: string;
}
