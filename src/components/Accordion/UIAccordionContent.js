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

  const animation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  /*
   * ------------------------------------------------
   * MEASURE REAL CONTENT
   * ------------------------------------------------
   */

  const handleMeasureLayout = (event) => {
    const height = Math.ceil(event.nativeEvent.layout.height);

    if (height > 0 && height !== contentHeight) {
      setContentHeight(height);
    }
  };

  /*
   * ------------------------------------------------
   * OPEN / CLOSE
   * ------------------------------------------------
   */

  useEffect(() => {
    if (contentHeight <= 0) {
      return;
    }

    if (!accordion.animated) {
      animation.setValue(item.open ? 1 : 0);

      return;
    }

    Animated.timing(animation, {
      toValue: item.open ? 1 : 0,

      duration: accordion.animationDuration,

      easing: undefined,

      useNativeDriver: false,
    }).start();
  }, [
    item.open,
    contentHeight,
    accordion.animated,
    accordion.animationDuration,
    animation,
  ]);

  /*
   * ------------------------------------------------
   * ANIMATED HEIGHT
   * ------------------------------------------------
   */

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, contentHeight],

    extrapolate: "clamp",
  });

  /*
   * ------------------------------------------------
   * MEASUREMENT CONTENT
   *
   * This is always rendered.
   *
   * It does NOT participate in normal layout.
   * Therefore it cannot cause accordion shaking.
   * ------------------------------------------------
   */

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.measureContainer}>
        <View
          style={[styles.measureContent, innerStyle]}
          onLayout={handleMeasureLayout}
        >
          {children}
        </View>
      </View>

      <Animated.View
        testID={testID}
        style={[
          styles.animatedContainer,

          {
            height: animatedHeight,
          },

          style,
        ]}
      >
        <View style={[styles.visibleContent, innerStyle]}>{children}</View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },

  /*
   * Hidden measurement layer.
   *
   * It remains available so onLayout can always
   * calculate the real content height.
   */
  measureContainer: {
    position: "absolute",

    left: 0,
    right: 0,

    top: 0,

    opacity: 0,

    zIndex: -1,

    pointerEvents: "none",
  },

  measureContent: {
    width: "100%",
  },

  /*
   * Visible animated layer.
   */
  animatedContainer: {
    width: "100%",

    overflow: "hidden",
  },

  visibleContent: {
    width: "100%",
  },
});

UIAccordionContent.displayName = "UIAccordion.Content";
