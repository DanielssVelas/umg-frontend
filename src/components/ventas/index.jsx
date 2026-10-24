import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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

const api = import.meta.env.VITE_BACKEND_URL

const VENTA_DEFAULT = {
  idUsuario: 2,
  idCaja: 1,
};

// Opciones temporales: reemplazar por datos del endpoint de clientes cuando exista.
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

const obtenerId = (producto) =>
  producto.id_producto ?? producto.ID_PRODUCTO ?? producto.id ?? producto.ID;

const obtenerNombre = (producto) =>
  producto.nombre_producto ??
  producto.nombre ??
  producto.descripcion ??
  producto.name ??
  "Producto sin nombre";

const obtenerPrecio = (producto) =>
  Number(
    producto.precio_venta ??
      producto.PRECIO_VENTA ??
      producto.precio ??
      producto.price ??
      0
  );

const obtenerStock = (producto) => {
  const stock =
    producto.stock ??
    producto.existencias ??
    producto.cantidad_stock ??
    producto.stock_actual ??
    producto.STOCK;

  return stock === undefined || stock === null || stock === ""
    ? null
    : Number(stock);
};

const obtenerListaProductos = (respuesta) => {
  const data = respuesta?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.productos)) return data.productos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data?.productos)) return data.data.productos;
  return [];
};

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor) || 0);

