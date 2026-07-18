import { z } from "zod";

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
});

export type PartnershipFormValues = z.infer<typeof partnershipSchema>;

// ------------------------------------------------------------
// CAREER
// ------------------------------------------------------------

export const careerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
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

export type CareerFormValues = z.infer<typeof careerSchema>;
