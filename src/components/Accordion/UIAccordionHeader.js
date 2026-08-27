import React, { memo } from "react";

import { StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionHeader = memo(function UIAccordionHeader({
  children,

  style,

  borderBottomWidth,

  borderBottomColor,

  testID,
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const resolvedBorderWidth =
    borderBottomWidth ??
    (accordion.separator && !item.open ? StyleSheet.hairlineWidth : 0);

  return (
    <View
      testID={testID}
      style={[
        styles.header,

        {
          minHeight:
            accordion.size === "sm" ? 44 : accordion.size === "lg" ? 60 : 52,

          borderBottomWidth: resolvedBorderWidth,

          borderBottomColor:
            borderBottomColor || accordion.colors.border || "#E5E5E5",
        },

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
});

UIAccordionHeader.displayName = "UIAccordion.Header";
