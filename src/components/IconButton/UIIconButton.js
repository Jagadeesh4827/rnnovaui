import React, { memo, useCallback, useMemo, useRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
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

  disabledBackground: "#E5E5E5",
  disabledText: "#A3A3A3",
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

  pressAnimation = true,

  pressScale = 0.94,

  pressAnimationDuration = 100,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const isDisabled = disabled || loading;

  /*
   * Reusable native animation value.
   *
   * Created once for the lifetime
   * of this component instance.
   */
  const scale = useRef(new Animated.Value(1)).current;

  const animationRef = useRef(null);

  const safeVariant = VARIANTS[variant] ? variant : VARIANTS.ghost;

  const safeSize = SIZES[size] ? size : SIZES.md;

  const safeShape = SHAPES[shape] ? shape : SHAPES.circle;

  const variantColors = useMemo(
    () => getVariantColors(safeVariant, colors, isDisabled),
    [safeVariant, colors, isDisabled],
  );

  const dimensions = useMemo(
    () => getDimensions(safeSize, safeShape, theme),
    [safeSize, safeShape, theme],
  );

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();

      animationRef.current = null;
    }
  }, []);

  const animateScale = useCallback(
    (targetScale) => {
      if (!pressAnimation || isDisabled) {
        return;
      }

      stopAnimation();

      const animation = Animated.timing(scale, {
        toValue: targetScale,

        duration: pressAnimationDuration,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      });

      animationRef.current = animation;

      animation.start(() => {
        animationRef.current = null;
      });
    },
    [pressAnimation, isDisabled, stopAnimation, scale, pressAnimationDuration],
  );

  const handlePressIn = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      animateScale(pressScale);

      onPressIn?.(event);
    },
    [isDisabled, animateScale, pressScale, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      animateScale(1);

      onPressOut?.(event);
    },
    [isDisabled, animateScale, onPressOut],
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

  const buttonStyle = useMemo(
    () => [
      styles.button,

      {
        width: dimensions.size,

        height: dimensions.size,

        minWidth: dimensions.size,

        minHeight: dimensions.size,

        borderRadius: dimensions.borderRadius,

        backgroundColor: variantColors.background,

        borderColor: variantColors.border,

        borderWidth: variantColors.borderWidth,

        opacity: isDisabled ? 0.55 : 1,

        transform: [
          {
            scale,
          },
        ],
      },

      style,
    ],
    [dimensions, variantColors, isDisabled, scale, style],
  );

  return (
    <Animated.View style={buttonStyle}>
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
        style={styles.pressable}
      >
        <View style={[styles.iconContainer, iconContainerStyle]}>
          {loading ? (
            <ActivityIndicator size="small" color={variantColors.icon} />
          ) : (
            icon
          )}
        </View>
      </Pressable>
    </Animated.View>
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

      icon: colors.buttonDisabledText || FALLBACK_COLORS.disabledText,
    };
  }

  switch (variant) {
    case VARIANTS.solid:
      return {
        background: colors.buttonPrimaryBackground || primary,

        border: colors.buttonPrimaryBackground || primary,

        borderWidth: 1,

        icon: colors.buttonPrimaryText || white,
      };

    case VARIANTS.outline:
      return {
        background: colors.buttonOutlineBackground || "transparent",

        border: colors.buttonOutlineBorder || primary,

        borderWidth: 1,

        icon: colors.buttonOutlineText || primary,
      };

    case VARIANTS.soft:
      return {
        background: colors.buttonSoftBackground || primarySoft,

        border: colors.buttonSoftBackground || primarySoft,

        borderWidth: 1,

        icon: colors.buttonSoftText || primary,
      };

    case VARIANTS.danger:
      return {
        background: colors.buttonDangerBackground || danger,

        border: colors.buttonDangerBackground || danger,

        borderWidth: 1,

        icon: colors.buttonDangerText || white,
      };

    case VARIANTS.success:
      return {
        background: colors.buttonSuccessBackground || success,

        border: colors.buttonSuccessBackground || success,

        borderWidth: 1,

        icon: colors.buttonSuccessText || white,
      };

    case VARIANTS.ghost:
    default:
      return {
        background: colors.buttonGhostBackground || "transparent",

        border: "transparent",

        borderWidth: 0,

        icon: colors.buttonGhostText || primary,
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

    flexShrink: 0,
  },

  pressable: {
    width: "100%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",
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
