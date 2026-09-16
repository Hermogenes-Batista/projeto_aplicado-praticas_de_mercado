"use client";

import * as React from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import ChecklistIcon from "@mui/icons-material/Checklist";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";
import {
  TodoCategoriesDocument,
  TodoCategoriesQuery,
  TodoItemsDocument,
  TodoItemsQuery,
} from "@/graphql/generated";

const drawerWidth = 240;

type TodoItem = NonNullable<TodoItemsQuery["items"][number]>;
type TodoCategory = NonNullable<TodoCategoriesQuery["categories"][number]>;

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [items, setItems] = React.useState<TodoItem[]>([]);
  const [categories, setCategories] = React.useState<TodoCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {
    user,
    token,
    loading: authLoading,
    logout,
    requestAuthenticatedGraphQL,
  } = useAuth();

  const fetchTodoMetrics = React.useCallback(async () => {
    if (!token) {
      setItems([]);
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoItemsQuery>(TodoItemsDocument, {
          isResolved: null,
        }),
        requestAuthenticatedGraphQL<TodoCategoriesQuery>(
          TodoCategoriesDocument,
        ),
      ]);
      setItems(itemsData.items.filter((item): item is TodoItem => item !== null));
      setCategories(
        categoriesData.categories.filter(
          (category): category is TodoCategory => category !== null,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao carregar os TODOs.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestAuthenticatedGraphQL, token]);

  React.useEffect(() => {
    void fetchTodoMetrics();
  }, [fetchTodoMetrics]);

  if (authLoading || !user || !token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {authLoading ? <CircularProgress /> : null}
      </Box>
    );
  }

  const resolvedCount = items.filter((item) => item.isResolved).length;
  const pendingCount = items.length - resolvedCount;
  const resolvedPercentage = items.length
    ? Math.round((resolvedCount / items.length) * 100)
    : 0;
  const pendingPercentage = items.length ? 100 - resolvedPercentage : 0;
  const categoryMetrics = categories
    .map((category) => {
      const categoryItems = items.filter(
        (item) => item.category?.id === category.id,
      );
      const resolved = categoryItems.filter((item) => item.isResolved).length;
      return {
        id: category.id,
        name: category.name,
        total: categoryItems.length,
        resolved,
        pending: categoryItems.length - resolved,
      };
    })

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <DashboardIcon color="primary" sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Projeto Aplicado
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Painel de Controle
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
            <ListItemText primary="Visão Geral" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NextLink} href="/todos" sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ChecklistIcon />
            </ListItemIcon>
            <ListItemText primary="TODOs" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              Painel de Controle
            </Typography>
          </Box>
          {user ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ThemeSelector />
              <Avatar
                src={user.picture}
                alt={user.first_name || user.username}
                sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
              >
                {(user.first_name || user.username).charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ display: { xs: "none", md: "block" } }}
              >
                {user.first_name || user.username}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => void logout()}
              >
                Sair
              </Button>
            </Stack>
          ) : (
            <Button
              component={NextLink}
              href="/sign-in"
              variant="contained"
              size="small"
              startIcon={<VpnKeyIcon />}
            >
              Entrar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
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
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: 1,
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Card>
            <CardHeader
              title="Métricas dos TODOs"
              subheader={
                token
                  ? "Resumo dos itens da sua lista"
                  : "Faça login para visualizar suas métricas"
              }
              titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              action={
                token ? (
                  <Button
                    size="small"
                    startIcon={
                      loading ? <CircularProgress size={16} /> : <RefreshIcon />
                    }
                    onClick={() => void fetchTodoMetrics()}
                    disabled={loading}
                  >
                    Atualizar
                  </Button>
                ) : undefined
              }
            />
            <Divider />
            <CardContent>
              {error && <Alert severity="error">{error}</Alert>}
              {!token ? (
                <Typography color="text.secondary">
                  Os gráficos serão exibidos após a autenticação.
                </Typography>
              ) : loading && !items.length ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Resumo global dos itens
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography variant="body2">
                              Resolvidos: <strong>{resolvedCount}</strong> (
                              {resolvedPercentage}%)
                            </Typography>
                            <Typography variant="body2">
                              Pendentes: <strong>{pendingCount}</strong> (
                              {pendingPercentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={resolvedPercentage}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: "#f59e0b",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: "#16a34a",
                                borderRadius: 6,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Total global: {items.length} item(ns)
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  {categoryMetrics.map((category) => {
                    const resolvedPercentage = category.total
                      ? Math.round((category.resolved / category.total) * 100)
                      : 0;
                    const pendingPercentage = category.total
                      ? 100 - resolvedPercentage
                      : 0;
                    return (
                      <Grid item xs={12} md={6} key={category.name}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            {category.id ? (
                              <Typography
                                component={NextLink}
                                href={`/todos/activities/${category.id}`}
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                  color: "primary.main",
                                  textDecoration: "none",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {category.name}
                              </Typography>
                            ) : (
                              <Typography variant="subtitle1" fontWeight={700}>
                                {category.name}
                              </Typography>
                            )}
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography variant="body2">
                                  Resolvidos: <strong>{category.resolved}</strong>{" "}
                                  ({resolvedPercentage}%)
                                </Typography>
                                <Typography variant="body2">
                                  Pendentes: <strong>{category.pending}</strong>{" "}
                                  ({pendingPercentage}%)
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={resolvedPercentage}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: "#f59e0b",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#16a34a",
                                    borderRadius: 5,
                                  },
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Total de itens na atividade: {category.total} item(ns)
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
