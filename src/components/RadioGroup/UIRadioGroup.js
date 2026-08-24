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
   UI RADIO GROUP
========================================================= */

const UIRadioGroupComponent = forwardRef(function UIRadioGroup(
  {
    children,

    /* Value */

    value,
    defaultValue = null,

    onChange,

    /* Label */

    label,
    helperText,
    errorText,

    /* States */

    error = false,
    success = false,

    required = false,
    disabled = false,

    /* Layout */

    orientation = "vertical",

    size = "md",

    gap = 16,

    /* Styles */

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

  /* =====================================================
       INTERNAL VALUE
    ===================================================== */

  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;

  const selectedValue = isControlled ? value : internalValue;

  /* =====================================================
       NORMALIZE OPTIONS
    ===================================================== */

  const resolvedOrientation =
    orientation === RADIO_GROUP_ORIENTATIONS.horizontal
      ? RADIO_GROUP_ORIENTATIONS.horizontal
      : RADIO_GROUP_ORIENTATIONS.vertical;

  const resolvedSize = RADIO_GROUP_SIZES[size] ? size : RADIO_GROUP_SIZES.md;

  /* =====================================================
       STATES
    ===================================================== */

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

  /* =====================================================
       CHANGE HANDLER
    ===================================================== */

  const handleChange = useCallback(
    (nextValue) => {
      if (disabled) {
        return;
      }

      /*
       * Uncontrolled
       */

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      /*
       * Controlled
       */

      if (onChange) {
        onChange(nextValue);
      }
    },
    [disabled, isControlled, onChange],
  );

  /* =====================================================
       CONTEXT
    ===================================================== */

  const contextValue = useMemo(
    () => ({
      selectedValue,

      onChange: handleChange,

      disabled,

      size: resolvedSize,

      error: hasError,

      success: hasSuccess,
    }),
    [selectedValue, handleChange, disabled, resolvedSize, hasError, hasSuccess],
  );

  /* =====================================================
       RENDER
    ===================================================== */

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

        {label !== null && label !== undefined && String(label).length > 0 ? (
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
              OPTIONS CONTAINER
          ================================================= */}

        <View
          style={[
            styles.options,

            resolvedOrientation === RADIO_GROUP_ORIENTATIONS.horizontal
              ? styles.optionsHorizontal
              : styles.optionsVertical,

            {
              columnGap: gap,

              rowGap: gap,
            },
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
              ERROR
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
        ) : null}

        {/* =================================================
              HELPER
          ================================================= */}

        {!hasError && helperText ? (
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
   UI RADIO OPTION
========================================================= */

const UIRadioOptionComponent = function UIRadioOptionComponent({
  value,

  label = "",

  description = "",

  disabled = false,

  onPress,

  style,
  labelStyle,
  descriptionStyle,

  ...props
}) {
  const context = useContext(RadioGroupContext);

  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  /* =====================================================
       CONTEXT VALIDATION
    ===================================================== */

  if (!context) {
    throw new Error("UIRadioOption must be used inside UIRadioGroup.");
  }

  const {
    selectedValue,

    onChange,

    disabled: groupDisabled,

    size,

    error,

    success,
  } = context;

  /* =====================================================
       STATES
    ===================================================== */

  const isSelected = selectedValue === value;

  const isDisabled = Boolean(groupDisabled || disabled);

  const radioSize = getRadioSize(size);

  /* =====================================================
       PRESS
    ===================================================== */

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onChange(value);

    if (onPress) {
      onPress(value);
    }
  }, [isDisabled, onChange, value, onPress]);

  /* =====================================================
       RADIO BORDER COLOR
    ===================================================== */

  let borderColor;

  if (error) {
    borderColor = colors.danger || "#DC2626";
  } else if (isSelected) {
    borderColor = colors.primary || "#FF5A1F";
  } else {
    borderColor = colors.borderStrong || "#3A3A3A";
  }

  /* =====================================================
       RADIO DOT COLOR
    ===================================================== */

  let dotColor;

  if (error) {
    dotColor = colors.danger || "#DC2626";
  } else if (success) {
    dotColor = colors.success || "#16A34A";
  } else {
    dotColor = colors.primary || "#FF5A1F";
  }

  /* =====================================================
       RENDER
    ===================================================== */

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
            RADIO + LABEL ROW

            This is the important part.
        ================================================= */}

      <View style={styles.radioLabelRow}>
        {/* RADIO */}

        <View
          style={[
            styles.radio,

            {
              width: radioSize.outer,

              height: radioSize.outer,

              borderRadius: radioSize.outer / 2,

              borderWidth: isSelected ? 2 : 1.5,

              borderColor,
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

                  backgroundColor: dotColor,
                },
              ]}
            />
          ) : null}
        </View>

        {/* LABEL */}

        <Text
          numberOfLines={1}
          style={[
            styles.optionLabel,

            {
              color: isDisabled
                ? colors.textDisabled || "#A3A3A3"
                : colors.text || "#FFFFFF",

              fontSize: radioSize.fontSize,

              lineHeight: radioSize.lineHeight,
            },

            labelStyle,
          ]}
        >
          {String(label)}
        </Text>
      </View>

      {/* =================================================
            DESCRIPTION
        ================================================= */}

      {description !== null &&
      description !== undefined &&
      String(description).length > 0 ? (
        <Text
          style={[
            styles.description,

            {
              color: isDisabled
                ? colors.textDisabled || "#A3A3A3"
                : colors.textSecondary || "#A3A3A3",
            },

            descriptionStyle,
          ]}
        >
          {String(description)}
        </Text>
      ) : null}
    </Pressable>
  );
};

