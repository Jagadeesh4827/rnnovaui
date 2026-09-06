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

import { useTheme } from "../../../theme";

const DEFAULT_DURATION = 400;
const DEFAULT_SLIDE_DISTANCE = 24;
const DEFAULT_SCALE_FROM = 0.96;

const resolveAnimationType = (animation) => {
  if (!animation) return "fade";

  if (typeof animation === "string") {
    return animation;
  }

  return animation.type || "fade";
};

const getInitialValues = (animation, slideDistance, scaleFrom) => {
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
    case "slideUp":
    case "slideFade":
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

const AnimatedLayout = ({
  children,
  animation,
  animationDuration,
  animationDelay,
  slideDistance,
  scaleFrom,
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
  const initial = useMemo(
    () => getInitialValues(animation, slideDistance, scaleFrom),
    [animation, slideDistance, scaleFrom],
  );

  const opacity = useSharedValue(initial.opacity);
  const scale = useSharedValue(initial.scale);
  const translateX = useSharedValue(initial.translateX);
  const translateY = useSharedValue(initial.translateY);

  useEffect(() => {
    if (animation === "none") {
      return;
    }

    opacity.value = initial.opacity;
    scale.value = initial.scale;
    translateX.value = initial.translateX;
    translateY.value = initial.translateY;

    onAnimationStart?.();

    const timing = {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    };

    const delay = animationDelay;

    const complete = (finished) => {
      if (finished) {
        onAnimationComplete?.();
      }
    };

    if (animation === "spring") {
      opacity.value = withDelay(delay, withTiming(1, timing, complete));

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

    opacity.value = withDelay(delay, withTiming(1, timing, complete));

    scale.value = withDelay(delay, withTiming(1, timing));

    translateX.value = withDelay(delay, withTiming(0, timing));

    translateY.value = withDelay(delay, withTiming(0, timing));
  }, [
    animation,
    animationDuration,
    animationDelay,
    initial,
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

const UILayout = ({
  children,

  /*
   * Theme
   *
   * Uses the existing rnnovaui theme system.
   *
   * mode:
   * - "light"
   * - "dark"
   * - "system"
   */
  mode,

  /*
   * Safe area
   */
  edges = ["top", "bottom", "left", "right"],

  /*
   * Root
   */
  flex = 1,

  /*
   * Background
   *
   * Explicit backgroundColor overrides
   * the theme background.
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
  const themeContext = useTheme();

  const { theme, mode: currentMode, isDark, setTheme } = themeContext;

  /*
   * If mode is supplied, synchronize it
   * with the existing global theme system.
   *
   * No separate theme state is created here.
   */
  useEffect(() => {
    if (mode && mode !== "system" && mode !== currentMode) {
      setTheme?.(mode);
    }
  }, [mode, currentMode, setTheme]);

  const activeMode = mode || currentMode;

  const themeBackground =
    theme?.colors?.background?.primary ??
    theme?.colors?.background ??
    theme?.colors?.backgroundColor;

  const resolvedBackgroundColor = backgroundColor || themeBackground;

  const rootStyle = [
    styles.root,
    {
      flex,
      backgroundColor: resolvedBackgroundColor,
    },
    style,
  ];

  const animationType = resolveAnimationType(animation);

  const content = reanimated ? (
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
  ) : (
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
