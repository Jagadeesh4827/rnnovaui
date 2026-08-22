import React, { forwardRef, memo, useMemo } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const UI_AVATAR_SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const UI_AVATAR_SHAPES = {
  circle: "circle",
  rounded: "rounded",
  square: "square",
};

const UI_AVATAR_STATUSES = {
  online: "online",
  offline: "offline",
  busy: "busy",
  away: "away",
  none: "none",
};

const UI_AVATAR_STATUS_POSITIONS = {
  bottomRight: "bottomRight",
  bottomLeft: "bottomLeft",
  topRight: "topRight",
  topLeft: "topLeft",
};

const SIZE_CONFIG = {
  xs: {
    size: 28,
    text: 10,
    status: 8,
    badgeText: 8,
    badgeMin: 15,
  },

  sm: {
    size: 36,
    text: 12,
    status: 10,
    badgeText: 9,
    badgeMin: 17,
  },

  md: {
    size: 48,
    text: 15,
    status: 12,
    badgeText: 10,
    badgeMin: 19,
  },

  lg: {
    size: 64,
    text: 19,
    status: 15,
    badgeText: 11,
    badgeMin: 22,
  },

  xl: {
    size: 88,
    text: 26,
    status: 19,
    badgeText: 12,
    badgeMin: 25,
  },
};

const STATUS_COLORS = {
  online: "#16A34A",
  offline: "#737373",
  busy: "#DC2626",
  away: "#D97706",
};

