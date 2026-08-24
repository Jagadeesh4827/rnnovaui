import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const UISLIDER_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const UISLIDER_ORIENTATIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

const UISliderComponent = forwardRef(function UISlider(
  {
    value,
    defaultValue = 0,

    min = 0,
    max = 100,
    step = 1,

    onChange,
    onChangeStart,
    onChangeEnd,

    onSlidingStart,
    onSlidingComplete,

    label,
    showValue = false,
    valueFormatter,

    size = "md",

    orientation = "horizontal",

    disabled = false,

    minimumTrackColor,
    maximumTrackColor,
    thumbColor,

    trackStyle,
    thumbStyle,

    thumbSize,
    trackHeight,

    width = "100%",
    height = 220,

    showMinMax = false,
    minLabel,
    maxLabel,

    error = false,
    errorText,

    helperText,

    labelStyle,
    valueStyle,
    minMaxStyle,
    helperStyle,
    errorStyle,

    containerStyle,

    /*
     * Animation
     */
    animated = false,

    animationDuration = 180,

    animateThumb = true,
    animateTrack = true,
    animatePress = true,

    pressScale = 1.12,

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
   * SAFE NUMERIC VALUES
   * --------------------------------------------------
   */

  const safeMin = useMemo(() => {
    const number = Number(min);

    return Number.isFinite(number) ? number : 0;
  }, [min]);

  const safeMax = useMemo(() => {
    const number = Number(max);

    return Number.isFinite(number) && number > safeMin ? number : safeMin + 1;
  }, [max, safeMin]);

  const safeStep = useMemo(() => {
    const number = Number(step);

    return Number.isFinite(number) && number > 0 ? number : 1;
  }, [step]);

  const range = safeMax - safeMin;

  /*
   * --------------------------------------------------
   * SIZE / ORIENTATION
   * --------------------------------------------------
   */

  const safeSize = UISLIDER_SIZES[size] ? size : UISLIDER_SIZES.md;

  const safeOrientation = UISLIDER_ORIENTATIONS[orientation]
    ? orientation
    : UISLIDER_ORIENTATIONS.horizontal;

  const dimensions = useMemo(() => getDimensions(safeSize), [safeSize]);

  const resolvedThumbSize = Number.isFinite(Number(thumbSize))
    ? Number(thumbSize)
    : dimensions.thumbSize;

  const resolvedTrackHeight = Number.isFinite(Number(trackHeight))
    ? Number(trackHeight)
    : dimensions.trackHeight;

  /*
   * --------------------------------------------------
   * NORMALIZE VALUE
   * --------------------------------------------------
   */

  const normalizeValue = useCallback(
    (input) => {
      const numeric = Number(input);

      if (!Number.isFinite(numeric)) {
        return safeMin;
      }

      const clamped = Math.min(Math.max(numeric, safeMin), safeMax);

      const steps = Math.round((clamped - safeMin) / safeStep);

      const snapped = safeMin + steps * safeStep;

      return roundValue(Math.min(Math.max(snapped, safeMin), safeMax));
    },
    [safeMin, safeMax, safeStep],
  );

  /*
   * --------------------------------------------------
   * VALUE STATE
   * --------------------------------------------------
   */

  const initialValue = normalizeValue(
    value !== undefined ? value : defaultValue,
  );

  const [internalValue, setInternalValue] = useState(initialValue);

  const currentValue =
    value !== undefined ? normalizeValue(value) : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(normalizeValue(value));
    }
  }, [value, normalizeValue]);

  /*
   * --------------------------------------------------
   * MEASUREMENT
   * --------------------------------------------------
   */

  const trackLength = useRef(1);

  const [measuredLength, setMeasuredLength] = useState(1);

  const handleLayout = useCallback(
    (event) => {
      const { width: layoutWidth, height: layoutHeight } =
        event.nativeEvent.layout;

      const length =
        safeOrientation === UISLIDER_ORIENTATIONS.horizontal
          ? layoutWidth
          : layoutHeight;

      const safeLength = Math.max(Number(length) || 1, 1);

      trackLength.current = safeLength;

      setMeasuredLength(safeLength);
    },
    [safeOrientation],
  );

  /*
   * --------------------------------------------------
   * STATIC PERCENTAGE
   * --------------------------------------------------
   */

  const percentage = range > 0 ? ((currentValue - safeMin) / range) * 100 : 0;

  /*
   * --------------------------------------------------
   * ANIMATED VALUES
   * --------------------------------------------------
   *
   * These are percentages rather than pixels.
   * This allows the component to remain responsive
   * when screen size changes.
   */

  const thumbProgress = useRef(new Animated.Value(percentage)).current;

  const trackProgress = useRef(new Animated.Value(percentage)).current;

  const thumbScale = useRef(new Animated.Value(1)).current;

  const previousPercentage = useRef(percentage);

  /*
   * --------------------------------------------------
   * ANIMATION HELPERS
   * --------------------------------------------------
   */

  const animateValue = useCallback(
    (animatedValue, nextPercentage) => {
      if (!animated) {
        animatedValue.setValue(nextPercentage);

        return;
      }

      Animated.timing(animatedValue, {
        toValue: nextPercentage,

        duration: Math.max(0, animationDuration),

        useNativeDriver: false,
      }).start();
    },
    [animated, animationDuration],
  );

  /*
   * --------------------------------------------------
   * PROGRAMMATIC VALUE ANIMATION
   * --------------------------------------------------
   */

  useEffect(() => {
    const nextPercentage =
      range > 0 ? ((currentValue - safeMin) / range) * 100 : 0;

    if (previousPercentage.current === nextPercentage) {
      return;
    }

    previousPercentage.current = nextPercentage;

    if (animated && animateThumb) {
      animateValue(thumbProgress, nextPercentage);
    } else {
      thumbProgress.setValue(nextPercentage);
    }

    if (animated && animateTrack) {
      animateValue(trackProgress, nextPercentage);
    } else {
      trackProgress.setValue(nextPercentage);
    }
  }, [
    currentValue,
    range,
    safeMin,
    animated,
    animateThumb,
    animateTrack,
    animateValue,
    thumbProgress,
    trackProgress,
  ]);

  /*
   * --------------------------------------------------
   * COLORS
   * --------------------------------------------------
   */

  const resolvedMinimumTrackColor =
    minimumTrackColor || colors.primary || "#FF5A1F";

  const resolvedMaximumTrackColor =
    maximumTrackColor || colors.borderStrong || "#D4D4D4";

  const resolvedThumbColor = thumbColor || colors.primary || "#FF5A1F";

  /*
   * --------------------------------------------------
   * CHANGE
   * --------------------------------------------------
   */

  const emitChange = useCallback(
    (nextValue) => {
      const normalized = normalizeValue(nextValue);

      if (value === undefined) {
        setInternalValue(normalized);
      }

      onChange?.(normalized);

      return normalized;
    },
    [normalizeValue, value, onChange],
  );

  /*
   * --------------------------------------------------
   * POSITION -> VALUE
   * --------------------------------------------------
   */

  const positionToValue = useCallback(
    (position) => {
      const length = Math.max(trackLength.current, 1);

      let ratio = Number(position) / length;

      ratio = Math.max(0, Math.min(ratio, 1));

      if (safeOrientation === UISLIDER_ORIENTATIONS.vertical) {
        ratio = 1 - ratio;
      }

      return safeMin + ratio * range;
    },
    [safeOrientation, safeMin, range],
  );

  /*
   * --------------------------------------------------
   * GESTURE UPDATE
   * --------------------------------------------------
   */

  const sliding = useRef(false);

  const lastGestureValue = useRef(currentValue);

  const updateFromPosition = useCallback(
    (position) => {
      const nextValue = positionToValue(position);

      const normalized = emitChange(nextValue);

      lastGestureValue.current = normalized;
    },
    [positionToValue, emitChange],
  );

  /*
   * --------------------------------------------------
   * PRESS ANIMATION
   * --------------------------------------------------
   */

  const animatePressIn = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(thumbScale, {
      toValue: pressScale,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [animated, animatePress, pressScale, thumbScale]);

  const animatePressOut = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(thumbScale, {
      toValue: 1,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [animated, animatePress, thumbScale]);

  /*
   * --------------------------------------------------
   * PAN RESPONDER
   * --------------------------------------------------
   */

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,

        onMoveShouldSetPanResponder: () => !disabled,

        onPanResponderGrant: (event) => {
          if (disabled) {
            return;
          }

          sliding.current = true;

          lastGestureValue.current = currentValue;

          animatePressIn();

          onChangeStart?.(currentValue);

          onSlidingStart?.(currentValue);

          const position =
            safeOrientation === UISLIDER_ORIENTATIONS.horizontal
              ? event.nativeEvent.locationX
              : event.nativeEvent.locationY;

          updateFromPosition(position);
        },

        onPanResponderMove: (event) => {
          if (disabled) {
            return;
          }

          const position =
            safeOrientation === UISLIDER_ORIENTATIONS.horizontal
              ? event.nativeEvent.locationX
              : event.nativeEvent.locationY;

          updateFromPosition(position);
        },

        onPanResponderRelease: () => {
          if (!sliding.current) {
            return;
          }

          sliding.current = false;

          animatePressOut();

          const finalValue = lastGestureValue.current;

          onChangeEnd?.(finalValue);

          onSlidingComplete?.(finalValue);
        },

        onPanResponderTerminate: () => {
          if (!sliding.current) {
            return;
          }

          sliding.current = false;

          animatePressOut();

          const finalValue = lastGestureValue.current;

          onChangeEnd?.(finalValue);

          onSlidingComplete?.(finalValue);
        },
      }),
    [
      disabled,
      currentValue,
      safeOrientation,
      updateFromPosition,
      animatePressIn,
      animatePressOut,
      onChangeStart,
      onSlidingStart,
      onChangeEnd,
      onSlidingComplete,
    ],
  );

  /*
   * --------------------------------------------------
   * ACCESSIBILITY ACTIONS
   * --------------------------------------------------
   */

  const increase = useCallback(() => {
    if (disabled) {
      return;
    }

    emitChange(currentValue + safeStep);
  }, [disabled, currentValue, safeStep, emitChange]);

  const decrease = useCallback(() => {
    if (disabled) {
      return;
    }

    emitChange(currentValue - safeStep);
  }, [disabled, currentValue, safeStep, emitChange]);

  /*
   * --------------------------------------------------
   * DISPLAY
   * --------------------------------------------------
   */

  const displayValue = valueFormatter
    ? valueFormatter(currentValue)
    : formatValue(currentValue);

  const displayMin = minLabel ?? formatValue(safeMin);

  const displayMax = maxLabel ?? formatValue(safeMax);

  /*
   * --------------------------------------------------
   * ACTIVE TRACK LENGTH
   * --------------------------------------------------
   */

  const usableLength = Math.max(measuredLength - resolvedThumbSize, 0);

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <View
      {...props}
      ref={ref}
      testID={testID}
      style={[
        styles.container,

        {
          width:
            safeOrientation === UISLIDER_ORIENTATIONS.horizontal
              ? width
              : resolvedThumbSize + 24,

          height:
            safeOrientation === UISLIDER_ORIENTATIONS.vertical
              ? height
              : undefined,
        },

        containerStyle,
      ]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityValue={{
        min: safeMin,
        max: safeMax,
        now: currentValue,
      }}
    >
      {label || showValue ? (
        <View style={styles.header}>
          {label ? (
            <Text
              style={[
                styles.label,

                {
                  color: disabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.text || "#111111",
                },

                labelStyle,
              ]}
            >
              {label}
            </Text>
          ) : (
            <View />
          )}

          {showValue ? (
            <Text
              style={[
                styles.value,

                {
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
          styles.slider,

          safeOrientation === UISLIDER_ORIENTATIONS.horizontal
            ? {
                height: resolvedThumbSize + 12,
              }
            : {
                width: resolvedThumbSize + 12,

                height: height,
              },
        ]}
      >
        <View
          onLayout={handleLayout}
          {...panResponder.panHandlers}
          style={[
            styles.gestureArea,

            safeOrientation === UISLIDER_ORIENTATIONS.horizontal
              ? {
                  width: "100%",

                  height: resolvedThumbSize + 12,
                }
              : {
                  width: resolvedThumbSize + 12,

                  height: "100%",
                },
          ]}
        >
          {/*
           * MAXIMUM TRACK
           */}
          <View
            pointerEvents="none"
            style={[
              styles.track,

              {
                backgroundColor: resolvedMaximumTrackColor,

                opacity: disabled ? 0.45 : 1,
              },

              safeOrientation === UISLIDER_ORIENTATIONS.horizontal
                ? {
                    left: resolvedThumbSize / 2,

                    right: resolvedThumbSize / 2,

                    height: resolvedTrackHeight,

                    top: (resolvedThumbSize + 12 - resolvedTrackHeight) / 2,
                  }
                : {
                    top: resolvedThumbSize / 2,

                    bottom: resolvedThumbSize / 2,

                    width: resolvedTrackHeight,

                    left: (resolvedThumbSize + 12 - resolvedTrackHeight) / 2,
                  },

              trackStyle,
            ]}
          />

          {/*
           * ACTIVE TRACK
           *
           * Animated width/height uses
           * native Animated interpolation.
           */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeTrack,

              {
                backgroundColor: resolvedMinimumTrackColor,

                opacity: disabled ? 0.45 : 1,
              },

              safeOrientation === UISLIDER_ORIENTATIONS.horizontal
                ? {
                    left: resolvedThumbSize / 2,

                    width: trackProgress.interpolate({
                      inputRange: [0, 100],

                      outputRange: [0, usableLength],

                      extrapolate: "clamp",
                    }),

                    height: resolvedTrackHeight,

                    top: (resolvedThumbSize + 12 - resolvedTrackHeight) / 2,
                  }
                : {
                    bottom: resolvedThumbSize / 2,

                    height: trackProgress.interpolate({
                      inputRange: [0, 100],

                      outputRange: [0, usableLength],

                      extrapolate: "clamp",
                    }),

                    width: resolvedTrackHeight,

                    left: (resolvedThumbSize + 12 - resolvedTrackHeight) / 2,
                  },
            ]}
          />

          {/*
           * THUMB
           */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,

              {
                width: resolvedThumbSize,

                height: resolvedThumbSize,

                borderRadius: resolvedThumbSize / 2,

                backgroundColor: resolvedThumbColor,

                opacity: disabled ? 0.45 : 1,

                transform: [
                  {
                    scale: thumbScale,
                  },
                ],
              },

              safeOrientation === UISLIDER_ORIENTATIONS.horizontal
                ? {
                    left: thumbProgress.interpolate({
                      inputRange: [0, 100],

                      outputRange: [0, usableLength],

                      extrapolate: "clamp",
                    }),

                    marginLeft: resolvedThumbSize / 2 - resolvedThumbSize / 2,
                  }
                : {
                    bottom: thumbProgress.interpolate({
                      inputRange: [0, 100],

                      outputRange: [0, usableLength],

                      extrapolate: "clamp",
                    }),

                    marginBottom: resolvedThumbSize / 2 - resolvedThumbSize / 2,
                  },

              thumbStyle,
            ]}
          />
        </View>
      </View>

      {showMinMax ? (
        <View
          style={[
            styles.minMaxRow,

            safeOrientation === UISLIDER_ORIENTATIONS.vertical
              ? styles.verticalMinMax
              : null,
          ]}
        >
          <Text
            style={[
              styles.minMaxText,

              {
                color: colors.textMuted || "#737373",
              },

              minMaxStyle,
            ]}
          >
            {displayMin}
          </Text>

          <Text
            style={[
              styles.minMaxText,

              {
                color: colors.textMuted || "#737373",
              },

              minMaxStyle,
            ]}
          >
            {displayMax}
          </Text>
        </View>
      ) : null}

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

      {/*
       * Accessibility controls.
       */}
      {!disabled ? (
        <View style={styles.accessibilityActions}>
          <Pressable
            onPress={decrease}
            accessibilityRole="button"
            accessibilityLabel="Decrease value"
          />

          <Pressable
            onPress={increase}
            accessibilityRole="button"
            accessibilityLabel="Increase value"
          />
        </View>
      ) : null}
    </View>
  );
});

function getDimensions(size) {
  switch (size) {
    case UISLIDER_SIZES.sm:
      return {
        thumbSize: 18,
        trackHeight: 4,
      };

    case UISLIDER_SIZES.lg:
      return {
        thumbSize: 28,
        trackHeight: 8,
      };

    case UISLIDER_SIZES.md:
    default:
      return {
        thumbSize: 22,
        trackHeight: 6,
      };
  }
}

function formatValue(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(Number(value).toFixed(2)));
}

