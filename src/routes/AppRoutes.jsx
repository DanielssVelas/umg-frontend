
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Productos from "../components/productos";
import Ventas from "../components/ventas";
import Caja from "../components/caja";

import Login from "../pages/Login";
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
                        element={<Navigate to="/productos" replace />}
                    />

                    <Route
                        path="productos"
                        element={<Productos />}
                    />

                    <Route
                        path="venta"
                        element={<Ventas />}
                    />

                    <Route
                        path="caja"
                        element={<Caja />}
                    />

                </Route>
            </Route>

            {/* RUTAS NO ENCONTRADAS */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>
    );
}
