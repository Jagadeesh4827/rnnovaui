import React, { memo, useCallback } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const BUTTON_VARIANTS = {
  solid: "solid",
  outline: "outline",
  ghost: "ghost",
  soft: "soft",
  danger: "danger",
  success: "success",
};

const BUTTON_SIZES = {
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

  leftIcon = null,
  rightIcon = null,

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
  /*
   * YOUR UIProvider RETURNS:
   *
   * {
   *   theme,
   *   mode,
   *   selectedMode,
   *   setMode
   * }
   */
  const { theme } = useUITheme();

  const colors = theme.colors;

  const safeVariant = BUTTON_VARIANTS[variant]
    ? variant
    : BUTTON_VARIANTS.solid;

  const safeSize = BUTTON_SIZES[size] ? size : BUTTON_SIZES.md;

  const variantStyle = getVariantStyle(safeVariant, colors);

  const sizeStyle = getSizeStyle(safeSize, theme);

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
          height: sizeStyle.height,

          minHeight: sizeStyle.height,

          paddingHorizontal: sizeStyle.paddingHorizontal,

          borderRadius: sizeStyle.borderRadius,

          backgroundColor: variantStyle.backgroundColor,

          borderColor: variantStyle.borderColor,

          borderWidth: variantStyle.borderWidth,

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
            gap: sizeStyle.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.textColor} />
        ) : (
          leftIcon && <View style={styles.icon}>{leftIcon}</View>
        )}

        {hasChildren ? (
          <View style={styles.children}>{children}</View>
        ) : (
          title !== undefined &&
          title !== null && (
            <Text
              numberOfLines={1}
              style={[
                styles.text,

                {
                  color: variantStyle.textColor,

                  fontSize: sizeStyle.fontSize,

                  lineHeight: sizeStyle.lineHeight,
                },

                textStyle,
              ]}
            >
              {title}
            </Text>
          )
        )}

        {!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
}

function getVariantStyle(variant, colors) {
  /*
   * These are FALLBACKS.
   *
   * Your colors from colors.js
   * will always win.
   */

  const primary = colors?.primary || "#FF5A1F";

  const primarySoft = colors?.primarySoft || "#FFF0EA";

  const success = colors?.success || "#16A34A";

  const danger = colors?.danger || "#DC2626";

  const onPrimary = colors?.onPrimary || "#FFFFFF";

  switch (variant) {
    case "outline":
      return {
        backgroundColor: "transparent",

        borderColor: primary,

        borderWidth: 1,

        textColor: primary,
      };

    case "ghost":
      return {
        backgroundColor: "transparent",

        borderColor: "transparent",

        borderWidth: 0,

        textColor: primary,
      };

    case "soft":
      return {
        backgroundColor: primarySoft,

        borderColor: primarySoft,

        borderWidth: 1,

        textColor: primary,
      };

    case "danger":
      return {
        backgroundColor: danger,

        borderColor: danger,

        borderWidth: 1,

        textColor: onPrimary,
      };

    case "success":
      return {
        backgroundColor: success,

        borderColor: success,

        borderWidth: 1,

        textColor: onPrimary,
      };

    case "solid":
    default:
      return {
        backgroundColor: primary,

        borderColor: primary,

        borderWidth: 1,

        textColor: onPrimary,
      };
  }
}

function getSizeStyle(size, theme) {
  /*
   * Use theme sizes when available,
   * otherwise safe fallback.
   */

  const buttonSizes = theme?.sizes?.button || {};

  const buttonRadius = theme?.radius?.button ?? 12;

  const spacing = theme?.spacing || {};

  const paddingSmall = spacing.sm ?? 12;

  const paddingMedium = spacing.md ?? 16;

  const paddingLarge = spacing.lg ?? 20;

  const paddingXL = spacing.xl ?? 24;

  switch (size) {
    case "sm":
      return {
        height: buttonSizes.sm ?? 36,

        paddingHorizontal: paddingSmall,

        gap: 6,

        borderRadius: buttonRadius,

        fontSize: 13,

        lineHeight: 18,
      };

    case "lg":
      return {
        height: buttonSizes.lg ?? 52,

        paddingHorizontal: paddingLarge,

        gap: 8,

        borderRadius: buttonRadius,

        fontSize: 16,

        lineHeight: 22,
      };

    case "xl":
      return {
        height: buttonSizes.xl ?? 60,

        paddingHorizontal: paddingXL,

        gap: 8,

        borderRadius: buttonRadius,

        fontSize: 17,

        lineHeight: 24,
      };

    case "md":
    default:
      return {
        height: buttonSizes.md ?? 44,

        paddingHorizontal: paddingMedium,

        gap: 8,

        borderRadius: buttonRadius,

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
    alignItems: "center",

    justifyContent: "center",

    flexShrink: 1,
  },

  icon: {
    alignItems: "center",

    justifyContent: "center",
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

export { BUTTON_VARIANTS as UIButtonVariants, BUTTON_SIZES as UIButtonSizes };
