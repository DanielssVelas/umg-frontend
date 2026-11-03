import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box, Paper, Typography, Button, CircularProgress, Alert,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Stack, Chip
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import InventoryIcon from "@mui/icons-material/Inventory";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const obtenerFilas = (response) => {
  let data = response?.data;

  for (let i = 0; i < 4; i++) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    if (Array.isArray(data.rows)) return data.rows;
    if (Array.isArray(data.data)) return data.data;

    data = data.data;
  }

  return [];
};

export default function Kardex() {
  const api = import.meta.env.VITE_BACKEND_URL;

  const [tab, setTab] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [existencias, setExistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [movimientosRes, existenciasRes] = await Promise.all([
        axios.get(`${api}/kardex/movimientos`),
        axios.get(`${api}/kardex/existencias`)
      ]);

      setMovimientos(obtenerFilas(movimientosRes));
      setExistencias(obtenerFilas(existenciasRes));
    } catch (e) {
      console.error("Error al cargar Kardex:", e);
      setError(
        e.response?.data?.message ||
        e.response?.data?.data?.message ||
        "No se pudieron cargar los datos del Kardex."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formato = (valor) =>
    Number(valor ?? 0).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const fecha = (valor) => {
    if (!valor) return "—";
    const date = new Date(valor);
    return Number.isNaN(date.getTime())
      ? String(valor)
      : date.toLocaleDateString("es-GT");
  };

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const texto = filtro.toLowerCase();

      const coincideTexto =
        String(m.PRODUCTO ?? "").toLowerCase().includes(texto) ||
        String(m.ID_PRODUCTO ?? "").includes(texto) ||
        String(m.NUMERO_DOCUMENTO ?? "").toLowerCase().includes(texto);

      const coincideTipo =
        tipo === "TODOS" ||
        String(m.TIPO_MOVIMIENTO ?? "").toUpperCase() === tipo;

      return coincideTexto && coincideTipo;
    });
  }, [movimientos, filtro, tipo]);

  const existenciasFiltradas = existencias.filter((e) =>
    String(e.PRODUCTO ?? "").toLowerCase().includes(filtro.toLowerCase()) ||
    String(e.ID_PRODUCTO ?? "").includes(filtro)
  );

  const totalUnidades = existencias.reduce(
    (total, item) => total + Number(item.EXISTENCIA ?? 0), 0
  );

  const valorInventario = existencias.reduce(
    (total, item) => total + Number(item.VALOR_INVENTARIO ?? 0), 0
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>Kardex</Typography>
            <Typography variant="body2" color="text.secondary">
              Control de entradas, salidas y existencias del inventario.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={cargarDatos}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3
        }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <InventoryIcon color="primary" />
              <Typography color="text.secondary">Productos registrados</Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700}>
              {existencias.length}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SwapHorizIcon color="primary" />
              <Typography color="text.secondary">Movimientos registrados</Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700}>
              {movimientos.length}
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">Valor del inventario</Typography>
            <Typography variant="h5" fontWeight={700}>
              Q {formato(valorInventario)}
            </Typography>
          </Paper>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value) => {
            setTab(value);
            setFiltro("");
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="Movimientos" />
          <Tab label="Existencias" />
        </Tabs>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            label="Buscar producto o documento"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          {tab === 0 && (
            <TextField
              select
              native
              size="small"
              label="Tipo de movimiento"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 190 }}
            >
              <option value="TODOS">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </TextField>
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          movimientosFiltrados.length === 0 ? (
            <Alert severity="info">No hay movimientos registrados en el Kardex.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["ID", "Fecha", "Producto", "Movimiento", "Documento",
                      "Entrada", "Salida", "Existencia", "Costo unitario",
                      "Costo total", "Usuario"].map((col) => (
                      <TableCell key={col}><strong>{col}</strong></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientosFiltrados.map((m) => (
                    <TableRow key={m.ID_MOVIMIENTO} hover>
                      <TableCell>{m.ID_MOVIMIENTO}</TableCell>
                      <TableCell>{fecha(m.FECHA_MOVIMIENTO)}</TableCell>
                      <TableCell>{m.PRODUCTO}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={m.TIPO_MOVIMIENTO}
                          color={String(m.TIPO_MOVIMIENTO).toUpperCase() === "ENTRADA" ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>{m.TIPO_DOCUMENTO} {m.NUMERO_DOCUMENTO}</TableCell>
                      <TableCell>{formato(m.ENTRADA)}</TableCell>
                      <TableCell>{formato(m.SALIDA)}</TableCell>
                      <TableCell><strong>{formato(m.EXISTENCIA_RESULTANTE)}</strong></TableCell>
                      <TableCell>Q {formato(m.COSTO_UNITARIO)}</TableCell>
                      <TableCell>Q {formato(m.COSTO_TOTAL)}</TableCell>
                      <TableCell>{m.USUARIO ?? m.ID_USUARIO}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : existenciasFiltradas.length === 0 ? (
          <Alert severity="info">No hay productos registrados en el inventario.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Producto</strong></TableCell>
                  <TableCell align="right"><strong>Existencia</strong></TableCell>
                  <TableCell align="right"><strong>Costo promedio</strong></TableCell>
                  <TableCell align="right"><strong>Valor inventario</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existenciasFiltradas.map((e) => (
                  <TableRow key={e.ID_PRODUCTO} hover>
                    <TableCell>{e.ID_PRODUCTO}</TableCell>
                    <TableCell>{e.PRODUCTO}</TableCell>
                    <TableCell align="right">{formato(e.EXISTENCIA)}</TableCell>
                    <TableCell align="right">Q {formato(e.COSTO_PROMEDIO)}</TableCell>
                    <TableCell align="right">Q {formato(e.VALOR_INVENTARIO)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Unidades totales en inventario: {formato(totalUnidades)}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}