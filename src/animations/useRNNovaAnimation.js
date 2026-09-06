import { useEffect, useRef } from "react";

import { Animated, Easing } from "react-native";

import {
  DEFAULT_ANIMATION_STYLE,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_ANIMATION_DISTANCE,
  DEFAULT_ANIMATION_ENABLED,
  LOOP_ANIMATION_STYLES,
  SPRING_ANIMATION_STYLES,
} from "../constants";

import { getRNNovaAnimationStyle } from "./presets";

import {
  getAnimationEasing,
  getSpringConfig,
  createLoop,
  stopAnimation,
} from "./helpers";

export default function useRNNovaAnimation({
  animationStyle = DEFAULT_ANIMATION_STYLE,

  duration = DEFAULT_ANIMATION_DURATION,

  delay = DEFAULT_ANIMATION_DELAY,

  distance = DEFAULT_ANIMATION_DISTANCE,

  enabled = DEFAULT_ANIMATION_ENABLED,
} = {}) {
  const progress = useRef(
    new Animated.Value(animationStyle === "none" ? 1 : 0),
  ).current;

  const loopValue = useRef(new Animated.Value(0)).current;

  const animationRef = useRef(null);

  useEffect(() => {
    stopAnimation(animationRef.current);

    if (!enabled || animationStyle === "none") {
      progress.setValue(1);
      loopValue.setValue(0);

      return undefined;
    }

    progress.setValue(0);
    loopValue.setValue(0);

    /*
     * Continuous animations
     */
    if (LOOP_ANIMATION_STYLES.includes(animationStyle)) {
      progress.setValue(1);

      const halfDuration = Math.max(duration / 2, 180);

      const sequence = Animated.sequence([
        Animated.delay(delay),

        Animated.timing(loopValue, {
          toValue: 1,
          duration: halfDuration,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,
        }),

        Animated.timing(loopValue, {
          toValue: 0,
          duration: halfDuration,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,
        }),
      ]);

      const animation = createLoop(sequence);

      animationRef.current = animation;

      animation.start();

      return () => {
        stopAnimation(animation);
      };
    }

    /*
     * Spring animations
     */
    if (SPRING_ANIMATION_STYLES.includes(animationStyle)) {
      const animation = Animated.sequence([
        Animated.delay(delay),

        Animated.spring(progress, {
          toValue: 1,

          useNativeDriver: true,

          ...getSpringConfig(animationStyle),
        }),
      ]);

      animationRef.current = animation;

      animation.start();

      return () => {
        stopAnimation(animation);
      };
    }

    /*
     * Standard timing animation
     */
    const animation = Animated.sequence([
      Animated.delay(delay),

      Animated.timing(progress, {
        toValue: 1,

        duration,

        easing: getAnimationEasing(animationStyle),

        useNativeDriver: true,
      }),
    ]);

    animationRef.current = animation;

    animation.start();

    return () => {
      stopAnimation(animation);
    };
  }, [animationStyle, duration, delay, enabled, progress, loopValue]);

  const animatedStyle = getRNNovaAnimationStyle({
    animationStyle,
    progress,
    loopValue,
    distance,
  });

  return {
    progress,

    loopValue,

    animatedStyle,

    animationTransform: animatedStyle.transform || [],
  };
}
