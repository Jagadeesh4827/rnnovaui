import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionContent = memo(function UIAccordionContent({
  children,

  style,

  innerStyle,

  testID,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const progress = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  const [mounted, setMounted] = useState(item.open);

  useEffect(() => {
    if (item.open) {
      setMounted(true);

      if (!accordion.animated) {
        progress.setValue(1);
        return;
      }

      Animated.timing(progress, {
        toValue: 1,

        duration: accordion.animationDuration,

        useNativeDriver: false,
      }).start();

      return;
    }

    if (!accordion.animated) {
      progress.setValue(0);
      setMounted(false);
      return;
    }

    Animated.timing(progress, {
      toValue: 0,

      duration: accordion.animationDuration,

      useNativeDriver: false,
    }).start(() => {
      setMounted(false);
    });
  }, [item.open, accordion.animated, accordion.animationDuration, progress]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.animatedContainer,

        {
          opacity: progress,

          maxHeight: progress.interpolate({
            inputRange: [0, 1],

            outputRange: [0, 1000],
          }),
        },

        style,
      ]}
    >
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  animatedContainer: {
    width: "100%",

    overflow: "hidden",
  },

  inner: {
    width: "100%",
  },
});

UIAccordionContent.displayName = "UIAccordion.Content";
