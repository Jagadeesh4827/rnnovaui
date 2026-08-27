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

  const [contentHeight, setContentHeight] = useState(0);

  const heightAnimation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  const opacityAnimation = useRef(
    new Animated.Value(item.open ? 1 : 0),
  ).current;

  /*
   * ------------------------------------------------
   * MEASURE REAL CONTENT HEIGHT
   * ------------------------------------------------
   */

  const handleLayout = (event) => {
    const height = Math.ceil(event.nativeEvent.layout.height);

    if (height > 0 && height !== contentHeight) {
      setContentHeight(height);
    }
  };

  /*
   * ------------------------------------------------
   * ANIMATION
   * ------------------------------------------------
   */

  useEffect(() => {
    /*
     * If content has not been measured yet,
     * don't try to animate to an unknown height.
     */
    if (contentHeight <= 0) {
      return;
    }

    if (!accordion.animated) {
      heightAnimation.setValue(item.open ? 1 : 0);

      opacityAnimation.setValue(item.open ? 1 : 0);

      return;
    }

    Animated.parallel([
      Animated.timing(heightAnimation, {
        toValue: item.open ? 1 : 0,

        duration: accordion.animationDuration,

        useNativeDriver: false,
      }),

      Animated.timing(opacityAnimation, {
        toValue: item.open ? 1 : 0,

        duration: Math.min(accordion.animationDuration, 160),

        useNativeDriver: true,
      }),
    ]).start();
  }, [
    item.open,
    contentHeight,
    accordion.animated,
    accordion.animationDuration,
    heightAnimation,
    opacityAnimation,
  ]);

  /*
   * ------------------------------------------------
   * ANIMATED HEIGHT
   * ------------------------------------------------
   */

  const animatedHeight = heightAnimation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, contentHeight],
  });

  /*
   * ------------------------------------------------
   * CONTENT
   * ------------------------------------------------
   *
   * The inner content remains mounted all the time.
   * Therefore backend content can have any height.
   */

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,

        {
          height: animatedHeight,

          opacity: opacityAnimation,
        },

        style,
      ]}
    >
      <View style={[styles.inner, innerStyle]} onLayout={handleLayout}>
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
