import React, { createContext, useCallback, useContext, useMemo } from "react";

import { useColorScheme } from "react-native";

import { lightColors, darkColors } from "./colors";

import { spacing } from "./spacing";

import { radius } from "./radius";

import { typography } from "./typography";

import { sizes } from "./sizes";

import { shadows } from "./shadows";

import { animation } from "./animation";

import { breakpoints } from "./breakpoints";

const UIContext = createContext(null);

function createTheme(mode, overrides) {
  const baseColors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,

    colors: {
      ...baseColors,

      ...(overrides?.colors || {}),
    },

    spacing: {
      ...spacing,

      ...(overrides?.spacing || {}),
    },

    radius: {
      ...radius,

      ...(overrides?.radius || {}),
    },

    typography: {
      ...typography,

      ...(overrides?.typography || {}),
    },

    sizes: {
      ...sizes,

      ...(overrides?.sizes || {}),
    },

    shadows: {
      ...shadows,

      ...(overrides?.shadows || {}),
    },

    animation: {
      ...animation,

      ...(overrides?.animation || {}),
    },

    breakpoints: {
      ...breakpoints,

      ...(overrides?.breakpoints || {}),
    },
  };
}

export function UIProvider({
  children,

  mode = "system",

  onModeChange,

  theme,
}) {
  const systemScheme = useColorScheme();

  const resolvedMode =
    mode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode === "dark"
        ? "dark"
        : "light";

  const setMode = useCallback(
    (nextMode) => {
      if (
        nextMode !== "light" &&
        nextMode !== "dark" &&
        nextMode !== "system"
      ) {
        return;
      }

      if (typeof onModeChange === "function") {
        onModeChange(nextMode);
      }
    },
    [onModeChange],
  );

  const resolvedTheme = useMemo(
    () => createTheme(resolvedMode, theme),
    [resolvedMode, theme],
  );

  const contextValue = useMemo(
    () => ({
      theme: resolvedTheme,

      mode: resolvedMode,

      selectedMode: mode,

      setMode,
    }),
    [resolvedTheme, resolvedMode, mode, setMode],
  );

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
}

export function useUITheme() {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUITheme must be used inside UIProvider.");
  }

  return context;
}
