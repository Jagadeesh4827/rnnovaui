import React, { memo, useEffect, useRef } from "react";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const RADIO_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const RADIO_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
};

function UIRadioComponent({
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

  circleStyle,

  selectedStyle,

  style,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeSize = RADIO_SIZES[size] ? size : RADIO_SIZES.md;

  const safeVariant = RADIO_VARIANTS[variant]
    ? variant
    : RADIO_VARIANTS.primary;

  const scale = useRef(new Animated.Value(value ? 1 : 0)).current;

  const opacity = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: value ? 1 : 0,

        friction: 7,

        tension: 140,

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

  const handlePress = () => {
    if (disabled) {
      return;
    }

    onValueChange?.(!value);
  };

  const dimensions = getDimensions(safeSize);

  const activeColor = getActiveColor(safeVariant, colors);

  const borderColor = error
    ? colors.danger || "#DC2626"
    : value
      ? activeColor
      : colors.border || "#E5E5E5";

  return (
    <View {...props} testID={testID} style={[styles.wrapper, style]}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        accessibilityRole="radio"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          selected: value,

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
              styles.circle,

              {
                width: dimensions.circleSize,

                height: dimensions.circleSize,

                borderRadius: dimensions.circleSize / 2,

                borderColor,
              },

              circleStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.innerCircle,

                {
                  width: dimensions.innerSize,

                  height: dimensions.innerSize,

                  borderRadius: dimensions.innerSize / 2,

                  backgroundColor: activeColor,

                  opacity,

                  transform: [
                    {
                      scale,
                    },
                  ],
                },

                selectedStyle,
              ]}
            />
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
    case RADIO_VARIANTS.secondary:
      return colors.secondary || "#7CFF32";

    case RADIO_VARIANTS.success:
      return colors.success || "#16A34A";

    case RADIO_VARIANTS.danger:
      return colors.danger || "#DC2626";

    case RADIO_VARIANTS.primary:
    default:
      return colors.primary || "#FF5A1F";
  }
}

function getDimensions(size) {
  switch (size) {
    case RADIO_SIZES.sm:
      return {
        circleSize: 18,
        innerSize: 8,
        fontSize: 13,
      };

    case RADIO_SIZES.lg:
      return {
        circleSize: 26,
        innerSize: 12,
        fontSize: 16,
      };

    case RADIO_SIZES.md:
    default:
      return {
        circleSize: 22,
        innerSize: 10,
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

  circle: {
    alignItems: "center",

    justifyContent: "center",

    borderWidth: 2,

    flexShrink: 0,
  },

  innerCircle: {
    flexShrink: 0,
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

export const UIRadio = memo(UIRadioComponent);

UIRadio.displayName = "UIRadio";

export { RADIO_SIZES as UIRadioSizes, RADIO_VARIANTS as UIRadioVariants };

export default UIRadio;
