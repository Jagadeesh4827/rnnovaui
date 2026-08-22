import React, { forwardRef, memo, useCallback, useMemo, useRef } from "react";

import { Animated, Easing, Pressable, StyleSheet, Text } from "react-native";

import { useUITheme } from "../../theme";

const BUTTON_LINK_SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
};

const BUTTON_LINK_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
  warning: "warning",
  neutral: "neutral",
  muted: "muted",
};

const BUTTON_LINK_UNDERLINES = {
  none: "none",
  always: "always",
  pressed: "pressed",
};

const UIButtonLinkComponent = forwardRef(function UIButtonLink(
  {
    children,
    title,

    onPress,
    onLongPress,

    variant = "primary",
    size = "md",

    underline = "none",

    disabled = false,
    loading = false,

    activeOpacity = 0.65,

    leftIcon,
    rightIcon,

    gap = 5,

    textStyle,
    iconStyle,

    hitSlop = 8,

    pressAnimation = true,

    accessibilityLabel,

    testID,

    style,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const scale = useRef(new Animated.Value(1)).current;

  const opacity = useRef(new Animated.Value(1)).current;

  const dimensions = useMemo(() => getDimensions(size), [size]);

  const resolvedVariant = BUTTON_LINK_VARIANTS[variant]
    ? variant
    : BUTTON_LINK_VARIANTS.primary;

  const resolvedUnderline = BUTTON_LINK_UNDERLINES[underline]
    ? underline
    : BUTTON_LINK_UNDERLINES.none;

  const color = getVariantColor(resolvedVariant, colors);

  const content = title ?? children;

  const animatePressIn = useCallback(() => {
    if (!pressAnimation) {
      return;
    }

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,

        duration: 80,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: activeOpacity,

        duration: 80,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      }),
    ]).start();
  }, [pressAnimation, activeOpacity, scale, opacity]);

  const animatePressOut = useCallback(() => {
    if (!pressAnimation) {
      return;
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,

        friction: 7,

        tension: 120,

        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 1,

        duration: 100,

        easing: Easing.out(Easing.quad),

        useNativeDriver: true,
      }),
    ]).start();
  }, [pressAnimation, scale, opacity]);

  const handlePress = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    onPress?.();
  }, [disabled, loading, onPress]);

  const showUnderline =
    resolvedUnderline === BUTTON_LINK_UNDERLINES.always ||
    resolvedUnderline === BUTTON_LINK_UNDERLINES.pressed;

  return (
    <Animated.View
      style={[
        styles.wrapper,

        {
          opacity: disabled ? 0.45 : 1,

          transform: [
            {
              scale,
            },
          ],
        },

        style,
      ]}
    >
      <Pressable
        {...props}
        ref={ref}
        testID={testID}
        disabled={disabled || loading}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        hitSlop={hitSlop}
        accessibilityRole="link"
        accessibilityLabel={
          accessibilityLabel ||
          (typeof content === "string" ? content : undefined)
        }
        accessibilityState={{
          disabled: disabled || loading,

          busy: loading,
        }}
        style={styles.pressable}
      >
        {leftIcon ? (
          <Animated.View
            style={[
              styles.icon,

              {
                marginRight: gap,
              },

              iconStyle,
            ]}
          >
            {leftIcon}
          </Animated.View>
        ) : null}

        {loading ? (
          <LoadingIndicator color={color} size={dimensions.loaderSize} />
        ) : (
          <Text
            numberOfLines={1}
            style={[
              styles.text,

              {
                color,

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.lineHeight,

                textDecorationLine: showUnderline ? "underline" : "none",
              },

              textStyle,
            ]}
          >
            {content}
          </Text>
        )}

        {rightIcon && !loading ? (
          <Animated.View
            style={[
              styles.icon,

              {
                marginLeft: gap,
              },

              iconStyle,
            ]}
          >
            {rightIcon}
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

function getDimensions(size) {
  switch (size) {
    case BUTTON_LINK_SIZES.xs:
      return {
        fontSize: 11,
        lineHeight: 15,
        loaderSize: 13,
      };

    case BUTTON_LINK_SIZES.sm:
      return {
        fontSize: 12,
        lineHeight: 17,
        loaderSize: 14,
      };

    case BUTTON_LINK_SIZES.lg:
      return {
        fontSize: 16,
        lineHeight: 22,
        loaderSize: 18,
      };

    case BUTTON_LINK_SIZES.md:
    default:
      return {
        fontSize: 14,
        lineHeight: 20,
        loaderSize: 16,
      };
  }
}

function getVariantColor(variant, colors) {
  switch (variant) {
    case BUTTON_LINK_VARIANTS.secondary:
      return colors.onSecondary || colors.text || "#111111";

    case BUTTON_LINK_VARIANTS.success:
      return colors.success || "#16A34A";

    case BUTTON_LINK_VARIANTS.danger:
      return colors.danger || "#DC2626";

    case BUTTON_LINK_VARIANTS.warning:
      return colors.warning || "#D97706";

    case BUTTON_LINK_VARIANTS.neutral:
      return colors.text || "#111111";

    case BUTTON_LINK_VARIANTS.muted:
      return colors.textMuted || "#737373";

    case BUTTON_LINK_VARIANTS.primary:
    default:
      return colors.primary || "#FF5A1F";
  }
}

function LoadingIndicator({ color, size }) {
  return (
    <Animated.View
      style={[
        styles.loader,

        {
          width: size,
          height: size,

          borderRadius: size / 2,

          borderTopColor: color,

          borderRightColor: color,

          borderBottomColor: "transparent",

          borderLeftColor: "transparent",
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },

  pressable: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    minHeight: 24,
  },

  text: {
    fontWeight: "600",

    includeFontPadding: false,

    textAlign: "center",
  },

  icon: {
    alignItems: "center",

    justifyContent: "center",
  },

  loader: {
    borderWidth: 2,
  },
});

export const UIButtonLink = memo(UIButtonLinkComponent);

UIButtonLink.displayName = "UIButtonLink";

export {
  BUTTON_LINK_SIZES as UIButtonLinkSizes,
  BUTTON_LINK_VARIANTS as UIButtonLinkVariants,
  BUTTON_LINK_UNDERLINES as UIButtonLinkUnderlines,
};

export default UIButtonLink;
