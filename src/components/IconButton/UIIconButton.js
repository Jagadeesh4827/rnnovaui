import React, { memo, useCallback } from "react";

import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

const SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const VARIANTS = {
  solid: "solid",
  outline: "outline",
  ghost: "ghost",
  soft: "soft",
  danger: "danger",
  success: "success",
};

const SHAPES = {
  circle: "circle",
  rounded: "rounded",
  square: "square",
};

const UIIconButtonComponent = ({
  icon,

  size = "md",

  variant = "ghost",

  shape = "circle",

  disabled = false,

  loading = false,

  onPress,

  onLongPress,

  onPressIn,

  onPressOut,

  style,

  iconContainerStyle,

  activeOpacity = 0.82,

  android_ripple = true,

  hitSlop = 8,

  accessibilityLabel,

  accessibilityHint,

  testID,

  ...props
}) => {
  const { theme } = useUITheme();

  const safeSize = SIZES[size] ? size : SIZES.md;

  const safeVariant = VARIANTS[variant] ? variant : VARIANTS.ghost;

  const safeShape = SHAPES[shape] ? shape : SHAPES.circle;

  const isDisabled = disabled || loading;

  const dimensions = getDimensions(safeSize, theme);

  const colors = getColors(safeVariant, theme.colors);

  const borderRadius = getBorderRadius(safeShape, theme);

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

  const ripple = android_ripple
    ? {
        color: colors.ripple,
        borderless: false,
      }
    : undefined;

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
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,

        {
          width: dimensions.size,

          height: dimensions.size,

          borderRadius,

          backgroundColor: colors.background,

          borderColor: colors.border,

          borderWidth: colors.border ? 1 : 0,

          opacity: isDisabled ? 0.5 : pressed ? activeOpacity : 1,
        },

        style,
      ]}
    >
      <View style={[styles.iconContainer, iconContainerStyle]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.icon} />
        ) : (
          icon
        )}
      </View>
    </Pressable>
  );
};

function getDimensions(size, theme) {
  switch (size) {
    case SIZES.xs:
      return {
        size: theme.sizes.icon.lg + theme.spacing.sm,
      };

    case SIZES.sm:
      return {
        size: theme.sizes.button.sm,
      };

    case SIZES.lg:
      return {
        size: theme.sizes.button.lg,
      };

    case SIZES.xl:
      return {
        size: theme.sizes.button.xl,
      };

    case SIZES.md:
    default:
      return {
        size: theme.sizes.button.md,
      };
  }
}

function getBorderRadius(shape, theme) {
  switch (shape) {
    case SHAPES.rounded:
      return theme.radius.lg;

    case SHAPES.square:
      return theme.radius.sm;

    case SHAPES.circle:
    default:
      return theme.radius.circle;
  }
}

function getColors(variant, colors) {
  switch (variant) {
    case VARIANTS.solid:
      return {
        background: colors.primary,

        border: colors.primary,

        icon: colors.onPrimary,

        ripple: colors.primaryPressed,
      };

    case VARIANTS.outline:
      return {
        background: colors.transparent,

        border: colors.borderStrong,

        icon: colors.text,

        ripple: colors.surfaceSecondary,
      };

    case VARIANTS.soft:
      return {
        background: colors.primarySoft,

        border: null,

        icon: colors.primary,

        ripple: colors.primary,
      };

    case VARIANTS.danger:
      return {
        background: colors.danger,

        border: colors.danger,

        icon: colors.onPrimary,

        ripple: colors.dangerSoft,
      };

    case VARIANTS.success:
      return {
        background: colors.success,

        border: colors.success,

        icon: colors.onPrimary,

        ripple: colors.successSoft,
      };

    case VARIANTS.ghost:
    default:
      return {
        background: colors.transparent,

        border: null,

        icon: colors.text,

        ripple: colors.surfaceSecondary,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export const UIIconButton = memo(UIIconButtonComponent);

UIIconButton.displayName = "UIIconButton";

export {
  SIZES as UIIconButtonSizes,
  VARIANTS as UIIconButtonVariants,
  SHAPES as UIIconButtonShapes,
};
