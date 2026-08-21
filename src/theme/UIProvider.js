import React, { createContext, useContext, useMemo } from "react";

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
  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,

    colors: {
      ...colors,
      ...overrides?.colors,
    },

    spacing,
    radius,
    typography,
    sizes,
    shadows,
    animation,
    breakpoints,
  };
}

export function UIProvider({ children, mode = "system", onModeChange, theme }) {
  const systemScheme = useColorScheme();

  const resolvedMode =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const setMode = (nextMode) => {
    if (nextMode !== "light" && nextMode !== "dark" && nextMode !== "system") {
      return;
    }

    if (onModeChange) {
      onModeChange(nextMode);
    }
  };

  const contextValue = useMemo(
    () => ({
      theme: createTheme(resolvedMode, theme),

      mode: resolvedMode,

      selectedMode: mode,

      setMode,
    }),
    [resolvedMode, mode, theme, onModeChange],
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
