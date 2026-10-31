
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Divider,
  useTheme,
} from "@mui/material";

import {
  TrendingUpRounded,
  PointOfSaleRounded,
  ShoppingCartRounded,
  Inventory2Rounded,
  AccountBalanceWalletRounded,
  PeopleAltRounded,
  WarningAmberRounded,
  AssessmentRounded,
} from "@mui/icons-material";

import { useAuth } from "../../auth/AuthContext";

const ventasMensuales = [
  { mes: "Ene", actual: 18000, anterior: 16000 },
  { mes: "Feb", actual: 21000, anterior: 19000 },
  { mes: "Mar", actual: 17500, anterior: 18000 },
  { mes: "Abr", actual: 20500, anterior: 19000 },
  { mes: "May", actual: 19500, anterior: 17500 },
  { mes: "Jun", actual: 22500, anterior: 20000 },
  { mes: "Jul", actual: 21000, anterior: 19500 },
  { mes: "Ago", actual: 23000, anterior: 21000 },
  { mes: "Sep", actual: 20000, anterior: 18500 },
  { mes: "Oct", actual: 24500, anterior: 22000 },
  { mes: "Nov", actual: 21500, anterior: 20000 },
  { mes: "Dic", actual: 27000, anterior: 23000 },
];

const visitasMensuales = [32, 36, 35, 48, 37, 44, 35, 32, 28, 38, 33, 25];

const marcas = [
  { nombre: "Marca A", valor: 30, color: "#2463eb" },
  { nombre: "Marca B", valor: 23, color: "#60a5fa" },
  { nombre: "Marca C", valor: 28, color: "#ff9077" },
  { nombre: "Marca D", valor: 13, color: "#f59e0b" },
  { nombre: "Otros", valor: 6, color: "#8b5cf6" },
];

const productosTop = [
  { nombre: "Producto A", ventas: 195000 },
  { nombre: "Producto B", ventas: 188000 },
  { nombre: "Producto C", ventas: 178000 },
  { nombre: "Producto D", ventas: 173000 },
  { nombre: "Producto E", ventas: 150000 },
  { nombre: "Producto F", ventas: 135000 },
  { nombre: "Producto G", ventas: 132000 },
  { nombre: "Producto H", ventas: 118000 },
];

const zonas = [
  { nombre: "Zona 14", nuevos: 40, existentes: 8 },
  { nombre: "Zona 15", nuevos: 140, existentes: 33 },
  { nombre: "Zona 16", nuevos: 82, existentes: 21 },
  { nombre: "Zona 17", nuevos: 85, existentes: 20 },
  { nombre: "Zona 18", nuevos: 72, existentes: 23 },
];

const ventasDetalle = [
  { id: 8, zona: "Zona 15", vendedor: "Alivia", meta: 282000, venta: 6716, visitas: 174 },
  { id: 9, zona: "Zona 15", vendedor: "Brodie", meta: 282000, venta: 6198, visitas: 174 },
  { id: 10, zona: "Zona 15", vendedor: "Cassie", meta: 282000, venta: 2793, visitas: 174 },
  { id: 11, zona: "Zona 15", vendedor: "Celia", meta: 282000, venta: 2265, visitas: 174 },
  { id: 12, zona: "Zona 16", vendedor: "Chen", meta: 282000, venta: 5150, visitas: 160 },
  { id: 13, zona: "Zona 16", vendedor: "Floyd", meta: 282000, venta: 1822, visitas: 160 },
  { id: 14, zona: "Zona 17", vendedor: "Haider", meta: 282000, venta: 1889, visitas: 150 },
  { id: 15, zona: "Zona 17", vendedor: "Hayley", meta: 282000, venta: 1940, visitas: 150 },
  { id: 16, zona: "Zona 18", vendedor: "Holland", meta: 282000, venta: 2002, visitas: 130 },
];

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 0,
  }).format(valor);

function Panel({ titulo, children, action }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e9edf3",
        borderRadius: 2,
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssessmentRounded color="primary" fontSize="small" />
            <Typography fontWeight={700} fontSize={14}>
              {titulo}
            </Typography>
          </Stack>
          {action}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

function Indicador({ titulo, valor, porcentaje, subtitulo, icono, color, fondo }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        height: "100%",
        color: "#fff",
        background: `linear-gradient(120deg, ${color}, ${fondo})`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: 2.2, position: "relative", zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700} fontSize={13}>
            {titulo}
          </Typography>
          {icono}
        </Stack>

        <Typography fontWeight={800} fontSize={{ xs: 23, md: 26 }} sx={{ mt: 2 }}>
          {valor}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
          <TrendingUpRounded sx={{ fontSize: 17 }} />
          <Typography fontWeight={700} fontSize={12}>
            {porcentaje}
          </Typography>
          <Typography fontSize={11} sx={{ opacity: 0.85 }}>
            {subtitulo}
          </Typography>
        </Stack>
      </CardContent>

      <Box
        sx={{
          position: "absolute",
          width: 150,
          height: 150,
          border: "1px solid rgba(255,255,255,.13)",
          borderRadius: "50%",
          right: -55,
          bottom: -90,
        }}
      />
    </Card>
  );
}

