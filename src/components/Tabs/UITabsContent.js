import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsContent = memo(function UITabsContent({
  children,

  value,

  style,

  animationDuration,

  testID,
}) {
  const tabs = useUITabs();

  const active = tabs.value === value;

  const [mounted, setMounted] = useState(active);

  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  const translateY = useRef(new Animated.Value(active ? 0 : 5)).current;

  useEffect(() => {
    if (active) {
      setMounted(true);

      if (!tabs.animated) {
        opacity.setValue(1);
        translateY.setValue(0);

        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,

          duration: animationDuration ?? tabs.animationDuration,

          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,

          duration: animationDuration ?? tabs.animationDuration,

          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (!tabs.animated) {
      opacity.setValue(0);
      setMounted(false);

      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,

        duration: animationDuration ?? tabs.animationDuration,

        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 5,

        duration: animationDuration ?? tabs.animationDuration,

        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
    });
  }, [
    active,
    tabs.animated,
    tabs.animationDuration,
    animationDuration,
    opacity,
    translateY,
  ]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="tabpanel"
      style={[
        {
          opacity,

          transform: [
            {
              translateY,
            },
          ],
        },

        style,
      ]}
    >
      {children}
    </Animated.View>
  );
});

UITabsContent.displayName = "UITabs.Content";
