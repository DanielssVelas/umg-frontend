
import { Box, Paper, Typography } from "@mui/material";

export default function Usuarios() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Usuarios
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>
          Aquí construiremos el módulo de usuarios.
        </Typography>
      </Paper>
    </Box>
  );
}
