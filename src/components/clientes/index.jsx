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
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

export default function Clientes() {
  const api = import.meta.env.VITE_BACKEND_URL;

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [clienteEditar, setClienteEditar] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    correo: "",
  });

  async function cargarClientes() {
    try {
      setCargando(true);
      setError("");

      const response = await axios.get(`${api}/clientes`);

      const data = response.data?.data ?? response.data;
      const rows = data?.rows ?? data?.data ?? [];

      setClientes(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error("Error al cargar clientes:", e);
      setError("No se pudieron cargar los clientes. Verifica el servidor.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function cambiarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function abrirFormulario() {
    setClienteEditar(null);

    setFormulario({
      nombre: "",
      direccion: "",
      telefono: "",
      correo: "",
    });

    setError("");
    setAbierto(true);
  }

  function abrirEdicion(cliente) {
    setClienteEditar(cliente);

    setFormulario({
      nombre: cliente.NOMBRE ?? cliente.nombre ?? "",
      direccion: cliente.DIRECCION ?? cliente.direccion ?? "",
      telefono: cliente.TELEFONO ?? cliente.telefono ?? "",
      correo: cliente.CORREO ?? cliente.correo ?? "",
    });

    setError("");
    setAbierto(true);
  }

  async function guardarCliente(event) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      const datos = {
        nombre: formulario.nombre.trim(),
        direccion: formulario.direccion.trim(),
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim() || null,
      };

      if (clienteEditar) {
        const id =
          clienteEditar.ID_CLIENTE ?? clienteEditar.id_cliente;

        await axios.put(`${api}/clientes/${id}`, datos);
      } else {
        await axios.post(`${api}/clientes`, datos);
      }

      setAbierto(false);
      setClienteEditar(null);

      await cargarClientes();
    } catch (e) {
      console.error("Error al guardar cliente:", e);

      setError(
        e.response?.data?.mensaje ||
          e.response?.data?.resp?.mensaje ||
          "No se pudo guardar el cliente. Verifica el backend."
      );
    } finally {
      setGuardando(false);
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();

    return (
      String(cliente.NOMBRE ?? cliente.nombre ?? "")
        .toLowerCase()
        .includes(texto) ||
      String(cliente.TELEFONO ?? cliente.telefono ?? "")
        .toLowerCase()
        .includes(texto) ||
      String(cliente.CORREO ?? cliente.correo ?? "")
        .toLowerCase()
        .includes(texto)
    );
  });

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
            Clientes
          </Typography>

          <Typography color="text.secondary">
            Administra los clientes de tu empresa.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirFormulario}
        >
          Nuevo cliente
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, teléfono o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: busqueda && (
              <InputAdornment position="end">
                <IconButton onClick={() => setBusqueda("")}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

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
              <TableCell><strong>Correo</strong></TableCell>
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
            ) : clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente, index) => (
                <TableRow
                  key={cliente.ID_CLIENTE ?? cliente.id_cliente ?? index}
                  hover
                >
                  <TableCell>
                    {cliente.ID_CLIENTE ?? cliente.id_cliente}
                  </TableCell>

                  <TableCell>
                    {cliente.NOMBRE ?? cliente.nombre}
                  </TableCell>

                  <TableCell>
                    {cliente.DIRECCION ?? cliente.direccion}
                  </TableCell>

                  <TableCell>
                    {cliente.TELEFONO ?? cliente.telefono}
                  </TableCell>

                  <TableCell>
                    {cliente.CORREO ?? cliente.correo ?? "—"}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Editar cliente">
                      <IconButton
                        color="primary"
                        onClick={() => abrirEdicion(cliente)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {busqueda
                    ? "No se encontraron clientes."
                    : "No hay clientes registrados."}
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
        <Box component="form" onSubmit={guardarCliente}>
          <DialogTitle>
            {clienteEditar ? "Editar cliente" : "Registrar cliente"}
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
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formulario.correo}
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
                : clienteEditar
                  ? "Actualizar cliente"
                  : "Guardar cliente"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}