import "server-only";

// reCAPTCHA v2 ("I'm not a robot" checkbox) verification for the contact forms.
//
// Disabled-by-default: when RECAPTCHA_SECRET_KEY is unset, verification is
// SKIPPED and every token passes — so local dev works without keys and
// production enforces the check only once configured (mirrors how the mailer
// no-ops without SMTP creds). Configure both keys to turn it on; see
// docs/recaptcha.md.

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Verify a reCAPTCHA v2 token with Google. Returns true when the token is valid.
 * Fails CLOSED — a missing token or a verification error returns false — but only
 * when the check is enabled (a secret key is set).
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // check disabled (dev / not configured)
  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = (await res.json()) as { success?: boolean };
    // v2 has no score — a successful challenge is the whole check.
    return data.success === true;
  } catch {
    return false;
  }
}
