
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
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
  SearchRounded,
  VisibilityRounded,
  RefreshRounded,
  ShoppingCartRounded,
  ReceiptLongRounded,
  CloseRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axios from "axios";
import useToast from "../commonts/useToast";

const api = import.meta.env.VITE_BACKEND_URL;

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor) || 0);

const formatoFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export default function HistorialCompras() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [cargando, setCargando] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Cargar historial
  const cargarHistorial = async () => {
    setCargando(true);

    try {
      const respuesta = await axios.get(
        `${api}/historial-compras`
      );

      const resultado = respuesta.data?.data || respuesta.data;

      if (resultado?.flag === false) {
        throw new Error(
          resultado.mensaje || "No se pudo cargar el historial."
        );
      }

      setCompras(Array.isArray(resultado?.data) ? resultado.data : []);
    } catch (error) {
      console.error("Error al cargar historial:", error);

      showToast(
        error.response?.data?.data?.mensaje ||
          error.message ||
          "No se pudo cargar el historial de compras.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Buscar y filtrar compras
  const comprasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return compras.filter((compra) => {
      const coincideBusqueda =
        !texto ||
        String(compra.ID_COMPRA ?? "").includes(texto) ||
        String(compra.PROVEEDOR ?? "").toLowerCase().includes(texto) ||
        String(compra.NUMERO_COMPROBANTE ?? "").toLowerCase().includes(texto) ||
        String(compra.SERIE ?? "").toLowerCase().includes(texto) ||
        String(compra.TIPO_COMPROBANTE ?? "").toLowerCase().includes(texto);

      const fecha = compra.FECHA
        ? new Date(compra.FECHA).getTime()
        : null;

      const inicio = fechaInicio
        ? new Date(`${fechaInicio}T00:00:00`).getTime()
        : null;

      const fin = fechaFin
        ? new Date(`${fechaFin}T23:59:59.999`).getTime()
        : null;

      const coincideFecha =
        fecha !== null &&
        (!inicio || fecha >= inicio) &&
        (!fin || fecha <= fin);

      return coincideBusqueda && coincideFecha;
    });
  }, [compras, busqueda, fechaInicio, fechaFin]);

  // Resumen
  const totalCompras = compras.length;

  const montoAcumulado = compras.reduce(
    (total, compra) => total + Number(compra.TOTAL || 0),
    0
  );

  // Consultar detalle de compra
  const verDetalle = async (compra) => {
    setCompraSeleccionada(compra);
    setDetalles([]);
    setModalAbierto(true);
    setCargandoDetalle(true);

    try {
      const respuesta = await axios.get(
        `${api}/detalle-compra/${compra.ID_COMPRA}`
      );

      const resultado = respuesta.data?.data || respuesta.data;

      if (resultado?.flag === false) {
        throw new Error(
          resultado.mensaje || "No se pudo consultar el detalle."
        );
      }

      setDetalles(Array.isArray(resultado?.data) ? resultado.data : []);
    } catch (error) {
      console.error("Error al consultar detalle:", error);

      showToast(
        error.response?.data?.data?.mensaje ||
          error.message ||
          "No se pudo consultar el detalle de la compra.",
        "error"
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaInicio("");
    setFechaFin("");
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: "#f5f7fb",
        minHeight: "100%",
      }}
    >
      {/* ENCABEZADO */}
    <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
    >
    <Box>
          <Typography variant="h5" fontWeight={800}>
            Historial de compras
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Consulta las compras registradas y sus respectivos detalles.
          </Typography>
    </Box>
    
    <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={() => navigate("/compras")}
        sx={{ ml: 2, whiteSpace: "nowrap" }}
    >
    Registrar compra
    </Button>
    
        <Button
          variant="outlined"
          startIcon={<RefreshRounded />}
          onClick={cargarHistorial}
          disabled={cargando}
          sx={{ textTransform: "none" }}
        >
          Actualizar
        </Button>
      </Stack>

      {/* TARJETAS DE RESUMEN */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  bgcolor: "#e8efff",
                  color: "#2563eb",
                  p: 1.2,
                  borderRadius: 2,
                }}
              >
                <ShoppingCartRounded />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total de compras
                </Typography>

                <Typography variant="h5" fontWeight={800}>
                  {totalCompras}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  bgcolor: "#e8f7ee",
                  color: "#15803d",
                  p: 1.2,
                  borderRadius: 2,
                }}
              >
                <ReceiptLongRounded />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Monto acumulado
                </Typography>

                <Typography variant="h5" fontWeight={800}>
                  {formatoMoneda(montoAcumulado)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* FILTROS */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid #e5e7eb",
          borderRadius: 2,
        }}
      >
        <Typography fontWeight={800} mb={1.5}>
          Buscar compras
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr 1fr auto",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Proveedor, compra o comprobante..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Desde"
            type="date"
            value={fechaInicio}
            onChange={(event) => setFechaInicio(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            size="small"
            label="Hasta"
            type="date"
            value={fechaFin}
            onChange={(event) => setFechaFin(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="outlined"
            onClick={limpiarFiltros}
            sx={{ textTransform: "none", height: 40 }}
          >
            Limpiar
          </Button>
        </Box>
      </Paper>

      {/* TABLA */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={800}>
            Compras registradas
          </Typography>

          <Chip
            label={`${comprasFiltradas.length} resultados`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Divider />

        {cargando ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Cargando historial...
            </Typography>
          </Box>
        ) : comprasFiltradas.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography fontSize={36}>📋</Typography>
            <Typography fontWeight={700} mt={1}>
              No se encontraron compras
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prueba modificando los filtros de búsqueda.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Compra</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Comprobante</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="center">
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {comprasFiltradas.map((compra) => (
                  <TableRow
                    key={compra.ID_COMPRA}
                    hover
                  >
                    <TableCell>
                      <Typography fontWeight={800}>
                        #{compra.ID_COMPRA}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatoFecha(compra.FECHA)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {compra.PROVEEDOR || "Sin proveedor"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {compra.TIPO_COMPROBANTE ? (
                        <Box>
                          <Chip
                            size="small"
                            label={compra.TIPO_COMPROBANTE}
                            variant="outlined"
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {compra.SERIE || "Sin serie"} -{" "}
                            {compra.NUMERO_COMPROBANTE || "Sin número"}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin comprobante
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={800} color="primary.main">
                        {formatoMoneda(compra.TOTAL)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityRounded />}
                        onClick={() => verDetalle(compra)}
                        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                      >
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* MODAL DETALLE */}
      <Dialog
        open={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setCompraSeleccionada(null);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Detalle de compra #{compraSeleccionada?.ID_COMPRA}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {compraSeleccionada?.PROVEEDOR}
              </Typography>
            </Box>

            <IconButton onClick={() => setModalAbierto(false)}>
              <CloseRounded />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {compraSeleccionada && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography fontWeight={700}>
                    {formatoFecha(compraSeleccionada.FECHA)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Comprobante
                  </Typography>
                  <Typography fontWeight={700}>
                    {compraSeleccionada.TIPO_COMPROBANTE || "Sin comprobante"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Número
                  </Typography>
                  <Typography fontWeight={700}>
                    {compraSeleccionada.SERIE || "-"} /{" "}
                    {compraSeleccionada.NUMERO_COMPROBANTE || "-"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {cargandoDetalle ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Cargando productos...
              </Typography>
            </Box>
          ) : detalles.length === 0 ? (
            <Alert severity="info">
              Esta compra no tiene productos registrados en el detalle.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Producto</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">
                      Cantidad
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Precio costo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {detalles.map((detalle) => (
                    <TableRow key={detalle.ID_DETALLE_COMPRA}>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {detalle.PRODUCTO}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Código: {detalle.ID_PRODUCTO}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {detalle.CANTIDAD}
                      </TableCell>

                      <TableCell align="right">
                        {formatoMoneda(detalle.PRECIO_COSTO)}
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          {formatoMoneda(detalle.SUBTOTAL)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight={700}>
              Total de la compra
            </Typography>

            <Typography variant="h6" fontWeight={900} color="primary.main">
              {formatoMoneda(compraSeleccionada?.TOTAL)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setModalAbierto(false)}
            sx={{ textTransform: "none" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
