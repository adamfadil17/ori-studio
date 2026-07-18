"use client";

import { useEffect } from "react";
import { useHeaderTheme } from "./header-theme";

interface SetHeaderModeProps {
  mode: "auto" | "solid";
}

/**
 * Ditaruh di bagian atas sebuah page (server component) untuk mengatur mode
 * Header tanpa perlu Header tahu-menahu soal routing/pathname halaman itu.
 * Otomatis reset ke "auto" saat halaman di-unmount (pindah halaman).
 */
export default function SetHeaderMode({ mode }: SetHeaderModeProps) {
  const { setMode } = useHeaderTheme();

  useEffect(() => {
    setMode(mode);
    return () => setMode("auto");
  }, [mode, setMode]);

  return null;
}
