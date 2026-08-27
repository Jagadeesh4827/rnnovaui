import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsContent = memo(function UITabsContent({
  children,
  value,

  animation = "fade",

  animationDuration,

  style,
  testID,
}) {
  const tabs = useUITabs();

  const active = tabs.value === value;

  const [mounted, setMounted] = useState(active);

  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    const duration = animationDuration ?? tabs.animationDuration;

    if (active) {
      setMounted(true);

      if (animation === "none" || !tabs.animated) {
        opacity.setValue(1);
        return;
      }

      opacity.setValue(0);

      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();

      return;
    }

    if (animation === "none" || !tabs.animated) {
      opacity.setValue(0);
      setMounted(false);
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
    });
  }, [
    active,
    animation,
    tabs.animated,
    tabs.animationDuration,
    animationDuration,
    opacity,
  ]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="tabpanel"
      style={[
        styles.container,
        {
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

UITabsContent.displayName = "UITabs.Content";
