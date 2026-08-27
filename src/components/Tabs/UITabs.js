import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

const TabsContext = createContext(null);

const TAB_SIZES = {
  sm: {
    minHeight: 42,
    fontSize: 12,
    horizontalPadding: 10,
  },

  md: {
    minHeight: 50,
    fontSize: 14,
    horizontalPadding: 12,
  },

  lg: {
    minHeight: 58,
    fontSize: 16,
    horizontalPadding: 16,
  },
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

  animationDuration = 280,

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

  indicatorRadius,

  disabled = false,

  style,
  containerStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue);

  const [previousValue, setPreviousValue] = useState(null);

  const currentValue = controlled ? value : internalValue;

  const safeSize = TAB_SIZES[size] || TAB_SIZES.md;

  const preset = ANIMATION_PRESETS[animationPreset] || ANIMATION_PRESETS.smooth;

  const resolvedIndicatorAnimation = animated
    ? (indicatorAnimation ?? preset.indicator)
    : "none";

  const resolvedContentAnimation = animated
    ? (contentAnimation ?? preset.content)
    : "none";

  const resolvedPressAnimation = animated
    ? (pressAnimation ?? preset.press)
    : "none";

  const changeValue = useCallback(
    (nextValue) => {
      if (disabled) {
        return;
      }

      if (nextValue === currentValue) {
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

      size,
      sizeConfig: safeSize,

      animated,
      animationDuration,
      spring,
      directionAware,

      indicatorAnimation: resolvedIndicatorAnimation,

      contentAnimation: resolvedContentAnimation,

      pressAnimation: resolvedPressAnimation,

      variant,

      activeColor: activeColor || colors.primary || "#FF5A1F",

      inactiveColor: inactiveColor || colors.textSecondary || "#737373",

      indicatorColor:
        indicatorColor || activeColor || colors.primary || "#FF5A1F",

      indicatorHeight,
      indicatorWidth,

      indicatorRadius: indicatorRadius ?? indicatorHeight / 2,

      disabled,
    }),
    [
      colors,
      currentValue,
      previousValue,
      changeValue,
      size,
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
      indicatorRadius,
      disabled,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <View testID={testID} style={[styles.container, containerStyle, style]}>
        {children}
      </View>
    </TabsContext.Provider>
  );
});

export function useUITabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("UITabs components must be used inside <UITabs>.");
  }

  return context;
}

export const UITabsAnimationPresets = ANIMATION_PRESETS;

export const UITabsSizes = TAB_SIZES;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

UITabs.displayName = "UITabs";
