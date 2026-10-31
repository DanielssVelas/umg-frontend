
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Productos from "../components/productos";
import Ventas from "../components/ventas";
import Caja from "../components/caja";
import Proveedores from "../components/proveedores";
import Compras from "../components/compras";
import HistorialCompras from "../components/historial-compras";
import Cotizaciones from "../components/cotizaciones";
import NuevaCotizacion from "../components/cotizaciones/nueva";

import Login from "../pages/Login";
import Inicio from "../components/inicio";
import Usuarios from "../pages/Usuarios";

import ProtectedRoute from "../auth/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            {/* RUTA PÚBLICA */}
            <Route path="/login" element={<Login />} />

            {/* RUTAS PROTEGIDAS */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                    <Route
                        index
                        element={<Navigate to="/inicio" replace />}
                    />

                    <Route path="inicio" element={<Inicio />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="venta" element={<Ventas />} />
                    <Route path="caja" element={<Caja />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="compras" element={<Compras />} />
                    <Route path="historial-compras" element={<HistorialCompras />} />
                    <Route path="cotizaciones" element={<Cotizaciones />} />
                    <Route path="cotizaciones/nueva" element={<NuevaCotizacion />} />

                    {/* RUTA EXCLUSIVA PARA ADMINISTRADORES */}
                    <Route element={<ProtectedRoute roles={["ADMINISTRADOR"]} />}>
                        <Route path="usuarios" element={<Usuarios />} />
                    </Route>
                </Route>
            </Route>

            {/* RUTAS NO ENCONTRADAS */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