export default function Ventas() {
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

  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ abierto: true, mensaje, tipo });
  };

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const respuesta = await axios.get(
        `${api}/products`
      );
      console.log('respuesta', respuesta);
      
      const lista = respuesta.data.data.rows
      setProductos(
        lista.map((producto) => ({
          ...producto,
          _id: producto.ID_PRODUCTO,
          _nombre: producto.NOMBRE,
          _precio: producto.PRECIO_VENTA,
          _stock: producto.STOCK,
        }))
      );
    } catch (error) {
      console.error("Error al cargar productos:", error);
      mostrarNotificacion(
        error.response?.data?.mensaje ||
          error.response?.data?.message ||
          "No fue posible cargar los productos.",
        "error"
      );
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
      const nombre = String(producto._nombre).toLowerCase();
      const codigo = String(
        producto.codigo ??
          producto.codigo_producto ??
          producto.sku ??
          ""
      ).toLowerCase();
      return nombre.includes(texto) || codigo.includes(texto);
    });
  }, [productos, busqueda]);

  const agregarProducto = (producto) => {
    if (producto._id === undefined || producto._id === null) {
      mostrarNotificacion("El producto no tiene un identificador válido.", "error");
      return;
    }

    if (!Number.isFinite(producto._precio) || producto._precio < 0) {
      mostrarNotificacion("El producto tiene un precio no válido.", "error");
      return;
    }

    if (
      producto._stock !== null &&
      (!Number.isFinite(producto._stock) || producto._stock <= 0)
    ) {
      mostrarNotificacion("Este producto no tiene existencias.", "warning");
      return;
    }

    const existente = carrito.find(
      (item) => String(item._id) === String(producto._id)
    );

    if (
      existente &&
      producto._stock !== null &&
      existente.cantidad >= producto._stock
    ) {
      mostrarNotificacion(
        "No puedes agregar más unidades que las disponibles.",
        "warning"
      );
      return;
    }

    setCarrito((actual) => {
      const encontrado = actual.find(
        (item) => String(item._id) === String(producto._id)
      );
      if (encontrado) {
        return actual.map((item) =>
          String(item._id) === String(producto._id)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });

    mostrarNotificacion(`${producto._nombre} agregado al carrito.`, "success");
  };

  const cambiarCantidad = (id, cambio) => {
    const item = carrito.find((producto) => String(producto._id) === String(id));
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad <= 0) {
      setCarrito((actual) =>
        actual.filter((producto) => String(producto._id) !== String(id))
      );
      return;
    }

    if (item._stock !== null && nuevaCantidad > item._stock) {
      mostrarNotificacion(
        "La cantidad supera las existencias disponibles.",
        "warning"
      );
      return;
    }

    setCarrito((actual) =>
      actual.map((producto) =>
        String(producto._id) === String(id)
          ? { ...producto, cantidad: nuevaCantidad }
          : producto
      )
    );
  };

  const eliminarProducto = (id) => {
    setCarrito((actual) =>
      actual.filter((item) => String(item._id) !== String(id))
    );
  };

  const totalUnidades = carrito.reduce((total, item) => total + item.cantidad, 0);
  const totalVenta = carrito.reduce(
    (total, item) => total + item.cantidad * item._precio,
    0
  );

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      mostrarNotificacion("Agrega al menos un producto al carrito.", "warning");
      return;
    }

    if (!clienteId) {
      mostrarNotificacion("Selecciona un cliente.", "warning");
      return;
    }

    if (!tipoPago) {
      mostrarNotificacion("Selecciona un tipo de pago.", "warning");
      return;
    }

    const detalles = carrito.map((item) => ({
      id_producto: item._id,
      cantidad: item.cantidad,
      precio_venta: Number(item._precio.toFixed(2)),
      subtotal: Number((item.cantidad * item._precio).toFixed(2)),
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
      const respuesta = await axios.post(
        `${api}/registrar-venta`
        , venta);
      mostrarNotificacion(
        respuesta.data?.mensaje ||
          respuesta.data?.message ||
          "Venta registrada correctamente.",
        "success"
      );
      setCarrito([]);
      setBusqueda("");
      setClienteId(1);
      setTipoPago("EFECTIVO");
      setModalProductosAbierto(false);
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      mostrarNotificacion(
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
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.6fr) minmax(320px, 1fr)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Lista de productos seleccionados */}
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #e5e7eb" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Detalle de la venta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {carrito.length} productos · {totalUnidades} unidades
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setModalProductosAbierto(true)}
              disabled={cargando || registrando}
              startIcon={<Typography component="span" sx={{ fontSize: 20, lineHeight: 1 }}>＋</Typography>}
            >
              Agregar productos
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {carrito.length === 0 ? (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#eef2ff",
                  color: "#4338ca",
                  fontSize: 30,
                }}
              >
                🛒
              </Avatar>
              <Typography fontWeight={700}>Todavía no hay productos</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Presiona “Agregar productos” para abrir el catálogo.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setModalProductosAbierto(true)}>
                Abrir catálogo
              </Button>
            </Box>
          ) : (
            <Stack spacing={0}>
              {carrito.map((item) => (
                <Box key={item._id} sx={{ py: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      gap: 1.5,
                      alignItems: "start",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                        {item._nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        Código: {item.codigo ?? item.codigo_producto ?? item.sku ?? item._id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatoMoneda(item._precio)} por unidad
                      </Typography>
                    </Box>
                    <IconButton
                      aria-label={`Eliminar ${item._nombre}`}
                      onClick={() => eliminarProducto(item._id)}
                      disabled={registrando}
                      sx={{
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        borderRadius: 2,
                        width: 36,
                        height: 36,
                      }}
                    >
                      <Typography component="span" sx={{ fontSize: 23, lineHeight: 1 }}>×</Typography>
                    </IconButton>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ mt: 1.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => cambiarCantidad(item._id, -1)}
                        disabled={registrando}
                        sx={{ border: "1px solid #d1d5db", borderRadius: 2 }}
                      >
                        <Typography component="span" sx={{ fontWeight: 800 }}>−</Typography>
                      </IconButton>
                      <Typography sx={{ minWidth: 28, textAlign: "center" }} fontWeight={800}>
                        {item.cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => cambiarCantidad(item._id, 1)}
                        disabled={registrando}
                        sx={{ border: "1px solid #d1d5db", borderRadius: 2 }}
                      >
                        <Typography component="span" sx={{ fontWeight: 800 }}>＋</Typography>
                      </IconButton>
                      {item._stock !== null && (
                        <Typography variant="caption" color="text.secondary">
                          Stock: {item._stock}
                        </Typography>
                      )}
                    </Stack>
                    <Typography fontWeight={800} color="primary.main">
                      {formatoMoneda(item._precio * item.cantidad)}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          )}

          {carrito.length > 0 && (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
              <Button
                color="error"
                onClick={() => setCarrito([])}
                disabled={registrando}
              >
                Vaciar listado
              </Button>
              <Typography color="text.secondary" variant="body2">
                {totalUnidades} unidades
              </Typography>
            </Stack>
          )}
        </Paper>

        {/* Panel para finalizar la venta */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            position: { lg: "sticky" },
            top: 20,
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Finalizar venta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Selecciona el cliente y la forma de pago.
          </Typography>

          <Stack spacing={2.5}>
            <FormControl fullWidth>
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

            <FormControl fullWidth>
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

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Productos</Typography>
                <Typography fontWeight={700}>{carrito.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Unidades</Typography>
                <Typography fontWeight={700}>{totalUnidades}</Typography>
              </Stack>
              <Box sx={{ bgcolor: "#f8fafc", borderRadius: 2, p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total a pagar
                </Typography>
                <Typography variant="h4" fontWeight={900} color="primary.main">
                  {formatoMoneda(totalVenta)}
                </Typography>
              </Box>
              {clienteSeleccionado && (
                <Typography variant="caption" color="text.secondary">
                  Cliente seleccionado: {clienteSeleccionado.nombre}
                </Typography>
              )}
            </Stack>

            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={registrarVenta}
              disabled={carrito.length === 0 || registrando}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
            >
              {registrando ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Registrando venta...</span>
                </Stack>
              ) : (
                "Confirmar venta"
              )}
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Usuario y caja están configurados temporalmente.
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Modal de catálogo */}
      <Dialog
        open={modalProductosAbierto}
        onClose={() => setModalProductosAbierto(false)}
        fullWidth
        maxWidth="md"
        fullScreen={false}
        PaperProps={{
          sx: { borderRadius: { xs: 0, sm: 3 }, maxHeight: "90vh" },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>Catálogo de productos</Typography>
              <Typography variant="body2" color="text.secondary">
                Selecciona un producto para agregarlo al detalle de la venta.
              </Typography>
            </Box>
            <Chip
              label={`${productosFiltrados.length} encontrados`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            autoFocus
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography component="span" color="text.secondary">⌕</Typography>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5, mt: 0.5 }}
          />

          {cargando ? (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <CircularProgress />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Cargando productos...
              </Typography>
            </Box>
          ) : productosFiltrados.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography fontWeight={700}>No se encontraron productos</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Prueba con otro nombre o código, o actualiza el catálogo.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {productosFiltrados.map((producto, indice) => {
                const sinStock =
                  producto._stock !== null &&
                  (!Number.isFinite(producto._stock) || producto._stock <= 0);
                const cantidadEnCarrito =
                  carrito.find((item) => String(item._id) === String(producto._id))
                    ?.cantidad ?? 0;

                return (
                  <Card
                    key={producto._id ?? indice}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: cantidadEnCarrito ? "primary.main" : "#e5e7eb",
                      bgcolor: cantidadEnCarrito ? "#f8faff" : "#fff",
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Avatar
                          variant="rounded"
                          sx={{
                            bgcolor: "#eef2ff",
                            color: "#4338ca",
                            width: 44,
                            height: 44,
                            fontSize: 22,
                          }}
                        >
                          ▦
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                            {producto._nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Código: {producto.codigo ?? producto.codigo_producto ?? producto.sku ?? producto._id ?? "N/D"}
                          </Typography>
                          {producto._stock !== null && (
                            <Typography
                              variant="caption"
                              color={sinStock ? "error" : "text.secondary"}
                            >
                              Existencias: {producto._stock}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="h6" color="primary.main" fontWeight={800}>
                            {formatoMoneda(producto._precio)}
                          </Typography>
                          {cantidadEnCarrito > 0 && (
                            <Typography variant="caption" color="success.main">
                              En carrito: {cantidadEnCarrito}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => agregarProducto(producto)}
                          disabled={sinStock || registrando}
                        >
                          Agregar +
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {totalUnidades} unidades · {formatoMoneda(totalVenta)}
          </Typography>
          <Button variant="contained" onClick={() => setModalProductosAbierto(false)}>
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
        <Alert
          severity={notificacion.tipo}
          variant="filled"
          onClose={() => setNotificacion((actual) => ({ ...actual, abierto: false }))}
          sx={{ width: "100%" }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}