"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** True when a site key is configured — forms use this to require a token. */
export const RECAPTCHA_ENABLED = Boolean(SITE_KEY);

interface Grecaptcha {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => number;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

// Load the v2 API script once, shared across widgets. `render=explicit` stops
// it auto-rendering, so we control exactly where the widget mounts.
let scriptPromise: Promise<void> | null = null;
function loadRecaptchaScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    if (window.grecaptcha?.render) return resolve();
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // grecaptcha may need a tick after onload before `render` is ready.
      const waitReady = () =>
        window.grecaptcha?.render ? resolve() : setTimeout(waitReady, 50);
      waitReady();
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * reCAPTCHA v2 "I'm not a robot" checkbox. Calls `onChange` with the token when
 * ticked, and "" when it expires or errors. Renders nothing when no site key is
 * set (dev), so forms keep working locally — the server likewise skips the check.
 *
 * The token is single-use: to clear the box after a successful submit, remount
 * this via a changing `key` prop rather than an imperative reset.
 */
export default function RecaptchaCheckbox({
  onChange,
}: {
  onChange: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let cancelled = false;

    loadRecaptchaScript().then(() => {
      // Guard against a double render (StrictMode) and unmount mid-load.
      if (cancelled || !containerRef.current || rendered.current) return;
      rendered.current = true;
      window.grecaptcha!.render(containerRef.current, {
        sitekey: SITE_KEY!,
        callback: (token) => onChange(token),
        "expired-callback": () => onChange(""),
        "error-callback": () => onChange(""),
      });
    });

    return () => {
      cancelled = true;
    };
    // `onChange` is a stable setState updater; mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="mt-2" />;
}
