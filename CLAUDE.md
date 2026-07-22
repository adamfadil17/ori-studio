# CLAUDE.md — ORI Studio Architect Website

This file gives Claude Code the context needed to work effectively in this repository. It's a condensed, implementation-focused version of the PRD (v1.0, Jul 16 2026).

## Project Summary

Full-stack, bilingual (EN/ID) website for **ORI Studio Architect**, an architecture studio in Bali, Indonesia (residential, hospitality, commercial projects). The site showcases portfolio/philosophy content and captures leads through three contact channels: **Inquiry**, **Partnership**, **Career**.

**Core content rule:** only content that needs repeated CRUD goes into the database. Narrative content that rarely changes is hardcoded via i18n dictionaries. Keep the Prisma schema lean — don't add tables for content that's effectively static copy.

| Content type | Storage |
|---|---|
| Home, About, Studio, Philosophy (narrative copy) | `locales/en.json`, `locales/id.json` |
| Projects, Journal articles | PostgreSQL via Prisma |
| Contact submissions (Inquiry/Partnership/Career) | PostgreSQL via Prisma |
| Open Positions | PostgreSQL via Prisma |

## Tech Stack

- **Framework:** Next.js (App Router), hybrid SSR/SSG, dynamic slug routing
- **Language:** TypeScript everywhere (frontend, API, Prisma)
- **Styling:** Tailwind CSS with custom design tokens
- **ORM/DB:** Prisma + PostgreSQL (Supabase / Neon / Railway)
- **Validation:** Zod, shared between client (`@hookform/resolvers`) and server
- **Forms:** React Hook Form
- **Animation:** Framer Motion
- **Auth:** `jose` (JWT — works in both Edge middleware and Node routes) + `bcryptjs`. The session is an **httpOnly cookie** (`token`), never localStorage. Single 7-day token; no refresh token yet.
- **Email:** Nodemailer, notifies internal studio inbox on new submissions
- **HTTP client:** Axios
- **Rich text:** Tiptap, stored as JSON (not HTML strings)
- **File storage:** S3-compatible (Cloudflare R2 / Supabase Storage) for hero images, galleries, CV uploads (PDF, 5MB max)

## Design Tokens (Tailwind theme)

Define these in `tailwind.config.ts` — do not hardcode hex values in components.

| Token | Hex | Usage |
|---|---|---|
| `background-main` | `#F8F6F2` | Main section background |
| `background-alt` | `#F1ECE4` | Alternating section background |
| `label-eyebrow` | `#B89F82` | Small label above headlines (e.g. "PROJECTS", "JOURNAL") |
| `text-headline` | `#33271F` | Headings |
| `text-subheadline` | `#695544` | Sub-headings |
| `text-body` | `#695544` | Body copy |
| `button-text` | `#33271F` | Outline/ghost button text |
| `button-bg` | `#33271F` | Filled button background |
| `button-text-on-bg` | `#F8F6F2` | Text on dark button background |
| `button-icon-on-bg` | `#F8F6F2` | Icon on dark button background |

