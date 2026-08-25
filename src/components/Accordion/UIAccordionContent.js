import React, { memo, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";
import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionContent = memo(function UIAccordionContent({
  children,

  style,

  innerStyle,

  testID,

  onLayout,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const heightAnimation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  const opacityAnimation = useRef(
    new Animated.Value(item.open ? 1 : 0),
  ).current;

  const [contentHeight, setContentHeight] = useState(0);

  const [mounted, setMounted] = useState(item.open);

  /*
   * ------------------------------------------------
   * MEASURE CONTENT
   * ------------------------------------------------
   */

  const handleLayout = (event) => {
    const height = event.nativeEvent.layout.height;

    if (height !== contentHeight) {
      setContentHeight(height);
    }

    onLayout?.(event);
  };

  /*
   * ------------------------------------------------
   * OPEN / CLOSE
   * ------------------------------------------------
   */

  useEffect(() => {
    if (item.open) {
      /*
       * Mount before opening.
       */
      setMounted(true);

      if (!accordion.animated) {
        heightAnimation.setValue(1);

        opacityAnimation.setValue(1);

        return;
      }

      /*
       * Smooth opening.
       */
      Animated.parallel([
        Animated.timing(heightAnimation, {
          toValue: 1,

          duration: accordion.animationDuration,

          useNativeDriver: false,
        }),

        Animated.timing(opacityAnimation, {
          toValue: 1,

          duration: Math.min(accordion.animationDuration, 180),

          useNativeDriver: false,
        }),
      ]).start();

      return;
    }

    /*
     * ------------------------------------------------
     * CLOSE
     * ------------------------------------------------
     */

    if (!accordion.animated) {
      heightAnimation.setValue(0);

      opacityAnimation.setValue(0);

      setMounted(false);

      return;
    }

    /*
     * Animate to zero first.
     */
    Animated.parallel([
      Animated.timing(heightAnimation, {
        toValue: 0,

        duration: accordion.animationDuration,

        useNativeDriver: false,
      }),

      Animated.timing(opacityAnimation, {
        toValue: 0,

        duration: Math.min(accordion.animationDuration, 160),

        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [
    item.open,
    accordion.animated,
    accordion.animationDuration,
    heightAnimation,
    opacityAnimation,
  ]);

  /*
   * ------------------------------------------------
   * CLOSED
   * ------------------------------------------------
   */

  if (!mounted && !item.open) {
    return (
      <View
        style={{
          position: "absolute",

          opacity: 0,

          pointerEvents: "none",
        }}
      >
        <View onLayout={handleLayout}>{children}</View>
      </View>
    );
  }

  /*
   * ------------------------------------------------
   * ANIMATED HEIGHT
   * ------------------------------------------------
   */

  const animatedHeight =
    contentHeight > 0
      ? heightAnimation.interpolate({
          inputRange: [0, 1],

          outputRange: [0, contentHeight],
        })
      : undefined;

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
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
      <View style={[styles.content, innerStyle]} onLayout={handleLayout}>
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

  content: {
    width: "100%",
  },
});

UIAccordionContent.displayName = "UIAccordion.Content";
