// Data dummy — nanti diganti query Prisma (Article + ArticleTranslation) sesuai locale aktif.
// Dipakai bersama oleh homepage, About page, Journal listing, dan Journal detail page.

// NOTE: sesuaikan path import ini dengan lokasi types.ts di project kamu
// (mis. "@/types" atau "@/lib/types").
import type { TiptapJSON, TiptapNode } from "@/lib/types";

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

// ------------------------------------------------------------
// ARTICLE DETAIL (dipakai di journal/[slug])
// ------------------------------------------------------------

export interface ArticleDetail {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedLabel: string;
  content: TiptapJSON;
}

function paragraph(text: string): TiptapNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(text: string, level = 2): TiptapNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

/** Artikel contoh lengkap yang isinya mengikuti struktur di screenshot. */
const TROPICAL_LIVING_CONTENT: TiptapJSON = {
  type: "doc",
  content: [
    heading("Living with the Climate, Not Against It"),
    paragraph(
      "Tropical architecture is often associated with open layouts, expansive glazing, and lush landscapes. While these elements are important, truly successful tropical design begins with a deeper understanding of the environment. Rather than resisting the climate, architecture should embrace it—responding thoughtfully to sunlight, rainfall, humidity, prevailing winds, and the rhythms of everyday life.",
    ),
    paragraph(
      "At ORI Studio, we believe that tropical living is about creating spaces that feel naturally comfortable, enduring, and deeply connected to their surroundings.",
    ),
    heading("Designing for Natural Comfort"),
    paragraph(
      "Comfort isn't achieved through technology alone. It begins with passive design strategies that allow a building to work in harmony with nature.",
    ),
    paragraph(
      "By carefully considering building orientation, cross ventilation, roof overhangs, and shaded outdoor areas, a home can remain cool throughout the day while reducing reliance on mechanical cooling.",
    ),
    paragraph(
      "Large openings become more effective when paired with proper shading, allowing natural light to enter without introducing excessive heat.",
    ),
    paragraph(
      "Good tropical architecture doesn't simply let nature in—it carefully filters and frames it.",
    ),
    heading("The Role of Light and Shadow"),
    paragraph("Light is one of the most powerful materials in architecture."),
    paragraph(
      "Throughout the day, sunlight changes in intensity, direction, and color, constantly transforming the atmosphere of a space. Designing with this movement in mind creates interiors that feel calm, dynamic, and connected to the passage of time.",
    ),
    paragraph("Equally important is shadow."),
    paragraph(
      "Deep roof overhangs, pergolas, recessed openings, and layered façades help soften direct sunlight while adding depth and character to the architecture.",
    ),
    paragraph(
      "Instead of eliminating sunlight, thoughtful design balances light and shade to create comfortable, livable spaces.",
    ),
    heading("Honest Materials That Age Beautifully"),
    paragraph("Materials play an essential role in tropical architecture."),
    paragraph(
      "Natural stone, timber, textured plaster, clay, and exposed concrete develop character over time, allowing buildings to age gracefully while reflecting the identity of their surroundings.",
    ),
    paragraph(
      "Rather than hiding the natural qualities of these materials, we celebrate their texture, warmth, and imperfections.",
    ),
    paragraph(
      "As seasons change, these materials continue to tell the story of the place they inhabit.",
    ),
    heading("Blurring the Boundary Between Inside and Outside"),
    paragraph(
      "One of the defining qualities of tropical living is the seamless relationship between architecture and landscape.",
    ),
    paragraph(
      "Courtyards, terraces, gardens, and shaded verandas become extensions of everyday living, creating spaces where nature is experienced as part of daily life rather than viewed from a distance.",
    ),
    paragraph(
      "Thoughtful transitions between interior and exterior encourage movement, improve ventilation, and strengthen the connection between people and their environment.",
    ),
    heading("A Home That Responds to Everyday Life"),
    paragraph("Great homes are not defined solely by aesthetics."),
    paragraph(
      "They are shaped by the routines, relationships, and lifestyles of the people who inhabit them.",
    ),
    paragraph(
      "A well-designed tropical home provides spaces that adapt naturally—from quiet mornings filled with soft daylight to evenings spent gathering with family in open-air living areas.",
    ),
    paragraph(
      "Architecture should support these moments with simplicity, flexibility, and lasting comfort.",
    ),
    heading("Designing for Timeless Living"),
    paragraph("Timeless architecture isn't about following trends."),
    paragraph(
      "It is about creating spaces that remain relevant because they respond honestly to climate, context, and the people who use them.",
    ),
    paragraph(
      "By combining passive environmental strategies, natural materials, thoughtful proportions, and meaningful connections to the landscape, tropical homes become places that feel comfortable today and continue to enrich daily life for years to come.",
    ),
  ],
};

/** Generator konten placeholder ringkas untuk artikel yang belum punya konten penuh. */
function placeholderContent(title: string): TiptapJSON {
  return {
    type: "doc",
    content: [
      heading("Overview"),
      paragraph(
        `Lorem Ipsum is simply dummy text of the printing and typesetting industry, used here as placeholder body copy for "${title}". Lorem Ipsum has been the industry's standard dummy text ever since 1966.`,
      ),
      paragraph(
        "It was popularised thanks to these sheets and more recently with desktop publishing software including versions of Lorem Ipsum.",
      ),
      heading("Notes"),
      paragraph(
        "This section will be replaced with real editorial content once the article is written and published through the CMS.",
      ),
    ],
  };
}

const ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  "the-art-of-tropical-living": {
    slug: "the-art-of-tropical-living",
    title: "The Art of Tropical Living",
    category: "Guides",
    excerpt:
      "Designing for tropical climates goes beyond large openings and natural ventilation. Explore how light, shade, materiality, and landscape work together to create comfortable and timeless homes.",
    publishedLabel: "February 26, 2026",
    content: TROPICAL_LIVING_CONTENT,
  },
  ...Object.fromEntries(
    JOURNAL_ARTICLES.map((article) => [
      article.slug,
      {
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt: `A closer look at ${article.title.toLowerCase()}, and how it shapes the way we design.`,
        publishedLabel: article.publishedLabel,
        content: placeholderContent(article.title),
      } satisfies ArticleDetail,
    ]),
  ),
};

export function getArticleDetail(slug: string): ArticleDetail | null {
  return ARTICLE_DETAILS[slug] ?? null;
}

export function getRelatedArticles(currentSlug: string, limit = 3) {
  return JOURNAL_ARTICLES.filter((a) => a.slug !== currentSlug).slice(0, limit);
}
