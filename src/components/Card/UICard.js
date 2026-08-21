import React, { memo, useCallback, useMemo, useRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const CARD_VARIANTS = {
  default: "default",
  elevated: "elevated",
  outlined: "outlined",
  filled: "filled",
};

const CARD_RADIUS = {
  none: "none",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const BADGE_POSITIONS = {
  topLeft: "topLeft",
  topCenter: "topCenter",
  topRight: "topRight",

  centerLeft: "centerLeft",
  center: "center",
  centerRight: "centerRight",

  bottomLeft: "bottomLeft",
  bottomCenter: "bottomCenter",
  bottomRight: "bottomRight",
};

const FALLBACK_COLORS = {
  card: "#FFFFFF",
  surface: "#F8F8F8",
  border: "#E5E5E5",

  primary: "#FF5A1F",
  primarySoft: "#FFF0EA",

  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",

  white: "#FFFFFF",
  black: "#111111",

  text: "#111111",
  textSecondary: "#525252",
};

function UICardComponent({
  children,

  header = null,
  content = null,
  footer = null,

  image = null,
  imageSource = null,

  imageHeight = 190,
  imageResizeMode = "cover",

  imageStyle,

  badges = [],

  badgeGap = 8,

  badgeStyle,

  badgeTextStyle,

  badgeContainerStyle,

  variant = "default",

  radius = "lg",

  padding = 16,

  gap = 12,

  style,

  headerStyle,
  contentStyle,
  footerStyle,

  imageOverlay = null,

  imageOverlayStyle,

  pressable = false,

  disabled = false,

  loading = false,

  onPress,
  onLongPress,
  onPressIn,
  onPressOut,

  pressAnimation = true,

  pressScale = 0.985,

  pressAnimationDuration = 120,

  testID,

  accessibilityLabel,
  accessibilityHint,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const scale = useRef(new Animated.Value(1)).current;

  const animationRef = useRef(null);

  const isDisabled = disabled || loading;

  const safeVariant = CARD_VARIANTS[variant] ? variant : CARD_VARIANTS.default;

  const resolvedRadius = CARD_RADIUS[radius] ? radius : CARD_RADIUS.lg;

  const radiusValue = getRadiusValue(resolvedRadius, theme);

  const cardColors = useMemo(
    () => getCardColors(safeVariant, colors),
    [safeVariant, colors],
  );

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();

      animationRef.current = null;
    }
  }, []);

  const animateScale = useCallback(
    (targetScale) => {
      if (!pressAnimation || !pressable || isDisabled) {
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
    [
      pressAnimation,
      pressable,
      isDisabled,
      stopAnimation,
      scale,
      pressAnimationDuration,
    ],
  );

  const handlePressIn = useCallback(
    (event) => {
      if (!pressable || isDisabled) {
        return;
      }

      animateScale(pressScale);

      onPressIn?.(event);
    },
    [pressable, isDisabled, animateScale, pressScale, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (!pressable || isDisabled) {
        return;
      }

      animateScale(1);

      onPressOut?.(event);
    },
    [pressable, isDisabled, animateScale, onPressOut],
  );

  const handlePress = useCallback(
    (event) => {
      if (!pressable || isDisabled) {
        return;
      }

      onPress?.(event);
    },
    [pressable, isDisabled, onPress],
  );

  const handleLongPress = useCallback(
    (event) => {
      if (!pressable || isDisabled) {
        return;
      }

      onLongPress?.(event);
    },
    [pressable, isDisabled, onLongPress],
  );

  const cardStyle = useMemo(
    () => [
      styles.card,

      {
        backgroundColor: cardColors.background,

        borderColor: cardColors.border,

        borderWidth: cardColors.borderWidth,

        borderRadius: radiusValue,

        opacity: isDisabled ? 0.55 : 1,

        transform: [
          {
            scale,
          },
        ],
      },

      cardColors.shadow,

      style,
    ],
    [cardColors, radiusValue, isDisabled, scale, style],
  );

  const renderImage = Boolean(image || imageSource);

  const renderBody = Boolean(header || content || children || footer);

  const cardContent = (
    <>
      {renderImage ? (
        <View
          style={[
            styles.imageSection,

            {
              height: imageHeight,

              borderTopLeftRadius: radiusValue,

              borderTopRightRadius: radiusValue,
            },
          ]}
        >
          {image || (
            <Image
              source={imageSource}
              resizeMode={imageResizeMode}
              style={[styles.image, imageStyle]}
            />
          )}

          {imageOverlay ? (
            <View
              pointerEvents="none"
              style={[styles.imageOverlay, imageOverlayStyle]}
            >
              {imageOverlay}
            </View>
          ) : null}

          {badges.length > 0 ? (
            <View pointerEvents="box-none" style={styles.badgeLayer}>
              {badges.map((badge, index) => (
                <CardBadge
                  key={
                    badge.id ||
                    badge.key ||
                    `${badge.position || "topLeft"}-${index}`
                  }
                  badge={badge}
                  index={index}
                  gap={badgeGap}
                  defaultStyle={badgeStyle}
                  defaultTextStyle={badgeTextStyle}
                  defaultContainerStyle={badgeContainerStyle}
                  colors={colors}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {renderBody ? (
        <View
          style={[
            styles.body,

            {
              padding,
              gap,
            },
          ]}
        >
          {header ? (
            <View style={[styles.header, headerStyle]}>{header}</View>
          ) : null}

          {content ? (
            <View style={[styles.content, contentStyle]}>{content}</View>
          ) : null}

          {children ? (
            <View
              style={[
                styles.content,

                contentStyle,

                {
                  marginTop: header || content ? 0 : undefined,
                },
              ]}
            >
              {children}
            </View>
          ) : null}

          {footer ? (
            <View style={[styles.footer, footerStyle]}>{footer}</View>
          ) : null}
        </View>
      ) : null}

      {loading ? (
        <View
          pointerEvents="none"
          style={[
            styles.loadingOverlay,
            {
              borderRadius: radiusValue,
            },
          ]}
        >
          <ActivityIndicator
            size="small"
            color={colors.primary || FALLBACK_COLORS.primary}
          />
        </View>
      ) : null}
    </>
  );

  if (!pressable) {
    return (
      <Animated.View
        {...props}
        testID={testID}
        style={cardStyle}
        accessibilityLabel={accessibilityLabel}
      >
        {cardContent}
      </Animated.View>
    );
  }

  return (
    <Animated.View {...props} testID={testID} style={cardStyle}>
      <Pressable
        disabled={isDisabled}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: isDisabled,

          busy: loading,
        }}
        style={styles.pressable}
      >
        {cardContent}
      </Pressable>
    </Animated.View>
  );
}

/*
 * --------------------------------------------------
 * CARD BADGE
 * --------------------------------------------------
 */

const CardBadge = memo(function CardBadge({
  badge,
  index,
  gap,
  defaultStyle,
  defaultTextStyle,
  defaultContainerStyle,
  colors,
}) {
  const position = BADGE_POSITIONS[badge.position] ? badge.position : "topLeft";

  const badgeColors = getBadgeColors(badge, colors);

  const positionStyle = getBadgePosition(position, index, gap);

  const badgeContent = badge.content ?? badge.label ?? badge.text ?? "";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.badge,

        positionStyle,

        {
          backgroundColor: badgeColors.background,

          borderColor: badgeColors.border,

          borderWidth: badgeColors.borderWidth,
        },

        defaultStyle,

        badge.style,

        defaultContainerStyle,
      ]}
    >
      {badge.icon ? <View style={styles.badgeIcon}>{badge.icon}</View> : null}

      {badgeContent ? (
        <Text
          numberOfLines={1}
          style={[
            styles.badgeText,

            {
              color: badgeColors.text,

              fontSize: badge.fontSize || 12,

              lineHeight: badge.lineHeight || 16,

              fontWeight: badge.fontWeight || "600",
            },

            defaultTextStyle,

            badge.textStyle,
          ]}
        >
          {badgeContent}
        </Text>
      ) : null}
    </View>
  );
});

CardBadge.displayName = "CardBadge";

/*
 * --------------------------------------------------
 * CARD COLORS
 * --------------------------------------------------
 */

function getCardColors(variant, colors) {
  const background = colors.card || colors.surface || FALLBACK_COLORS.card;

  const border = colors.border || FALLBACK_COLORS.border;

  switch (variant) {
    case CARD_VARIANTS.elevated:
      return {
        background,

        border: "transparent",

        borderWidth: 0,

        shadow: styles.elevated,
      };

    case CARD_VARIANTS.outlined:
      return {
        background,

        border,

        borderWidth: 1,

        shadow: styles.noShadow,
      };

    case CARD_VARIANTS.filled:
      return {
        background: colors.surface || FALLBACK_COLORS.surface,

        border: "transparent",

        borderWidth: 0,

        shadow: styles.noShadow,
      };

    case CARD_VARIANTS.default:
    default:
      return {
        background,

        border: "transparent",

        borderWidth: 0,

        shadow: styles.noShadow,
      };
  }
}

/*
 * --------------------------------------------------
 * BADGE COLORS
 * --------------------------------------------------
 */

function getBadgeColors(badge, colors) {
  const type = badge.variant || badge.type || "primary";

  switch (type) {
    case "success":
      return {
        background:
          badge.backgroundColor || colors.success || FALLBACK_COLORS.success,

        border: badge.borderColor || colors.success || FALLBACK_COLORS.success,

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.onSuccess || FALLBACK_COLORS.white,
      };

    case "danger":
      return {
        background:
          badge.backgroundColor || colors.danger || FALLBACK_COLORS.danger,

        border: badge.borderColor || colors.danger || FALLBACK_COLORS.danger,

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.onDanger || FALLBACK_COLORS.white,
      };

    case "warning":
      return {
        background:
          badge.backgroundColor || colors.warning || FALLBACK_COLORS.warning,

        border: badge.borderColor || colors.warning || FALLBACK_COLORS.warning,

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.onWarning || FALLBACK_COLORS.white,
      };

    case "info":
      return {
        background:
          badge.backgroundColor || colors.info || FALLBACK_COLORS.info,

        border: badge.borderColor || colors.info || FALLBACK_COLORS.info,

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.onInfo || FALLBACK_COLORS.white,
      };

    case "soft":
      return {
        background:
          badge.backgroundColor ||
          colors.primarySoft ||
          FALLBACK_COLORS.primarySoft,

        border: badge.borderColor || "transparent",

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.primary || FALLBACK_COLORS.primary,
      };

    case "custom":
      return {
        background: badge.backgroundColor || FALLBACK_COLORS.primary,

        border: badge.borderColor || "transparent",

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || FALLBACK_COLORS.white,
      };

    case "primary":
    default:
      return {
        background:
          badge.backgroundColor || colors.primary || FALLBACK_COLORS.primary,

        border: badge.borderColor || colors.primary || FALLBACK_COLORS.primary,

        borderWidth: badge.borderWidth ?? 0,

        text: badge.textColor || colors.onPrimary || FALLBACK_COLORS.white,
      };
  }
}

/*
 * --------------------------------------------------
 * BADGE POSITION
 * --------------------------------------------------
 */

function getBadgePosition(position, index, gap) {
  const offset = index * (28 + gap);

  switch (position) {
    case BADGE_POSITIONS.topCenter:
      return {
        top: 12 + offset,

        alignSelf: "center",
      };

    case BADGE_POSITIONS.topRight:
      return {
        top: 12 + offset,

        right: 12,
      };

    case BADGE_POSITIONS.centerLeft:
      return {
        left: 12 + offset,

        top: "50%",

        transform: [
          {
            translateY: -12,
          },
        ],
      };

    case BADGE_POSITIONS.center:
      return {
        top: "50%",

        left: "50%",

        transform: [
          {
            translateX: -50,
          },

          {
            translateY: -12,
          },
        ],
      };

    case BADGE_POSITIONS.centerRight:
      return {
        right: 12 + offset,

        top: "50%",

        transform: [
          {
            translateY: -12,
          },
        ],
      };

    case BADGE_POSITIONS.bottomLeft:
      return {
        bottom: 12,

        left: 12 + offset,
      };

    case BADGE_POSITIONS.bottomCenter:
      return {
        bottom: 12 + offset,

        alignSelf: "center",
      };

    case BADGE_POSITIONS.bottomRight:
      return {
        bottom: 12,

        right: 12 + offset,
      };

    case BADGE_POSITIONS.topLeft:
    default:
      return {
        top: 12 + offset,

        left: 12,
      };
  }
}

/*
 * --------------------------------------------------
 * RADIUS
 * --------------------------------------------------
 */

function getRadiusValue(radius, theme) {
  const themeRadius = theme?.radius || {};

  switch (radius) {
    case CARD_RADIUS.none:
      return 0;

    case CARD_RADIUS.sm:
      return themeRadius.sm ?? 8;

    case CARD_RADIUS.md:
      return themeRadius.md ?? 12;

    case CARD_RADIUS.xl:
      return themeRadius.xl ?? 20;

    case CARD_RADIUS.lg:
    default:
      return themeRadius.lg ?? 16;
  }
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

    overflow: "hidden",

    position: "relative",
  },

  pressable: {
    width: "100%",
  },

  imageSection: {
    width: "100%",

    position: "relative",

    overflow: "hidden",
  },

  image: {
    width: "100%",

    height: "100%",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: "center",

    alignItems: "center",
  },

  badgeLayer: {
    ...StyleSheet.absoluteFillObject,

    pointerEvents: "box-none",
  },

  badge: {
    position: "absolute",

    minHeight: 26,

    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 999,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    maxWidth: "80%",

    zIndex: 10,

    elevation: 3,
  },

  badgeText: {
    includeFontPadding: false,

    textAlign: "center",

    flexShrink: 1,
  },

  badgeIcon: {
    marginRight: 5,

    alignItems: "center",

    justifyContent: "center",
  },

  body: {
    width: "100%",
  },

  header: {
    width: "100%",
  },

  content: {
    width: "100%",
  },

  footer: {
    width: "100%",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(0,0,0,0.08)",

    zIndex: 100,
  },

  elevated: {
    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,

    shadowRadius: 10,

    elevation: 4,
  },

  noShadow: {
    shadowOpacity: 0,

    elevation: 0,
  },
});

export const UICard = memo(UICardComponent);

UICard.displayName = "UICard";

export {
  CARD_VARIANTS as UICardVariants,
  CARD_RADIUS as UICardRadius,
  BADGE_POSITIONS as UICardBadgePositions,
};

export default UICard;
