import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import axios from "axios";

export default function Proveedores() {
  const api = import.meta.env.VITE_BACKEND_URL;

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [proveedorId, setProveedorId] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    nit: "",
  });

  async function cargarProveedores() {
    try {
      setCargando(true);
      setError("");

      const response = await axios.get(`${api}/proveedores`);
      const data = response.data?.data ?? response.data;

      setProveedores(data?.rows ?? []);
    } catch (e) {
      console.error("Error al cargar proveedores:", e);
      setError("No se pudieron cargar los proveedores. Verifica el servidor.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProveedores();
  }, []);

  function cambiarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function abrirFormulario() {
    setProveedorId(null);
    setFormulario({
      nombre: "",
      direccion: "",
      telefono: "",
      nit: "",
    });
    setError("");
    setAbierto(true);
  }

  function editarProveedor(proveedor) {
    const id =
      proveedor.ID_PROVEEDOR ?? proveedor.id_proveedor;

    setProveedorId(id);
    setFormulario({
      nombre: proveedor.NOMBRE ?? proveedor.nombre ?? "",
      direccion: proveedor.DIRECCION ?? proveedor.direccion ?? "",
      telefono: proveedor.TELEFONO ?? proveedor.telefono ?? "",
      nit: proveedor.NIT ?? proveedor.nit ?? "",
    });
    setError("");
    setAbierto(true);
  }

  async function guardarProveedor(event) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datos = {
        nombre: formulario.nombre.trim(),
        direccion: formulario.direccion.trim(),
        telefono: formulario.telefono.trim(),
        nit: formulario.nit.trim() || null,
      };

      if (proveedorId !== null) {
        await axios.put(
          `${api}/proveedores/${proveedorId}`,
          datos
        );
      } else {
        await axios.post(`${api}/crear-proveedor`, datos);
      }

      setAbierto(false);
      setProveedorId(null);
      await cargarProveedores();
    } catch (e) {
      console.error("Error al guardar proveedor:", e);
      setError(
        e.response?.data?.mensaje ||
          "No se pudo guardar el proveedor. Verifica el backend y la base de datos."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Proveedores
          </Typography>
          <Typography color="text.secondary">
            Administra los proveedores de tu empresa.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirFormulario}
        >
          Nuevo proveedor
        </Button>
      </Box>

      {error && !abierto && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Dirección</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>NIT</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : proveedores.length > 0 ? (
              proveedores.map((proveedor, index) => (
                <TableRow
                  key={proveedor.ID_PROVEEDOR ?? proveedor.id_proveedor ?? index}
                  hover
                >
                  <TableCell>
                    {proveedor.ID_PROVEEDOR ?? proveedor.id_proveedor}
                  </TableCell>
                  <TableCell>
                    {proveedor.NOMBRE ?? proveedor.nombre}
                  </TableCell>
                  <TableCell>
                    {proveedor.DIRECCION ?? proveedor.direccion}
                  </TableCell>
                  <TableCell>
                    {proveedor.TELEFONO ?? proveedor.telefono}
                  </TableCell>
                  <TableCell>
                    {proveedor.NIT ?? proveedor.nit ?? "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditRoundedIcon />}
                      onClick={() => editarProveedor(proveedor)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay proveedores registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={abierto}
        onClose={() => !guardando && setAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={guardarProveedor}>
          <DialogTitle>
            {proveedorId !== null
              ? "Editar proveedor"
              : "Registrar proveedor"}
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Dirección"
              name="direccion"
              value={formulario.direccion}
              onChange={cambiarCampo}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Teléfono"
              name="telefono"
              value={formulario.telefono}
              onChange={cambiarCampo}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="NIT"
              name="nit"
              value={formulario.nit}
              onChange={cambiarCampo}
              fullWidth
              margin="normal"
            />

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : proveedorId !== null
                  ? "Actualizar proveedor"
                  : "Guardar proveedor"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}