function GraficaBarras() {
  const maximo = 30000;

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <Box sx={{ width: 9, height: 9, bgcolor: "#2165e9" }} />
          <Typography fontSize={11} color="text.secondary">2026</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <Box sx={{ width: 9, height: 9, bgcolor: "#80baff" }} />
          <Typography fontSize={11} color="text.secondary">2025</Typography>
        </Stack>
      </Stack>

      <Box sx={{ display: "flex", height: 220 }}>
        <Stack justifyContent="space-between" sx={{ pr: 1, pb: 3 }}>
          {[30000, 20000, 10000, 0].map((v) => (
            <Typography key={v} fontSize={10} color="text.secondary">
              {v / 1000}k
            </Typography>
          ))}
        </Stack>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            borderBottom: "1px solid #dfe5ed",
            backgroundImage: "linear-gradient(to bottom, #edf0f5 1px, transparent 1px)",
            backgroundSize: "100% 33.33%",
          }}
        >
          {ventasMensuales.map((item) => (
            <Stack
              key={item.mes}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ height: "100%", flex: 1 }}
            >
              <Stack direction="row" spacing="2px" alignItems="flex-end" sx={{ height: "100%", width: "100%", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: "35%",
                    maxWidth: 17,
                    height: `${(item.actual / maximo) * 100}%`,
                    bgcolor: "#2165e9",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
                <Box
                  sx={{
                    width: "35%",
                    maxWidth: 17,
                    height: `${(item.anterior / maximo) * 100}%`,
                    bgcolor: "#80baff",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              </Stack>
              <Typography fontSize={9} color="text.secondary" sx={{ mt: 0.7 }}>
                {item.mes}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function GraficaVisitas() {
  const puntos = visitasMensuales
    .map((v, i) => `${i * 45},${180 - v * 3.1}`)
    .join(" ");

  const puntosArea = `0,180 ${puntos} 495,180`;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Box sx={{ width: 12, height: 2, bgcolor: "#2165e9" }} />
          <Typography fontSize={10} color="text.secondary">Nuevos clientes</Typography>
        </Stack>
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Box sx={{ width: 12, height: 2, bgcolor: "#f59e0b" }} />
          <Typography fontSize={10} color="text.secondary">Clientes existentes</Typography>
        </Stack>
      </Stack>

      <svg viewBox="0 0 510 220" width="100%" preserveAspectRatio="none">
        {[30, 70, 110, 150, 190].map((y) => (
          <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#edf0f4" strokeWidth="1" />
        ))}
        <polygon points={puntosArea} fill="#2165e9" opacity="0.10" />
        <polyline
          points={puntos}
          fill="none"
          stroke="#2165e9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,165 45,175 90,180 135,165 180,170 225,150 270,170 315,165 360,170 405,170 450,150 495,165"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {visitasMensuales.map((v, i) => (
          <text key={i} x={i * 45} y="210" fontSize="10" fill="#8993a2" textAnchor="middle">
            {String(i + 1).padStart(2, "0")}
          </text>
        ))}
      </svg>
    </Box>
  );
}

function GraficaMarcas() {
  let acumulado = 0;
  const gradient = marcas.map((marca) => {
    const inicio = acumulado;
    acumulado += marca.valor;
    return `${marca.color} ${inicio}% ${acumulado}%`;
  }).join(", ");

  return (
    <Stack alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 190,
          height: 190,
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          sx={{
            width: 115,
            height: 115,
            borderRadius: "50%",
            bgcolor: "background.paper",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <Box>
            <Typography fontWeight={800} fontSize={22}>100%</Typography>
            <Typography color="text.secondary" fontSize={11}>Ventas</Typography>
          </Box>
        </Box>
      </Box>

      <Stack width="100%" spacing={1}>
        {marcas.map((marca) => (
          <Stack key={marca.nombre} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: marca.color }} />
            <Typography color="text.secondary" fontSize={12} sx={{ flex: 1 }}>
              {marca.nombre}
            </Typography>
            <Typography fontWeight={700} fontSize={12}>{marca.valor}%</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function GraficaProductos() {
  const maximo = Math.max(...productosTop.map((p) => p.ventas));

  return (
    <Stack spacing={1.7}>
      {productosTop.map((producto) => (
        <Stack key={producto.nombre} direction="row" alignItems="center" spacing={1}>
          <Typography fontSize={11} color="text.secondary" width={80}>
            {producto.nombre}
          </Typography>
          <Box sx={{ flex: 1, bgcolor: "#f0f2f5", height: 15, borderRadius: 0.5, overflow: "hidden" }}>
            <Box
              sx={{
                width: `${(producto.ventas / maximo) * 100}%`,
                height: "100%",
                bgcolor: "#78b9fa",
                borderRadius: 0.5,
              }}
            />
          </Box>
          <Typography fontSize={10} color="text.secondary" width={45} textAlign="right">
            {(producto.ventas / 1000).toFixed(0)}k
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function GraficaZonas() {
  return (
    <Box>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 9, height: 9, bgcolor: "#2165e9" }} />
          <Typography fontSize={10} color="text.secondary">Nuevos</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 9, height: 9, bgcolor: "#f5b642" }} />
          <Typography fontSize={10} color="text.secondary">Existentes</Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="flex-end" justifyContent="space-around" sx={{ height: 210, borderBottom: "1px solid #e5e7eb" }}>
        {zonas.map((zona) => (
          <Stack key={zona.nombre} alignItems="center" justifyContent="flex-end" sx={{ height: "100%", flex: 1 }}>
            <Stack width="65%" sx={{ maxWidth: 38 }}>
              <Box sx={{ height: `${zona.existentes * 0.85}px`, bgcolor: "#f5b642" }} />
              <Box sx={{ height: `${zona.nuevos * 0.85}px`, bgcolor: "#2165e9" }} />
            </Stack>
            <Typography fontSize={10} color="text.secondary" sx={{ mt: 1 }}>
              {zona.nombre}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default function Inicio() {
  const theme = useTheme();
  const { usuario } = useAuth();

  const [periodo, setPeriodo] = useState("2026");
  const [mes, setMes] = useState("Octubre");
  const [region, setRegion] = useState("Todas");

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, bgcolor: "#f5f6f8", minHeight: "100%" }}>
      {/* INDICADORES */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
        <Indicador
          titulo="Ventas del mes"
          valor="Q 48,250"
          porcentaje="+12.5%"
          subtitulo="vs. mes anterior"
          icono={<PointOfSaleRounded sx={{ fontSize: 27, opacity: 0.9 }} />}
          color="#1e50a2"
          fondo="#3779d1"
        />
        <Indicador
          titulo="Compras del mes"
          valor="Q 21,800"
          porcentaje="+8.2%"
          subtitulo="vs. mes anterior"
          icono={<ShoppingCartRounded sx={{ fontSize: 27, opacity: 0.9 }} />}
          color="#c65b31"
          fondo="#f18b59"
        />
        <Indicador
          titulo="Clientes registrados"
          valor="1,063"
          porcentaje="+15.3%"
          subtitulo="clientes nuevos"
          icono={<PeopleAltRounded sx={{ fontSize: 27, opacity: 0.9 }} />}
          color="#a97709"
          fondo="#eebd29"
        />
        <Indicador
          titulo="Ganancia estimada"
          valor="Q 12,450"
          porcentaje="+10.8%"
          subtitulo="vs. mes anterior"
          icono={<AccountBalanceWalletRounded sx={{ fontSize: 27, opacity: 0.9 }} />}
          color="#28745c"
          fondo="#49a98b"
        />
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2.1fr) minmax(300px, 1fr)" },
        gap: 2,
        alignItems: "start",
      }}>
        {/* COLUMNA IZQUIERDA */}
        <Stack spacing={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Panel titulo="Tendencia de ventas">
              <GraficaBarras />
            </Panel>

            <Panel titulo="Tendencia de clientes">
              <GraficaVisitas />
            </Panel>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <Panel titulo="Productos más vendidos">
              <GraficaProductos />
            </Panel>

            <Panel titulo="Análisis de ventas por sucursal">
              <GraficaZonas />
            </Panel>
          </Box>
        </Stack>

        {/* COLUMNA DERECHA */}
        <Stack spacing={2}>
          <Panel titulo="Distribución de ventas por marca">
            <GraficaMarcas />
          </Panel>

          <Panel
            titulo="Detalle de ventas"
            action={<Chip label="Ver reporte" size="small" color="primary" variant="outlined" />}
          >
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f2f5fa" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Sucursal</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Vendedor</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11 }}>Venta</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11 }}>Visitas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasDetalle.map((fila) => (
                    <TableRow key={fila.id} hover>
                      <TableCell sx={{ fontSize: 11 }}>{fila.id}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{fila.zona}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{fila.vendedor}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 11 }}>
                        {formatoMoneda(fila.venta)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 11 }}>{fila.visitas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Panel>

          <Panel titulo="Alertas de inventario">
            <Stack spacing={2}>
              {[
                { nombre: "Mouse inalámbrico", stock: 3, minimo: 10 },
                { nombre: "Teclado mecánico", stock: 5, minimo: 10 },
                { nombre: "Cable USB-C", stock: 2, minimo: 15 },
              ].map((p) => (
                <Box key={p.nombre}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                    <Typography fontSize={12} fontWeight={600}>{p.nombre}</Typography>
                    <Typography fontSize={11} color="error.main" fontWeight={700}>
                      {p.stock} unidades
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(p.stock / p.minimo) * 100}
                    color="warning"
                    sx={{ height: 7, borderRadius: 5 }}
                  />
                  <Typography fontSize={10} color="text.secondary" sx={{ mt: 0.5 }}>
                    Stock mínimo: {p.minimo}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Panel>
        </Stack>
      </Box>

      <Typography
        textAlign="center"
        color="text.secondary"
        fontSize={11}
        sx={{ mt: 3 }}
      >
        Panel de Control Comercial · Reportes administrativos
      </Typography>
    </Box>
  );
}
