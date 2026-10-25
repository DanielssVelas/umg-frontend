
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

const stats = [
  {
    title: "Usuarios totales",
    value: "1,250",
    change: "+12.5%",
    positive: true,
    icon: <PeopleAltRoundedIcon />,
    color: "#2563EB",
    background: "#DBEAFE",
  },
  {
    title: "Ingresos totales",
    value: "Q25,400",
    change: "+8.2%",
    positive: true,
    icon: <PaymentsRoundedIcon />,
    color: "#059669",
    background: "#D1FAE5",
  },
  {
    title: "Pedidos",
    value: "320",
    change: "-2.4%",
    positive: false,
    icon: <ShoppingBagRoundedIcon />,
    color: "#D97706",
    background: "#FEF3C7",
  },
  {
    title: "Crecimiento",
    value: "18.6%",
    change: "+4.3%",
    positive: true,
    icon: <TrendingUpRoundedIcon />,
    color: "#7C3AED",
    background: "#EDE9FE",
  },
];

const weeklyData = [
  { day: "Lun", value: 42 },
  { day: "Mar", value: 68 },
  { day: "Mié", value: 54 },
  { day: "Jue", value: 85 },
  { day: "Vie", value: 62 },
  { day: "Sáb", value: 95 },
  { day: "Dom", value: 72 },
];

const activities = [
  {
    title: "Nuevo usuario registrado",
    description: "Carlos Méndez",
    time: "Hace 10 minutos",
    color: "#2563EB",
  },
  {
    title: "Pago recibido",
    description: "Transacción #1042",
    time: "Hace 35 minutos",
    color: "#059669",
  },
  {
    title: "Reporte generado",
    description: "Reporte mensual",
    time: "Hace 1 hora",
    color: "#7C3AED",
  },
];

function StatCard({ stat }) {
  const ChangeIcon = stat.positive
    ? ArrowUpwardRoundedIcon
    : ArrowDownwardRoundedIcon;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #E8EDF5",
        borderRadius: 3,
        transition: "transform .2s, box-shadow .2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px rgba(15,23,42,.06)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Typography fontSize={13} color="#64748B" fontWeight={500}>
            {stat.title}
          </Typography>

          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: stat.background,
              color: stat.color,
              borderRadius: 2,
            }}
          >
            {stat.icon}
          </Avatar>
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          letterSpacing={-1}
          color="#111827"
          sx={{ fontSize: { xs: 27, md: 30 } }}
        >
          {stat.value}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 0.5 }}>
          <ChangeIcon
            sx={{
              fontSize: 16,
              color: stat.positive ? "#059669" : "#DC2626",
            }}
          />
          <Typography
            fontSize={12}
            fontWeight={700}
            color={stat.positive ? "#059669" : "#DC2626"}
          >
            {stat.change}
          </Typography>
          <Typography fontSize={11} color="#94A3B8">
            vs. mes anterior
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <Box>
      {/* ENCABEZADO */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="#111827"
            letterSpacing={-1}
            sx={{ fontSize: { xs: 25, md: 31 } }}
          >
            Resumen general
          </Typography>

          <Typography color="#64748B" fontSize={13} sx={{ mt: 0.8 }}>
            Aquí tienes una visión general de tu actividad.
          </Typography>
        </Box>

        <Chip
          label="Datos de demostración"
          variant="outlined"
          sx={{
            bgcolor: "#FFFFFF",
            borderColor: "#E2E8F0",
            color: "#64748B",
            fontSize: 11,
          }}
        />
      </Box>

      {/* INDICADORES */}
      <Grid container spacing={2.5}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard stat={stat} />
          </Grid>
        ))}

        {/* GRÁFICO SEMANAL */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #E8EDF5",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography fontWeight={700} fontSize={16}>
                    Actividad semanal
                  </Typography>
                  <Typography color="#94A3B8" fontSize={12} sx={{ mt: 0.5 }}>
                    Resumen de actividad por día
                  </Typography>
                </Box>

                <Chip label="Esta semana" size="small" />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: { xs: 1, sm: 2 },
                  height: 220,
                  pt: 3,
                }}
              >
                {weeklyData.map((item, index) => (
                  <Box
                    key={item.day}
                    sx={{
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography fontSize={10} color="#64748B">
                      {item.value}
                    </Typography>

                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 48,
                        height: `${item.value}%`,
                        minHeight: 8,
                        bgcolor: index === 5 ? "#2563EB" : "#DBEAFE",
                        borderRadius: "7px 7px 2px 2px",
                        transition: "height .3s",
                      }}
                    />

                    <Typography fontSize={11} color="#64748B">
                      {item.day}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ACTIVIDAD RECIENTE */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #E8EDF5",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={700} fontSize={16}>
                Actividad reciente
              </Typography>

              <Typography color="#94A3B8" fontSize={12} sx={{ mt: 0.5, mb: 3 }}>
                Últimos movimientos
              </Typography>

              {activities.map((activity, index) => (
                <Box
                  key={activity.title}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    pb: 2.5,
                    mb: index < activities.length - 1 ? 2 : 0,
                    borderBottom:
                      index < activities.length - 1
                        ? "1px solid #F1F5F9"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      mt: 0.7,
                      borderRadius: "50%",
                      bgcolor: activity.color,
                      flexShrink: 0,
                      boxShadow: `0 0 0 4px ${activity.color}18`,
                    }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontSize={12} fontWeight={700}>
                      {activity.title}
                    </Typography>

                    <Typography fontSize={12} color="#64748B" sx={{ mt: 0.5 }}>
                      {activity.description}
                    </Typography>

                    <Typography fontSize={10} color="#94A3B8" sx={{ mt: 1 }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
