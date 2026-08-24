import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const UI_SWITCH_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SIZE_CONFIG = {
  sm: {
    width: 38,
    height: 22,
    thumb: 16,
    padding: 3,
    labelSize: 13,
    descriptionSize: 11,
  },

  md: {
    width: 48,
    height: 28,
    thumb: 22,
    padding: 3,
    labelSize: 14,
    descriptionSize: 12,
  },

  lg: {
    width: 58,
    height: 34,
    thumb: 28,
    padding: 3,
    labelSize: 16,
    descriptionSize: 13,
  },
};

const UISwitchComponent = forwardRef(function UISwitch(
  {
    value,
    defaultValue = false,

    onChange,

    label,
    description,

    size = "md",

    disabled = false,
    loading = false,

    error = false,
    errorText,

    helperText,

    activeColor,
    inactiveColor,
    thumbColor,

    animated = true,
    animationDuration = 180,

    animatePress = true,
    pressScale = 0.92,

    labelPosition = "right",

    containerStyle,
    switchStyle,
    labelStyle,
    descriptionStyle,
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

  const config = SIZE_CONFIG[UI_SWITCH_SIZES[size] ? size : UI_SWITCH_SIZES.md];

  /*
   * --------------------------------------------------
   * CONTROLLED / UNCONTROLLED
   * --------------------------------------------------
   */

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(Boolean(defaultValue));

  const checked = isControlled ? Boolean(value) : internalValue;

  /*
   * --------------------------------------------------
   * ANIMATION
   * --------------------------------------------------
   */

  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  const pressScaleValue = useRef(new Animated.Value(1)).current;

  /*
   * --------------------------------------------------
   * VALUE ANIMATION
   * --------------------------------------------------
   */

  useEffect(() => {
    const target = checked ? 1 : 0;

    if (!animated) {
      progress.setValue(target);

      return;
    }

    Animated.timing(progress, {
      toValue: target,

      duration: Math.max(0, animationDuration),

      useNativeDriver: true,
    }).start();
  }, [checked, animated, animationDuration, progress]);

  /*
   * --------------------------------------------------
   * PRESS ANIMATION
   * --------------------------------------------------
   */

  const animatePressIn = useCallback(() => {
    if (!animated || !animatePress || disabled || loading) {
      return;
    }

    Animated.spring(pressScaleValue, {
      toValue: pressScale,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [animated, animatePress, disabled, loading, pressScale, pressScaleValue]);

  const animatePressOut = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(pressScaleValue, {
      toValue: 1,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [animated, animatePress, pressScaleValue]);

  /*
   * --------------------------------------------------
   * CHANGE
   * --------------------------------------------------
   */

  const handleChange = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    const nextValue = !checked;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }, [disabled, loading, checked, isControlled, onChange]);

  /*
   * --------------------------------------------------
   * COLORS
   * --------------------------------------------------
   */

  const resolvedActiveColor = activeColor || colors.primary || "#FF5A1F";

  const resolvedInactiveColor =
    inactiveColor || colors.borderStrong || "#D4D4D4";

  const resolvedThumbColor = thumbColor || colors.background || "#FFFFFF";

  const disabledOpacity = disabled ? 0.5 : 1;

  /*
   * --------------------------------------------------
   * THUMB MOVEMENT
   * --------------------------------------------------
   */

  const travel = config.width - config.thumb - config.padding * 2;

  const translateX = progress.interpolate({
    inputRange: [0, 1],

    outputRange: [0, travel],

    extrapolate: "clamp",
  });

  /*
   * --------------------------------------------------
   * SWITCH
   * --------------------------------------------------
   */

  const switchElement = (
    <Animated.View
      style={[
        {
          width: config.width,

          height: config.height,

          borderRadius: config.height / 2,

          backgroundColor: checked
            ? resolvedActiveColor
            : resolvedInactiveColor,

          opacity: disabledOpacity,

          transform: [
            {
              scale: pressScaleValue,
            },
          ],
        },

        switchStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,

          {
            width: config.thumb,

            height: config.thumb,

            borderRadius: config.thumb / 2,

            backgroundColor: resolvedThumbColor,

            top: config.padding,

            left: config.padding,

            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={resolvedActiveColor} />
        ) : null}
      </Animated.View>
    </Animated.View>
  );

  /*
   * --------------------------------------------------
   * LABEL CONTENT
   * --------------------------------------------------
   */

  const textContent =
    label || description ? (
      <View
        style={[
          styles.textContainer,

          labelPosition === "left" ? styles.textLeft : styles.textRight,
        ]}
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

        {description ? (
          <Text
            style={[
              styles.description,

              {
                fontSize: config.descriptionSize,

                color: disabled
                  ? colors.textDisabled || "#A3A3A3"
                  : colors.textSecondary || "#525252",
              },

              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    ) : null;

  /*
   * --------------------------------------------------
   * MAIN
   * --------------------------------------------------
   */

  return (
    <View
      ref={ref}
      testID={testID}
      style={[styles.container, containerStyle]}
      {...props}
    >
      <Pressable
        disabled={disabled || loading}
        onPress={handleChange}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{
          checked,
          disabled: disabled || loading,
        }}
        style={[
          styles.pressable,

          labelPosition === "left" ? styles.rowReverse : styles.row,
        ]}
      >
        {labelPosition === "left" ? (
          <>
            {textContent}
            {switchElement}
          </>
        ) : (
          <>
            {switchElement}
            {textContent}
          </>
        )}
      </Pressable>

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

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  pressable: {
    alignItems: "center",

    minHeight: 36,
  },

  row: {
    flexDirection: "row",
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  textContainer: {
    flex: 1,

    minWidth: 0,
  },

  textRight: {
    marginLeft: 10,
  },

  textLeft: {
    marginRight: 10,
  },

  label: {
    fontWeight: "600",

    lineHeight: 20,

    includeFontPadding: false,
  },

  description: {
    marginTop: 3,

    lineHeight: 17,

    includeFontPadding: false,
  },

  thumb: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",

    elevation: 2,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,

      height: 1,
    },

    shadowOpacity: 0.2,

    shadowRadius: 2,
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UISwitch = memo(UISwitchComponent);

UISwitch.displayName = "UISwitch";

export { UI_SWITCH_SIZES as UISwitchSizes };

export default UISwitch;
