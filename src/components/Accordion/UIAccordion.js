import React, {
  Children,
  createContext,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";
import { UIAccordionItem } from "./UIAccordionItem";
import { UIAccordionHeader } from "./UIAccordionHeader";
import { UIAccordionTrigger } from "./UIAccordionTrigger";
import { UIAccordionContent } from "./UIAccordionContent";
import { UIAccordionIcon } from "./UIAccordionIcon";

const AccordionContext = createContext(null);

export const UIAccordion = memo(function UIAccordion({
  children,

  value,
  defaultValue,

  multiple = false,

  onValueChange,

  disabled = false,

  animated = true,
  animationDuration = 220,

  variant = "default",
  size = "md",

  separator = true,

  containerStyle,
  itemStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const normalizeValue = useCallback(
    (input) => {
      if (multiple) {
        if (Array.isArray(input)) {
          return input;
        }

        if (input === undefined || input === null) {
          return [];
        }

        return [input];
      }

      if (Array.isArray(input)) {
        return input[0] ?? null;
      }

      return input ?? null;
    },
    [multiple],
  );

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(() =>
    normalizeValue(defaultValue),
  );

  const currentValue = controlled ? normalizeValue(value) : internalValue;

  const isOpen = useCallback(
    (itemValue) => {
      if (multiple) {
        return currentValue.includes(itemValue);
      }

      return currentValue === itemValue;
    },
    [currentValue, multiple],
  );

  const toggle = useCallback(
    (itemValue) => {
      if (disabled) {
        return;
      }

      let nextValue;

      if (multiple) {
        const current = Array.isArray(currentValue) ? currentValue : [];

        if (current.includes(itemValue)) {
          nextValue = current.filter((item) => item !== itemValue);
        } else {
          nextValue = [...current, itemValue];
        }
      } else {
        nextValue = currentValue === itemValue ? null : itemValue;
      }

      if (!controlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, multiple, currentValue, controlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      colors,

      currentValue,

      multiple,

      disabled,

      animated,
      animationDuration,

      variant,
      size,

      separator,

      isOpen,
      toggle,
    }),
    [
      colors,
      currentValue,
      multiple,
      disabled,
      animated,
      animationDuration,
      variant,
      size,
      separator,
      isOpen,
      toggle,
    ],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <View
        testID={testID}
        style={[
          styles.container,

          {
            backgroundColor: colors.card || colors.background || "transparent",

            borderColor: colors.border || "#E5E5E5",
          },

          variant === "outlined" ? styles.outlined : null,

          containerStyle,
        ]}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child;
          }

          return React.cloneElement(child, {
            style: [itemStyle, child.props.style],
          });
        })}
      </View>
    </AccordionContext.Provider>
  );
});

export function useUIAccordion() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("Accordion components must be used inside UIAccordion.");
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },

  outlined: {
    borderWidth: 1,
    borderRadius: 12,
  },
});

UIAccordion.displayName = "UIAccordion";
UIAccordion.Item = UIAccordionItem;

UIAccordion.Header = UIAccordionHeader;

UIAccordion.Trigger = UIAccordionTrigger;

UIAccordion.Content = UIAccordionContent;

UIAccordion.Icon = UIAccordionIcon;
