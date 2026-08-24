import React, { memo, useEffect, useRef } from "react";

import { Animated, Text, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionIcon = memo(function UIAccordionIcon({
  children,

  openIcon,
  closedIcon,

  size,

  color,

  style,

  animated = true,

  rotation = 180,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const animation = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  useEffect(() => {
    if (!animated) {
      animation.setValue(item.open ? 1 : 0);

      return;
    }

    Animated.timing(animation, {
      toValue: item.open ? 1 : 0,

      duration: accordion.animationDuration,

      useNativeDriver: true,
    }).start();
  }, [item.open, animated, accordion.animationDuration, animation]);

  if (children || openIcon || closedIcon) {
    const customIcon = item.open ? openIcon : closedIcon;

    if (customIcon) {
      return (
        <Animated.View
          style={[
            {
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],

                    outputRange: ["0deg", `${rotation}deg`],
                  }),
                },
              ],
            },

            style,
          ]}
        >
          {customIcon}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          {
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],

                  outputRange: ["0deg", `${rotation}deg`],
                }),
              },
            ],
          },

          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate: animation.interpolate({
                inputRange: [0, 1],

                outputRange: ["0deg", `${rotation}deg`],
              }),
            },
          ],
        },

        style,
      ]}
    >
      <Text
        style={{
          fontSize: size || 20,

          color: color || accordion.colors.text || "#111111",

          lineHeight: size || 20,
        }}
      >
        ›
      </Text>
    </Animated.View>
  );
});

UIAccordionIcon.displayName = "UIAccordion.Icon";
