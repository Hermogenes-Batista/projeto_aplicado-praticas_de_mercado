"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "pink";

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);
const THEME_STORAGE_KEY = "app_theme";

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>("light");

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "pink"
    ) {
      setThemeModeState(storedTheme);
    }
  }, []);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode deve ser usado dentro de ThemeModeProvider");
  }
  return context;
}
