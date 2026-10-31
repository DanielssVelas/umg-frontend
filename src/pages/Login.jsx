
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    Layers,
    LockOutlined,
    Visibility,
    VisibilityOff,
    // PersonOutline,
} from "@mui/icons-material";

import { useAuth } from "../auth/AuthContext";

const Login = () => {
    const navigate = useNavigate();

    const { login, isAuthenticated } = useAuth();

    const [form, setForm] = useState({
        usuario: "",
        password: "",
    });

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.usuario.trim() || !form.password) {
            setError("Ingresa tu usuario y contraseña.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await login(form);

            navigate("/dashboard", {
                replace: true,
            });

        } catch (err) {
            setError(
                err.response?.data?.mensaje ||
                err.message ||
                "No fue posible iniciar sesión."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f1f5f9",
                p: 2,
            }}
        >
            <Card
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 12px 35px rgba(15,23,42,0.07)",
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {/* LOGO */}

                    <Stack
                        alignItems="center"
                        spacing={1.5}
                        mb={4}
                    >
                        <Box
                            sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 2.5,
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Layers sx={{ fontSize: 32 }} />
                        </Box>

                        <Typography
                            variant="h5"
                            fontWeight={800}
                            color="#172033"
                            letterSpacing={-0.5}
                        >
                            NEXUS
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            ADMINISTRATION
                        </Typography>
                    </Stack>

                    {/* FORMULARIO */}

                    <Box mb={3}>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#172033"
                        >
                            Bienvenido
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            Ingresa tus credenciales para acceder al sistema.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Stack spacing={2.5}>
                            <TextField
                                label="Usuario"
                                name="usuario"
                                value={form.usuario}
                                onChange={handleChange}
                                fullWidth
                                autoComplete="username"
                                autoFocus
                                size="medium"
                                placeholder="Ingresa tu usuario"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {/* <PersonOutline
                                                    color="action"
                                                /> */}
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="Contraseña"
                                name="password"
                                type={
                                    mostrarPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.password}
                                onChange={handleChange}
                                fullWidth
                                autoComplete="current-password"
                                placeholder="Ingresa tu contraseña"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined
                                                    color="action"
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setMostrarPassword(
                                                            !mostrarPassword
                                                        )
                                                    }
                                                    edge="end"
                                                    aria-label="Mostrar contraseña"
                                                >
                                                    {mostrarPassword
                                                        ? <VisibilityOff />
                                                        : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.4,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: 15,
                                    backgroundColor: "#2563eb",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "#1d4ed8",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={23}
                                        color="inherit"
                                    />
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </Button>
                        </Stack>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                        display="block"
                        mt={4}
                    >
                        NEXUS Administration · Sistema de gestión
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
