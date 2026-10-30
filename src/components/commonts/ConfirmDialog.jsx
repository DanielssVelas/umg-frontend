import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor,
  loading,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="text.secondary">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={loading} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" color={confirmColor} sx={{ textTransform: "none", fontWeight: 600, minWidth: 100 }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}