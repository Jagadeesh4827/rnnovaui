import React, { memo, useRef } from "react";

import { Animated, Pressable, StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionTrigger = memo(function UIAccordionTrigger({
  children,

  onPress,

  disabled,

  pressScale = 0.98,

  style,
  contentStyle,

  activeStyle,

  inactiveStyle,

  pressAnimation,

  testID,

  accessibilityLabel,

  ...props
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const isDisabled = disabled ?? item.disabled;

  const scale = useRef(new Animated.Value(1)).current;

  const resolvedAnimation = pressAnimation ?? accordion.pressAnimation;

  const pressIn = () => {
    if (isDisabled || resolvedAnimation === "none") {
      return;
    }

    if (resolvedAnimation === "scale") {
      Animated.spring(scale, {
        toValue: pressScale,

        ...accordion.spring,

        useNativeDriver: true,
      }).start();
    }
  };

  const pressOut = () => {
    if (resolvedAnimation === "none") {
      return;
    }

    Animated.spring(scale, {
      toValue: 1,

      ...accordion.spring,

      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event) => {
    if (isDisabled) {
      return;
    }

    accordion.toggle(item.value);

    onPress?.(event);
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,

        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >
      <Pressable
        {...props}
        testID={testID}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        accessibilityState={{
          expanded: item.open,
          disabled: isDisabled,
        }}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.trigger,

          {
            minHeight:
              accordion.size === "sm" ? 44 : accordion.size === "lg" ? 60 : 52,

            opacity: isDisabled ? 0.45 : 1,
          },

          inactiveStyle,

          item.open ? activeStyle : null,

          style,
        ]}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  trigger: {
    width: "100%",

    justifyContent: "center",
  },

  content: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },
});

UIAccordionTrigger.displayName = "UIAccordion.Trigger";
