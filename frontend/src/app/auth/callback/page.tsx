"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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
      setError(`Erro retornado pelo Google: ${errorParam}`);
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
          setError("Não foi possível autenticar o código com o Django backend.");
        }
      })
      .catch((err) => {
        setError(err.message || "Erro durante o intercâmbio de autenticação.");
      });
  }, [searchParams, loginWithGoogleCode, router]);


  return (
    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
      {error ? (
        <Stack spacing={3}>
          <Alert severity="error">{error}</Alert>
          <Button component={NextLink} href="/sign-in-side" variant="contained">
            Voltar ao Login
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="h6" fontWeight={600}>
            Processando a autenticação com o Google...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Validando as credenciais com o backend Django e gerando tokens JWT.
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}

export default function AuthCallback() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Suspense fallback={<CircularProgress />}>
        <CallbackHandler />
      </Suspense>
    </Container>
  );
}
