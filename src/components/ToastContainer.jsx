import React from "react";
import { useModals } from "../context/ModalContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useModals();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" id="freshfindToastContainer">
      {toasts.map((toast) => {
        let icon = "✦";
        if (toast.type === "success") icon = "✓";
        if (toast.type === "error") icon = "✕";
        if (toast.type === "warning") icon = "⚠";

        return (
          <div key={toast.id} className={`toast-item toast-${toast.type || "info"}`}>
            <span className="toast-icon">{icon}</span>
            <span className="toast-msg">{toast.message}</span>
            <button
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => removeToast(toast.id)}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
