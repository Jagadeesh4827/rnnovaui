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
  Dimensions,
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

const AUTOCOMPLETE_PLACEMENTS = {
  auto: "auto",
  top: "top",
  bottom: "bottom",
};

const DEFAULT_DROPDOWN_MAX_HEIGHT = 280;
const DEFAULT_MIN_DROPDOWN_HEIGHT = 60;
const DEFAULT_SCREEN_MARGIN = 12;
const DEFAULT_GAP = 5;

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

    listMaxHeight = DEFAULT_DROPDOWN_MAX_HEIGHT,

    minDropdownHeight = DEFAULT_MIN_DROPDOWN_HEIGHT,

    dropdownGap = DEFAULT_GAP,

    screenMargin = DEFAULT_SCREEN_MARGIN,

    placement = "auto",

    keyboardShouldPersistTaps = "handled",

    closeOnSelect = true,

    openOnFocus = true,

    closeOnOutsidePress = true,

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

    onOpen,
    onClose,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const wrapperRef = useRef(null);

  const inputRef = useRef(null);

  const debounceRef = useRef(null);

  const [inputText, setInputText] = useState(() =>
    getInitialText(defaultValue, options, getOptionLabel),
  );

  const [selectedValue, setSelectedValue] = useState(
    value !== undefined ? value : defaultValue,
  );

  const [focused, setFocused] = useState(false);

  const [open, setOpen] = useState(false);

  const [resolvedPlacement, setResolvedPlacement] = useState(
    placement === "top" ? "top" : "bottom",
  );

  const [dropdownHeight, setDropdownHeight] = useState(listMaxHeight);

  const [measuredInput, setMeasuredInput] = useState(null);

  const safeSize = AUTOCOMPLETE_SIZES[size] ? size : AUTOCOMPLETE_SIZES.md;

  const safeVariant = AUTOCOMPLETE_VARIANTS[variant]
    ? variant
    : AUTOCOMPLETE_VARIANTS.outlined;

  const safePlacement = AUTOCOMPLETE_PLACEMENTS[placement]
    ? placement
    : AUTOCOMPLETE_PLACEMENTS.auto;

  const dimensions = useMemo(
    () => getDimensions(safeSize, theme),
    [safeSize, theme],
  );

  /*
   * Controlled value synchronization.
   */
  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setSelectedValue(value);

    const selectedOption = findOption(options, value, getOptionValue);

    if (selectedOption) {
      setInputText(resolveOptionLabel(getOptionLabel, selectedOption));
    }
  }, [value, options, getOptionValue, getOptionLabel]);

  /*
   * Safe option resolvers.
   *
   * Even if a developer passes:
   *
   * getOptionLabel={(item) => item.name}
   *
   * a null option will not crash
   * the component.
   */
  const safeGetOptionLabel = useCallback(
    (option) => resolveOptionLabel(getOptionLabel, option),
    [getOptionLabel],
  );

  const safeGetOptionValue = useCallback(
    (option) => resolveOptionValue(getOptionValue, option),
    [getOptionValue],
  );

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
   * Clean invalid backend values.
   */
  const safeOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      return [];
    }

    return options.filter((option) => option !== null && option !== undefined);
  }, [options]);

  /*
   * Debounced text callback.
   *
   * The component immediately updates
   * its own UI, while the callback is
   * debounced for API search use.
   */
  const emitTextChange = useCallback(
    (text) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!onChangeText) {
        return;
      }

      debounceRef.current = setTimeout(() => {
        onChangeText(text);
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

  /*
   * Find available screen space and
   * automatically choose top/bottom.
   */
  const calculatePlacement = useCallback(() => {
    if (!wrapperRef.current) {
      return;
    }

    wrapperRef.current.measureInWindow((x, y, width, height) => {
      const screenHeight = Dimensions.get("window").height;

      const spaceAbove = Math.max(0, y - screenMargin);

      const spaceBelow = Math.max(
        0,
        screenHeight - (y + height) - screenMargin,
      );

      const requiredHeight = Math.min(
        listMaxHeight,
        Math.max(minDropdownHeight, filteredOptionsRef.current.length * 48),
      );

      let nextPlacement = "bottom";

      if (safePlacement === AUTOCOMPLETE_PLACEMENTS.top) {
        nextPlacement = "top";
      } else if (safePlacement === AUTOCOMPLETE_PLACEMENTS.bottom) {
        nextPlacement = "bottom";
      } else if (spaceBelow >= requiredHeight) {
        nextPlacement = "bottom";
      } else if (spaceAbove >= requiredHeight) {
        nextPlacement = "top";
      } else {
        /*
         * Neither side has enough
         * room. Use whichever has
         * more space.
         */
        nextPlacement = spaceAbove > spaceBelow ? "top" : "bottom";
      }

      const availableSpace =
        nextPlacement === "top"
          ? spaceAbove - dropdownGap
          : spaceBelow - dropdownGap;

      const finalHeight = Math.max(
        minDropdownHeight,
        Math.min(listMaxHeight, Math.max(0, availableSpace)),
      );

      setResolvedPlacement(nextPlacement);

      setDropdownHeight(finalHeight);

      setMeasuredInput({
        x,
        y,
        width,
        height,
      });
    });
  }, [
    safePlacement,
    listMaxHeight,
    minDropdownHeight,
    screenMargin,
    dropdownGap,
  ]);

  /*
   * We keep the latest filtered list
   * in a ref so placement calculation
   * doesn't need to recreate itself
   * on every keystroke.
   */
  const filteredOptionsRef = useRef([]);

  const handleFocus = useCallback(
    (event) => {
      if (disabled || readOnly) {
        return;
      }

      setFocused(true);

      if (openOnFocus && inputText.length >= minSearchLength) {
        calculatePlacement();

        setOpen(true);

        onOpen?.();
      }

      onFocus?.(event);
    },
    [
      disabled,
      readOnly,
      openOnFocus,
      inputText.length,
      minSearchLength,
      calculatePlacement,
      onOpen,
      onFocus,
    ],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);

      /*
       * Delay slightly so an option
       * Pressable can receive the
       * touch before closing.
       */
      if (closeOnOutsidePress) {
        setTimeout(() => {
          setOpen(false);
          onClose?.();
        }, 160);
      }

      onBlur?.(event);
    },
    [closeOnOutsidePress, onClose, onBlur],
  );

  const handleTextChange = useCallback(
    (text) => {
      setInputText(text);

      if (value === undefined) {
        setSelectedValue(null);
      }

      if (text.length >= minSearchLength) {
        calculatePlacement();

        if (!open) {
          onOpen?.();
        }

        setOpen(true);
      } else {
        setOpen(false);
      }

      emitTextChange(text);
    },
    [value, minSearchLength, calculatePlacement, emitTextChange, open, onOpen],
  );

  const handleSelect = useCallback(
    (option) => {
      if (option === null || option === undefined) {
        return;
      }

      const optionValue = safeGetOptionValue(option);

      const optionLabel = safeGetOptionLabel(option);

      setSelectedValue(optionValue);

      setInputText(optionLabel);

      onChange?.(optionValue, option);

      if (closeOnSelect) {
        setOpen(false);

        onClose?.();

        Keyboard.dismiss();
      }
    },
    [safeGetOptionValue, safeGetOptionLabel, onChange, closeOnSelect, onClose],
  );

  const handleClear = useCallback(() => {
    setInputText("");

    if (value === undefined) {
      setSelectedValue(null);
    }

    onChange?.(null, null);

    if (onChangeText) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      onChangeText("");
    }

    if (minSearchLength === 0) {
      calculatePlacement();

      setOpen(true);

      onOpen?.();
    } else {
      setOpen(false);
    }
  }, [
    value,
    onChange,
    onChangeText,
    minSearchLength,
    calculatePlacement,
    onOpen,
  ]);

  /*
   * Filter only valid options.
   *
   * FlatList then receives a clean
   * array with no null values.
   */
  const filteredOptions = useMemo(() => {
    const query = inputText.trim().toLowerCase();

    if (query.length < minSearchLength) {
      return [];
    }

    let result;

    if (filterOption) {
      result = safeOptions.filter((option) => {
        try {
          return Boolean(filterOption(option, query));
        } catch {
          return false;
        }
      });
    } else {
      result = safeOptions.filter((option) =>
        safeGetOptionLabel(option).toLowerCase().includes(query),
      );
    }

    if (maxResults && maxResults > 0) {
      return result.slice(0, maxResults);
    }

    return result;
  }, [
    safeOptions,
    inputText,
    minSearchLength,
    filterOption,
    safeGetOptionLabel,
    maxResults,
  ]);

  filteredOptionsRef.current = filteredOptions;

  /*
   * Recalculate placement when
   * results change.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      calculatePlacement();
    }, 0);

    return () => clearTimeout(timer);
  }, [filteredOptions.length, open, calculatePlacement]);

  /*
   * Recalculate after keyboard
   * changes screen dimensions.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const showSubscription = Dimensions.addEventListener(
      "change",
      calculatePlacement,
    );

    return () => {
      showSubscription?.remove?.();
    };
  }, [open, calculatePlacement]);

  const showDropdown =
    open && !disabled && !readOnly && inputText.length >= minSearchLength;

  /*
   * Keep the dropdown aligned to
   * the measured input width.
   */
  const dropdownWidth = measuredInput?.width || undefined;

  return (
    <View
      ref={wrapperRef}
      testID={testID}
      style={[
        styles.wrapper,
        {
          zIndex: showDropdown ? 99999 : 10,

          elevation: showDropdown ? 999 : 1,
        },
        containerStyle,
      ]}
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
          styles.inputWrapper,
          {
            zIndex: showDropdown ? 99999 : 10,

            elevation: showDropdown ? 999 : 1,
          },
        ]}
      >
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
            ref={(node) => {
              inputRef.current = node;

              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
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
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
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
          ) : null}
        </View>

        {showDropdown ? (
          <View
            style={[
              styles.dropdown,

              resolvedPlacement === "top"
                ? styles.dropdownTop
                : styles.dropdownBottom,

              {
                width: dropdownWidth,

                maxHeight: dropdownHeight,

                minHeight: Math.min(minDropdownHeight, dropdownHeight),

                backgroundColor: colors.card || colors.background || "#FFFFFF",

                borderColor: colors.border || "#E5E5E5",

                zIndex: 999999,

                elevation: 999,
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
                  String(safeGetOptionValue(item) ?? `option-${index}`)
                }
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={30}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                getItemLayout={(data, index) => ({
                  length: 48,
                  offset: 48 * index,
                  index,
                })}
                renderItem={({ item, index }) => {
                  if (item === null || item === undefined) {
                    return null;
                  }

                  const optionValue = safeGetOptionValue(item);

                  const selected = optionValue === currentValue;

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
                            {safeGetOptionLabel(item)}
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

/*
 * ------------------------------------------
 * SAFE RESOLVERS
 * ------------------------------------------
 */

function resolveOptionLabel(resolver, option) {
  if (option === null || option === undefined) {
    return "";
  }

  try {
    const result = resolver?.(option);

    if (result === null || result === undefined) {
      return "";
    }

    return String(result);
  } catch {
    return "";
  }
}

function resolveOptionValue(resolver, option) {
  if (option === null || option === undefined) {
    return null;
  }

  try {
    return resolver?.(option) ?? null;
  } catch {
    return null;
  }
}

/*
 * ------------------------------------------
 * DEFAULT RESOLVERS
 * ------------------------------------------
 */

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

  return option.value ?? option.id ?? option.key ?? null;
}

/*
 * ------------------------------------------
 * INITIAL VALUE
 * ------------------------------------------
 */

function getInitialText(value, options, getOptionLabel) {
  if (value === null || value === undefined) {
    return "";
  }

  const option = findOption(options, value, defaultGetOptionValue);

  return option ? resolveOptionLabel(getOptionLabel, option) : "";
}

/*
 * ------------------------------------------
 * FIND OPTION
 * ------------------------------------------
 */

function findOption(options, value, getOptionValue) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Array.isArray(options)) {
    return null;
  }

  return (
    options.find((option) => {
      if (option === null || option === undefined) {
        return false;
      }

      return resolveOptionValue(getOptionValue, option) === value;
    }) || null
  );
}

/*
 * ------------------------------------------
 * DIMENSIONS
 * ------------------------------------------
 */

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

/*
 * ------------------------------------------
 * COLORS
 * ------------------------------------------
 */

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

/*
 * ------------------------------------------
 * STYLES
 * ------------------------------------------
 */

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",

    position: "relative",

    overflow: "visible",
  },

  inputWrapper: {
    position: "relative",

    overflow: "visible",
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

    left: 0,

    overflow: "hidden",

    borderWidth: 1,

    borderRadius: 10,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 8,

    zIndex: 999999,

    elevation: 999,
  },

  dropdownTop: {
    bottom: "100%",

    marginBottom: 5,
  },

  dropdownBottom: {
    top: "100%",

    marginTop: 5,
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
  AUTOCOMPLETE_PLACEMENTS as UIAutocompletePlacements,
};

export default UIAutocomplete;
