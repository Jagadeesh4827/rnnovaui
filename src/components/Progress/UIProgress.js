import React, { forwardRef, memo, useEffect, useMemo, useRef } from "react";

import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const UI_PROGRESS_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const UI_PROGRESS_ORIENTATIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

const UI_PROGRESS_VARIANTS = {
  default: "default",
  rounded: "rounded",
  square: "square",
};

const UI_PROGRESS_STATUSES = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

const SIZE_CONFIG = {
  sm: {
    thickness: 4,
    radius: 2,
    labelSize: 12,
  },

  md: {
    thickness: 8,
    radius: 4,
    labelSize: 13,
  },

  lg: {
    thickness: 12,
    radius: 6,
    labelSize: 14,
  },
};

const UIProgressComponent = forwardRef(function UIProgress(
  {
    value = 0,

    min = 0,
    max = 100,

    defaultValue,

    label,
    showValue = false,

    valueFormatter,

    size = "md",

    orientation = "horizontal",

    variant = "rounded",

    status = "primary",

    disabled = false,

    indeterminate = false,

    animated = false,

    animationDuration = 400,

    indeterminateDuration = 1200,

    minimumTrackColor,
    maximumTrackColor,

    height,
    width = "100%",

    thickness,

    labelStyle,
    valueStyle,

    trackStyle,
    progressStyle,

    containerStyle,

    error = false,
    errorText,

    helperText,

    helperStyle,
    errorStyle,

    testID,
    accessibilityLabel,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  /*
   * --------------------------------------------------
   * SAFE RANGE
   * --------------------------------------------------
   */

  const safeMin = Number.isFinite(Number(min)) ? Number(min) : 0;

  const safeMax =
    Number.isFinite(Number(max)) && Number(max) > safeMin
      ? Number(max)
      : safeMin + 100;

  const range = safeMax - safeMin;

  /*
   * --------------------------------------------------
   * SIZE
   * --------------------------------------------------
   */

  const safeSize = UI_PROGRESS_SIZES[size] ? size : UI_PROGRESS_SIZES.md;

  const safeOrientation = UI_PROGRESS_ORIENTATIONS[orientation]
    ? orientation
    : UI_PROGRESS_ORIENTATIONS.horizontal;

  const safeVariant = UI_PROGRESS_VARIANTS[variant]
    ? variant
    : UI_PROGRESS_VARIANTS.rounded;

  const safeStatus = UI_PROGRESS_STATUSES[status]
    ? status
    : UI_PROGRESS_STATUSES.primary;

  const config = SIZE_CONFIG[safeSize];

  const resolvedThickness = Number.isFinite(Number(thickness))
    ? Number(thickness)
    : config.thickness;

  /*
   * --------------------------------------------------
   * VALUE
   * --------------------------------------------------
   */

  const numericValue = Number(value);

  const safeValue = Number.isFinite(numericValue) ? numericValue : safeMin;

  const clampedValue = Math.min(Math.max(safeValue, safeMin), safeMax);

  const percentage = range > 0 ? ((clampedValue - safeMin) / range) * 100 : 0;

  /*
   * --------------------------------------------------
   * ANIMATION
   * --------------------------------------------------
   */

  const progress = useRef(new Animated.Value(percentage)).current;

  const indeterminateAnimation = useRef(new Animated.Value(0)).current;

  /*
   * --------------------------------------------------
   * DETERMINATE ANIMATION
   * --------------------------------------------------
   */

  useEffect(() => {
    if (indeterminate) {
      return;
    }

    if (!animated) {
      progress.setValue(percentage);

      return;
    }

    Animated.timing(progress, {
      toValue: percentage,

      duration: Math.max(0, animationDuration),

      easing: Easing.out(Easing.cubic),

      useNativeDriver: false,
    }).start();
  }, [percentage, animated, animationDuration, indeterminate, progress]);

  /*
   * --------------------------------------------------
   * INDETERMINATE ANIMATION
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!indeterminate) {
      indeterminateAnimation.stopAnimation();

      indeterminateAnimation.setValue(0);

      return;
    }

    const duration = Math.max(300, indeterminateDuration);

    const animation = Animated.loop(
      Animated.timing(indeterminateAnimation, {
        toValue: 1,

        duration,

        easing: Easing.linear,

        useNativeDriver: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [indeterminate, indeterminateDuration, indeterminateAnimation]);

  /*
   * --------------------------------------------------
   * COLORS
   * --------------------------------------------------
   */

  const statusColors = useMemo(
    () => ({
      primary: colors.primary || "#FF5A1F",

      success: colors.success || "#16A34A",

      warning: colors.warning || "#D97706",

      danger: colors.danger || "#DC2626",

      info: colors.info || "#2563EB",
    }),
    [colors],
  );

  const resolvedProgressColor =
    minimumTrackColor || statusColors[safeStatus] || statusColors.primary;

  const resolvedTrackColor =
    maximumTrackColor || colors.surfaceSecondary || "#E5E5E5";

  /*
   * --------------------------------------------------
   * RADIUS
   * --------------------------------------------------
   */

  const resolvedRadius = getRadius(
    safeVariant,
    resolvedThickness,
    config.radius,
  );

  /*
   * --------------------------------------------------
   * DISPLAY VALUE
   * --------------------------------------------------
   */

  const displayValue = valueFormatter
    ? valueFormatter(clampedValue, percentage)
    : `${Math.round(percentage)}%`;

  /*
   * --------------------------------------------------
   * DETERMINATE STYLE
   * --------------------------------------------------
   */

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],

    outputRange: ["0%", "100%"],

    extrapolate: "clamp",
  });

  /*
   * --------------------------------------------------
   * INDETERMINATE STYLE
   * --------------------------------------------------
   */

  const indeterminateStart = indeterminateAnimation.interpolate({
    inputRange: [0, 1],

    outputRange: ["-40%", "100%"],
  });

  /*
   * --------------------------------------------------
   * RENDER TRACK
   * --------------------------------------------------
   */

  const isVertical = safeOrientation === UI_PROGRESS_ORIENTATIONS.vertical;

  return (
    <View
      {...props}
      ref={ref}
      testID={testID}
      style={[
        styles.container,

        isVertical
          ? {
              width: width === "100%" ? resolvedThickness : width,

              height: height || 220,
            }
          : {
              width,

              minHeight: resolvedThickness,
            },

        containerStyle,
      ]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityValue={
        indeterminate
          ? undefined
          : {
              min: safeMin,
              max: safeMax,
              now: clampedValue,
            }
      }
    >
      {label || showValue ? (
        <View
          style={[styles.header, isVertical ? styles.verticalHeader : null]}
        >
          {label ? (
            <Text
              style={[
                styles.label,

                {
                  fontSize: config.labelSize,

                  color: disabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.text || "#111111",
                },

                labelStyle,
              ]}
            >
              {label}
            </Text>
          ) : null}

          {showValue && !indeterminate ? (
            <Text
              style={[
                styles.value,

                {
                  fontSize: config.labelSize,

                  color: disabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.text || "#111111",
                },

                valueStyle,
              ]}
            >
              {displayValue}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.track,

          {
            backgroundColor: resolvedTrackColor,

            borderRadius: resolvedRadius,

            opacity: disabled ? 0.5 : 1,
          },

          isVertical
            ? {
                width: resolvedThickness,

                height: height || 220,
              }
            : {
                width: "100%",

                height: resolvedThickness,
              },

          trackStyle,
        ]}
      >
        {indeterminate ? (
          <Animated.View
            style={[
              styles.progress,

              {
                backgroundColor: resolvedProgressColor,

                borderRadius: resolvedRadius,

                opacity: disabled ? 0.5 : 1,
              },

              isVertical
                ? {
                    width: resolvedThickness,

                    height: "40%",

                    position: "absolute",

                    bottom: indeterminateAnimation.interpolate({
                      inputRange: [0, 1],

                      outputRange: ["-40%", "100%"],
                    }),
                  }
                : {
                    width: "40%",

                    height: resolvedThickness,

                    position: "absolute",

                    left: indeterminateStart,
                  },

              progressStyle,
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.progress,

              {
                backgroundColor: resolvedProgressColor,

                borderRadius: resolvedRadius,

                opacity: disabled ? 0.5 : 1,
              },

              isVertical
                ? {
                    width: resolvedThickness,

                    height: progressWidth,

                    position: "absolute",

                    bottom: 0,
                  }
                : {
                    width: progressWidth,

                    height: resolvedThickness,
                  },

              progressStyle,
            ]}
          />
        )}
      </View>

      {error || errorText ? (
        <Text
          style={[
            styles.message,

            {
              color: colors.danger || "#DC2626",
            },

            errorStyle,
          ]}
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            styles.message,

            {
              color: colors.textSecondary || "#525252",
            },

            helperStyle,
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

function getRadius(variant, thickness, defaultRadius) {
  if (variant === UI_PROGRESS_VARIANTS.square) {
    return 0;
  }

  if (variant === UI_PROGRESS_VARIANTS.default) {
    return Math.min(defaultRadius, 4);
  }

  return Math.max(thickness / 2, defaultRadius);
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 7,
  },

  verticalHeader: {
    flexDirection: "column",

    alignItems: "center",
  },

  label: {
    fontWeight: "600",

    lineHeight: 19,

    includeFontPadding: false,
  },

  value: {
    fontWeight: "600",

    lineHeight: 18,

    includeFontPadding: false,
  },

  track: {
    overflow: "hidden",

    position: "relative",
  },

  progress: {
    overflow: "hidden",
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UIProgress = memo(UIProgressComponent);

UIProgress.displayName = "UIProgress";

export {
  UI_PROGRESS_SIZES as UIProgressSizes,
  UI_PROGRESS_ORIENTATIONS as UIProgressOrientations,
  UI_PROGRESS_VARIANTS as UIProgressVariants,
  UI_PROGRESS_STATUSES as UIProgressStatuses,
};

export default UIProgress;
