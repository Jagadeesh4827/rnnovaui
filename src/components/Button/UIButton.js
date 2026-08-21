import React, { memo, useCallback, useMemo, useRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
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

const FALLBACK_COLORS = {
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
  disabledBorder: "#E5E5E5",
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

  pressAnimation = true,

  pressScale = 0.97,

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
   * Native Animated value.
   *
   * Created once and reused.
   * This avoids creating animation
   * objects on every render.
   */
  const scale = useRef(new Animated.Value(1)).current;

  const animationRef = useRef(null);

  const safeVariant = BUTTON_VARIANTS[variant]
    ? variant
    : BUTTON_VARIANTS.solid;

  const safeSize = BUTTON_SIZES[size] ? size : BUTTON_SIZES.md;

  const buttonColors = useMemo(
    () => getVariantColors(safeVariant, colors, isDisabled),
    [safeVariant, colors, isDisabled],
  );

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
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

      animationRef.current = Animated.timing(scale, {
        toValue: targetScale,

        duration: pressAnimationDuration,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      });

      animationRef.current.start(() => {
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
        height: dimensions.height,

        minHeight: dimensions.height,

        paddingHorizontal: dimensions.paddingHorizontal,

        borderRadius: dimensions.borderRadius,

        backgroundColor: buttonColors.background,

        borderColor: buttonColors.border,

        borderWidth: buttonColors.borderWidth,

        width: fullWidth ? "100%" : undefined,

        opacity: isDisabled ? 0.55 : 1,

        transform: [
          {
            scale,
          },
        ],
      },

      style,
    ],
    [dimensions, buttonColors, fullWidth, isDisabled, scale, style],
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
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || (typeof title === "string" ? title : undefined)
        }
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: isDisabled,

          busy: loading,
        }}
        style={styles.pressable}
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

          {!loading && rightIcon && (
            <View style={styles.icon}>{rightIcon}</View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getVariantColors(variant, colors, disabled) {
  const primary = colors.primary || FALLBACK_COLORS.primary;

  const primarySoft = colors.primarySoft || FALLBACK_COLORS.primarySoft;

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

      text: colors.buttonDisabledText || FALLBACK_COLORS.disabledText,
    };
  }

  switch (variant) {
    case BUTTON_VARIANTS.outline:
      return {
        background: colors.buttonOutlineBackground || "transparent",

        border: colors.buttonOutlineBorder || primary,

        borderWidth: 1,

        text: colors.buttonOutlineText || primary,
      };

    case BUTTON_VARIANTS.ghost:
      return {
        background: colors.buttonGhostBackground || "transparent",

        border: "transparent",

        borderWidth: 0,

        text: colors.buttonGhostText || primary,
      };

    case BUTTON_VARIANTS.soft:
      return {
        background: colors.buttonSoftBackground || primarySoft,

        border: colors.buttonSoftBackground || primarySoft,

        borderWidth: 1,

        text: colors.buttonSoftText || primary,
      };

    case BUTTON_VARIANTS.danger:
      return {
        background: colors.buttonDangerBackground || danger,

        border: colors.buttonDangerBackground || danger,

        borderWidth: 1,

        text: colors.buttonDangerText || white,
      };

    case BUTTON_VARIANTS.success:
      return {
        background: colors.buttonSuccessBackground || success,

        border: colors.buttonSuccessBackground || success,

        borderWidth: 1,

        text: colors.buttonSuccessText || white,
      };

    case BUTTON_VARIANTS.solid:
    default:
      return {
        background: colors.buttonPrimaryBackground || primary,

        border: colors.buttonPrimaryBackground || primary,

        borderWidth: 1,

        text: colors.buttonPrimaryText || white,
      };
  }
}

function getDimensions(size, theme) {
  const buttonSizes = theme?.sizes?.button || {};

  const radius =
    typeof theme?.radius?.button === "number" ? theme.radius.button : 12;

  const spacing = theme?.spacing || {};

  switch (size) {
    case BUTTON_SIZES.sm:
      return {
        height: buttonSizes.sm || 36,

        paddingHorizontal: spacing.md || 16,

        gap: 6,

        borderRadius: radius,

        fontSize: 13,

        lineHeight: 18,
      };

    case BUTTON_SIZES.lg:
      return {
        height: buttonSizes.lg || 52,

        paddingHorizontal: spacing.lg || 20,

        gap: 8,

        borderRadius: radius,

        fontSize: 16,

        lineHeight: 22,
      };

    case BUTTON_SIZES.xl:
      return {
        height: buttonSizes.xl || 60,

        paddingHorizontal: spacing.xl || 24,

        gap: 8,

        borderRadius: radius,

        fontSize: 17,

        lineHeight: 24,
      };

    case BUTTON_SIZES.md:
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
    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",
  },

  pressable: {
    width: "100%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",
  },

  content: {
    width: "100%",

    height: "100%",

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
    flexShrink: 1,

    fontWeight: "600",

    textAlign: "center",

    includeFontPadding: false,
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export { BUTTON_VARIANTS as UIButtonVariants, BUTTON_SIZES as UIButtonSizes };

export default UIButton;
