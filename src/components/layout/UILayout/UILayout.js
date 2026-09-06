import React, { useEffect, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_DURATION = 400;
const DEFAULT_SLIDE_DISTANCE = 24;
const DEFAULT_SCALE_FROM = 0.96;

/*
|--------------------------------------------------------------------------
| UILayout theme colors
|--------------------------------------------------------------------------
*/

const UILAYOUT_THEMES = {
  light: {
    background: "#FFFFFF",
  },

  dark: {
    background: "#000000",
  },
};

/*
|--------------------------------------------------------------------------
| Resolve mode
|--------------------------------------------------------------------------
*/

const resolveMode = (mode, systemColorScheme) => {
  if (mode === "light") {
    return "light";
  }

  if (mode === "dark") {
    return "dark";
  }

  return systemColorScheme === "dark" ? "dark" : "light";
};

/*
|--------------------------------------------------------------------------
| Resolve background
|--------------------------------------------------------------------------
*/

const resolveBackgroundColor = ({
  mode,
  systemColorScheme,
  backgroundColor,
}) => {
  if (backgroundColor) {
    return backgroundColor;
  }

  const resolvedMode = resolveMode(mode, systemColorScheme);

  return UILAYOUT_THEMES[resolvedMode].background;
};

/*
|--------------------------------------------------------------------------
| Animation helpers
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

const getInitialValues = ({ animation, slideDistance, scaleFrom }) => {
  switch (animation) {
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
    case "slideUp":
      return {
        opacity: animation === "slideUp" ? 1 : 0,
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
| Animated Layout
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

  useEffect(() => {
    if (animation === "none") {
      return;
    }

    opacity.value = initialValues.opacity;
    scale.value = initialValues.scale;
    translateX.value = initialValues.translateX;
    translateY.value = initialValues.translateY;

    onAnimationStart?.();

    const timingConfig = {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    };

    const delay = animationDelay;

    if (animation === "spring") {
      opacity.value = withDelay(
        delay,
        withTiming(1, timingConfig, (finished) => {
          if (finished) {
            onAnimationComplete?.();
          }
        }),
      );

      scale.value = withDelay(
        delay,
        withSpring(1, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateX.value = withDelay(
        delay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateY.value = withDelay(
        delay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      return;
    }

    opacity.value = withDelay(
      delay,
      withTiming(1, timingConfig, (finished) => {
        if (finished) {
          onAnimationComplete?.();
        }
      }),
    );

    scale.value = withDelay(delay, withTiming(1, timingConfig));

    translateX.value = withDelay(delay, withTiming(0, timingConfig));

    translateY.value = withDelay(delay, withTiming(0, timingConfig));
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
   * Theme mode
   *
   * light
   * dark
   * system
   */
  mode = "system",

  /*
   * Safe area
   */
  edges = ["top", "bottom", "left", "right"],

  /*
   * Layout
   */
  flex = 1,

  /*
   * Background
   */
  backgroundColor,

  /*
   * Content
   */
  contentContainerStyle,

  /*
   * Keyboard
   */
  keyboardAvoiding = false,

  keyboardBehavior,

  keyboardVerticalOffset = 0,

  /*
   * Reanimated
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
   * Style
   */
  style,

  /*
   * Accessibility
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

  ...rest
}) => {
  /*
   * Only READ the system color scheme.
   *
   * No state update happens here.
   */
  const systemColorScheme = useColorScheme();

  /*
   * Resolve light/dark/system.
   */
  const resolvedMode = resolveMode(mode, systemColorScheme);

  /*
   * Resolve background.
   *
   * Explicit backgroundColor has priority.
   */
  const resolvedBackgroundColor = resolveBackgroundColor({
    mode: resolvedMode,
    systemColorScheme,
    backgroundColor,
  });

  const rootStyle = [
    styles.root,
    {
      flex,
      backgroundColor: resolvedBackgroundColor,
    },
    style,
  ];

  const animationType = resolveAnimationType(animation);

  /*
   * Normal View when Reanimated
   * is disabled.
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
   * Animated content only when
   * explicitly requested.
   */
  const animatedContent = (
    <AnimatedLayout
      animation={animationType}
      animationDuration={animationDuration}
      animationDelay={animationDelay}
      slideDistance={slideDistance}
      scaleFrom={scaleFrom}
      springConfig={springConfig}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
      style={contentContainerStyle}
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

  const content = reanimated ? animatedContent : normalContent;

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

  return (
    <SafeAreaView edges={edges} style={rootStyle}>
      {layoutContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },
});

export default UILayout;
