
import { useEffect, useState } from "react";
import axios from "axios";

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
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip
} from "@mui/material";

import {
    Add,
    Lock,
    LockOpen,
    Visibility,
    Refresh,
    Close,
    AccountBalanceWallet,
} from "@mui/icons-material";
import { useAuth } from "../../auth/AuthContext";

// ==========================================
// CONFIGURACIÓN
// ==========================================
const api = import.meta.env.VITE_BACKEND_URL

const API = {
    consultarCaja: `${api}/check-account`,
    gestionarCaja: `${api}/manage-cash`,
}

const initialForm = {
    nombre: "Caja principal",
    montoInicial: "",
};

const moneda = (valor = 0) =>
    new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
    }).format(Number(valor) || 0);

const fechaFormato = (fecha) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleString("es-GT", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

const CajaPage = () => {
    const { usuario } = useAuth();

    const USUARIO = {
        id: usuario?.idUsuario,
        nombre: usuario?.usuario,
    }
    const [cajas, setCajas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal apertura
    const [openApertura, setOpenApertura] = useState(false);
    const [form, setForm] = useState(initialForm);

    // Modal cierre
    const [openCierre, setOpenCierre] = useState(false);
    const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
    const [montoContado, setMontoContado] = useState("");

    // Modal reporte
    const [openReporte, setOpenReporte] = useState(false);

    // Notificaciones
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const consultarCajas = async (mostrarCarga = true) => {
        if (mostrarCarga) setLoading(true);

        try {
            const response = await axios.get(
                `${API.consultarCaja}/${USUARIO.id}`
            );

            const data = response.data;

            if (!data.result || !data.data?.flag) {
                setCajas([]);
                return;
            }

            const rows = data.data.rows || [];
            console.log('rows', rows);
            
            // Mostrar todas las cajas del usuario
            setCajas(rows);

        } catch (error) {
            console.error("Error consultando cajas:", error);

            showNotification(
                error.response?.data?.mensaje ||
                "No fue posible consultar las cajas.",
                "error"
            );

        } finally {
            if (mostrarCarga) setLoading(false);
        }
    };

    useEffect(() => {
        consultarCajas();
    }, []);


    const cajaAbierta = cajas.find(
        (item) =>
            item.estado?.trim().toUpperCase() === "ABIERTA"
    );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const abrirModalApertura = () => {
        setForm(initialForm);
        setOpenApertura(true);
    };

    const abrirCaja = async (event) => {
        event.preventDefault();

        if (!form.nombre.trim()) {
            showNotification(
                "Ingresa el nombre de la caja.",
                "warning"
            );
            return;
        }

        if (
            form.montoInicial === "" ||
            !Number.isFinite(Number(form.montoInicial)) ||
            Number(form.montoInicial) < 0
        ) {
            showNotification(
                "Ingresa un monto inicial válido.",
                "warning"
            );
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(
                API.gestionarCaja,
                {
                    p_accion: "ABRIR",
                    p_usuario: USUARIO.id,
                    p_nombre: form.nombre.trim(),
                    p_monto_inicial: Number(form.montoInicial),
                }
            );
            console.log('response', response);
            
            const { flag: resultado, mensaje } = response.data.data

            if (!resultado) {
                showNotification(
                    mensaje || "No fue posible aperturar la caja.",
                    "error"
                );
                return;
            }

            showNotification(
                mensaje || "Caja aperturada correctamente."
            );

            setOpenApertura(false);
            setForm(initialForm);

            await consultarCajas(false);

        } catch (error) {
            console.error("Error aperturando caja:", error);

            showNotification(
                error.response?.data?.mensaje ||
                "Error al aperturar la caja.",
                "error"
            );

        } finally {
            setSaving(false);
        }
    };

    const abrirModalCierre = (caja) => {
        setCajaSeleccionada(caja);
        setMontoContado("");
        setOpenCierre(true);
    };

    const cerrarCaja = async () => {
        if (
            montoContado === "" ||
            !Number.isFinite(Number(montoContado)) ||
            Number(montoContado) < 0
        ) {
            showNotification(
                "Ingresa el efectivo contado correctamente.",
                "warning"
            );
            return;
        }

        if (!cajaSeleccionada?.idCaja) {
            showNotification(
                "No se encontró el identificador de caja.",
                "error"
            );
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(
                API.gestionarCaja,
                {
                    p_accion: "CERRAR",
                    p_usuario: USUARIO.id,
                    p_id_caja: cajaSeleccionada.idCaja,
                    p_monto_contado: Number(montoContado),
                }
            );

            const { flag: resultado, mensaje } = response.data.data

            if (!resultado) {
                showNotification(
                    mensaje || "No fue posible cerrar la caja.",
                    "error"
                );
                return;
            }

            showNotification(
                mensaje || "Caja cerrada correctamente."
            );

            setOpenCierre(false);
            setCajaSeleccionada(null);
            setMontoContado("");

            await consultarCajas(false);

        } catch (error) {
            console.error("Error cerrando caja:", error);

            showNotification(
                error.response?.data?.mensaje ||
                "Error al realizar el cierre.",
                "error"
            );

        } finally {
            setSaving(false);
        }
    };

    const verReporte = (caja) => {
        setCajaSeleccionada(caja);
        setOpenReporte(true);
    };

    // ==========================================
    // VALORES DEL REPORTE
    // ==========================================

    const montoInicial = Number(
        cajaSeleccionada?.montoInicial || 0
    );

    const totalVentas = Number(
        cajaSeleccionada?.totalVentas || 0
    );

    const entradas = Number(
        cajaSeleccionada?.entradas || 0
    );

    const salidas = Number(
        cajaSeleccionada?.salidas || 0
    );

    const montoEsperado = Number(
        cajaSeleccionada?.montoEsperado ??
        (montoInicial + totalVentas + entradas - salidas)
    );

    const diferencia =
        Number(montoContado || 0) - montoEsperado;
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
            >
                <CircularProgress />
            </Box>
        );
    }
return (
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

        <Card
            elevation={0}
            sx={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 2.5,
                overflow: "hidden",
                backgroundColor: "#fff",
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    "&:last-child": { pb: 2.5 },
                }}
            >
                {/* ENCABEZADO */}

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                    mb={2.5}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: "#172033",
                                fontSize: { xs: 21, md: 24 },
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Gestión de cajas
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Control de aperturas, cierres e historial de caja.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <Tooltip title="Actualizar información">
                            <span>
                                <IconButton
                                    onClick={() => consultarCajas()}
                                    disabled={loading}
                                    size="small"
                                    sx={{
                                        border: "1px solid #dbe2ea",
                                        borderRadius: 1.5,
                                        width: 36,
                                        height: 36,
                                        color: "#475569",
                                    }}
                                >
                                    <Refresh fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<Add />}
                            onClick={abrirModalApertura}
                            disabled={Boolean(cajaAbierta)}
                            sx={{
                                height: 36,
                                px: 1.8,
                                borderRadius: 1.5,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                whiteSpace: "nowrap",
                                boxShadow: "none",
                                backgroundColor: "#2563eb",
                                "&:hover": {
                                    backgroundColor: "#1d4ed8",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Aperturar caja
                        </Button>
                    </Stack>
                </Stack>

                {/* INDICADORES */}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(3, 1fr)",
                        },
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.8,
                            borderRadius: 2,
                            borderColor: "#e5eaf1",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                        >
                            TOTAL DE CAJAS
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#172033"
                            mt={0.3}
                        >
                            {cajas.length}
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.8,
                            borderRadius: 2,
                            borderColor: "#bbf7d0",
                            backgroundColor: "#f0fdf4",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="success.dark"
                            fontWeight={600}
                        >
                            CAJAS ABIERTAS
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="success.dark"
                            mt={0.3}
                        >
                            {cajas.filter(
                                (item) =>
                                    item.estado?.trim().toUpperCase() === "ABIERTA"
                            ).length}
                        </Typography>
                    </Paper>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.8,
                            borderRadius: 2,
                            borderColor: "#e5eaf1",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                        >
                            CAJAS CERRADAS
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#475569"
                            mt={0.3}
                        >
                            {cajas.filter(
                                (item) =>
                                    item.estado?.trim().toUpperCase() === "CERRADA"
                            ).length}
                        </Typography>
                    </Paper>
                </Box>

                {/* AVISO DE CAJA ABIERTA */}

                {cajaAbierta && (
                    <Alert
                        severity="info"
                        icon={<LockOpen fontSize="small" />}
                        sx={{
                            mb: 2.5,
                            borderRadius: 1.5,
                            py: 0.2,
                            alignItems: "center",
                            "& .MuiAlert-message": {
                                fontSize: 13,
                            },
                        }}
                    >
                        Tienes una caja abierta:{" "}
                        <strong>{cajaAbierta.nombre}</strong>.
                        Debes cerrarla antes de aperturar otra.
                    </Alert>
                )}

                {/* ENCABEZADO DE TABLA */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.5}
                >
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color="#172033"
                        >
                            Historial de cajas
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Registro de cajas del usuario
                        </Typography>
                    </Box>

                    <Chip
                        size="small"
                        label={`${cajas.length} registros`}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                        }}
                    />
                </Stack>

                {/* TABLA */}

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        width: "100%",
                        border: "1px solid #e5eaf1",
                        borderRadius: 2,
                        overflowX: "auto",
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            width: "100%",
                            minWidth: 680,
                            tableLayout: "auto",

                            "& .MuiTableCell-root": {
                                borderBottom: "1px solid #edf0f4",
                                px: 1.5,
                                py: 1.6,
                                fontSize: 13,
                            },

                            "& .MuiTableHead-root .MuiTableCell-root": {
                                backgroundColor: "#f8fafc",
                                color: "#475569",
                                fontWeight: 700,
                                fontSize: 12,
                                whiteSpace: "nowrap",
                                py: 1.5,
                            },

                            "& .MuiTableBody-root .MuiTableRow-root:hover": {
                                backgroundColor: "#f8fafc",
                            },

                            "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
                                borderBottom: 0,
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" width={105}>
                                    ACCIONES
                                </TableCell>

                                <TableCell width={65}>
                                    ID
                                </TableCell>

                                <TableCell>
                                    CAJA
                                </TableCell>

                                <TableCell>
                                    FECHA APERTURA
                                </TableCell>

                                <TableCell align="right">
                                    MONTO INICIAL
                                </TableCell>

                                <TableCell align="right">
                                    VENTAS
                                </TableCell>

                                <TableCell align="right">
                                    MONTO ESPERADO
                                </TableCell>

                                <TableCell align="center">
                                    ESTADO
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {cajas.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <AccountBalanceWallet
                                            sx={{
                                                fontSize: 38,
                                                color: "#94a3b8",
                                                mb: 1,
                                            }}
                                        />

                                        <Typography
                                            fontWeight={600}
                                            color="#475569"
                                        >
                                            No hay cajas registradas
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Apertura una caja para comenzar.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cajas.map((item) => {
                                    const abierta =
                                        item.estado?.trim().toUpperCase() === "ABIERTA";

                                    return (
                                        <TableRow
                                            key={item.idCaja}
                                            hover
                                        >
                                            {/* ACCIONES */}

                                            <TableCell align="center">
                                                {abierta ? (
                                                    <Tooltip title="Cerrar esta caja">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                abrirModalCierre(item)
                                                            }
                                                            sx={{
                                                                border: "1px solid #fecaca",
                                                                borderRadius: 1.5,
                                                                width: 32,
                                                                height: 32,
                                                                backgroundColor: "#fff7f7",
                                                            }}
                                                        >
                                                            <Lock fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Consultar reporte">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                verReporte(item)
                                                            }
                                                            sx={{
                                                                border: "1px solid #dbeafe",
                                                                borderRadius: 1.5,
                                                                width: 32,
                                                                height: 32,
                                                                backgroundColor: "#eff6ff",
                                                            }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                            {/* ID */}

                                            <TableCell>
                                                <Typography
                                                    fontWeight={600}
                                                    color="#475569"
                                                >
                                                    #{item.idCaja}
                                                </Typography>
                                            </TableCell>

                                            {/* NOMBRE */}

                                            <TableCell>
                                                <Typography
                                                    fontWeight={600}
                                                    color="#172033"
                                                >
                                                    {item.nombre || "Caja principal"}
                                                </Typography>
                                            </TableCell>

                                            {/* FECHA */}

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color="#475569"
                                                    sx={{ whiteSpace: "nowrap" }}
                                                >
                                                    {fechaFormato(item.fechaApertura)}
                                                </Typography>
                                            </TableCell>

                                            {/* MONTO INICIAL */}

                                            <TableCell align="right">
                                                {moneda(item.montoInicial)}
                                            </TableCell>

                                            {/* VENTAS */}

                                            <TableCell align="right">
                                                {moneda(item.totalVentas)}
                                            </TableCell>

                                            {/* MONTO ESPERADO */}

                                            <TableCell align="right">
                                                <Typography
                                                    fontWeight={600}
                                                    color="#172033"
                                                >
                                                    {moneda(item.montoEsperado)}
                                                </Typography>
                                            </TableCell>

                                            {/* ESTADO */}

                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={abierta ? "ABIERTA" : "CERRADA"}
                                                    color={abierta ? "success" : "default"}
                                                    sx={{
                                                        height: 24,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        borderRadius: 1.2,
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PIE */}

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={0.5}
                    mt={1.5}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Mostrando {cajas.length} registros
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Usuario: {USUARIO.nombre}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>

        {/* ==========================================
            MODAL APERTURA
        ========================================== */}

        <Dialog
            open={openApertura}
            onClose={() => !saving && setOpenApertura(false)}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight={700}>
                        Aperturar caja
                    </Typography>

                    <IconButton
                        size="small"
                        onClick={() => setOpenApertura(false)}
                        disabled={saving}
                    >
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Box component="form" onSubmit={abrirCaja}>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label="Nombre de caja"
                            name="nombre"
                            size="small"
                            value={form.nombre}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Monto inicial"
                            name="montoInicial"
                            size="small"
                            type="number"
                            value={form.montoInicial}
                            onChange={handleChange}
                            fullWidth
                            required
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    step: "0.01",
                                },
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            Q
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        size="small"
                        onClick={() => setOpenApertura(false)}
                        disabled={saving}
                        sx={{ textTransform: "none" }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        size="small"
                        variant="contained"
                        disabled={saving}
                        startIcon={
                            saving
                                ? <CircularProgress size={15} color="inherit" />
                                : <LockOpen />
                        }
                        sx={{ textTransform: "none" }}
                    >
                        Confirmar apertura
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>

        {/* ==========================================
            MODAL CIERRE
        ========================================== */}

        <Dialog
            open={openCierre}
            onClose={() => !saving && setOpenCierre(false)}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight={700}>
                        Cerrar caja
                    </Typography>

                    <IconButton
                        size="small"
                        onClick={() => setOpenCierre(false)}
                        disabled={saving}
                    >
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Alert severity="warning">
                        Confirma el efectivo físico antes de cerrar esta caja.
                    </Alert>

                    <Typography variant="subtitle2">
                        {cajaSeleccionada?.nombre} · #{cajaSeleccionada?.idCaja}
                    </Typography>

                    <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                    >
                        <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Monto inicial
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {moneda(cajaSeleccionada?.montoInicial)}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Ventas
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {moneda(cajaSeleccionada?.totalVentas)}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Entradas
                                </Typography>
                                <Typography variant="body2" color="success.main">
                                    {moneda(cajaSeleccionada?.entradas)}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Salidas
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                    {moneda(cajaSeleccionada?.salidas)}
                                </Typography>
                            </Stack>

                            <Divider />

                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" fontWeight={700}>
                                    Efectivo esperado
                                </Typography>
                                <Typography variant="body2" fontWeight={800}>
                                    {moneda(cajaSeleccionada?.montoEsperado)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Paper>

                    <TextField
                        label="Efectivo contado"
                        type="number"
                        size="small"
                        fullWidth
                        value={montoContado}
                        onChange={(e) => setMontoContado(e.target.value)}
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                step: "0.01",
                            },
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        Q
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {montoContado !== "" &&
                        Number.isFinite(Number(montoContado)) &&
                        Number(montoContado) >= 0 && (
                            <Alert
                                severity={
                                    diferencia === 0
                                        ? "success"
                                        : diferencia < 0
                                            ? "error"
                                            : "warning"
                                }
                            >
                                <strong>Diferencia: {moneda(diferencia)}</strong>
                                <Typography variant="caption" display="block">
                                    {diferencia === 0
                                        ? "El efectivo coincide."
                                        : diferencia < 0
                                            ? "Existe un faltante."
                                            : "Existe un sobrante."}
                                </Typography>
                            </Alert>
                        )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    size="small"
                    onClick={() => setOpenCierre(false)}
                    disabled={saving}
                    sx={{ textTransform: "none" }}
                >
                    Cancelar
                </Button>

                <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={cerrarCaja}
                    disabled={
                        saving ||
                        montoContado === "" ||
                        !Number.isFinite(Number(montoContado)) ||
                        Number(montoContado) < 0
                    }
                    startIcon={
                        saving
                            ? <CircularProgress size={15} color="inherit" />
                            : <Lock />
                    }
                    sx={{ textTransform: "none" }}
                >
                    Confirmar cierre
                </Button>
            </DialogActions>
        </Dialog>

        {/* ==========================================
            MODAL REPORTE HISTÓRICO
        ========================================== */}

        <Dialog
            open={openReporte}
            onClose={() => setOpenReporte(false)}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight={700}>
                        Reporte de caja
                    </Typography>

                    <IconButton
                        size="small"
                        onClick={() => setOpenReporte(false)}
                    >
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box>
                        <Typography fontWeight={700}>
                            {cajaSeleccionada?.nombre}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            Caja #{cajaSeleccionada?.idCaja}
                        </Typography>
                    </Box>

                    <Chip
                        label={cajaSeleccionada?.estado}
                        color="default"
                        size="small"
                        sx={{ alignSelf: "flex-start" }}
                    />

                    <Divider />

                    {[
                        ["Fecha de apertura", fechaFormato(cajaSeleccionada?.fechaApertura)],
                        ["Monto inicial", moneda(cajaSeleccionada?.montoInicial)],
                        ["Total ventas", moneda(cajaSeleccionada?.totalVentas)],
                        ["Entradas", moneda(cajaSeleccionada?.entradas)],
                        ["Salidas", moneda(cajaSeleccionada?.salidas)],
                        ["Monto esperado", moneda(cajaSeleccionada?.montoEsperado)],
                    ].map(([label, value]) => (
                        <Stack
                            key={label}
                            direction="row"
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {label}
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                                textAlign="right"
                            >
                                {value}
                            </Typography>
                        </Stack>
                    ))}

                    {cajaSeleccionada?.montoContado != null && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                Efectivo contado
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {moneda(cajaSeleccionada.montoContado)}
                            </Typography>
                        </Stack>
                    )}

                    {cajaSeleccionada?.diferencia != null && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                Diferencia
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                                {moneda(cajaSeleccionada.diferencia)}
                            </Typography>
                        </Stack>
                    )}

                    {cajaSeleccionada?.fechaCierre && (
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                Fecha de cierre
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {fechaFormato(cajaSeleccionada.fechaCierre)}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => setOpenReporte(false)}
                    sx={{ textTransform: "none" }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>

        {/* NOTIFICACIONES */}

        <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={closeNotification}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
        >
            <Alert
                onClose={closeNotification}
                severity={notification.severity}
                variant="filled"
                sx={{ width: "100%" }}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    </Box>
);

};

export default CajaPage;
