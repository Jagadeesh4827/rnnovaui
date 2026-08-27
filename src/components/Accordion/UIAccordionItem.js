import React, { createContext, memo, useContext } from "react";

import { StyleSheet, View } from "react-native";

import { useUIAccordion } from "./UIAccordion";

const AccordionItemContext = createContext(null);

export const UIAccordionItem = memo(function UIAccordionItem({
  children,

  value,

  disabled = false,

  style,

  activeStyle,
  inactiveStyle,

  testID,
}) {
  const accordion = useUIAccordion();

  const open = accordion.isOpen(value);

  const itemDisabled = disabled || accordion.disabled;

  const contextValue = {
    value,

    open,

    disabled: itemDisabled,
  };

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <View
        testID={testID}
        style={[styles.item, inactiveStyle, open ? activeStyle : null, style]}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
});

export function useUIAccordionItem() {
  const context = useContext(AccordionItemContext);

  if (!context) {
    throw new Error(
      "UIAccordion.Item components must be used inside <UIAccordion.Item>.",
    );
  }

  return context;
}

const styles = StyleSheet.create({
  item: {
    width: "100%",
  },
});

UIAccordionItem.displayName = "UIAccordion.Item";
