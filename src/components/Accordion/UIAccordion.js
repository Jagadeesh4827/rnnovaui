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

const AccordionContext = createContext(null);

const ANIMATION_PRESETS = {
  none: {
    content: "none",
    icon: "none",
    press: "none",
  },

  subtle: {
    content: "fade",
    icon: "rotate",
    press: "scale",
  },

  smooth: {
    content: "fadeExpand",
    icon: "rotate",
    press: "scale",
  },

  snappy: {
    content: "expand",
    icon: "rotate",
    press: "scale",
  },

  spring: {
    content: "springExpand",
    icon: "springRotate",
    press: "scale",
  },

  bouncy: {
    content: "springFadeExpand",
    icon: "springRotate",
    press: "scale",
  },
};

export const UIAccordion = memo(function UIAccordion({
  children,

  value,
  defaultValue = null,

  multiple = false,

  onValueChange,

  disabled = false,

  animated = true,

  animationPreset = "smooth",

  contentAnimation,
  iconAnimation,
  pressAnimation,

  animationDuration = 260,

  spring = {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  },

  variant = "default",

  size = "md",

  separator = true,

  border = false,

  radius = 12,

  backgroundColor,

  borderColor,

  style,
  containerStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const controlled = value !== undefined;

  const normalizeValue = useCallback(
    (input) => {
      if (multiple) {
        if (Array.isArray(input)) {
          return input;
        }

        if (input === null || input === undefined) {
          return [];
        }

        return [input];
      }

      if (Array.isArray(input)) {
        return input[0] ?? null;
      }

      return input ?? null;
    },
    [multiple],
  );

  const [internalValue, setInternalValue] = useState(() =>
    normalizeValue(defaultValue),
  );

  const currentValue = controlled ? normalizeValue(value) : internalValue;

  const preset = ANIMATION_PRESETS[animationPreset] || ANIMATION_PRESETS.smooth;

  const resolvedContentAnimation = animated
    ? (contentAnimation ?? preset.content)
    : "none";

  const resolvedIconAnimation = animated
    ? (iconAnimation ?? preset.icon)
    : "none";

  const resolvedPressAnimation = animated
    ? (pressAnimation ?? preset.press)
    : "none";

  const isOpen = useCallback(
    (itemValue) => {
      if (multiple) {
        return currentValue.includes(itemValue);
      }

      return currentValue === itemValue;
    },
    [currentValue, multiple],
  );

  const toggle = useCallback(
    (itemValue) => {
      if (disabled) {
        return;
      }

      let nextValue;

      if (multiple) {
        const current = Array.isArray(currentValue) ? currentValue : [];

        if (current.includes(itemValue)) {
          nextValue = current.filter((item) => item !== itemValue);
        } else {
          nextValue = [...current, itemValue];
        }
      } else {
        nextValue = currentValue === itemValue ? null : itemValue;
      }

      if (!controlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, multiple, currentValue, controlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      colors,

      value: currentValue,

      multiple,

      disabled,

      size,

      animated,

      animationDuration,

      spring,

      contentAnimation: resolvedContentAnimation,

      iconAnimation: resolvedIconAnimation,

      pressAnimation: resolvedPressAnimation,

      variant,

      separator,

      border,

      radius,

      isOpen,

      toggle,
    }),
    [
      colors,
      currentValue,
      multiple,
      disabled,
      size,
      animated,
      animationDuration,
      spring,
      resolvedContentAnimation,
      resolvedIconAnimation,
      resolvedPressAnimation,
      variant,
      separator,
      border,
      radius,
      isOpen,
      toggle,
    ],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <View
        testID={testID}
        style={[
          styles.container,

          {
            backgroundColor:
              backgroundColor || colors.card || colors.surface || "transparent",

            borderColor: borderColor || colors.border || "#E5E5E5",

            borderRadius: radius,
          },

          border ? styles.border : null,

          variant === "outlined" ? styles.border : null,

          containerStyle,
          style,
        ]}
      >
        {children}
      </View>
    </AccordionContext.Provider>
  );
});

export function useUIAccordion() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("Accordion components must be used inside <UIAccordion>.");
  }

  return context;
}

export const UIAccordionAnimationPresets = ANIMATION_PRESETS;

const styles = StyleSheet.create({
  container: {
    width: "100%",

    overflow: "hidden",
  },

  border: {
    borderWidth: 1,
  },
});

UIAccordion.displayName = "UIAccordion";
