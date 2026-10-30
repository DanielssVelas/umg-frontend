import {
  createContext,
  useContext,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  async function login(usuarioIngresado, password) {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        usuario: usuarioIngresado,
        password,
      });

      const resultado = response.data?.data;

      if (!resultado?.flag || !resultado?.token) {
        throw new Error(
          resultado?.mensaje || "No se pudo iniciar sesión"
        );
      }

      localStorage.setItem("token", resultado.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(resultado.usuario)
      );

      setToken(resultado.token);
      setUsuario(resultado.usuario);

      return resultado;
    } catch (error) {
      const mensaje =
        error.response?.data?.data?.mensaje ||
        error.response?.data?.mensaje ||
        error.message ||
        "Error al iniciar sesión";

      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}