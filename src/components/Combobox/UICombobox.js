import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const COMBOBOX_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const COMBOBOX_VARIANTS = {
  outlined: "outlined",
  filled: "filled",
  underline: "underline",
};

const UIComboboxComponent = forwardRef(function UICombobox(
  {
    options = [],

    value,
    defaultValue = null,

    onChange,
    onChangeText,

    label,
    placeholder = "Select...",

    helperText,
    errorText,

    error = false,
    success = false,

    variant = "outlined",
    size = "md",

    disabled = false,
    readOnly = false,
    required = false,

    loading = false,

    searchable = true,
    searchPlaceholder = "Search...",

    clearButton = true,

    openOnFocus = true,
    closeOnSelect = true,

    maxResults,
    listMaxHeight = 280,

    minSearchLength = 0,

    filterOption,

    getOptionLabel = defaultGetOptionLabel,
    getOptionValue = defaultGetOptionValue,

    isOptionDisabled = defaultIsOptionDisabled,

    renderOption,
    renderSelectedValue,
    renderEmpty,
    renderLoading,

    emptyText = "No options found",

    leftIcon,
    rightIcon,

    showArrow = true,

    inputStyle,
    labelStyle,
    helperStyle,
    errorStyle,

    containerStyle,
    inputContainerStyle,
    listContainerStyle,
    optionStyle,
    optionTextStyle,

    borderRadius,

    keyboardShouldPersistTaps = "handled",

    onOpen,
    onClose,
    onFocus,
    onBlur,

    testID,
    accessibilityLabel,

    ...textInputProps
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const [selectedValue, setSelectedValue] = useState(value ?? defaultValue);

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);

  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);

  const safeSize = COMBOBOX_SIZES[size] ? size : COMBOBOX_SIZES.md;

  const safeVariant = COMBOBOX_VARIANTS[variant]
    ? variant
    : COMBOBOX_VARIANTS.outlined;

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
  );

  const currentValue = value !== undefined ? value : selectedValue;

  const selectedOption = useMemo(
    () => findOption(options, currentValue, getOptionValue),
    [options, currentValue, getOptionValue],
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const hasError = Boolean(error || errorText);

  const hasSuccess = Boolean(success && !hasError);

  const inputColors = useMemo(
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

  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  const displayValue = selectedOption ? selectedLabel : "";

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (search.length < minSearchLength) {
      return options;
    }

    let result;

    if (filterOption) {
      result = options.filter((option) => filterOption(option, search));
    } else {
      result = options.filter((option) =>
        String(getOptionLabel(option) ?? "")
          .toLowerCase()
          .includes(search),
      );
    }

    if (maxResults && maxResults > 0) {
      return result.slice(0, maxResults);
    }

    return result;
  }, [
    options,
    query,
    minSearchLength,
    filterOption,
    getOptionLabel,
    maxResults,
  ]);

  const openDropdown = useCallback(() => {
    if (disabled || readOnly) {
      return;
    }

    setOpen(true);
    onOpen?.();
  }, [disabled, readOnly, onOpen]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    onClose?.();
  }, [onClose]);

  const handleFocus = useCallback(
    (event) => {
      if (disabled || readOnly) {
        return;
      }

      setFocused(true);

      if (openOnFocus) {
        openDropdown();
      }

      onFocus?.(event);
    },
    [disabled, readOnly, openOnFocus, openDropdown, onFocus],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);

      /*
       * Delay closing so a list
       * item can receive onPress.
       */
      setTimeout(() => {
        if (open) {
          closeDropdown();
        }
      }, 120);

      onBlur?.(event);
    },
    [open, closeDropdown, onBlur],
  );

  const handleTextChange = useCallback(
    (text) => {
      setQuery(text);
      onChangeText?.(text);

      if (!open) {
        openDropdown();
      }
    },
    [onChangeText, open, openDropdown],
  );

  const handleSelect = useCallback(
    (option) => {
      if (isOptionDisabled(option)) {
        return;
      }

      const nextValue = getOptionValue(option);

      if (value === undefined) {
        setSelectedValue(nextValue);
      }

      onChange?.(nextValue, option);

      setQuery("");

      if (closeOnSelect) {
        closeDropdown();
        Keyboard.dismiss();
      }
    },
    [
      isOptionDisabled,
      getOptionValue,
      value,
      onChange,
      closeOnSelect,
      closeDropdown,
    ],
  );

  const handleClear = useCallback(() => {
    if (value === undefined) {
      setSelectedValue(null);
    }

    setQuery("");

    onChange?.(null, null);

    onChangeText?.("");

    openDropdown();
  }, [value, onChange, onChangeText, openDropdown]);

  const handleArrowPress = useCallback(() => {
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [open, openDropdown, closeDropdown]);

  const assignRef = useCallback(
    (node) => {
      inputRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  return (
    <View testID={testID} style={[styles.wrapper, containerStyle]}>
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

      <View style={styles.controlWrapper}>
        <View
          style={[
            styles.inputContainer,
            {
              height: dimensions.height,

              backgroundColor: inputColors.background,

              borderColor: inputColors.border,

              borderWidth: inputColors.borderWidth,

              borderRadius: borderRadius ?? dimensions.borderRadius,
            },

            safeVariant === COMBOBOX_VARIANTS.underline
              ? styles.underline
              : null,

            inputContainerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

          {searchable && open ? (
            <TextInput
              {...textInputProps}
              ref={assignRef}
              value={query}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={!disabled && !readOnly}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted || "#737373"}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={accessibilityLabel || label}
              style={[
                styles.input,
                {
                  color: colors.text || "#111111",

                  fontSize: dimensions.fontSize,

                  lineHeight: dimensions.lineHeight,

                  paddingHorizontal: dimensions.paddingHorizontal,
                },
                inputStyle,
              ]}
            />
          ) : (
            <Pressable
              style={styles.valueButton}
              disabled={disabled || readOnly}
              onPress={() => {
                if (searchable) {
                  inputRef.current?.focus();
                } else {
                  handleArrowPress();
                }
              }}
            >
              {renderSelectedValue ? (
                renderSelectedValue({
                  option: selectedOption,
                  value: currentValue,
                })
              ) : (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.input,
                    {
                      color: selectedOption
                        ? colors.text || "#111111"
                        : colors.textMuted || "#737373",

                      fontSize: dimensions.fontSize,

                      lineHeight: dimensions.lineHeight,

                      paddingHorizontal: dimensions.paddingHorizontal,
                    },
                    inputStyle,
                  ]}
                >
                  {displayValue || placeholder}
                </Text>
              )}
            </Pressable>
          )}

          {clearButton && selectedOption && !disabled && !readOnly ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
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

          {loading ? (
            <View style={styles.rightIcon}>
              <ActivityIndicator
                size="small"
                color={colors.primary || "#FF5A1F"}
              />
            </View>
          ) : showArrow ? (
            <Pressable
              onPress={handleArrowPress}
              hitSlop={8}
              style={styles.rightIcon}
              disabled={disabled || readOnly}
            >
              <Text
                style={[
                  styles.arrow,
                  {
                    color: colors.textMuted || "#737373",
                  },
                ]}
              >
                {open ? "⌃" : "⌄"}
              </Text>
            </Pressable>
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
          ) : null}
        </View>

        {open && !disabled && !readOnly ? (
          <View
            style={[
              styles.dropdown,
              {
                maxHeight: listMaxHeight,

                backgroundColor: colors.card || colors.background || "#FFFFFF",

                borderColor: colors.border || "#E5E5E5",
              },
              listContainerStyle,
            ]}
          >
            {loading ? (
              renderLoading ? (
                renderLoading()
              ) : (
                <View style={styles.center}>
                  <ActivityIndicator color={colors.primary || "#FF5A1F"} />
                </View>
              )
            ) : filteredOptions.length === 0 ? (
              renderEmpty ? (
                renderEmpty({
                  query,
                })
              ) : (
                <View style={styles.empty}>
                  <Text
                    style={[
                      styles.emptyText,
                      {
                        color: colors.textSecondary || "#525252",
                      },
                    ]}
                  >
                    {emptyText}
                  </Text>
                </View>
              )
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item, index) =>
                  String(getOptionValue(item) ?? index)
                }
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  const selected = getOptionValue(item) === currentValue;

                  const optionDisabled = isOptionDisabled(item);

                  return (
                    <Pressable
                      disabled={optionDisabled}
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.option,

                        {
                          backgroundColor: selected
                            ? colors.primarySoft || "#FFF0EA"
                            : "transparent",

                          opacity: optionDisabled ? 0.45 : 1,
                        },

                        optionStyle,
                      ]}
                    >
                      {renderOption ? (
                        renderOption({
                          item,
                          index,
                          selected,
                          disabled: optionDisabled,
                          select: () => handleSelect(item),
                        })
                      ) : (
                        <>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.optionText,

                              {
                                color: selected
                                  ? colors.primary || "#FF5A1F"
                                  : colors.text || "#111111",
                              },

                              optionTextStyle,
                            ]}
                          >
                            {getOptionLabel(item)}
                          </Text>

                          {selected ? (
                            <Text
                              style={[
                                styles.check,
                                {
                                  color: colors.primary || "#FF5A1F",
                                },
                              ]}
                            >
                              ✓
                            </Text>
                          ) : null}
                        </>
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        ) : null}
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
  );
});

