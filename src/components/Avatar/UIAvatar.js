import React, { memo, useMemo } from "react";

import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const AVATAR_SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  xxl: "xxl",
};

const AVATAR_VARIANTS = {
  circle: "circle",
  rounded: "rounded",
  square: "square",
};

const AVATAR_STATUS = {
  online: "online",
  offline: "offline",
  busy: "busy",
  away: "away",
};

const AVATAR_FALLBACK_COLORS = {
  primary: "#FF5A1F",
  secondary: "#7CFF32",
  white: "#FFFFFF",
  text: "#111111",
  textSecondary: "#525252",
  border: "#E5E5E5",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
  muted: "#737373",
};

function UIAvatarComponent({
  source,

  uri,

  name,

  initials,

  icon,

  size = "md",

  variant = "circle",

  backgroundColor,

  textColor,

  borderColor,

  borderWidth = 0,

  status,

  statusColor,

  statusSize,

  loading = false,

  fallback = true,

  style,

  imageStyle,

  textStyle,

  iconContainerStyle,

  statusStyle,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeSize = AVATAR_SIZES[size] ? size : AVATAR_SIZES.md;

  const safeVariant = AVATAR_VARIANTS[variant]
    ? variant
    : AVATAR_VARIANTS.circle;

  const dimensions = useMemo(() => getDimensions(safeSize), [safeSize]);

  const radius = useMemo(
    () => getRadius(safeVariant, dimensions.size, theme),
    [safeVariant, dimensions.size, theme],
  );

  const resolvedBackground =
    backgroundColor || colors.primary || AVATAR_FALLBACK_COLORS.primary;

  const resolvedTextColor =
    textColor || colors.onPrimary || AVATAR_FALLBACK_COLORS.white;

  const resolvedBorder =
    borderColor || colors.border || AVATAR_FALLBACK_COLORS.border;

  const imageSource = source || (uri ? { uri } : null);

  const resolvedInitials = initials || getInitials(name);

  const resolvedStatusColor = statusColor || getStatusColor(status, colors);

  const resolvedStatusSize = statusSize || dimensions.statusSize;

  const shouldShowFallback = fallback && !imageSource;

  return (
    <View
      {...props}
      testID={testID}
      style={[
        styles.wrapper,

        {
          width: dimensions.size,

          height: dimensions.size,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.avatar,

          {
            width: dimensions.size,

            height: dimensions.size,

            borderRadius: radius,

            backgroundColor: resolvedBackground,

            borderColor: resolvedBorder,

            borderWidth,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={resolvedTextColor} />
        ) : imageSource ? (
          <Image
            source={imageSource}
            resizeMode="cover"
            style={[
              styles.image,

              {
                borderRadius: radius,
              },

              imageStyle,
            ]}
          />
        ) : shouldShowFallback ? (
          <Text
            numberOfLines={1}
            style={[
              styles.initials,

              {
                color: resolvedTextColor,

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.fontSize + 4,
              },

              textStyle,
            ]}
          >
            {resolvedInitials}
          </Text>
        ) : icon ? (
          <View style={[styles.iconContainer, iconContainerStyle]}>{icon}</View>
        ) : null}
      </View>

      {status ? (
        <View
          style={[
            styles.status,

            {
              width: resolvedStatusSize,

              height: resolvedStatusSize,

              borderRadius: resolvedStatusSize / 2,

              backgroundColor: resolvedStatusColor,

              borderColor:
                colors.card ||
                colors.background ||
                AVATAR_FALLBACK_COLORS.white,

              borderWidth: 2,
            },

            statusStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDimensions(size) {
  switch (size) {
    case AVATAR_SIZES.xs:
      return {
        size: 28,
        fontSize: 10,
        statusSize: 8,
      };

    case AVATAR_SIZES.sm:
      return {
        size: 36,
        fontSize: 12,
        statusSize: 10,
      };

    case AVATAR_SIZES.lg:
      return {
        size: 64,
        fontSize: 20,
        statusSize: 16,
      };

    case AVATAR_SIZES.xl:
      return {
        size: 80,
        fontSize: 24,
        statusSize: 18,
      };

    case AVATAR_SIZES.xxl:
      return {
        size: 104,
        fontSize: 30,
        statusSize: 22,
      };

    case AVATAR_SIZES.md:
    default:
      return {
        size: 48,
        fontSize: 16,
        statusSize: 13,
      };
  }
}

function getRadius(variant, size, theme) {
  switch (variant) {
    case AVATAR_VARIANTS.square:
      return theme?.radius?.sm ?? 8;

    case AVATAR_VARIANTS.rounded:
      return theme?.radius?.md ?? 12;

    case AVATAR_VARIANTS.circle:
    default:
      return size / 2;
  }
}

function getStatusColor(status, colors) {
  switch (status) {
    case AVATAR_STATUS.online:
      return colors.success || AVATAR_FALLBACK_COLORS.success;

    case AVATAR_STATUS.busy:
      return colors.danger || AVATAR_FALLBACK_COLORS.danger;

    case AVATAR_STATUS.away:
      return colors.warning || AVATAR_FALLBACK_COLORS.warning;

    case AVATAR_STATUS.offline:
      return colors.textMuted || AVATAR_FALLBACK_COLORS.muted;

    default:
      return colors.success || AVATAR_FALLBACK_COLORS.success;
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",

    flexShrink: 0,
  },

  avatar: {
    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",
  },

  image: {
    width: "100%",

    height: "100%",
  },

  initials: {
    fontWeight: "700",

    includeFontPadding: false,

    textAlign: "center",

    textTransform: "uppercase",
  },

  iconContainer: {
    alignItems: "center",

    justifyContent: "center",

    width: "100%",

    height: "100%",
  },

  status: {
    position: "absolute",

    right: -1,

    bottom: -1,

    zIndex: 10,
  },
});

export const UIAvatar = memo(UIAvatarComponent);

UIAvatar.displayName = "UIAvatar";

export {
  AVATAR_SIZES as UIAvatarSizes,
  AVATAR_VARIANTS as UIAvatarVariants,
  AVATAR_STATUS as UIAvatarStatus,
};

export default UIAvatar;
