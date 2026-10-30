import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    roles &&
    (!usuario || !roles.includes(usuario.rol))
  ) {
    return <Navigate to="/productos" replace />;
  }

  return <Outlet />;
}