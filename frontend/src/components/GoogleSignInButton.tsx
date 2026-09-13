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
  const { clientId, loginWithGoogleCredential, loginDemoUser, loading, error } = useAuth();
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
  }, [gisLoaded, clientId, loginWithGoogleCredential, redirectAfterLogin, router]);

  // Fluxo de redirecionamento OAuth 2.0 padrão (não sofre com bloqueio de iframe do GIS)
  const handleRedirectOAuth = () => {
    if (!clientId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
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

  const handleDemoLogin = async () => {
    const ok = await loginDemoUser("exemogenes@gmail.com", "Hermogenes Batista");
    if (ok) {
      router.push(redirectAfterLogin);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ fontSize: "0.85rem" }}>
          {error}
        </Alert>
      )}

      {/* Botão Oficial Google GIS (OneTap / Iframe) */}
      <Box
        ref={googleButtonRef}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          minHeight: 44,
          "& iframe": {
            margin: "0 auto !important",
          },
        }}
      />

      {/* Botão Alternativo: Fluxo OAuth 2.0 por Redirecionamento Direto */}
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
        {loading ? "Processando..." : "Entrar com Google (Redirecionamento)"}
      </Button>

      {/* Botão de Demonstração com o email real do usuário */}
      {showDemoButton && (
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<ScienceIcon />}
          onClick={handleDemoLogin}
          disabled={loading}
          sx={{
            color: "#64748b",
            fontSize: "0.8rem",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
              color: "#334155",
            },
          }}
        >
          Testar fluxo com conta exemogenes@gmail.com (Gera Token DRF)
        </Button>
      )}

      {/* Accordion de Diagnóstico das URLs OAuth */}
      <Accordion
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "8px !important",
          backgroundColor: "#f8fafc",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoOutlinedIcon fontSize="small" color="action" />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Diagnóstico de URLs para o Google Cloud Console
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Origem atual detectada no seu navegador:
          </Typography>
          <Box
            sx={{
              p: 1,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.75rem",
              wordBreak: "break-all",
              mb: 1.5,
            }}
          >
            {currentOrigin || "http://localhost:3000"}
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Certifique-se de que no Google Cloud Console constam:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0, fontSize: "0.75rem", color: "text.secondary" }}>
            <li>Origem JS: <code>{currentOrigin || "http://localhost:3000"}</code></li>
            <li>Origem JS: <code>http://localhost:3000</code></li>
            <li>Origem JS: <code>http://127.0.0.1:3000</code></li>
            <li>URI de Redirecionamento: <code>{currentOrigin || "http://localhost:3000"}/auth/callback</code></li>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
