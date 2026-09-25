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
  useTheme,
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
  TodoActivitiesDocument,
  TodoActivitiesQuery,
} from "@/graphql/generated";
import AddIcon from "@mui/icons-material/Add";
import { useMediaQuery } from "@mui/system";

const drawerWidth = 240;

type TodoActivities = NonNullable<TodoActivitiesQuery["activities"][number]>;
type TodoItem = NonNullable<
  Exclude<
    Exclude<NonNullable<TodoActivitiesQuery>["activities"], null>[number],
    null
  >["items"]
>[number];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [items, setItems] = React.useState<TodoItem[]>([]);
  const [activities, setActivities] = React.useState<TodoActivities[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {
    user,
    token,
    loading: authLoading,
    logout,
    requestAuthenticatedGraphQL,
  } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchTodoMetrics = React.useCallback(async () => {
    if (!token) {
      setItems([]);
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [activitiesData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoActivitiesQuery>(
          TodoActivitiesDocument,
        ),
      ]);
      const validActivities = activitiesData.activities.filter(
        (activity): activity is TodoActivities => activity !== null,
      );

      setItems(
        validActivities.flatMap((activity) => {
          return (
            activity.items?.filter((item): item is TodoItem => item !== null) ??
            []
          );
        }),
      );
      setActivities(validActivities);
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
  const activityMetrics = activities.map((activity) => {
    const activityItems = items.filter(
      (item) => item.activity?.id === activity.id,
    );
    const resolved = activityItems.filter((item) => item.isResolved).length;
    return {
      id: activity.id,
      name: activity.name,
      total: activityItems.length,
      resolved,
      pending: activityItems.length - resolved,
    };
  });

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
          <ListItemButton
            component={NextLink}
            href="/todos"
            sx={{ borderRadius: 2 }}
          >
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
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
            {!isMobile && (
              <Typography variant="h6" fontWeight={700}>
                Painel de Controle
              </Typography>
            )}
          </Box>
          {user ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                component={NextLink}
                href="/todos/activities/new"
                variant="contained"
                startIcon={<AddIcon />}
              >
                {!isMobile && "Nova"} Atividade
              </Button>
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

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
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
                          <Stack direction="row" justifyContent="space-between">
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
                  {activityMetrics.map((activity) => {
                    const resolvedPercentage = activity.total
                      ? Math.round((activity.resolved / activity.total) * 100)
                      : 0;
                    const pendingPercentage = activity.total
                      ? 100 - resolvedPercentage
                      : 0;
                    return (
                      <Grid item xs={12} md={6} key={activity.name}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <CardContent>
                            {activity.id ? (
                              <Typography
                                component={NextLink}
                                href={`/todos/activities/${activity.id}`}
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                  color: "primary.main",
                                  textDecoration: "none",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {activity.name}
                              </Typography>
                            ) : (
                              <Typography variant="subtitle1" fontWeight={700}>
                                {activity.name}
                              </Typography>
                            )}
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography variant="body2">
                                  Resolvidos:{" "}
                                  <strong>{activity.resolved}</strong> (
                                  {resolvedPercentage}%)
                                </Typography>
                                <Typography variant="body2">
                                  Pendentes: <strong>{activity.pending}</strong>{" "}
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Total de itens na atividade: {activity.total}{" "}
                                item(ns)
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
