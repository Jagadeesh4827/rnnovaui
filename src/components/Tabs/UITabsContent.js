import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsContent = memo(function UITabsContent({
  children,

  value,

  style,

  animation,
  animationDuration,

  testID,
}) {
  const tabs = useUITabs();

  const active = tabs.value === value;

  const animationType = animation ?? tabs.contentAnimation;

  const [mounted, setMounted] = useState(active);

  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  const direction = getDirection(tabs, value);

  useEffect(() => {
    const duration = animationDuration ?? tabs.animationDuration;

    if (active) {
      setMounted(true);

      progress.setValue(0);

      if (animationType === "none") {
        progress.setValue(1);

        return;
      }

      Animated.timing(progress, {
        toValue: 1,

        duration,

        useNativeDriver: true,
      }).start();

      return;
    }

    if (animationType === "none") {
      progress.setValue(0);

      setMounted(false);

      return;
    }

    Animated.timing(progress, {
      toValue: 0,

      duration,

      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
    });
  }, [
    active,
    animationType,
    animationDuration,
    tabs.animationDuration,
    progress,
  ]);

  if (!mounted) {
    return null;
  }

  const transforms = getContentTransforms(animationType, progress, direction);

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="tabpanel"
      style={[
        styles.container,

        {
          opacity: getOpacity(animationType, progress),

          transform: transforms,
        },

        style,
      ]}
    >
      {children}
    </Animated.View>
  );
});

function getDirection(tabs, value) {
  if (!tabs.directionAware) {
    return 1;
  }

  if (tabs.previousValue === null || tabs.previousValue === undefined) {
    return 1;
  }

  return String(value) > String(tabs.previousValue) ? 1 : -1;
}

function getOpacity(type, progress) {
  if (type === "slide" || type === "scale") {
    return 1;
  }

  return progress;
}

function getContentTransforms(type, progress, direction) {
  switch (type) {
    case "slide":
      return [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [24 * direction, 0],
          }),
        },
      ];

    case "fadeSlide":
    case "slideFade":
      return [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [20 * direction, 0],
          }),
        },
      ];

    case "scale":
      return [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ];

    case "slideScale":
    case "springScale":
      return [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [18 * direction, 0],
          }),
        },
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.97, 1],
          }),
        },
      ];

    case "fade":
    default:
      return [];
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

UITabsContent.displayName = "UITabs.Content";
