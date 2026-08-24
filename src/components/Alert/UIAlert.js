import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const UI_ALERT_VARIANTS = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  neutral: "neutral",
};

const UI_ALERT_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const UI_ALERT_STYLES = {
  soft: "soft",
  solid: "solid",
  outline: "outline",
};

const UI_ALERT_POSITIONS = {
  left: "left",
  center: "center",
};

const SIZE_CONFIG = {
  sm: {
    padding: 10,
    iconSize: 18,
    titleSize: 13,
    descriptionSize: 12,
    actionSize: 12,
    closeSize: 18,
    gap: 8,
  },

  md: {
    padding: 14,
    iconSize: 22,
    titleSize: 14,
    descriptionSize: 13,
    actionSize: 13,
    closeSize: 20,
    gap: 10,
  },

  lg: {
    padding: 18,
    iconSize: 26,
    titleSize: 16,
    descriptionSize: 14,
    actionSize: 14,
    closeSize: 22,
    gap: 12,
  },
};

const DEFAULT_ICONS = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
  neutral: "•",
};

const UIAlertComponent = forwardRef(function UIAlert(
  {
    variant = "info",

    title,
    description,
    children,

    icon,
    showIcon = true,

    action,
    actionLabel,
    onAction,

    closeable = false,
    onClose,

    size = "md",

    alertStyle = "soft",

    position = "left",

    animated = false,
    animationDuration = 180,

    pressable = false,
    onPress,

    disabled = false,

    backgroundColor,
    borderColor,
    accentColor,
    textColor,
    descriptionColor,
    iconColor,
    actionColor,
    closeColor,

    borderWidth = 1,

    radius,

    containerStyle,
    contentStyle,
    iconContainerStyle,
    titleStyle,
    descriptionStyle,
    actionStyle,
    closeStyle,

    accessibilityLabel,
    accessibilityHint,

    testID,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  /*
   * --------------------------------------------------
   * SAFE VALUES
   * --------------------------------------------------
   */

  const safeVariant = UI_ALERT_VARIANTS[variant]
    ? variant
    : UI_ALERT_VARIANTS.info;

  const safeSize = UI_ALERT_SIZES[size] ? size : UI_ALERT_SIZES.md;

  const safeAlertStyle = UI_ALERT_STYLES[alertStyle]
    ? alertStyle
    : UI_ALERT_STYLES.soft;

  const safePosition = UI_ALERT_POSITIONS[position]
    ? position
    : UI_ALERT_POSITIONS.left;

  const config = SIZE_CONFIG[safeSize];

  /*
   * --------------------------------------------------
   * VARIANT COLORS
   * --------------------------------------------------
   */

  const variantConfig = useMemo(() => {
    const map = {
      success: {
        color: colors.success || "#16A34A",

        soft: colors.successSoft || "#EAF8EF",

        onColor: "#FFFFFF",
      },

      error: {
        color: colors.danger || "#DC2626",

        soft: colors.dangerSoft || "#FDECEC",

        onColor: "#FFFFFF",
      },

      warning: {
        color: colors.warning || "#D97706",

        soft: colors.warningSoft || "#FFF7E6",

        onColor: "#FFFFFF",
      },

      info: {
        color: colors.info || "#2563EB",

        soft: colors.infoSoft || "#EBF2FF",

        onColor: "#FFFFFF",
      },

      neutral: {
        color: colors.textSecondary || "#525252",

        soft: colors.surfaceSecondary || "#F1F1F1",

        onColor: colors.textInverse || "#FFFFFF",
      },
    };

    return map[safeVariant];
  }, [colors, safeVariant]);

  /*
   * --------------------------------------------------
   * RESOLVED COLORS
   * --------------------------------------------------
   */

  const resolvedAccentColor = accentColor || variantConfig.color;

  const resolvedBackgroundColor =
    backgroundColor ||
    getBackgroundColor(safeAlertStyle, variantConfig, colors);

  const resolvedBorderColor = borderColor || resolvedAccentColor;

  const resolvedTextColor =
    textColor || getTextColor(safeAlertStyle, variantConfig, colors);

  const resolvedDescriptionColor =
    descriptionColor ||
    getDescriptionColor(safeAlertStyle, variantConfig, colors);

  const resolvedIconColor =
    iconColor || getIconColor(safeAlertStyle, variantConfig);

  const resolvedActionColor = actionColor || resolvedAccentColor;

  const resolvedCloseColor = closeColor || resolvedDescriptionColor;

  /*
   * --------------------------------------------------
   * RADIUS
   * --------------------------------------------------
   */

  const resolvedRadius =
    radius !== undefined ? radius : getDefaultRadius(safeSize, colors);

  /*
   * --------------------------------------------------
   * ANIMATION
   * --------------------------------------------------
   */

  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  const translateY = useRef(new Animated.Value(animated ? 6 : 0)).current;

  useEffect(() => {
    if (!animated) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(6);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, animationDuration, opacity, translateY]);

  /*
   * --------------------------------------------------
   * CLOSE
   * --------------------------------------------------
   */

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }

    onClose?.();
  }, [disabled, onClose]);

  /*
   * --------------------------------------------------
   * ACTION
   * --------------------------------------------------
   */

  const handleAction = useCallback(() => {
    if (disabled) {
      return;
    }

    onAction?.();
  }, [disabled, onAction]);

  /*
   * --------------------------------------------------
   * ICON
   * --------------------------------------------------
   */

  const resolvedIcon = icon !== undefined ? icon : DEFAULT_ICONS[safeVariant];

  /*
   * --------------------------------------------------
   * ACTION ELEMENT
   * --------------------------------------------------
   */

  const actionElement =
    action ||
    (actionLabel ? (
      <Pressable
        disabled={disabled}
        onPress={handleAction}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        {({ pressed }) => (
          <Text
            style={[
              styles.action,

              {
                fontSize: config.actionSize,

                color: resolvedActionColor,

                opacity: pressed || disabled ? 0.6 : 1,
              },

              actionStyle,
            ]}
          >
            {actionLabel}
          </Text>
        )}
      </Pressable>
    ) : null);

  /*
   * --------------------------------------------------
   * CLOSE ELEMENT
   * --------------------------------------------------
   */

  const closeElement = closeable ? (
    <Pressable
      disabled={disabled}
      onPress={handleClose}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Close alert"
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.close,

            {
              fontSize: config.closeSize,

              color: resolvedCloseColor,

              opacity: pressed || disabled ? 0.5 : 1,
            },

            closeStyle,
          ]}
        >
          ×
        </Text>
      )}
    </Pressable>
  ) : null;

  /*
   * --------------------------------------------------
   * CONTENT
   * --------------------------------------------------
   */

  const content = (
    <View
      style={[
        styles.content,

        {
          padding: config.padding,

          borderRadius: resolvedRadius,

          borderWidth:
            safeAlertStyle === UI_ALERT_STYLES.outline ? borderWidth : 0,

          borderColor: resolvedBorderColor,

          backgroundColor: resolvedBackgroundColor,

          opacity: disabled ? 0.55 : 1,
        },

        contentStyle,
      ]}
    >
      {showIcon && resolvedIcon ? (
        <View
          style={[
            styles.iconContainer,

            {
              width: config.iconSize,

              minHeight: config.iconSize,

              borderRadius: config.iconSize / 2,
            },

            iconContainerStyle,
          ]}
        >
          {typeof resolvedIcon === "string" ? (
            <Text
              style={[
                styles.iconText,

                {
                  fontSize: config.iconSize,

                  color: resolvedIconColor,
                },
              ]}
            >
              {resolvedIcon}
            </Text>
          ) : (
            resolvedIcon
          )}
        </View>
      ) : null}

      <View
        style={[
          styles.textContainer,

          safePosition === UI_ALERT_POSITIONS.center ? styles.centerText : null,
        ]}
      >
        {title ? (
          <Text
            style={[
              styles.title,

              {
                fontSize: config.titleSize,

                color: resolvedTextColor,
              },

              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}

        {description ? (
          <Text
            style={[
              styles.description,

              {
                fontSize: config.descriptionSize,

                color: resolvedDescriptionColor,

                marginTop: title ? 3 : 0,
              },

              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        ) : null}

        {children ? (
          <View
            style={[
              styles.children,

              {
                marginTop: title || description ? 6 : 0,
              },
            ]}
          >
            {children}
          </View>
        ) : null}

        {actionElement ? (
          <View
            style={[
              styles.actionContainer,

              {
                marginTop: title || description || children ? 8 : 0,
              },
            ]}
          >
            {actionElement}
          </View>
        ) : null}
      </View>

      {closeElement ? (
        <View style={styles.closeContainer}>{closeElement}</View>
      ) : null}
    </View>
  );

  /*
   * --------------------------------------------------
   * PRESSABLE WRAPPER
   * --------------------------------------------------
   */

  if (pressable && onPress) {
    return (
      <Animated.View
        {...props}
        ref={ref}
        testID={testID}
        style={[
          styles.container,

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
        accessible
        accessibilityRole="alert"
        accessibilityLabel={accessibilityLabel || title || description}
        accessibilityHint={accessibilityHint}
      >
        <Pressable
          disabled={disabled}
          onPress={onPress}
          accessibilityRole="button"
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  /*
   * --------------------------------------------------
   * NORMAL ALERT
   * --------------------------------------------------
   */

  return (
    <Animated.View
      {...props}
      ref={ref}
      testID={testID}
      style={[
        styles.container,

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
      accessible
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title || description}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </Animated.View>
  );
});

function getBackgroundColor(style, config, colors) {
  if (style === UI_ALERT_STYLES.solid) {
    return config.color;
  }

  if (style === UI_ALERT_STYLES.outline) {
    return colors.background || "#FFFFFF";
  }

  return config.soft;
}

function getTextColor(style, config, colors) {
  if (style === UI_ALERT_STYLES.solid) {
    return config.onColor;
  }

  return colors.text || "#111111";
}

function getDescriptionColor(style, config, colors) {
  if (style === UI_ALERT_STYLES.solid) {
    return config.onColor;
  }

  return colors.textSecondary || "#525252";
}

function getIconColor(style, config) {
  if (style === UI_ALERT_STYLES.solid) {
    return config.onColor;
  }

  return config.color;
}

function getDefaultRadius(size, colors) {
  if (colors.radius?.md) {
    return colors.radius.md;
  }

  switch (size) {
    case UI_ALERT_SIZES.sm:
      return 8;

    case UI_ALERT_SIZES.lg:
      return 16;

    case UI_ALERT_SIZES.md:
    default:
      return 12;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  content: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",
  },

  iconContainer: {
    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,
  },

  iconText: {
    fontWeight: "800",

    includeFontPadding: false,

    textAlign: "center",
  },

  textContainer: {
    flex: 1,

    minWidth: 0,
  },

  centerText: {
    alignItems: "center",
  },

  title: {
    fontWeight: "700",

    lineHeight: 20,

    includeFontPadding: false,
  },

  description: {
    lineHeight: 19,

    includeFontPadding: false,
  },

  children: {
    width: "100%",
  },

  actionContainer: {
    alignSelf: "flex-start",
  },

  action: {
    fontWeight: "700",

    lineHeight: 18,

    includeFontPadding: false,
  },

  closeContainer: {
    marginLeft: 8,
  },

  close: {
    fontWeight: "500",

    lineHeight: 22,

    includeFontPadding: false,
  },
});

export const UIAlert = memo(UIAlertComponent);

UIAlert.displayName = "UIAlert";

export {
  UI_ALERT_VARIANTS as UIAlertVariants,
  UI_ALERT_SIZES as UIAlertSizes,
  UI_ALERT_STYLES as UIAlertStyles,
  UI_ALERT_POSITIONS as UIAlertPositions,
};

export default UIAlert;
