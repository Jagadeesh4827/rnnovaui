import React from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UILayout = ({
  children,

  // Colors
  backgroundColor,
  lightBackgroundColor,
  darkBackgroundColor,

  // Safe area
  edges = ["top", "bottom", "left", "right"],

  // Layout
  flex = 1,

  // Styles
  style,
  containerStyle,
  contentStyle,

  // Content
  centered = false,

  // Future-compatible prop
  keyboardAvoiding = false,
}) => {
  const colorScheme = useColorScheme();

  let resolvedBackgroundColor = backgroundColor;

  if (!resolvedBackgroundColor) {
    if (colorScheme === "dark") {
      resolvedBackgroundColor = darkBackgroundColor || "#000000";
    } else {
      resolvedBackgroundColor = lightBackgroundColor || "#FFFFFF";
    }
  }

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
        <View
          style={[
            styles.content,
            {
              flex,
            },
            centered && styles.centered,
            contentStyle,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

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
