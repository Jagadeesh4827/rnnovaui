import React, { memo, useCallback } from "react";

import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

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

const UIButtonComponent = ({
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

  android_ripple = true,

  hitSlop,

  accessibilityLabel,
  accessibilityHint,

  testID,

  ...props
}) => {
  const { theme } = useUITheme();

  const safeVariant = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.solid;

  const safeSize = BUTTON_SIZES[size] || BUTTON_SIZES.md;

  const isDisabled = disabled || loading;

  const variantStyle = resolveVariant(safeVariant, theme.colors);

  const sizeStyle = resolveSize(safeSize, theme);

  const handlePress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPress === "function") {
        onPress(event);
      }
    },
    [isDisabled, onPress],
  );

  const handleLongPress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onLongPress === "function") {
        onLongPress(event);
      }
    },
    [isDisabled, onLongPress],
  );

  const handlePressIn = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPressIn === "function") {
        onPressIn(event);
      }
    },
    [isDisabled, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPressOut === "function") {
        onPressOut(event);
      }
    },
    [isDisabled, onPressOut],
  );

  const ripple = android_ripple
    ? {
        color: variantStyle.ripple,
        borderless: false,
      }
    : undefined;

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
      hitSlop={hitSlop}
      android_ripple={ripple}
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
          minHeight: sizeStyle.height,

          paddingHorizontal: sizeStyle.paddingHorizontal,

          borderRadius: sizeStyle.borderRadius,

          backgroundColor: variantStyle.background,

          borderColor: variantStyle.border,

          borderWidth: variantStyle.border ? 1 : 0,

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
            minHeight: sizeStyle.height - 2,

            gap: sizeStyle.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.text} />
        ) : leftIcon ? (
          <View style={styles.iconContainer}>{leftIcon}</View>
        ) : null}

        {hasChildren ? (
          <View style={styles.children}>{children}</View>
        ) : title !== undefined && title !== null ? (
          <ButtonText
            color={variantStyle.text}
            sizeStyle={sizeStyle}
            style={textStyle}
          >
            {title}
          </ButtonText>
        ) : null}

        {!loading && rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
};

function ButtonText({ children, color, sizeStyle, style }) {
  return (
    <View style={styles.textWrapper}>
      <ButtonTextNative color={color} sizeStyle={sizeStyle} style={style}>
        {children}
      </ButtonTextNative>
    </View>
  );
}

function ButtonTextNative({ children, color, sizeStyle, style }) {
  const { theme } = useUITheme();

  const { Text } = require("react-native");

  return (
    <Text
      numberOfLines={1}
      style={[
        {
          color,

          fontSize: sizeStyle.fontSize,

          lineHeight: sizeStyle.lineHeight,

          fontWeight: "600",

          textAlign: "center",
        },

        style,
      ]}
    >
      {children}
    </Text>
  );
}

function resolveVariant(variant, colors) {
  const primary = colors.primary || "#FF5A1F";

  const primarySoft = colors.primarySoft || "#FFF0EA";

  const primaryPressed = colors.primaryPressed || primary;

  const success = colors.success || "#16A34A";

  const danger = colors.danger || "#DC2626";

  const surface = colors.surface || "#F5F5F5";

  const border = colors.border || "#E5E5E5";

  const borderStrong = colors.borderStrong || "#D4D4D4";

  const text = colors.text || "#111111";

  const onPrimary = colors.onPrimary || "#FFFFFF";

  switch (variant) {
    case BUTTON_VARIANTS.outline:
      return {
        background: colors.transparent || "transparent",

        border: primary,

        text: primary,

        ripple: primarySoft,
      };

    case BUTTON_VARIANTS.ghost:
      return {
        background: colors.transparent || "transparent",

        border: null,

        text: primary,

        ripple: primarySoft,
      };

    case BUTTON_VARIANTS.soft:
      return {
        background: primarySoft,

        border: null,

        text: primary,

        ripple: primary,
      };

    case BUTTON_VARIANTS.danger:
      return {
        background: danger,

        border: danger,

        text: onPrimary,

        ripple: danger,
      };

    case BUTTON_VARIANTS.success:
      return {
        background: success,

        border: success,

        text: onPrimary,

        ripple: success,
      };

    case BUTTON_VARIANTS.solid:
    default:
      return {
        background: primary,

        border: primary,

        text: onPrimary,

        ripple: primaryPressed,
      };
  }
}

function resolveSize(size, theme) {
  const spacing = theme.spacing;

  const sizes = theme.sizes;

  const radius = theme.radius;

  switch (size) {
    case BUTTON_SIZES.sm:
      return {
        height: sizes.button.sm,

        paddingHorizontal: spacing.md,

        gap: spacing.xs,

        borderRadius: radius.button,

        fontSize: 13,

        lineHeight: 18,
      };

    case BUTTON_SIZES.lg:
      return {
        height: sizes.button.lg,

        paddingHorizontal: spacing.xl,

        gap: spacing.sm,

        borderRadius: radius.button,

        fontSize: 16,

        lineHeight: 22,
      };

    case BUTTON_SIZES.xl:
      return {
        height: sizes.button.xl,

        paddingHorizontal: spacing.xl2,

        gap: spacing.sm,

        borderRadius: radius.button,

        fontSize: 17,

        lineHeight: 24,
      };

    case BUTTON_SIZES.md:
    default:
      return {
        height: sizes.button.md,

        paddingHorizontal: spacing.lg,

        gap: spacing.sm,

        borderRadius: radius.button,

        fontSize: 14,

        lineHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  content: {
    width: "100%",
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

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  textWrapper: {
    flexShrink: 1,
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export { BUTTON_VARIANTS as UIButtonVariants, BUTTON_SIZES as UIButtonSizes };
