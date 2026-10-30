import { useState, useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function useConfirm() {
  const [config, setConfig] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    confirmColor: "primary",
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        open: true,
        title: options.title || "¿Estás seguro?",
        message: options.message || "Esta acción no se puede deshacer.",
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        confirmColor: options.confirmColor || "primary",
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    config.resolve(true);
    setConfig((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    config.resolve(false);
    setConfig((prev) => ({ ...prev, open: false }));
  };

  // Retornamos la función `confirm` y el componente ya renderizado
  const ConfirmDialogElement = (
    <ConfirmDialog
      open={config.open}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      confirmColor={config.confirmColor}
      onConfirm={handleConfirm}
      onClose={handleCancel}
    />
  );

  return { confirm, ConfirmDialogElement };
}