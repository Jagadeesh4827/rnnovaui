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
import { UITabsList } from "./UITabsList";
import { UITabsTrigger } from "./UITabsTrigger";
import { UITabsContent } from "./UITabsContent";
import { UITabsIndicator } from "./UITabsIndicator";

const TabsContext = createContext(null);

const UI_TABS_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export const UITabs = memo(function UITabs({
  children,

  value,
  defaultValue,

  onValueChange,

  size = "md",

  animated = true,
  animationDuration = 220,

  variant = "default",

  activeColor,
  inactiveColor,

  indicatorColor,
  indicatorHeight = 2,

  indicatorWidth = "content",

  disabled = false,

  containerStyle,

  testID,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue ?? null);

  const currentValue = controlled ? value : internalValue;

  const safeSize = UI_TABS_SIZES[size] ? size : "md";

  const changeValue = useCallback(
    (nextValue) => {
      if (disabled) {
        return;
      }

      if (!controlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [disabled, controlled, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      colors,

      value: currentValue,

      setValue: changeValue,

      size: safeSize,

      animated,

      animationDuration,

      variant,

      activeColor: activeColor || colors.primary || "#FF5A1F",

      inactiveColor: inactiveColor || colors.textSecondary || "#525252",

      indicatorColor:
        indicatorColor || activeColor || colors.primary || "#FF5A1F",

      indicatorHeight,

      indicatorWidth,

      disabled,
    }),
    [
      colors,
      currentValue,
      changeValue,
      safeSize,
      animated,
      animationDuration,
      variant,
      activeColor,
      inactiveColor,
      indicatorColor,
      indicatorHeight,
      indicatorWidth,
      disabled,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <View testID={testID} style={[styles.container, containerStyle]}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return child;
          }

          return child;
        })}
      </View>
    </TabsContext.Provider>
  );
});

export function useUITabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("UITabs components must be used inside UITabs.");
  }

  return context;
}

export const UITabsSizes = UI_TABS_SIZES;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

UITabs.displayName = "UITabs";
UITabs.List = UITabsList;

UITabs.Trigger = UITabsTrigger;

UITabs.Content = UITabsContent;

UITabs.Indicator = UITabsIndicator;