/* =========================================================
   RADIO SIZE
========================================================= */

function getRadioSize(size) {
  switch (size) {
    case RADIO_GROUP_SIZES.sm:
      return {
        outer: 18,
        inner: 8,
        fontSize: 13,
        lineHeight: 18,
      };

    case RADIO_GROUP_SIZES.lg:
      return {
        outer: 24,
        inner: 12,
        fontSize: 16,
        lineHeight: 22,
      };

    case RADIO_GROUP_SIZES.md:
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
  /* =====================================================
       GROUP
    ===================================================== */

  container: {
    width: "100%",
  },

  groupLabel: {
    marginBottom: 12,

    fontSize: 14,

    lineHeight: 20,

    fontWeight: "600",

    includeFontPadding: false,
  },

  /* =====================================================
       OPTIONS
    ===================================================== */

  options: {
    width: "100%",
  },

  optionsVertical: {
    flexDirection: "column",

    alignItems: "flex-start",
  },

  optionsHorizontal: {
    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "center",
  },

  /* =====================================================
       OPTION

       IMPORTANT:
       No width: "100%"
       No flex: 1

       This allows:

       ○ Male   ○ Female   ○ Other
    ===================================================== */

  option: {
    flexDirection: "column",

    alignItems: "flex-start",

    justifyContent: "flex-start",

    flexGrow: 0,

    flexShrink: 0,

    minHeight: 32,
  },

  /* =====================================================
       RADIO + LABEL
    ===================================================== */

  radioLabelRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "flex-start",

    flexGrow: 0,

    flexShrink: 0,

    minHeight: 32,
  },

  /* =====================================================
       RADIO CIRCLE
    ===================================================== */

  radio: {
    alignItems: "center",

    justifyContent: "center",

    flexGrow: 0,

    flexShrink: 0,
  },

  radioDot: {
    flexGrow: 0,

    flexShrink: 0,
  },

  /* =====================================================
       LABEL
    ===================================================== */

  optionLabel: {
    marginLeft: 8,

    fontWeight: "500",

    includeFontPadding: false,

    flexGrow: 0,

    flexShrink: 0,
  },

  /* =====================================================
       DESCRIPTION
    ===================================================== */

  description: {
    marginTop: 4,

    marginLeft: 28,

    fontSize: 12,

    lineHeight: 17,

    includeFontPadding: false,
  },

  /* =====================================================
       ERROR / HELPER
    ===================================================== */

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
