"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderMode = "auto" | "solid";

interface HeaderThemeContextValue {
  mode: HeaderMode;
  setMode: (mode: HeaderMode) => void;
}

const HeaderThemeContext = createContext<HeaderThemeContextValue | null>(null);

export function HeaderThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HeaderMode>("auto");

  return (
    <HeaderThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </HeaderThemeContext.Provider>
  );
}

export function useHeaderTheme() {
  const ctx = useContext(HeaderThemeContext);
  if (!ctx) {
    throw new Error("useHeaderTheme must be used within HeaderThemeProvider");
  }
  return ctx;
}
