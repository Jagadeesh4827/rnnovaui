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

const SWITCH_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SWITCH_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
};

function UISwitchComponent({
  value = false,

  onValueChange,

  label,

  description,

  size = "md",

  variant = "primary",

  disabled = false,

  labelStyle,

  descriptionStyle,

  trackStyle,

  thumbStyle,

  style,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeSize = SWITCH_SIZES[size] ? size : SWITCH_SIZES.md;

  const safeVariant = SWITCH_VARIANTS[variant]
    ? variant
    : SWITCH_VARIANTS.primary;

  const dimensions = getDimensions(safeSize);

  const activeColor = getActiveColor(safeVariant, colors);

  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,

      duration: 160,

      easing: Easing.out(Easing.cubic),

      useNativeDriver: true,
    }).start();
  }, [value, animation]);

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }

    onValueChange?.(!value);
  }, [disabled, onValueChange, value]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, dimensions.thumbTravel],
  });

  const trackBackground = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [colors.border || "#D4D4D4", activeColor],
  });

  return (
    <View {...props} testID={testID} style={[styles.wrapper, style]}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        accessibilityRole="switch"
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
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.track,

              {
                width: dimensions.trackWidth,

                height: dimensions.trackHeight,

                borderRadius: dimensions.trackHeight / 2,

                backgroundColor: trackBackground,
              },

              trackStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.thumb,

                {
                  width: dimensions.thumbSize,

                  height: dimensions.thumbSize,

                  borderRadius: dimensions.thumbSize / 2,

                  transform: [
                    {
                      translateX,
                    },
                  ],
                },

                thumbStyle,
              ]}
            />
          </Animated.View>

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
    </View>
  );
}

function getActiveColor(variant, colors) {
  switch (variant) {
    case SWITCH_VARIANTS.secondary:
      return colors.secondary || "#7CFF32";

    case SWITCH_VARIANTS.success:
      return colors.success || "#16A34A";

    case SWITCH_VARIANTS.danger:
      return colors.danger || "#DC2626";

    case SWITCH_VARIANTS.primary:
    default:
      return colors.primary || "#FF5A1F";
  }
}

function getDimensions(size) {
  switch (size) {
    case SWITCH_SIZES.sm:
      return {
        trackWidth: 40,
        trackHeight: 22,
        thumbSize: 18,
        thumbTravel: 18,
        fontSize: 13,
      };

    case SWITCH_SIZES.lg:
      return {
        trackWidth: 58,
        trackHeight: 32,
        thumbSize: 28,
        thumbTravel: 26,
        fontSize: 16,
      };

    case SWITCH_SIZES.md:
    default:
      return {
        trackWidth: 48,
        trackHeight: 28,
        thumbSize: 24,
        thumbTravel: 20,
        fontSize: 14,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },

  pressable: {
    minHeight: 44,

    justifyContent: "center",
  },

  row: {
    flexDirection: "row",

    alignItems: "center",
  },

  track: {
    justifyContent: "center",

    paddingHorizontal: 2,

    overflow: "hidden",

    flexShrink: 0,
  },

  thumb: {
    backgroundColor: "#FFFFFF",

    elevation: 2,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.18,

    shadowRadius: 2,
  },

  textContainer: {
    flex: 1,

    marginLeft: 12,
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
});

export const UISwitch = memo(UISwitchComponent);

UISwitch.displayName = "UISwitch";

export { SWITCH_SIZES as UISwitchSizes, SWITCH_VARIANTS as UISwitchVariants };

export default UISwitch;
