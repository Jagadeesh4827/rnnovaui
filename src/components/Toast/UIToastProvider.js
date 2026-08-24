import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import UIToast from "./UIToast";

const UIToastContext = createContext(null);

const DEFAULT_MAX_TOASTS = 3;

export function UIToastProvider({
  children,

  position = "top",

  maxToasts = DEFAULT_MAX_TOASTS,

  duration = 3000,

  animationDuration = 220,

  offset = 12,

  useSafeArea = true,

  topOffset = 0,

  bottomOffset = 0,
}) {
  const [toasts, setToasts] = useState([]);

  const timers = useRef(new Map()).current;

  const insets = useSafeAreaInsets();

  const removeToast = useCallback(
    (id) => {
      setToasts((current) => current.filter((item) => item.id !== id));

      const timer = timers.get(id);

      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
    },
    [timers],
  );

  const addToast = useCallback(
    (options = {}) => {
      const id =
        options.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const toast = {
        id,

        variant: options.variant || "info",

        title: options.title,

        description: options.description,

        message: options.message,

        icon: options.icon,

        size: options.size || "md",

        duration: options.duration ?? duration,

        action: options.action,

        actionLabel: options.actionLabel,

        onAction: options.onAction,

        closeable: options.closeable ?? true,

        onClose: options.onClose,

        disabled: options.disabled ?? false,

        backgroundColor: options.backgroundColor,

        accentColor: options.accentColor,

        textColor: options.textColor,

        descriptionColor: options.descriptionColor,

        iconColor: options.iconColor,

        actionColor: options.actionColor,

        closeColor: options.closeColor,

        style: options.style,

        contentStyle: options.contentStyle,

        titleStyle: options.titleStyle,

        descriptionStyle: options.descriptionStyle,

        iconStyle: options.iconStyle,

        actionStyle: options.actionStyle,

        closeStyle: options.closeStyle,

        autoDismissOnAction: options.autoDismissOnAction,
      };

      setToasts((current) => {
        const next = [...current, toast];

        return next.slice(-Math.max(1, maxToasts));
      });

      const toastDuration = Number(toast.duration);

      if (toastDuration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, toastDuration);

        timers.set(id, timer);
      }

      return id;
    },
    [duration, maxToasts, removeToast, timers],
  );

  const show = useCallback(
    (options) => {
      return addToast(options);
    },
    [addToast],
  );

  const success = useCallback(
    (message, options = {}) => {
      return addToast({
        ...options,
        variant: "success",
        description: message,
      });
    },
    [addToast],
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({
        ...options,
        variant: "error",
        description: message,
      });
    },
    [addToast],
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({
        ...options,
        variant: "warning",
        description: message,
      });
    },
    [addToast],
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({
        ...options,
        variant: "info",
        description: message,
      });
    },
    [addToast],
  );

  const neutral = useCallback(
    (message, options = {}) => {
      return addToast({
        ...options,
        variant: "neutral",
        description: message,
      });
    },
    [addToast],
  );

  const dismiss = useCallback(
    (id) => {
      removeToast(id);
    },
    [removeToast],
  );

  const dismissAll = useCallback(() => {
    setToasts([]);

    timers.forEach((timer) => {
      clearTimeout(timer);
    });

    timers.clear();
  }, [timers]);

  const contextValue = useMemo(
    () => ({
      show,

      success,
      error,
      warning,
      info,
      neutral,

      dismiss,
      dismissAll,
    }),
    [show, success, error, warning, info, neutral, dismiss, dismissAll],
  );

  const topInset = useSafeArea ? insets.top : 0;

  const bottomInset = useSafeArea ? insets.bottom : 0;

  const containerPosition =
    position === "bottom"
      ? {
          bottom: bottomInset + bottomOffset + offset,
        }
      : {
          top: topInset + topOffset + offset,
        };

  return (
    <UIToastContext.Provider value={contextValue}>
      {children}

      <View
        pointerEvents="box-none"
        style={[
          styles.container,

          containerPosition,

          position === "bottom" ? styles.bottom : styles.top,
        ]}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            animationDuration={animationDuration}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </UIToastContext.Provider>
  );
}

function ToastItem({ toast, animationDuration, onDismiss }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,

      friction: 8,

      tension: 80,

      useNativeDriver: true,
    }).start();

    return () => {
      animatedValue.stopAnimation();
    };
  }, [animatedValue]);

  return (
    <UIToast
      toast={toast}
      animatedValue={animatedValue}
      animationDuration={animationDuration}
      onDismiss={onDismiss}
    />
  );
}

export function useUIToast() {
  const context = useContext(UIToastContext);

  if (!context) {
    throw new Error("useUIToast must be used inside UIToastProvider.");
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    left: 12,
    right: 12,

    zIndex: 99999,

    elevation: 999,

    pointerEvents: "box-none",
  },

  top: {
    flexDirection: "column",
  },

  bottom: {
    flexDirection: "column-reverse",
  },
});
