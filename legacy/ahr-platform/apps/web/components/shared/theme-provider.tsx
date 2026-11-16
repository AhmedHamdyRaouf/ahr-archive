"use client";

import { createContext, useContext } from "react";

/**
 * Implements: UI/UX Specification, Design System (02) — token *categories*,
 * not final values (colors/fonts remain Blocking Issue B10). This provider
 * exists so components can reference a theme context from day one; it does
 * not yet supply real brand values, since none are approved.
 */
interface ThemeContextValue {
  tokensFrozen: false;
}

const ThemeContext = createContext<ThemeContextValue>({ tokensFrozen: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={{ tokensFrozen: false }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
