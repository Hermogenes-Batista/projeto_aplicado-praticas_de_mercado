"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import NoSsr from "@mui/material/NoSsr";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import NextLink from "next/link";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogleCode } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const hasCalledRef = React.useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Erro: ${errorParam}`);
      return;
    }

    if (!code) {
      setError("Nenhum código de autenticação foi encontrado na URL.");
      return;
    }

    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    // Send the code to the Django backend for validation and JWT generation
    loginWithGoogleCode(code)
      .then((success) => {
        if (success) {
          router.push("/");
        } else {
          setError("Não foi possível autenticar.");
        }
      })
      .catch((err) => {
        setError(err.message || "Erro durante autenticação.");
      });
  }, [searchParams, loginWithGoogleCode, router]);

  return (
    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
      {error ? (
        <Stack spacing={3}>
          <Alert severity="error">{error}</Alert>
          <Button component={NextLink} href="/sign-in" variant="contained">
            Voltar ao Login
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={48} />
        </Stack>
      )}
    </Paper>
  );
}

export default function AuthCallback() {
  const fallback = <p role="status">Concluindo autenticação...</p>;

  return (
    // The saved theme can change before this route's Suspense boundary hydrates.
    // Mount the browser-only OAuth flow after hydration with a theme-free fallback.
    <NoSsr fallback={fallback}>
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Suspense fallback={fallback}>
          <CallbackHandler />
        </Suspense>
      </Container>
    </NoSsr>
  );
}
