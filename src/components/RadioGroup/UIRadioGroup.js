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

/* =========================================================
   CONSTANTS
========================================================= */

const RADIO_GROUP_ORIENTATIONS = {
  vertical: "vertical",
  horizontal: "horizontal",
};

const RADIO_GROUP_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

/* =========================================================
   CONTEXT
========================================================= */

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

    label,
    helperText,
    errorText,

    error = false,
    success = false,

    required = false,
    disabled = false,

    orientation = "vertical",

    size = "md",

    gap = 16,

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

  const resolvedOrientation =
    orientation === "horizontal" ? "horizontal" : "vertical";

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
      selectedValue,

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
        style={[styles.container, style]}
      >
        {/* =================================================
              GROUP LABEL
          ================================================= */}

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
            {String(label)}

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

        {/* =================================================
              OPTIONS
          ================================================= */}

        <View
          style={[
            styles.options,

            resolvedOrientation === "horizontal"
              ? styles.optionsHorizontal
              : styles.optionsVertical,
          ]}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) {
              return null;
            }

            return child;
          })}
        </View>

        {/* =================================================
              ERROR / HELPER
          ================================================= */}

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
            {String(errorText)}
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
            {String(helperText)}
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

  description = "",

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
    selectedValue,
    onChange,
    disabled: groupDisabled,
    size,
    error,
  } = context;

  const isSelected = selectedValue === value;

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
    <Pressable
      {...props}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{
        checked: isSelected,

        disabled: isDisabled,
      }}
      style={({ pressed }) => [
        styles.option,

        {
          opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
        },

        style,
      ]}
    >
      {/* =================================================
            CIRCLE
        ================================================= */}

      <View
        style={[
          styles.radio,

          {
            width: radioSize.outer,

            height: radioSize.outer,

            borderRadius: radioSize.outer / 2,

            borderWidth: isSelected ? 2 : 1.5,

            borderColor: error
              ? colors.danger || "#DC2626"
              : isSelected
                ? colors.primary || "#FF5A1F"
                : colors.borderStrong || "#D4D4D4",
          },
        ]}
      >
        {isSelected ? (
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

      {/* =================================================
            LABEL CONTENT
        ================================================= */}

      <View style={styles.labelContainer}>
        {label !== null && label !== undefined && String(label).length > 0 ? (
          <Text
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

        {description !== null &&
        description !== undefined &&
        String(description).length > 0 ? (
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
        outer: 20,
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
  container: {
    width: "100%",
  },

  /* GROUP LABEL */

  groupLabel: {
    marginBottom: 12,

    fontSize: 14,

    lineHeight: 20,

    fontWeight: "600",

    includeFontPadding: false,
  },

  /* OPTIONS CONTAINER */

  options: {
    width: "100%",
  },

  optionsVertical: {
    flexDirection: "column",

    alignItems: "flex-start",

    gap: 12,
  },

  optionsHorizontal: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "center",

    columnGap: 20,

    rowGap: 12,
  },

  /* INDIVIDUAL OPTION */

  option: {
    flexDirection: "row",

    /*
     * THIS IS IMPORTANT
     *
     * Radio + label are always
     * in the same row.
     */

    alignItems: "center",

    justifyContent: "flex-start",

    /*
     * Do NOT use width: 100%.
     */

    flexGrow: 0,

    flexShrink: 0,

    minHeight: 32,
  },

  /* RADIO CIRCLE */

  radio: {
    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  radioDot: {
    flexShrink: 0,
  },

  /* LABEL */

  labelContainer: {
    marginLeft: 8,

    justifyContent: "center",

    flexShrink: 0,
  },

  optionLabel: {
    fontWeight: "500",

    includeFontPadding: false,

    textAlign: "left",
  },

  description: {
    marginTop: 3,

    fontSize: 12,

    lineHeight: 17,

    includeFontPadding: false,

    textAlign: "left",
  },

  /* ERROR / HELPER */

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
