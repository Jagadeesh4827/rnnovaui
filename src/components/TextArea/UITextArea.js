import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const TEXTAREA_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const TEXTAREA_VARIANTS = {
  outlined: "outlined",
  filled: "filled",
  underline: "underline",
};

const UITextAreaComponent = forwardRef(function UITextArea(
  {
    value,
    defaultValue,
    onChangeText,
    onFocus,
    onBlur,

    label,
    placeholder = "",

    helperText,
    errorText,
    successText,

    error = false,
    success = false,

    variant = "outlined",
    size = "md",

    disabled = false,
    readOnly = false,

    required = false,

    rows = 4,
    minHeight,
    maxHeight,

    maxLength,

    showCharacterCount = false,

    autoFocus = false,
    multiline = true,

    textAlignVertical = "top",

    keyboardType = "default",
    returnKeyType = "default",

    autoCapitalize = "sentences",
    autoCorrect = true,

    secureTextEntry = false,

    leftIcon,
    rightIcon,

    clearButton = false,

    onSubmitEditing,

    textStyle,
    labelStyle,
    placeholderStyle,
    helperStyle,
    errorStyle,
    successStyle,

    containerStyle,
    inputContainerStyle,

    contentStyle,

    borderRadius,

    focusedBorderWidth = 1.5,

    animation = true,

    focusAnimationDuration = 140,

    style,

    testID,

    accessibilityLabel,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const [focused, setFocused] = useState(false);

  const borderAnimation = useRef(new Animated.Value(0)).current;

  const safeSize = TEXTAREA_SIZES[size] ? size : TEXTAREA_SIZES.md;

  const safeVariant = TEXTAREA_VARIANTS[variant]
    ? variant
    : TEXTAREA_VARIANTS.outlined;

  const dimensions = useMemo(
    () => getDimensions(safeSize, rows, theme),
    [safeSize, rows, theme],
  );

  const resolvedMinHeight = minHeight ?? dimensions.minHeight;

  const resolvedMaxHeight = maxHeight ?? undefined;

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

  const resolvedColors = useMemo(
    () =>
      getInputColors(
        colors,
        safeVariant,
        focused,
        hasError,
        hasSuccess,
        disabled,
      ),
    [colors, safeVariant, focused, hasError, hasSuccess, disabled],
  );

  const focusInput = useCallback(() => {
    if (disabled || readOnly) {
      return;
    }

    if (typeof ref === "object" && ref?.current) {
      ref.current.focus();
    }
  }, [disabled, readOnly, ref]);

  const handleFocus = useCallback(
    (event) => {
      setFocused(true);

      if (animation) {
        Animated.timing(borderAnimation, {
          toValue: 1,

          duration: focusAnimationDuration,

          useNativeDriver: false,
        }).start();
      }

      onFocus?.(event);
    },
    [animation, focusAnimationDuration, borderAnimation, onFocus],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);

      if (animation) {
        Animated.timing(borderAnimation, {
          toValue: 0,

          duration: focusAnimationDuration,

          useNativeDriver: false,
        }).start();
      }

      onBlur?.(event);
    },
    [animation, focusAnimationDuration, borderAnimation, onBlur],
  );

  const animatedBorderColor = animation
    ? borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [resolvedColors.border, resolvedColors.focusedBorder],
      })
    : resolvedColors.border;

  const animatedBorderWidth = animation
    ? borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [resolvedColors.borderWidth, focusedBorderWidth],
      })
    : focused
      ? focusedBorderWidth
      : resolvedColors.borderWidth;

  const handleClear = useCallback(() => {
    onChangeText?.("");
  }, [onChangeText]);

  const characterCount = String(value ?? "").length;

  const showLabel = Boolean(label);

  return (
    <View testID={testID} style={[styles.wrapper, style]}>
      {showLabel ? (
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

          {required ? (
            <Text
              style={{
                color: colors.danger || "#DC2626",
              }}
            >
              {" *"}
            </Text>
          ) : null}
        </Text>
      ) : null}

      <Animated.View
        style={[
          styles.inputContainer,

          {
            minHeight: resolvedMinHeight,

            maxHeight: resolvedMaxHeight,

            backgroundColor: resolvedColors.background,

            borderColor: animatedBorderColor,

            borderWidth: animatedBorderWidth,

            borderRadius: borderRadius ?? dimensions.borderRadius,
          },

          safeVariant === TEXTAREA_VARIANTS.underline ? styles.underline : null,

          inputContainerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          {...props}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled && !readOnly}
          multiline={multiline}
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted || "#737373"}
          maxLength={maxLength}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          textAlignVertical={textAlignVertical}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={accessibilityLabel || label}
          style={[
            styles.input,

            {
              minHeight: dimensions.minHeight - dimensions.verticalPadding * 2,

              color: disabled
                ? colors.textDisabled || "#A3A3A3"
                : colors.text || "#111111",

              fontSize: dimensions.fontSize,

              lineHeight: dimensions.lineHeight,

              paddingHorizontal: dimensions.horizontalPadding,

              paddingVertical: dimensions.verticalPadding,
            },

            textStyle,

            contentStyle,
          ]}
        />

        {clearButton && characterCount > 0 && !disabled && !readOnly ? (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
          >
            <Text
              style={[
                styles.clearText,

                {
                  color: colors.textMuted || "#737373",
                },
              ]}
            >
              ×
            </Text>
          </Pressable>
        ) : null}

        {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </Animated.View>

      <View style={styles.bottomRow}>
        <View style={styles.messageContainer}>
          {hasError ? (
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
          ) : hasSuccess && successText ? (
            <Text
              style={[
                styles.message,

                {
                  color: colors.success || "#16A34A",
                },

                successStyle,
              ]}
            >
              {successText}
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

        {showCharacterCount && maxLength ? (
          <Text
            style={[
              styles.counter,

              {
                color:
                  characterCount >= maxLength
                    ? colors.danger || "#DC2626"
                    : colors.textMuted || "#737373",
              },
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

function getDimensions(size, rows, theme) {
  const radius = theme?.radius || {};

  const rowHeight = 22;

  switch (size) {
    case TEXTAREA_SIZES.sm:
      return {
        minHeight: Math.max(80, rows * rowHeight + 24),

        horizontalPadding: 12,

        verticalPadding: 10,

        borderRadius: radius.sm ?? 8,

        fontSize: 13,

        lineHeight: 19,
      };

    case TEXTAREA_SIZES.lg:
      return {
        minHeight: Math.max(120, rows * rowHeight + 32),

        horizontalPadding: 16,

        verticalPadding: 14,

        borderRadius: radius.md ?? 12,

        fontSize: 16,

        lineHeight: 24,
      };

    case TEXTAREA_SIZES.md:
    default:
      return {
        minHeight: Math.max(96, rows * rowHeight + 28),

        horizontalPadding: 14,

        verticalPadding: 12,

        borderRadius: radius.sm ?? 10,

        fontSize: 14,

        lineHeight: 21,
      };
  }
}

function getInputColors(
  colors,
  variant,
  focused,
  hasError,
  hasSuccess,
  disabled,
) {
  if (disabled) {
    return {
      background: colors.inputDisabled || "#EEEEEE",

      border: colors.border || "#E5E5E5",

      focusedBorder: colors.border || "#E5E5E5",

      borderWidth: 1,
    };
  }

  if (hasError) {
    return {
      background:
        variant === TEXTAREA_VARIANTS.filled
          ? colors.input || "#F7F7F7"
          : colors.background || "#FFFFFF",

      border: colors.danger || "#DC2626",

      focusedBorder: colors.danger || "#DC2626",

      borderWidth: 1,
    };
  }

  if (hasSuccess) {
    return {
      background:
        variant === TEXTAREA_VARIANTS.filled
          ? colors.input || "#F7F7F7"
          : colors.background || "#FFFFFF",

      border: colors.success || "#16A34A",

      focusedBorder: colors.success || "#16A34A",

      borderWidth: 1,
    };
  }

  if (variant === TEXTAREA_VARIANTS.filled) {
    return {
      background: colors.input || "#F7F7F7",

      border: "transparent",

      focusedBorder: colors.primary || "#FF5A1F",

      borderWidth: 0,
    };
  }

  if (variant === TEXTAREA_VARIANTS.underline) {
    return {
      background: "transparent",

      border: colors.border || "#E5E5E5",

      focusedBorder: colors.primary || "#FF5A1F",

      borderWidth: 0,
    };
  }

  return {
    background: colors.background || "#FFFFFF",

    border: colors.border || "#E5E5E5",

    focusedBorder: colors.primary || "#FF5A1F",

    borderWidth: focused ? 1.5 : 1,
  };
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  label: {
    marginBottom: 7,

    fontSize: 14,

    lineHeight: 19,

    fontWeight: "600",

    includeFontPadding: false,
  },

  inputContainer: {
    flexDirection: "row",

    alignItems: "stretch",

    overflow: "hidden",
  },

  underline: {
    borderLeftWidth: 0,

    borderRightWidth: 0,

    borderTopWidth: 0,

    borderRadius: 0,
  },

  input: {
    flex: 1,

    minWidth: 0,

    textAlignVertical: "top",

    includeFontPadding: false,
  },

  leftIcon: {
    paddingLeft: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  rightIcon: {
    paddingRight: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  clearButton: {
    width: 32,

    alignItems: "center",

    justifyContent: "center",
  },

  clearText: {
    fontSize: 23,

    lineHeight: 24,

    fontWeight: "300",

    includeFontPadding: false,
  },

  bottomRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",

    minHeight: 18,
  },

  messageContainer: {
    flex: 1,

    minWidth: 0,
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },

  counter: {
    marginTop: 6,

    marginLeft: 8,

    fontSize: 11,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UITextArea = memo(UITextAreaComponent);

UITextArea.displayName = "UITextArea";

export {
  TEXTAREA_SIZES as UITextAreaSizes,
  TEXTAREA_VARIANTS as UITextAreaVariants,
};

export default UITextArea;
