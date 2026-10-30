
import { useState, useEffect } from "react";
import axios from "axios";

import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
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
    Tooltip,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    Dialog,
    DialogContent,
    DialogActions,
    Stack,
} from "@mui/material";

// ICONOS
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";

// AUTENTICACIÓN
import { useAuth } from "../auth/AuthContext";

// ==========================================
// CONFIGURACIÓN
// ==========================================

const drawerWidth = 260;

const iconMap = {
    Inventory2Rounded: <Inventory2RoundedIcon />,
    PointOfSaleRounded: <PointOfSaleRoundedIcon />,
    AccountBalanceWalletRounded: <AccountBalanceWalletRoundedIcon />,
    LocalShippingRounded: <LocalShippingRoundedIcon />,
    PeopleAltRounded: <PeopleAltRoundedIcon />,
    ShoppingCartRounded: <ShoppingCartRoundedIcon />,
    RequestQuoteRounded: <RequestQuoteRoundedIcon />,
    SettingsRounded: <SettingsRoundedIcon />,
};

const obtenerIniciales = (nombre = "") => {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return "U";

    return partes
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join("");
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function MainLayout() {

    const [menuItems, setMenuItems] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(true);

    useEffect(() => {
        const obtenerModulos = async () => {
            try {
                const token = localStorage.getItem("nexus_token");
                const logerUser = JSON.parse(localStorage.getItem("nexus_usuario"));

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/modulos/${logerUser.idRol}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const rows = response.data?.data?.rows ?? response.data?.rows ?? [];

                setMenuItems(
                    rows
                        .filter((modulo) => modulo.ESTADO === "A")
                        .map((modulo) => ({
                            id: modulo.ID_MODULO,
                            label: modulo.NOMBRE,
                            path: modulo.RUTA,
                            icon: iconMap[modulo.ICONO] || <LayersRoundedIcon />,
                        }))
                );
            } catch (error) {
                console.error("Error obteniendo módulos:", error);
            } finally {
                setLoadingMenu(false);
            }
        };

        obtenerModulos();
    }, []);

    const [mobileOpen, setMobileOpen] = useState(false);

    // ESTADOS DEL PERFIL
    const [anchorPerfil, setAnchorPerfil] = useState(null);
    const [confirmarLogout, setConfirmarLogout] = useState(false);

    const perfilAbierto = Boolean(anchorPerfil);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const location = useLocation();
    const navigate = useNavigate();

    // ==========================================
    // AUTENTICACIÓN
    // ==========================================

    const { usuario, logout } = useAuth();

    const nombreUsuario =
        usuario?.nombre ||
        usuario?.usuario ||
        "Usuario";

    const correoUsuario =
        usuario?.correo ||
        usuario?.email ||
        "";

    const iniciales = obtenerIniciales(nombreUsuario);

    // ==========================================
    // PÁGINA ACTUAL
    // ==========================================

    const currentPage =
        menuItems.find(
            (item) =>
                item.path === location.pathname
        )?.label ??
        (
            location.pathname.startsWith("/configuracion")
                ? "Configuración"
                : "NEXUS Administration"
        );

    // ==========================================
    // NAVEGACIÓN
    // ==========================================

    const goTo = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    // ==========================================
    // MENÚ DE PERFIL
    // ==========================================

    const handleAbrirPerfil = (event) => {
        setAnchorPerfil(event.currentTarget);
    };

    const handleCerrarPerfil = () => {
        setAnchorPerfil(null);
    };

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    const handleLogout = () => {
        handleCerrarPerfil();
        setConfirmarLogout(false);

        logout();

        navigate("/login", {
            replace: true,
        });
    };

    // ==========================================
    // CONTENIDO DEL SIDEBAR
    // ==========================================

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
                    px: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexShrink: 0,
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
                        flexShrink: 0,
                    }}
                >
                    <LayersRoundedIcon
                        sx={{
                            color: "white",
                            fontSize: 25,
                        }}
                    />
                </Box>

                <Box>
                    <Typography
                        fontSize={19}
                        fontWeight={800}
                        letterSpacing={1}
                    >
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

            <Divider
                sx={{
                    borderColor: "#273244",
                }}
            />

            {/* NAVEGACIÓN */}

            <Box
                sx={{
                    px: 1.5,
                    pt: 3,
                    flex: 1,
                }}
            >
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

                                    color: selected
                                        ? "#FFFFFF"
                                        : "#9CA3AF",

                                    transition: "all .2s ease",

                                    "& .MuiListItemIcon-root": {
                                        minWidth: 38,
                                        color: "inherit",
                                    },

                                    "&.Mui-selected": {
                                        bgcolor: "#2563EB",
                                        boxShadow:
                                            "0 5px 15px rgba(37,99,235,.2)",
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
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>

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

                <ListItemButton
                    onClick={() => goTo("/configuracion")}
                    selected={location.pathname.startsWith("/configuracion")}
                    sx={{
                        minHeight: 48,
                        px: 1.5,
                        borderRadius: 2,
                        color: "#9CA3AF",

                        "& .MuiListItemIcon-root": {
                            minWidth: 38,
                            color: "inherit",
                        },

                        "&.Mui-selected": {
                            bgcolor: "#2563EB",
                            color: "#FFFFFF",
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
                        primaryTypographyProps={{
                            fontSize: 13,
                        }}
                    />
                </ListItemButton>
            </Box>

            {/* PERFIL INFERIOR */}

            <Box sx={{ p: 2 }}>
                <Divider
                    sx={{
                        mb: 2,
                        borderColor: "#273244",
                    }}
                />

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
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
                            fontSize: 13,
                        }}
                    >
                        {iniciales}
                    </Avatar>

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            fontSize={13}
                            fontWeight={600}
                            noWrap
                        >
                            {nombreUsuario}
                        </Typography>

                        <Typography
                            fontSize={11}
                            color="#9CA3AF"
                            noWrap
                        >
                            {correoUsuario || usuario?.rol || "Usuario del sistema"}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                bgcolor: "#F3F6FB",
            }}
        >
            {/* ==================================
                BARRA SUPERIOR
            ================================== */}

            <AppBar
                position="fixed"
                elevation={0}
                color="inherit"
                sx={{
                    width: {
                        md: `calc(100% - ${drawerWidth}px)`,
                    },

                    ml: {
                        md: `${drawerWidth}px`,
                    },

                    bgcolor: "rgba(255,255,255,.95)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #E5E7EB",
                    color: "#111827",
                    zIndex: (t) => t.zIndex.drawer + 1,
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: "76px !important",
                        px: { xs: 2, md: 3 },
                    }}
                >
                    {/* BOTÓN MÓVIL */}

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

                    {/* TÍTULO */}

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            fontSize={14}
                            fontWeight={600}
                            color="#172033"
                        >
                            {currentPage}
                        </Typography>

                        <Typography
                            fontSize={11}
                            color="text.secondary"
                        >
                            NEXUS Administration
                        </Typography>
                    </Box>

                    {/* BUSCADOR */}

                    <Box
                        sx={{
                            display: {
                                xs: "none",
                                sm: "flex",
                            },
                            alignItems: "center",
                            bgcolor: "#F3F4F6",
                            border: "1px solid #E5E7EB",
                            borderRadius: 2,
                            px: 1.5,
                            mr: 2,
                            width: {
                                sm: 190,
                                md: 245,
                            },
                        }}
                    >
                        <SearchRoundedIcon
                            sx={{
                                color: "#9CA3AF",
                                fontSize: 21,
                            }}
                        />

                        <InputBase
                            placeholder="Buscar..."
                            sx={{
                                ml: 1,
                                flex: 1,
                                fontSize: 13,
                                py: 0.5,
                            }}
                            inputProps={{
                                "aria-label": "Buscar",
                            }}
                        />
                    </Box>

                    {/* NOTIFICACIONES */}

                    <Tooltip title="Notificaciones">
                        <IconButton
                            aria-label="Notificaciones"
                            sx={{
                                mr: 1,
                                color: "#64748B",
                            }}
                        >
                            <Badge
                                variant="dot"
                                color="error"
                            >
                                <NotificationsNoneRoundedIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* PERFIL Y MENÚ DE USUARIO */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: 1,
                            pl: 1.5,
                            borderLeft: "1px solid #E5E7EB",
                        }}
                    >
                        <Button
                            onClick={handleAbrirPerfil}
                            endIcon={
                                <KeyboardArrowDownRoundedIcon
                                    sx={{
                                        fontSize: 19,
                                        transform: perfilAbierto
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform .2s",
                                    }}
                                />
                            }
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                textTransform: "none",
                                color: "#172033",
                                borderRadius: 2,
                                px: 1,
                                py: 0.7,

                                "&:hover": {
                                    bgcolor: "#F1F5F9",
                                },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: "#DBEAFE",
                                    color: "#1D4ED8",
                                    fontWeight: 700,
                                    fontSize: 13,
                                }}
                            >
                                {iniciales}
                            </Avatar>

                            <Box
                                sx={{
                                    display: {
                                        xs: "none",
                                        sm: "block",
                                    },
                                    textAlign: "left",
                                    maxWidth: 145,
                                }}
                            >
                                <Typography
                                    fontSize={12}
                                    fontWeight={700}
                                    noWrap
                                >
                                    {nombreUsuario}
                                </Typography>

                                <Typography
                                    fontSize={10}
                                    color="text.secondary"
                                    noWrap
                                >
                                    {usuario?.rol || "Usuario"}
                                </Typography>
                            </Box>
                        </Button>

                        {/* MENÚ DESPLEGABLE */}

                        <Menu
                            anchorEl={anchorPerfil}
                            open={perfilAbierto}
                            onClose={handleCerrarPerfil}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        mt: 1.5,
                                        width: 245,
                                        borderRadius: 2.5,
                                        border: "1px solid #E5E7EB",
                                        boxShadow:
                                            "0 12px 35px rgba(15,23,42,.12)",
                                        overflow: "hidden",
                                    },
                                },
                            }}
                        >
                            {/* INFORMACIÓN DEL USUARIO */}

                            <Box sx={{ px: 2, py: 1.8 }}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.3}
                                >
                                    <Avatar
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            bgcolor: "#DBEAFE",
                                            color: "#1D4ED8",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {iniciales}
                                    </Avatar>

                                    <Box minWidth={0}>
                                        <Typography
                                            fontWeight={700}
                                            fontSize={13}
                                            noWrap
                                        >
                                            {nombreUsuario}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            fontSize={11}
                                            noWrap
                                        >
                                            {correoUsuario || usuario?.rol || "Usuario del sistema"}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Divider />

                            {/* MI CUENTA */}

                            <MenuItem
                                onClick={handleCerrarPerfil}
                                sx={{
                                    py: 1.2,
                                    fontSize: 13,
                                }}
                            >
                                <ListItemIcon>
                                    <PersonOutlineRoundedIcon fontSize="small" />
                                </ListItemIcon>

                                Mi cuenta
                            </MenuItem>

                            <Divider />

                            {/* CERRAR SESIÓN */}

                            <MenuItem
                                onClick={() => {
                                    handleCerrarPerfil();
                                    setConfirmarLogout(true);
                                }}
                                sx={{
                                    py: 1.2,
                                    color: "#DC2626",
                                    fontSize: 13,
                                    fontWeight: 600,

                                    "&:hover": {
                                        bgcolor: "#FEF2F2",
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <LogoutRoundedIcon
                                        fontSize="small"
                                        sx={{ color: "#DC2626" }}
                                    />
                                </ListItemIcon>

                                Cerrar sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ==================================
                SIDEBAR
            ================================== */}

            <Box
                component="nav"
                sx={{
                    width: {
                        md: drawerWidth,
                    },
                    flexShrink: 0,
                }}
            >
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={!isMobile || mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{
                        keepMounted: true,
                    }}
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

            {/* ==================================
                CONTENIDO PRINCIPAL
            ================================== */}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: 0,
                    minWidth: 0,
                    minHeight: "100vh",
                    overflowX: "hidden",
                    px: {
                        xs: 1.5,
                        sm: 2,
                        md: 3,
                    },
                    pb: 4,
                    pt: "100px",
                    bgcolor: "#F3F6FB",
                }}
            >
                <Outlet />
            </Box>

            {/* ==================================
                CONFIRMAR CIERRE DE SESIÓN
            ================================== */}

            <Dialog
                open={confirmarLogout}
                onClose={() => setConfirmarLogout(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                    },
                }}
            >
                <DialogContent
                    sx={{
                        pt: 3,
                        textAlign: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            borderRadius: "50%",
                            bgcolor: "#FEF2F2",
                            color: "#DC2626",
                            display: "grid",
                            placeItems: "center",
                            mx: "auto",
                            mb: 2,
                        }}
                    >
                        <LogoutRoundedIcon
                            sx={{ fontSize: 28 }}
                        />
                    </Box>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        color="#172033"
                    >
                        ¿Cerrar sesión?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        ¿Estás seguro de que deseas salir de NEXUS Administration?
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        justifyContent: "center",
                        gap: 1,
                        px: 3,
                        pb: 2,
                    }}
                >
                    <Button
                        onClick={() => setConfirmarLogout(false)}
                        variant="outlined"
                        size="medium"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2.5,
                            borderColor: "#D1D5DB",
                            color: "#475569",
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="error"
                        size="medium"
                        startIcon={<LogoutRoundedIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2.5,
                            boxShadow: "none",
                        }}
                    >
                        Cerrar sesión
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
