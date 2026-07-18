// Data dummy — nanti diganti query Prisma (model OpenPosition).

export interface OpenPosition {
  id: string;
  title: string;
  type: string; // e.g. "Full-time", "Part-time / Freelance"
  level: string; // e.g. "Mid–Senior", "All levels"
  desc: string;
  is_active: boolean;
}

export const OPEN_POSITIONS: OpenPosition[] = [
  {
    id: "interior-designer",
    title: "Interior Designer",
    type: "Full-time",
    level: "Mid–Senior",
    desc: "We're looking for an Interior Designer who can translate architectural intent into warm, livable interiors. You'll work closely with our architecture team from concept through material selection and FF&E, taking ownership of interior detailing across residential and hospitality projects.",
    is_active: true,
  },
  {
    id: "junior-architect",
    title: "Junior Architect",
    type: "Full-time",
    level: "Entry–Mid",
    desc: "Join our design team to support schematic design, technical drawings, and 3D modeling across a range of residential and hospitality projects. Great opportunity to grow under senior architects in a hands-on, collaborative studio.",
    is_active: true,
  },
  {
    id: "landscape-designer",
    title: "Landscape Designer",
    type: "Full-time",
    level: "Mid–Senior",
    desc: "We're seeking a Landscape Designer who understands tropical planting, site grading, and how landscape can extend architecture rather than decorate it. You'll lead planting plans and hardscape detailing for our Bali-based projects.",
    is_active: true,
  },
  {
    id: "project-manager",
    title: "Project Manager",
    type: "Full-time",
    level: "Senior",
    desc: "Oversee project delivery from design development through construction administration, coordinating contractors, consultants, and clients to keep projects on schedule and true to design intent.",
    is_active: true,
  },
  {
    id: "architecture-intern",
    title: "Architecture Intern",
    type: "Part-time / Freelance",
    level: "All levels",
    desc: "A hands-on internship for architecture students or recent graduates, assisting with drawings, models, and site documentation while learning our end-to-end studio process.",
    is_active: true,
  },
];

export function getActiveOpenPositions(): OpenPosition[] {
  return OPEN_POSITIONS.filter((position) => position.is_active);
}

export function getOpenPositionById(id: string): OpenPosition | null {
  return OPEN_POSITIONS.find((position) => position.id === id) ?? null;
}
