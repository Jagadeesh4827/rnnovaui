import React, { memo, useCallback, useMemo } from "react";

import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

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
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  xxl: "xxl",
};

const SHAPES = {
  circle: "circle",
  rounded: "rounded",
  square: "square",
};

const FALLBACK_COLORS = {
  primary: "#FF5A1F",
  primarySoft: "#FFF0EA",
  primaryPressed: "#E94D17",

  success: "#16A34A",
  successPressed: "#128238",

  danger: "#DC2626",
  dangerPressed: "#B91C1C",

  white: "#FFFFFF",

  border: "#E5E5E5",

  disabledBackground: "#E5E5E5",
  disabledBorder: "#E5E5E5",
};

function UIIconButtonComponent({
  icon,

  variant = "ghost",

  size = "md",

  shape = "circle",

  disabled = false,

  loading = false,

  onPress,

  onLongPress,

  onPressIn,

  onPressOut,

  style,

  iconContainerStyle,

  hitSlop,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const isDisabled = disabled || loading;

  const resolvedColors = useMemo(
    () => getVariantColors(variant, colors, isDisabled),
    [variant, colors, isDisabled],
  );

  const dimensions = useMemo(
    () => getDimensions(size, shape, theme),
    [size, shape, theme],
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

  const buttonStyle = useMemo(
    () => [
      styles.button,

      {
        width: dimensions.size,

        height: dimensions.size,

        minWidth: dimensions.size,

        minHeight: dimensions.size,

        borderRadius: dimensions.borderRadius,

        backgroundColor: resolvedColors.background,

        borderColor: resolvedColors.border,

        borderWidth: resolvedColors.borderWidth,

        opacity: isDisabled ? 0.55 : 1,
      },

      style,
    ],
    [dimensions, resolvedColors, isDisabled, style],
  );

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
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,

        busy: loading,
      }}
      style={buttonStyle}
    >
      <View style={[styles.iconContainer, iconContainerStyle]}>
        {loading ? (
          <ActivityIndicator size="small" color={resolvedColors.icon} />
        ) : (
          icon
        )}
      </View>
    </Pressable>
  );
}

function getVariantColors(variant, colors, disabled) {
  const primary = colors.primary || FALLBACK_COLORS.primary;

  const primarySoft = colors.primarySoft || FALLBACK_COLORS.primarySoft;

  const primaryPressed =
    colors.primaryPressed || FALLBACK_COLORS.primaryPressed;

  const success = colors.success || FALLBACK_COLORS.success;

  const successPressed =
    colors.successPressed || FALLBACK_COLORS.successPressed;

  const danger = colors.danger || FALLBACK_COLORS.danger;

  const dangerPressed = colors.dangerPressed || FALLBACK_COLORS.dangerPressed;

  const white = colors.onPrimary || FALLBACK_COLORS.white;

  if (disabled) {
    return {
      background:
        colors.buttonDisabledBackground || FALLBACK_COLORS.disabledBackground,

      border: colors.buttonDisabledBorder || FALLBACK_COLORS.disabledBorder,

      borderWidth: 1,

      icon: colors.buttonDisabledText || "#A3A3A3",

      pressed:
        colors.buttonDisabledBackground || FALLBACK_COLORS.disabledBackground,
    };
  }

  switch (variant) {
    case VARIANTS.solid:
      return {
        background: colors.buttonPrimaryBackground || primary,

        border: colors.buttonPrimaryBackground || primary,

        borderWidth: 1,

        icon: colors.buttonPrimaryText || white,

        pressed: colors.buttonPrimaryPressed || primaryPressed,
      };

    case VARIANTS.outline:
      return {
        background: "transparent",

        border: colors.buttonOutlineBorder || primary,

        borderWidth: 1,

        icon: colors.buttonOutlineText || primary,

        pressed: colors.buttonSoftBackground || primarySoft,
      };

    case VARIANTS.soft:
      return {
        background: colors.buttonSoftBackground || primarySoft,

        border: colors.buttonSoftBackground || primarySoft,

        borderWidth: 1,

        icon: colors.buttonSoftText || primary,

        pressed: colors.primaryMuted || primarySoft,
      };

    case VARIANTS.danger:
      return {
        background: colors.buttonDangerBackground || danger,

        border: colors.buttonDangerBackground || danger,

        borderWidth: 1,

        icon: colors.buttonDangerText || white,

        pressed: colors.buttonDangerPressed || dangerPressed,
      };

    case VARIANTS.success:
      return {
        background: colors.buttonSuccessBackground || success,

        border: colors.buttonSuccessBackground || success,

        borderWidth: 1,

        icon: colors.buttonSuccessText || white,

        pressed: colors.buttonSuccessPressed || successPressed,
      };

    case VARIANTS.ghost:
    default:
      return {
        background: "transparent",

        border: "transparent",

        borderWidth: 0,

        icon: colors.buttonGhostText || primary,

        pressed: colors.buttonSoftBackground || primarySoft,
      };
  }
}

function getDimensions(size, shape, theme) {
  const iconSizes = theme?.sizes?.icon || {};

  const radius = theme?.radius || {};

  let resolvedSize;

  switch (size) {
    case SIZES.xs:
      resolvedSize = iconSizes.xs ? iconSizes.xs + 16 : 32;
      break;

    case SIZES.sm:
      resolvedSize = iconSizes.sm ? iconSizes.sm + 16 : 40;
      break;

    case SIZES.lg:
      resolvedSize = iconSizes.lg ? iconSizes.lg + 20 : 52;
      break;

    case SIZES.xl:
      resolvedSize = iconSizes.xl ? iconSizes.xl + 24 : 60;
      break;

    case SIZES.xxl:
      resolvedSize = iconSizes.xxl ? iconSizes.xxl + 28 : 72;
      break;

    case SIZES.md:
    default:
      resolvedSize = iconSizes.md ? iconSizes.md + 20 : 44;
      break;
  }

  let borderRadius;

  switch (shape) {
    case SHAPES.square:
      borderRadius = radius.sm ?? 6;
      break;

    case SHAPES.rounded:
      borderRadius = radius.button ?? 12;
      break;

    case SHAPES.circle:
    default:
      borderRadius = resolvedSize / 2;
      break;
  }

  return {
    size: resolvedSize,

    borderRadius,
  };
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    flexShrink: 0,
  },

  iconContainer: {
    width: "100%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",
  },
});

export const UIIconButton = memo(UIIconButtonComponent);

UIIconButton.displayName = "UIIconButton";

export {
  VARIANTS as UIIconButtonVariants,
  SIZES as UIIconButtonSizes,
  SHAPES as UIIconButtonShapes,
};

export default UIIconButton;
