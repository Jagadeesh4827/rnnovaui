import React, { memo } from "react";

import { ScrollView, StyleSheet, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsList = memo(function UITabsList({
  children,

  scrollable = false,

  showsHorizontalScrollIndicator = false,

  contentContainerStyle,

  style,

  backgroundColor,

  borderBottomWidth = 0,

  borderBottomColor,

  testID,
}) {
  const tabs = useUITabs();

  const horizontalPadding =
    tabs.size === "sm" ? 6 : tabs.size === "lg" ? 14 : 10;

  const row = (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {children}
    </View>
  );

  const containerStyle = [
    styles.container,

    {
      backgroundColor: backgroundColor || "transparent",

      borderBottomWidth,

      borderBottomColor: borderBottomColor || tabs.colors.border || "#E5E5E5",
    },

    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        bounces
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        style={containerStyle}
      >
        {row}
      </ScrollView>
    );
  }

  return (
    <View testID={testID} style={containerStyle}>
      {row}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  row: {
    minHeight: 48,

    flexDirection: "row",

    alignItems: "stretch",

    gap: 4,
  },
});

UITabsList.displayName = "UITabs.List";
