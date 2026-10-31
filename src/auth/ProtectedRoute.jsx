
import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
    const { isAuthenticated, loadingAuth } = useAuth();

    if (loadingAuth) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
