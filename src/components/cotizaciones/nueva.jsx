
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Se mantiene el mismo ID utilizado actualmente en el módulo de ventas.
// Posteriormente se puede conectar con el usuario autenticado.
const ID_USUARIO = 2;

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor || 0));

const obtenerFechaLocal = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

export default function NuevaCotizacion() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [detalles, setDetalles] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [respuestaClientes, respuestaProductos] =
          await Promise.all([
            axios.get(`${API_URL}/clientes`),
            axios.get(`${API_URL}/products`),
          ]);

        const datosClientes = respuestaClientes.data?.data?.data || [];
        const datosProductos = respuestaProductos.data?.data?.rows || [];

        if (!respuestaClientes.data?.result) {
          throw new Error("No se pudieron cargar los clientes.");
        }

        if (!respuestaProductos.data?.result) {
          throw new Error("No se pudieron cargar los productos.");
        }

        setClientes(datosClientes);

        setProductos(
          datosProductos.filter(
            (producto) => producto.ESTADO === "A"
          )
        );
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(
          err.response?.data?.mensaje ||
            err.message ||
            "No fue posible cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const agregarProducto = (producto) => {
    setDetalles((actuales) => {
      const existente = actuales.find(
        (item) => item.ID_PRODUCTO === producto.ID_PRODUCTO
      );

      if (existente) {
        if (
          producto.STOCK != null &&
          existente.cantidad >= producto.STOCK
        ) {
          setError("No hay más existencias disponibles de este producto.");
          return actuales;
        }

        return actuales.map((item) =>
          item.ID_PRODUCTO === producto.ID_PRODUCTO
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      if (producto.STOCK != null && producto.STOCK <= 0) {
        setError("Este producto no tiene existencias disponibles.");
        return actuales;
      }

      setError("");

      return [
        ...actuales,
        {
          ...producto,
          cantidad: 1,
          descuento: 0,
        },
      ];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    const nuevaCantidad = Number(cantidad);

    setDetalles((actuales) =>
      actuales.map((item) => {
        if (item.ID_PRODUCTO !== id) return item;

        if (
          item.STOCK != null &&
          nuevaCantidad > item.STOCK
        ) {
          setError("La cantidad supera las existencias disponibles.");
          return item;
        }

        return {
          ...item,
          cantidad: nuevaCantidad,
        };
      })
    );
  };

  const cambiarDescuento = (id, descuento) => {
    const valor = Math.max(0, Number(descuento) || 0);

    setDetalles((actuales) =>
      actuales.map((item) =>
        item.ID_PRODUCTO === id
          ? {
              ...item,
              descuento: Math.min(
                valor,
                item.cantidad * Number(item.PRECIO_VENTA)
              ),
            }
          : item
      )
    );
  };

  const eliminarProducto = (id) => {
    setDetalles((actuales) =>
      actuales.filter((item) => item.ID_PRODUCTO !== id)
    );
  };

  const subtotal = useMemo(
    () =>
      detalles.reduce(
        (total, item) =>
          total + item.cantidad * Number(item.PRECIO_VENTA),
        0
      ),
    [detalles]
  );

  const descuentoTotal = useMemo(
    () =>
      detalles.reduce(
        (total, item) => total + Number(item.descuento || 0),
        0
      ),
    [detalles]
  );

  const impuesto = 0;

  const total = subtotal - descuentoTotal + impuesto;

  const registrarCotizacion = async () => {
    setError("");
    setMensaje("");

    if (!clienteId) {
      setError("Selecciona un cliente.");
      return;
    }

    if (!fechaVencimiento) {
      setError("Selecciona la fecha de vencimiento.");
      return;
    }

    if (fechaVencimiento < obtenerFechaLocal()) {
      setError("La fecha de vencimiento no puede ser anterior a hoy.");
      return;
    }

    if (detalles.length === 0) {
      setError("Agrega al menos un producto a la cotización.");
      return;
    }

    const detallesEnviar = detalles.map((item) => {
      const precioUnitario = Number(item.PRECIO_VENTA);
      const descuento = Number(item.descuento || 0);

      return {
        idProducto: Number(item.ID_PRODUCTO),
        cantidad: Number(item.cantidad),
        precioUnitario,
        descuento,
        total: Number(
          (
            item.cantidad * precioUnitario - descuento
          ).toFixed(2)
        ),
      };
    });

    const cotizacion = {
      idCliente: Number(clienteId),
      idUsuario: ID_USUARIO,
      fechaVencimiento,
      subtotal: Number(subtotal.toFixed(2)),
      descuento: Number(descuentoTotal.toFixed(2)),
      impuesto,
      total: Number(total.toFixed(2)),
      detalles: detallesEnviar,
    };

    try {
      setRegistrando(true);

      const respuesta = await axios.post(
        `${API_URL}/registrar-cotizacion`,
        cotizacion
      );

      if (!respuesta.data?.result) {
        throw new Error(
          respuesta.data?.data?.mensaje ||
            "No se pudo registrar la cotización."
        );
      }

      setMensaje(
        `Cotización #${respuesta.data?.data?.idCotizacion} registrada correctamente.`
      );

      setTimeout(() => {
        navigate("/cotizaciones");
      }, 1200);
    } catch (err) {
      console.error("Error al registrar cotización:", err);

      setError(
        err.response?.data?.data?.mensaje ||
          err.response?.data?.mensaje ||
          err.message ||
          "No fue posible registrar la cotización."
      );
    } finally {
      setRegistrando(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Cargando clientes y productos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#F5F7FB", minHeight: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={3}
      >
        <IconButton onClick={() => navigate("/cotizaciones")}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827">
            Nueva cotización
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            Registra una propuesta comercial para tu cliente.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          mb: 2,
        }}
      >
        <Typography fontWeight={800} mb={2}>
          Información de la cotización
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <TextField
            select
            fullWidth
            label="Seleccionar cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={registrando}
          >
            {clientes.map((cliente) => (
              <MenuItem
                key={cliente.ID_CLIENTE}
                value={cliente.ID_CLIENTE}
              >
                {cliente.NOMBRE}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Fecha de vencimiento"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            inputProps={{ min: obtenerFechaLocal() }}
            InputLabelProps={{ shrink: true }}
            disabled={registrando}
          />
        </Stack>

        {clienteId && (
          <Box mt={2}>
            {(() => {
              const cliente = clientes.find(
                (item) => item.ID_CLIENTE === Number(clienteId)
              );

              return cliente ? (
                <Typography color="text.secondary" fontSize={13}>
                  Dirección: {cliente.DIRECCION || "No registrada"} ·
                  Teléfono: {cliente.TELEFONO || "No registrado"}
                </Typography>
              ) : null;
            })()}
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid #E5E7EB",
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          mb={2}
        >
          <Box>
            <Typography fontWeight={800}>
              Productos de la cotización
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              Selecciona productos y ajusta cantidades y descuentos.
            </Typography>
          </Box>
        </Stack>

        <TextField
          select
          fullWidth
          label="Agregar producto"
          value=""
          onChange={(e) => {
            const producto = productos.find(
              (item) => item.ID_PRODUCTO === Number(e.target.value)
            );

            if (producto) agregarProducto(producto);
          }}
          disabled={registrando}
          sx={{ mb: 2 }}
        >
          {productos.map((producto) => (
            <MenuItem
              key={producto.ID_PRODUCTO}
              value={producto.ID_PRODUCTO}
              disabled={producto.STOCK <= 0}
            >
              {producto.NOMBRE} — {formatoMoneda(producto.PRECIO_VENTA)}
              {" · Stock: "}
              {producto.STOCK}
            </MenuItem>
          ))}
        </TextField>

        {detalles.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              bgcolor: "#F8FAFC",
              borderRadius: 2,
            }}
          >
            <Typography fontSize={32}>📦</Typography>
            <Typography fontWeight={700} mt={1}>
              Todavía no hay productos
            </Typography>
            <Typography color="text.secondary" fontSize={12}>
              Selecciona un producto para comenzar.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {detalles.map((item) => (
              <Box
                key={item.ID_PRODUCTO}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ md: "center" }}
                  spacing={2}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={800}>
                      {item.NOMBRE}
                    </Typography>
                    <Typography color="text.secondary" fontSize={12}>
                      Código: {item.ID_PRODUCTO} · Precio unitario:{" "}
                      {formatoMoneda(item.PRECIO_VENTA)} · Stock:{" "}
                      {item.STOCK}
                    </Typography>
                  </Box>

                  <TextField
                    label="Cantidad"
                    type="number"
                    size="small"
                    value={item.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(
                        item.ID_PRODUCTO,
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                    inputProps={{ min: 1, max: item.STOCK }}
                    sx={{ width: { xs: "100%", md: 110 } }}
                    disabled={registrando}
                  />

                  <TextField
                    label="Descuento (Q)"
                    type="number"
                    size="small"
                    value={item.descuento}
                    onChange={(e) =>
                      cambiarDescuento(item.ID_PRODUCTO, e.target.value)
                    }
                    inputProps={{
                      min: 0,
                      max: item.cantidad * Number(item.PRECIO_VENTA),
                      step: "0.01",
                    }}
                    sx={{ width: { xs: "100%", md: 140 } }}
                    disabled={registrando}
                  />

                  <Box sx={{ minWidth: 120 }}>
                    <Typography fontSize={11} color="text.secondary">
                      Total
                    </Typography>
                    <Typography fontWeight={800}>
                      {formatoMoneda(
                        item.cantidad * Number(item.PRECIO_VENTA) -
                          Number(item.descuento || 0)
                      )}
                    </Typography>
                  </Box>

                  <IconButton
                    color="error"
                    onClick={() => eliminarProducto(item.ID_PRODUCTO)}
                    disabled={registrando}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: { xs: "100%", sm: 300 } }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary" fontSize={13}>
                Subtotal
              </Typography>
              <Typography fontWeight={600}>
                {formatoMoneda(subtotal)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary" fontSize={13}>
                Descuento
              </Typography>
              <Typography fontWeight={600}>
                {formatoMoneda(descuentoTotal)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography color="text.secondary" fontSize={13}>
                Impuesto
              </Typography>
              <Typography fontWeight={600}>
                {formatoMoneda(impuesto)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={800} fontSize={17}>
                Total
              </Typography>
              <Typography
                fontWeight={900}
                fontSize={20}
                color="primary.main"
              >
                {formatoMoneda(total)}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent="flex-end"
        spacing={1.5}
        mt={3}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate("/cotizaciones")}
          disabled={registrando}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={
            registrando ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AddRoundedIcon />
            )
          }
          onClick={registrarCotizacion}
          disabled={registrando || detalles.length === 0}
          sx={{
            bgcolor: "#2563EB",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            "&:hover": { bgcolor: "#1D4ED8" },
          }}
        >
          {registrando ? "Registrando..." : "Registrar cotización"}
        </Button>
      </Stack>
    </Box>
  );
}
