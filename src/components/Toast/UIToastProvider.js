import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { UIToast } from "./UIToast";

const ToastContext = createContext(null);

function UIToastProvider({ children, maxToasts = 3 }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options) => {
      const id = options?.id || `${Date.now()}-${Math.random()}`;

      const toast = {
        ...options,
        id,
        visible: true,
      };

      setToasts((previous) => [...previous.slice(-(maxToasts - 1)), toast]);

      return id;
    },
    [maxToasts],
  );

  const dismissToast = useCallback(
    (id) => {
      removeToast(id);
    },
    [removeToast],
  );

  const success = useCallback(
    (message, options = {}) =>
      showToast({
        ...options,
        message,
        variant: "success",
      }),
    [showToast],
  );

  const error = useCallback(
    (message, options = {}) =>
      showToast({
        ...options,
        message,
        variant: "danger",
      }),
    [showToast],
  );

  const warning = useCallback(
    (message, options = {}) =>
      showToast({
        ...options,
        message,
        variant: "warning",
      }),
    [showToast],
  );

  const info = useCallback(
    (message, options = {}) =>
      showToast({
        ...options,
        message,
        variant: "info",
      }),
    [showToast],
  );

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissToast,
      success,
      error,
      warning,
      info,
      hideAll,
    }),
    [showToast, dismissToast, success, error, warning, info, hideAll],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {toasts.map((toast) => (
        <UIToast
          key={toast.id}
          {...toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useUIToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useUIToast must be used inside UIToastProvider.");
  }

  return context;
}

export default UIToastProvider;
