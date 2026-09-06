import React from "react";

import { View, StyleSheet, useColorScheme } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Animated from "react-native-reanimated";

import { useRNNovaAnimation } from "../../../animations";

const AnimatedView = Animated.createAnimatedComponent(View);

const UILayout = ({
  children,

  // -------------------------
  // Colors
  // -------------------------

  backgroundColor,
  lightBackgroundColor,
  darkBackgroundColor,

  // -------------------------
  // Safe Area
  // -------------------------

  edges = ["top", "bottom", "left", "right"],

  // -------------------------
  // Layout
  // -------------------------

  flex = 1,

  // -------------------------
  // Styles
  // -------------------------

  style,
  containerStyle,
  contentStyle,

  // -------------------------
  // Content
  // -------------------------

  centered = false,

  // -------------------------
  // Animation
  // -------------------------

  animated = false,

  animationStyle = "none",

  duration = 500,

  delay = 0,

  iterationCount = 1,
}) => {
  const colorScheme = useColorScheme();

  // -------------------------
  // Resolve Background Color
  // -------------------------

  let resolvedBackgroundColor = backgroundColor;

  if (!resolvedBackgroundColor) {
    if (colorScheme === "dark") {
      resolvedBackgroundColor = darkBackgroundColor || "#000000";
    } else {
      resolvedBackgroundColor = lightBackgroundColor || "#FFFFFF";
    }
  }

  // -------------------------
  // Animation
  // -------------------------

  const { animatedStyle } = useRNNovaAnimation({
    animated,
    animationStyle,
    duration,
    delay,
    iterationCount,
  });

  // -------------------------
  // Content Component
  // -------------------------

  const ContentView = animated ? AnimatedView : View;

  // -------------------------
  // Render
  // -------------------------

  return (
    <View
      style={[
        styles.container,

        {
          flex,
          backgroundColor: resolvedBackgroundColor,
        },

        containerStyle,
      ]}
    >
      <SafeAreaView
        edges={edges}
        style={[
          styles.safeArea,

          {
            backgroundColor: resolvedBackgroundColor,
          },

          style,
        ]}
      >
        <ContentView
          style={[
            styles.content,

            {
              flex,
            },

            centered && styles.centered,

            contentStyle,

            animatedStyle,
          ]}
        >
          {children}
        </ContentView>
      </SafeAreaView>
    </View>
  );
};

// -------------------------
// Styles
// -------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default UILayout;
