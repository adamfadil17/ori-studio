/**
 * Anchor slugs for the studio Services accordion, in the SAME order as
 * dict.studio.services.items / dict.home.services.items
 * (Architecture Design, Interior Design, Landscape Design, Project Management).
 *
 * Shared so the home page's "Learn More" links and the accordion's own element
 * ids stay in sync — e.g. `/studio#interior-design` opens & scrolls to that item
 * (the accordion reads the hash on mount). The footer's Services links use the
 * same slugs (hardcoded there).
 */
export const SERVICE_SLUGS: readonly string[] = [
  "architecture-design",
  "interior-design",
  "landscape-design",
  "project-management",
  "consultation",
];