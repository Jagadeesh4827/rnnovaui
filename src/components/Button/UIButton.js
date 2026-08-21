import React, { memo, useCallback } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const VARIANTS = {
  solid: "solid",
  outline: "outline",
  ghost: "ghost",
  soft: "soft",
  danger: "danger",
  success: "success",
};

const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

function UIButtonComponent({
  title,
  children,

  variant = "solid",
  size = "md",

  disabled = false,
  loading = false,
  fullWidth = false,

  leftIcon,
  rightIcon,

  onPress,
  onLongPress,
  onPressIn,
  onPressOut,

  style,
  contentStyle,
  textStyle,

  activeOpacity = 0.82,

  testID,
  accessibilityLabel,
  accessibilityHint,

  ...props
}) {
  const themeResult = useUITheme();

  /*
   * Support both possible provider shapes:
   *
   * themeResult.theme.colors
   * themeResult.colors
   */
  const theme = themeResult?.theme || themeResult || {};

  const colors = theme.colors || {};

  const safeVariant = VARIANTS[variant] || VARIANTS.solid;

  const safeSize = SIZES[size] || SIZES.md;

  const buttonColors = getButtonColors(safeVariant, colors);

  const dimensions = getButtonDimensions(safeSize);

  const isDisabled = disabled || loading;

  const handlePress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      onPress?.(event);
    },
    [isDisabled, onPress],
  );

  const handleLongPress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      onLongPress?.(event);
    },
    [isDisabled, onLongPress],
  );

  const handlePressIn = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      onPressIn?.(event);
    },
    [isDisabled, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      onPressOut?.(event);
    },
    [isDisabled, onPressOut],
  );

  const hasChildren = children !== undefined && children !== null;

  return (
    <Pressable
      {...props}
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || (typeof title === "string" ? title : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,

        {
          height: dimensions.height,

          minHeight: dimensions.height,

          paddingHorizontal: dimensions.paddingHorizontal,

          borderRadius: dimensions.borderRadius,

          backgroundColor: buttonColors.background,

          borderColor: buttonColors.border,

          borderWidth: buttonColors.border ? 1 : 0,

          width: fullWidth ? "100%" : undefined,

          opacity: isDisabled ? 0.5 : pressed ? activeOpacity : 1,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.content,

          {
            gap: dimensions.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={buttonColors.text} />
        ) : leftIcon ? (
          <View style={styles.icon}>{leftIcon}</View>
        ) : null}

        {hasChildren ? (
          <View style={styles.children}>{children}</View>
        ) : title ? (
          <Text
            numberOfLines={1}
            style={[
              styles.text,

              {
                color: buttonColors.text,

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.lineHeight,
              },

              textStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}

        {!loading && rightIcon ? (
          <View style={styles.icon}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * IMPORTANT:
 *
 * Variant resolution is completely independent
 * from spacing/radius/typography.
 *
 * Therefore even if the theme is incomplete,
 * variants still work.
 */
function getButtonColors(variant, colors) {
  const primary = colors.primary || "#FF5A1F";

  const primarySoft = colors.primarySoft || "#FFF0EA";

  const success = colors.success || "#16A34A";

  const danger = colors.danger || "#DC2626";

  const text = colors.text || "#111111";

  const onPrimary = colors.onPrimary || "#FFFFFF";

  const border = colors.border || "#E5E5E5";

  switch (variant) {
    case VARIANTS.outline:
      return {
        background: "transparent",
        border: primary,
        text: primary,
      };

    case VARIANTS.ghost:
      return {
        background: "transparent",
        border: null,
        text: primary,
      };

    case VARIANTS.soft:
      return {
        background: primarySoft,
        border: null,
        text: primary,
      };

    case VARIANTS.danger:
      return {
        background: danger,
        border: danger,
        text: onPrimary,
      };

    case VARIANTS.success:
      return {
        background: success,
        border: success,
        text: onPrimary,
      };

    case VARIANTS.solid:
    default:
      return {
        background: primary,
        border: primary,
        text: onPrimary,
      };
  }
}

/**
 * Sizes intentionally use fixed fallback
 * values so the button cannot break when
 * theme.sizes is missing.
 */
function getButtonDimensions(size) {
  switch (size) {
    case SIZES.sm:
      return {
        height: 36,
        paddingHorizontal: 14,
        gap: 6,
        borderRadius: 10,
        fontSize: 13,
        lineHeight: 18,
      };

    case SIZES.lg:
      return {
        height: 52,
        paddingHorizontal: 22,
        gap: 8,
        borderRadius: 14,
        fontSize: 16,
        lineHeight: 22,
      };

    case SIZES.xl:
      return {
        height: 60,
        paddingHorizontal: 26,
        gap: 8,
        borderRadius: 16,
        fontSize: 17,
        lineHeight: 24,
      };

    case SIZES.md:
    default:
      return {
        height: 44,
        paddingHorizontal: 18,
        gap: 8,
        borderRadius: 12,
        fontSize: 14,
        lineHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },

  children: {
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  text: {
    flexShrink: 1,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export const UIButtonVariants = VARIANTS;

export const UIButtonSizes = SIZES;
