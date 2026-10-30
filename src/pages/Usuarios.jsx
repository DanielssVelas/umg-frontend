import { useEffect, useState } from "react";
import axios from "axios";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    Add,
    Edit,
    Refresh,
    Search,
} from "@mui/icons-material";

// ==========================================
// CONFIGURACIÓN API
// ==========================================

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==========================================
// INTERCEPTOR JWT
// ==========================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("nexus_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// OBTENER DATOS DE RESPUESTA
// ==========================================

const obtenerDatos = (response) =>
    response?.data?.data ?? response?.data ?? {};

// ==========================================
// OBTENER CAMPOS
// ==========================================

const obtenerCampo = (objeto, ...campos) => {
    for (const campo of campos) {
        const valor =
            objeto?.[campo] ??
            objeto?.[campo.toLowerCase()];

        if (valor !== undefined && valor !== null) {
            return valor;
        }
    }

    return "";
};

// ==========================================
// COMPONENTE USUARIOS
// ==========================================

export default function Usuarios() {

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);

    const [formulario, setFormulario] = useState({
        usuario: "",
        password: "",
        id_rol: "",
        estado: "A",
    });

    const [guardando, setGuardando] = useState(false);

    const [notificacion, setNotificacion] = useState({
        open: false,
        mensaje: "",
        tipo: "success",
    });

    // ==========================================
    // NOTIFICACIONES
    // ==========================================

    const notificar = (mensaje, tipo = "success") => {
        setNotificacion({
            open: true,
            mensaje,
            tipo,
        });
    };

    // ==========================================
    // CARGAR USUARIOS Y ROLES
    // ==========================================

    const cargarDatos = async () => {

        setCargando(true);

        try {

            const [
                respuestaUsuarios,
                respuestaRoles,
            ] = await Promise.all([
                api.get("/usuarios"),
                api.get("/usuarios/roles"),
            ]);

            const datosUsuarios = obtenerDatos(respuestaUsuarios);
            const datosRoles = obtenerDatos(respuestaRoles);

            if (datosUsuarios.flag === false) {
                throw new Error(
                    datosUsuarios.mensaje ||
                    "No se pudieron cargar los usuarios"
                );
            }

            if (datosRoles.flag === false) {
                throw new Error(
                    datosRoles.mensaje ||
                    "No se pudieron cargar los roles"
                );
            }

            setUsuarios(datosUsuarios.rows ?? []);
            setRoles(datosRoles.rows ?? []);

        } catch (error) {

            console.error("Error cargando usuarios:", error);

            notificar(
                error.response?.data?.description ||
                error.response?.data?.data?.mensaje ||
                error.message ||
                "Error al conectar con el servidor",
                "error"
            );

        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // CARGA INICIAL
    // ==========================================

    useEffect(() => {
        cargarDatos();
    }, []);

    // ==========================================
    // ABRIR MODAL CREAR
    // ==========================================

    const abrirCrear = () => {

        setUsuarioEditar(null);

        setFormulario({
            usuario: "",
            password: "",
            id_rol: "",
            estado: "A",
        });

        setModalAbierto(true);
    };

    // ==========================================
    // ABRIR MODAL EDITAR
    // ==========================================

    const abrirEditar = (usuario) => {

        setUsuarioEditar(usuario);

        setFormulario({
            usuario: obtenerCampo(
                usuario,
                "USUARIO",
                "usuario"
            ),
            password: "",
            id_rol: String(
                obtenerCampo(
                    usuario,
                    "ID_ROL",
                    "id_rol"
                )
            ),
            estado:
                obtenerCampo(
                    usuario,
                    "ESTADO",
                    "estado"
                ) || "A",
        });

        setModalAbierto(true);
    };

    // ==========================================
    // CAMBIAR CAMPOS DEL FORMULARIO
    // ==========================================

    const cambiarCampo = (campo, valor) => {

        setFormulario((actual) => ({
            ...actual,
            [campo]: valor,
        }));
    };

    // ==========================================
    // GUARDAR USUARIO
    // ==========================================

    const guardarUsuario = async () => {

        if (
            !formulario.usuario.trim() ||
            !formulario.id_rol
        ) {
            notificar(
                "Completa el usuario y selecciona un rol",
                "warning"
            );
            return;
        }

        if (
            !usuarioEditar &&
            !formulario.password.trim()
        ) {
            notificar(
                "La contraseña es obligatoria para crear un usuario",
                "warning"
            );
            return;
        }

        setGuardando(true);

        try {

            const datos = {
                usuario: formulario.usuario.trim(),
                id_rol: formulario.id_rol,
                estado: formulario.estado,
            };

            if (formulario.password.trim()) {
                datos.password = formulario.password;
            }

            let respuesta;

            if (usuarioEditar) {

                const id = obtenerCampo(
                    usuarioEditar,
                    "ID_USUARIO",
                    "id_usuario",
                    "ID"
                );

                respuesta = await api.put(
                    `/usuarios/${id}`,
                    datos
                );

            } else {

                respuesta = await api.post(
                    "/usuarios",
                    datos
                );
            }

            const resultado = obtenerDatos(respuesta);

            if (resultado.flag === false) {
                throw new Error(
                    resultado.mensaje ||
                    "No se pudo guardar el usuario"
                );
            }

            notificar(
                resultado.mensaje ||
                (
                    usuarioEditar
                        ? "Usuario actualizado correctamente"
                        : "Usuario creado correctamente"
                )
            );

            setModalAbierto(false);

            await cargarDatos();

        } catch (error) {

            console.error("Error guardando usuario:", error);

            notificar(
                error.response?.data?.description ||
                error.response?.data?.data?.mensaje ||
                error.message ||
                "No se pudo guardar el usuario",
                "error"
            );

        } finally {
            setGuardando(false);
        }
    };

    // ==========================================
    // FILTRAR USUARIOS
    // ==========================================

    const usuariosFiltrados = usuarios.filter((usuario) => {

        const nombre = String(
            obtenerCampo(
                usuario,
                "USUARIO",
                "usuario"
            )
        ).toLowerCase();

        const rol = String(
            obtenerCampo(
                usuario,
                "ROL",
                "NOMBRE_ROL",
                "nombre_rol"
            )
        ).toLowerCase();

        const texto = busqueda.toLowerCase();

        return (
            nombre.includes(texto) ||
            rol.includes(texto)
        );
    });

    // ==========================================
    // RENDERIZADO
    // ==========================================

    return (

        <Box>

            {/* ENCABEZADO COMPACTO */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 2,
                    width: "100%",
                    flexWrap: "nowrap",
                }}
            >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        lineHeight={1.2}
                        noWrap
                    >
                        Usuarios
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                    >
                        Administración de usuarios y permisos · NEXUS
                    </Typography>
                </Box>

                <Button
                    size="medium"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={abrirCrear}
                    sx={{ flexShrink: 0 }}
                >
                    Crear usuario
                </Button>
            </Box>

            {/* BARRA DE BÚSQUEDA / RESUMEN */}

            <Paper
                variant="outlined"
                sx={{
                    p: 1,
                    mb: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >

                <TextField
                    size="small"
                    fullWidth
                    placeholder="Buscar por usuario o rol..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                <Chip
                    size="small"
                    variant="outlined"
                    label={`${usuariosFiltrados.length} de ${usuarios.length}`}
                />

                <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label={`Activos: ${
                        usuarios.filter(
                            (u) =>
                                obtenerCampo(u, "ESTADO", "estado") === "A"
                        ).length
                    }`}
                />

                <Chip
                    size="small"
                    variant="outlined"
                    label={`Roles: ${roles.length}`}
                />

            </Paper>

            {/* TABLA DE USUARIOS */}

            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2 }}
            >

                <Table size="small">

                    <TableHead>

                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>

                            <TableCell>Usuario</TableCell>

                            <TableCell>Rol</TableCell>

                            <TableCell>Estado</TableCell>

                            <TableCell align="right" width={100}>
                                Acciones
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {cargando ? (

                            <TableRow>

                                <TableCell
                                    colSpan={4}
                                    align="center"
                                    sx={{ py: 4 }}
                                >

                                    <CircularProgress size={24} />

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1 }}
                                        color="text.secondary"
                                    >
                                        Cargando usuarios...
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : usuariosFiltrados.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={4}
                                    align="center"
                                    sx={{ py: 4 }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No se encontraron usuarios.
                                    </Typography>
                                </TableCell>

                            </TableRow>

                        ) : (

                            usuariosFiltrados.map((usuario, index) => {

                                const nombre = obtenerCampo(
                                    usuario,
                                    "USUARIO",
                                    "usuario"
                                );

                                const rol = obtenerCampo(
                                    usuario,
                                    "ROL",
                                    "NOMBRE_ROL",
                                    "nombre_rol"
                                );

                                const estado = obtenerCampo(
                                    usuario,
                                    "ESTADO",
                                    "estado"
                                );

                                return (

                                    <TableRow
                                        key={
                                            obtenerCampo(
                                                usuario,
                                                "ID_USUARIO",
                                                "id_usuario"
                                            ) || index
                                        }
                                        hover
                                    >

                                        <TableCell>

                                            <Typography variant="body2" fontWeight="medium">
                                                {nombre}
                                            </Typography>

                                        </TableCell>

                                        <TableCell>

                                            <Chip
                                                label={rol || "Sin rol"}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: "0.75rem" }}
                                            />

                                        </TableCell>

                                        <TableCell>

                                            <Chip
                                                label={
                                                    estado === "A"
                                                        ? "Activo"
                                                        : "Inactivo"
                                                }
                                                color={
                                                    estado === "A"
                                                        ? "success"
                                                        : "default"
                                                }
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: "0.75rem" }}
                                            />

                                        </TableCell>

                                        <TableCell align="right">

                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => abrirEditar(usuario)}
                                                title="Editar usuario"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>

                                        </TableCell>

                                    </TableRow>

                                );
                            })
                        )}

                    </TableBody>

                </Table>

            </TableContainer>

            {/* MODAL CREAR / EDITAR */}

            <Dialog
                open={modalAbierto}
                onClose={() =>
                    !guardando && setModalAbierto(false)
                }
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle fontWeight="bold" fontSize="1.05rem">

                    {usuarioEditar
                        ? "Editar usuario"
                        : "Crear usuario"
                    }

                </DialogTitle>

                <DialogContent>

                    <Stack spacing={2} sx={{ mt: 1 }}>

                        <TextField
                            size="small"
                            label="Nombre de usuario"
                            fullWidth
                            value={formulario.usuario}
                            onChange={(e) =>
                                cambiarCampo(
                                    "usuario",
                                    e.target.value
                                )
                            }
                        />

                        <TextField
                            size="small"
                            label={
                                usuarioEditar
                                    ? "Nueva contraseña (opcional)"
                                    : "Contraseña"
                            }
                            type="password"
                            fullWidth
                            value={formulario.password}
                            onChange={(e) =>
                                cambiarCampo(
                                    "password",
                                    e.target.value
                                )
                            }
                            autoComplete="new-password"
                            helperText={
                                usuarioEditar
                                    ? "Déjala vacía si no deseas cambiarla."
                                    : "Establece la contraseña del nuevo usuario."
                            }
                        />

                        <FormControl fullWidth size="small">

                            <InputLabel>Rol</InputLabel>

                            <Select
                                label="Rol"
                                value={formulario.id_rol}
                                onChange={(e) =>
                                    cambiarCampo(
                                        "id_rol",
                                        e.target.value
                                    )
                                }
                            >

                                {roles.map((rol, index) => {

                                    const id = obtenerCampo(
                                        rol,
                                        "ID_ROL",
                                        "id_rol"
                                    );

                                    const nombre = obtenerCampo(
                                        rol,
                                        "NOMBRE",
                                        "ROL",
                                        "nombre"
                                    );

                                    return (

                                        <MenuItem
                                            key={id || index}
                                            value={String(id)}
                                        >
                                            {nombre}
                                        </MenuItem>

                                    );
                                })}

                            </Select>

                        </FormControl>

                        <FormControl fullWidth size="small">

                            <InputLabel>Estado</InputLabel>

                            <Select
                                label="Estado"
                                value={formulario.estado}
                                onChange={(e) =>
                                    cambiarCampo(
                                        "estado",
                                        e.target.value
                                    )
                                }
                            >

                                <MenuItem value="A">
                                    Activo
                                </MenuItem>

                                <MenuItem value="I">
                                    Inactivo
                                </MenuItem>

                            </Select>

                        </FormControl>

                    </Stack>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>

                    <Button
                        size="small"
                        onClick={() => setModalAbierto(false)}
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        size="small"
                        variant="contained"
                        onClick={guardarUsuario}
                        disabled={guardando}
                    >

                        {guardando ? (

                            <CircularProgress
                                size={18}
                                color="inherit"
                            />

                        ) : usuarioEditar ? (

                            "Guardar cambios"

                        ) : (

                            "Crear usuario"

                        )}

                    </Button>

                </DialogActions>

            </Dialog>

            {/* NOTIFICACIONES */}

            <Snackbar
                open={notificacion.open}
                autoHideDuration={4000}
                onClose={() =>
                    setNotificacion((actual) => ({
                        ...actual,
                        open: false,
                    }))
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >

                <Alert
                    severity={notificacion.tipo}
                    variant="filled"
                    onClose={() =>
                        setNotificacion((actual) => ({
                            ...actual,
                            open: false,
                        }))
                    }
                >
                    {notificacion.mensaje}
                </Alert>

            </Snackbar>

        </Box>
    );
}