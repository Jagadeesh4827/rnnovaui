import { Animated, Easing } from "react-native";

/*
 * Creates an opacity interpolation.
 */
export function createOpacity(value, from = 0, to = 1) {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
}

/*
 * Creates a numeric interpolation.
 */
export function createInterpolation(value, inputRange, outputRange) {
  return value.interpolate({
    inputRange,
    outputRange,
  });
}

/*
 * Creates a scale interpolation.
 */
export function createScale(value, from = 0.85, to = 1) {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
}

/*
 * Creates a translate interpolation.
 */
export function createTranslate(value, from = 24, to = 0) {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
}

/*
 * Creates a rotate interpolation.
 */
export function createRotate(value, from = "0deg", to = "360deg") {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [from, to],
  });
}

/*
 * Returns easing based on style.
 */
export function getAnimationEasing(animationStyle) {
  switch (animationStyle) {
    case "fade":
    case "fadeIn":
    case "fadeOut":
      return Easing.out(Easing.quad);

    case "pop":
    case "popIn":
    case "popOut":
      return Easing.out(Easing.back(1.4));

    case "zoom":
    case "zoomIn":
    case "zoomOut":
      return Easing.out(Easing.cubic);

    case "revealIn":
    case "revealOut":
      return Easing.inOut(Easing.cubic);

    default:
      return Easing.out(Easing.cubic);
  }
}

/*
 * Returns spring configuration.
 */
export function getSpringConfig(animationStyle) {
  switch (animationStyle) {
    case "elastic":
      return {
        damping: 7,
        stiffness: 180,
        mass: 0.8,
      };

    case "bounce":
    case "bounceIn":
      return {
        damping: 9,
        stiffness: 170,
        mass: 0.7,
      };

    case "rubberBand":
      return {
        damping: 6,
        stiffness: 200,
        mass: 0.8,
      };

    case "jelly":
      return {
        damping: 5,
        stiffness: 150,
        mass: 1,
      };

    case "overshoot":
      return {
        damping: 10,
        stiffness: 220,
        mass: 0.6,
      };

    case "recoil":
      return {
        damping: 12,
        stiffness: 140,
        mass: 0.8,
      };

    case "spring":
    default:
      return {
        damping: 15,
        stiffness: 180,
        mass: 0.8,
      };
  }
}

/*
 * Creates a loop.
 */
export function createLoop(animation, iterations = -1) {
  return Animated.loop(animation, {
    iterations,
  });
}

/*
 * Stops animation safely.
 */
export function stopAnimation(animation) {
  if (animation && typeof animation.stop === "function") {
    animation.stop();
  }
}
