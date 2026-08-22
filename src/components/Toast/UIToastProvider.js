import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { StyleSheet, View } from "react-native";

import { UIToast } from "./UIToast";

const ToastContext = createContext(null);

const DEFAULT_MAX_TOASTS = 3;

let toastIdCounter = 0;

function createToastId() {
  toastIdCounter += 1;

  return `ui-toast-${Date.now()}-${toastIdCounter}`;
}

function UIToastProvider({
  children,
  maxToasts = DEFAULT_MAX_TOASTS,
  defaultDuration = 3000,
}) {
  const [toasts, setToasts] = useState([]);

  const mountedRef = useRef(true);

  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      clearTimeout(timer);

      timersRef.current.delete(id);
    }

    if (!mountedRef.current) {
      return;
    }

    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id, duration) => {
      if (!duration || duration <= 0) {
        return;
      }

      const existingTimer = timersRef.current.get(id);

      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        timersRef.current.delete(id);

        removeToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const showToast = useCallback(
    (options = {}) => {
      const id = options.id || createToastId();

      const duration =
        options.duration !== undefined ? options.duration : defaultDuration;

      const toast = {
        ...options,

        id,

        visible: true,

        duration,
      };

      setToasts((previous) => {
        const filtered = previous.filter((item) => item.id !== id);

        const next = [...filtered, toast];

        if (next.length <= maxToasts) {
          return next;
        }

        const removed = next.slice(0, next.length - maxToasts);

        removed.forEach((item) => {
          const timer = timersRef.current.get(item.id);

          if (timer) {
            clearTimeout(timer);

            timersRef.current.delete(item.id);
          }
        });

        return next.slice(-maxToasts);
      });

      scheduleDismiss(id, duration);

      return id;
    },
    [defaultDuration, maxToasts, scheduleDismiss],
  );

  const updateToast = useCallback(
    (id, updates = {}) => {
      setToasts((previous) =>
        previous.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                ...updates,
              }
            : toast,
        ),
      );

      if (updates.duration !== undefined) {
        scheduleDismiss(id, updates.duration);
      }
    },
    [scheduleDismiss],
  );

  const dismissToast = useCallback(
    (id) => {
      removeToast(id);
    },
    [removeToast],
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });

    timersRef.current.clear();

    setToasts([]);
  }, []);

  const success = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: "success",
      });
    },
    [showToast],
  );

  const error = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: "danger",
      });
    },
    [showToast],
  );

  const warning = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: "warning",
      });
    },
    [showToast],
  );

  const info = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: "info",
      });
    },
    [showToast],
  );

  const primary = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: "primary",
      });
    },
    [showToast],
  );

  const toast = useCallback(
    (message, options = {}) => {
      return showToast({
        ...options,

        message,

        variant: options.variant || "default",
      });
    },
    [showToast],
  );

  /*
   * Cleanup timers when
   * provider unmounts.
   */
  React.useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      timersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });

      timersRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      toasts,

      showToast,

      updateToast,

      dismissToast,

      dismissAll,

      toast,

      success,

      error,

      warning,

      info,

      primary,
    }),
    [
      toasts,
      showToast,
      updateToast,
      dismissToast,
      dismissAll,
      toast,
      success,
      error,
      warning,
      info,
      primary,
    ],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  /*
   * Keep toast rendering
   * outside the main application
   * layout.
   */
  return (
    <View pointerEvents="box-none" style={styles.container}>
      {toasts.map((toast) => (
        <UIToast
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </View>
  );
}

export function useUIToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useUIToast must be used inside UIToastProvider.");
  }

  return context;
}

/*
 * IMPORTANT:
 * Named export.
 *
 * This prevents:
 *
 * Cannot read property
 * 'displayName' of undefined
 */
export { UIToastProvider };

export default UIToastProvider;

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    top: 0,

    right: 0,

    bottom: 0,

    left: 0,

    zIndex: 99999,

    elevation: 99999,

    pointerEvents: "box-none",
  },
});
