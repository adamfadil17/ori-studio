import axios from "axios";
import { toast } from "sonner";

/**
 * Toast an error from a failed request, pulling the clearest message the API
 * offered. Centralised because every admin form/action repeated the same
 * axios-error unwrapping.
 *
 * Client-only: imported by client components. `toast` no-ops off the client,
 * and the sonner host lives in the admin layout, so these never reach the
 * public site.
 */
export function toastError(err: unknown, fallback: string): void {
  let message = fallback;

  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    const fieldErrors =
      data?.errors && typeof data.errors === "object"
        ? Object.entries(data.errors)
            .map(([key, val]) => `${key}: ${(val as string[]).join(", ")}`)
            .join(" · ")
        : null;
    message = fieldErrors ?? data?.error ?? fallback;
  }

  toast.error(message);
}

export { toast };