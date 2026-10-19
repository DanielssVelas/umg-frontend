import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material"

import AddIcon from "@mui/icons-material/Add"
import SaveIcon from "@mui/icons-material/Save"
import EditIcon from "@mui/icons-material/Edit"
import useToast from "../commonts/useToast"

export default function Productos() {
  const { showToast } = useToast()
  const api = import.meta.env.VITE_BACKEND_URL

  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // null = crear objeto = editar
  const [productoEditar, setProductoEditar] = useState(null)

  const [form, setForm] = useState({
    nombre: "",
    precio_compra: "",
    precio_venta: "",
  })


  // Obtener productos
  const getProductos = async () => {
    try {
      setLoading(true)
      setError("")

      const result = await axios.get(`${api}/products`)

      setProductos(result.data?.data?.rows || [])
    } catch (e) {
      console.error("Error al obtener productos:", e)

      setError(
        e.response?.data?.message ||
          "No se pudieron cargar los productos."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProductos()
  }, [])

  // Actualizar campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Abrir modal para crear
  const abrirModal = () => {
    setProductoEditar(null)

    setForm({
      nombre: "",
      precio_compra: "",
      precio_venta: "",
    })

    setOpenModal(true)
  }

  // Abrir modal para editar
  const editarProducto = (producto) => {
    setProductoEditar(producto)

    setForm({
      nombre: producto.NOMBRE ?? "",
      precio_compra: String(producto.PRECIO_COMPRA ?? ""),
      precio_venta: String(producto.PRECIO_VENTA ?? ""),
    })

    setOpenModal(true)
  }

  // Cerrar modal
  const cerrarModal = () => {
    if (saving) return

    setOpenModal(false)
    setProductoEditar(null)
  }

  // Crear o actualizar producto
  const crearProducto = async (e) => {
    e.preventDefault()

    if (saving) return

    const nombre = form.nombre.trim()
    const compra = Number(form.precio_compra)
    const venta = Number(form.precio_venta)

    // Validar nombre
    if (!nombre) {
      showToast("El nombre del producto es obligatorio.", "error")
      return
    }

    // Validar precios
    if (
      form.precio_compra.trim() === "" ||
      form.precio_venta.trim() === "" ||
      !Number.isFinite(compra) ||
      !Number.isFinite(venta) ||
      compra < 0 ||
      venta < 0
    ) {
      showToast("Ingresa precios válidos y no negativos.", "error")
      return
    }

    try {
      setSaving(true)

      const response = await axios.post(`${api}/crear-producto`, {
        id_producto: productoEditar?.ID_PRODUCTO ?? null,
        nombre,
        precio_compra: compra,
        precio_venta: venta,
      })

      const data = response.data
      const resultado = data?.data
      showToast(resultado.mensaje, resultado.flag ? "success" : "error" )
      setOpenModal(false)
      await getProductos()
    } catch (e) {
      console.error("Error al guardar producto:", e)
      showToast('No se pudo guardar el producto.', "error" )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mt: 3 }}>
        {/* Encabezado */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Productos
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModal}
          >
            Crear producto
          </Button>
        </Box>

        {/* Tabla de productos */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={getProductos}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : productos.length === 0 ? (
          <Alert severity="info">
            No hay productos registrados.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Acciones</strong>
                  </TableCell>
                  <TableCell>
                    <strong>ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Producto</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Precio Compra</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Precio Venta</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Stock</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Stock Mínimo</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.ID_PRODUCTO} hover>
                    <TableCell>
                    <Tooltip title="Editar producto">
                      <IconButton
                        size="small"
                        onClick={() => editarProducto(producto)}
                        aria-label="Editar producto"
                        sx={{
                          color: "inherit",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                    <TableCell>
                      {producto.ID_PRODUCTO}
                    </TableCell>

                    <TableCell>{producto.NOMBRE}</TableCell>

                    <TableCell>
                      Q{" "}
                      {Number(producto.PRECIO_COMPRA).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      Q{" "}
                      {Number(producto.PRECIO_VENTA).toFixed(2)}
                    </TableCell>

                    <TableCell>{producto.STOCK}</TableCell>

                    <TableCell>{producto.STOCK_MINIMO}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal para crear o editar */}
      <Dialog
        open={openModal}
        onClose={cerrarModal}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={crearProducto}>
          <DialogTitle>
            {productoEditar ? "Editar producto" : "Crear producto"}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Nombre del producto"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                fullWidth
                required
                autoFocus
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Precio de compra"
                name="precio_compra"
                type="number"
                value={form.precio_compra}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />

              <TextField
                label="Precio de venta"
                name="precio_venta"
                type="number"
                value={form.precio_venta}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={cerrarModal}
              disabled={saving}
              color="inherit"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : productoEditar
                  ? "Actualizar producto"
                  : "Guardar producto"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}