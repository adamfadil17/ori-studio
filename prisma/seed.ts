import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/lib/password";

/**
 * Bootstrap the first admin account.
 *
 * Public registration always creates a plain "user" (see registerSchema), and
 * POST /api/users requires an existing admin — so the very first admin has to
 * come from here.
 *
 * Run with:  npm run db:seed
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in .env.
 *
 * Idempotent: re-running promotes an existing account to admin if needed but
 * never overwrites an existing password — unless passed --force-password,
 * which is the recovery route for an admin who can no longer sign in.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✖ DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Mirrors createUserSchema so seeded credentials can actually log in. */
function validatePassword(password: string): string | null {
  if (password.length < 8) return "must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "must contain a number";
  return null;
}

/**
 * The sectors that used to be the `ProjectCategory` enum. They are rows now, so
 * a fresh database would otherwise start with an empty dropdown and no way to
 * create a project until someone invented a category first.
 *
 * Only project categories are seeded: article categories and locations were
 * free text before, with no canonical list worth inventing here.
 */
const DEFAULT_PROJECT_CATEGORIES = [
  "Residential",
  "Hospitality",
  "Commercial",
  "Landscape",
  "Interior",
];

async function seedProjectCategories() {
  let created = 0;
  for (const name of DEFAULT_PROJECT_CATEGORIES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    // Skips anything already present, so a rename made in the dashboard is
    // never undone by a re-run.
    const existing = await prisma.projectCategory.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) continue;
    await prisma.projectCategory.create({ data: { name, slug } });
    created += 1;
  }
  console.log(
    created > 0
      ? `✓ Added ${created} project ${created === 1 ? "category" : "categories"}`
      : "✓ Project categories already present",
  );
}

async function main() {
  await seedProjectCategories();

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "ORI Studio Admin";

  if (!email || !password) {
    console.error(
      [
        "✖ Missing admin credentials.",
        "",
        "  Add these to .env, then re-run `npm run db:seed`:",
        "",
        '    ADMIN_EMAIL="you@oristudio.co"',
        '    ADMIN_PASSWORD="a-strong-password"',
        '    ADMIN_NAME="Your Name"        # optional',
      ].join("\n"),
    );
    process.exit(1);
  }

  const weak = validatePassword(password);
  if (weak) {
    console.error(`✖ ADMIN_PASSWORD ${weak}.`);
    process.exit(1);
  }

  // The one recovery path for a locked-out admin: they cannot sign in, so they
  // cannot reach /dashboard/account, and no one else can reset an admin who is
  // the only admin. Opt-in because a plain re-run must never silently replace
  // a working password.
  const force = process.argv.includes("--force-password");

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (force) {
      await prisma.user.update({
        where: { email },
        data: {
          password: await hashPassword(password),
          // Ends every session the account still had open — the point of a
          // recovery reset is that the old credentials stop working.
          passwordChangedAt: new Date(Math.floor(Date.now() / 1000) * 1000),
          role: "admin",
        },
      });
      console.log(`✓ Password reset for admin: ${email}`);
      console.log("  All existing sessions for this account are now signed out.");
      return;
    }

    if (existing.role === "admin") {
      console.log(`✓ Admin already exists: ${email} (password unchanged)`);
      console.log(
        "  Locked out? Re-run with --force-password to reset it:",
      );
      console.log("    npx tsx prisma/seed.ts --force-password");
      return;
    }
    await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`✓ Promoted existing user to admin: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "admin",
    },
  });

  console.log(`✓ Created admin: ${email}`);
  console.log("  Sign in at /login");
}

main()
  .catch((error) => {
    console.error("✖ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });