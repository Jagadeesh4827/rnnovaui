import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsContent = memo(function UITabsContent({
  children,

  value,

  animation,

  animationDuration,

  scaleFrom = 0.96,

  style,

  contentStyle,

  testID,

  accessible = false,

  accessibilityLabel,

  accessibilityHint,

  accessibilityState,

  onLayout,
}) {
  const tabs = useUITabs();

  const isActive = tabs.value === value;

  /*
   * ONLY these animations:
   *
   * none
   * fade
   * fadeIn
   * fadeOut
   * scale
   * fadeScale
   */
  const animationType = animation ?? tabs.contentAnimation ?? "fade";

  const duration = animationDuration ?? tabs.animationDuration ?? 260;

  const [mounted, setMounted] = useState(isActive);

  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  const mountedRef = useRef(true);

  /*
   * Cleanup.
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      progress.stopAnimation();
    };
  }, [progress]);

  /*
   * Animation.
   */
  useEffect(() => {
    /*
     * NO ANIMATION
     */
    if (!tabs.animated || animationType === "none") {
      progress.stopAnimation();

      if (isActive) {
        setMounted(true);
        progress.setValue(1);
      } else {
        progress.setValue(0);
        setMounted(false);
      }

      return;
    }

    /*
     * =========================
     * ACTIVE CONTENT
     * =========================
     */
    if (isActive) {
      setMounted(true);

      progress.stopAnimation();

      /*
       * fadeOut:
       *
       * Incoming content appears
       * immediately.
       */
      if (animationType === "fadeOut") {
        progress.setValue(1);
        return;
      }

      /*
       * fade
       * fadeIn
       * scale
       * fadeScale
       */
      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 1,

        duration,

        useNativeDriver: true,
      }).start();

      return;
    }

    /*
     * =========================
     * INACTIVE CONTENT
     * =========================
     */

    /*
     * fadeIn:
     *
     * This content is removed
     * immediately.
     */
    if (animationType === "fadeIn") {
      progress.stopAnimation();

      progress.setValue(0);

      setMounted(false);

      return;
    }

    /*
     * fade
     * fadeOut
     * scale
     * fadeScale
     */
    progress.stopAnimation();

    Animated.timing(progress, {
      toValue: 0,

      duration,

      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && mountedRef.current) {
        setMounted(false);
      }
    });
  }, [isActive, animationType, duration, tabs.animated, progress]);

  if (!mounted) {
    return null;
  }

  /*
   * Fade animations.
   */
  const opacity = getOpacity(animationType, progress);

  /*
   * Scale animations.
   */
  const scale = getScale(animationType, progress, scaleFrom);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,

        {
          opacity,

          transform: [
            {
              scale,
            },
          ],
        },

        style,
      ]}
    >
      {/*
       * IMPORTANT:
       *
       * Animated.View contains only
       * animation-related styles.
       *
       * Accessibility props are placed
       * on the normal View below.
       */}
      <View
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        onLayout={onLayout}
        style={[styles.content, contentStyle]}
      >
        {children}
      </View>
    </Animated.View>
  );
});

/*
 * ==============================
 * OPACITY
 * ==============================
 */

function getOpacity(type, progress) {
  switch (type) {
    case "fade":
    case "fadeIn":
    case "fadeOut":
    case "fadeScale":
      return progress;

    case "scale":
    case "none":
    default:
      return 1;
  }
}

/*
 * ==============================
 * SCALE
 * ==============================
 */

function getScale(type, progress, scaleFrom) {
  switch (type) {
    case "scale":
    case "fadeScale":
      return progress.interpolate({
        inputRange: [0, 1],

        outputRange: [scaleFrom, 1],
      });

    case "fade":
    case "fadeIn":
    case "fadeOut":
    case "none":
    default:
      return 1;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  content: {
    width: "100%",
  },
});

UITabsContent.displayName = "UITabs.Content";
