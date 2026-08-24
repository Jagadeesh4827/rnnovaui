import React, { memo } from "react";

import { StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionHeader = memo(function UIAccordionHeader({
  children,

  style,

  testID,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  return (
    <View
      testID={testID}
      style={[
        styles.header,

        {
          minHeight:
            accordion.size === "sm" ? 44 : accordion.size === "lg" ? 60 : 52,

          borderBottomColor: accordion.colors.border || "#E5E5E5",
        },

        accordion.separator && item.open ? styles.headerOpen : null,

        style,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    width: "100%",

    justifyContent: "center",
  },

  headerOpen: {
    borderBottomWidth: 1,
  },
});

UIAccordionHeader.displayName = "UIAccordion.Header";
