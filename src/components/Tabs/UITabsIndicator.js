import React, { memo } from "react";

import { View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsIndicator = memo(function UITabsIndicator({
  style,

  height,
  color,
  radius,

  children,
}) {
  const tabs = useUITabs();

  if (children) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: height ?? tabs.indicatorHeight,

          backgroundColor: color ?? tabs.indicatorColor,

          borderRadius: radius ?? tabs.indicatorRadius,
        },

        style,
      ]}
    />
  );
});

UITabsIndicator.displayName = "UITabs.Indicator";
