import React, { memo, useCallback, useMemo, useRef } from "react";

import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
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
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

const FALLBACK_COLORS = {
  background: "#FFFFFF",
  surface: "#F8F8F8",
  card: "#FFFFFF",
  border: "#E5E5E5",
  shadow: "#000000",
};

function UICardComponent({
  children,

  header = null,

  content = null,

  footer = null,

  image = null,

  imageSource = null,

  imageHeight = 180,

  variant = "default",

  radius = "lg",

  padding = 16,

  gap = 12,

  style,

  headerStyle,

  imageStyle,

  contentStyle,

  footerStyle,

  disabled = false,

  loading = false,

  pressable = false,

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

  const resolvedRadius = CARD_RADIUS[radius] ?? CARD_RADIUS.lg;

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

        borderRadius: resolvedRadius,

        padding,
      },

      cardColors.shadow,

      {
        opacity: isDisabled ? 0.55 : 1,

        transform: [
          {
            scale,
          },
        ],
      },

      style,
    ],
    [cardColors, resolvedRadius, padding, isDisabled, scale, style],
  );

  const cardContent = (
    <>
      {image || imageSource ? (
        <View
          style={[
            styles.imageWrapper,
            {
              height: imageHeight,

              borderTopLeftRadius: resolvedRadius,

              borderTopRightRadius: resolvedRadius,
            },
          ]}
        >
          {image || (
            <Image
              source={imageSource}
              resizeMode="cover"
              style={[styles.image, imageStyle]}
            />
          )}
        </View>
      ) : null}

      {header ? (
        <View
          style={[
            styles.header,
            {
              marginTop: image || imageSource ? gap : 0,
            },
            headerStyle,
          ]}
        >
          {header}
        </View>
      ) : null}

      {content ? (
        <View
          style={[
            styles.content,
            {
              marginTop: header ? gap : 0,
            },
            contentStyle,
          ]}
        >
          {content}
        </View>
      ) : null}

      {children ? (
        <View
          style={[
            styles.content,
            {
              marginTop: header || content ? gap : 0,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      ) : null}

      {footer ? (
        <View
          style={[
            styles.footer,
            {
              marginTop: header || content || children ? gap : 0,
            },
            footerStyle,
          ]}
        >
          {footer}
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

        border,

        borderWidth: 0,

        shadow: styles.noShadow,
      };

    case CARD_VARIANTS.default:
    default:
      return {
        background,

        border,

        borderWidth: 0,

        shadow: styles.noShadow,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

    overflow: "hidden",
  },

  pressable: {
    width: "100%",
  },

  imageWrapper: {
    width: "100%",

    overflow: "hidden",

    marginHorizontal: -16,

    marginTop: -16,

    width: "calc(100% + 32px)",
  },

  image: {
    width: "100%",

    height: "100%",
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

  elevated: {
    shadowColor: FALLBACK_COLORS.shadow,

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

export { CARD_VARIANTS as UICardVariants, CARD_RADIUS as UICardRadius };

export default UICard;
