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

  const [contentHeight, setContentHeight] = useState(0);

  const [mounted, setMounted] = useState(item.open);

  const heightAnimation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  const opacityAnimation = useRef(
    new Animated.Value(item.open ? 1 : 0),
  ).current;

  const previousOpen = useRef(item.open);

  /*
   * -----------------------------------------------
   * CONTENT MEASUREMENT
   * -----------------------------------------------
   *
   * We only update the cached height when the
   * actual content height changes.
   */

  const handleContentLayout = (event) => {
    const height = Math.ceil(event.nativeEvent.layout.height);

    if (height > 0 && height !== contentHeight) {
      setContentHeight(height);
    }

    onLayout?.(event);
  };

  /*
   * -----------------------------------------------
   * OPEN / CLOSE ANIMATION
   * -----------------------------------------------
   */

  useEffect(() => {
    const wasOpen = previousOpen.current;

    previousOpen.current = item.open;

    /*
     * Nothing changed.
     */
    if (wasOpen === item.open) {
      return;
    }

    /*
     * ---------------------------------------------
     * OPEN
     * ---------------------------------------------
     */

    if (item.open) {
      setMounted(true);

      /*
       * If content has not been measured yet,
       * wait for onLayout.
       */
      if (contentHeight <= 0) {
        heightAnimation.setValue(0);

        opacityAnimation.setValue(0);

        return;
      }

      if (!accordion.animated) {
        heightAnimation.setValue(1);

        opacityAnimation.setValue(1);

        return;
      }

      /*
       * Start exactly from closed.
       */
      heightAnimation.setValue(0);

      opacityAnimation.setValue(0);

      Animated.parallel([
        Animated.timing(heightAnimation, {
          toValue: 1,

          duration: accordion.animationDuration,

          useNativeDriver: false,
        }),

        Animated.timing(opacityAnimation, {
          toValue: 1,

          duration: Math.min(accordion.animationDuration, 160),

          useNativeDriver: false,
        }),
      ]).start();

      return;
    }

    /*
     * ---------------------------------------------
     * CLOSE
     * ---------------------------------------------
     */

    if (!accordion.animated) {
      heightAnimation.setValue(0);

      opacityAnimation.setValue(0);

      setMounted(false);

      return;
    }

    Animated.parallel([
      Animated.timing(heightAnimation, {
        toValue: 0,

        duration: accordion.animationDuration,

        useNativeDriver: false,
      }),

      Animated.timing(opacityAnimation, {
        toValue: 0,

        duration: Math.min(accordion.animationDuration, 150),

        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [
    item.open,
    contentHeight,
    accordion.animated,
    accordion.animationDuration,
    heightAnimation,
    opacityAnimation,
  ]);

  /*
   * -----------------------------------------------
   * IMPORTANT:
   *
   * Keep the content mounted while measuring.
   *
   * We use a wrapper whose height is animated.
   * The inner content itself keeps its natural
   * height.
   * -----------------------------------------------
   */

  if (!mounted) {
    /*
     * Keep a non-visible measurement copy mounted
     * only when the component has never measured.
     *
     * Once contentHeight is known, don't keep
     * measurement content around.
     */
    if (contentHeight > 0) {
      return null;
    }

    return (
      <View style={styles.measureOnly} pointerEvents="none">
        <View onLayout={handleContentLayout}>{children}</View>
      </View>
    );
  }

  /*
   * -----------------------------------------------
   * ANIMATED HEIGHT
   * -----------------------------------------------
   */

  const animatedHeight =
    contentHeight > 0
      ? heightAnimation.interpolate({
          inputRange: [0, 1],

          outputRange: [0, contentHeight],
        })
      : 0;

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
      <View style={[styles.inner, innerStyle]} onLayout={handleContentLayout}>
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

  measureOnly: {
    position: "absolute",

    left: 0,

    right: 0,

    opacity: 0,

    zIndex: -1,
  },
});

UIAccordionContent.displayName = "UIAccordion.Content";
