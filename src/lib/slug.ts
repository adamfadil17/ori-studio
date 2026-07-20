export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
  maxAttempts = 20,
): Promise<string> {
  let candidate = base;
  let attempt = 1;

  while (await isTaken(candidate)) {
    if (attempt > maxAttempts) {
      throw new Error(
        `Could not generate unique slug for "${base}" after ${maxAttempts} attempts`,
      );
    }
    candidate = `${base}-${attempt}`;
    attempt++;
  }

  return candidate;
}
