
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

// import { loginRequest } from "../services/authService";

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

        // USUARIO TEMPORAL PARA DESARROLLO
        if (
            credenciales.usuario.trim() === "admin" &&
            credenciales.password === "123456"
        ) {

            const nuevoToken = "TOKEN-LOCAL-DESARROLLO";

            const nuevoUsuario = {
                idUsuario: 1,
                nombre: "Administrador",
                usuario: "admin",
                correo: "admin@nexus.com",
                rol: "ADMIN",
            };

            // Guardar sesión
            localStorage.setItem("nexus_token", nuevoToken);

            localStorage.setItem(
                "nexus_usuario",
                JSON.stringify(nuevoUsuario)
            );

            // Actualizar contexto
            setToken(nuevoToken);
            setUsuario(nuevoUsuario);

            return nuevoUsuario;
        }

        throw new Error("Usuario o contraseña incorrectos.");
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