⚠️ `label-eyebrow` (#B89F82) on light backgrounds needs a WCAG AA contrast check — flag if used for anything beyond small uppercase labels.

**Fonts:** serif headline (candidates: Fraunces, Canela, Editorial New), sans-serif body (Inter or Neue Montreal), self-hosted via `next/font/local` to avoid FOUC. Confirm licensing before finalizing.

## Pages

1. `/` — Home: hero, featured projects, studio intro, philosophy preview, journal preview, contact CTA
2. `/about` — Static story, milestones, team, value proposition
3. `/projects`, `/projects/[slug]` — Listing (filters: category/location/year, paginated) + detail
4. `/studio` — Process, services, design approach, awards/certifications
5. `/philosophy` — Static storytelling narrative
6. `/journal`, `/journal/[slug]` — Listing (filtered, paginated) + detail with Tiptap-rendered content
7. `/contact` — Tabbed: Inquiry / Partnership / Career forms

## Routing & i18n

- Locale-prefixed routing: `/en/...`, `/id/...` (EN default, possibly unprefixed depending on middleware/`next-intl` config)
- Static content (Home/About/Studio/Philosophy): key-value dictionaries per locale
- Dynamic content (Project, Article): separate translation tables — `ProjectTranslation`, `ArticleTranslation`
  - Translated fields: name, description, excerpt, Tiptap JSON content, **slug**
  - Not duplicated: year, building area, category/enum, images — these live on the parent entity, linked via `projectId`/`articleId`
- Each `Project`/`Article` has a unique, editable `slug` (auto-generated from title via `slug.ts`, admin can override for SEO, e.g. `villa-modern-tropical-canggu`). Slugs: lowercase, kebab-case, no special characters, unique per locale.

## SEO

- `generateMetadata()` per dynamic page for title/description/og:image (first hero image for Project, image for Article)
- `sitemap.xml` / `robots.txt` via Next.js Metadata API — published/non-draft slugs only
- JSON-LD structured data: `Organization` + `Article`/`CreativeWork`
- All images via `next/image`, `alt` text is a required field on the image model
- `hreflang="en"` / `hreflang="id"` canonical URLs to avoid duplicate content

## Core Utility Modules

Build these first — most features depend on them.

| File | Responsibility |
|---|---|
| `lib/types.ts` | Global TS types/interfaces (DTOs, API responses, Prisma-derived enums) |
| `lib/validators.ts` | Zod schemas for all forms (Inquiry, Partnership, Career, Admin CRUD), shared client + server |
| `lib/slug.ts` | `generateSlug(text: string): string`, `ensureUniqueSlug()` — validates uniqueness against DB before create/update |
| `lib/auth.ts` | `signToken`, `verifyToken`, `getAuthPayload`, `requireAuth`, `requireRole`, `setSessionCookie`/`clearSessionCookie` — all via `jose`. Reads the JWT from the `Authorization: Bearer` header **or** the `token` cookie, verifying each in turn |
| `lib/session.ts` | `getSession()`, `isStaffSession()` — reads the session cookie in Server Components (`server-only`) |
| `lib/password.ts` | `hashPassword`, `comparePassword` via `bcryptjs` |
| `lib/pagination.ts` | Generic `paginate<T>(query, page, limit)` → `{ data, meta: { page, limit, total, totalPages } }` |
| `lib/mailer.ts` | Nodemailer transporter + notification templates (new Inquiry/Partnership/Career) |
| `lib/prisma.ts` | Singleton Prisma Client (avoid multiple connections on dev hot-reload) |

## Page Feature Notes

**Projects**
- Listing: grid cards (first hero image, name, location, category, year), filters + pagination
- Detail: 2 hero images (split/slider layout), metadata (location, year, category, services, client, site area, building area, status, architect, general contractor), 5-image gallery with lightbox, related projects

**Journal**
- Listing: grid/list cards (image, category eyebrow, title, excerpt, date), filter by category, pagination
- Detail: render Tiptap JSON via `@tiptap/react` or custom renderer, reading time estimate, share button, related articles

**Contact** (tabbed: Inquiry / Partnership / Career)
- *Inquiry:* Full Name, Email, Phone, Service Type (select + "Other"), Project Type (select + "Other"), Estimated Location, Estimated Budget (select), Vision (textarea). On submit: `status: NEW`, internal notification email + optional auto-reply.
- *Partnership:* Company Name, Your Role, Email, Phone, Partnership Type (select + "Other"), Vision (textarea).
- *Career:* Shows active Open Positions (`isActive: true`). Full Name, Email, Phone, Position of Interest (from active Open Positions), Portfolio URL, LinkedIn URL, Years of Experience (select), CV upload (PDF, 5MB max — validate client + server via Zod).

All submissions: validated via shared Zod schema (`lib/validators.ts`), saved to DB, trigger email via `lib/mailer.ts`.

## Data Models (see `schema.prisma` and `types.ts` for full detail)

- `Project` + `ProjectTranslation` + `ProjectImage`
- `Article` (Journal) + `ArticleTranslation`
- `ContactInquiry`, `ContactPartnership`, `ContactCareer`
- `OpenPosition`
- `AdminUser` (admin panel auth)
- Enums: `ProjectCategory`, `ProjectStatus`, `ServiceType`, `ProjectType`, `BudgetRange`, `InquiryStatus`, `PartnershipType`, `ExperienceRange`, `EmploymentType`, `PositionLevel`, `Locale`

Category/service/client are enums/strings for now, not relational tables (per the "only CRUD-needed data goes in DB" rule). A `Category`/`Service` table is a v1.1 candidate if the studio wants to manage these from the admin panel later.

## Non-Functional Requirements

- **Performance:** Lighthouse ≥ 90 (Performance, SEO, Accessibility) on public pages
- **Images:** `next/image`, AVIF/WebP
- **Responsive:** mobile-first, standard Tailwind breakpoints (sm/md/lg/xl)
- **Accessibility:** WCAG AA contrast (double-check `label-eyebrow` #B89F82)
- **Security:** rate limit contact form endpoints, sanitize input, JWT + middleware on all `/dashboard/*` routes (admin panel lives at `/dashboard`, outside `[locale]`)
- **Email:** SPF/DKIM configured for the sending domain
- **File upload:** validate type + size client and server side (CV PDF, 5MB max)

## Roadmap

- **v1.0 (MVP):** 7 public pages, 3 contact forms, dynamic Prisma schema, EN/ID i18n, baseline SEO
- **v1.1:** Admin panel (CRUD for Project/Article/Open Position, inquiry management dashboard)
- **v1.2:** Dynamic Category/Service management, analytics dashboard, richer auto-reply templating

## Working Conventions for Claude Code

- Don't add new Prisma models for content that could be a static i18n entry — check §"Core content rule" above first.
- Any new form must have a Zod schema in `lib/validators.ts` reused on both client and server — don't duplicate validation logic.
- Any new dynamic page needs `generateMetadata()` and should respect the draft/published filter for sitemap inclusion.
- New translatable fields on `Project`/`Article` go on the `*Translation` model, not the parent entity; technical/structural fields stay on the parent.
- Reference `lib/prisma.ts` singleton — never instantiate `PrismaClient` directly elsewhere.