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

  /*
   * ----------------------------------------
   * SIZE
   * ----------------------------------------
   */

  const config = SIZE_CONFIG[UI_SWITCH_SIZES[size] ? size : UI_SWITCH_SIZES.md];

  /*
   * ----------------------------------------
   * CONTROLLED / UNCONTROLLED
   * ----------------------------------------
   */

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(Boolean(defaultValue));

  const checked = controlled ? Boolean(value) : internalValue;

  /*
   * ----------------------------------------
   * ANIMATION VALUES
   * ----------------------------------------
   */

  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  const scale = useRef(new Animated.Value(1)).current;

  /*
   * ----------------------------------------
   * COLORS
   * ----------------------------------------
   */

  const resolvedActiveColor = activeColor || colors.primary || "#FF5A1F";

  const resolvedInactiveColor =
    inactiveColor || colors.borderStrong || "#D4D4D4";

  const resolvedThumbColor = thumbColor || colors.background || "#FFFFFF";

  /*
   * ----------------------------------------
   * THUMB TRAVEL
   * ----------------------------------------
   */

  const travel = config.width - config.thumb - config.padding * 2;

  /*
   * ----------------------------------------
   * VALUE ANIMATION
   * ----------------------------------------
   */

  useEffect(() => {
    const nextValue = checked ? 1 : 0;

    if (!animated) {
      progress.setValue(nextValue);

      return;
    }

    Animated.timing(progress, {
      toValue: nextValue,

      duration: Math.max(0, animationDuration),

      useNativeDriver: true,
    }).start();
  }, [checked, animated, animationDuration, progress]);

  /*
   * ----------------------------------------
   * PRESS ANIMATION
   * ----------------------------------------
   */

  const handlePressIn = useCallback(() => {
    if (disabled || loading || !animated || !animatePress) {
      return;
    }

    Animated.spring(scale, {
      toValue: pressScale,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [disabled, loading, animated, animatePress, pressScale, scale]);

  const handlePressOut = useCallback(() => {
    if (!animated || !animatePress) {
      return;
    }

    Animated.spring(scale, {
      toValue: 1,

      friction: 7,

      tension: 120,

      useNativeDriver: true,
    }).start();
  }, [animated, animatePress, scale]);

  /*
   * ----------------------------------------
   * TOGGLE
   * ----------------------------------------
   */

  const handleToggle = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    const nextValue = !checked;

    /*
     * Uncontrolled mode
     */
    if (!controlled) {
      setInternalValue(nextValue);
    }

    /*
     * Controlled mode
     */
    if (onChange) {
      onChange(nextValue);
    }
  }, [disabled, loading, checked, controlled, onChange]);

  /*
   * ----------------------------------------
   * THUMB POSITION
   * ----------------------------------------
   */

  const translateX = progress.interpolate({
    inputRange: [0, 1],

    outputRange: [0, travel],

    extrapolate: "clamp",
  });

  /*
   * ----------------------------------------
   * TEXT
   * ----------------------------------------
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
   * ----------------------------------------
   * SWITCH VISUAL
   * ----------------------------------------
   */

  const switchElement = (
    <Pressable
      testID={testID ? `${testID}-switch` : undefined}
      disabled={disabled || loading}
      onPress={handleToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{
        checked,
        disabled: disabled || loading,
      }}
      style={[
        styles.pressable,
        {
          width: config.width,

          height: config.height,

          borderRadius: config.height / 2,

          backgroundColor: checked
            ? resolvedActiveColor
            : resolvedInactiveColor,

          opacity: disabled ? 0.5 : 1,
        },

        switchStyle,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.thumb,

          {
            width: config.thumb,

            height: config.thumb,

            borderRadius: config.thumb / 2,

            backgroundColor: resolvedThumbColor,

            left: config.padding,

            top: config.padding,

            transform: [
              {
                translateX,
              },
              {
                scale,
              },
            ],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              checked ? resolvedActiveColor : colors.textMuted || "#737373"
            }
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );

  /*
   * ----------------------------------------
   * RENDER
   * ----------------------------------------
   */

  return (
    <View ref={ref} style={[styles.container, containerStyle]} {...props}>
      <View
        style={[
          styles.row,

          labelPosition === "left" ? styles.rowReverse : null,
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  row: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 40,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  pressable: {
    alignItems: "flex-start",

    justifyContent: "flex-start",

    overflow: "hidden",
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

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UISwitch = memo(UISwitchComponent);

UISwitch.displayName = "UISwitch";

export const UISwitchSizes = UI_SWITCH_SIZES;

export default UISwitch;
