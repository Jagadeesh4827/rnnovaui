import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { StyleSheet, Text, View } from "react-native";

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
    : RADIO_GROUP_ORIENTATIONS.vertical;

  const resolvedSize = RADIO_GROUP_SIZES[size] ? size : RADIO_GROUP_SIZES.md;

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

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

      name,

      disabled,

      size: resolvedSize,

      error: hasError,

      success: hasSuccess,
    }),
    [
      selectedValue,
      handleChange,
      name,
      disabled,
      resolvedSize,
      hasError,
      hasSuccess,
    ],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View
        {...props}
        ref={ref}
        testID={testID}
        style={[styles.wrapper, style]}
        accessibilityRole="radiogroup"
      >
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

            resolvedOrientation === RADIO_GROUP_ORIENTATIONS.horizontal
              ? styles.horizontal
              : styles.vertical,

            {
              gap: optionGap ?? gap,
            },
          ]}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) {
              return child;
            }

            return child;
          })}
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

function UIRadioOption({
  value,
  label,
  children,

  disabled = false,

  description,

  style,
  labelStyle,
  descriptionStyle,

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

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onChange(value);
  }, [isDisabled, onChange, value]);

  const radioSize = getRadioSize(size);

  return (
    <View style={[styles.optionWrapper, style]}>
      <PressableFallback
        {...props}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="radio"
        accessibilityState={{
          checked,
          disabled: isDisabled,
        }}
        style={styles.optionPressable}
      >
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

              opacity: isDisabled ? 0.5 : 1,
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

        <View style={styles.textContainer}>
          {label || children ? (
            <Text
              style={[
                styles.optionLabel,

                {
                  color: isDisabled
                    ? colors.textDisabled || "#A3A3A3"
                    : colors.text || "#111111",

                  fontSize: radioSize.fontSize,
                },

                labelStyle,
              ]}
            >
              {label ?? children}
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
              {description}
            </Text>
          ) : null}
        </View>
      </PressableFallback>
    </View>
  );
}

/*
 * We intentionally use Pressable through
 * a tiny wrapper so the option remains
 * isolated from the group rendering.
 */
function PressableFallback({ children, style, ...props }) {
  const { Pressable } = require("react-native");

  return (
    <Pressable {...props} style={style}>
      {children}
    </Pressable>
  );
}

function getRadioSize(size) {
  switch (size) {
    case RADIO_GROUP_SIZES.sm:
      return {
        outer: 18,
        inner: 8,
        fontSize: 13,
      };

    case RADIO_GROUP_SIZES.lg:
      return {
        outer: 24,
        inner: 12,
        fontSize: 16,
      };

    case RADIO_GROUP_SIZES.md:
    default:
      return {
        outer: 21,
        inner: 9,
        fontSize: 14,
      };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  label: {
    marginBottom: 10,

    fontSize: 14,

    lineHeight: 19,

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

    alignItems: "center",
  },

  optionWrapper: {
    minWidth: 0,
  },

  optionPressable: {
    flexDirection: "row",

    alignItems: "flex-start",

    minHeight: 32,
  },

  radio: {
    alignItems: "center",

    justifyContent: "center",

    marginTop: 1,
  },

  radioDot: {},

  textContainer: {
    flex: 1,

    minWidth: 0,

    marginLeft: 9,
  },

  optionLabel: {
    fontWeight: "500",

    lineHeight: 20,

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

export const UIRadioGroup = memo(UIRadioGroupComponent);

UIRadioGroup.displayName = "UIRadioGroup";

export const UIRadioOption = memo(UIRadioOption);

UIRadioOption.displayName = "UIRadioOption";

export {
  RADIO_GROUP_ORIENTATIONS as UIRadioGroupOrientations,
  RADIO_GROUP_SIZES as UIRadioGroupSizes,
};

export default UIRadioGroup;
