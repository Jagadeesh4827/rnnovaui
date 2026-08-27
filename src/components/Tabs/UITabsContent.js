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

  const animationType = animation ?? tabs.contentAnimation ?? "fade";

  const duration = animationDuration ?? tabs.animationDuration ?? 260;

  const [mounted, setMounted] = useState(isActive);

  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      opacity.stopAnimation();
    };
  }, [opacity]);

  useEffect(() => {
    /*
     * No animation
     */
    if (!tabs.animated || animationType === "none") {
      opacity.stopAnimation();

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
     * ACTIVE
     */
    if (isActive) {
      setMounted(true);

      opacity.stopAnimation();

      /*
       * fadeOut means the incoming
       * content appears immediately.
       */
      if (animationType === "fadeOut") {
        opacity.setValue(1);
        return;
      }

      /*
       * fade
       * fadeIn
       * fadeInOut
       */
      opacity.setValue(0);

      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();

      return;
    }

    /*
     * INACTIVE
     */

    /*
     * fadeIn means only the
     * incoming content animates.
     */
    if (animationType === "fadeIn") {
      opacity.stopAnimation();
      opacity.setValue(0);
      setMounted(false);

      return;
    }

    /*
     * fade
     * fadeOut
     * fadeInOut
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

  if (!mounted) {
    return null;
  }

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
