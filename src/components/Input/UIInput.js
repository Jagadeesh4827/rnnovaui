import React, { forwardRef, memo, useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const INPUT_VARIANTS = {
  default: "default",
  filled: "filled",
  outlined: "outlined",
  underline: "underline",
};

const INPUT_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const INPUT_STATES = {
  default: "default",
  error: "error",
  success: "success",
  disabled: "disabled",
};

const FALLBACK_COLORS = {
  background: "#FFFFFF",
  input: "#F7F7F7",
  inputFocused: "#FFFFFF",
  inputDisabled: "#EEEEEE",

  text: "#111111",
  textSecondary: "#525252",
  textMuted: "#737373",
  textDisabled: "#A3A3A3",

  border: "#E5E5E5",
  borderStrong: "#D4D4D4",

  primary: "#FF5A1F",
  danger: "#DC2626",
  success: "#16A34A",

  white: "#FFFFFF",
};

const UIInputComponent = forwardRef(function UIInput(
  {
    value,
    defaultValue,

    onChangeText,
    onFocus,
    onBlur,

    placeholder,

    placeholderTextColor,

    label,
    helperText,
    errorText,
    successText,

    variant = "outlined",
    size = "md",

    floatingLabel = false,

    disabled = false,
    loading = false,

    error = false,
    success = false,

    leftIcon = null,
    rightIcon = null,

    secureTextEntry = false,

    showPasswordToggle = false,

    labelStyle,
    floatingLabelStyle,

    helperStyle,
    errorStyle,
    successStyle,

    inputStyle,
    containerStyle,

    focusedContainerStyle,
    errorContainerStyle,
    successContainerStyle,

    activeBorderColor,

    borderRadius,

    fullWidth = true,

    style,

    testID,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const [focused, setFocused] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const isDisabled = disabled || loading;

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

  const hasValue =
    value !== undefined && value !== null && String(value).length > 0;

  const shouldFloatLabel = floatingLabel && Boolean(focused || hasValue);

  const safeVariant = INPUT_VARIANTS[variant]
    ? variant
    : INPUT_VARIANTS.outlined;

  const safeSize = INPUT_SIZES[size] ? size : INPUT_SIZES.md;

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
  );

  const resolvedColors = useMemo(
    () =>
      getInputColors(
        colors,
        safeVariant,
        focused,
        hasError,
        hasSuccess,
        isDisabled,
        activeBorderColor,
      ),
    [
      colors,
      safeVariant,
      focused,
      hasError,
      hasSuccess,
      isDisabled,
      activeBorderColor,
    ],
  );

  const handleFocus = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      setFocused(true);

      onFocus?.(event);
    },
    [isDisabled, onFocus],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);

      onBlur?.(event);
    },
    [onBlur],
  );

  const togglePassword = useCallback(() => {
    if (isDisabled) {
      return;
    }

    setPasswordVisible((previous) => !previous);
  }, [isDisabled]);

  const resolvedSecure = secureTextEntry && !passwordVisible;

  const resolvedPlaceholder =
    placeholderTextColor || colors.textMuted || FALLBACK_COLORS.textMuted;

  const resolvedLabel = label || placeholder;

  const wrapperStyle = useMemo(
    () => [
      styles.wrapper,

      {
        width: fullWidth ? "100%" : undefined,
      },

      style,
    ],
    [fullWidth, style],
  );

  const containerStyles = useMemo(
    () => [
      styles.container,

      {
        minHeight: dimensions.height,

        borderRadius: borderRadius ?? dimensions.borderRadius,

        backgroundColor: resolvedColors.background,

        borderColor: resolvedColors.border,

        borderWidth: resolvedColors.borderWidth,

        paddingHorizontal: dimensions.paddingHorizontal,
      },

      safeVariant === INPUT_VARIANTS.underline
        ? styles.underlineContainer
        : null,

      focused ? focusedContainerStyle : null,

      hasError ? errorContainerStyle : null,

      hasSuccess ? successContainerStyle : null,

      containerStyle,
    ],
    [
      dimensions,
      borderRadius,
      resolvedColors,
      safeVariant,
      focused,
      hasError,
      hasSuccess,
      focusedContainerStyle,
      errorContainerStyle,
      successContainerStyle,
      containerStyle,
    ],
  );

  const floatingLabelColor = hasError
    ? colors.danger || FALLBACK_COLORS.danger
    : hasSuccess
      ? colors.success || FALLBACK_COLORS.success
      : focused
        ? activeBorderColor || colors.primary || FALLBACK_COLORS.primary
        : colors.textSecondary || FALLBACK_COLORS.textSecondary;

  return (
    <View testID={testID} style={wrapperStyle}>
      {!floatingLabel && label ? (
        <Text
          style={[
            styles.label,

            {
              color: isDisabled
                ? colors.textDisabled || FALLBACK_COLORS.textDisabled
                : colors.text || FALLBACK_COLORS.text,
            },

            labelStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View style={containerStyles}>
        {floatingLabel &&
        shouldFloatLabel &&
        safeVariant === INPUT_VARIANTS.outlined &&
        resolvedLabel ? (
          <View
            pointerEvents="none"
            style={[
              styles.floatingLabelBackground,

              {
                backgroundColor: resolvedColors.background,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.floatingLabel,

                {
                  color: floatingLabelColor,
                },

                floatingLabelStyle,
              ]}
            >
              {resolvedLabel}
            </Text>
          </View>
        ) : null}

        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          {...props}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={
            floatingLabel && shouldFloatLabel ? undefined : placeholder
          }
          placeholderTextColor={resolvedPlaceholder}
          secureTextEntry={resolvedSecure}
          editable={!isDisabled}
          selectionColor={colors.primary || FALLBACK_COLORS.primary}
          style={[
            styles.input,

            {
              color: isDisabled
                ? colors.textDisabled || FALLBACK_COLORS.textDisabled
                : colors.text || FALLBACK_COLORS.text,

              fontSize: dimensions.fontSize,

              lineHeight: dimensions.lineHeight,
            },

            floatingLabel && shouldFloatLabel ? styles.floatingInput : null,

            inputStyle,
          ]}
        />

        {loading ? (
          <View style={styles.rightIcon}>
            <ActivityIndicator
              size="small"
              color={colors.primary || FALLBACK_COLORS.primary}
            />
          </View>
        ) : secureTextEntry && showPasswordToggle ? (
          <Pressable
            disabled={isDisabled}
            onPress={togglePassword}
            hitSlop={8}
            style={styles.rightIcon}
          >
            {rightIcon}
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError ? (
        <Text
          style={[
            styles.message,

            {
              color: colors.danger || FALLBACK_COLORS.danger,
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
              color: colors.success || FALLBACK_COLORS.success,
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
              color: colors.textSecondary || FALLBACK_COLORS.textSecondary,
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

function getInputColors(
  colors,
  variant,
  focused,
  hasError,
  hasSuccess,
  disabled,
  activeBorderColor,
) {
  const primary = colors.primary || FALLBACK_COLORS.primary;

  const border = colors.border || FALLBACK_COLORS.border;

  if (disabled) {
    return {
      background: colors.inputDisabled || FALLBACK_COLORS.inputDisabled,

      border: border,

      borderWidth: variant === INPUT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (hasError) {
    return {
      background:
        variant === INPUT_VARIANTS.filled
          ? colors.input || FALLBACK_COLORS.input
          : colors.background || FALLBACK_COLORS.background,

      border: colors.danger || FALLBACK_COLORS.danger,

      borderWidth: variant === INPUT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (hasSuccess) {
    return {
      background:
        variant === INPUT_VARIANTS.filled
          ? colors.input || FALLBACK_COLORS.input
          : colors.background || FALLBACK_COLORS.background,

      border: colors.success || FALLBACK_COLORS.success,

      borderWidth: variant === INPUT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (focused) {
    return {
      background:
        variant === INPUT_VARIANTS.filled
          ? colors.inputFocused || FALLBACK_COLORS.inputFocused
          : colors.background || FALLBACK_COLORS.background,

      border: activeBorderColor || primary,

      borderWidth: variant === INPUT_VARIANTS.underline ? 2 : 1,
    };
  }

  if (variant === INPUT_VARIANTS.filled) {
    return {
      background: colors.input || FALLBACK_COLORS.input,

      border: "transparent",

      borderWidth: 0,
    };
  }

  if (variant === INPUT_VARIANTS.underline) {
    return {
      background: "transparent",

      border: border,

      borderWidth: 0,
    };
  }

  return {
    background: colors.background || FALLBACK_COLORS.background,

    border,

    borderWidth: 1,
  };
}

function getDimensions(size, theme) {
  const inputSizes = theme?.sizes?.input || {};

  const radius = theme?.radius || {};

  switch (size) {
    case INPUT_SIZES.sm:
      return {
        height: inputSizes.sm || 40,

        paddingHorizontal: 12,

        borderRadius: radius.sm ?? 8,

        fontSize: 13,

        lineHeight: 18,
      };

    case INPUT_SIZES.lg:
      return {
        height: inputSizes.lg || 56,

        paddingHorizontal: 16,

        borderRadius: radius.md ?? 12,

        fontSize: 16,

        lineHeight: 22,
      };

    case INPUT_SIZES.md:
    default:
      return {
        height: inputSizes.md || 48,

        paddingHorizontal: 14,

        borderRadius: radius.sm ?? 10,

        fontSize: 14,

        lineHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },

  label: {
    marginBottom: 7,

    fontSize: 14,

    lineHeight: 19,

    fontWeight: "600",

    includeFontPadding: false,
  },

  container: {
    flexDirection: "row",

    alignItems: "center",

    position: "relative",

    overflow: "visible",
  },

  underlineContainer: {
    borderLeftWidth: 0,

    borderRightWidth: 0,

    borderTopWidth: 0,

    borderRadius: 0,
  },

  input: {
    flex: 1,

    minWidth: 0,

    paddingVertical: 0,

    includeFontPadding: false,
  },

  floatingInput: {
    paddingTop: 4,
  },

  floatingLabelBackground: {
    position: "absolute",

    left: 10,

    top: -9,

    zIndex: 10,

    paddingHorizontal: 5,

    alignSelf: "flex-start",

    maxWidth: "80%",
  },

  floatingLabel: {
    fontSize: 12,

    lineHeight: 16,

    fontWeight: "500",

    includeFontPadding: false,
  },

  leftIcon: {
    marginRight: 10,

    alignItems: "center",

    justifyContent: "center",
  },

  rightIcon: {
    marginLeft: 10,

    alignItems: "center",

    justifyContent: "center",
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UIInput = memo(UIInputComponent);

UIInput.displayName = "UIInput";

export {
  INPUT_VARIANTS as UIInputVariants,
  INPUT_SIZES as UIInputSizes,
  INPUT_STATES as UIInputStates,
};

export default UIInput;
