"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useConfirm } from "./confirm-dialog";

interface UnsavedChangesValue {
  setDirty: (dirty: boolean) => void;
  /** Resolves true when it's safe to navigate away. */
  confirmLeave: () => Promise<boolean>;
}

const UnsavedChangesContext = createContext<UnsavedChangesValue | null>(null);

/**
 * Tracks whether the page currently holds unsaved edits, and asks before the
 * user navigates away from them.
 *
 * Deliberately NOT a confirmation on every save — that adds friction to the
 * common path. This only interrupts the rare, costly case: leaving a form with
 * work in it.
 *
 * Lives inside <ConfirmProvider> so it can reuse the same dialog.
 */
export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const confirm = useConfirm();
  // A ref, not state: the flag is read at navigation time and should never
  // trigger a re-render of the whole admin tree.
  const dirtyRef = useRef(false);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const confirmLeave = useCallback(async () => {
    if (!dirtyRef.current) return true;
    return confirm({
      title: "Leave without saving?",
      description:
        "The changes on this page haven't been saved yet and will be lost.",
      confirmLabel: "Leave",
      cancelLabel: "Stay",
      variant: "danger",
    });
  }, [confirm]);

  return (
    <UnsavedChangesContext.Provider value={{ setDirty, confirmLeave }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

/** Ask before leaving — resolves true when navigation may proceed. */
export function useLeaveGuard(): () => Promise<boolean> {
  const ctx = useContext(UnsavedChangesContext);
  // Fallback keeps the caller usable outside the provider (never blocks).
  return ctx?.confirmLeave ?? (async () => true);
}

/**
 * Register a form's dirty state. Also arms the browser's own warning for tab
 * close / reload, which no in-app dialog can cover.
 */
export function useUnsavedChanges(dirty: boolean): void {
  const ctx = useContext(UnsavedChangesContext);
  const setDirty = ctx?.setDirty;

  useEffect(() => {
    setDirty?.(dirty);
    // Unmounting the form means the edits are gone or saved either way.
    return () => setDirty?.(false);
  }, [dirty, setDirty]);

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      // The browser shows its own generic message; the text can't be set.
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/**
 * A `Link` that checks for unsaved changes first.
 *
 * Modifier-clicks (ctrl/cmd/shift/alt, middle click) fall through untouched, so
 * "open in new tab" still works — that navigation doesn't lose anything.
 */
export function GuardedLink({
  href,
  className,
  children,
  onNavigate,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Runs just before navigating (e.g. closing a mobile drawer). */
  onNavigate?: () => void;
} & Omit<React.ComponentProps<typeof Link>, "href" | "onClick" | "className">) {
  const confirmLeave = useLeaveGuard();
  const router = useRouter();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        e.preventDefault();
        void (async () => {
          if (await confirmLeave()) {
            onNavigate?.();
            router.push(href);
          }
        })();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}