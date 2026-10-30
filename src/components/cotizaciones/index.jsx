
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor || 0));

const formatoFecha = (fecha) => {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Guatemala",
  }).format(new Date(fecha));
};

const coloresEstado = {
  PENDIENTE: { bg: "#FEF3C7", color: "#92400E" },
  ACEPTADA: { bg: "#DCFCE7", color: "#166534" },
  RECHAZADA: { bg: "#FEE2E2", color: "#991B1B" },
  VENCIDA: { bg: "#E5E7EB", color: "#374151" },
};

export default function Cotizaciones() {
  const navigate = useNavigate();

  const [cotizaciones, setCotizaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("No está configurada la variable VITE_BACKEND_URL.");
      }

      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/historial-cotizaciones`
      );

      if (!response.ok) {
        throw new Error("No se pudo consultar el historial.");
      }

      const resultado = await response.json();

      if (!resultado.result || !resultado.data?.flag) {
        throw new Error(
          resultado.data?.mensaje || "Error al cargar las cotizaciones."
        );
      }

      setCotizaciones(resultado.data.data || []);
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter((cotizacion) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        String(cotizacion.ID_COTIZACION).includes(texto) ||
        String(cotizacion.CLIENTE || "").toLowerCase().includes(texto);

      const coincideEstado =
        estadoFiltro === "TODOS" ||
        cotizacion.ESTADO === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }, [cotizaciones, busqueda, estadoFiltro]);

  const abrirDetalle = async (cotizacion) => {
    try {
      setCotizacionSeleccionada(cotizacion);
      setDetalle([]);
      setDetalleAbierto(true);
      setLoadingDetalle(true);

      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/detalle-cotizacion/${cotizacion.ID_COTIZACION}`
      );

      if (!response.ok) {
        throw new Error("No se pudo consultar el detalle.");
      }

      const resultado = await response.json();

      if (!resultado.result || !resultado.data?.flag) {
        throw new Error("Error al consultar los productos.");
      }

      setDetalle(resultado.data.data || []);
    } catch (err) {
      setError(err.message || "Error al consultar el detalle.");
      setDetalleAbierto(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const totalCotizaciones = cotizaciones.length;

  const totalPendientes = cotizaciones.filter(
    (item) => item.ESTADO === "PENDIENTE"
  ).length;

  const totalAceptadas = cotizaciones.filter(
    (item) => item.ESTADO === "ACEPTADA"
  ).length;

  return (
    <Box>
      {/* ENCABEZADO */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="#111827"
            sx={{ fontSize: { xs: 23, md: 28 } }}
          >
            Cotizaciones
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Administra y consulta las cotizaciones de tus clientes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate("/cotizaciones/nueva")}
          sx={{
            bgcolor: "#2563EB",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
          }}
        >
          Nueva cotización
        </Button>
      </Box>

      {/* MENSAJE DE ERROR */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* TARJETAS RESUMEN */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            titulo: "Total cotizaciones",
            valor: totalCotizaciones,
            color: "#2563EB",
            icono: <RequestQuoteRoundedIcon />,
          },
          {
            titulo: "Pendientes",
            valor: totalPendientes,
            color: "#D97706",
            icono: <RefreshRoundedIcon />,
          },
          {
            titulo: "Aceptadas",
            valor: totalAceptadas,
            color: "#16A34A",
            icono: <RequestQuoteRoundedIcon />,
          },
        ].map((item) => (
          <Paper
            key={item.titulo}
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography color="text.secondary" fontSize={12}>
                {item.titulo}
              </Typography>
              <Typography
                fontSize={27}
                fontWeight={800}
                color="#111827"
                mt={0.5}
              >
                {item.valor}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: `${item.color}15`,
                color: item.color,
                display: "grid",
                placeItems: "center",
              }}
            >
              {item.icono}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* TABLA */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography fontWeight={800} fontSize={16}>
              Historial de cotizaciones
            </Typography>
            <Typography color="text.secondary" fontSize={12}>
              Consulta y administra tus documentos.
            </Typography>
          </Box>

          <IconButton
            onClick={cargarCotizaciones}
            disabled={loading}
            title="Actualizar historial"
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* BUSCADOR Y FILTROS */}
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 170 }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="ACEPTADA">Aceptadas</option>
            <option value="RECHAZADA">Rechazadas</option>
            <option value="VENCIDA">Vencidas</option>
          </TextField>
        </Box>

        {/* CONTENIDO */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary" mt={2} fontSize={13}>
              Cargando cotizaciones...
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  {[
                    "N.º",
                    "Cliente",
                    "Fecha",
                    "Vencimiento",
                    "Total",
                    "Estado",
                    "Acciones",
                  ].map((titulo) => (
                    <TableCell
                      key={titulo}
                      sx={{
                        fontWeight: 800,
                        fontSize: 11,
                        color: "#64748B",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {titulo}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {cotizacionesFiltradas.map((item) => {
                  const estado = item.ESTADO || "PENDIENTE";
                  const estilo =
                    coloresEstado[estado] || coloresEstado.PENDIENTE;

                  return (
                    <TableRow
                      key={item.ID_COTIZACION}
                      hover
                    >
                      <TableCell fontWeight={700}>
                        #{item.ID_COTIZACION}
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600} fontSize={13}>
                          {item.CLIENTE || "Sin cliente"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatoFecha(item.FECHA_COTIZACION)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatoFecha(item.FECHA_VENCIMIENTO)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography fontWeight={700} fontSize={13}>
                          {formatoMoneda(item.TOTAL)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={estado}
                          size="small"
                          sx={{
                            bgcolor: estilo.bg,
                            color: estilo.color,
                            fontWeight: 800,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalle(item)}
                          title="Ver detalle"
                          sx={{
                            color: "#2563EB",
                            bgcolor: "#EFF6FF",
                            "&:hover": { bgcolor: "#DBEAFE" },
                          }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {cotizacionesFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography
                          color="text.secondary"
                          fontWeight={600}
                        >
                          No se encontraron cotizaciones.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary" fontSize={11}>
            Mostrando {cotizacionesFiltradas.length} de {totalCotizaciones} cotizaciones
          </Typography>
        </Box>
      </Paper>

      {/* VENTANA DE DETALLE */}
      <Dialog
        open={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 800,
          }}
        >
          Cotización #{cotizacionSeleccionada?.ID_COTIZACION}

          <IconButton onClick={() => setDetalleAbierto(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {cotizacionSeleccionada && (
            <Box sx={{ mb: 3 }}>
              <Typography fontSize={13}>
                <strong>Cliente:</strong>{" "}
                {cotizacionSeleccionada.CLIENTE}
              </Typography>
              <Typography fontSize={13} mt={1}>
                <strong>Fecha:</strong>{" "}
                {formatoFecha(cotizacionSeleccionada.FECHA_COTIZACION)}
              </Typography>
              <Typography fontSize={13} mt={1}>
                <strong>Vencimiento:</strong>{" "}
                {formatoFecha(cotizacionSeleccionada.FECHA_VENCIMIENTO)}
              </Typography>
            </Box>
          )}

          <Typography fontWeight={800} mb={2}>
            Productos cotizados
          </Typography>

          {loadingDetalle ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : detalle.length === 0 ? (
            <Alert severity="info">
              Esta cotización no tiene productos registrados.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Descuento</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {detalle.map((producto) => (
                    <TableRow key={producto.ID_DETALLE_COTIZACION}>
                      <TableCell>{producto.PRODUCTO}</TableCell>
                      <TableCell align="right">
                        {producto.CANTIDAD}
                      </TableCell>
                      <TableCell align="right">
                        {formatoMoneda(producto.PRECIO_UNITARIO)}
                      </TableCell>
                      <TableCell align="right">
                        {formatoMoneda(producto.DESCUENTO)}
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatoMoneda(producto.TOTAL)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 2 }} />

          {cotizacionSeleccionada && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ minWidth: 190 }}>
                <Typography fontSize={13} mb={1}>
                  Subtotal:{" "}
                  {formatoMoneda(cotizacionSeleccionada.SUBTOTAL)}
                </Typography>
                <Typography fontSize={13} mb={1}>
                  Descuento:{" "}
                  {formatoMoneda(cotizacionSeleccionada.DESCUENTO)}
                </Typography>
                <Typography fontSize={13} mb={1}>
                  Impuesto:{" "}
                  {formatoMoneda(cotizacionSeleccionada.IMPUESTO)}
                </Typography>
                <Typography fontWeight={800} fontSize={18}>
                  Total: {formatoMoneda(cotizacionSeleccionada.TOTAL)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
