"use client";

import { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";

interface ActivityCountdownProps {
  dueDate: string | null;
}

export default function ActivityCountdown({ dueDate }: ActivityCountdownProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!dueDate || now === null) return null;

  const remainingMs = new Date(dueDate).getTime() - now;
  if (!Number.isFinite(remainingMs)) return null;

  if (remainingMs <= 0) {
    return <Chip label="Prazo encerrado" color="error" size="small" />;
  }

  if (remainingMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    return (
      <Chip
        label={
          hours === 0
            ? "Menos de 1 hora"
            : `${hours} ${hours === 1 ? "hora" : "horas"} restantes`
        }
        color={hours <= 3 ? "error" : "warning"}
        size="small"
      />
    );
  }

  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  return (
    <Chip
      label={`${days} ${days === 1 ? "dia" : "dias"} restantes`}
      color="default"
      size="small"
    />
  );
}
