import React, { memo, useCallback, useMemo } from "react";

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

const FALLBACK = {
  primary: "#FF5A1F",
  primaryPressed: "#E94D17",
  primarySoft: "#FFF0EA",

  success: "#16A34A",
  successPressed: "#128238",

  danger: "#DC2626",
  dangerPressed: "#B91C1C",

  white: "#FFFFFF",

  disabledBackground: "#E5E5E5",
  disabledText: "#A3A3A3",
};

function UIButton({
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

  style,
  contentStyle,
  textStyle,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const primary = colors.primary || FALLBACK.primary;

  const primaryPressed = colors.primaryPressed || FALLBACK.primaryPressed;

  const primarySoft = colors.primarySoft || FALLBACK.primarySoft;

  const success = colors.success || FALLBACK.success;

  const successPressed = colors.successPressed || FALLBACK.successPressed;

  const danger = colors.danger || FALLBACK.danger;

  const dangerPressed = colors.dangerPressed || FALLBACK.dangerPressed;

  const white = colors.onPrimary || FALLBACK.white;

  const isDisabled = disabled || loading;

  const buttonColors = useMemo(() => {
    if (isDisabled) {
      return {
        background:
          colors.buttonDisabledBackground || FALLBACK.disabledBackground,

        border: colors.buttonDisabledBorder || FALLBACK.disabledBackground,

        text: colors.buttonDisabledText || FALLBACK.disabledText,

        borderWidth: 1,
      };
    }

    switch (variant) {
      case "outline":
        return {
          background: "transparent",

          border: colors.buttonOutlineBorder || primary,

          text: colors.buttonOutlineText || primary,

          borderWidth: 1,
        };

      case "ghost":
        return {
          background: "transparent",

          border: "transparent",

          text: colors.buttonGhostText || primary,

          borderWidth: 0,
        };

      case "soft":
        return {
          background: colors.buttonSoftBackground || primarySoft,

          border: colors.buttonSoftBackground || primarySoft,

          text: colors.buttonSoftText || primary,

          borderWidth: 1,
        };

      case "danger":
        return {
          background: colors.buttonDangerBackground || danger,

          border: colors.buttonDangerBackground || danger,

          text: colors.buttonDangerText || white,

          borderWidth: 1,
        };

      case "success":
        return {
          background: colors.buttonSuccessBackground || success,

          border: colors.buttonSuccessBackground || success,

          text: colors.buttonSuccessText || white,

          borderWidth: 1,
        };

      case "solid":
      default:
        return {
          background: colors.buttonPrimaryBackground || primary,

          border: colors.buttonPrimaryBackground || primary,

          text: colors.buttonPrimaryText || white,

          borderWidth: 1,
        };
    }
  }, [
    variant,
    isDisabled,
    colors,
    primary,
    primarySoft,
    success,
    danger,
    white,
  ]);

  const dimensions = useMemo(() => getDimensions(size, theme), [size, theme]);

  const buttonStyle = useMemo(
    () => [
      styles.button,

      {
        height: dimensions.height,

        minHeight: dimensions.height,

        paddingHorizontal: dimensions.paddingHorizontal,

        borderRadius: dimensions.borderRadius,

        backgroundColor: buttonColors.background,

        borderColor: buttonColors.border,

        borderWidth: buttonColors.borderWidth,

        width: fullWidth ? "100%" : undefined,

        opacity: isDisabled ? 0.55 : 1,
      },

      style,
    ],
    [dimensions, buttonColors, fullWidth, isDisabled, style],
  );

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

  return (
    <Pressable
      {...props}
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={buttonStyle}
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
        ) : (
          leftIcon && <View style={styles.icon}>{leftIcon}</View>
        )}

        {children !== undefined && children !== null ? (
          <View style={styles.children}>{children}</View>
        ) : title !== undefined && title !== null ? (
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

        {!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
}

function getDimensions(size, theme) {
  const buttonSizes = theme?.sizes?.button || {};

  const radius =
    typeof theme?.radius?.button === "number" ? theme.radius.button : 12;

  const spacing = theme?.spacing || {};

  switch (size) {
    case "sm":
      return {
        height: buttonSizes.sm || 36,

        paddingHorizontal: spacing.md || 16,

        gap: 6,

        borderRadius: radius,

        fontSize: 13,

        lineHeight: 18,
      };

    case "lg":
      return {
        height: buttonSizes.lg || 52,

        paddingHorizontal: spacing.lg || 20,

        gap: 8,

        borderRadius: radius,

        fontSize: 16,

        lineHeight: 22,
      };

    case "xl":
      return {
        height: buttonSizes.xl || 60,

        paddingHorizontal: spacing.xl || 24,

        gap: 8,

        borderRadius: radius,

        fontSize: 17,

        lineHeight: 24,
      };

    case "md":
    default:
      return {
        height: buttonSizes.md || 44,

        paddingHorizontal: spacing.md || 16,

        gap: 8,

        borderRadius: radius,

        fontSize: 14,

        lineHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    flexShrink: 0,
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

    flexShrink: 0,
  },

  text: {
    fontWeight: "600",

    textAlign: "center",

    includeFontPadding: false,

    flexShrink: 1,
  },
});

export default memo(UIButton);

export { UIButton, VARIANTS as UIButtonVariants, SIZES as UIButtonSizes };
