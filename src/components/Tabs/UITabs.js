import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

const UITabsContext = createContext(null);

const TAB_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const ANIMATION_PRESETS = {
  none: {
    indicator: "none",
    content: "none",
    press: "none",
  },

  subtle: {
    indicator: "slide",
    content: "fade",
    press: "scale",
  },

  smooth: {
    indicator: "slide",
    content: "fadeSlide",
    press: "scale",
  },

  snappy: {
    indicator: "spring",
    content: "slideFade",
    press: "scale",
  },

  spring: {
    indicator: "spring",
    content: "slideScale",
    press: "scale",
  },

  bouncy: {
    indicator: "spring",
    content: "springScale",
    press: "scale",
  },
};

export const UITabs = memo(function UITabs({
  children,

  value,
  defaultValue = null,

  onValueChange,

  size = "md",

  animated = true,

  animationPreset = "smooth",

  indicatorAnimation,
  contentAnimation,
  pressAnimation,

  animationDuration = 260,

  spring = {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  },

  directionAware = true,

  variant = "default",

  activeColor,
  inactiveColor,

  indicatorColor,

  indicatorHeight = 2,

  indicatorWidth = "content",

  disabled = false,

  style,
  containerStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = controlled ? value : internalValue;

  const [previousValue, setPreviousValue] = useState(currentValue);

  const safeSize = TAB_SIZES[size] ? size : "md";

  const safePreset =
    ANIMATION_PRESETS[animationPreset] || ANIMATION_PRESETS.smooth;

  const resolvedIndicatorAnimation = indicatorAnimation ?? safePreset.indicator;

  const resolvedContentAnimation = contentAnimation ?? safePreset.content;

  const resolvedPressAnimation = pressAnimation ?? safePreset.press;

  const changeValue = useCallback(
    (nextValue) => {
      if (disabled || nextValue === currentValue) {
        return;
      }

      setPreviousValue(currentValue);

      if (!controlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, currentValue, controlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      colors,

      value: currentValue,

      previousValue,

      setValue: changeValue,

      size: safeSize,

      animated,

      animationDuration,

      spring,

      directionAware,

      indicatorAnimation: animated ? resolvedIndicatorAnimation : "none",

      contentAnimation: animated ? resolvedContentAnimation : "none",

      pressAnimation: animated ? resolvedPressAnimation : "none",

      variant,

      activeColor: activeColor || colors.primary || "#FF5A1F",

      inactiveColor: inactiveColor || colors.textSecondary || "#737373",

      indicatorColor:
        indicatorColor || activeColor || colors.primary || "#FF5A1F",

      indicatorHeight,

      indicatorWidth,

      disabled,
    }),
    [
      colors,
      currentValue,
      previousValue,
      changeValue,
      safeSize,
      animated,
      animationDuration,
      spring,
      directionAware,
      resolvedIndicatorAnimation,
      resolvedContentAnimation,
      resolvedPressAnimation,
      variant,
      activeColor,
      inactiveColor,
      indicatorColor,
      indicatorHeight,
      indicatorWidth,
      disabled,
    ],
  );

  return (
    <UITabsContext.Provider value={contextValue}>
      <View testID={testID} style={[styles.container, containerStyle, style]}>
        {children}
      </View>
    </UITabsContext.Provider>
  );
});

export function useUITabs() {
  const context = useContext(UITabsContext);

  if (!context) {
    throw new Error("UITabs components must be used inside <UITabs>.");
  }

  return context;
}

export {
  TAB_SIZES as UITabsSizes,
  ANIMATION_PRESETS as UITabsAnimationPresets,
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

UITabs.displayName = "UITabs";
