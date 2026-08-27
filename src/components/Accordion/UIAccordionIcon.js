import React, { memo, useEffect, useRef } from "react";

import { Animated, Text, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionIcon = memo(function UIAccordionIcon({
  children,

  openIcon,
  closedIcon,

  animation,

  rotation = 180,

  size = 20,

  color,

  style,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const animationType = animation ?? accordion.iconAnimation;

  const rotationValue = useRef(new Animated.Value(item.open ? 1 : 0)).current;

  useEffect(() => {
    if (animationType === "none") {
      rotationValue.setValue(item.open ? 1 : 0);

      return;
    }

    if (animationType === "springRotate") {
      Animated.spring(rotationValue, {
        toValue: item.open ? 1 : 0,

        ...accordion.spring,

        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(rotationValue, {
      toValue: item.open ? 1 : 0,

      duration: accordion.animationDuration,

      useNativeDriver: true,
    }).start();
  }, [
    item.open,
    animationType,
    accordion.animationDuration,
    accordion.spring,
    rotationValue,
  ]);

  const rotate = rotationValue.interpolate({
    inputRange: [0, 1],

    outputRange: ["0deg", `${rotation}deg`],
  });

  const customIcon = item.open ? openIcon : closedIcon;

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate,
            },
          ],
        },

        style,
      ]}
    >
      {customIcon || children ? (
        customIcon || children
      ) : (
        <View>
          <Text
            style={{
              fontSize: size,

              lineHeight: size,

              color: color || accordion.colors.text || "#111111",

              fontWeight: "400",
            }}
          >
            ›
          </Text>
        </View>
      )}
    </Animated.View>
  );
});

UIAccordionIcon.displayName = "UIAccordion.Icon";
