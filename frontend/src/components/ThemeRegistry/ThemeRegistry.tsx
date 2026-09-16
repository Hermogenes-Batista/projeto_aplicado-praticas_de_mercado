"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "@/theme/theme";
import { ThemeModeProvider, useThemeMode } from "@/context/ThemeContext";

function ThemedContent({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeMode();
  const theme = React.useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeProvider>
        <ThemedContent>{children}</ThemedContent>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
