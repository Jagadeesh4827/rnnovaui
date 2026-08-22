import React, { memo, useEffect, useRef } from "react";

import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const TOAST_VARIANTS = {
  default: "default",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

const TOAST_POSITIONS = {
  top: "top",
  center: "center",
  bottom: "bottom",
};

const TOAST_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

function UIToastComponent({
  visible = false,

  title,
  message,

  variant = "default",

  position = "bottom",

  size = "md",

  icon,

  action,

  onAction,

  onDismiss,

  duration = 3000,

  dismissible = true,

  animated = true,

  containerStyle,
  contentStyle,
  titleStyle,
  messageStyle,
  actionStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeVariant = TOAST_VARIANTS[variant]
    ? variant
    : TOAST_VARIANTS.default;

  const safePosition = TOAST_POSITIONS[position]
    ? position
    : TOAST_POSITIONS.bottom;

  const safeSize = TOAST_SIZES[size] ? size : TOAST_SIZES.md;

  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  const translateY = useRef(
    new Animated.Value(getInitialOffset(safePosition)),
  ).current;

  useEffect(() => {
    if (!visible) {
      if (!animated) {
        opacity.setValue(0);
        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: getInitialOffset(safePosition),
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (!animated) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);

    translateY.setValue(getInitialOffset(safePosition));

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, animated, safePosition, opacity, translateY]);

  useEffect(() => {
    if (!visible || !duration || !onDismiss) {
      return;
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  const variantColors = getVariantColors(safeVariant, colors);

  const dimensions = getDimensions(safeSize);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      pointerEvents="box-none"
      style={[
        styles.wrapper,

        getPositionStyle(safePosition),

        {
          opacity,

          transform: [
            {
              translateY,
            },
          ],
        },

        containerStyle,
      ]}
    >
      <View
        style={[
          styles.container,

          {
            minHeight: dimensions.height,

            paddingHorizontal: dimensions.paddingHorizontal,

            paddingVertical: dimensions.paddingVertical,

            backgroundColor: variantColors.background,

            borderColor: variantColors.border,
          },
        ]}
      >
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

        <View style={[styles.content, contentStyle]}>
          {title ? (
            <Text
              numberOfLines={2}
              style={[
                styles.title,

                {
                  color: variantColors.text,

                  fontSize: dimensions.titleSize,
                },

                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text
              numberOfLines={4}
              style={[
                styles.message,

                {
                  color: variantColors.text,

                  fontSize: dimensions.messageSize,
                },

                messageStyle,
              ]}
            >
              {message}
            </Text>
          ) : null}
        </View>

        {action ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            style={[styles.action, actionStyle]}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: variantColors.action,
                },
              ]}
            >
              {action}
            </Text>
          </Pressable>
        ) : null}

        {dismissible ? (
          <Pressable
            onPress={onDismiss}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            style={styles.close}
          >
            <Text
              style={[
                styles.closeText,
                {
                  color: variantColors.text,
                },
              ]}
            >
              ×
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

function getInitialOffset(position) {
  if (position === TOAST_POSITIONS.top) {
    return -30;
  }

  if (position === TOAST_POSITIONS.center) {
    return 15;
  }

  return 30;
}

function getPositionStyle(position) {
  switch (position) {
    case TOAST_POSITIONS.top:
      return {
        top: 20,
      };

    case TOAST_POSITIONS.center:
      return {
        top: "45%",
      };

    case TOAST_POSITIONS.bottom:
    default:
      return {
        bottom: 20,
      };
  }
}

function getVariantColors(variant, colors) {
  switch (variant) {
    case TOAST_VARIANTS.primary:
      return {
        background: colors.primarySoft || colors.primary || "#FFF0EA",

        border: colors.primary || "#FF5A1F",

        text: colors.text || "#111111",

        action: colors.primary || "#FF5A1F",
      };

    case TOAST_VARIANTS.success:
      return {
        background: colors.successSoft || colors.success || "#EAF8EF",

        border: colors.success || "#16A34A",

        text: colors.text || "#111111",

        action: colors.success || "#16A34A",
      };

    case TOAST_VARIANTS.warning:
      return {
        background: colors.warningSoft || colors.warning || "#FFF7E6",

        border: colors.warning || "#D97706",

        text: colors.text || "#111111",

        action: colors.warning || "#D97706",
      };

    case TOAST_VARIANTS.danger:
      return {
        background: colors.dangerSoft || colors.danger || "#FDECEC",

        border: colors.danger || "#DC2626",

        text: colors.text || "#111111",

        action: colors.danger || "#DC2626",
      };

    case TOAST_VARIANTS.info:
      return {
        background: colors.infoSoft || colors.info || "#EBF2FF",

        border: colors.info || "#2563EB",

        text: colors.text || "#111111",

        action: colors.info || "#2563EB",
      };

    case TOAST_VARIANTS.default:
    default:
      return {
        background: colors.card || colors.surface || "#FFFFFF",

        border: colors.border || "#E5E5E5",

        text: colors.text || "#111111",

        action: colors.primary || "#FF5A1F",
      };
  }
}

function getDimensions(size) {
  switch (size) {
    case TOAST_SIZES.sm:
      return {
        height: 42,
        paddingHorizontal: 12,
        paddingVertical: 8,
        titleSize: 12,
        messageSize: 11,
      };

    case TOAST_SIZES.lg:
      return {
        height: 64,
        paddingHorizontal: 16,
        paddingVertical: 12,
        titleSize: 15,
        messageSize: 13,
      };

    case TOAST_SIZES.md:
    default:
      return {
        height: 52,
        paddingHorizontal: 14,
        paddingVertical: 10,
        titleSize: 14,
        messageSize: 12,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    left: 16,

    right: 16,

    zIndex: 9999,

    elevation: 9999,
  },

  container: {
    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderRadius: 12,

    elevation: 5,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.16,

    shadowRadius: 8,
  },

  iconContainer: {
    marginRight: 10,

    alignItems: "center",

    justifyContent: "center",
  },

  content: {
    flex: 1,

    minWidth: 0,
  },

  title: {
    fontWeight: "700",

    lineHeight: 19,

    includeFontPadding: false,
  },

  message: {
    marginTop: 2,

    lineHeight: 17,

    includeFontPadding: false,
  },

  action: {
    marginLeft: 10,

    paddingHorizontal: 4,

    paddingVertical: 4,
  },

  actionText: {
    fontSize: 12,

    fontWeight: "700",

    includeFontPadding: false,
  },

  close: {
    marginLeft: 8,

    width: 24,

    height: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  closeText: {
    fontSize: 22,

    lineHeight: 22,

    fontWeight: "400",

    includeFontPadding: false,
  },
});

export const UIToast = memo(UIToastComponent);

UIToast.displayName = "UIToast";

export {
  TOAST_VARIANTS as UIToastVariants,
  TOAST_POSITIONS as UIToastPositions,
  TOAST_SIZES as UIToastSizes,
};

export default UIToast;
