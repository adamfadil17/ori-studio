// Data dummy — nanti diganti query Prisma (Article + ArticleTranslation) sesuai locale aktif.
// Dipakai bersama oleh homepage, About page, Journal listing, dan Journal detail page.

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
  {
    slug: "the-quiet-power-of-natural-light",
    title: "The Quiet Power of Natural Light",
    category: "Inspiration",
    publishedLabel: "Jun 3, 2024",
  },
  {
    slug: "notes-on-courtyard-living",
    title: "Notes on Courtyard Living",
    category: "Journal",
    publishedLabel: "Jun 18, 2024",
  },
  {
    slug: "working-with-reclaimed-teak",
    title: "Working with Reclaimed Teak",
    category: "Material",
    publishedLabel: "Jul 2, 2024",
  },
  {
    slug: "designing-for-slow-mornings",
    title: "Designing for Slow Mornings",
    category: "Philosophy",
    publishedLabel: "Jul 15, 2024",
  },
  {
    slug: "the-craft-behind-every-detail",
    title: "The Craft Behind Every Detail",
    category: "Inspiration",
    publishedLabel: "Jul 29, 2024",
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

// ------------------------------------------------------------
// Helper builder — memastikan setiap node yang dibuat persis
// mengikuti bentuk TiptapNode di lib/types.ts.
// ------------------------------------------------------------

function paragraph(text: string): TiptapNode {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(text: string, level: 1 | 2 | 3 | 4 = 2): TiptapNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function blockquote(text: string): TiptapNode {
  return {
    type: "blockquote",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function bulletList(items: string[]): TiptapNode {
  return {
    type: "bulletList",
    content: items.map((text) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    })),
  };
}

function doc(...nodes: TiptapNode[]): TiptapJSON {
  return { type: "doc", content: nodes };
}

// ------------------------------------------------------------
// KONTEN ARTIKEL
// ------------------------------------------------------------

const CONTENT: Record<string, TiptapJSON> = {
  "the-beauty-of-shadow": doc(
    heading("Shadow as a Design Material"),
    paragraph(
      "It is tempting to think of good architecture purely in terms of light — bright interiors, generous glazing, spaces that feel open and airy. But shadow deserves equal attention. In tropical climates especially, the way a building casts and holds shadow shapes both comfort and character just as much as the light it lets in.",
    ),
    paragraph(
      "At ORI Studio, we treat shadow as a material in its own right — something to be drawn, layered, and composed, not simply the absence of light.",
    ),
    heading("Depth Through Contrast"),
    paragraph(
      "A deep roof overhang doesn't just block sun; it carves a band of cool shade along a façade that shifts and moves throughout the day. A pergola doesn't just filter light; it prints a changing pattern across a floor, marking the hours the way a sundial does.",
    ),
    paragraph(
      "These moments of contrast — bright courtyard against shaded walkway, dappled light against solid wall — give a building rhythm. Without shadow, even the most generous daylight can feel flat.",
    ),
    blockquote(
      "Shadow is not the enemy of light. It is what gives light its shape.",
    ),
    heading("Living With Shadow"),
    paragraph(
      "Beyond aesthetics, shadow is practical. A well-shaded veranda extends the hours a space is usable in a hot climate. A shaded threshold slows you down, inviting a pause before you step from outside into in. Designing with shadow in mind means designing for how a home is actually lived in, hour by hour.",
    ),
  ),

  "tropical-modernism-in-bali": doc(
    heading("Two Traditions, One Language"),
    paragraph(
      "Modernism, at its core, was never about a fixed aesthetic — it was about honesty: honest structure, honest materials, and buildings shaped by their function and context. That same spirit runs through traditional Balinese architecture, which has spent centuries responding to climate, ritual, and community with remarkable clarity.",
    ),
    paragraph(
      "Tropical modernism in Bali sits at the meeting point of these two traditions — borrowing the discipline and restraint of modernist form, and the climatic intelligence of vernacular building.",
    ),
    heading("What We Keep, What We Reinterpret"),
    bulletList([
      "Deep overhangs and layered roofs, reinterpreted with cleaner lines and fewer ornamental details",
      "Open pavilions (bale) reimagined as flexible living and gathering spaces",
      "Natural cross-ventilation prioritized over full air conditioning wherever possible",
      "Local materials — volcanic stone, teak, bamboo — paired with restrained modern detailing",
    ]),
    paragraph(
      "The result isn't nostalgia, and it isn't a rejection of tradition either. It's an attempt to let both traditions sharpen each other.",
    ),
    heading("Why This Matters Now"),
    paragraph(
      "As Bali continues to grow, there's real pressure toward imported, climate-agnostic architecture — glass boxes that ignore the sun, dense forms that fight the humidity instead of working with it. Tropical modernism offers a third path: architecture that looks forward without losing its sense of place.",
    ),
  ),

  "material-notes-limestone-wood": doc(
    heading("A Pairing Built on Contrast"),
    paragraph(
      "Limestone and wood rarely compete for attention — that's precisely why we return to this pairing so often. Limestone brings coolness, permanence, and a quiet, mineral texture. Wood brings warmth, grain, and a sense of time passing. Together, they balance a space the way stone floors and timber ceilings have balanced homes for centuries.",
    ),
    heading("Working With Limestone"),
    paragraph(
      "Local limestone, honed rather than polished, is one of our preferred flooring and cladding materials. Its matte, slightly porous surface keeps interiors cool underfoot even in peak heat, and it develops a soft patina over years of use rather than showing wear as damage.",
    ),
    paragraph(
      "We favor larger format cuts with minimal grout lines, letting the stone's natural variation — subtle veining, tonal shifts from slab to slab — read as texture rather than pattern.",
    ),
    heading("Working With Wood"),
    paragraph(
      "For structural and visible timber elements, we lean toward species that age gracefully in humid climates: teak, merbau, and reclaimed ironwood among them. Left with an oil finish rather than heavy lacquer, these woods darken and deepen in color over time instead of yellowing or dulling.",
    ),
    blockquote(
      "The goal isn't to make materials look new forever. It's to choose materials that look better as they age.",
    ),
    heading("Where the Two Meet"),
    paragraph(
      "The most successful moments in our projects are often the junctions — a limestone plinth meeting a timber column, a stone bench built into a wood-clad wall. These transitions, handled with care, are where a building's material honesty really shows.",
    ),
  ),

  "designing-for-meaningful-living": doc(
    heading("Beyond Square Footage"),
    paragraph(
      "It's easy to measure a home by its numbers — square meters, room counts, ceiling heights. But the homes that feel truly successful are rarely the ones that simply check every box. They're the ones that quietly support the specific, sometimes unglamorous rhythms of daily life.",
    ),
    paragraph(
      "Designing for meaningful living means starting not with a floor plan, but with a set of questions: Where does this family gather at the end of the day? Which room gets used every single morning? What does this client actually want to feel when they walk in the door?",
    ),
    heading("Small Moments, Long Memory"),
    paragraph(
      "A window seat positioned to catch afternoon light. A kitchen island sized for two people cooking side by side. A threshold wide enough to pause and take off your shoes without feeling rushed. None of these show up dramatically in a rendering, but they're often what a client remembers years later.",
    ),
    heading("Designing for Change"),
    paragraph(
      "Meaningful living also means designing for a life that will change. Families grow, routines shift, needs evolve. Where possible, we build in flexibility — a study that can become a nursery, an outdoor room that can be enclosed later, structural grids that don't lock a home into a single use forever.",
    ),
    paragraph(
      "Ultimately, a meaningful home isn't one frozen in a single perfect photograph. It's one built to keep making sense, season after season, as the people inside it keep living.",
    ),
  ),

  "the-quiet-power-of-natural-light": doc(
    heading("Light as a Daily Companion"),
    paragraph(
      "Artificial lighting can be controlled, dimmed, and scheduled — but it can never replicate the subtle, constant change of natural light throughout a day. Morning light is cool and low; midday light is direct and strong; evening light is warm and long. A home designed around these shifts feels alive in a way no fixed lighting scheme can match.",
    ),
    heading("Orientation First"),
    paragraph(
      "Before we think about window sizes or glazing types, we think about orientation — which rooms should catch the gentle east-facing morning light, and which need protection from harsh western sun in the late afternoon. Getting this right does more for a home's comfort than almost any other single decision.",
    ),
    heading("Filtered, Not Flooded"),
    paragraph(
      "More glass isn't always better. Unfiltered light can overheat a room and wash out its materials. We prefer light that arrives filtered — through a timber screen, a deep eave, a planted trellis — softened into something you feel rather than something you squint against.",
    ),
    blockquote("Good daylighting is felt more than it is seen."),
    heading("Light and Wellbeing"),
    paragraph(
      "There's a quiet, cumulative benefit to living with abundant, well-considered natural light — better sleep rhythms, a stronger sense of connection to time and season, spaces that simply feel calmer to be in. It's one of the most powerful tools available to an architect, and one of the least expensive.",
    ),
  ),

  "notes-on-courtyard-living": doc(
    heading("An Old Idea, Still Relevant"),
    paragraph(
      "Courtyards are one of architecture's oldest organizing devices — found in traditional homes across the tropics, the Mediterranean, and beyond, long before mechanical cooling existed. Long before it was a design trend, the courtyard was a survival strategy: a way to bring light, air, and green space into the center of a home without exposing every room to direct sun.",
    ),
    heading("What a Courtyard Does for a Home"),
    bulletList([
      "Creates natural cross-ventilation by drawing air through surrounding rooms",
      "Brings daylight into the deepest parts of a floor plan without harsh direct exposure",
      "Offers a private outdoor room, shielded from the street and neighboring sightlines",
      "Softens the transition between fully indoor and fully outdoor living",
    ]),
    heading("Designing Around a Void"),
    paragraph(
      "Designing a courtyard home means designing around an absence — the empty, planted center that everything else responds to. Rooms are arranged to look inward as much as outward, and circulation often wraps the courtyard rather than cutting through the middle of the home.",
    ),
    paragraph(
      "It takes discipline. A courtyard that's too small feels like an afterthought; one that's oversized can make a home feel fragmented. The best courtyards are sized precisely to the life meant to happen in them — a breakfast table, a single frangipani tree, a quiet spot to read.",
    ),
  ),

  "working-with-reclaimed-teak": doc(
    heading("A Material With a Past"),
    paragraph(
      "Reclaimed teak arrives on site already carrying decades of history — old joinery marks, nail holes, weathering from a previous life as a boat hull, a railway sleeper, or a village structure. Unlike new-cut timber, it doesn't need to be aged into character. It already has it.",
    ),
    heading("Why We Choose It"),
    paragraph(
      "Beyond its visual richness, reclaimed teak is exceptionally stable — much of its natural movement has already happened over years of prior use, which makes it more predictable to work with than freshly milled timber. It's also, in a very direct way, a more sustainable choice: no new tree felled, no plantation cycle required.",
    ),
    blockquote(
      "Every scar in reclaimed teak is a record of use. We try not to sand that history away.",
    ),
    heading("How We Use It"),
    paragraph(
      "We tend to reserve reclaimed teak for elements that will be touched and seen closely — stair treads, door frames, feature walls, furniture built into the architecture itself. In these positions, its irregularities read as craft rather than flaw.",
    ),
    paragraph(
      "Sourcing takes patience. Good reclaimed teak isn't produced on demand; it's found, salvaged, and sorted piece by piece. We work with a small number of trusted suppliers in Java and Bali who share our standards for both quality and provenance.",
    ),
  ),

  "designing-for-slow-mornings": doc(
    heading("The First Hour of the Day"),
    paragraph(
      "Of all the moments a home holds, mornings are often the most overlooked in design — yet they're some of the most consistently experienced. A well-designed morning routine, supported by the right light, the right threshold, the right small room, can set the tone for an entire day.",
    ),
    heading("What Slows a Morning Down, in a Good Way"),
    bulletList([
      "Soft, low morning light reaching a bedroom or breakfast nook without needing curtains drawn",
      "A direct, unhurried path from bed to a quiet outdoor space — a terrace, a garden edge, a covered veranda",
      "A kitchen counter oriented toward a view, not a wall",
      "Materials underfoot that feel good bare-footed first thing in the day",
    ]),
    heading("Resisting the Urge to Optimize Everything"),
    paragraph(
      "There's a natural instinct in design to make every space maximally efficient. But some of the best morning spaces we've designed are, on paper, slightly 'inefficient' — a wider-than-necessary window seat, a covered corner that serves no single defined purpose beyond being a good place to sit with coffee.",
    ),
    paragraph(
      "These aren't wasted square meters. They're where a slower pace of life actually happens.",
    ),
  ),

  "the-craft-behind-every-detail": doc(
    heading("Where Craft Actually Lives"),
    paragraph(
      "From a distance, architecture reads in broad strokes — massing, proportion, silhouette. Up close, it's a different story entirely. The experience of being inside a space is shaped by details most people never consciously notice: a handrail's exact diameter, the reveal between a door and its frame, the way a light switch sits flush against a wall.",
    ),
    heading("Detailing as a Form of Respect"),
    paragraph(
      "We think of careful detailing as a form of respect — for the people who will use the space, for the craftspeople who will build it, and for the materials themselves. A poorly resolved detail doesn't just look unfinished; it often performs worse too, letting in water, trapping dust, or wearing prematurely.",
    ),
    blockquote(
      "A building's quality isn't decided at the scale of the master plan. It's decided at the scale of the joint.",
    ),
    heading("Working Closely With Craftspeople"),
    paragraph(
      "Many of our best details didn't originate purely from the drawing board — they emerged from conversation on site with the carpenters, masons, and metalworkers who actually build our projects. Their hands-on knowledge of how materials behave often refines a detail beyond what any drawing alone could achieve.",
    ),
    paragraph(
      "This is one reason we favor long-term relationships with a smaller group of trusted contractors and craftspeople rather than constantly sourcing new teams project to project. Trust and shared standards, built over years, show up in the finished work.",
    ),
  ),

  "the-art-of-tropical-living": doc(
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
  ),
};

const EXCERPTS: Record<string, string> = {
  "the-beauty-of-shadow":
    "Shadow is as much a design material as light. Explore how ORI Studio uses shade, depth, and contrast to shape mood, comfort, and rhythm in every project.",
  "tropical-modernism-in-bali":
    "Where modernist discipline meets Balinese vernacular wisdom — how ORI Studio blends two design traditions into a language suited for how Bali actually lives today.",
  "material-notes-limestone-wood":
    "A closer look at one of our most-used material pairings — how limestone's coolness and timber's warmth balance each other, and where the two meet matters most.",
  "designing-for-meaningful-living":
    "Beyond square footage and floor plans — what it actually means to design a home around the small, specific rhythms of the people who will live in it.",
  "the-quiet-power-of-natural-light":
    "Orientation, filtering, and the daily rhythm of daylight — how thoughtful daylighting shapes comfort and wellbeing more than almost any other design decision.",
  "notes-on-courtyard-living":
    "An old idea that still solves modern problems — how courtyards bring ventilation, daylight, and privacy into the center of a home without mechanical intervention.",
  "working-with-reclaimed-teak":
    "Every scar tells a story. Notes on sourcing, working with, and detailing reclaimed teak — a material that arrives on site already carrying decades of history.",
  "designing-for-slow-mornings":
    "The first hour of the day deserves design attention too. How small architectural decisions shape the pace and quality of everyday mornings.",
  "the-craft-behind-every-detail":
    "Architecture is decided as much at the scale of the joint as the master plan. A look at how we work closely with craftspeople to get the small things right.",
  "the-art-of-tropical-living":
    "Designing for tropical climates goes beyond large openings and natural ventilation. Explore how light, shade, materiality, and landscape work together to create comfortable and timeless homes.",
};

const ARTICLE_DETAILS: Record<string, ArticleDetail> = Object.fromEntries(
  [
    ...JOURNAL_ARTICLES,
    {
      slug: "the-art-of-tropical-living",
      title: "The Art of Tropical Living",
      category: "Guides",
      publishedLabel: "February 26, 2026",
    },
  ].map((article) => [
    article.slug,
    {
      slug: article.slug,
      title: article.title,
      category: article.category,
      excerpt: EXCERPTS[article.slug],
      publishedLabel: article.publishedLabel,
      content: CONTENT[article.slug],
    } satisfies ArticleDetail,
  ]),
);

export function getArticleDetail(slug: string): ArticleDetail | null {
  return ARTICLE_DETAILS[slug] ?? null;
}

export function getRelatedArticles(currentSlug: string, limit = 3) {
  return JOURNAL_ARTICLES.filter((a) => a.slug !== currentSlug).slice(0, limit);
}
