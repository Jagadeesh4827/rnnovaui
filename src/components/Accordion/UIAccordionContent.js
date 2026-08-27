import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionContent = memo(function UIAccordionContent({
  children,

  animation,

  animationDuration,

  style,

  innerStyle,

  contentStyle,

  testID,

  accessible = false,

  accessibilityLabel,
  accessibilityHint,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const animationType = animation ?? accordion.contentAnimation;

  const duration = animationDuration ?? accordion.animationDuration;

  const [mounted, setMounted] = useState(item.open);

  const progress = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  const measuredHeight = useRef(0);

  const handleLayout = (event) => {
    const height = event.nativeEvent.layout.height;

    measuredHeight.current = height;
  };

  useEffect(() => {
    if (item.open) {
      setMounted(true);

      if (animationType === "none" || !accordion.animated) {
        progress.setValue(1);
        return;
      }

      progress.setValue(0);

      if (
        animationType === "springExpand" ||
        animationType === "springFadeExpand"
      ) {
        Animated.spring(progress, {
          toValue: 1,

          ...accordion.spring,

          useNativeDriver: false,
        }).start();

        return;
      }

      Animated.timing(progress, {
        toValue: 1,

        duration,

        useNativeDriver: false,
      }).start();

      return;
    }

    if (animationType === "none" || !accordion.animated) {
      progress.setValue(0);
      setMounted(false);
      return;
    }

    const finish = () => {
      setMounted(false);
    };

    if (
      animationType === "springExpand" ||
      animationType === "springFadeExpand"
    ) {
      Animated.spring(progress, {
        toValue: 0,

        ...accordion.spring,

        useNativeDriver: false,
      }).start(finish);

      return;
    }

    Animated.timing(progress, {
      toValue: 0,

      duration,

      useNativeDriver: false,
    }).start(finish);
  }, [
    item.open,
    animationType,
    accordion.animated,
    accordion.spring,
    duration,
    progress,
  ]);

  if (!mounted) {
    return null;
  }

  const shouldFade =
    animationType === "fade" ||
    animationType === "fadeExpand" ||
    animationType === "springFadeExpand";

  const shouldExpand =
    animationType === "expand" ||
    animationType === "fadeExpand" ||
    animationType === "springExpand" ||
    animationType === "springFadeExpand";

  const maxHeight = Math.max(measuredHeight.current, 1);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,

        shouldFade
          ? {
              opacity: progress,
            }
          : null,

        shouldExpand
          ? {
              maxHeight: progress.interpolate({
                inputRange: [0, 1],

                outputRange: [0, maxHeight],
              }),
            }
          : null,

        style,
      ]}
    >
      <View
        onLayout={handleLayout}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[styles.inner, innerStyle, contentStyle]}
      >
        {children}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",

    overflow: "hidden",
  },

  inner: {
    width: "100%",
  },
});

UIAccordionContent.displayName = "UIAccordion.Content";
