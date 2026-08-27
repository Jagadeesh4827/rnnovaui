import React, {
  Children,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Animated, ScrollView, StyleSheet, View } from "react-native";

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

  indicatorStyle,

  onLayout,

  testID,
}) {
  const tabs = useUITabs();

  const [measurements, setMeasurements] = useState({});

  const translateX = useRef(new Animated.Value(0)).current;

  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const indicatorScaleX = useRef(new Animated.Value(0)).current;

  const activeMeasurement = measurements[tabs.value];

  const registerMeasurement = useCallback((value, layout) => {
    if (!value || !layout) {
      return;
    }

    setMeasurements((current) => ({
      ...current,
      [value]: layout,
    }));
  }, []);

  useEffect(() => {
    if (!activeMeasurement) {
      return;
    }

    const targetX = activeMeasurement.x;

    const targetWidth = activeMeasurement.width;

    const animation = tabs.indicatorAnimation;

    if (animation === "none") {
      translateX.setValue(targetX);
      indicatorWidth.setValue(targetWidth);
      indicatorScaleX.setValue(1);
      return;
    }

    if (animation === "spring") {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetX,
          ...tabs.spring,
          useNativeDriver: false,
        }),

        Animated.spring(indicatorWidth, {
          toValue: targetWidth,
          ...tabs.spring,
          useNativeDriver: false,
        }),

        Animated.spring(indicatorScaleX, {
          toValue: 1,
          ...tabs.spring,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: tabs.animationDuration,
        useNativeDriver: false,
      }),

      Animated.timing(indicatorWidth, {
        toValue: targetWidth,
        duration: tabs.animationDuration,
        useNativeDriver: false,
      }),

      Animated.timing(indicatorScaleX, {
        toValue: 1,
        duration: tabs.animationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    activeMeasurement,
    tabs.indicatorAnimation,
    tabs.animationDuration,
    tabs.spring,
    translateX,
    indicatorWidth,
    indicatorScaleX,
  ]);

  const horizontalPadding = tabs.sizeConfig.horizontalPadding;

  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    return React.cloneElement(child, {
      __registerMeasurement: registerMeasurement,
    });
  });

  const listStyle = [
    styles.container,

    {
      backgroundColor: backgroundColor || "transparent",

      borderBottomWidth,

      borderBottomColor: borderBottomColor || tabs.colors.border || "#E5E5E5",
    },

    style,
  ];

  const row = (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {processedChildren}

      <SharedIndicator
        translateX={translateX}
        indicatorWidth={indicatorWidth}
        scaleX={indicatorScaleX}
        style={indicatorStyle}
      />
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        testID={testID}
        horizontal
        bounces
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        style={listStyle}
        onLayout={onLayout}
      >
        {row}
      </ScrollView>
    );
  }

  return (
    <View testID={testID} style={listStyle} onLayout={onLayout}>
      {row}
    </View>
  );
});

function SharedIndicator({ translateX, indicatorWidth, scaleX, style }) {
  const tabs = useUITabs();

  if (tabs.indicatorAnimation === "fade") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,

          {
            left: 0,
            width: indicatorWidth,

            transform: [
              {
                translateX,
              },
              {
                scaleX,
              },
            ],

            opacity: scaleX,
          },

          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,

        {
          width: indicatorWidth,

          height: tabs.indicatorHeight,

          backgroundColor: tabs.indicatorColor,

          borderRadius: tabs.indicatorRadius,

          bottom: 0,

          transform: [
            {
              translateX,
            },
          ],
        },

        tabs.indicatorWidth === "full"
          ? styles.fullIndicator
          : styles.contentIndicator,

        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  row: {
    minHeight: 50,

    flexDirection: "row",

    alignItems: "stretch",

    position: "relative",

    gap: 4,
  },

  indicator: {
    position: "absolute",

    zIndex: 20,

    pointerEvents: "none",
  },

  fullIndicator: {
    bottom: 0,
  },

  contentIndicator: {
    bottom: 0,
  },
});

UITabsList.displayName = "UITabs.List";
