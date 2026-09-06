import React, { forwardRef, memo, useEffect, useMemo, useRef } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useTheme } from "rnnovaui";

/*
|--------------------------------------------------------------------------
| Aspect Ratio Presets
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
| Animation Types
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

/*
|--------------------------------------------------------------------------
| Resolve responsive value
|--------------------------------------------------------------------------
|
| This helper intentionally does not
| import internal rnnovaui responsive
| modules.
|
| It supports:
|
|   value
|
| and:
|
|   {
|     base,
|     mobile,
|     tablet,
|     desktop,
|     large
|   }
|
*/

function resolveResponsiveValue(value, breakpoint) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const order = ["base", "mobile", "tablet", "desktop", "large"];

  const breakpointIndex = order.indexOf(breakpoint);

  if (breakpointIndex === -1) {
    return value.base;
  }

  let resolved;

  for (let index = 0; index <= breakpointIndex; index += 1) {
    const key = order[index];

    if (value[key] !== undefined) {
      resolved = value[key];
    }
  }

  return resolved;
}

/*
|--------------------------------------------------------------------------
| Resolve ratio
|--------------------------------------------------------------------------
*/

function resolveRatio(ratio, preset, breakpoint) {
  const resolvedRatio = resolveResponsiveValue(ratio, breakpoint);

  if (typeof resolvedRatio === "number" && resolvedRatio > 0) {
    return resolvedRatio;
  }

  if (preset && UI_ASPECT_RATIO_PRESETS[preset]) {
    return UI_ASPECT_RATIO_PRESETS[preset];
  }

  return 1;
}

/*
|--------------------------------------------------------------------------
| Content Position
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Animation opacity
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Animation transform
|--------------------------------------------------------------------------
*/

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
| UIAspectRatio
|--------------------------------------------------------------------------
*/

