import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Productos from "../components/productos";
import Ventas from "../components/ventas";
import Proveedores from "../components/proveedores";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/productos" replace />} />
        <Route path="productos" element={<Productos />} />
        <Route path="venta" element={<Ventas />} />
        <Route path="proveedores" element={<Proveedores />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}