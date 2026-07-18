-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'ID');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('RESIDENTIAL', 'HOSPITALITY', 'COMMERCIAL', 'LANDSCAPE', 'INTERIOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'PLANNED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ARCHITECTURE_DESIGN', 'INTERIOR_DESIGN', 'LANDSCAPE_DESIGN', 'PROJECT_MANAGEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectTypeInquiry" AS ENUM ('RESIDENTIAL', 'HOSPITALITY', 'COMMERCIAL', 'LANDSCAPE', 'INTERIOR', 'OTHER');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UNDER_50K', 'RANGE_50K_150K', 'ABOVE_150K', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'REVIEWED', 'QUOTED', 'BOOKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('DEVELOPER_COLLABORATION', 'VENDOR_SUPPLIER', 'MEDIA_PRESS', 'CO_DESIGN_PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceRange" AS ENUM ('YEARS_0_2', 'YEARS_3_5', 'YEARS_6_10', 'ABOVE_10_YEARS');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME_FREELANCE', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "PositionLevel" AS ENUM ('ENTRY', 'MID_SENIOR', 'SENIOR', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ProjectImageType" AS ENUM ('HERO', 'GALLERY');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "category" "ProjectCategory" NOT NULL,
    "services" "ServiceType"[],
    "location" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "client" TEXT,
    "siteArea" DOUBLE PRECISION,
    "buildingArea" DOUBLE PRECISION,
    "status" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED',
    "architect" TEXT NOT NULL DEFAULT 'ORI Studio',
    "generalContractor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_translations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "type" "ProjectImageType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_inquiries" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "serviceType" "ServiceType" NOT NULL,
    "serviceTypeOther" TEXT,
    "projectType" "ProjectTypeInquiry" NOT NULL,
    "projectTypeOther" TEXT,
    "estimatedLocation" TEXT,
    "estimatedBudget" "BudgetRange" NOT NULL,
    "vision" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_partnerships" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "partnershipType" "PartnershipType" NOT NULL,
    "partnershipOther" TEXT,
    "vision" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_careers" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "openPositionId" TEXT,
    "positionOfInterest" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "yearsOfExperience" "ExperienceRange" NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_positions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EmploymentType" NOT NULL,
    "level" "PositionLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_translations_slug_idx" ON "project_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_projectId_locale_key" ON "project_translations"("projectId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_slug_locale_key" ON "project_translations"("slug", "locale");

-- CreateIndex
CREATE INDEX "article_translations_slug_idx" ON "article_translations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_articleId_locale_key" ON "article_translations"("articleId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_slug_locale_key" ON "article_translations"("slug", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_careers" ADD CONSTRAINT "contact_careers_openPositionId_fkey" FOREIGN KEY ("openPositionId") REFERENCES "open_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
