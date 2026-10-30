
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { loginRequest } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // ==========================================
    // RECUPERAR SESIÓN
    // ==========================================

    useEffect(() => {
        const tokenGuardado = localStorage.getItem("nexus_token");
        const usuarioGuardado = localStorage.getItem("nexus_usuario");

        if (tokenGuardado && usuarioGuardado) {
            try {
                setToken(tokenGuardado);
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (error) {
                console.error("Error recuperando sesión:", error);
                localStorage.removeItem("nexus_token");
                localStorage.removeItem("nexus_usuario");
            }
        }

        setLoadingAuth(false);
    }, []);

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    const login = async (credenciales) => {
        try {
            const response = await loginRequest(credenciales);
            console.log('response', response);
            
            // Validar respuesta del backend
            if (
                !response?.result ||
                !response?.data?.flag ||
                !response?.data?.token
            ) {
                throw new Error(
                    response?.data?.mensaje ||
                    response?.description ||
                    "No fue posible iniciar sesión."
                );
            }

            // Obtener información del backend
            const tokenBackend = response.data.token;
            const usuarioBackend = response.data.usuario;

            if (!usuarioBackend) {
                throw new Error("El backend no devolvió información del usuario.");
            }

            // Normalizar información del usuario
            const nuevoUsuario = {
                idUsuario: usuarioBackend.id_usuario,
                usuario: usuarioBackend.usuario,
                idRol: usuarioBackend.id_rol,
                rol: usuarioBackend.rol,
                idCaja: Number(usuarioBackend.id_caja) || 0,
            };

            // Guardar sesión
            localStorage.setItem("nexus_token", tokenBackend);
            localStorage.setItem(
                "nexus_usuario",
                JSON.stringify(nuevoUsuario)
            );

            // Actualizar contexto
            setToken(tokenBackend);
            setUsuario(nuevoUsuario);

            return nuevoUsuario;
        } catch (error) {
            console.error("Error en login:", error);

            const mensaje =
                error.response?.data?.data?.mensaje ||
                error.response?.data?.description ||
                error.response?.data?.mensaje ||
                error.message ||
                "Error al conectar con el servidor.";

            throw new Error(mensaje);
        }
    };

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    const logout = () => {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_usuario");
        setToken(null);
        setUsuario(null);
    };

    // ==========================================
    // CONTEXTO
    // ==========================================

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                loadingAuth,
                isAuthenticated: Boolean(token && usuario),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ==========================================
// HOOK PERSONALIZADO
// ==========================================

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider."
        );
    }

    return context;
};
