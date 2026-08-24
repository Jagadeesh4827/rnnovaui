import React, { forwardRef, memo, useEffect, useRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const UI_SPINNER_SIZES = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const UI_SPINNER_LABEL_POSITIONS = {
  right: "right",
  left: "left",
  top: "top",
  bottom: "bottom",
};

const SIZE_CONFIG = {
  xs: {
    size: 14,
    textSize: 11,
  },

  sm: {
    size: 18,
    textSize: 12,
  },

  md: {
    size: 24,
    textSize: 13,
  },

  lg: {
    size: 36,
    textSize: 14,
  },

  xl: {
    size: 48,
    textSize: 16,
  },
};

const UISpinnerComponent = forwardRef(function UISpinner(
  {
    size = "md",

    color,

    trackColor,

    thickness,

    label,

    labelPosition = "right",

    animated = true,

    speed = 1,

    duration = 900,

    overlay = false,

    fullscreen = false,

    visible = true,

    disabled = false,

    labelStyle,

    containerStyle,

    spinnerStyle,

    overlayStyle,

    testID,

    accessibilityLabel,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  if (!visible) {
    return null;
  }

  const safeSize = UI_SPINNER_SIZES[size] ? size : UI_SPINNER_SIZES.md;

  const safeLabelPosition = UI_SPINNER_LABEL_POSITIONS[labelPosition]
    ? labelPosition
    : UI_SPINNER_LABEL_POSITIONS.right;

  const config = SIZE_CONFIG[safeSize];

  const resolvedColor = color || colors.primary || "#FF5A1F";

  const resolvedTrackColor = trackColor || colors.border || "#E5E5E5";

  const resolvedLabelColor = colors.textSecondary || "#525252";

  /*
   * ------------------------------------------------
   * ROTATION
   * ------------------------------------------------
   */

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated || disabled) {
      rotation.stopAnimation();
      rotation.setValue(0);

      return;
    }

    const safeDuration = Math.max(
      100,
      Number(duration) / Math.max(Number(speed) || 1, 0.1),
    );

    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,

        duration: safeDuration,

        easing: Easing.linear,

        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animated, disabled, duration, speed, rotation]);

  /*
   * ------------------------------------------------
   * ROTATION STYLE
   * ------------------------------------------------
   */

  const rotate = rotation.interpolate({
    inputRange: [0, 1],

    outputRange: ["0deg", "360deg"],
  });

  /*
   * ------------------------------------------------
   * SPINNER
   * ------------------------------------------------
   */

  const spinner = (
    <View
      style={[
        styles.spinner,
        {
          opacity: disabled ? 0.5 : 1,
        },
        spinnerStyle,
      ]}
    >
      <ActivityIndicator size={config.size} color={resolvedColor} />
    </View>
  );

  /*
   * ------------------------------------------------
   * LABEL
   * ------------------------------------------------
   */

  const labelElement = label ? (
    <Text
      style={[
        styles.label,

        {
          fontSize: config.textSize,

          color: resolvedLabelColor,

          opacity: disabled ? 0.5 : 1,
        },

        labelStyle,
      ]}
    >
      {label}
    </Text>
  ) : null;

  /*
   * ------------------------------------------------
   * CONTENT
   * ------------------------------------------------
   */

  const content = label ? (
    <View style={[styles.content, getLabelContainerStyle(safeLabelPosition)]}>
      {safeLabelPosition === "left" || safeLabelPosition === "top"
        ? labelElement
        : null}

      {spinner}

      {safeLabelPosition === "right" || safeLabelPosition === "bottom"
        ? labelElement
        : null}
    </View>
  ) : (
    spinner
  );

  /*
   * ------------------------------------------------
   * OVERLAY
   * ------------------------------------------------
   */

  if (overlay || fullscreen) {
    return (
      <View
        {...props}
        ref={ref}
        testID={testID}
        style={[
          styles.overlay,

          fullscreen ? styles.fullscreen : null,

          {
            backgroundColor: colors.overlay || "rgba(0,0,0,0.45)",
          },

          overlayStyle,

          containerStyle,
        ]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel || label || "Loading"}
      >
        {content}
      </View>
    );
  }

  /*
   * ------------------------------------------------
   * NORMAL
   * ------------------------------------------------
   */

  return (
    <View
      {...props}
      ref={ref}
      testID={testID}
      style={[styles.container, containerStyle]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label || "Loading"}
    >
      {content}
    </View>
  );
});

function getLabelContainerStyle(position) {
  switch (position) {
    case "left":
      return styles.rowReverse;

    case "top":
      return styles.columnReverse;

    case "bottom":
      return styles.column;

    case "right":
    default:
      return styles.row;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    justifyContent: "center",
  },

  content: {
    alignItems: "center",

    justifyContent: "center",
  },

  row: {
    flexDirection: "row",

    gap: 8,
  },

  rowReverse: {
    flexDirection: "row-reverse",

    gap: 8,
  },

  column: {
    flexDirection: "column",

    gap: 8,
  },

  columnReverse: {
    flexDirection: "column-reverse",

    gap: 8,
  },

  spinner: {
    alignItems: "center",

    justifyContent: "center",
  },

  label: {
    includeFontPadding: false,

    lineHeight: 18,

    fontWeight: "500",
  },

  overlay: {
    position: "absolute",

    top: 0,

    right: 0,

    bottom: 0,

    left: 0,

    zIndex: 9999,

    alignItems: "center",

    justifyContent: "center",
  },

  fullscreen: {
    position: "absolute",

    zIndex: 99999,
  },
});

export const UISpinner = memo(UISpinnerComponent);

UISpinner.displayName = "UISpinner";

export {
  UI_SPINNER_SIZES as UISpinnerSizes,
  UI_SPINNER_LABEL_POSITIONS as UISpinnerLabelPositions,
};

export default UISpinner;
