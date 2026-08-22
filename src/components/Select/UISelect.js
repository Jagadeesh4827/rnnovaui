import React, { forwardRef, memo, useCallback, useMemo, useState } from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const SELECT_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SELECT_VARIANTS = {
  outlined: "outlined",
  filled: "filled",
  underline: "underline",
};

const FALLBACK_COLORS = {
  background: "#FFFFFF",
  input: "#F7F7F7",
  text: "#111111",
  textSecondary: "#525252",
  textMuted: "#737373",
  textDisabled: "#A3A3A3",
  border: "#E5E5E5",
  primary: "#FF5A1F",
  danger: "#DC2626",
  success: "#16A34A",
  overlay: "rgba(0,0,0,0.45)",
  card: "#FFFFFF",
};

const UISelectComponent = forwardRef(function UISelect(
  {
    value,
    defaultValue,

    onValueChange,
    onOpen,
    onClose,

    options = [],

    label,
    placeholder = "Select an option",

    helperText,
    errorText,
    successText,

    error = false,
    success = false,

    variant = "outlined",
    size = "md",

    disabled = false,

    leftIcon,
    rightIcon,

    searchable = false,
    searchPlaceholder = "Search...",

    modalTitle,

    emptyText = "No options found",

    optionKey = "value",
    optionLabel = "label",

    renderOption,
    renderSelectedValue,

    labelStyle,
    valueStyle,
    placeholderStyle,
    helperStyle,
    errorStyle,
    successStyle,

    containerStyle,
    dropdownStyle,
    optionStyle,

    activeOptionStyle,
    activeOptionTextStyle,

    maxHeight = 300,

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

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const safeSize = SELECT_SIZES[size] ? size : SELECT_SIZES.md;

  const safeVariant = SELECT_VARIANTS[variant]
    ? variant
    : SELECT_VARIANTS.outlined;

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
  );

  const selectedOption = useMemo(
    () => options.find((option) => option?.[optionKey] === value),
    [options, optionKey, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    const query = search.trim().toLowerCase();

    return options.filter((option) =>
      String(option?.[optionLabel] ?? "")
        .toLowerCase()
        .includes(query),
    );
  }, [options, searchable, search, optionLabel]);

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

  const openSelect = useCallback(() => {
    if (disabled) {
      return;
    }

    setSearch("");
    setOpen(true);

    onOpen?.();
  }, [disabled, onOpen]);

  const closeSelect = useCallback(() => {
    setOpen(false);
    setSearch("");

    onClose?.();
  }, [onClose]);

  const selectOption = useCallback(
    (option) => {
      if (!option) {
        return;
      }

      onValueChange?.(option?.[optionKey], option);

      closeSelect();
    },
    [onValueChange, optionKey, closeSelect],
  );

  const resolvedColors = getSelectColors(
    colors,
    safeVariant,
    hasError,
    hasSuccess,
    open,
    disabled,
  );

  const resolvedLabel = selectedOption?.[optionLabel];

  const displayValue = selectedOption
    ? renderSelectedValue
      ? renderSelectedValue(selectedOption)
      : resolvedLabel
    : null;

  return (
    <>
      <View
        {...props}
        testID={testID}
        style={[
          styles.wrapper,

          {
            width: fullWidth ? "100%" : undefined,
          },

          style,
        ]}
      >
        {label ? (
          <Text
            style={[
              styles.label,

              {
                color: disabled
                  ? colors.textDisabled || FALLBACK_COLORS.textDisabled
                  : colors.text || FALLBACK_COLORS.text,
              },

              labelStyle,
            ]}
          >
            {label}
          </Text>
        ) : null}

        <Pressable
          ref={ref}
          disabled={disabled}
          onPress={openSelect}
          accessibilityRole="button"
          accessibilityState={{
            disabled,
            expanded: open,
          }}
          style={[
            styles.container,

            {
              minHeight: dimensions.height,

              borderRadius: borderRadius ?? dimensions.borderRadius,

              backgroundColor: resolvedColors.background,

              borderColor: resolvedColors.border,

              borderWidth: resolvedColors.borderWidth,

              paddingHorizontal: dimensions.paddingHorizontal,
            },

            safeVariant === SELECT_VARIANTS.underline ? styles.underline : null,

            containerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

          <View style={styles.valueContainer}>
            {displayValue ? (
              typeof displayValue === "string" ? (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.value,

                    {
                      color: colors.text || FALLBACK_COLORS.text,

                      fontSize: dimensions.fontSize,

                      lineHeight: dimensions.lineHeight,
                    },

                    valueStyle,
                  ]}
                >
                  {displayValue}
                </Text>
              ) : (
                displayValue
              )
            ) : (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.placeholder,

                  {
                    color: colors.textMuted || FALLBACK_COLORS.textMuted,

                    fontSize: dimensions.fontSize,

                    lineHeight: dimensions.lineHeight,
                  },

                  placeholderStyle,
                ]}
              >
                {placeholder}
              </Text>
            )}
          </View>

          <View style={styles.chevron}>
            {rightIcon || (
              <Text
                style={[
                  styles.chevronText,
                  {
                    color:
                      colors.textSecondary || FALLBACK_COLORS.textSecondary,
                  },
                ]}
              >
                ▼
              </Text>
            )}
          </View>
        </Pressable>

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

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeSelect}
      >
        <Pressable
          style={[
            styles.modalBackdrop,

            {
              backgroundColor: colors.backdrop || FALLBACK_COLORS.overlay,
            },
          ]}
          onPress={closeSelect}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.dropdown,

              {
                backgroundColor:
                  colors.card || colors.background || FALLBACK_COLORS.card,

                maxHeight,
              },

              dropdownStyle,
            ]}
          >
            {modalTitle ? (
              <Text
                style={[
                  styles.modalTitle,

                  {
                    color: colors.text || FALLBACK_COLORS.text,
                  },
                ]}
              >
                {modalTitle}
              </Text>
            ) : null}

            {searchable ? (
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={
                  colors.textMuted || FALLBACK_COLORS.textMuted
                }
                style={[
                  styles.searchInput,

                  {
                    color: colors.text || FALLBACK_COLORS.text,

                    backgroundColor: colors.input || FALLBACK_COLORS.input,

                    borderColor: colors.border || FALLBACK_COLORS.border,
                  },
                ]}
              />
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => String(item?.[optionKey] ?? index)}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text
                  style={[
                    styles.emptyText,

                    {
                      color: colors.textMuted || FALLBACK_COLORS.textMuted,
                    },
                  ]}
                >
                  {emptyText}
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item?.[optionKey] === value;

                if (renderOption) {
                  return (
                    <Pressable onPress={() => selectOption(item)}>
                      {renderOption(item, isSelected)}
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    onPress={() => selectOption(item)}
                    style={[
                      styles.option,

                      optionStyle,

                      isSelected
                        ? [
                            styles.selectedOption,

                            {
                              backgroundColor: colors.primarySoft || "#FFF0EA",
                            },

                            activeOptionStyle,
                          ]
                        : null,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.optionText,

                        {
                          color: isSelected
                            ? colors.primary || FALLBACK_COLORS.primary
                            : colors.text || FALLBACK_COLORS.text,
                        },

                        isSelected ? activeOptionTextStyle : null,
                      ]}
                    >
                      {item?.[optionLabel]}
                    </Text>

                    {isSelected ? (
                      <Text
                        style={[
                          styles.check,
                          {
                            color: colors.primary || FALLBACK_COLORS.primary,
                          },
                        ]}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});

function getSelectColors(
  colors,
  variant,
  hasError,
  hasSuccess,
  focused,
  disabled,
) {
  if (disabled) {
    return {
      background: colors.inputDisabled || FALLBACK_COLORS.input,

      border: colors.border || FALLBACK_COLORS.border,

      borderWidth: variant === SELECT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (hasError) {
    return {
      background:
        variant === SELECT_VARIANTS.filled
          ? colors.input || FALLBACK_COLORS.input
          : colors.background || FALLBACK_COLORS.background,

      border: colors.danger || FALLBACK_COLORS.danger,

      borderWidth: variant === SELECT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (hasSuccess) {
    return {
      background:
        variant === SELECT_VARIANTS.filled
          ? colors.input || FALLBACK_COLORS.input
          : colors.background || FALLBACK_COLORS.background,

      border: colors.success || FALLBACK_COLORS.success,

      borderWidth: variant === SELECT_VARIANTS.underline ? 0 : 1,
    };
  }

  if (focused) {
    return {
      background:
        variant === SELECT_VARIANTS.filled
          ? colors.input || FALLBACK_COLORS.input
          : colors.background || FALLBACK_COLORS.background,

      border: colors.primary || FALLBACK_COLORS.primary,

      borderWidth: variant === SELECT_VARIANTS.underline ? 2 : 1,
    };
  }

  if (variant === SELECT_VARIANTS.filled) {
    return {
      background: colors.input || FALLBACK_COLORS.input,

      border: "transparent",

      borderWidth: 0,
    };
  }

  if (variant === SELECT_VARIANTS.underline) {
    return {
      background: "transparent",

      border: colors.border || FALLBACK_COLORS.border,

      borderWidth: 0,
    };
  }

  return {
    background: colors.background || FALLBACK_COLORS.background,

    border: colors.border || FALLBACK_COLORS.border,

    borderWidth: 1,
  };
}

function getDimensions(size, theme) {
  const radius = theme?.radius || {};

  switch (size) {
    case SELECT_SIZES.sm:
      return {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: radius.sm ?? 8,
        fontSize: 13,
        lineHeight: 18,
      };

    case SELECT_SIZES.lg:
      return {
        height: 56,
        paddingHorizontal: 16,
        borderRadius: radius.md ?? 12,
        fontSize: 16,
        lineHeight: 22,
      };

    case SELECT_SIZES.md:
    default:
      return {
        height: 48,
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

    overflow: "hidden",
  },

  underline: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderRadius: 0,
  },

  leftIcon: {
    marginRight: 10,

    alignItems: "center",

    justifyContent: "center",
  },

  valueContainer: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  value: {
    fontWeight: "500",

    includeFontPadding: false,
  },

  placeholder: {
    includeFontPadding: false,
  },

  chevron: {
    marginLeft: 10,

    alignItems: "center",

    justifyContent: "center",
  },

  chevronText: {
    fontSize: 10,

    includeFontPadding: false,
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },

  modalBackdrop: {
    flex: 1,

    justifyContent: "center",

    padding: 20,
  },

  dropdown: {
    width: "100%",

    borderRadius: 14,

    overflow: "hidden",

    paddingVertical: 8,

    elevation: 8,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.2,

    shadowRadius: 12,
  },

  modalTitle: {
    paddingHorizontal: 16,

    paddingTop: 12,

    paddingBottom: 10,

    fontSize: 17,

    lineHeight: 22,

    fontWeight: "700",

    includeFontPadding: false,
  },

  searchInput: {
    marginHorizontal: 12,

    marginBottom: 8,

    height: 44,

    borderWidth: 1,

    borderRadius: 10,

    paddingHorizontal: 12,

    fontSize: 14,
  },

  option: {
    minHeight: 48,

    paddingHorizontal: 16,

    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  selectedOption: {
    marginHorizontal: 6,

    borderRadius: 8,
  },

  optionText: {
    flex: 1,

    fontSize: 14,

    lineHeight: 20,

    includeFontPadding: false,
  },

  check: {
    marginLeft: 12,

    fontSize: 18,

    fontWeight: "700",

    includeFontPadding: false,
  },

  emptyText: {
    padding: 20,

    textAlign: "center",

    fontSize: 14,

    includeFontPadding: false,
  },
});

export const UISelect = memo(UISelectComponent);

UISelect.displayName = "UISelect";

export { SELECT_SIZES as UISelectSizes, SELECT_VARIANTS as UISelectVariants };

export default UISelect;
