export type Locale = "EN" | "ID";

export const LOCALES: Locale[] = ["EN", "ID"];
export const DEFAULT_LOCALE: Locale = "EN";

// ------------------------------------------------------------
// ENUMS (mirror Prisma enums)
// ------------------------------------------------------------

export type ProjectCategory =
  | "RESIDENTIAL"
  | "HOSPITALITY"
  | "COMMERCIAL"
  | "LANDSCAPE"
  | "INTERIOR"
  | "OTHER";

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

export type InquiryStatus =
  | "NEW"
  | "REVIEWED"
  | "QUOTED"
  | "BOOKED"
  | "ARCHIVED";

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

export type AdminRole = "SUPER_ADMIN" | "EDITOR";

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
}

export interface Project {
  id: string;
  featured: boolean;
  category: ProjectCategory;
  services: ServiceType[];
  location: string;
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
  location: string;
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
  category: string;
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
  category: string;
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
  phoneNumber: string;
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
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// CONTACT — PARTNERSHIP
// ------------------------------------------------------------

export interface ContactPartnershipInput {
  companyName: string;
  role: string;
  email: string;
  phoneNumber: string;
  partnershipType: PartnershipType;
  partnershipOther?: string;
  vision: string;
}

export interface ContactPartnership extends ContactPartnershipInput {
  id: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// CONTACT — CAREER
// ------------------------------------------------------------

export interface ContactCareerInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  openPositionId?: string;
  positionOfInterest: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  yearsOfExperience: ExperienceRange;
  cvFile: File; // client-side, validated: application/pdf, max 5MB
}

export interface ContactCareer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  openPositionId?: string | null;
  positionOfInterest: string;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  yearsOfExperience: ExperienceRange;
  cvUrl: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// OPEN POSITIONS
// ------------------------------------------------------------

export interface OpenPosition {
  id: string;
  title: string;
  type: EmploymentType;
  level: PositionLevel;
  desc: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}
