/*
  Warnings:

  - The `status` column on the `contact_careers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `contact_inquiries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `contact_partnerships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `portfolioUrl` on table `contact_careers` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'REVIEWED', 'QUOTED', 'BOOKED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "contact_careers" ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "portfolioUrl" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "contact_inquiries" ALTER COLUMN "phoneNumber" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "contact_partnerships" ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW';

-- DropEnum
DROP TYPE "InquiryStatus";
