import { useEffect, useState } from "react";
import api from "../services/api";

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
  Grid,
  IconButton,
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
  PeopleAlt,
  Search,
} from "@mui/icons-material";

const obtenerDatos = (response) =>
  response?.data?.data ?? response?.data ?? {};

const obtenerCampo = (objeto, ...campos) => {
  for (const campo of campos) {
    const valor = objeto?.[campo] ?? objeto?.[campo.toLowerCase()];
    if (valor !== undefined && valor !== null) return valor;
  }
  return "";
};

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

  const notificar = (mensaje, tipo = "success") => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const [respuestaUsuarios, respuestaRoles] = await Promise.all([
        api.get("/usuarios"),
        api.get("/usuarios/roles"),
      ]);

      const datosUsuarios = obtenerDatos(respuestaUsuarios);
      const datosRoles = obtenerDatos(respuestaRoles);

      if (datosUsuarios.flag === false) {
        throw new Error(datosUsuarios.mensaje || "No se pudieron cargar los usuarios");
      }

      if (datosRoles.flag === false) {
        throw new Error(datosRoles.mensaje || "No se pudieron cargar los roles");
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

  useEffect(() => {
    cargarDatos();
  }, []);

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

  const abrirEditar = (usuario) => {
    setUsuarioEditar(usuario);

    setFormulario({
      usuario: obtenerCampo(usuario, "USUARIO", "usuario"),
      password: "",
      id_rol: String(obtenerCampo(usuario, "ID_ROL", "id_rol")),
      estado: obtenerCampo(usuario, "ESTADO", "estado") || "A",
    });

    setModalAbierto(true);
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardarUsuario = async () => {
    if (!formulario.usuario.trim() || !formulario.id_rol) {
      notificar("Completa el usuario y selecciona un rol", "warning");
      return;
    }

    if (!usuarioEditar && !formulario.password.trim()) {
      notificar("La contraseña es obligatoria para crear un usuario", "warning");
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

        respuesta = await api.put(`/usuarios/${id}`, datos);
      } else {
        respuesta = await api.post("/usuarios", datos);
      }

      const resultado = obtenerDatos(respuesta);

      if (resultado.flag === false) {
        throw new Error(resultado.mensaje || "No se pudo guardar el usuario");
      }

      notificar(
        resultado.mensaje ||
          (usuarioEditar
            ? "Usuario actualizado correctamente"
            : "Usuario creado correctamente")
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

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nombre = String(
      obtenerCampo(usuario, "USUARIO", "usuario")
    ).toLowerCase();

    const rol = String(
      obtenerCampo(usuario, "ROL", "NOMBRE_ROL", "nombre_rol")
    ).toLowerCase();

    const texto = busqueda.toLowerCase();

    return nombre.includes(texto) || rol.includes(texto);
  });

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Usuarios
          </Typography>
          <Typography color="text.secondary">
            Administración de usuarios y permisos del sistema NEXUS
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarDatos}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={abrirCrear}
          >
            Crear usuario
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PeopleAlt color="primary" fontSize="large" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Usuarios registrados
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {usuarios.length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography color="text.secondary" variant="body2">
              Usuarios activos
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {
                usuarios.filter(
                  (u) => obtenerCampo(u, "ESTADO", "estado") === "A"
                ).length
              }
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography color="text.secondary" variant="body2">
              Roles disponibles
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {roles.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por usuario o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    Cargando usuarios...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : usuariosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados.map((usuario, index) => {
                const nombre = obtenerCampo(usuario, "USUARIO", "usuario");
                const rol = obtenerCampo(
                  usuario,
                  "ROL",
                  "NOMBRE_ROL",
                  "nombre_rol"
                );
                const estado = obtenerCampo(usuario, "ESTADO", "estado");

                return (
                  <TableRow key={
                    obtenerCampo(usuario, "ID_USUARIO", "id_usuario") || index
                  } hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {nombre}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={rol || "Sin rol"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={estado === "A" ? "Activo" : "Inactivo"}
                        color={estado === "A" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => abrirEditar(usuario)}
                        title="Editar usuario"
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={modalAbierto}
        onClose={() => !guardando && setModalAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight="bold">
          {usuarioEditar ? "Editar usuario" : "Crear usuario"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Nombre de usuario"
              fullWidth
              value={formulario.usuario}
              onChange={(e) => cambiarCampo("usuario", e.target.value)}
            />

            <TextField
              label={
                usuarioEditar
                  ? "Nueva contraseña (opcional)"
                  : "Contraseña"
              }
              type="password"
              fullWidth
              value={formulario.password}
              onChange={(e) => cambiarCampo("password", e.target.value)}
              autoComplete="new-password"
              helperText={
                usuarioEditar
                  ? "Déjala vacía si no deseas cambiarla."
                  : "Establece la contraseña del nuevo usuario."
              }
            />

            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formulario.id_rol}
                label="Rol"
                onChange={(e) => cambiarCampo("id_rol", e.target.value)}
              >
                {roles.map((rol, index) => {
                  const id = obtenerCampo(rol, "ID_ROL", "id_rol");
                  const nombre = obtenerCampo(
                    rol,
                    "NOMBRE",
                    "ROL",
                    "nombre"
                  );

                  return (
                    <MenuItem key={id || index} value={String(id)}>
                      {nombre}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formulario.estado}
                label="Estado"
                onChange={(e) => cambiarCampo("estado", e.target.value)}
              >
                <MenuItem value="A">Activo</MenuItem>
                <MenuItem value="I">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setModalAbierto(false)}
            disabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarUsuario}
            disabled={guardando}
          >
            {guardando ? (
              <CircularProgress size={22} color="inherit" />
            ) : usuarioEditar ? (
              "Guardar cambios"
            ) : (
              "Crear usuario"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotificacion((actual) => ({ ...actual, open: false }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notificacion.tipo}
          variant="filled"
          onClose={() =>
            setNotificacion((actual) => ({ ...actual, open: false }))
          }
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}