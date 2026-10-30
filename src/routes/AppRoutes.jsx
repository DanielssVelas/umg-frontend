
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Productos from "../components/productos";
import Ventas from "../components/ventas";
import Caja from "../components/caja";
import Compras from "../components/compras";
import HistorialCompras from "../components/historial-compras";
import Cotizaciones from "../components/cotizaciones";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="productos" element={<Productos />} />
        <Route path="venta" element={<Ventas />} />
        <Route path="caja" element={<Caja />} />
        <Route path="compras" element={<Compras />} />
        <Route path="historial-compras" element={<HistorialCompras />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