function defaultGetOptionLabel(option) {
  if (option === null || option === undefined) {
    return "";
  }

  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  return (
    option.label ?? option.name ?? option.title ?? String(option.value ?? "")
  );
}

function defaultGetOptionValue(option) {
  if (option === null || option === undefined) {
    return null;
  }

  if (typeof option === "string" || typeof option === "number") {
    return option;
  }

  return option.value ?? option.id ?? option.key;
}

function defaultIsOptionDisabled(option) {
  return Boolean(option?.disabled);
}

function findOption(options, value, getOptionValue) {
  if (value === null || value === undefined) {
    return null;
  }

  return options.find((option) => getOptionValue(option) === value) || null;
}

function getDimensions(size, theme) {
  const radius = theme?.radius || {};

  switch (size) {
    case COMBOBOX_SIZES.sm:
      return {
        height: 42,
        paddingHorizontal: 10,
        fontSize: 13,
        lineHeight: 18,
        borderRadius: radius.sm ?? 8,
      };

    case COMBOBOX_SIZES.lg:
      return {
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        lineHeight: 22,
        borderRadius: radius.md ?? 12,
      };

    case COMBOBOX_SIZES.md:
    default:
      return {
        height: 48,
        paddingHorizontal: 13,
        fontSize: 14,
        lineHeight: 20,
        borderRadius: radius.sm ?? 10,
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

      borderWidth: 1,
    };
  }

  if (hasError) {
    return {
      background: colors.background || "#FFFFFF",

      border: colors.danger || "#DC2626",

      borderWidth: 1,
    };
  }

  if (hasSuccess) {
    return {
      background: colors.background || "#FFFFFF",

      border: colors.success || "#16A34A",

      borderWidth: 1,
    };
  }

  if (variant === COMBOBOX_VARIANTS.filled) {
    return {
      background: colors.input || "#F7F7F7",

      border: focused ? colors.primary || "#FF5A1F" : "transparent",

      borderWidth: focused ? 1.5 : 0,
    };
  }

  if (variant === COMBOBOX_VARIANTS.underline) {
    return {
      background: "transparent",

      border: focused
        ? colors.primary || "#FF5A1F"
        : colors.border || "#E5E5E5",

      borderWidth: 0,
    };
  }

  return {
    background: colors.background || "#FFFFFF",

    border: focused ? colors.primary || "#FF5A1F" : colors.border || "#E5E5E5",

    borderWidth: focused ? 1.5 : 1,
  };
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    zIndex: 100,
  },

  controlWrapper: {
    position: "relative",
    zIndex: 100,
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

    alignItems: "center",

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

    includeFontPadding: false,
  },

  valueButton: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  leftIcon: {
    paddingLeft: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  rightIcon: {
    width: 38,

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

  arrow: {
    fontSize: 20,

    lineHeight: 20,

    includeFontPadding: false,
  },

  dropdown: {
    position: "absolute",

    top: "100%",

    left: 0,

    right: 0,

    marginTop: 5,

    borderWidth: 1,

    borderRadius: 10,

    overflow: "hidden",

    elevation: 8,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.16,

    shadowRadius: 8,

    zIndex: 1000,
  },

  option: {
    minHeight: 48,

    paddingHorizontal: 14,

    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  optionText: {
    flex: 1,

    fontSize: 14,

    lineHeight: 20,

    includeFontPadding: false,
  },

  check: {
    marginLeft: 10,

    fontSize: 18,

    fontWeight: "700",

    includeFontPadding: false,
  },

  center: {
    minHeight: 80,

    alignItems: "center",

    justifyContent: "center",
  },

  empty: {
    minHeight: 80,

    padding: 16,

    alignItems: "center",

    justifyContent: "center",
  },

  emptyText: {
    fontSize: 13,

    lineHeight: 18,

    includeFontPadding: false,
  },

  message: {
    marginTop: 6,

    fontSize: 12,

    lineHeight: 16,

    includeFontPadding: false,
  },
});

export const UICombobox = memo(UIComboboxComponent);

UICombobox.displayName = "UICombobox";

export {
  COMBOBOX_SIZES as UIComboboxSizes,
  COMBOBOX_VARIANTS as UIComboboxVariants,
};

export default UICombobox;
