"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GoogleIcon from "@/components/GoogleIcon";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import NextLink from "next/link";

export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
        py: 4,
        px: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            backgroundColor: "#ffffff",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label="MUI Free Template"
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Sign-in"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5" fontWeight={700}>
            Entrar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
            Acesse o sistema com suas credenciais
          </Typography>

          {submitted && (
            <Alert severity="info" sx={{ width: "100%", mb: 2 }}>
              Formulário enviado para: <strong>{email}</strong>
            </Alert>
          )}

          {/* Google Sign In via Frontend with JWT */}
          <GoogleSignInButton redirectAfterLogin="/" />


          <Divider sx={{ width: "100%", my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              OU COM E-MAIL
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
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
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" defaultChecked />}
              label={<Typography variant="body2">Lembrar de mim</Typography>}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2, mb: 2, py: 1.2 }}
            >
              Entrar
            </Button>

            <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
              <Grid item>
                <Link href="#" variant="body2" underline="hover">
                  Esqueceu a senha?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2" underline="hover">
                  Criar conta
                </Link>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            <Stack spacing={1} alignItems="center">
              <Button
                component={NextLink}
                href="/sign-in-side"
                variant="text"
                size="small"
              >
                Alternar para Sign-in Side
              </Button>
              <Button
                component={NextLink}
                href="/"
                startIcon={<DashboardIcon />}
                variant="outlined"
                size="small"
                fullWidth
              >
                Ir para o Painel (Dashboard)
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
