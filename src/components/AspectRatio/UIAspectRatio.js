import React, { forwardRef, memo, useEffect, useMemo, useRef } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUIResponsive, resolveUIResponsiveValue } from "../../responsive";

import { useUITheme } from "../../theme";

/*
|--------------------------------------------------------------------------
| Ratio presets
|--------------------------------------------------------------------------
*/

const UI_ASPECT_RATIO_PRESETS = {
  square: 1,

  portrait: 3 / 4,

  landscape: 4 / 3,

  video: 16 / 9,

  wide: 21 / 9,

  golden: 1.618,
};

/*
|--------------------------------------------------------------------------
| Animation presets
|--------------------------------------------------------------------------
*/

const UI_ASPECT_RATIO_ANIMATIONS = {
  none: "none",

  fade: "fade",

  fadeIn: "fadeIn",

  fadeOut: "fadeOut",

  scale: "scale",

  fadeScale: "fadeScale",

  slide: "slide",

  slideFade: "slideFade",

  spring: "spring",
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function resolveResponsive(value, breakpoint) {
  return resolveUIResponsiveValue(value, breakpoint);
}

function resolveThemeColor(value, colors) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (colors && Object.prototype.hasOwnProperty.call(colors, value)) {
    return colors[value];
  }

  return value;
}

function resolveRatio(ratio, preset, breakpoint) {
  const responsiveRatio = resolveResponsive(ratio, breakpoint);

  if (typeof responsiveRatio === "number" && responsiveRatio > 0) {
    return responsiveRatio;
  }

  if (preset && UI_ASPECT_RATIO_PRESETS[preset]) {
    return UI_ASPECT_RATIO_PRESETS[preset];
  }

  return 1;
}

function getContentAlignment(position) {
  switch (position) {
    case "top":
      return {
        alignItems: "center",
        justifyContent: "flex-start",
      };

    case "bottom":
      return {
        alignItems: "center",
        justifyContent: "flex-end",
      };

    case "left":
      return {
        alignItems: "flex-start",
        justifyContent: "center",
      };

    case "right":
      return {
        alignItems: "flex-end",
        justifyContent: "center",
      };

    case "topLeft":
      return {
        alignItems: "flex-start",
        justifyContent: "flex-start",
      };

    case "topRight":
      return {
        alignItems: "flex-end",
        justifyContent: "flex-start",
      };

    case "bottomLeft":
      return {
        alignItems: "flex-start",
        justifyContent: "flex-end",
      };

    case "bottomRight":
      return {
        alignItems: "flex-end",
        justifyContent: "flex-end",
      };

    case "center":
    default:
      return {
        alignItems: "center",
        justifyContent: "center",
      };
  }
}

function getAnimationOpacity(animation, progress) {
  switch (animation) {
    case "fade":
    case "fadeIn":
    case "fadeOut":
    case "fadeScale":
    case "slideFade":
      return progress;

    default:
      return 1;
  }
}

