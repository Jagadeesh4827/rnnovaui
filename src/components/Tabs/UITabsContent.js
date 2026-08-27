import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsContent = memo(function UITabsContent({
  children,

  value,

  animation,

  animationDuration,

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
   * Supported:
   *
   * none
   * fade
   * fadeIn
   * fadeOut
   * fadeInOut
   */

  const animationType = animation ?? tabs.contentAnimation ?? "fade";

  const duration = animationDuration ?? tabs.animationDuration ?? 260;

  const [mounted, setMounted] = useState(isActive);

  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  /*
   * Prevent animations from running
   * after the component has unmounted.
   */
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      opacity.stopAnimation();
    };
  }, [opacity]);

  useEffect(() => {
    mountedRef.current = true;

    /*
     * No animation
     */
    if (!tabs.animated || animationType === "none") {
      if (isActive) {
        setMounted(true);
        opacity.setValue(1);
      } else {
        opacity.setValue(0);
        setMounted(false);
      }

      return;
    }

    /*
     * TAB BECOMES ACTIVE
     */
    if (isActive) {
      setMounted(true);

      /*
       * fadeOut is intended for
       * disappearing content.
       *
       * New content appears immediately.
       */
      if (animationType === "fadeOut") {
        opacity.setValue(1);
        return;
      }

      /*
       * fade / fadeIn / fadeInOut
       */
      opacity.stopAnimation();

      opacity.setValue(animationType === "fadeInOut" ? 0 : 0);

      Animated.timing(opacity, {
        toValue: 1,

        duration,

        useNativeDriver: true,
      }).start();

      return;
    }

    /*
     * TAB BECOMES INACTIVE
     */

    /*
     * fadeIn only affects
     * incoming content.
     *
     * Remove old content immediately.
     */
    if (animationType === "fadeIn") {
      opacity.setValue(0);
      setMounted(false);
      return;
    }

    /*
     * fadeOut / fade / fadeInOut
     */
    opacity.stopAnimation();

    Animated.timing(opacity, {
      toValue: 0,

      duration,

      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && mountedRef.current) {
        setMounted(false);
      }
    });
  }, [isActive, animationType, duration, tabs.animated, opacity]);

  /*
   * Do not render inactive
   * content after the exit
   * animation has completed.
   */
  if (!mounted) {
    return null;
  }

  /*
   * IMPORTANT:
   *
   * Animated.View contains ONLY
   * animation properties.
   *
   * No accessibilityRole.
   * No accessibilityState.
   * No accessibilityLabel.
   */

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,

        {
          opacity,
        },

        style,
      ]}
    >
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  content: {
    width: "100%",
  },
});

UITabsContent.displayName = "UITabs.Content";
