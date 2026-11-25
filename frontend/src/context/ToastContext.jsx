import { createContext, useCallback, useContext, useState } from "react";
import Icon from "../components/Icon";

const ToastContext = createContext(null);
let nextId = 1;

// Mensajes visibles de éxito y error (parte superior, al centro).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), type === "error" ? 6000 : 3500);
    },
    [dismiss]
  );

  const api = {
    success: useCallback((message) => show("success", message), [show]),
    error: useCallback((message) => show("error", message), [show]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => dismiss(toast.id)}>
            <span className="toast-icon"><Icon name={toast.type === "success" ? "check" : "alert"} size={16} /></span>
            <div>
              <strong>{toast.type === "success" ? "Listo" : "Error"}</strong>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
