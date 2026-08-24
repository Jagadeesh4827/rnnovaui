import React, { memo } from "react";

import { ScrollView, StyleSheet, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsList = memo(function UITabsList({
  children,

  scrollable = false,

  showsHorizontalScrollIndicator = false,

  contentContainerStyle,

  style,

  testID,
}) {
  const tabs = useUITabs();

  const sizePadding = tabs.size === "sm" ? 8 : tabs.size === "lg" ? 16 : 12;

  const content = (
    <View
      style={[
        styles.row,

        {
          paddingHorizontal: sizePadding,
        },
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        bounces
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        style={style}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View testID={testID} style={[styles.container, style]}>
      {content}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
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
