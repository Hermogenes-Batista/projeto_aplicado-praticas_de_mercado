"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GoogleIcon from "@/components/GoogleIcon";
import ScienceIcon from "@mui/icons-material/Science";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  redirectAfterLogin?: string;
  showDemoButton?: boolean;
}

export default function GoogleSignInButton({
  redirectAfterLogin = "/",
  showDemoButton = true,
}: GoogleSignInButtonProps) {
  const { clientId, loginWithGoogleCredential, loginDemoUser, loading, error } =
    useAuth();
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }

    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGisLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!gisLoaded || !clientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response?.credential) {
            const ok = await loginWithGoogleCredential(response.credential);
            if (ok) {
              router.push(redirectAfterLogin);
            }
          }
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "pt-BR",
        });
      }
    } catch (e) {
      console.warn("Aviso GIS:", e);
    }
  }, [
    gisLoaded,
    clientId,
    loginWithGoogleCredential,
    redirectAfterLogin,
    router,
  ]);

  // Standard OAuth 2.0 redirect flow (not affected by GIS iframe blocking)
  const handleRedirectOAuth = () => {
    if (!clientId) return;
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const redirectUri = `${origin}/auth/callback`;
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=online&` +
      `prompt=select_account`;
    window.location.href = authUrl;
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ fontSize: "0.85rem" }}>
          {error}
        </Alert>
      )}

      {/* Alternative button: OAuth 2.0 direct redirect flow */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
        onClick={handleRedirectOAuth}
        disabled={loading || !clientId}
        sx={{
          py: 1.2,
          borderColor: "#cbd5e1",
          color: "#334155",
          fontWeight: 600,
          "&:hover": {
            borderColor: "#94a3b8",
            backgroundColor: "#f8fafc",
          },
        }}
      >
        {loading ? "Processando..." : "Entrar com Google"}
      </Button>
    </Stack>
  );
}
