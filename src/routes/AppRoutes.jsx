import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Productos from "../components/productos";
import Ventas from "../components/ventas";
import Proveedores from "../components/proveedores";
import Usuarios from "../pages/Usuarios";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={<Navigate to="/productos" replace />}
          />

          <Route path="productos" element={<Productos />} />
          <Route path="venta" element={<Ventas />} />
          <Route
            path="proveedores"
            element={<Proveedores />}
          />

          <Route element={<ProtectedRoute roles={["ADMINISTRADOR"]} />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}