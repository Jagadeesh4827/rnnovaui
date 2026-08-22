import React, { memo, useCallback, useEffect, useRef } from "react";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const CHECKBOX_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const CHECKBOX_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
};

function UICheckboxComponent({
  value = false,

  onValueChange,

  label,

  description,

  size = "md",

  variant = "primary",

  disabled = false,

  error = false,

  errorText,

  labelStyle,

  descriptionStyle,

  errorStyle,

  boxStyle,

  style,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeSize = CHECKBOX_SIZES[size] ? size : CHECKBOX_SIZES.md;

  const safeVariant = CHECKBOX_VARIANTS[variant]
    ? variant
    : CHECKBOX_VARIANTS.primary;

  const scale = useRef(new Animated.Value(value ? 1 : 0.75)).current;

  const opacity = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: value ? 1 : 0.75,

        friction: 7,

        tension: 120,

        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: value ? 1 : 0,

        duration: 120,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      }),
    ]).start();
  }, [value, scale, opacity]);

  const toggle = useCallback(() => {
    if (disabled) {
      return;
    }

    onValueChange?.(!value);
  }, [disabled, onValueChange, value]);

  const dimensions = getDimensions(safeSize);

  const activeColor = getActiveColor(safeVariant, colors);

  const borderColor = error
    ? colors.danger || "#DC2626"
    : value
      ? activeColor
      : colors.border || "#E5E5E5";

  const backgroundColor = value ? activeColor : "transparent";

  return (
    <View {...props} testID={testID} style={[styles.wrapper, style]}>
      <Pressable
        disabled={disabled}
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          checked: value,
          disabled,
        }}
        style={styles.pressable}
      >
        <View
          style={[
            styles.row,
            {
              opacity: disabled ? 0.55 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.box,

              {
                width: dimensions.boxSize,

                height: dimensions.boxSize,

                borderRadius: dimensions.borderRadius,

                borderColor,

                backgroundColor,
              },

              boxStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.checkmark,

                {
                  opacity,

                  transform: [
                    {
                      scale,
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[
                  styles.checkmarkText,
                  {
                    fontSize: dimensions.checkSize,
                    color: colors.onPrimary || "#FFFFFF",
                  },
                ]}
              >
                ✓
              </Text>
            </Animated.View>
          </View>

          {label ? (
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.label,

                  {
                    color: colors.text || "#111111",

                    fontSize: dimensions.fontSize,
                  },

                  labelStyle,
                ]}
              >
                {label}
              </Text>

              {description ? (
                <Text
                  style={[
                    styles.description,

                    {
                      color: colors.textSecondary || "#525252",
                    },

                    descriptionStyle,
                  ]}
                >
                  {description}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      {error && errorText ? (
        <Text
          style={[
            styles.error,

            {
              color: colors.danger || "#DC2626",
            },

            errorStyle,
          ]}
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

function getActiveColor(variant, colors) {
  switch (variant) {
    case CHECKBOX_VARIANTS.secondary:
      return colors.secondary || "#7CFF32";

    case CHECKBOX_VARIANTS.success:
      return colors.success || "#16A34A";

    case CHECKBOX_VARIANTS.danger:
      return colors.danger || "#DC2626";

    case CHECKBOX_VARIANTS.primary:
    default:
      return colors.primary || "#FF5A1F";
  }
}

function getDimensions(size) {
  switch (size) {
    case CHECKBOX_SIZES.sm:
      return {
        boxSize: 18,
        borderRadius: 5,
        checkSize: 13,
        fontSize: 13,
      };

    case CHECKBOX_SIZES.lg:
      return {
        boxSize: 26,
        borderRadius: 7,
        checkSize: 18,
        fontSize: 16,
      };

    case CHECKBOX_SIZES.md:
    default:
      return {
        boxSize: 22,
        borderRadius: 6,
        checkSize: 15,
        fontSize: 14,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },

  pressable: {
    minHeight: 40,

    justifyContent: "center",
  },

  row: {
    flexDirection: "row",

    alignItems: "center",
  },

  box: {
    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1.5,

    flexShrink: 0,
  },

  checkmark: {
    alignItems: "center",

    justifyContent: "center",
  },

  checkmarkText: {
    fontWeight: "800",

    includeFontPadding: false,

    lineHeight: 18,
  },

  textContainer: {
    flex: 1,

    marginLeft: 10,
  },

  label: {
    fontWeight: "600",

    lineHeight: 20,

    includeFontPadding: false,
  },

  description: {
    marginTop: 2,

    fontSize: 12,

    lineHeight: 17,

    includeFontPadding: false,
  },

  error: {
    marginTop: 5,

    marginLeft: 32,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UICheckbox = memo(UICheckboxComponent);

UICheckbox.displayName = "UICheckbox";

export {
  CHECKBOX_SIZES as UICheckboxSizes,
  CHECKBOX_VARIANTS as UICheckboxVariants,
};

export default UICheckbox;
