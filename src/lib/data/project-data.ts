// Data dummy — nanti diganti query Prisma (Project + ProjectTranslation + ProjectImage)
// sesuai locale aktif. Slug di bawah ini SENGAJA disamakan dengan ALL_PROJECTS di
// projects/page.tsx supaya link listing -> detail nyambung.

// NOTE: sesuaikan path import ini dengan lokasi types.ts di project kamu
// (mis. "@/types" atau "@/lib/types").
import type { ProjectImage, ProjectImageType } from "@/lib/types";

const PLACEHOLDER = "https://placehold.net/default.svg";

export interface ProjectSummary {
  slug: string;
  name: string;
  location: string;
  yearLabel: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  philosophyHeadline: string;
  philosophyBody: string;
  keyInfo: {
    year: string;
    sector: string;
    status: string;
    client: string;
    siteArea: string;
    architect: string;
    location: string;
    buildingArea: string;
    generalContractor: string;
  };
  /** Persis 2 gambar — [0] dipakai di Hero, [1] dipakai di section Full-Width Image */
  heroImages: ProjectImage[];
  /** Persis 5 gambar — dipakai di GalleryMosaic */
  galleryImages: ProjectImage[];
}

/** Generator dummy ProjectImage — nanti diganti data asli dari ProjectImage (Prisma). */
function buildImages(
  slug: string,
  type: ProjectImageType,
  count: number,
): ProjectImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${slug}-${type.toLowerCase()}-${index + 1}`,
    url: PLACEHOLDER,
    alt: null,
    type,
    order: index,
  }));
}

const RAW_PROJECT_DETAILS: Record<
  string,
  Omit<ProjectDetail, "heroImages" | "galleryImages">
> = {
  "tegalalang-courtyard-house": {
    slug: "tegalalang-courtyard-house",
    name: "Tegalalang Courtyard House",
    location: "Tegalalang, Bali, Indonesia",
    yearLabel: "2025",
    description:
      "A courtyard-centered residence that frames the surrounding rice terraces, using a series of open pavilions connected by shaded walkways to keep the home in constant dialogue with its landscape.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "An open, courtyard-first home that dissolves the boundary between indoor and outdoor living, letting light, air, and the surrounding terrain move freely through every room.",
    keyInfo: {
      year: "2024–2025",
      sector: "Residential",
      status: "Completed",
      client: "Private Client",
      siteArea: "980 m²",
      architect: "ORI Studio",
      location: "Tegalalang, Bali, Indonesia",
      buildingArea: "520 m²",
      generalContractor: "Dewata Build",
    },
  },
  "sanur-beach-villa": {
    slug: "sanur-beach-villa",
    name: "Sanur Beach Villa",
    location: "Sanur, Bali, Indonesia",
    yearLabel: "2024",
    description:
      "A low-slung beachfront villa designed around cross-ventilation and sea views, with a material palette chosen to weather gracefully in a coastal climate.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A quiet retreat that puts the ocean at the center of every space, using restrained materials that age honestly with salt air and sun.",
    keyInfo: {
      year: "2023–2024",
      sector: "Residential",
      status: "Completed",
      client: "Private Client",
      siteArea: "1,100 m²",
      architect: "ORI Studio",
      location: "Sanur, Bali, Indonesia",
      buildingArea: "410 m²",
      generalContractor: "Segara Construction",
    },
  },
  "ubud-wellness-retreat": {
    slug: "ubud-wellness-retreat",
    name: "Ubud Wellness Retreat",
    location: "Ubud, Bali, Indonesia",
    yearLabel: "2025",
    description:
      "A wellness retreat nestled into a forested hillside, sequencing arrival, yoga pavilions, and spa facilities along a single contemplative path.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A retreat designed as a slow procession through nature — every threshold is a small pause, every material chosen to soften the transition between built and wild.",
    keyInfo: {
      year: "2024–2025",
      sector: "Hospitality",
      status: "Completed",
      client: "Ubud Wellness Group",
      siteArea: "3,200 m²",
      architect: "ORI Studio",
      location: "Ubud, Bali, Indonesia",
      buildingArea: "1,450 m²",
      generalContractor: "Giri Artha Construction",
    },
  },
  "kintamani-hills-residence": {
    slug: "kintamani-hills-residence",
    name: "Kintamani Hills Residence",
    location: "Kintamani, Bali, Indonesia",
    yearLabel: "2023-2025",
    description:
      "A hillside home carefully positioned to capture panoramic mountain views while responding to the site's challenging topography. The design embraces the natural contours of the land, maximizing daylight, ventilation, and uninterrupted views while preserving the surrounding landscape.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "An iconic gateway to a privileged living environment, combining commercial spaces, common areas, and bright residences around lush green spaces.",
    keyInfo: {
      year: "2023–2024",
      sector: "Residential",
      status: "Completed",
      client: "OIKOS Construction",
      siteArea: "1,250 m²",
      architect: "ORI Studio",
      location: "Kintamani, Bali, Indonesia",
      buildingArea: "680 m²",
      generalContractor: "OIKOS Construction",
    },
  },
  "seminyak-artisan-cafe": {
    slug: "seminyak-artisan-cafe",
    name: "Seminyak Artisan Café",
    location: "Seminyak, Bali, Indonesia",
    yearLabel: "2024",
    description:
      "An interior fit-out for a specialty café that balances an industrial material palette with warm, tactile finishes, designed to encourage lingering.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A space built around slowness — textures and lighting chosen to invite people to stay a little longer than they planned.",
    keyInfo: {
      year: "2024",
      sector: "Commercial",
      status: "Completed",
      client: "Kopi Artisan Group",
      siteArea: "320 m²",
      architect: "ORI Studio",
      location: "Seminyak, Bali, Indonesia",
      buildingArea: "280 m²",
      generalContractor: "Nusantara Fit-Out",
    },
  },
  "canggu-creative-office": {
    slug: "canggu-creative-office",
    name: "Canggu Creative Office",
    location: "Canggu, Bali, Indonesia",
    yearLabel: "2025",
    description:
      "A co-working office designed for creative teams, organized around a central courtyard that brings daylight and greenery into every workspace.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A workplace that trades corridors for courtyards — every desk sits within reach of daylight, air, and a view of something green.",
    keyInfo: {
      year: "2024–2025",
      sector: "Commercial",
      status: "In Progress",
      client: "Canggu Creative Collective",
      siteArea: "1,800 m²",
      architect: "ORI Studio",
      location: "Canggu, Bali, Indonesia",
      buildingArea: "1,100 m²",
      generalContractor: "Bhumi Development",
    },
  },
  "jimbaran-cliff-house": {
    slug: "jimbaran-cliff-house",
    name: "Jimbaran Cliff House",
    location: "Jimbaran, Bali, Indonesia",
    yearLabel: "2026",
    description:
      "A cliffside residence cantilevered toward the ocean horizon, engineered to feel weightless above the water while remaining deeply anchored to the rock below.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A house suspended between land and sea — every room is composed around the horizon line, framing the ocean as the home's true centerpiece.",
    keyInfo: {
      year: "2025–2026",
      sector: "Residential",
      status: "Planned",
      client: "Private Client",
      siteArea: "1,600 m²",
      architect: "ORI Studio",
      location: "Jimbaran, Bali, Indonesia",
      buildingArea: "590 m²",
      generalContractor: "Segara Construction",
    },
  },
  "nusa-dua-boutique-hotel": {
    slug: "nusa-dua-boutique-hotel",
    name: "Nusa Dua Boutique Hotel",
    location: "Nusa Dua, Bali, Indonesia",
    yearLabel: "2023",
    description:
      "A boutique hotel of 24 rooms organized around a central lagoon pool, designed to feel intimate and residential despite its hospitality scale.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "Hospitality designed at a residential scale — guests move through spaces that feel more like a private home than a hotel.",
    keyInfo: {
      year: "2022–2023",
      sector: "Hospitality",
      status: "Completed",
      client: "Nusa Dua Hospitality Group",
      siteArea: "4,500 m²",
      architect: "ORI Studio",
      location: "Nusa Dua, Bali, Indonesia",
      buildingArea: "2,100 m²",
      generalContractor: "Giri Artha Construction",
    },
  },
  "lombok-coastal-pavilion": {
    slug: "lombok-coastal-pavilion",
    name: "Lombok Coastal Pavilion",
    location: "Lombok, West Nusa Tenggara, Indonesia",
    yearLabel: "2025",
    description:
      "A landscape-led beach pavilion masterplan connecting a series of open structures through native coastal planting and permeable pathways.",
    philosophyHeadline: "Philosophy",
    philosophyBody:
      "A landscape that leads the architecture — structures are placed as clearings within the planting, not the other way around.",
    keyInfo: {
      year: "2024–2025",
      sector: "Landscape",
      status: "Completed",
      client: "Lombok Coastal Development",
      siteArea: "6,200 m²",
      architect: "ORI Studio",
      location: "Lombok, West Nusa Tenggara, Indonesia",
      buildingArea: "—",
      generalContractor: "Nusantara Landscape Works",
    },
  },
};

export const PROJECT_DETAILS: Record<string, ProjectDetail> =
  Object.fromEntries(
    Object.entries(RAW_PROJECT_DETAILS).map(([slug, detail]) => [
      slug,
      {
        ...detail,
        heroImages: buildImages(slug, "HERO", 2),
        galleryImages: buildImages(slug, "GALLERY", 5),
      },
    ]),
  );

export function getProjectDetail(slug: string): ProjectDetail | null {
  return PROJECT_DETAILS[slug] ?? null;
}

export function getRelatedProjects(
  currentSlug: string,
  limit = 3,
): ProjectSummary[] {
  return Object.values(PROJECT_DETAILS)
    .filter((project) => project.slug !== currentSlug)
    .slice(0, limit);
}

export const JOURNAL_ARTICLES = [
  {
    slug: "the-beauty-of-shadow",
    title: "The Beauty of Shadow",
    category: "Inspiration",
    publishedLabel: "May 12, 2024",
  },
  {
    slug: "tropical-modernism-in-bali",
    title: "Tropical Modernism in Bali",
    category: "Journal",
    publishedLabel: "Apr 28, 2024",
  },
  {
    slug: "material-notes-limestone-wood",
    title: "Material Notes: Limestone & Wood",
    category: "Material",
    publishedLabel: "May 10, 2024",
  },
  {
    slug: "designing-for-meaningful-living",
    title: "Designing for Meaningful Living",
    category: "Philosophy",
    publishedLabel: "May 27, 2024",
  },
] as const;
