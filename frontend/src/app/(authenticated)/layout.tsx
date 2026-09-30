"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
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
import AddIcon from "@mui/icons-material/Add";
import { useMediaQuery } from "@mui/system";
import { useAuth } from "@/context/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";

const drawerWidth = 240;

export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        {loading ? <CircularProgress /> : null}
      </Box>
    );
  }

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
          <ListItemButton
            component={NextLink}
            href="/"
            selected={pathname === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Visão Geral" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NextLink}
            href="/todos"
            selected={pathname.startsWith("/todos")}
            onClick={() => setMobileOpen(false)}
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

  const title = pathname.startsWith("/todos/activities/new")
    ? "Criar Atividade"
    : pathname.startsWith("/todos/activities/")
      ? "Edit Atividade"
      : pathname.startsWith("/todos")
        ? "Lista de TODOs"
        : "Painel de Controle";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ mr: 1, display: { sm: "none" } }}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </IconButton>
            {!isMobile && (
              <Typography variant="h6" fontWeight={700} noWrap>
                {title}
              </Typography>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems="center"
          >
            <Button
              component={NextLink}
              href="/todos/activities/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ whiteSpace: "nowrap" }}
            >
              {!isMobile && "Nova "}Atividade
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
              onClick={() => void logout()}
              startIcon={!isMobile ? <LogoutIcon /> : undefined}
              aria-label="Sair"
              title="Sair"
              sx={{
                minWidth: isMobile ? "auto" : undefined,
                p: isMobile ? "6px" : undefined,
                flexShrink: 0,
              }}
            >
              {isMobile ? <LogoutIcon fontSize="small" /> : "Sair"}
            </Button>
          </Stack>
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
          minWidth: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          p: "10px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
