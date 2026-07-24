"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface ConfirmOptions {
  title: string;
  /** Optional second line — the consequence, in plain words. */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` reddens the confirm button and focuses Cancel instead. */
  variant?: "default" | "danger";
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * Ask the user to confirm an action.
 *
 * Promise-based on purpose, so it reads like the `window.confirm` it replaces
 * and works for any action — add, edit, delete, sign out:
 *
 *   if (!(await confirm({ title: "Delete project?" }))) return;
 */
export function useConfirm(): Confirm {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return ctx;
}

/**
 * Hosts the single confirmation dialog for the admin panel. Mounted once in the
 * admin root layout, so — like the toaster — it never reaches the public site.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  // Held across renders so the promise can be settled from the click handlers.
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>((next) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && <ConfirmDialog options={options} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions;
  onClose: (ok: boolean) => void;
}) {
  const {
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
  } = options;

  const isDanger = variant === "danger";
  // For destructive actions the safe button takes focus, so a stray Enter
  // cancels rather than deletes.
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(false);
    }
    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind from scrolling while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      onClick={() => onClose(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-headline/60 px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-headline/10 bg-background-main p-8"
      >
        <h2
          id="confirm-dialog-title"
          className="font-serif text-xl text-headline"
        >
          {title}
        </h2>

        {description && (
          <p
            id="confirm-dialog-description"
            className="mt-3 text-sm leading-relaxed text-body"
          >
            {description}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            ref={isDanger ? initialFocusRef : undefined}
            onClick={() => onClose(false)}
            className="text-xs tracking-widest uppercase text-body transition-opacity hover:opacity-70 hover:cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={isDanger ? undefined : initialFocusRef}
            onClick={() => onClose(true)}
            className={`px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer ${
              isDanger ? "bg-red-800" : "bg-eyebrow"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}