import React, { memo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const UI_TOAST_VARIANTS = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  neutral: "neutral",
};

const UI_TOAST_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SIZE_CONFIG = {
  sm: {
    padding: 10,
    icon: 18,
    title: 13,
    description: 12,
    radius: 10,
  },

  md: {
    padding: 14,
    icon: 22,
    title: 14,
    description: 13,
    radius: 12,
  },

  lg: {
    padding: 18,
    icon: 26,
    title: 16,
    description: 14,
    radius: 14,
  },
};

const DEFAULT_ICONS = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
  neutral: "•",
};

const UIToast = memo(function UIToast({ toast, animatedValue, onDismiss }) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const {
    variant = "info",
    title,
    description,
    message,
    icon,
    size = "md",
    duration = 3000,
    action,
    actionLabel,
    onAction,
    closeable = true,
    onClose,
    disabled = false,
    backgroundColor,
    accentColor,
    textColor,
    descriptionColor,
    iconColor,
    actionColor,
    closeColor,
    style,
    contentStyle,
    titleStyle,
    descriptionStyle,
    iconStyle,
    actionStyle,
    closeStyle,
  } = toast;

  const safeVariant = UI_TOAST_VARIANTS[variant] ? variant : "info";

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const variantColors = {
    success: colors.success || "#16A34A",

    error: colors.danger || "#DC2626",

    warning: colors.warning || "#D97706",

    info: colors.info || "#2563EB",

    neutral: colors.textSecondary || "#525252",
  };

  const accent = accentColor || variantColors[safeVariant];

  const bg = backgroundColor || colors.card || "#FFFFFF";

  const titleColor = textColor || colors.text || "#111111";

  const descColor = descriptionColor || colors.textSecondary || "#525252";

  const resolvedIcon = icon !== undefined ? icon : DEFAULT_ICONS[safeVariant];

  const resolvedMessage = description || message;

  const handleAction = () => {
    if (disabled) {
      return;
    }

    onAction?.();

    if (toast.autoDismissOnAction !== false) {
      onDismiss();
    }
  };

  const handleClose = () => {
    if (disabled) {
      return;
    }

    onClose?.();

    onDismiss();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: animatedValue,

          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: bg,
            borderRadius: config.radius,

            borderColor: colors.border || "#E5E5E5",

            opacity: disabled ? 0.55 : 1,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.accent,
            {
              backgroundColor: accent,
              borderRadius: config.radius,
            },
          ]}
        />

        <View
          style={[
            styles.content,
            {
              padding: config.padding,
            },
            contentStyle,
          ]}
        >
          {resolvedIcon ? (
            <View
              style={[
                styles.iconContainer,
                {
                  width: config.icon,
                  minHeight: config.icon,
                },
              ]}
            >
              {typeof resolvedIcon === "string" ? (
                <Text
                  style={[
                    styles.icon,
                    {
                      fontSize: config.icon,
                      color: iconColor || accent,
                    },
                    iconStyle,
                  ]}
                >
                  {resolvedIcon}
                </Text>
              ) : (
                resolvedIcon
              )}
            </View>
          ) : null}

          <View style={styles.textContainer}>
            {title ? (
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: config.title,
                    color: titleColor,
                  },
                  titleStyle,
                ]}
              >
                {title}
              </Text>
            ) : null}

            {resolvedMessage ? (
              <Text
                style={[
                  styles.description,
                  {
                    fontSize: config.description,
                    color: descColor,
                    marginTop: title ? 3 : 0,
                  },
                  descriptionStyle,
                ]}
              >
                {resolvedMessage}
              </Text>
            ) : null}

            {action || actionLabel ? (
              <View style={styles.actionContainer}>
                {action || (
                  <Pressable
                    disabled={disabled}
                    onPress={handleAction}
                    hitSlop={8}
                  >
                    {({ pressed }) => (
                      <Text
                        style={[
                          styles.action,
                          {
                            color: actionColor || accent,

                            opacity: pressed || disabled ? 0.55 : 1,
                          },
                          actionStyle,
                        ]}
                      >
                        {actionLabel}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>

          {closeable ? (
            <Pressable
              disabled={disabled}
              onPress={handleClose}
              hitSlop={10}
              style={styles.closeButton}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.close,
                    {
                      color: closeColor || colors.textMuted || "#737373",

                      opacity: pressed || disabled ? 0.5 : 1,
                    },
                    closeStyle,
                  ]}
                >
                  ×
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 10,
  },

  container: {
    width: "100%",
    overflow: "hidden",

    borderWidth: 1,

    elevation: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  accent: {
    position: "absolute",

    left: 0,
    top: 0,
    bottom: 0,

    width: 4,
  },

  content: {
    flexDirection: "row",
    alignItems: "flex-start",

    paddingLeft: 16,
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  icon: {
    fontWeight: "800",
    textAlign: "center",

    includeFontPadding: false,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontWeight: "700",
    lineHeight: 20,

    includeFontPadding: false,
  },

  description: {
    lineHeight: 18,

    includeFontPadding: false,
  },

  actionContainer: {
    marginTop: 8,
  },

  action: {
    fontSize: 13,
    fontWeight: "700",

    includeFontPadding: false,
  },

  closeButton: {
    marginLeft: 8,
    paddingLeft: 4,
  },

  close: {
    fontSize: 22,
    lineHeight: 22,

    includeFontPadding: false,
  },
});

export default UIToast;
export { UI_TOAST_VARIANTS as UIToastVariants };