function roundValue(value) {
  return Number(Number(value).toFixed(10));
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 8,
  },

  label: {
    fontSize: 14,

    lineHeight: 19,

    fontWeight: "600",

    includeFontPadding: false,
  },

  value: {
    fontSize: 13,

    lineHeight: 18,

    fontWeight: "600",

    includeFontPadding: false,
  },

  slider: {
    justifyContent: "center",
  },

  gestureArea: {
    position: "relative",

    justifyContent: "center",
  },

  track: {
    position: "absolute",

    borderRadius: 999,
  },

  activeTrack: {
    position: "absolute",

    borderRadius: 999,
  },

  thumb: {
    position: "absolute",

    elevation: 3,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,

      height: 2,
    },

    shadowOpacity: 0.2,

    shadowRadius: 3,
  },

  minMaxRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 5,
  },

  verticalMinMax: {
    flexDirection: "column",

    alignItems: "center",
  },

  minMaxText: {
    fontSize: 11,

    lineHeight: 16,

    includeFontPadding: false,
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },

  accessibilityActions: {
    position: "absolute",

    width: 1,

    height: 1,

    opacity: 0,

    overflow: "hidden",
  },
});

export const UISlider = memo(UISliderComponent);

UISlider.displayName = "UISlider";

export {
  UISLIDER_SIZES as UISliderSizes,
  UISLIDER_ORIENTATIONS as UISliderOrientations,
};

export default UISlider;
