import React, { memo, useMemo } from "react";

import { StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const BADGE_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  neutral: "neutral",
};

const BADGE_SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
};

const BADGE_SHAPES = {
  rounded: "rounded",
  pill: "pill",
  square: "square",
};

const BADGE_POSITIONS = {
  topLeft: "topLeft",
  topCenter: "topCenter",
  topRight: "topRight",
  centerLeft: "centerLeft",
  centerRight: "centerRight",
  bottomLeft: "bottomLeft",
  bottomCenter: "bottomCenter",
  bottomRight: "bottomRight",
};

function UIBadgeComponent({
  label,
  children,

  variant = "primary",

  size = "md",

  shape = "pill",

  icon,

  dot = false,

  dotColor,

  outlined = false,

  disabled = false,

  position,

  offset = 0,

  textStyle,

  iconStyle,

  containerStyle,

  style,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeVariant = BADGE_VARIANTS[variant]
    ? variant
    : BADGE_VARIANTS.primary;

  const safeSize = BADGE_SIZES[size] ? size : BADGE_SIZES.md;

  const safeShape = BADGE_SHAPES[shape] ? shape : BADGE_SHAPES.pill;

  const dimensions = useMemo(() => getDimensions(safeSize), [safeSize]);

  const badgeColors = useMemo(
    () => getBadgeColors(safeVariant, colors, outlined),
    [safeVariant, colors, outlined],
  );

  const positionStyle = position ? getPositionStyle(position, offset) : null;

  const resolvedLabel = label ?? children;

  return (
    <View
      {...props}
      testID={testID}
      pointerEvents="none"
      style={[
        styles.wrapper,

        positionStyle,

        {
          opacity: disabled ? 0.5 : 1,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.container,

          {
            minHeight: dimensions.height,

            paddingHorizontal: dimensions.paddingHorizontal,

            borderRadius: getRadius(safeShape, dimensions.height),

            backgroundColor: badgeColors.background,

            borderColor: badgeColors.border,

            borderWidth: outlined ? 1 : 0,
          },

          containerStyle,
        ]}
      >
        {dot ? (
          <View
            style={[
              styles.dot,

              {
                width: dimensions.dotSize,

                height: dimensions.dotSize,

                borderRadius: dimensions.dotSize / 2,

                backgroundColor: dotColor || badgeColors.text,
              },
            ]}
          />
        ) : null}

        {icon ? (
          <View
            style={[
              styles.icon,

              {
                marginRight: resolvedLabel ? 5 : 0,
              },

              iconStyle,
            ]}
          >
            {icon}
          </View>
        ) : null}

        {resolvedLabel !== undefined && resolvedLabel !== null ? (
          <Text
            numberOfLines={1}
            style={[
              styles.text,

              {
                color: badgeColors.text,

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.lineHeight,
              },

              textStyle,
            ]}
          >
            {resolvedLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function getBadgeColors(variant, colors, outlined) {
  let background;
  let text;
  let border;

  switch (variant) {
    case BADGE_VARIANTS.secondary:
      background = colors.secondarySoft || "#F0FFE7";

      text = colors.onSecondary || "#111111";

      border = colors.secondary || "#7CFF32";

      break;

    case BADGE_VARIANTS.success:
      background = colors.successSoft || "#EAF8EF";

      text = colors.success || "#16A34A";

      border = colors.success || "#16A34A";

      break;

    case BADGE_VARIANTS.warning:
      background = colors.warningSoft || "#FFF7E6";

      text = colors.warning || "#D97706";

      border = colors.warning || "#D97706";

      break;

    case BADGE_VARIANTS.danger:
      background = colors.dangerSoft || "#FDECEC";

      text = colors.danger || "#DC2626";

      border = colors.danger || "#DC2626";

      break;

    case BADGE_VARIANTS.info:
      background = colors.infoSoft || "#EBF2FF";

      text = colors.info || "#2563EB";

      border = colors.info || "#2563EB";

      break;

    case BADGE_VARIANTS.neutral:
      background = colors.surfaceSecondary || "#F1F1F1";

      text = colors.textSecondary || "#525252";

      border = colors.border || "#E5E5E5";

      break;

    case BADGE_VARIANTS.primary:
    default:
      background = colors.primarySoft || "#FFF0EA";

      text = colors.primary || "#FF5A1F";

      border = colors.primary || "#FF5A1F";

      break;
  }

  return {
    background: outlined ? "transparent" : background,

    text,

    border,
  };
}

function getDimensions(size) {
  switch (size) {
    case BADGE_SIZES.xs:
      return {
        height: 20,
        paddingHorizontal: 7,
        fontSize: 9,
        lineHeight: 12,
        dotSize: 5,
      };

    case BADGE_SIZES.sm:
      return {
        height: 24,
        paddingHorizontal: 8,
        fontSize: 10,
        lineHeight: 14,
        dotSize: 6,
      };

    case BADGE_SIZES.lg:
      return {
        height: 34,
        paddingHorizontal: 13,
        fontSize: 14,
        lineHeight: 18,
        dotSize: 8,
      };

    case BADGE_SIZES.md:
    default:
      return {
        height: 28,
        paddingHorizontal: 10,
        fontSize: 12,
        lineHeight: 16,
        dotSize: 7,
      };
  }
}

function getRadius(shape, height) {
  switch (shape) {
    case BADGE_SHAPES.square:
      return 0;

    case BADGE_SHAPES.rounded:
      return 7;

    case BADGE_SHAPES.pill:
    default:
      return height / 2;
  }
}

function getPositionStyle(position, offset) {
  const stylesByPosition = {
    topLeft: {
      position: "absolute",
      top: offset,
      left: offset,
    },

    topCenter: {
      position: "absolute",
      top: offset,
      left: "50%",
      transform: [
        {
          translateX: -50,
        },
      ],
    },

    topRight: {
      position: "absolute",
      top: offset,
      right: offset,
    },

    centerLeft: {
      position: "absolute",
      top: "50%",
      left: offset,
      transform: [
        {
          translateY: -14,
        },
      ],
    },

    centerRight: {
      position: "absolute",
      top: "50%",
      right: offset,
      transform: [
        {
          translateY: -14,
        },
      ],
    },

    bottomLeft: {
      position: "absolute",
      bottom: offset,
      left: offset,
    },

    bottomCenter: {
      position: "absolute",
      bottom: offset,
      left: "50%",
      transform: [
        {
          translateX: -50,
        },
      ],
    },

    bottomRight: {
      position: "absolute",
      bottom: offset,
      right: offset,
    },
  };

  return stylesByPosition[position] || null;
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",

    zIndex: 10,
  },

  container: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,

    overflow: "hidden",
  },

  text: {
    fontWeight: "700",

    includeFontPadding: false,

    textAlign: "center",
  },

  icon: {
    alignItems: "center",

    justifyContent: "center",
  },

  dot: {
    marginRight: 5,

    flexShrink: 0,
  },
});

export const UIBadge = memo(UIBadgeComponent);

UIBadge.displayName = "UIBadge";

export {
  BADGE_VARIANTS as UIBadgeVariants,
  BADGE_SIZES as UIBadgeSizes,
  BADGE_SHAPES as UIBadgeShapes,
  BADGE_POSITIONS as UIBadgePositions,
};

export default UIBadge;
