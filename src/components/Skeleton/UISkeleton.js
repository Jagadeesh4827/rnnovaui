import React, { memo, useEffect, useRef } from "react";

import { Animated, Easing, StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

const SKELETON_VARIANTS = {
  rectangle: "rectangle",
  rounded: "rounded",
  circle: "circle",
  text: "text",
};

const SKELETON_ANIMATION = {
  pulse: "pulse",
  none: "none",
};

function UISkeletonComponent({
  width = "100%",
  height = 20,

  variant = "rectangle",

  animation = "pulse",

  duration = 1000,

  radius,

  backgroundColor,

  highlightColor,

  style,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const opacity = useRef(new Animated.Value(0.55)).current;

  const safeVariant = SKELETON_VARIANTS[variant]
    ? variant
    : SKELETON_VARIANTS.rectangle;

  const safeAnimation = SKELETON_ANIMATION[animation]
    ? animation
    : SKELETON_ANIMATION.pulse;

  useEffect(() => {
    if (safeAnimation === SKELETON_ANIMATION.none) {
      opacity.setValue(1);

      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,

          duration: duration / 2,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 0.55,

          duration: duration / 2,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [safeAnimation, duration, opacity]);

  const resolvedBackground = backgroundColor || colors.skeleton || "#E5E5E5";

  const resolvedHighlight =
    highlightColor || colors.skeletonHighlight || "#F5F5F5";

  const resolvedRadius = radius ?? getRadius(safeVariant, theme);

  return (
    <Animated.View
      {...props}
      testID={testID}
      pointerEvents="none"
      style={[
        styles.base,

        {
          width,

          height,

          backgroundColor: resolvedBackground,

          borderRadius: resolvedRadius,

          opacity,
        },

        safeVariant === SKELETON_VARIANTS.circle ? styles.circle : null,

        safeVariant === SKELETON_VARIANTS.text ? styles.text : null,

        style,
      ]}
    >
      {safeAnimation !== SKELETON_ANIMATION.none ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,

            {
              backgroundColor: resolvedHighlight,
            },
          ]}
        />
      ) : null}
    </Animated.View>
  );
}

function getRadius(variant, theme) {
  switch (variant) {
    case SKELETON_VARIANTS.circle:
      return 999;

    case SKELETON_VARIANTS.text:
      return theme?.radius?.xs ?? 4;

    case SKELETON_VARIANTS.rounded:
      return theme?.radius?.md ?? 12;

    case SKELETON_VARIANTS.rectangle:
    default:
      return theme?.radius?.sm ?? 8;
  }
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",

    flexShrink: 0,
  },

  circle: {
    aspectRatio: 1,
  },

  text: {
    minHeight: 12,
  },

  highlight: {
    position: "absolute",

    top: 0,

    bottom: 0,

    left: "-50%",

    width: "50%",

    opacity: 0.25,
  },
});

export const UISkeleton = memo(UISkeletonComponent);

UISkeleton.displayName = "UISkeleton";

export {
  SKELETON_VARIANTS as UISkeletonVariants,
  SKELETON_ANIMATION as UISkeletonAnimations,
};

export default UISkeleton;
