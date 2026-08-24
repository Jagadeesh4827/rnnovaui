import React, { memo } from "react";

import { View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsIndicator = memo(function UITabsIndicator({
  children,
  style,
}) {
  const tabs = useUITabs();

  if (children) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      style={[
        {
          height: tabs.indicatorHeight,

          backgroundColor: tabs.indicatorColor,

          borderRadius: tabs.indicatorHeight / 2,
        },

        style,
      ]}
    />
  );
});

UITabsIndicator.displayName = "UITabs.Indicator";