export const UIAspectRatio = memo(
  forwardRef(function UIAspectRatio(
    {
      children,

      /*
        |--------------------------------------------------------------------------
        | Ratio
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
        | Padding
        |--------------------------------------------------------------------------
        */

      padding,

      paddingHorizontal,

      paddingVertical,

      paddingTop,

      paddingRight,

      paddingBottom,

      paddingLeft,

      /*
        |--------------------------------------------------------------------------
        | Margin
        |--------------------------------------------------------------------------
        */

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

      /*
        |--------------------------------------------------------------------------
        | Responsive
        |--------------------------------------------------------------------------
        |
        | Public breakpoint value.
        |
        */

      breakpoint = "base",
    },

    ref,
  ) {
    /*
      |--------------------------------------------------------------------------
      | Theme
      |--------------------------------------------------------------------------
      */

    let theme;

    try {
      const result = useTheme();

      theme = result?.theme || result;
    } catch {
      theme = undefined;
    }

    const colors = theme?.colors || {};

    /*
      |--------------------------------------------------------------------------
      | Resolve values
      |--------------------------------------------------------------------------
      */

    const resolved = useMemo(() => {
      return {
        ratio: resolveRatio(ratio, preset, breakpoint),

        width: resolveResponsiveValue(width, breakpoint),

        height: resolveResponsiveValue(height, breakpoint),

        minWidth: resolveResponsiveValue(minWidth, breakpoint),

        maxWidth: resolveResponsiveValue(maxWidth, breakpoint),

        minHeight: resolveResponsiveValue(minHeight, breakpoint),

        maxHeight: resolveResponsiveValue(maxHeight, breakpoint),

        padding: resolveResponsiveValue(padding, breakpoint),

        paddingHorizontal: resolveResponsiveValue(
          paddingHorizontal,
          breakpoint,
        ),

        paddingVertical: resolveResponsiveValue(paddingVertical, breakpoint),

        paddingTop: resolveResponsiveValue(paddingTop, breakpoint),

        paddingRight: resolveResponsiveValue(paddingRight, breakpoint),

        paddingBottom: resolveResponsiveValue(paddingBottom, breakpoint),

        paddingLeft: resolveResponsiveValue(paddingLeft, breakpoint),

        margin: resolveResponsiveValue(margin, breakpoint),

        marginHorizontal: resolveResponsiveValue(marginHorizontal, breakpoint),

        marginVertical: resolveResponsiveValue(marginVertical, breakpoint),

        marginTop: resolveResponsiveValue(marginTop, breakpoint),

        marginRight: resolveResponsiveValue(marginRight, breakpoint),

        marginBottom: resolveResponsiveValue(marginBottom, breakpoint),

        marginLeft: resolveResponsiveValue(marginLeft, breakpoint),

        backgroundColor: resolveThemeColor(
          resolveResponsiveValue(backgroundColor, breakpoint),
          colors,
        ),

        opacity: resolveResponsiveValue(opacity, breakpoint),

        borderWidth: resolveResponsiveValue(borderWidth, breakpoint),

        borderTopWidth: resolveResponsiveValue(borderTopWidth, breakpoint),

        borderRightWidth: resolveResponsiveValue(borderRightWidth, breakpoint),

        borderBottomWidth: resolveResponsiveValue(
          borderBottomWidth,
          breakpoint,
        ),

        borderLeftWidth: resolveResponsiveValue(borderLeftWidth, breakpoint),

        borderColor: resolveThemeColor(
          resolveResponsiveValue(borderColor, breakpoint),
          colors,
        ),

        borderTopColor: resolveThemeColor(
          resolveResponsiveValue(borderTopColor, breakpoint),
          colors,
        ),

        borderRightColor: resolveThemeColor(
          resolveResponsiveValue(borderRightColor, breakpoint),
          colors,
        ),

        borderBottomColor: resolveThemeColor(
          resolveResponsiveValue(borderBottomColor, breakpoint),
          colors,
        ),

        borderLeftColor: resolveThemeColor(
          resolveResponsiveValue(borderLeftColor, breakpoint),
          colors,
        ),

        borderRadius: resolveResponsiveValue(borderRadius, breakpoint),

        borderTopLeftRadius: resolveResponsiveValue(
          borderTopLeftRadius,
          breakpoint,
        ),

        borderTopRightRadius: resolveResponsiveValue(
          borderTopRightRadius,
          breakpoint,
        ),

        borderBottomLeftRadius: resolveResponsiveValue(
          borderBottomLeftRadius,
          breakpoint,
        ),

        borderBottomRightRadius: resolveResponsiveValue(
          borderBottomRightRadius,
          breakpoint,
        ),

        align: resolveResponsiveValue(align, breakpoint),

        justify: resolveResponsiveValue(justify, breakpoint),
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

    /*
      |--------------------------------------------------------------------------
      | Animation lifecycle
      |--------------------------------------------------------------------------
      */

    useEffect(() => {
      if (!animated || resolvedAnimation === "none") {
        progress.stopAnimation();
        progress.setValue(1);

        return undefined;
      }

      progress.stopAnimation();
      progress.setValue(0);

      let timeout;

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
        timeout = setTimeout(start, animationDelay);
      } else {
        start();
      }

      return () => {
        if (timeout) {
          clearTimeout(timeout);
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
      | Container style
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
      | Animated style
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
      | Static rendering
      |--------------------------------------------------------------------------
      */

    if (!animated || resolvedAnimation === "none") {
      return (
        <View
          ref={ref}
          testID={testID}
          style={containerStyle}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          accessibilityState={accessibilityState}
          onLayout={onLayout}
        >
          <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
      );
    }

    /*
      |--------------------------------------------------------------------------
      | Animated rendering
      |--------------------------------------------------------------------------
      |
      | Accessibility props remain
      | on the normal View instead of
      | Animated.View.
      |
      */

    return (
      <Animated.View
        ref={ref}
        testID={testID}
        style={[containerStyle, animatedStyle]}
      >
        <View
          style={[styles.content, contentStyle]}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          accessibilityState={accessibilityState}
          onLayout={onLayout}
        >
          {children}
        </View>
      </Animated.View>
    );
  }),
);

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  content: {
    width: "100%",
    height: "100%",
  },
});

/*
|--------------------------------------------------------------------------
| Component metadata
|--------------------------------------------------------------------------
*/

UIAspectRatio.displayName = "UIAspectRatio";

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  UI_ASPECT_RATIO_PRESETS as UIAspectRatioPresets,
  UI_ASPECT_RATIO_ANIMATIONS as UIAspectRatioAnimations,
};
