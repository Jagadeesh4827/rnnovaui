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

  backgroundColor,

  borderBottomWidth = 0,

  borderBottomColor,

  contentContainerStyle,

  indicatorStyle,

  style,

  onLayout,

  testID,
}) {
  const tabs = useUITabs();

  const [measurements, setMeasurements] = useState({});

  /*
   * Shared indicator position.
   */
  const translateX = useRef(new Animated.Value(0)).current;

  /*
   * Shared indicator width.
   */
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  /*
   * Every Trigger registers
   * its position here.
   */
  const registerMeasurement = useCallback((value, layout) => {
    if (value === undefined || value === null || !layout) {
      return;
    }

    setMeasurements((previous) => {
      const old = previous[value];

      if (old && old.x === layout.x && old.width === layout.width) {
        return previous;
      }

      return {
        ...previous,

        [value]: {
          x: layout.x,
          width: layout.width,
        },
      };
    });
  }, []);

  const activeMeasurement = measurements[tabs.value];

  /*
   * Animate indicator when
   * selected tab changes.
   */
  useEffect(() => {
    if (!activeMeasurement) {
      return;
    }

    const targetX = activeMeasurement.x;

    const targetWidth = activeMeasurement.width;

    /*
     * No animation.
     */
    if (tabs.indicatorAnimation === "none") {
      translateX.setValue(targetX);

      indicatorWidth.setValue(targetWidth);

      return;
    }

    /*
     * Spring.
     */
    if (tabs.indicatorAnimation === "spring") {
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
      ]).start();

      return;
    }

    /*
     * Normal slide.
     */
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
    ]).start();
  }, [
    activeMeasurement,
    tabs.indicatorAnimation,
    tabs.animationDuration,
    tabs.spring,
    translateX,
    indicatorWidth,
  ]);

  /*
   * Inject measurement callback
   * into every direct Trigger.
   */
  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    return React.cloneElement(child, {
      __registerMeasurement: registerMeasurement,
    });
  });

  const row = (
    <View
      style={[
        styles.row,

        {
          paddingHorizontal: tabs.sizeConfig.horizontalPadding,
        },
      ]}
    >
      {processedChildren}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,

          {
            width: indicatorWidth,

            height: tabs.indicatorHeight,

            backgroundColor: tabs.indicatorColor,

            borderRadius: tabs.indicatorRadius,

            transform: [
              {
                translateX,
              },
            ],
          },

          indicatorStyle,
        ]}
      />
    </View>
  );

  const listStyle = [
    styles.container,

    {
      backgroundColor: backgroundColor || "transparent",

      borderBottomWidth,

      borderBottomColor: borderBottomColor || tabs.colors.border || "#E5E5E5",
    },

    style,
  ];

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
  },

  indicator: {
    position: "absolute",

    left: 0,

    bottom: 0,

    zIndex: 20,
  },
});

UITabsList.displayName = "UITabs.List";
