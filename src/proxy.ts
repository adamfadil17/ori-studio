import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";
// Import from lib/auth directly — NOT the "@/lib" barrel, which pulls in
// Prisma/nodemailer/fs and cannot run on the Edge runtime. `jose` is Edge-safe.
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

const LOCALE_COOKIE = "ORI_LOCALE";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/dashboard";
/** Roles allowed into the dashboard. */
const STAFF_ROLES = ["admin", "editor"];

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (
    cookieLocale &&
    locales.includes(cookieLocale as (typeof locales)[number])
  ) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().startsWith("id")) return "id";

  return defaultLocale;
}

/** Verify the session cookie. Returns null when absent, expired, or tampered. */
async function readSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Gate the admin area. Unauthenticated visitors are sent to /login (with a
 * `next` param so they land where they intended); signed-in staff hitting
 * /login are bounced straight to the dashboard.
 */
async function guardAdminArea(
  request: NextRequest,
  { isLogin }: { isLogin: boolean },
) {
  const session = await readSession(request);
  const isStaff = session !== null && STAFF_ROLES.includes(session.role);

  if (isLogin) {
    return isStaff
      ? NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
      : NextResponse.next();
  }

  if (!isStaff) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin area: auth-gated, and never locale-prefixed ──────────────
  const isLogin = pathname === LOGIN_PATH;
  const isDashboard =
    pathname === DASHBOARD_PATH || pathname.startsWith(`${DASHBOARD_PATH}/`);

  if (isLogin || isDashboard) {
    return guardAdminArea(request, { isLogin });
  }

  // ── Public site: ensure a locale prefix ────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  // Skip semua path internal Next.js, API routes, dan file statis (punya
  // ekstensi). /dashboard dan /login sengaja TIDAK di-skip — keduanya butuh
  // pengecekan auth di atas.
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};