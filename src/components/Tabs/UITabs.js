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

/*
 * IMPORTANT:
 *
 * Content animations intentionally contain
 * NO slide animations.
 */
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
    indicator: "spring",
    content: "fade",
    press: "scale",
  },

  snappy: {
    indicator: "slide",
    content: "fade",
    press: "scale",
  },

  spring: {
    indicator: "spring",
    content: "fade",
    press: "scale",
  },

  bouncy: {
    indicator: "spring",
    content: "fadeScale",
    press: "scale",
  },
};

export const UITabs = memo(function UITabs({
  children,

  /*
   * Controlled
   */
  value,

  /*
   * Uncontrolled
   */
  defaultValue = null,

  onValueChange,

  /*
   * General
   */
  size = "md",

  disabled = false,

  /*
   * Animation
   */
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

  /*
   * Appearance
   */
  variant = "default",

  activeColor,

  inactiveColor,

  indicatorColor,

  indicatorHeight = 2,

  indicatorWidth = "content",

  indicatorRadius,

  /*
   * Styling
   */
  style,

  containerStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue);

  const [previousValue, setPreviousValue] = useState(null);

  const currentValue = isControlled ? value : internalValue;

  const sizeConfig = TAB_SIZES[size] || TAB_SIZES.md;

  const preset = ANIMATION_PRESETS[animationPreset] || ANIMATION_PRESETS.smooth;

  /*
   * Indicator animation
   */
  const resolvedIndicatorAnimation = animated
    ? (indicatorAnimation ?? preset.indicator)
    : "none";

  /*
   * Content animation
   *
   * Only:
   * none
   * fade
   * fadeIn
   * fadeOut
   * scale
   * fadeScale
   */
  const resolvedContentAnimation = animated
    ? (contentAnimation ?? preset.content)
    : "none";

  /*
   * Press animation
   */
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

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, currentValue, isControlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      colors,

      value: currentValue,

      previousValue,

      setValue: changeValue,

      size,

      sizeConfig,

      disabled,

      animated,

      animationDuration,

      spring,

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
    }),
    [
      colors,
      currentValue,
      previousValue,
      changeValue,
      size,
      sizeConfig,
      disabled,
      animated,
      animationDuration,
      spring,
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
