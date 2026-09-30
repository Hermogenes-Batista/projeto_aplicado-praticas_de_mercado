"use client";

import { MenuItem, Stack, TextField } from "@mui/material";

interface ActivityDueDateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  helperText?: string;
  size?: "small" | "medium";
  disabled?: boolean;
}

const hourOptions = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
const minuteOptions = ["00", "15", "30", "45"];

export default function ActivityDueDateField({
  value,
  onChange,
  label,
  helperText,
  size = "medium",
  disabled = false,
}: ActivityDueDateFieldProps) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  const [currentHour = "", currentMinute = ""] = time.split(":");
  const hour = hourOptions.includes(currentHour) ? currentHour : "09";
  const minute = minuteOptions.includes(currentMinute) ? currentMinute : "00";

  const changeDate = (nextDate: string) => {
    if (!nextDate) {
      onChange("");
      return;
    }
    onChange(`${nextDate}T${hour}:${minute}`);
  };

  const changeTime = (nextHour: string, nextMinute: string) => {
    if (date) onChange(`${date}T${nextHour}:${nextMinute}`);
  };

  return (
    <Stack
      spacing={1}
      direction={{ xs: "column", sm: "row" }}
      sx={{ width: "100%", minWidth: 0 }}
    >
      <TextField
        type="date"
        label={label}
        value={date}
        onChange={(event) => changeDate(event.target.value)}
        fullWidth
        size={size}
        disabled={disabled}
        InputLabelProps={{ shrink: true }}
        helperText={helperText}
        sx={{ flex: 2, minWidth: { sm: 180 } }}
      />
      <TextField
        select
        label="Hora"
        value={hour}
        onChange={(event) => changeTime(event.target.value, minute)}
        fullWidth
        size={size}
        disabled={disabled || !date}
        sx={{ flex: 1, minWidth: { sm: 90 } }}
      >
        {hourOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Minuto"
        value={minute}
        onChange={(event) => changeTime(hour, event.target.value)}
        fullWidth
        size={size}
        disabled={disabled || !date}
        sx={{ flex: 1, minWidth: { sm: 90 } }}
      >
        {minuteOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
