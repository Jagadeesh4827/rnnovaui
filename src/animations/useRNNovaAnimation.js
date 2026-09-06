import { useEffect } from "react";

import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

const useRNNovaAnimation = ({
  animated = false,
  animationStyle = "none",
  duration = 500,
  delay = 0,
  iterationCount = 1,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // No animation requested
    if (!animated || animationStyle === "none") {
      return;
    }

    // Reset animation before starting
    progress.value = 0;

    const repeatCount =
      iterationCount === "infinite"
        ? -1
        : Math.max(1, Number(iterationCount) || 1);

    switch (animationStyle) {
      // --------------------------------
      // Fade
      // --------------------------------

      case "fadeIn":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
          }),
        );
        break;

      case "fadeOut":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
          }),
        );
        break;

      // --------------------------------
      // Bounce
      // --------------------------------

      case "bounce":
        progress.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withSpring(1, {
                damping: 8,
                stiffness: 180,
              }),
              withSpring(0, {
                damping: 10,
                stiffness: 180,
              }),
            ),
            repeatCount,
            false,
          ),
        );
        break;

      // --------------------------------
      // Elastic
      // --------------------------------

      case "elastic":
        progress.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withSpring(1, {
                damping: 4,
                stiffness: 150,
              }),
              withSpring(0, {
                damping: 6,
                stiffness: 120,
              }),
            ),
            repeatCount,
            false,
          ),
        );
        break;

      // --------------------------------
      // Spring
      // --------------------------------

      case "spring":
        progress.value = withDelay(
          delay,
          withSpring(1, {
            damping: 10,
            stiffness: 160,
          }),
        );
        break;

      // --------------------------------
      // Pulse
      // --------------------------------

      case "pulse":
        progress.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(1, {
                duration: duration / 2,
              }),
              withTiming(0, {
                duration: duration / 2,
              }),
            ),
            repeatCount,
            false,
          ),
        );
        break;

      // --------------------------------
      // Shake
      // --------------------------------

      case "shake":
        progress.value = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(1, {
                duration: 60,
              }),
              withTiming(-1, {
                duration: 120,
              }),
              withTiming(0, {
                duration: 60,
              }),
            ),
            repeatCount,
            false,
          ),
        );
        break;

      // --------------------------------
      // Zoom
      // --------------------------------

      case "zoomIn":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.ease),
          }),
        );
        break;

      case "zoomOut":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.ease),
          }),
        );
        break;

      // --------------------------------
      // Slide
      // --------------------------------

      case "slideIn":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.ease),
          }),
        );
        break;

      case "slideOut":
        progress.value = withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.ease),
          }),
        );
        break;

      // --------------------------------
      // Pop
      // --------------------------------

      case "pop":
        progress.value = withDelay(
          delay,
          withSequence(
            withSpring(1.15, {
              damping: 8,
              stiffness: 200,
            }),
            withSpring(1, {
              damping: 10,
              stiffness: 180,
            }),
          ),
        );
        break;

      // --------------------------------
      // Unknown animation
      // --------------------------------

      default:
        break;
    }

    return () => {
      // Stop any running animation when
      // configuration/component changes.
      progress.value = 0;
    };
  }, [animated, animationStyle, duration, delay, iterationCount, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated || animationStyle === "none") {
      return {};
    }

    switch (animationStyle) {
      // --------------------------------
      // Fade
      // --------------------------------

      case "fadeIn":
        return {
          opacity: progress.value,
        };

      case "fadeOut":
        return {
          opacity: 1 - progress.value,
        };

      // --------------------------------
      // Bounce
      // --------------------------------

      case "bounce":
        return {
          transform: [
            {
              scale: 1 + progress.value * 0.08,
            },
          ],
        };

      // --------------------------------
      // Elastic
      // --------------------------------

      case "elastic":
        return {
          transform: [
            {
              scale: 1 + progress.value * 0.12,
            },
          ],
        };

      // --------------------------------
      // Spring
      // --------------------------------

      case "spring":
        return {
          transform: [
            {
              scale: 0.9 + progress.value * 0.1,
            },
          ],
        };

      // --------------------------------
      // Pulse
      // --------------------------------

      case "pulse":
        return {
          transform: [
            {
              scale: 1 + progress.value * 0.05,
            },
          ],

          opacity: 1 - progress.value * 0.15,
        };

      // --------------------------------
      // Shake
      // --------------------------------

      case "shake":
        return {
          transform: [
            {
              translateX: progress.value * 8,
            },
          ],
        };

      // --------------------------------
      // Zoom
      // --------------------------------

      case "zoomIn":
        return {
          opacity: progress.value,

          transform: [
            {
              scale: 0.85 + progress.value * 0.15,
            },
          ],
        };

      case "zoomOut":
        return {
          opacity: 1 - progress.value,

          transform: [
            {
              scale: 1 + progress.value * 0.15,
            },
          ],
        };

      // --------------------------------
      // Slide
      // --------------------------------

      case "slideIn":
        return {
          opacity: progress.value,

          transform: [
            {
              translateY: (1 - progress.value) * 30,
            },
          ],
        };

      case "slideOut":
        return {
          opacity: 1 - progress.value,

          transform: [
            {
              translateY: progress.value * 30,
            },
          ],
        };

      // --------------------------------
      // Pop
      // --------------------------------

      case "pop":
        return {
          transform: [
            {
              scale: progress.value === 0 ? 1 : progress.value,
            },
          ],
        };

      // --------------------------------
      // Default
      // --------------------------------

      default:
        return {};
    }
  });

  return {
    animatedStyle,
    progress,
  };
};

export default useRNNovaAnimation;