function getAnimationTransform(animation, progress, slideDistance, scaleFrom) {
  switch (animation) {
    case "scale":
    case "fadeScale":
    case "spring":
      return [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],

            outputRange: [scaleFrom, 1],
          }),
        },
      ];

    case "slide":
    case "slideFade":
      return [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],

            outputRange: [slideDistance, 0],
          }),
        },
      ];

    default:
      return [];
  }
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export const UIAspectRatio = memo(
  forwardRef(function UIAspectRatio(
    {
      children,

      /*
        |--------------------------------------------------------------------------
        | Core
        |--------------------------------------------------------------------------
        */

      ratio,

      preset,

      /*
        |--------------------------------------------------------------------------
        | Dimensions
        |--------------------------------------------------------------------------
        */

      width = "100%",

      height,

      minWidth,

      maxWidth,

      minHeight,

      maxHeight,

      /*
        |--------------------------------------------------------------------------
        | Spacing
        |--------------------------------------------------------------------------
        */

      padding,

      paddingHorizontal,

      paddingVertical,

      paddingTop,

      paddingRight,

      paddingBottom,

      paddingLeft,

      margin,

      marginHorizontal,

      marginVertical,

      marginTop,

      marginRight,

      marginBottom,

      marginLeft,

      /*
        |--------------------------------------------------------------------------
        | Content
        |--------------------------------------------------------------------------
        */

      contentPosition = "center",

      contentStyle,

      overflow = "hidden",

      /*
        |--------------------------------------------------------------------------
        | Alignment
        |--------------------------------------------------------------------------
        */

      align,

      justify,

      /*
        |--------------------------------------------------------------------------
        | Appearance
        |--------------------------------------------------------------------------
        */

      backgroundColor,

      opacity,

      /*
        |--------------------------------------------------------------------------
        | Border
        |--------------------------------------------------------------------------
        */

      borderWidth,

      borderTopWidth,

      borderRightWidth,

      borderBottomWidth,

      borderLeftWidth,

      borderColor,

      borderTopColor,

      borderRightColor,

      borderBottomColor,

      borderLeftColor,

      borderRadius,

      borderTopLeftRadius,

      borderTopRightRadius,

      borderBottomLeftRadius,

      borderBottomRightRadius,

      /*
        |--------------------------------------------------------------------------
        | Position
        |--------------------------------------------------------------------------
        */

      position = "relative",

      top,

      right,

      bottom,

      left,

      zIndex,

      /*
        |--------------------------------------------------------------------------
        | Animation
        |--------------------------------------------------------------------------
        */

      animated = false,

      animation = "none",

      animationDuration = 280,

      animationDelay = 0,

      slideDistance = 20,

      scaleFrom = 0.96,

      spring = {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      },

      onAnimationStart,

      onAnimationComplete,

      /*
        |--------------------------------------------------------------------------
        | Custom
        |--------------------------------------------------------------------------
        */

      style,

      /*
        |--------------------------------------------------------------------------
        | Accessibility
        |--------------------------------------------------------------------------
        */

      accessible,

      accessibilityLabel,

      accessibilityHint,

      accessibilityRole,

      accessibilityState,

      /*
        |--------------------------------------------------------------------------
        | Other
        |--------------------------------------------------------------------------
        */

      testID,

      onLayout,
    },
    ref,
  ) {
    const { breakpoint } = useUIResponsive();

    const { theme } = useUITheme();

    const colors = theme?.colors || {};

    /*
      |--------------------------------------------------------------------------
      | Resolve values
      |--------------------------------------------------------------------------
      */

    const resolved = useMemo(() => {
      const resolvedRatio = resolveRatio(ratio, preset, breakpoint);

      return {
        ratio: resolvedRatio,

        width: resolveResponsive(width, breakpoint),

        height: resolveResponsive(height, breakpoint),

        minWidth: resolveResponsive(minWidth, breakpoint),

        maxWidth: resolveResponsive(maxWidth, breakpoint),

        minHeight: resolveResponsive(minHeight, breakpoint),

        maxHeight: resolveResponsive(maxHeight, breakpoint),

        padding: resolveResponsive(padding, breakpoint),

        paddingHorizontal: resolveResponsive(paddingHorizontal, breakpoint),

        paddingVertical: resolveResponsive(paddingVertical, breakpoint),

        paddingTop: resolveResponsive(paddingTop, breakpoint),

        paddingRight: resolveResponsive(paddingRight, breakpoint),

        paddingBottom: resolveResponsive(paddingBottom, breakpoint),

        paddingLeft: resolveResponsive(paddingLeft, breakpoint),

        margin: resolveResponsive(margin, breakpoint),

        marginHorizontal: resolveResponsive(marginHorizontal, breakpoint),

        marginVertical: resolveResponsive(marginVertical, breakpoint),

        marginTop: resolveResponsive(marginTop, breakpoint),

        marginRight: resolveResponsive(marginRight, breakpoint),

        marginBottom: resolveResponsive(marginBottom, breakpoint),

        marginLeft: resolveResponsive(marginLeft, breakpoint),

        backgroundColor: resolveThemeColor(
          resolveResponsive(backgroundColor, breakpoint),
          colors,
        ),

        opacity: resolveResponsive(opacity, breakpoint),

        borderWidth: resolveResponsive(borderWidth, breakpoint),

        borderTopWidth: resolveResponsive(borderTopWidth, breakpoint),

        borderRightWidth: resolveResponsive(borderRightWidth, breakpoint),

        borderBottomWidth: resolveResponsive(borderBottomWidth, breakpoint),

        borderLeftWidth: resolveResponsive(borderLeftWidth, breakpoint),

        borderColor: resolveThemeColor(
          resolveResponsive(borderColor, breakpoint),
          colors,
        ),

        borderTopColor: resolveThemeColor(
          resolveResponsive(borderTopColor, breakpoint),
          colors,
        ),

        borderRightColor: resolveThemeColor(
          resolveResponsive(borderRightColor, breakpoint),
          colors,
        ),

        borderBottomColor: resolveThemeColor(
          resolveResponsive(borderBottomColor, breakpoint),
          colors,
        ),

        borderLeftColor: resolveThemeColor(
          resolveResponsive(borderLeftColor, breakpoint),
          colors,
        ),

        borderRadius: resolveResponsive(borderRadius, breakpoint),

        borderTopLeftRadius: resolveResponsive(borderTopLeftRadius, breakpoint),

        borderTopRightRadius: resolveResponsive(
          borderTopRightRadius,
          breakpoint,
        ),

        borderBottomLeftRadius: resolveResponsive(
          borderBottomLeftRadius,
          breakpoint,
        ),

        borderBottomRightRadius: resolveResponsive(
          borderBottomRightRadius,
          breakpoint,
        ),

        align: resolveResponsive(align, breakpoint),

        justify: resolveResponsive(justify, breakpoint),
      };
    }, [
      breakpoint,

      ratio,
      preset,

      width,
      height,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,

      padding,
      paddingHorizontal,
      paddingVertical,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,

      margin,
      marginHorizontal,
      marginVertical,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,

      backgroundColor,
      opacity,

      borderWidth,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,

      borderColor,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,

      borderRadius,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,

      align,
      justify,

      colors,
    ]);

    /*
      |--------------------------------------------------------------------------
      | Animation
      |--------------------------------------------------------------------------
      */

    const resolvedAnimation = UI_ASPECT_RATIO_ANIMATIONS[animation]
      ? animation
      : "none";

    const progress = useRef(
      new Animated.Value(animated && resolvedAnimation !== "none" ? 0 : 1),
    ).current;

    useEffect(() => {
      if (!animated || resolvedAnimation === "none") {
        progress.stopAnimation();
        progress.setValue(1);

        return undefined;
      }

      progress.stopAnimation();
      progress.setValue(0);

      let timer;

      const start = () => {
        if (typeof onAnimationStart === "function") {
          onAnimationStart();
        }

        const complete = () => {
          if (typeof onAnimationComplete === "function") {
            onAnimationComplete();
          }
        };

        if (resolvedAnimation === "spring") {
          Animated.spring(progress, {
            toValue: 1,

            ...spring,

            useNativeDriver: true,
          }).start(complete);

          return;
        }

        Animated.timing(progress, {
          toValue: 1,

          duration: animationDuration,

          useNativeDriver: true,
        }).start(complete);
      };

      if (animationDelay > 0) {
        timer = setTimeout(start, animationDelay);
      } else {
        start();
      }

      return () => {
        if (timer) {
          clearTimeout(timer);
        }

        progress.stopAnimation();
      };
    }, [
      animated,
      resolvedAnimation,
      animationDuration,
      animationDelay,
      spring,
      progress,
      onAnimationStart,
      onAnimationComplete,
    ]);

    /*
      |--------------------------------------------------------------------------
      | Content alignment
      |--------------------------------------------------------------------------
      */

    const positionAlignment = getContentAlignment(contentPosition);

    const resolvedAlign = resolved.align || positionAlignment.alignItems;

    const resolvedJustify =
      resolved.justify || positionAlignment.justifyContent;

    /*
      |--------------------------------------------------------------------------
      | Base container style
      |--------------------------------------------------------------------------
      */

    const containerStyle = useMemo(
      () => [
        styles.container,

        {
          width: resolved.width,

          height: resolved.height,

          aspectRatio: resolved.ratio,

          minWidth: resolved.minWidth,

          maxWidth: resolved.maxWidth,

          minHeight: resolved.minHeight,

          maxHeight: resolved.maxHeight,

          padding: resolved.padding,

          paddingHorizontal: resolved.paddingHorizontal,

          paddingVertical: resolved.paddingVertical,

          paddingTop: resolved.paddingTop,

          paddingRight: resolved.paddingRight,

          paddingBottom: resolved.paddingBottom,

          paddingLeft: resolved.paddingLeft,

          margin: resolved.margin,

          marginHorizontal: resolved.marginHorizontal,

          marginVertical: resolved.marginVertical,

          marginTop: resolved.marginTop,

          marginRight: resolved.marginRight,

          marginBottom: resolved.marginBottom,

          marginLeft: resolved.marginLeft,

          alignItems: resolvedAlign,

          justifyContent: resolvedJustify,

          position,

          top,

          right,

          bottom,

          left,

          zIndex,

          backgroundColor: resolved.backgroundColor,

          opacity: resolved.opacity,

          overflow,

          borderWidth: resolved.borderWidth,

          borderTopWidth: resolved.borderTopWidth,

          borderRightWidth: resolved.borderRightWidth,

          borderBottomWidth: resolved.borderBottomWidth,

          borderLeftWidth: resolved.borderLeftWidth,

          borderColor: resolved.borderColor,

          borderTopColor: resolved.borderTopColor,

          borderRightColor: resolved.borderRightColor,

          borderBottomColor: resolved.borderBottomColor,

          borderLeftColor: resolved.borderLeftColor,

          borderRadius: resolved.borderRadius,

          borderTopLeftRadius: resolved.borderTopLeftRadius,

          borderTopRightRadius: resolved.borderTopRightRadius,

          borderBottomLeftRadius: resolved.borderBottomLeftRadius,

          borderBottomRightRadius: resolved.borderBottomRightRadius,
        },

        style,
      ],
      [
        resolved,

        resolvedAlign,
        resolvedJustify,

        position,
        top,
        right,
        bottom,
        left,
        zIndex,

        overflow,

        style,
      ],
    );

    /*
      |--------------------------------------------------------------------------
      | Animation style
      |--------------------------------------------------------------------------
      */

    const animatedStyle = useMemo(() => {
      if (!animated || resolvedAnimation === "none") {
        return null;
      }

      return {
        opacity: getAnimationOpacity(resolvedAnimation, progress),

        transform: getAnimationTransform(
          resolvedAnimation,
          progress,
          slideDistance,
          scaleFrom,
        ),
      };
    }, [animated, resolvedAnimation, progress, slideDistance, scaleFrom]);

    /*
      |--------------------------------------------------------------------------
      | Static mode
      |--------------------------------------------------------------------------
      */

    if (!animated || resolvedAnimation === "none") {
      return (
        <View
          ref={ref}
          testID={testID}
          onLayout={onLayout}
          style={containerStyle}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          accessibilityState={accessibilityState}
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
      );
    }

    /*
      |--------------------------------------------------------------------------
      | Animated mode
      |--------------------------------------------------------------------------
      */

    return (
      <Animated.View
        ref={ref}
        testID={testID}
        style={[containerStyle, animatedStyle]}
      >
        <View
          onLayout={onLayout}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          accessibilityState={accessibilityState}
          style={[styles.content, contentStyle]}
        >
          {children}
        </View>
      </Animated.View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  content: {
    width: "100%",
    height: "100%",
  },
});

UIAspectRatio.displayName = "UIAspectRatio";

export {
  UI_ASPECT_RATIO_PRESETS as UIAspectRatioPresets,
  UI_ASPECT_RATIO_ANIMATIONS as UIAspectRatioAnimations,
};
