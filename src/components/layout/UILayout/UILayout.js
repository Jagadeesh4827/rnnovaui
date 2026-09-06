import React, { useMemo } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useUITheme } from "../../../theme";
import { useRNNovaAnimation } from "../../../animations";
import {
  flattenStyle,
  mergeTransforms,
  separateTransform,
} from "../../../utils";

const ALL_EDGES = ["top", "right", "bottom", "left"];

const normalizeEdges = (edges) => {
  if (!edges) return ALL_EDGES;

  if (edges === "all") return ALL_EDGES;
  if (edges === "vertical") return ["top", "bottom"];
  if (edges === "horizontal") return ["left", "right"];

  if (typeof edges === "string") return [edges];

  if (Array.isArray(edges)) return edges;

  return ALL_EDGES;
};

const getColor = (value, theme) => {
  if (!value) return undefined;

  if (typeof value !== "string") return value;

  /*
   * Direct colors are always respected.
   *
   * Examples:
   * "red"
   * "#FF0000"
   * "rgb(255,0,0)"
   */
  if (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("rgba") ||
    value.startsWith("hsl") ||
    value.startsWith("hsla")
  ) {
    return value;
  }

  /*
   * Theme color support.
   *
   * Examples:
   * "background"
   * "surface"
   * "primary"
   * "card"
   */
  const colors = theme?.colors || {};

  return colors[value] || value;
};

const resolveBarStyle = (style, fallback = "dark") => {
  if (style === "light") return "light-content";
  if (style === "dark") return "dark-content";

  return fallback === "light" ? "light-content" : "dark-content";
};

const UILayout = ({
  children,

  /* Safe area */
  edges = "all",

  /* Theme/background */
  background,
  backgroundColor,

  /* System bars */
  statusBarColor,
  statusBarStyle = "dark",

  navigationBarColor,
  navigationBarStyle = "dark",

  /* Layout */
  flex = 1,
  centered = false,
  responsive = true,

  /* Keyboard */
  keyboardAvoidingView = false,
  keyboardVerticalOffset = 0,
  keyboardBehavior,

  /* Styles */
  style,
  containerStyle,
  contentStyle,

  /* Animation */
  animationStyle = "none",
  animationDuration,
  animationDelay,
  animationDistance,
  animationEnabled = true,

  /* Native props */
  pointerEvents,
  testID,
  accessible,
  accessibilityLabel,

  ...rest
}) => {
  const theme = useUITheme();
  const insets = useSafeAreaInsets();

  const resolvedEdges = useMemo(() => normalizeEdges(edges), [edges]);

  const resolvedBackgroundColor = getColor(
    backgroundColor || background,
    theme,
  );

  const resolvedStatusBarColor = getColor(
    statusBarColor || resolvedBackgroundColor,
    theme,
  );

  const resolvedNavigationBarColor = getColor(
    navigationBarColor || resolvedBackgroundColor,
    theme,
  );

  const { progress, animatedStyle, animationTransform } = useRNNovaAnimation({
    animationStyle,
    duration: animationDuration,
    delay: animationDelay,
    distance: animationDistance,
    enabled: animationEnabled,
  });

  const baseContentStyle = {
    flex,
    ...(centered && {
      alignItems: "center",
      justifyContent: "center",
    }),
  };

  const responsiveStyle = responsive
    ? {
        width: "100%",
        minHeight: 0,
      }
    : {};

  const safeAreaStyle = [
    styles.safeArea,
    {
      flex,
      backgroundColor: resolvedBackgroundColor,
    },
    responsiveStyle,
    style,
    containerStyle,
  ];

  const contentBaseStyle = [styles.content, baseContentStyle, contentStyle];

  const separated = separateTransform(flattenStyle(contentBaseStyle));

  const finalContentStyle = [
    separated.style,
    animatedStyle,
    {
      transform: mergeTransforms(separated.transform, animationTransform),
    },
  ];

  const renderContent = (
    <Animated.View
      pointerEvents={pointerEvents}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      style={finalContentStyle}
    >
      {children}
    </Animated.View>
  );

  const wrappedContent = keyboardAvoidingView ? (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={
        keyboardBehavior || (Platform.OS === "ios" ? "padding" : "height")
      }
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {renderContent}
    </KeyboardAvoidingView>
  ) : (
    renderContent
  );

  return (
    <View
      style={[
        styles.systemBarContainer,
        {
          flex,
          backgroundColor: resolvedNavigationBarColor,
        },
      ]}
      {...rest}
    >
      <SafeAreaView edges={resolvedEdges} style={safeAreaStyle}>
        {wrappedContent}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  systemBarContainer: {
    width: "100%",
  },

  safeArea: {
    width: "100%",
  },

  keyboard: {
    flex: 1,
  },

  content: {
    width: "100%",
  },
});

export default UILayout;
