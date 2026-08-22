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

const AUTOCOMPLETE_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const AUTOCOMPLETE_VARIANTS = {
  outlined: "outlined",
  filled: "filled",
  underline: "underline",
};

const UIAutocompleteComponent = forwardRef(function UIAutocomplete(
  {
    options = [],

    value,
    defaultValue = null,

    onChange,
    onChangeText,

    label,
    placeholder = "Search...",

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

    minSearchLength = 0,

    debounceMs = 250,

    filterOption,

    getOptionLabel = defaultGetOptionLabel,
    getOptionValue = defaultGetOptionValue,

    renderOption,
    renderEmpty,
    renderLoading,

    emptyText = "No results found",

    leftIcon,
    rightIcon,

    clearButton = true,

    showArrow = true,

    maxResults,

    listMaxHeight = 280,

    keyboardShouldPersistTaps = "handled",

    closeOnSelect = true,

    openOnFocus = true,

    onFocus,
    onBlur,

    textInputProps,

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

    testID,
    accessibilityLabel,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const [inputText, setInputText] = useState(
    getInitialText(defaultValue, options, getOptionLabel),
  );

  const [selectedValue, setSelectedValue] = useState(
    value !== undefined ? value : defaultValue,
  );

  const [focused, setFocused] = useState(false);

  const [open, setOpen] = useState(false);

  const debounceRef = useRef(null);

  const safeSize = AUTOCOMPLETE_SIZES[size] ? size : AUTOCOMPLETE_SIZES.md;

  const safeVariant = AUTOCOMPLETE_VARIANTS[variant]
    ? variant
    : AUTOCOMPLETE_VARIANTS.outlined;

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
  );

  /*
   * Keep internal selection
   * synchronized with controlled value.
   */
  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setSelectedValue(value);

    const selectedOption = findOption(options, value, getOptionValue);

    if (selectedOption) {
      setInputText(getOptionLabel(selectedOption));
    }
  }, [value, options, getOptionValue, getOptionLabel]);

  const currentValue = value !== undefined ? value : selectedValue;

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

  /*
   * Debounced parent callback.
   *
   * This is useful when the developer
   * connects onChangeText to an API.
   */
  const emitTextChange = useCallback(
    (text) => {
      onChangeText?.(text);

      if (!onChangeText) {
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // The text callback itself
        // already receives the value.
      }, debounceMs);
    },
    [onChangeText, debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleFocus = useCallback(
    (event) => {
      if (disabled || readOnly) {
        return;
      }

      setFocused(true);

      if (openOnFocus) {
        setOpen(inputText.length >= minSearchLength);
      }

      onFocus?.(event);
    },
    [
      disabled,
      readOnly,
      openOnFocus,
      inputText.length,
      minSearchLength,
      onFocus,
    ],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);

      /*
       * Delay closing so a list item
       * can receive its press event.
       */
      setTimeout(() => {
        setOpen(false);
      }, 120);

      onBlur?.(event);
    },
    [onBlur],
  );

  const handleTextChange = useCallback(
    (text) => {
      setInputText(text);

      /*
       * Once user starts typing,
       * current selection is no longer
       * necessarily valid.
       */
      if (
        text !==
        getOptionLabel(findOption(options, currentValue, getOptionValue))
      ) {
        if (value === undefined) {
          setSelectedValue(null);
        }
      }

      if (text.length >= minSearchLength) {
        setOpen(true);
      } else {
        setOpen(false);
      }

      emitTextChange(text);
    },
    [
      options,
      currentValue,
      getOptionValue,
      getOptionLabel,
      value,
      minSearchLength,
      emitTextChange,
    ],
  );

  const handleSelect = useCallback(
    (option) => {
      const optionValue = getOptionValue(option);

      const optionLabel = getOptionLabel(option);

      setSelectedValue(optionValue);

      setInputText(optionLabel);

      onChange?.(optionValue, option);

      setOpen(false);

      if (closeOnSelect) {
        Keyboard.dismiss();
      }
    },
    [getOptionValue, getOptionLabel, onChange, closeOnSelect],
  );

  const handleClear = useCallback(() => {
    setInputText("");

    if (value === undefined) {
      setSelectedValue(null);
    }

    onChange?.(null, null);

    onChangeText?.("");

    setOpen(minSearchLength === 0);
  }, [value, onChange, onChangeText, minSearchLength]);

  const filteredOptions = useMemo(() => {
    const query = inputText.trim().toLowerCase();

    if (query.length < minSearchLength) {
      return [];
    }

    let result;

    if (filterOption) {
      result = options.filter((option) => filterOption(option, query));
    } else {
      result = options.filter((option) => {
        const label = getOptionLabel(option);

        return String(label ?? "")
          .toLowerCase()
          .includes(query);
      });
    }

    if (maxResults && maxResults > 0) {
      return result.slice(0, maxResults);
    }

    return result;
  }, [
    options,
    inputText,
    minSearchLength,
    filterOption,
    getOptionLabel,
    maxResults,
  ]);

  const showDropdown =
    open && !disabled && !readOnly && inputText.length >= minSearchLength;

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

      <View style={styles.inputWrapper}>
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

            safeVariant === AUTOCOMPLETE_VARIANTS.underline
              ? styles.underline
              : null,

            inputContainerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

          <TextInput
            {...textInputProps}
            {...props}
            ref={ref}
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled && !readOnly}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted || "#737373"}
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel={accessibilityLabel || label}
            style={[
              styles.input,
              {
                color: disabled
                  ? colors.textDisabled || "#A3A3A3"
                  : colors.text || "#111111",

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.lineHeight,

                paddingHorizontal: dimensions.paddingHorizontal,
              },
              inputStyle,
            ]}
          />

          {clearButton && inputText.length > 0 && !disabled && !readOnly ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear"
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
            <View style={styles.rightIcon}>
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
            </View>
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
          ) : null}
        </View>

        {showDropdown ? (
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
                <View style={styles.centerContent}>
                  <ActivityIndicator color={colors.primary || "#FF5A1F"} />
                </View>
              )
            ) : filteredOptions.length === 0 ? (
              renderEmpty ? (
                renderEmpty({
                  query: inputText,
                })
              ) : (
                <View style={styles.emptyContainer}>
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

                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: selected
                            ? colors.primarySoft || "#FFF0EA"
                            : "transparent",
                        },
                        optionStyle,
                      ]}
                    >
                      {renderOption ? (
                        renderOption({
                          item,
                          index,
                          selected,
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

  if (typeof option === "string") {
    return option;
  }

  if (typeof option === "number") {
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

function getInitialText(value, options, getOptionLabel) {
  if (value === null || value === undefined) {
    return "";
  }

  const option = findOption(options, value, defaultGetOptionValue);

  return option ? getOptionLabel(option) : "";
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
    case AUTOCOMPLETE_SIZES.sm:
      return {
        height: 42,
        paddingHorizontal: 10,
        fontSize: 13,
        lineHeight: 18,
        borderRadius: radius.sm ?? 8,
      };

    case AUTOCOMPLETE_SIZES.lg:
      return {
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        lineHeight: 22,
        borderRadius: radius.md ?? 12,
      };

    case AUTOCOMPLETE_SIZES.md:
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

  if (variant === AUTOCOMPLETE_VARIANTS.filled) {
    return {
      background: colors.input || "#F7F7F7",

      border: focused ? colors.primary || "#FF5A1F" : "transparent",

      borderWidth: focused ? 1.5 : 0,
    };
  }

  if (variant === AUTOCOMPLETE_VARIANTS.underline) {
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

  inputWrapper: {
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

  emptyContainer: {
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

  centerContent: {
    minHeight: 80,

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

export const UIAutocomplete = memo(UIAutocompleteComponent);

UIAutocomplete.displayName = "UIAutocomplete";

export {
  AUTOCOMPLETE_SIZES as UIAutocompleteSizes,
  AUTOCOMPLETE_VARIANTS as UIAutocompleteVariants,
};

export default UIAutocomplete;