const UIAvatarComponent = forwardRef(function UIAvatar(
  {
    source,
    uri,

    name,
    initials,

    size = "md",
    shape = "circle",

    backgroundColor,
    textColor,

    status = "none",
    statusColor,
    statusPosition = "bottomRight",

    badge,
    badgeColor,
    badgeTextColor,

    icon,
    fallbackIcon,

    borderWidth = 0,
    borderColor,

    loading = false,
    disabled = false,

    onPress,
    onLongPress,

    activeOpacity = 0.7,

    accessibilityLabel,

    containerStyle,
    imageStyle,
    textStyle,
    iconStyle,
    statusStyle,
    badgeStyle,

    testID,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  /*
   * --------------------------------------------------
   * SAFE SIZE
   * --------------------------------------------------
   */

  const safeSize = UI_AVATAR_SIZES[size] ? size : UI_AVATAR_SIZES.md;

  const config = SIZE_CONFIG[safeSize];

  /*
   * --------------------------------------------------
   * SAFE SHAPE
   * --------------------------------------------------
   */

  const safeShape = UI_AVATAR_SHAPES[shape] ? shape : UI_AVATAR_SHAPES.circle;

  /*
   * --------------------------------------------------
   * SAFE STATUS
   * --------------------------------------------------
   */

  const safeStatus = UI_AVATAR_STATUSES[status]
    ? status
    : UI_AVATAR_STATUSES.none;

  const safeStatusPosition = UI_AVATAR_STATUS_POSITIONS[statusPosition]
    ? statusPosition
    : UI_AVATAR_STATUS_POSITIONS.bottomRight;

  /*
   * --------------------------------------------------
   * SOURCE
   * --------------------------------------------------
   */

  const imageSource = source || (uri ? { uri } : null);

  /*
   * --------------------------------------------------
   * INITIALS
   * --------------------------------------------------
   */

  const resolvedInitials = initials || getInitials(name);

  /*
   * --------------------------------------------------
   * COLORS
   * --------------------------------------------------
   */

  const resolvedBackground = backgroundColor || colors.primarySoft || "#FFF0EA";

  const resolvedTextColor = textColor || colors.primary || "#FF5A1F";

  const resolvedBorderColor = borderColor || colors.border || "#E5E5E5";

  const resolvedStatusColor =
    statusColor || STATUS_COLORS[safeStatus] || colors.primary || "#FF5A1F";

  const resolvedBadgeColor = badgeColor || colors.danger || "#DC2626";

  const resolvedBadgeTextColor =
    badgeTextColor || colors.onPrimary || "#FFFFFF";

  /*
   * --------------------------------------------------
   * BORDER RADIUS
   * --------------------------------------------------
   */

  const borderRadius = getBorderRadius(safeShape, config.size);

  /*
   * --------------------------------------------------
   * BADGE
   * --------------------------------------------------
   */

  const badgeValue =
    badge !== undefined && badge !== null ? formatBadge(badge) : null;

  /*
   * --------------------------------------------------
   * CONTENT
   * --------------------------------------------------
   */

  const content = loading ? (
    <View
      style={[
        styles.fallback,

        {
          width: config.size,

          height: config.size,

          borderRadius,

          backgroundColor: resolvedBackground,
        },
      ]}
    >
      <ActivityIndicator size="small" color={resolvedTextColor} />
    </View>
  ) : imageSource ? (
    <Image
      source={imageSource}
      style={[
        styles.image,

        {
          width: config.size,

          height: config.size,

          borderRadius,

          opacity: disabled ? 0.5 : 1,
        },

        imageStyle,
      ]}
      resizeMode="cover"
    />
  ) : icon || fallbackIcon ? (
    <View
      style={[
        styles.fallback,

        {
          width: config.size,

          height: config.size,

          borderRadius,

          backgroundColor: resolvedBackground,

          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={[iconStyle]}>{icon || fallbackIcon}</View>
    </View>
  ) : (
    <View
      style={[
        styles.fallback,

        {
          width: config.size,

          height: config.size,

          borderRadius,

          backgroundColor: resolvedBackground,

          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,

          {
            fontSize: config.text,

            color: resolvedTextColor,
          },

          textStyle,
        ]}
      >
        {resolvedInitials || "?"}
      </Text>
    </View>
  );

  /*
   * --------------------------------------------------
   * WRAPPER
   * --------------------------------------------------
   */

  const avatarContent = (
    <View
      style={[
        styles.avatar,

        {
          width: config.size,

          height: config.size,

          borderRadius,

          borderWidth,

          borderColor: resolvedBorderColor,

          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {content}

      {safeStatus !== UI_AVATAR_STATUSES.none ? (
        <View
          style={[
            styles.status,

            getStatusPosition(safeStatusPosition, config.size, config.status),

            {
              width: config.status,

              height: config.status,

              borderRadius: config.status / 2,

              backgroundColor: resolvedStatusColor,

              borderColor: colors.background || "#FFFFFF",
            },

            statusStyle,
          ]}
        />
      ) : null}

      {badgeValue !== null ? (
        <View
          style={[
            styles.badge,

            {
              minWidth: config.badgeMin,

              height: config.badgeMin,

              borderRadius: config.badgeMin / 2,

              backgroundColor: resolvedBadgeColor,

              borderColor: colors.background || "#FFFFFF",
            },

            getBadgePosition(safeStatusPosition, config.size),

            badgeStyle,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.badgeText,

              {
                fontSize: config.badgeText,

                color: resolvedBadgeTextColor,
              },
            ]}
          >
            {badgeValue}
          </Text>
        </View>
      ) : null}
    </View>
  );

  /*
   * --------------------------------------------------
   * PRESSABLE
   * --------------------------------------------------
   */

  if (onPress || onLongPress) {
    return (
      <Pressable
        {...props}
        ref={ref}
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="imagebutton"
        accessibilityLabel={accessibilityLabel || name || "Avatar"}
        style={({ pressed }) => [
          styles.container,

          {
            opacity: pressed ? activeOpacity : 1,
          },

          containerStyle,
        ]}
      >
        {avatarContent}
      </Pressable>
    );
  }

  /*
   * --------------------------------------------------
   * NON PRESSABLE
   * --------------------------------------------------
   */

  return (
    <View
      {...props}
      ref={ref}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || name || "Avatar"}
      style={[styles.container, containerStyle]}
    >
      {avatarContent}
    </View>
  );
});

function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getBorderRadius(shape, size) {
  switch (shape) {
    case UI_AVATAR_SHAPES.square:
      return 0;

    case UI_AVATAR_SHAPES.rounded:
      return Math.min(14, size * 0.25);

    case UI_AVATAR_SHAPES.circle:
    default:
      return size / 2;
  }
}

function getStatusPosition(position, size, statusSize) {
  const offset = Math.max(0, statusSize * 0.05);

  switch (position) {
    case UI_AVATAR_STATUS_POSITIONS.topLeft:
      return {
        top: offset,
        left: offset,
      };

    case UI_AVATAR_STATUS_POSITIONS.topRight:
      return {
        top: offset,
        right: offset,
      };

    case UI_AVATAR_STATUS_POSITIONS.bottomLeft:
      return {
        bottom: offset,
        left: offset,
      };

    case UI_AVATAR_STATUS_POSITIONS.bottomRight:
    default:
      return {
        bottom: offset,
        right: offset,
      };
  }
}

function getBadgePosition(position) {
  switch (position) {
    case UI_AVATAR_STATUS_POSITIONS.topLeft:
      return {
        top: -4,
        left: -4,
      };

    case UI_AVATAR_STATUS_POSITIONS.topRight:
      return {
        top: -4,
        right: -4,
      };

    case UI_AVATAR_STATUS_POSITIONS.bottomLeft:
      return {
        bottom: -4,
        left: -4,
      };

    case UI_AVATAR_STATUS_POSITIONS.bottomRight:
    default:
      return {
        bottom: -4,
        right: -4,
      };
  }
}

function formatBadge(value) {
  if (typeof value === "number") {
    if (value > 99) {
      return "99+";
    }

    return String(value);
  }

  return String(value);
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",

    position: "relative",
  },

  avatar: {
    position: "relative",

    overflow: "visible",

    alignItems: "center",

    justifyContent: "center",
  },

  image: {
    position: "absolute",

    top: 0,

    left: 0,
  },

  fallback: {
    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",
  },

  initials: {
    fontWeight: "700",

    includeFontPadding: false,

    textAlign: "center",
  },

  status: {
    position: "absolute",

    borderWidth: 2,
  },

  badge: {
    position: "absolute",

    paddingHorizontal: 4,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 2,

    zIndex: 10,
  },

  badgeText: {
    fontWeight: "700",

    includeFontPadding: false,

    textAlign: "center",
  },
});

export const UIAvatar = memo(UIAvatarComponent);

UIAvatar.displayName = "UIAvatar";

export {
  UI_AVATAR_SIZES as UIAvatarSizes,
  UI_AVATAR_SHAPES as UIAvatarShapes,
  UI_AVATAR_STATUSES as UIAvatarStatuses,
  UI_AVATAR_STATUS_POSITIONS as UIAvatarStatusPositions,
};

export default UIAvatar;
