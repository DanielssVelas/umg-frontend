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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import useToast from "../commonts/useToast";
import { Delete, X } from "@mui/icons-material";
import useConfirm from "../commonts/useConfirm";

const api = import.meta.env.VITE_BACKEND_URL;

const VENTA_DEFAULT = {
  idUsuario: 2,
  idCaja: 1,
};

const CLIENTES_TEMPORALES = [
  { id: 1, nombre: "Cliente general" },
  { id: 2, nombre: "Cliente 2" },
  { id: 3, nombre: "Cliente 3" },
];

const TIPOS_PAGO = [
  { valor: "EFECTIVO", etiqueta: "Efectivo" },
  { valor: "TARJETA", etiqueta: "Tarjeta" },
  { valor: "TRANSFERENCIA", etiqueta: "Transferencia" },
  { valor: "CREDITO", etiqueta: "Crédito" },
];

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor) || 0);

export default function Ventas() {
  const { confirm, ConfirmDialogElement } = useConfirm();
  const { showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);

  const [clienteId, setClienteId] = useState(1);
  const [tipoPago, setTipoPago] = useState("EFECTIVO");

  const [cargando, setCargando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [notificacion, setNotificacion] = useState({
    abierto: false,
    mensaje: "",
    tipo: "success",
  });

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const respuesta = await axios.get(`${api}/products`);
      // El backend puede devolver { data: { rows } } o un array directo
      const data = respuesta.data?.data?.rows;
      setProductos(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showToast("No se pudieron cargar los productos.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;

    return productos.filter((producto) => {
      const nombre = String(producto.NOMBRE ?? "").toLowerCase();
      const id = String(producto.ID_PRODUCTO ?? "").toLowerCase();
      return nombre.includes(texto) || id.includes(texto);
    });
  }, [productos, busqueda]);

  const agregarProducto = (producto) => {
    const stock = producto.STOCK;
    
    // Validamos el stock considerando lo que ya hay en el carrito
    const enCarrito = carrito.find((item) => item.ID_PRODUCTO === producto.ID_PRODUCTO)?.cantidad ?? 0;
    const stockDisponible = stock !== null && stock !== undefined ? stock - enCarrito : null;

    if (stockDisponible !== null && stockDisponible <= 0) {
      showToast("No hay más existencias disponibles de este producto.", "warning");
      return;
    }

    setCarrito((actual) => {
      const encontrado = actual.find(
        (item) => item.ID_PRODUCTO === producto.ID_PRODUCTO
      );

      if (encontrado) {
        return actual.map((item) =>
          item.ID_PRODUCTO === producto.ID_PRODUCTO
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cambio) => {
    const item = carrito.find((p) => p.ID_PRODUCTO === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
      setCarrito((actual) => actual.filter((p) => p.ID_PRODUCTO !== id));
      return;
    }

    if (item.STOCK !== null && item.STOCK !== undefined && nuevaCantidad > item.STOCK) {
      showToast("La cantidad supera las existencias disponibles.", "warning");
      return;
    }

    setCarrito((actual) =>
      actual.map((p) =>
        p.ID_PRODUCTO === id ? { ...p, cantidad: nuevaCantidad } : p
      )
    );
  };

  const eliminarProducto = (id) => {
    setCarrito((actual) => actual.filter((item) => item.ID_PRODUCTO !== id));
  };

  const totalUnidades = carrito.reduce((total, item) => total + item.cantidad, 0);
  const totalVenta = carrito.reduce(
    (total, item) => total + item.cantidad * Number(item.PRECIO_VENTA || 0),
    0
  );

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      showToast("Agrega al menos un producto al carrito.", "warning");
      return;
    }
    if (!clienteId) {
      showToast("Selecciona un cliente.", "warning");
      return;
    }
    if (!tipoPago) {
      showToast("Selecciona un tipo de pago.", "warning");
      return;
    }

      const confirmado = await confirm({
        title: "Confirmar Venta",
        message: `¿Estás seguro de cobrar un total de ${formatoMoneda(totalVenta)}?`,
        confirmText: "Cobrar",
        cancelText: "Cancelar",
        confirmColor: "primary",
      });

      if (!confirmado) return;

    const detalles = carrito.map((item) => ({
      id_producto: item.ID_PRODUCTO,
      cantidad: item.cantidad,
      precio_venta: Number(Number(item.PRECIO_VENTA).toFixed(2)),
      subtotal: Number((item.cantidad * item.PRECIO_VENTA).toFixed(2)),
    }));

    const venta = {
      ...VENTA_DEFAULT,
      idCliente: Number(clienteId),
      tipoPago,
      detalles,
      total: Number(totalVenta.toFixed(2)),
    };

    setRegistrando(true);
    try {
      const respuesta = await axios.post(`${api}/registrar-venta`, venta);
      showToast(
        respuesta.data?.mensaje ||
          respuesta.data?.message ||
          "Venta registrada correctamente.",
        "success"
      );
      
      // Limpiamos el estado
      setCarrito([]);
      setBusqueda("");
      setClienteId(1);
      setTipoPago("EFECTIVO");
      setModalProductosAbierto(false);

      // Recargamos para obtener el stock real actualizado por el backend
      cargarProductos();

    } catch (error) {
      console.error("Error al registrar la venta:", error);
      showToast(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          "No fue posible registrar la venta.",
        "error"
      );
    } finally {
      setRegistrando(false);
    }
  };

  const clienteSeleccionado = CLIENTES_TEMPORALES.find(
    (cliente) => cliente.id === Number(clienteId)
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: "#f5f7fb",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.7fr) minmax(320px, 1fr)" },
          gap: 2,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* ========== PANEL IZQUIERDO: CARRITO ========== */}
        {ConfirmDialogElement}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Header fijo */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1.5, flexShrink: 0 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                Detalle de la venta
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {carrito.length} productos · {totalUnidades} unidades
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={() => setModalProductosAbierto(true)}
              disabled={cargando || registrando}
              sx={{ flexShrink: 0, whiteSpace: "nowrap", textTransform: "none" }}
            >
              + Agregar
            </Button>
          </Stack>

          <Divider sx={{ mb: 1, flexShrink: 0 }} />

          {/* Lista scrolleable */}
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, pr: 0.5 }}>
            {carrito.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography fontSize={40}>🛒</Typography>
                <Typography fontWeight={700} mt={1} fontSize={14}>
                  Carrito vacío
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Presiona “+ Agregar” para abrir el catálogo.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {carrito.map((item) => (
                  <Box
                    key={item.ID_PRODUCTO}
                    sx={{
                      border: "1px solid #eef0f4",
                      borderRadius: 2,
                      p: 1.5,
                      bgcolor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between", // Empuja todo a los extremos
                      flexWrap: "nowrap", // Evita que se baje a la siguiente línea
                      gap: 2, // Espacio mínimo entre bloques
                    }}
                  >
                    {/* 1. IZQUIERDA: Nombre y Código */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={700} fontSize={14} noWrap>
                        {item.NOMBRE}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        Código: {item.ID_PRODUCTO} · {formatoMoneda(item.PRECIO_VENTA)} c/u
                      </Typography>
                    </Box>

                    {/* 2. DERECHA: Precio, Disp, Controles y Botón X */}
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                      
                      {/* Precio Total */}
                      <Typography fontWeight={800} color="primary.main" fontSize={15}>
                        {formatoMoneda(item.PRECIO_VENTA * item.cantidad)}
                      </Typography>

                      {/* Stock */}
                      {item.STOCK != null && (
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          Disp: <strong>{item.STOCK - item.cantidad}</strong>
                        </Typography>
                      )}

                      {/* Controles - + */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => cambiarCantidad(item.ID_PRODUCTO, -1)}
                          disabled={registrando}
                          sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, width: 26, height: 26, color: "text.secondary" }}
                        >
                          <Typography component="span" fontSize={14} fontWeight="bold">−</Typography>
                        </IconButton>
                        
                        <Typography sx={{ minWidth: 20, textAlign: "center" }} fontWeight={800} fontSize={14}>
                          {item.cantidad}
                        </Typography>
                        
                        <IconButton
                          size="small"
                          onClick={() => cambiarCantidad(item.ID_PRODUCTO, 1)}
                          disabled={registrando || (item.STOCK != null && item.cantidad >= item.STOCK)}
                          sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, width: 26, height: 26, color: "text.secondary" }}
                        >
                          <Typography component="span" fontSize={14} fontWeight="bold">+</Typography>
                        </IconButton>
                      </Stack>

                      {/* Botón X para eliminar (Limpio y sin doble icono) */}
                      <IconButton
                        size="small"
                        onClick={() => eliminarProducto(item.ID_PRODUCTO)}
                        disabled={registrando}
                        sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "error.50" } }}
                      >
                          <Delete/>
                      </IconButton>

                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Footer fijo */}
          {carrito.length > 0 && (
            <Box
              sx={{
                pt: 1,
                mt: 1,
                borderTop: "1px solid #eef0f4",
                flexShrink: 0,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size="small"
                color="error"
                onClick={() => setCarrito([])}
                disabled={registrando}
                sx={{ fontSize: 12, textTransform: "none" }}
              >
                Vaciar carrito
              </Button>
            </Box>
          )}
        </Paper>

        {/* ========== PANEL DERECHO: FINALIZAR ========== */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Header fijo */}
          <Box sx={{ flexShrink: 0, mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Finalizar venta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cliente y forma de pago
            </Typography>
          </Box>

          {/* Contenido scrolleable */}
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, pr: 0.5 }}>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="cliente-venta-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-venta-label"
                  label="Cliente"
                  value={clienteId}
                  onChange={(event) => setClienteId(event.target.value)}
                  disabled={registrando}
                >
                  {CLIENTES_TEMPORALES.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="tipo-pago-label">Tipo de pago</InputLabel>
                <Select
                  labelId="tipo-pago-label"
                  label="Tipo de pago"
                  value={tipoPago}
                  onChange={(event) => setTipoPago(event.target.value)}
                  disabled={registrando}
                >
                  {TIPOS_PAGO.map((tipo) => (
                    <MenuItem key={tipo.valor} value={tipo.valor}>
                      {tipo.etiqueta}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Productos
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {carrito.length}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Unidades
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {totalUnidades}
                  </Typography>
                </Stack>
              </Stack>

              <Box sx={{ bgcolor: "#f8fafc", borderRadius: 1.5, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Total a pagar
                </Typography>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {formatoMoneda(totalVenta)}
                </Typography>
              </Box>

              {clienteSeleccionado && (
                <Typography variant="caption" color="text.secondary">
                  Cliente: {clienteSeleccionado.nombre}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Footer fijo con botón Confirmar */}
          <Box
            sx={{
              pt: 1.5,
              mt: 1,
              borderTop: "1px solid #eef0f4",
              flexShrink: 0,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={registrarVenta}
              disabled={carrito.length === 0 || registrando}
              sx={{ py: 1.1, borderRadius: 1.5, fontWeight: 800, textTransform: "none" }}
            >
              {registrando ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Registrando...</span>
                </Stack>
              ) : (
                "Confirmar venta"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* ========== MODAL CATÁLOGO ========== */}
      <Dialog
        open={modalProductosAbierto}
        onClose={() => setModalProductosAbierto(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, maxHeight: "85vh" } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 1.5, px: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Catálogo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toca un producto para agregarlo
              </Typography>
            </Box>
            <Chip label={`${productosFiltrados.length}`} size="small" color="primary" variant="outlined" />
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            autoFocus
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography component="span" color="text.secondary">
                    ⌕
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.5 }}
          />

          {cargando ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={26} />
            </Box>
          ) : productosFiltrados.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography fontWeight={700} fontSize={13}>
                Sin resultados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Prueba con otro nombre o código.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.75}>
              {productosFiltrados.map((producto) => {
                const stockOriginal = producto.STOCK;
                const enCarrito = carrito.find((item) => item.ID_PRODUCTO === producto.ID_PRODUCTO)?.cantidad ?? 0;
                const stockDisponible = stockOriginal != null ? stockOriginal - enCarrito : null;
                const sinStock = stockDisponible != null && stockDisponible <= 0;

                return (
                  <Card
                    key={producto.ID_PRODUCTO}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      borderColor: enCarrito ? "primary.main" : "#e5e7eb",
                      bgcolor: enCarrito ? "#f8faff" : "#fff",
                    }}
                  >
                    <CardContent sx={{ p: "8px 10px !important" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={700} fontSize={12.5} noWrap>
                            {producto.NOMBRE}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
                            Código: {producto.ID_PRODUCTO}
                            {stockDisponible != null && ` · Disp: ${stockDisponible}`}
                          </Typography>
                          {enCarrito > 0 && (
                            <Chip
                              label={`En carrito: ${enCarrito}`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ ml: 0.5, height: 16, fontSize: 9.5 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography fontWeight={800} color="primary.main" fontSize={12.5}>
                            {formatoMoneda(producto.PRECIO_VENTA)}
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => agregarProducto(producto)}
                            disabled={sinStock || registrando}
                            sx={{ mt: 0.5, minWidth: 0, px: 1.2, py: 0.2, fontSize: 10.5, textTransform: "none" }}
                          >
                            {sinStock ? "Sin stock" : "Agregar"}
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.25, px: 2, justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            {totalUnidades} uds · {formatoMoneda(totalVenta)}
          </Typography>
          <Button size="small" variant="contained" onClick={() => setModalProductosAbierto(false)} sx={{ textTransform: "none" }}>
            Listo ({carrito.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificacion.abierto}
        autoHideDuration={3500}
        onClose={() => setNotificacion((actual) => ({ ...actual, abierto: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={notificacion.tipo} variant="filled" onClose={() => setNotificacion((actual) => ({ ...actual, abierto: false }))} sx={{ width: "100%" }}>
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}