import React, { memo } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

import { useUIAccordionItem } from "./UIAccordionItem";

export const UIAccordionTrigger = memo(function UIAccordionTrigger({
  children,

  onPress,

  disabled,

  style,

  contentStyle,

  activeOpacity = 0.7,

  testID,

  accessibilityLabel,

  ...props
}) {
  const accordion = useUIAccordion();

  const item = useUIAccordionItem();

  const isDisabled = disabled ?? item.disabled;

  const handlePress = (event) => {
    if (isDisabled) {
      return;
    }

    accordion.toggle(item.value);

    onPress?.(event);
  };

  return (
    <Pressable
      {...props}
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{
        expanded: item.open,
        disabled: isDisabled,
      }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.trigger,

        {
          minHeight:
            accordion.size === "sm" ? 44 : accordion.size === "lg" ? 60 : 52,

          opacity: isDisabled ? 0.5 : pressed ? activeOpacity : 1,
        },

        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
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
