import React, { useEffect, useMemo } from "react";

import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUITheme } from "../../../theme";

/*
|--------------------------------------------------------------------------
| Defaults
|--------------------------------------------------------------------------
*/

const DEFAULT_DURATION = 400;

const DEFAULT_SLIDE_DISTANCE = 24;

const DEFAULT_SCALE_FROM = 0.96;

/*
|--------------------------------------------------------------------------
| Animation resolver
|--------------------------------------------------------------------------
*/

const resolveAnimationType = (animation) => {
  if (!animation) {
    return "fade";
  }

  if (typeof animation === "string") {
    return animation;
  }

  return animation.type || "fade";
};

/*
|--------------------------------------------------------------------------
| Initial animation values
|--------------------------------------------------------------------------
*/

const getInitialValues = ({ animation, slideDistance, scaleFrom }) => {
  switch (animation) {
    case "none":
      return {
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: 0,
      };

    case "fade":
    case "fadeIn":
      return {
        opacity: 0,
        scale: 1,
        translateX: 0,
        translateY: 0,
      };

    case "scale":
      return {
        opacity: 1,
        scale: scaleFrom,
        translateX: 0,
        translateY: 0,
      };

    case "fadeScale":
      return {
        opacity: 0,
        scale: scaleFrom,
        translateX: 0,
        translateY: 0,
      };

    case "slide":
    case "slideFade":
      return {
        opacity: 0,
        scale: 1,
        translateX: 0,
        translateY: slideDistance,
      };

    case "slideUp":
      return {
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: slideDistance,
      };

    case "slideDown":
      return {
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: -slideDistance,
      };

    case "slideLeft":
      return {
        opacity: 1,
        scale: 1,
        translateX: slideDistance,
        translateY: 0,
      };

    case "slideRight":
      return {
        opacity: 1,
        scale: 1,
        translateX: -slideDistance,
        translateY: 0,
      };

    case "spring":
      return {
        opacity: 0,
        scale: scaleFrom,
        translateX: 0,
        translateY: 0,
      };

    default:
      return {
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: 0,
      };
  }
};

/*
|--------------------------------------------------------------------------
| Animated Layout Content
|--------------------------------------------------------------------------
*/

