"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GoogleIcon from "@/components/GoogleIcon";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignInSide() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const router = useRouter();
  const { loginWithCredentials, error, loading } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await loginWithCredentials(email, password);
    setSubmitted(success);
    if (success) {
      router.push("/");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      {/* Left side: Branding & Hero */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)",
          color: "white",
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { sm: 4, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ zIndex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              label="Segurança"
              color="primary"
              size="small"

              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            Projeto Aplicado
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: "italic", mb: 1, color: "rgba(255,255,255,0.9)" }}>
            &ldquo;A combinação de Material UI no frontend com Django e MySQL no backend entrega uma experiência profissional, escalável e pronta para produção.&rdquo;
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
            Práticas de Mercado &bull; Ambiente Dockerizado
          </Typography>
        </Box>
      </Grid>

      {/* Right side: Sign-in Form */}
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            maxWidth: 420,
            width: "100%",
            mx: "auto",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Button
              component={NextLink}
              href="/"
              startIcon={<DashboardIcon />}
              size="small"
              variant="outlined"
            >
              Ir ao Painel
            </Button>
          </Stack>

          <Typography component="h2" variant="h5" fontWeight={700}>
            Acessar Plataforma
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Entre com suas credenciais ou utilize autenticação com o Google.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {submitted && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Login realizado com sucesso.
            </Alert>
          )}

          {/* Google OAuth Login Button via Frontend (Decoupled with JWT) */}
          <GoogleSignInButton redirectAfterLogin="/" />

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OU COM E-MAIL
            </Typography>
          </Divider>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1, mb: 2 }}
            >
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" defaultChecked />}
                label={<Typography variant="body2">Lembrar de mim</Typography>}
              />
              <Link href="#" variant="body2" underline="hover">
                Esqueceu a senha?
              </Link>
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.3, mb: 3 }}
            >
              Entrar
            </Button>

            <Stack spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Não possui uma conta?{" "}
                <Link href="#" variant="body2" underline="hover" fontWeight={600}>
                  Cadastre-se
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alternar template:{" "}
                <Link component={NextLink} href="/sign-in" variant="body2" underline="hover" fontWeight={600}>
                  Ver Sign-in Centralizado
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
