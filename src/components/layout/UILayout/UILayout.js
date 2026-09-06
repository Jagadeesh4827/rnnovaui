import React, { useEffect } from "react";
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

/**
 * UILayout
 *
 * Root/screen layout wrapper for rnnovaui.
 *
 * Features:
 * - Safe area support
 * - Theme-aware background
 * - Optional Reanimated animations
 * - Fade
 * - Fade + scale
 * - Slide
 * - Slide directions
 * - Spring
 * - Keyboard avoidance
 * - Custom styles
 * - Accessibility support
 *
 * Reanimated is only used when:
 *
 *   reanimated={true}
 *
 * Otherwise the component renders normally.
 */

const DEFAULT_DURATION = 400;
const DEFAULT_SLIDE_DISTANCE = 24;
const DEFAULT_SCALE_FROM = 0.96;

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
    case "slideUp":
      return {
        opacity: animation === "slide" ? 0 : 1,
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

    case "slideFade":
      return {
        opacity: 0,
        scale: 1,
        translateX: 0,
        translateY: slideDistance,
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

const getAnimationTarget = (animation) => {
  switch (animation) {
    case "fade":
    case "fadeIn":
    case "scale":
    case "fadeScale":
    case "slide":
    case "slideUp":
    case "slideDown":
    case "slideLeft":
    case "slideRight":
    case "slideFade":
    case "spring":
      return {
        opacity: 1,
        scale: 1,
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

const UILayoutAnimated = ({
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

  /*
   * Accessibility stays on normal View.
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
  const animationType = resolveAnimationType(animation);

  const initial = getInitialValues({
    animation: animationType,
    slideDistance,
    scaleFrom,
  });

  const target = getAnimationTarget(animationType);

  const opacity = useSharedValue(initial.opacity);
  const scale = useSharedValue(initial.scale);
  const translateX = useSharedValue(initial.translateX);
  const translateY = useSharedValue(initial.translateY);

  useEffect(() => {
    if (animationType === "none") {
      return;
    }

    onAnimationStart?.();

    const timingConfig = {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    };

    const runTiming = (sharedValue, value) => {
      sharedValue.value = withDelay(
        animationDelay,
        withTiming(value, timingConfig),
      );
    };

    if (animationType === "spring") {
      opacity.value = withDelay(
        animationDelay,
        withTiming(target.opacity, timingConfig, (finished) => {
          if (finished) {
            onAnimationComplete?.();
          }
        }),
      );

      scale.value = withDelay(
        animationDelay,
        withSpring(target.scale, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateX.value = withDelay(
        animationDelay,
        withSpring(target.translateX, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateY.value = withDelay(
        animationDelay,
        withSpring(target.translateY, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      return;
    }

    runTiming(opacity, target.opacity);
    runTiming(scale, target.scale);
    runTiming(translateX, target.translateX);

    translateY.value = withDelay(
      animationDelay,
      withTiming(target.translateY, timingConfig, (finished) => {
        if (finished) {
          onAnimationComplete?.();
        }
      }),
    );
  }, [
    animationType,
    animationDuration,
    animationDelay,
    slideDistance,
    scaleFrom,
    springConfig,
    onAnimationStart,
    onAnimationComplete,
    opacity,
    scale,
    translateX,
    translateY,
    target.opacity,
    target.scale,
    target.translateX,
    target.translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animationType === "none") {
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
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        accessibilityValue={accessibilityValue}
        accessibilityLiveRegion={accessibilityLiveRegion}
        accessibilityViewIsModal={accessibilityViewIsModal}
        importantForAccessibility={importantForAccessibility}
        style={styles.flex}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const UILayout = ({
  children,

  /*
   * Safe area
   */
  edges = ["top", "bottom", "left", "right"],

  /*
   * Root
   */
  flex = 1,

  /*
   * Theme/background
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
   * Root style
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
  const rootStyle = [
    styles.root,
    {
      flex,
      backgroundColor,
    },
    style,
  ];

  const content = reanimated ? (
    <UILayoutAnimated
      animation={animation}
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
    </UILayoutAnimated>
  ) : (
    <View
      {...rest}
      testID={testID}
      onLayout={onLayout}
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
    >
      {children}
    </View>
  );

  const layoutContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        keyboardBehavior || (Platform.OS === "ios" ? "padding" : undefined)
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
