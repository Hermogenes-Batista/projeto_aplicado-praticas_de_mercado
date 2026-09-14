"use client";

import * as React from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  Paper,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Button,
  Chip,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Avatar,
  Tooltip,
  Snackbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorageIcon from "@mui/icons-material/Storage";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import WebIcon from "@mui/icons-material/Web";
import DnsIcon from "@mui/icons-material/Dns";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyIcon from "@mui/icons-material/Key";
import ScienceIcon from "@mui/icons-material/Science";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import {useRouter} from "next/navigation";

const drawerWidth = 240;

interface HealthData {
  status: string;
  service: string;
  database: {
    status: string;
    vendor: string;
    error?: string;
  };
}

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [health, setHealth] = React.useState<HealthData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<any | null>(null);
  const [testLoading, setTestLoading] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState(false);
  const router = useRouter();

  const { user, token, logout, loginDemoUser, testAuthenticatedRequest } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/health/`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data: HealthData = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || "Falha ao conectar com o Django Backend");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHealth();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
    }
  };

  const handleTestAuth = async () => {
    setTestLoading(true);
    try {
      const data = await testAuthenticatedRequest();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ erro: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <DashboardIcon color="primary" sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Projeto Aplicado
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Material UI Dashboard
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton selected sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Visão Geral" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NextLink} href="/sign-in" sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <VpnKeyIcon />
            </ListItemIcon>
            <ListItemText primary="Sign-in" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "#f1f5f9",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
            DRF & GRAPHQL READY
          </Typography>
          <Typography variant="body2" sx={{ my: 0.5, fontSize: "0.85rem" }}>
            Tokens de autenticação gerenciados via Django REST Framework.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip
              label={token ? "Autenticado" : "Sessão Pública"}
              size="small"
              color={token ? "success" : "default"}
              variant="outlined"
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#ffffff",
          color: "#0f172a",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight={700}>
              Painel de Controle
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {user ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={user.picture}
                  alt={user.first_name || user.username}
                  sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                >
                  {(user.first_name || user.username).charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={600} sx={{ display: { xs: "none", md: "block" } }}>
                  {user.first_name || user.username}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                >
                  Sair
                </Button>
              </Stack>
            ) : (
              <>
                <Button
                  component={NextLink}
                  href="/sign-in-side"
                  variant="outlined"
                  size="small"
                  startIcon={<LoginIcon />}
                >
                  Sign-in Side
                </Button>
                <Button
                  component={NextLink}
                  href="/sign-in"
                  variant="contained"
                  size="small"
                  startIcon={<VpnKeyIcon />}
                >
                  Sign-in
                </Button>
              </>
            )}
            <IconButton color="inherit">
              <Badge badgeContent={1} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Responsive Drawer Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid #e2e8f0",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Header Action Section */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Visão Geral do Sistema
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ambiente integrado Docker Compose com autenticação desacoplada Next.js + Django REST + MySQL.
              </Typography>
            </Box>
            <Button
              startIcon={loading ? <CircularProgress size={18} /> : <RefreshIcon />}
              variant="outlined"
              onClick={fetchHealth}
              disabled={loading}
              size="medium"
            >
              Atualizar Status
            </Button>
          </Box>

          {/* Autenticação & JWT Card */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: token ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
              backgroundColor: token ? "#f0fdf4" : "#ffffff",
            }}
          >
            {user && token ? (
              <Box>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={user.picture}
                      alt={user.first_name || user.username}
                      sx={{ width: 56, height: 56, bgcolor: "success.main" }}
                    >
                      {(user.first_name || user.username).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.username}
                        </Typography>
                        <Chip label="Autenticado" color="success" size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {user.email} &bull; ID: {user.id}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                  >
                    Encerrar Sessão
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                    TOKEN DE AUTENTICAÇÃO DO DJANGO REST FRAMEWORK (DRF / GRAPHQL)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                      {token}
                    </Typography>
                    <Tooltip title={copied ? "Copiado!" : "Copiar Token"}>
                      <IconButton onClick={handleCopyToken} color="primary" size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                    REFRESH TOKEN DE AUTENTICAÇÃO DO DJANGO REST FRAMEWORK (DRF / GRAPHQL)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                      {localStorage.getItem("drf_refresh_token")}
                    </Typography>
                    <Tooltip title={copied ? "Copiado!" : "Copiar Token"}>
                      <IconButton onClick={handleCopyToken} color="primary" size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2.5 }} alignItems={{ md: "center" }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={testLoading ? <CircularProgress size={16} /> : <KeyIcon />}
                    onClick={handleTestAuth}
                    disabled={testLoading}
                  >
                    Testar Requisição DRF (/api/auth/me/)
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Header utilizado: <code>Authorization: Bearer {token.slice(0, 8)}...</code>
                  </Typography>
                </Stack>

                {testResult && (
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "#0f172a",
                      color: "#38bdf8",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.5 }}>
                      Resposta recebida da API Django REST autenticada:
                    </Typography>
                    <pre style={{ margin: 0, overflowX: "auto" }}>
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </Paper>
                )}
              </Box>
            ) : (
              <Box>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Autenticação Desacoplada (Frontend &rarr; Django DRF)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 650 }}>
                      O login do Google ocorre 100% no Next.js (sem templates do Django). As credenciais são validadas pelo backend Django REST, que cria o usuário no MySQL e retorna tokens JWT.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      component={NextLink}
                      href="/sign-in-side"
                      variant="contained"
                      startIcon={<LoginIcon />}
                      size="medium"
                    >
                      Fazer Login
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ScienceIcon />}
                      size="medium"
                      onClick={() => loginDemoUser()}
                    >
                      Login Teste
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Paper>

          {/* KPI Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Next.js Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Frontend
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                      label="Online"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="h5" fontWeight={700}>
                    Next.js 14
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Porta: <strong>3000</strong> &bull; Material UI v5
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Django Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Backend API
                    </Typography>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : health?.status === "ok" ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                        label="Online"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon sx={{ fontSize: "16px !important" }} />}
                        label="Offline"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Typography variant="h5" fontWeight={700}>
                    Django REST
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Porta: <strong>8000</strong> &bull; JWT Auth
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* MySQL Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Banco de Dados
                    </Typography>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : health?.database?.status === "connected" ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                        label="Conectado"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon sx={{ fontSize: "16px !important" }} />}
                        label="Desconectado"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Typography variant="h5" fontWeight={700}>
                    MySQL 8.0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Porta: <strong>3306</strong> &bull; Volume persistente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Diagnostic Details */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Erro de comunicação: {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Services Table */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="Containers do Docker Compose"
                  subheader="Status de orquestração e portas expostas"
                  titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                />
                <Divider />
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Serviço</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Container</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Porta Interna / Host</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tecnologia</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <WebIcon color="primary" fontSize="small" />
                          <strong>frontend</strong>
                        </TableCell>
                        <TableCell>nextjs_frontend</TableCell>
                        <TableCell>3000 : 3000</TableCell>
                        <TableCell>Next.js 14 + MUI</TableCell>
                        <TableCell>
                          <Chip label="Executando" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <DnsIcon color="primary" fontSize="small" />
                          <strong>backend</strong>
                        </TableCell>
                        <TableCell>django_backend</TableCell>
                        <TableCell>8000 : 8000</TableCell>
                        <TableCell>Django REST Framework</TableCell>
                        <TableCell>
                          <Chip
                            label={health?.status === "ok" ? "Executando" : "Verificando"}
                            color={health?.status === "ok" ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <StorageIcon color="primary" fontSize="small" />
                          <strong>db</strong>
                        </TableCell>
                        <TableCell>mysql_db</TableCell>
                        <TableCell>3306 : 3306</TableCell>
                        <TableCell>MySQL 8.0</TableCell>
                        <TableCell>
                          <Chip
                            label={health?.database?.status === "connected" ? "Saudável" : "Verificando"}
                            color={health?.database?.status === "connected" ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Quick Actions & Templates Showcase */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title="Templates Material UI"
                  subheader="Telas disponíveis para navegação"
                  titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Sign-in Side Template
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Layout em duas colunas com área de branding e formulário com Google OAuth.
                      </Typography>
                      <Button
                        component={NextLink}
                        href="/sign-in-side"
                        variant="contained"
                        size="small"
                        fullWidth
                      >
                        Abrir Sign-in Side
                      </Button>
                    </Box>

                    <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Sign-in Template Clássico
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Card centralizado com design minimalista e suporte a credenciais.
                      </Typography>
                      <Button
                        component={NextLink}
                        href="/sign-in"
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        Abrir Sign-in
                      </Button>
                    </Box>

                    <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Django Admin
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Gerenciamento de usuários, tabelas MySQL e tokens de API.
                      </Typography>
                      <Button
                        component="a"
                        href={`${apiUrl}/admin/`}
                        target="_blank"
                        variant="text"
                        size="small"
                        fullWidth
                        endIcon={<OpenInNewIcon />}
                      >
                        Acessar Django Admin
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Access token copiado para a área de transferência!"
      />
    </Box>
  );
}
