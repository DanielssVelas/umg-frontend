
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import {
    CssBaseline,
    ThemeProvider,
    createTheme,
} from "@mui/material";

import App from "./App";
import ToastProvider from "./components/commonts/ToastProvider";

// ==========================================
// TEMA NEXUS
// ==========================================

const theme = createTheme({
    palette: {
        primary: {
            main: "#2563eb",
        },
        background: {
            default: "#f3f4f6",
        },
    },

    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
    },

    shape: {
        borderRadius: 10,
    },
});

// ==========================================
// APLICACIÓN
// ==========================================

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <BrowserRouter>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </BrowserRouter>

        </ThemeProvider>
    </React.StrictMode>
);