const AnimatedLayout = ({
  children,

  animation = "fade",

  animationDuration = DEFAULT_DURATION,

  animationDelay = 0,

  slideDistance = DEFAULT_SLIDE_DISTANCE,

  scaleFrom = DEFAULT_SCALE_FROM,

  springConfig,

  onAnimationStart,

  onAnimationComplete,

  style,

  accessible,

  accessibilityLabel,

  accessibilityHint,

  accessibilityRole,

  accessibilityState,

  accessibilityValue,

  accessibilityLiveRegion,

  accessibilityViewIsModal,

  importantForAccessibility,

  testID,

  onLayout,

  ...rest
}) => {
  const initialValues = useMemo(
    () =>
      getInitialValues({
        animation,
        slideDistance,
        scaleFrom,
      }),
    [animation, slideDistance, scaleFrom],
  );

  const opacity = useSharedValue(initialValues.opacity);

  const scale = useSharedValue(initialValues.scale);

  const translateX = useSharedValue(initialValues.translateX);

  const translateY = useSharedValue(initialValues.translateY);

  /*
  |--------------------------------------------------------------------------
  | Run animation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (animation === "none") {
      return undefined;
    }

    /*
    ------------------------------------------------------------------------
    Reset values
    ------------------------------------------------------------------------
    */

    opacity.value = initialValues.opacity;

    scale.value = initialValues.scale;

    translateX.value = initialValues.translateX;

    translateY.value = initialValues.translateY;

    onAnimationStart?.();

    /*
    ------------------------------------------------------------------------
    Timing config
    ------------------------------------------------------------------------
    */

    const timingConfig = {
      duration: animationDuration,

      easing: Easing.out(Easing.cubic),
    };

    /*
    ------------------------------------------------------------------------
    Spring
    ------------------------------------------------------------------------
    */

    if (animation === "spring") {
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, timingConfig, (finished) => {
          if (finished) {
            onAnimationComplete?.();
          }
        }),
      );

      scale.value = withDelay(
        animationDelay,
        withSpring(1, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,

          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateX.value = withDelay(
        animationDelay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,

          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateY.value = withDelay(
        animationDelay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,

          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      return undefined;
    }

    /*
    |--------------------------------------------------------------------------
    | Standard timing animation
    |--------------------------------------------------------------------------
    */

    opacity.value = withDelay(
      animationDelay,
      withTiming(1, timingConfig, (finished) => {
        if (finished) {
          onAnimationComplete?.();
        }
      }),
    );

    scale.value = withDelay(animationDelay, withTiming(1, timingConfig));

    translateX.value = withDelay(animationDelay, withTiming(0, timingConfig));

    translateY.value = withDelay(animationDelay, withTiming(0, timingConfig));

    return undefined;
  }, [
    animation,
    animationDuration,
    animationDelay,
    initialValues,
    springConfig,
    onAnimationStart,
    onAnimationComplete,
    opacity,
    scale,
    translateX,
    translateY,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Animated style
  |--------------------------------------------------------------------------
  */

  const animatedStyle = useAnimatedStyle(() => {
    if (animation === "none") {
      return {};
    }

    return {
      opacity: opacity.value,

      transform: [
        {
          translateX: translateX.value,
        },

        {
          translateY: translateY.value,
        },

        {
          scale: scale.value,
        },
      ],
    };
  });

  return (
    <Animated.View
      {...rest}
      testID={testID}
      onLayout={onLayout}
      style={[styles.flex, style, animatedStyle]}
    >
      <View
        style={styles.flex}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        accessibilityValue={accessibilityValue}
        accessibilityLiveRegion={accessibilityLiveRegion}
        accessibilityViewIsModal={accessibilityViewIsModal}
        importantForAccessibility={importantForAccessibility}
      >
        {children}
      </View>
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| UILayout
|--------------------------------------------------------------------------
*/

const UILayout = ({
  children,

  /*
  |--------------------------------------------------------------------------
  | Safe Area
  |--------------------------------------------------------------------------
  */

  edges = ["top", "bottom", "left", "right"],

  /*
  |--------------------------------------------------------------------------
  | Layout
  |--------------------------------------------------------------------------
  */

  flex = 1,

  /*
  |--------------------------------------------------------------------------
  | Background
  |--------------------------------------------------------------------------
  |
  | If provided, this overrides the theme background.
  |
  */

  backgroundColor,

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  contentContainerStyle,

  /*
  |--------------------------------------------------------------------------
  | Keyboard
  |--------------------------------------------------------------------------
  */

  keyboardAvoiding = false,

  keyboardBehavior,

  keyboardVerticalOffset = 0,

  /*
  |--------------------------------------------------------------------------
  | Reanimated
  |--------------------------------------------------------------------------
  */

  reanimated = false,

  animation = "fade",

  animationDuration = DEFAULT_DURATION,

  animationDelay = 0,

  slideDistance = DEFAULT_SLIDE_DISTANCE,

  scaleFrom = DEFAULT_SCALE_FROM,

  springConfig,

  onAnimationStart,

  onAnimationComplete,

  /*
  |--------------------------------------------------------------------------
  | Root style
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

  accessibilityValue,

  accessibilityLiveRegion,

  accessibilityViewIsModal,

  importantForAccessibility,

  testID,

  onLayout,

  /*
  |--------------------------------------------------------------------------
  | Other View props
  |--------------------------------------------------------------------------
  */

  ...rest
}) => {
  /*
  |--------------------------------------------------------------------------
  | GLOBAL UIProvider THEME
  |--------------------------------------------------------------------------
  |
  | UILayout does NOT resolve:
  |
  | - light
  | - dark
  | - system
  |
  | UIProvider already does that.
  |
  */

  const { theme } = useUITheme();

  const {
    colors,
    spacing,
    radius,
    typography,
    shadows,
    sizes,
    animation: themeAnimation,
  } = theme;

  /*
  |--------------------------------------------------------------------------
  | Theme background
  |--------------------------------------------------------------------------
  */

  const resolvedBackgroundColor =
    backgroundColor ?? colors?.background ?? "#FFFFFF";

  /*
  |--------------------------------------------------------------------------
  | Theme-based defaults
  |--------------------------------------------------------------------------
  */

  const resolvedFlex = flex ?? 1;

  const resolvedAnimationDuration =
    animationDuration ?? themeAnimation?.normal ?? DEFAULT_DURATION;

  /*
  |--------------------------------------------------------------------------
  | Resolve animation
  |--------------------------------------------------------------------------
  */

  const animationType = resolveAnimationType(animation);

  /*
  |--------------------------------------------------------------------------
  | Root style
  |--------------------------------------------------------------------------
  */

  const rootStyle = [
    styles.root,

    {
      flex: resolvedFlex,

      backgroundColor: resolvedBackgroundColor,
    },

    style,
  ];

  /*
  |--------------------------------------------------------------------------
  | Normal content
  |--------------------------------------------------------------------------
  |
  | Used when reanimated={false}
  |
  */

  const normalContent = (
    <View
      {...rest}
      style={[styles.flex, contentContainerStyle]}
      testID={testID}
      onLayout={onLayout}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessibilityLiveRegion={accessibilityLiveRegion}
      accessibilityViewIsModal={accessibilityViewIsModal}
      importantForAccessibility={importantForAccessibility}
    >
      {children}
    </View>
  );

  /*
  |--------------------------------------------------------------------------
  | Animated content
  |--------------------------------------------------------------------------
  |
  | Reanimated is only used when explicitly enabled.
  |
  */

  const animatedContent = (
    <AnimatedLayout
      animation={animationType}
      animationDuration={resolvedAnimationDuration}
      animationDelay={animationDelay}
      slideDistance={slideDistance}
      scaleFrom={scaleFrom}
      springConfig={springConfig}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
      style={[styles.flex, contentContainerStyle]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessibilityLiveRegion={accessibilityLiveRegion}
      accessibilityViewIsModal={accessibilityViewIsModal}
      importantForAccessibility={importantForAccessibility}
      testID={testID}
      onLayout={onLayout}
      {...rest}
    >
      {children}
    </AnimatedLayout>
  );

  /*
  |--------------------------------------------------------------------------
  | Choose content
  |--------------------------------------------------------------------------
  */

  const content = reanimated ? animatedContent : normalContent;

  /*
  |--------------------------------------------------------------------------
  | Keyboard Avoiding View
  |--------------------------------------------------------------------------
  */

  const layoutContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        keyboardBehavior || (Platform.OS === "ios" ? "padding" : "height")
      }
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  /*
  |--------------------------------------------------------------------------
  | Safe Area
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView edges={edges} style={rootStyle}>
      {layoutContent}
    </SafeAreaView>
  );
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default UILayout;
