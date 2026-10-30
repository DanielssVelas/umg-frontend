
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddShoppingCartRounded,
  Delete,
} from "@mui/icons-material";
import axios from "axios";
import useToast from "../commonts/useToast";
import useConfirm from "../commonts/useConfirm";

const api = import.meta.env.VITE_BACKEND_URL;

const COMPRA_DEFAULT = {
  idUsuario: 2,
};

const TIPOS_COMPROBANTE = [
  { valor: "FACTURA", etiqueta: "Factura" },
  { valor: "RECIBO", etiqueta: "Recibo" },
  { valor: "OTRO", etiqueta: "Otro" },
];

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor) || 0);

export default function Compras() {
  const { confirm, ConfirmDialogElement } = useConfirm();
  const { showToast } = useToast();

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);

  const [proveedorId, setProveedorId] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState("FACTURA");
  const [serie, setSerie] = useState("");
  const [numeroComprobante, setNumeroComprobante] = useState("");

  const [cargando, setCargando] = useState(false);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  // Cargar productos desde Oracle
  const cargarProductos = async () => {
    setCargando(true);

    try {
      const respuesta = await axios.get(`${api}/products`);
      const data = respuesta.data?.data?.rows;

      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showToast("No se pudieron cargar los productos.", "error");
    } finally {
      setCargando(false);
    }
  };

  // Cargar proveedores desde Oracle
  const cargarProveedores = async () => {
    setCargandoProveedores(true);

    try {
      const respuesta = await axios.get(`${api}/proveedores`);
      const data = respuesta.data?.data?.rows;

      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      showToast("No se pudieron cargar los proveedores.", "error");
    } finally {
      setCargandoProveedores(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarProveedores();
  }, []);

  // Buscar productos por nombre o código
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return productos;

    return productos.filter((producto) => {
      const nombre = String(producto.NOMBRE ?? "").toLowerCase();
      const id = String(producto.ID_PRODUCTO ?? "").toLowerCase();

      return nombre.includes(texto) || id.includes(texto);
    });
  }, [productos, busqueda]);

  // Agregar productos al carrito.
  // En compras NO se limita la cantidad por el stock actual.
  const agregarProducto = (producto) => {
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

      return [
        ...actual,
        {
          ...producto,
          cantidad: 1,
          precio_compra: Number(producto.PRECIO_COMPRA || 0),
          precio_venta: Number(producto.PRECIO_VENTA || 0),
        },
      ];
    });
  };

  // Modificar cantidades
  const cambiarCantidad = (id, cambio) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.ID_PRODUCTO === id
            ? { ...item, cantidad: item.cantidad + cambio }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  // Modificar precios
  const cambiarPrecio = (id, campo, valor) => {
    setCarrito((actual) =>
      actual.map((item) =>
        item.ID_PRODUCTO === id
          ? {
              ...item,
              [campo]: valor === "" ? "" : Number(valor),
            }
          : item
      )
    );
  };

  const eliminarProducto = (id) => {
    setCarrito((actual) =>
      actual.filter((item) => item.ID_PRODUCTO !== id)
    );
  };

  // Totales
  const totalUnidades = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalCompra = carrito.reduce(
    (total, item) =>
      total + item.cantidad * (Number(item.precio_compra) || 0),
    0
  );

  const totalProductos = carrito.length;

  const proveedorSeleccionado = proveedores.find(
    (proveedor) =>
      proveedor.ID_PROVEEDOR === Number(proveedorId)
  );

  // Registrar compra
  const registrarCompra = async () => {
    if (!proveedorId) {
      showToast("Selecciona un proveedor.", "warning");
      return;
    }

    if (carrito.length === 0) {
      showToast("Agrega al menos un producto.", "warning");
      return;
    }

    if (!tipoComprobante) {
      showToast("Selecciona el tipo de comprobante.", "warning");
      return;
    }

    if (
      carrito.some(
        (item) =>
          !Number.isInteger(Number(item.cantidad)) ||
          Number(item.cantidad) <= 0
      )
    ) {
      showToast("Verifica las cantidades de los productos.", "warning");
      return;
    }

    if (
      carrito.some(
        (item) =>
          item.precio_compra === "" ||
          !Number.isFinite(Number(item.precio_compra)) ||
          Number(item.precio_compra) < 0 ||
          item.precio_venta === "" ||
          !Number.isFinite(Number(item.precio_venta)) ||
          Number(item.precio_venta) < 0
      )
    ) {
      showToast("Verifica los precios de compra y venta.", "warning");
      return;
    }

    const confirmado = await confirm({
      title: "Confirmar compra",
      message: `¿Deseas registrar esta compra por ${formatoMoneda(totalCompra)}?`,
      confirmText: "Registrar compra",
      cancelText: "Cancelar",
      confirmColor: "primary",
    });

    if (!confirmado) return;

    const detalles = carrito.map((item) => ({
      id_producto: Number(item.ID_PRODUCTO),
      cantidad: Number(item.cantidad),
      precio_compra: Number(Number(item.precio_compra).toFixed(2)),
      precio_venta: Number(Number(item.precio_venta).toFixed(2)),
    }));

    const compra = {
      ...COMPRA_DEFAULT,
      idProveedor: Number(proveedorId),
      tipoComprobante,
      serie: serie.trim(),
      numeroComprobante: numeroComprobante.trim(),
      detalles,
      total: Number(totalCompra.toFixed(2)),
    };

    setRegistrando(true);

    try {
      const respuesta = await axios.post(
        `${api}/registrar-compra`,
        compra
      );

      const resultado = respuesta.data?.data || respuesta.data;

      if (resultado?.flag === false || respuesta.data?.result === false) {
        throw new Error(
          resultado?.mensaje || "No fue posible registrar la compra."
        );
      }

      showToast(
        resultado?.mensaje ||
          respuesta.data?.mensaje ||
          "Compra registrada correctamente.",
        "success"
      );

      // Limpiar formulario
      setCarrito([]);
      setBusqueda("");
      setProveedorId("");
      setTipoComprobante("FACTURA");
      setSerie("");
      setNumeroComprobante("");
      setModalProductosAbierto(false);

      // Actualizar existencias y precios
      await cargarProductos();
    } catch (error) {
      console.error("Error al registrar la compra:", error);

      showToast(
        error.response?.data?.data?.mensaje ||
          error.response?.data?.mensaje ||
          error.message ||
          "No fue posible registrar la compra.",
        "error"
      );
    } finally {
      setRegistrando(false);
    }
  };

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
      {ConfirmDialogElement}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.7fr) minmax(320px, 1fr)",
          },
          gap: 2,
          alignItems: "stretch",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* PANEL IZQUIERDO: DETALLE DE COMPRA */}
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1.5, flexShrink: 0 }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                Detalle de la compra
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalProductos} productos · {totalUnidades} unidades
              </Typography>
            </Box>

            <Button
              size="small"
              variant="contained"
              startIcon={<AddShoppingCartRounded />}
              onClick={() => setModalProductosAbierto(true)}
              disabled={cargando || registrando}
              sx={{ flexShrink: 0, whiteSpace: "nowrap", textTransform: "none" }}
            >
              Agregar
            </Button>
          </Stack>

          <Divider sx={{ mb: 1, flexShrink: 0 }} />

          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, pr: 0.5 }}>
            {carrito.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography fontSize={40}>🛒</Typography>
                <Typography fontWeight={700} mt={1} fontSize={14}>
                  Compra vacía
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Presiona Agregar para seleccionar productos.
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
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={700} fontSize={14} noWrap>
                          {item.NOMBRE}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Código: {item.ID_PRODUCTO} · Stock actual: {item.STOCK ?? 0}
                        </Typography>
                      </Box>

                      <Typography
                        fontWeight={800}
                        color="primary.main"
                        fontSize={14}
                      >
                        {formatoMoneda(
                          item.cantidad * (Number(item.precio_compra) || 0)
                        )}
                      </Typography>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => eliminarProducto(item.ID_PRODUCTO)}
                        disabled={registrando}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          sm: "1fr 1fr 1fr",
                        },
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="Cantidad"
                        type="number"
                        size="small"
                        value={item.cantidad}
                        disabled={registrando}
                        inputProps={{ min: 1, step: 1 }}
                        onChange={(event) => {
                          const valor = event.target.value;
                          if (valor === "") {
                            setCarrito((actual) =>
                              actual.map((p) =>
                                p.ID_PRODUCTO === item.ID_PRODUCTO
                                  ? { ...p, cantidad: "" }
                                  : p
                              )
                            );
                          } else {
                            const cantidad = Number(valor);
                            if (Number.isInteger(cantidad) && cantidad >= 1) {
                              setCarrito((actual) =>
                                actual.map((p) =>
                                  p.ID_PRODUCTO === item.ID_PRODUCTO
                                    ? { ...p, cantidad }
                                    : p
                                )
                              );
                            }
                          }
                        }}
                      />

                      <TextField
                        label="Precio compra"
                        type="number"
                        size="small"
                        value={item.precio_compra}
                        disabled={registrando}
                        inputProps={{ min: 0, step: "0.01" }}
                        onChange={(event) =>
                          cambiarPrecio(
                            item.ID_PRODUCTO,
                            "precio_compra",
                            event.target.value
                          )
                        }
                      />

                      <TextField
                        label="Precio venta"
                        type="number"
                        size="small"
                        value={item.precio_venta}
                        disabled={registrando}
                        inputProps={{ min: 0, step: "0.01" }}
                        onChange={(event) =>
                          cambiarPrecio(
                            item.ID_PRODUCTO,
                            "precio_venta",
                            event.target.value
                          )
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {carrito.length > 0 && (
            <Box
              sx={{
                pt: 1,
                mt: 1,
                borderTop: "1px solid #eef0f4",
                display: "flex",
                justifyContent: "flex-end",
                flexShrink: 0,
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

        {/* PANEL DERECHO: FINALIZAR COMPRA */}
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
          <Box sx={{ flexShrink: 0, mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Registrar compra
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Proveedor y datos del comprobante
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, pr: 0.5 }}>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="proveedor-compra-label">
                  Proveedor
                </InputLabel>
                <Select
                  labelId="proveedor-compra-label"
                  label="Proveedor"
                  value={proveedorId}
                  onChange={(event) => setProveedorId(event.target.value)}
                  disabled={registrando || cargandoProveedores}
                >
                  {proveedores.map((proveedor) => (
                    <MenuItem
                      key={proveedor.ID_PROVEEDOR}
                      value={proveedor.ID_PROVEEDOR}
                    >
                      {proveedor.NOMBRE}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {cargandoProveedores && (
                <Typography variant="caption" color="text.secondary">
                  Cargando proveedores...
                </Typography>
              )}

              {proveedorSeleccionado && (
                <Box
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px solid #eef0f4",
                    borderRadius: 1.5,
                    p: 1.25,
                  }}
                >
                  <Typography fontWeight={700} fontSize={13}>
                    {proveedorSeleccionado.NOMBRE}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {proveedorSeleccionado.DIRECCION}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Teléfono: {proveedorSeleccionado.TELEFONO}
                  </Typography>
                  {proveedorSeleccionado.NIT && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      NIT: {proveedorSeleccionado.NIT}
                    </Typography>
                  )}
                </Box>
              )}

              <FormControl fullWidth size="small">
                <InputLabel id="tipo-comprobante-label">
                  Tipo de comprobante
                </InputLabel>
                <Select
                  labelId="tipo-comprobante-label"
                  label="Tipo de comprobante"
                  value={tipoComprobante}
                  onChange={(event) =>
                    setTipoComprobante(event.target.value)
                  }
                  disabled={registrando}
                >
                  {TIPOS_COMPROBANTE.map((tipo) => (
                    <MenuItem key={tipo.valor} value={tipo.valor}>
                      {tipo.etiqueta}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Serie"
                value={serie}
                onChange={(event) => setSerie(event.target.value)}
                disabled={registrando}
              />

              <TextField
                fullWidth
                size="small"
                label="Número de comprobante"
                value={numeroComprobante}
                onChange={(event) =>
                  setNumeroComprobante(event.target.value)
                }
                disabled={registrando}
              />

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Productos
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {totalProductos}
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
                  Total de la compra
                </Typography>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {formatoMoneda(totalCompra)}
                </Typography>
              </Box>

              {proveedorSeleccionado && (
                <Typography variant="caption" color="text.secondary">
                  Proveedor: {proveedorSeleccionado.NOMBRE}
                </Typography>
              )}
            </Stack>
          </Box>

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
              onClick={registrarCompra}
              disabled={
                carrito.length === 0 ||
                registrando ||
                cargandoProveedores
              }
              sx={{
                py: 1.1,
                borderRadius: 1.5,
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              {registrando ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Registrando...</span>
                </Stack>
              ) : (
                "Confirmar compra"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* MODAL DEL CATÁLOGO */}
      <Dialog
        open={modalProductosAbierto}
        onClose={() => setModalProductosAbierto(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, maxHeight: "85vh" } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 1.5, px: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Catálogo de productos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecciona los productos que vas a comprar
              </Typography>
            </Box>

            <Chip
              label={productosFiltrados.length}
              size="small"
              color="primary"
              variant="outlined"
            />
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
                No se encontraron productos.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.75}>
              {productosFiltrados.map((producto) => {
                const enCarrito = carrito.find(
                  (item) =>
                    item.ID_PRODUCTO === producto.ID_PRODUCTO
                )?.cantidad ?? 0;

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
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={700} fontSize={12.5} noWrap>
                            {producto.NOMBRE}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: 10.5 }}
                          >
                            Código: {producto.ID_PRODUCTO} · Stock actual:{" "}
                            {producto.STOCK ?? 0}
                          </Typography>

                          {enCarrito > 0 && (
                            <Chip
                              label={`En compra: ${enCarrito}`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{
                                ml: 0.5,
                                height: 16,
                                fontSize: 9.5,
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography
                            fontWeight={800}
                            color="primary.main"
                            fontSize={12.5}
                          >
                            Compra: {formatoMoneda(producto.PRECIO_COMPRA)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Venta: {formatoMoneda(producto.PRECIO_VENTA)}
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => agregarProducto(producto)}
                            disabled={registrando}
                            sx={{
                              mt: 0.5,
                              minWidth: 0,
                              px: 1.2,
                              py: 0.2,
                              fontSize: 10.5,
                              textTransform: "none",
                            }}
                          >
                            Agregar
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

        <DialogActions
          sx={{ p: 1.25, px: 2, justifyContent: "space-between" }}
        >
          <Typography variant="caption" color="text.secondary">
            {totalUnidades} unidades · {formatoMoneda(totalCompra)}
          </Typography>

          <Button
            size="small"
            variant="contained"
            onClick={() => setModalProductosAbierto(false)}
            sx={{ textTransform: "none" }}
          >
            Listo ({carrito.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
