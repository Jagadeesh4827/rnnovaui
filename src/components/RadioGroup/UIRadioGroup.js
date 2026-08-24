import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const RADIO_GROUP_ORIENTATIONS = {
  vertical: "vertical",
  horizontal: "horizontal",
};

const RADIO_GROUP_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const RadioGroupContext = createContext(null);

/* =========================================================
   RADIO GROUP
========================================================= */

const UIRadioGroupComponent = forwardRef(function UIRadioGroup(
  {
    children,

    value,
    defaultValue = null,

    onChange,

    name,

    label,
    helperText,
    errorText,

    error = false,
    success = false,

    required = false,
    disabled = false,

    orientation = "vertical",

    size = "md",

    gap = 12,
    optionGap,

    style,
    labelStyle,
    helperStyle,
    errorStyle,

    testID,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;

  const selectedValue = isControlled ? value : internalValue;

  const resolvedOrientation = RADIO_GROUP_ORIENTATIONS[orientation]
    ? orientation
    : "vertical";

  const resolvedSize = RADIO_GROUP_SIZES[size] ? size : "md";

  const hasError = Boolean(error || errorText);

  const handleChange = useCallback(
    (nextValue) => {
      if (disabled) {
        return;
      }

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [disabled, isControlled, onChange],
  );

  const contextValue = useMemo(
    () => ({
      value: selectedValue,

      onChange: handleChange,

      disabled,

      size: resolvedSize,

      error: hasError,
    }),
    [selectedValue, handleChange, disabled, resolvedSize, hasError],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View
        {...props}
        ref={ref}
        testID={testID}
        style={[styles.wrapper, style]}
      >
        {label ? (
          <Text
            style={[
              styles.groupLabel,

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

        <View
          style={[
            styles.options,

            resolvedOrientation === "horizontal"
              ? styles.horizontal
              : styles.vertical,

            {
              gap: optionGap ?? gap,
            },
          ]}
        >
          {children}
        </View>

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
    </RadioGroupContext.Provider>
  );
});

/* =========================================================
   RADIO OPTION
========================================================= */

const UIRadioOptionComponent = function UIRadioOptionComponent({
  value,
  label = "",
  description,

  disabled = false,

  style,
  labelStyle,
  descriptionStyle,

  onPress,

  ...props
}) {
  const context = useContext(RadioGroupContext);

  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  if (!context) {
    throw new Error("UIRadioOption must be used inside UIRadioGroup.");
  }

  const {
    value: selectedValue,
    onChange,
    disabled: groupDisabled,
    size,
    error,
  } = context;

  const checked = selectedValue === value;

  const isDisabled = groupDisabled || disabled;

  const radioSize = getRadioSize(size);

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onChange(value);

    onPress?.(value);
  }, [isDisabled, onChange, value, onPress]);

  return (
    <View style={[styles.optionWrapper, style]}>
      <Pressable
        {...props}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="radio"
        accessibilityState={{
          checked,
          disabled: isDisabled,
        }}
        style={({ pressed }) => [
          styles.optionPressable,

          {
            opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
          },
        ]}
      >
        {/* RADIO CIRCLE */}
        <View
          style={[
            styles.radio,

            {
              width: radioSize.outer,

              height: radioSize.outer,

              borderRadius: radioSize.outer / 2,

              borderColor: error
                ? colors.danger || "#DC2626"
                : checked
                  ? colors.primary || "#FF5A1F"
                  : colors.borderStrong || "#D4D4D4",

              borderWidth: checked ? 2 : 1.5,
            },
          ]}
        >
          {checked ? (
            <View
              style={[
                styles.radioDot,

                {
                  width: radioSize.inner,

                  height: radioSize.inner,

                  borderRadius: radioSize.inner / 2,

                  backgroundColor: error
                    ? colors.danger || "#DC2626"
                    : colors.primary || "#FF5A1F",
                },
              ]}
            />
          ) : null}
        </View>

        {/* TEXT AREA */}
        <View style={styles.textContainer}>
          {label !== "" ? (
            <Text
              numberOfLines={0}
              style={[
                styles.optionLabel,

                {
                  color: isDisabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.text || "#111111",

                  fontSize: radioSize.fontSize,

                  lineHeight: radioSize.lineHeight,
                },

                labelStyle,
              ]}
            >
              {String(label)}
            </Text>
          ) : null}

          {description ? (
            <Text
              style={[
                styles.description,

                {
                  color: isDisabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.textSecondary || "#525252",
                },

                descriptionStyle,
              ]}
            >
              {String(description)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

/* =========================================================
   RADIO SIZE
========================================================= */

function getRadioSize(size) {
  switch (size) {
    case "sm":
      return {
        outer: 18,
        inner: 8,
        fontSize: 13,
        lineHeight: 18,
      };

    case "lg":
      return {
        outer: 24,
        inner: 12,
        fontSize: 16,
        lineHeight: 22,
      };

    case "md":
    default:
      return {
        outer: 21,
        inner: 9,
        fontSize: 14,
        lineHeight: 20,
      };
  }
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  groupLabel: {
    marginBottom: 10,

    fontSize: 14,

    lineHeight: 20,

    fontWeight: "600",

    includeFontPadding: false,
  },

  options: {
    width: "100%",
  },

  vertical: {
    flexDirection: "column",
  },

  horizontal: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "flex-start",
  },

  optionWrapper: {
    width: "100%",
  },

  optionPressable: {
    width: "100%",

    minHeight: 34,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  radio: {
    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",

    marginTop: 1,
  },

  radioDot: {},

  textContainer: {
    flex: 1,

    minWidth: 0,

    marginLeft: 10,

    paddingRight: 4,
  },

  optionLabel: {
    fontWeight: "500",

    includeFontPadding: false,
  },

  description: {
    marginTop: 3,

    fontSize: 12,

    lineHeight: 17,

    includeFontPadding: false,
  },

  message: {
    marginTop: 7,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const UIRadioGroup = memo(UIRadioGroupComponent);

UIRadioGroup.displayName = "UIRadioGroup";

export const UIRadioOption = memo(UIRadioOptionComponent);

UIRadioOption.displayName = "UIRadioOption";

export {
  RADIO_GROUP_ORIENTATIONS as UIRadioGroupOrientations,
  RADIO_GROUP_SIZES as UIRadioGroupSizes,
};

export default UIRadioGroup;
