
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL

const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

export const loginRequest = async (credenciales) => {
    const response = await authApi.post(
        "/auth/login", // Endpoint provisional
        {
            usuario: credenciales.usuario,
            password: credenciales.password,
        }
    );

    return response.data
}
