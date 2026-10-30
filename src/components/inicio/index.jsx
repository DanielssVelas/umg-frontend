import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Stack
} from "@mui/material";
import {
    Inventory2Rounded,
    PointOfSaleRounded,
    AccountBalanceWalletRounded,
    ShoppingCartRounded
} from "@mui/icons-material";
import { useAuth } from "../../auth/AuthContext";

export default function Inicio() {
    const { usuario } = useAuth();

    const tarjetas = [
        {
            titulo: "Productos",
            descripcion: "Administración de inventario",
            icono: <Inventory2Rounded />,
        },
        {
            titulo: "Ventas",
            descripcion: "Registro de ventas",
            icono: <PointOfSaleRounded />,
        },
        {
            titulo: "Caja",
            descripcion: "Control de caja",
            icono: <AccountBalanceWalletRounded />,
        },
        {
            titulo: "Compras",
            descripcion: "Historial de compras",
            icono: <ShoppingCartRounded />,
        },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={1}>
                Bienvenido, {usuario?.usuario}
            </Typography>

            <Typography color="text.secondary" mb={4}>
                Panel principal de NEXUS Administration.
                Desde aquí puedes acceder a las funciones del sistema.
            </Typography>

            <Grid container spacing={3}>
                {tarjetas.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.titulo}>
                        <Card sx={{ height: "100%", borderRadius: 3 }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "primary.light",
                                            color: "primary.main",
                                        }}
                                    >
                                        {item.icono}
                                    </Box>

                                    <Typography variant="h6" fontWeight={700}>
                                        {item.titulo}
                                    </Typography>

                                    <Typography color="text.secondary" variant="body2">
                                        {item.descripcion}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
