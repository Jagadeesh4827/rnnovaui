import React, { memo, useCallback } from "react";

import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

import { UIText } from "../Text";

/**
 * Button variants
 */
const VARIANTS = {
  solid: "solid",
  outline: "outline",
  ghost: "ghost",
  soft: "soft",
  danger: "danger",
  success: "success",
};

/**
 * Button sizes
 */
const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const UIButtonComponent = ({
  title,

  children,

  variant = VARIANTS.solid,

  size = SIZES.md,

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

  textStyle,

  contentStyle,

  testID,

  accessibilityLabel,

  accessibilityHint,

  accessibilityRole = "button",

  hitSlop,

  pressRetentionOffset,

  android_ripple = true,

  activeOpacity = 0.9,

  ...props
}) => {
  const { theme } = useUITheme();

  /**
   * Prevent callbacks when button
   * cannot currently be interacted with.
   */
  const isDisabled = disabled || loading;

  /**
   * Resolve invalid variant safely.
   */
  const safeVariant = VARIANTS[variant] ? variant : VARIANTS.solid;

  /**
   * Resolve invalid size safely.
   */
  const safeSize = SIZES[size] ? size : SIZES.md;

  /**
   * Theme-dependent colors.
   */
  const colors = getVariantColors(safeVariant, theme.colors);

  /**
   * Theme-dependent dimensions.
   */
  const dimensions = getSizeDimensions(safeSize, theme);

  /**
   * Stable press callback.
   */
  const handlePress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (onPress) {
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

      if (onLongPress) {
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

      if (onPressIn) {
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

      if (onPressOut) {
        onPressOut(event);
      }
    },
    [isDisabled, onPressOut],
  );

  /**
   * Loading indicator color.
   */
  const indicatorColor = colors.text;

  /**
   * Android ripple.
   */
  const ripple = android_ripple
    ? {
        color: colors.ripple,

        borderless: false,
      }
    : undefined;

  const label = title ?? children;

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
      pressRetentionOffset={pressRetentionOffset}
      android_ripple={ripple}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={
        accessibilityLabel ?? (typeof label === "string" ? label : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.base,

        {
          minHeight: dimensions.height,

          paddingHorizontal: dimensions.paddingHorizontal,

          borderRadius: theme.radius.button,

          backgroundColor: colors.background,

          borderColor: colors.border,

          borderWidth: colors.border ? 1 : 0,

          opacity: isDisabled ? 0.55 : pressed ? activeOpacity : 1,

          width: fullWidth ? "100%" : undefined,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.content,

          {
            minHeight: dimensions.height - 2,

            gap: dimensions.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={indicatorColor} />
        ) : (
          leftIcon
        )}

        {!loading && label != null && (
          <UIText
            variant={dimensions.textVariant}
            color={colors.text}
            style={[styles.label, textStyle]}
            numberOfLines={1}
          >
            {label}
          </UIText>
        )}

        {!loading && rightIcon && <View>{rightIcon}</View>}
      </View>
    </Pressable>
  );
};

/**
 * Variant colors.
 */
function getVariantColors(variant, colors) {
  switch (variant) {
    case VARIANTS.outline:
      return {
        background: colors.transparent,

        border: colors.primary,

        text: colors.primary,

        ripple: colors.primarySoft,
      };

    case VARIANTS.ghost:
      return {
        background: colors.transparent,

        border: null,

        text: colors.primary,

        ripple: colors.primarySoft,
      };

    case VARIANTS.soft:
      return {
        background: colors.primarySoft,

        border: null,

        text: colors.primary,

        ripple: colors.primary,
      };

    case VARIANTS.danger:
      return {
        background: colors.danger,

        border: colors.danger,

        text: colors.onPrimary,

        ripple: colors.dangerSoft,
      };

    case VARIANTS.success:
      return {
        background: colors.success,

        border: colors.success,

        text: colors.onPrimary,

        ripple: colors.successSoft,
      };

    case VARIANTS.solid:
    default:
      return {
        background: colors.primary,

        border: colors.primary,

        text: colors.onPrimary,

        ripple: colors.primaryPressed,
      };
  }
}

/**
 * Size dimensions.
 */
function getSizeDimensions(size, theme) {
  switch (size) {
    case SIZES.sm:
      return {
        height: theme.sizes.button.sm,

        paddingHorizontal: theme.spacing.md,

        gap: theme.spacing.xs,

        textVariant: "label",
      };

    case SIZES.lg:
      return {
        height: theme.sizes.button.lg,

        paddingHorizontal: theme.spacing.xl,

        gap: theme.spacing.sm,

        textVariant: "bodyMedium",
      };

    case SIZES.xl:
      return {
        height: theme.sizes.button.xl,

        paddingHorizontal: theme.spacing.xl2,

        gap: theme.spacing.sm,

        textVariant: "bodyMedium",
      };

    case SIZES.md:
    default:
      return {
        height: theme.sizes.button.md,

        paddingHorizontal: theme.spacing.lg,

        gap: theme.spacing.sm,

        textVariant: "label",
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  label: {
    flexShrink: 1,

    textAlign: "center",
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export { VARIANTS as UIButtonVariants, SIZES as UIButtonSizes };
