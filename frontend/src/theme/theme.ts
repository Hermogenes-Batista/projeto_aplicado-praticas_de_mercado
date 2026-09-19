import { createTheme } from "@mui/material/styles";

import type { ThemeMode } from "@/context/ThemeContext";

export const createAppTheme = (themeMode: ThemeMode) =>
  createTheme({
    palette:
      themeMode === "dark"
        ? {
            mode: "dark",
            primary: { main: "#90caf9" },
            secondary: { main: "#ce93d8" },
            background: { default: "#121212", paper: "#1e1e1e" },
          }
        : themeMode === "pink"
          ? {
              mode: "light",
              primary: {
                main: "#d81b60",
                light: "#ec407a",
                dark: "#ad1457",
                contrastText: "#ffffff",
              },
              secondary: {
                main: "#8e24aa",
                light: "#ba68c8",
                dark: "#6a1b9a",
                contrastText: "#ffffff",
              },
              background: { default: "#fff5f8", paper: "#ffffff" },
              text: { primary: "#4a1025", secondary: "#8a5369" },
            }
          : {
              mode: "light",
              primary: {
                main: "#1976d2",
                light: "#42a5f5",
                dark: "#1565c0",
                contrastText: "#ffffff",
              },
              secondary: {
                main: "#9c27b0",
                light: "#ba68c8",
                dark: "#7b1fa2",
                contrastText: "#ffffff",
              },
              background: { default: "#f8fafc", paper: "#ffffff" },
              text: { primary: "#0f172a", secondary: "#64748b" },
            },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
