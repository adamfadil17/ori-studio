"use client";

import { Toaster } from "sonner";

/**
 * Toast host for the admin panel, styled to the brand tokens rather than
 * sonner's default look.
 *
 * Mounted in the admin root layout, so it lives ONLY on the admin branch. The
 * public site is a separate root layout that never renders this — toasts can't
 * leak onto public pages by construction, not by a runtime check.
 *
 * Colours reference the raw `:root` custom properties from globals.css (which
 * are real CSS variables, unlike the Tailwind `@theme` tokens), so they resolve
 * inside sonner's portal at the document root.
 */
export default function AdminToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--headline)",
          border: "1px solid rgba(51, 39, 31, 0.12)",
          borderRadius: "0",
          fontFamily: "inherit",
          fontSize: "0.8125rem",
        },
        classNames: {
          // A hairline accent carries success vs error on the muted palette,
          // since the surface itself stays neutral brand.
          success: "border-l-2 [border-left-color:var(--eyebrow)]",
          error: "border-l-2 [border-left-color:#9f0712]",
          description: "[color:var(--body)]",
        },
      }}
    />
  );
}