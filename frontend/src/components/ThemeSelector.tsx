"use client";

import * as React from "react";
import PaletteIcon from "@mui/icons-material/Palette";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { useThemeMode, type ThemeMode } from "@/context/ThemeContext";

const themeLabels: Record<ThemeMode, string> = {
  light: "Claro",
  dark: "Dark",
  pink: "Rosa",
};

export default function ThemeSelector() {
  const { themeMode, setThemeMode } = useThemeMode();

  const handleChange = (event: SelectChangeEvent<ThemeMode>) => {
    setThemeMode(event.target.value as ThemeMode);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ flexShrink: 0 }}
    >
      <PaletteIcon color="action" fontSize="small" />
      <FormControl size="small" sx={{ minWidth: 112 }}>
        <InputLabel id="theme-selector-label">Tema</InputLabel>
        <Select
          labelId="theme-selector-label"
          value={themeMode}
          label="Tema"
          onChange={handleChange}
          aria-label="Selecionar tema"
        >
          {Object.entries(themeLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
    );
}
