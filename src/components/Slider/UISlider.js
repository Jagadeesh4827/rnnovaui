import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

// ============================================================
// CONSTANTS
// ============================================================

const UISLIDER_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const UISLIDER_ORIENTATIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

// ============================================================
// COMPONENT
// ============================================================

const UISliderComponent = forwardRef(function UISlider(
  {
    // ------------------------------------------------------
    // VALUE
    // ------------------------------------------------------

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

    // ------------------------------------------------------
    // LABEL
    // ------------------------------------------------------

    label,

    showValue = false,

    valueFormatter,

    showMinMax = false,

    minLabel,
    maxLabel,

    // ------------------------------------------------------
    // SIZE
    // ------------------------------------------------------

    size = "md",

    orientation = "horizontal",

    width = "100%",

    height = 220,

    thumbSize,

    trackHeight,

    // ------------------------------------------------------
    // COLORS
    // ------------------------------------------------------

    minimumTrackColor,

    maximumTrackColor,

    thumbColor,

    // ------------------------------------------------------
    // STATE
    // ------------------------------------------------------

    disabled = false,

    error = false,

    errorText,

    helperText,

    // ------------------------------------------------------
    // STYLES
    // ------------------------------------------------------

    containerStyle,

    labelStyle,

    valueStyle,

    minMaxStyle,

    helperStyle,

    errorStyle,

    trackStyle,

    thumbStyle,

    // ------------------------------------------------------
    // ANIMATION
    // ------------------------------------------------------

    animated = false,

    animationDuration = 180,

    animateThumb = true,

    animateTrack = true,

    animatePress = true,

    pressScale = 1.12,

    // ------------------------------------------------------
    // ACCESSIBILITY
    // ------------------------------------------------------

    accessibilityLabel,

    testID,

    // ------------------------------------------------------
    // REST
    // ------------------------------------------------------

    ...props
  },

  ref,
) {
  // ========================================================
  // THEME
  // ========================================================

  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  // ========================================================
  // SAFE MIN
  // ========================================================

  const safeMin = useMemo(() => {
    const numeric = Number(min);

    if (Number.isFinite(numeric)) {
      return numeric;
    }

    return 0;
  }, [min]);

  // ========================================================
  // SAFE MAX
  // ========================================================

  const safeMax = useMemo(() => {
    const numeric = Number(max);

    if (Number.isFinite(numeric) && numeric > safeMin) {
      return numeric;
    }

    return safeMin + 1;
  }, [max, safeMin]);

  // ========================================================
  // SAFE STEP
  // ========================================================

  const safeStep = useMemo(() => {
    const numeric = Number(step);

    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }

    return 1;
  }, [step]);

  // ========================================================
  // RANGE
  // ========================================================

  const range = safeMax - safeMin;

  // ========================================================
  // SIZE
  // ========================================================

  const safeSize = UISLIDER_SIZES[size] ? size : UISLIDER_SIZES.md;

  // ========================================================
  // ORIENTATION
  // ========================================================

  const safeOrientation = UISLIDER_ORIENTATIONS[orientation]
    ? orientation
    : UISLIDER_ORIENTATIONS.horizontal;

  // ========================================================
  // DIMENSIONS
  // ========================================================

  const dimensions = useMemo(() => getDimensions(safeSize), [safeSize]);

  const resolvedThumbSize = Number.isFinite(Number(thumbSize))
    ? Number(thumbSize)
    : dimensions.thumbSize;

  const resolvedTrackHeight = Number.isFinite(Number(trackHeight))
    ? Number(trackHeight)
    : dimensions.trackHeight;

  // ========================================================
  // NORMALIZE VALUE
  // ========================================================

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

  // ========================================================
  // INITIAL VALUE
  // ========================================================

  const initialValue = normalizeValue(
    value !== undefined ? value : defaultValue,
  );

  // ========================================================
  // INTERNAL VALUE
  // ========================================================

  const [internalValue, setInternalValue] = useState(initialValue);

  // ========================================================
  // CURRENT VALUE
  // ========================================================

  const currentValue =
    value !== undefined ? normalizeValue(value) : internalValue;

  // ========================================================
  // SYNC CONTROLLED VALUE
  // ========================================================

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(normalizeValue(value));
    }
  }, [value, normalizeValue]);

  // ========================================================
  // PERCENTAGE
  // ========================================================

  const percentage = range > 0 ? ((currentValue - safeMin) / range) * 100 : 0;

  // ========================================================
  // TRACK MEASUREMENT
  // ========================================================

  const trackLength = useRef(1);

  const [measuredLength, setMeasuredLength] = useState(1);

  const handleLayout = useCallback(
    (event) => {
      const {
        width: layoutWidth,

        height: layoutHeight,
      } = event.nativeEvent.layout;

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

  // ========================================================
  // ANIMATED VALUES
  // ========================================================

  const thumbProgress = useRef(new Animated.Value(percentage)).current;

  const trackProgress = useRef(new Animated.Value(percentage)).current;

  const thumbScale = useRef(new Animated.Value(1)).current;

  // ========================================================
  // PREVIOUS PERCENTAGE
  // ========================================================

  const previousPercentage = useRef(percentage);

  // ========================================================
  // ANIMATION FUNCTION
  // ========================================================

  const runTiming = useCallback(
    (animatedValue, toValue) => {
      /*
       * Animation disabled.
       *
       * Immediately update the
       * Animated.Value.
       */

      if (!animated) {
        animatedValue.stopAnimation();

        animatedValue.setValue(toValue);

        return;
      }

      Animated.timing(animatedValue, {
        toValue,

        duration: Math.max(0, Number(animationDuration) || 0),

        /*
         * VERY IMPORTANT
         *
         * Keep this false for
         * ALL Animated.Values
         * in this component.
         */

        useNativeDriver: false,
      }).start();
    },

    [animated, animationDuration],
  );

  // ========================================================
  // PROGRAMMATIC ANIMATION
  // ========================================================

  useEffect(() => {
    const nextPercentage =
      range > 0 ? ((currentValue - safeMin) / range) * 100 : 0;

    if (previousPercentage.current === nextPercentage) {
      return;
    }

    previousPercentage.current = nextPercentage;

    // ------------------------------------------------------
    // THUMB
    // ------------------------------------------------------

    if (animated && animateThumb) {
      runTiming(thumbProgress, nextPercentage);
    } else {
      thumbProgress.stopAnimation();

      thumbProgress.setValue(nextPercentage);
    }

    // ------------------------------------------------------
    // TRACK
    // ------------------------------------------------------

    if (animated && animateTrack) {
      runTiming(trackProgress, nextPercentage);
    } else {
      trackProgress.stopAnimation();

      trackProgress.setValue(nextPercentage);
    }
  }, [
    currentValue,

    safeMin,

    range,

    animated,

    animateThumb,

    animateTrack,

    runTiming,

    thumbProgress,

    trackProgress,
  ]);

  // ========================================================
  // COLORS
  // ========================================================

  const resolvedMinimumTrackColor =
    minimumTrackColor || colors.primary || "#FF5A1F";

  const resolvedMaximumTrackColor =
    maximumTrackColor || colors.borderStrong || "#D4D4D4";

  const resolvedThumbColor = thumbColor || colors.primary || "#FF5A1F";

  // ========================================================
  // EMIT CHANGE
  // ========================================================

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

  // ========================================================
  // POSITION TO VALUE
  // ========================================================

  const positionToValue = useCallback(
    (position) => {
      const length = Math.max(trackLength.current, 1);

      let ratio = Number(position) / length;

      ratio = Math.max(0, Math.min(ratio, 1));

      /*
       * Vertical slider:
       *
       * top = max
       * bottom = min
       */

      if (safeOrientation === UISLIDER_ORIENTATIONS.vertical) {
        ratio = 1 - ratio;
      }

      return safeMin + ratio * range;
    },

    [safeOrientation, safeMin, range],
  );

  // ========================================================
  // DRAGGING
  // ========================================================

  const sliding = useRef(false);

  const lastGestureValue = useRef(currentValue);

  // ========================================================
  // UPDATE FROM POSITION
  // ========================================================

  const updateFromPosition = useCallback(
    (position) => {
      const nextValue = positionToValue(position);

      const normalized = emitChange(nextValue);

      lastGestureValue.current = normalized;

      /*
       * Update animation values
       * immediately during drag.
       *
       * We DO NOT run timing on
       * every finger movement.
       */

      const nextPercentage =
        range > 0 ? ((normalized - safeMin) / range) * 100 : 0;

      thumbProgress.stopAnimation();

      trackProgress.stopAnimation();

      thumbProgress.setValue(nextPercentage);

      trackProgress.setValue(nextPercentage);
    },

    [positionToValue, emitChange, range, safeMin, thumbProgress, trackProgress],
  );

  // ========================================================
  // PRESS IN ANIMATION
  // ========================================================

  const animatePressIn = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(thumbScale, {
      toValue: pressScale,

      friction: 7,

      tension: 120,

      /*
       * MUST REMAIN FALSE.
       */

      useNativeDriver: false,
    }).start();
  }, [animated, animatePress, pressScale, thumbScale]);

  // ========================================================
  // PRESS OUT ANIMATION
  // ========================================================

  const animatePressOut = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(thumbScale, {
      toValue: 1,

      friction: 7,

      tension: 120,

      /*
       * MUST REMAIN FALSE.
       */

      useNativeDriver: false,
    }).start();
  }, [animated, animatePress, thumbScale]);

  // ========================================================
  // PAN RESPONDER
  // ========================================================

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

      animatePressIn,

      animatePressOut,

      updateFromPosition,

      onChangeStart,

      onSlidingStart,

      onChangeEnd,

      onSlidingComplete,
    ],
  );

  // ========================================================
  // DISPLAY VALUE
  // ========================================================

  const displayValue = valueFormatter
    ? valueFormatter(currentValue)
    : formatValue(currentValue);

  const displayMin = minLabel ?? formatValue(safeMin);

  const displayMax = maxLabel ?? formatValue(safeMax);

  // ========================================================
  // USABLE LENGTH
  // ========================================================

  const usableLength = Math.max(measuredLength - resolvedThumbSize, 0);

  // ========================================================
  // RENDER
  // ========================================================

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
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* SLIDER */}
      {/* ================================================= */}

      <View
        style={[
          styles.slider,

          safeOrientation === UISLIDER_ORIENTATIONS.horizontal
            ? {
                height: resolvedThumbSize + 12,
              }
            : {
                width: resolvedThumbSize + 12,

                height,
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
          {/* ============================================ */}
          {/* MAX TRACK */}
          {/* ============================================ */}

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

          {/* ============================================ */}
          {/* ACTIVE TRACK */}
          {/* ============================================ */}

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

          {/* ============================================ */}
          {/* THUMB */}
          {/* ============================================ */}

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
                  }
                : {
                    bottom: thumbProgress.interpolate({
                      inputRange: [0, 100],

                      outputRange: [0, usableLength],

                      extrapolate: "clamp",
                    }),
                  },

              thumbStyle,
            ]}
          />
        </View>
      </View>

      {/* ================================================= */}
      {/* MIN / MAX */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* ERROR / HELPER */}
      {/* ================================================= */}

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

// ============================================================
// HELPERS
// ============================================================

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

// ============================================================
// FORMAT VALUE
// ============================================================

function formatValue(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(Number(value).toFixed(2)));
}

// ============================================================
// ROUND
// ============================================================

function roundValue(value) {
  return Number(Number(value).toFixed(10));
}

// ============================================================
// STYLES
// ============================================================

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
});

// ============================================================
// EXPORT
// ============================================================

export const UISlider = memo(UISliderComponent);

UISlider.displayName = "UISlider";

export {
  UISLIDER_SIZES as UISliderSizes,
  UISLIDER_ORIENTATIONS as UISliderOrientations,
};

export default UISlider;
