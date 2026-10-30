import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

const drawerWidth = 260;

const menuItems = [
  {
    label: "Productos",
    path: "/productos",
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: "Ventas",
    path: "/venta",
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: "Proveedores",
    path: "/proveedores",
    icon: <LocalShippingRoundedIcon />,
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: <PeopleAltRoundedIcon />,
  },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.label ??
    "Dashboard";

  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#111827",
        color: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          height: 76,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "#2563EB",
            display: "grid",
            placeItems: "center",
          }}
        >
          <LayersRoundedIcon sx={{ color: "white", fontSize: 25 }} />
        </Box>

        <Box>
          <Typography fontSize={19} fontWeight={800} letterSpacing={1}>
            NEXUS
          </Typography>

          <Typography
            fontSize={10}
            color="#9CA3AF"
            letterSpacing={1.5}
          >
            ADMINISTRATION
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#273244" }} />

      {/* NAVEGACIÓN */}
      <Box sx={{ px: 2, pt: 3, flex: 1 }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1.5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#9CA3AF",
          }}
        >
          MENÚ PRINCIPAL
        </Typography>

        <List disablePadding>
          {menuItems.map((item) => {
            const selected =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => goTo(item.path)}
                sx={{
                  minHeight: 48,
                  px: 1.5,
                  mb: 0.7,
                  borderRadius: 2,
                  color: selected ? "#FFFFFF" : "#9CA3AF",
                  transition: "all .2s ease",

                  "& .MuiListItemIcon-root": {
                    minWidth: 38,
                    color: "inherit",
                  },

                  "&.Mui-selected": {
                    bgcolor: "#2563EB",
                    boxShadow: "0 5px 15px rgba(37,99,235,.2)",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor: "#1D4ED8",
                  },

                  "&:hover": {
                    bgcolor: "#1F2937",
                    color: "#FFFFFF",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: selected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* PREFERENCIAS */}
        <Typography
          sx={{
            px: 1.5,
            mt: 4,
            mb: 1.5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#9CA3AF",
          }}
        >
          PREFERENCIAS
        </Typography>

        <List disablePadding>
          <ListItemButton
            selected={location.pathname.startsWith("/configuracion")}
            onClick={() => goTo("/configuracion")}
            sx={{
              minHeight: 48,
              px: 1.5,
              borderRadius: 2,
              color: location.pathname.startsWith("/configuracion")
                ? "#FFFFFF"
                : "#9CA3AF",

              "& .MuiListItemIcon-root": {
                minWidth: 38,
                color: "inherit",
              },

              "&.Mui-selected": {
                bgcolor: "#2563EB",
              },

              "&:hover": {
                bgcolor: "#1F2937",
                color: "#FFFFFF",
              },
            }}
          >
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>

            <ListItemText
              primary="Configuración"
              primaryTypographyProps={{ fontSize: 13 }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* PERFIL INFERIOR */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "#273244" }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#DBEAFE",
              color: "#1D4ED8",
              width: 38,
              height: 38,
              fontWeight: 700,
            }}
          >
            D
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={600} noWrap>
              Administrador
            </Typography>

            <Typography fontSize={11} color="#9CA3AF" noWrap>
              admin@ejemplo.com
            </Typography>
          </Box>

          <IconButton
            aria-label="Opciones de usuario"
            size="small"
            sx={{ color: "#9CA3AF" }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F3F6FB" }}>
      {/* BARRA SUPERIOR */}
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E7EB",
          color: "#111827",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: "76px !important", px: { xs: 2, md: 4 } }}>
          {isMobile && (
            <IconButton
              onClick={() => setMobileOpen(true)}
              edge="start"
              sx={{ mr: 1.5 }}
              aria-label="Abrir menú"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={11} color="text.secondary">
              {currentPage}
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              bgcolor: "#F3F4F6",
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              px: 1.5,
              mr: 2,
              width: { sm: 190, md: 245 },
            }}
          >
            <SearchRoundedIcon sx={{ color: "#9CA3AF", fontSize: 21 }} />

            <InputBase
              placeholder="Buscar..."
              sx={{ ml: 1, flex: 1, fontSize: 13, py: 0.5 }}
              inputProps={{ "aria-label": "Buscar" }}
            />
          </Box>

          <IconButton
            aria-label="Notificaciones"
            sx={{ mr: 1, color: "#64748B" }}
          >
            <Badge variant="dot" color="error">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>

          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#DBEAFE",
              color: "#1D4ED8",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            D
          </Avatar>

          <KeyboardArrowDownRoundedIcon
            sx={{ ml: 0.5, color: "#9CA3AF" }}
          />
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: 0 }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={!isMobile || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "none",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",
          px: { xs: 2, md: 4 },
          pb: 4,
          pt: "100px",
          bgcolor: "#F3F6FB",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}