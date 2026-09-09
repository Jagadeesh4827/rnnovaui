import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
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

import { Ionicons } from "@expo/vector-icons";

const UIHomeHeader = forwardRef(
  (
    {
      // ============================================================
      // LOCATION
      // ============================================================

      locationMode = "location",

      locationIcon = "location-sharp",
      locationIconSize = 22,
      locationIconColor = "#FFFFFF",

      backIcon = "arrow-back",
      backIconSize = 24,
      backIconColor = "#FFFFFF",

      locationTitle = "Home",
      locationAddress = "",

      showLocationChevron = true,

      onLocationPress,
      onBackPress,

      renderLocation,

      // ============================================================
      // RIGHT ACTIONS
      // ============================================================

      rightActions = [],

      rightActionsGap = 6,

      rightActionStyle,
      rightActionIconStyle,
      rightActionsStyle,

      renderRightActions,

      // ============================================================
      // SEARCH
      // ============================================================

      showSearch = true,

      searchValue,

      onSearchChangeText,
      onSearchSubmit,
      onSearchFocus,
      onSearchBlur,

      searchPlaceholder = "Search restaurants, dishes, cuisines...",

      // Animated placeholder
      searchSuggestions = ["Biryani", "Pizza Hut", "Burger", "Chinese Food"],

      searchSuggestionInterval = 2500,

      searchSuggestionAnimationDuration = 450,

      // Search icon
      searchIcon = "search-outline",

      searchIconSize = 24,

      searchIconColor = "#333333",

      // Search microphone
      searchMic = false,

      searchMicIcon = "mic-outline",

      searchMicSize = 24,

      searchMicColor = "#333333",

      onMicPress,

      // Additional search actions
      searchActions = [],

      searchActionsGap = 6,

      searchActionStyle,

      renderSearch,

      // ============================================================
      // SEARCH INPUT
      // ============================================================

      searchAutoFocus = false,

      searchEditable = true,

      searchKeyboardType = "default",

      searchReturnKeyType = "search",

      searchAutoCapitalize = "none",

      searchAutoCorrect = false,

      searchMaxLength,

      searchSecureTextEntry = false,

      searchSelectionColor,

      searchInputStyle,

      // ============================================================
      // SEARCH OUTER SPACING
      // ============================================================

      searchHeight = 52,

      searchMarginTop = 8,

      searchMarginBottom = 0,

      searchBorderRadius = 14,

      // ============================================================
      // SEARCH INNER PADDING
      // ============================================================

      searchPadding = 14,

      searchPaddingHorizontal,

      searchPaddingVertical,

      searchPaddingLeft,

      searchPaddingRight,

      searchPaddingTop,

      searchPaddingBottom,

      // ============================================================
      // SEARCH INTERNAL SPACING
      // ============================================================

      searchIconMarginRight = 9,

      searchMicMarginLeft = 4,

      searchActionsMarginLeft = 4,

      // ============================================================
      // VEG
      // ============================================================

      isVeg,

      vegLabel = "VEG",

      onVegChange,

      vegTrackStyle,

      vegThumbStyle,

      renderVeg,

      // ============================================================
      // GENERAL LAYOUT
      // ============================================================

      paddingHorizontal = 20,

      paddingTop = 0,

      paddingBottom = 8,

      locationRowHeight,

      // ============================================================
      // GENERAL STYLES
      // ============================================================

      style,

      locationRowStyle,

      locationIconStyle,

      locationContentStyle,

      locationTitleStyle,

      locationAddressStyle,

      searchStyle,

      searchTextStyle,

      children,
    },
    ref,
  ) => {
    // ============================================================
    // INPUT REF
    // ============================================================

    const inputRef = useRef(null);

    // ============================================================
    // SEARCH VALUE
    // ============================================================

    const [internalSearch, setInternalSearch] = useState(searchValue ?? "");

    useEffect(() => {
      if (searchValue !== undefined) {
        setInternalSearch(searchValue);
      }
    }, [searchValue]);

    const currentSearchValue =
      searchValue !== undefined ? searchValue : internalSearch;

    // ============================================================
    // SEARCH SUGGESTIONS
    // ============================================================

    const suggestions = useMemo(() => {
      if (!Array.isArray(searchSuggestions)) {
        return [];
      }

      return searchSuggestions.filter(
        (item) => typeof item === "string" && item.trim().length > 0,
      );
    }, [searchSuggestions]);

    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const suggestionOpacity = useRef(new Animated.Value(1)).current;

    const suggestionTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      setSuggestionIndex(0);

      suggestionOpacity.setValue(1);

      suggestionTranslateY.setValue(0);
    }, [suggestions, suggestionOpacity, suggestionTranslateY]);

    useEffect(() => {
      if (suggestions.length <= 1) {
        return undefined;
      }

      if (currentSearchValue) {
        return undefined;
      }

      const timer = setInterval(() => {
        Animated.parallel([
          Animated.timing(suggestionOpacity, {
            toValue: 0,

            duration: searchSuggestionAnimationDuration,

            useNativeDriver: true,
          }),

          Animated.timing(suggestionTranslateY, {
            toValue: -10,

            duration: searchSuggestionAnimationDuration,

            useNativeDriver: true,
          }),
        ]).start(() => {
          setSuggestionIndex((previous) => (previous + 1) % suggestions.length);

          suggestionTranslateY.setValue(10);

          Animated.parallel([
            Animated.timing(suggestionOpacity, {
              toValue: 1,

              duration: searchSuggestionAnimationDuration,

              useNativeDriver: true,
            }),

            Animated.timing(suggestionTranslateY, {
              toValue: 0,

              duration: searchSuggestionAnimationDuration,

              useNativeDriver: true,
            }),
          ]).start();
        });
      }, searchSuggestionInterval);

      return () => clearInterval(timer);
    }, [
      suggestions.length,
      currentSearchValue,
      searchSuggestionInterval,
      searchSuggestionAnimationDuration,
      suggestionOpacity,
      suggestionTranslateY,
    ]);

    const activeSuggestion = suggestions[suggestionIndex] || "";

    // ============================================================
    // IMPERATIVE REF
    // ============================================================

    useImperativeHandle(
      ref,
      () => ({
        focusSearch: () => {
          inputRef.current?.focus();
        },

        blurSearch: () => {
          inputRef.current?.blur();
        },

        clearSearch: () => {
          handleSearchChange("");
        },

        getSearchValue: () => {
          return currentSearchValue;
        },
      }),
      [currentSearchValue],
    );

    // ============================================================
    // SEARCH CHANGE
    // ============================================================

    const handleSearchChange = (text) => {
      if (searchValue === undefined) {
        setInternalSearch(text);
      }

      onSearchChangeText?.(text);
    };

    // ============================================================
    // SEARCH SUBMIT
    // ============================================================

    const handleSearchSubmit = () => {
      onSearchSubmit?.(currentSearchValue);
    };

    // ============================================================
    // RIGHT ACTION
    // ============================================================

    const renderRightAction = (action, index) => {
      if (!action) {
        return null;
      }

      if (action.render) {
        return (
          <View
            key={action.id ?? index}
            style={[
              styles.actionWrapper,

              index > 0 && {
                marginLeft: rightActionsGap,
              },
            ]}
          >
            {action.render()}
          </View>
        );
      }

      const iconName = action.name || action.icon || "ellipse-outline";

      const iconSize = action.size ?? action.iconSize ?? 24;

      const iconColor = action.color ?? action.iconColor ?? "#FFFFFF";

      return (
        <Pressable
          key={action.id ?? index}
          onPress={action.onPress}
          disabled={!action.onPress}
          style={[
            styles.actionButton,

            index > 0 && {
              marginLeft: rightActionsGap,
            },

            rightActionStyle,

            action.style,
          ]}
        >
          <Ionicons
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={[rightActionIconStyle, action.iconStyle]}
          />
        </Pressable>
      );
    };

    // ============================================================
    // SEARCH ACTION
    // ============================================================

    const renderSearchAction = (action, index) => {
      if (!action) {
        return null;
      }

      if (action.render) {
        return (
          <View
            key={action.id ?? index}
            style={[
              styles.searchActionWrapper,

              index > 0 && {
                marginLeft: searchActionsGap,
              },
            ]}
          >
            {action.render()}
          </View>
        );
      }

      const iconName = action.name || action.icon || "ellipse-outline";

      const iconSize = action.size ?? action.iconSize ?? 22;

      const iconColor = action.color ?? action.iconColor ?? "#333333";

      return (
        <Pressable
          key={action.id ?? index}
          onPress={action.onPress}
          disabled={!action.onPress}
          style={[
            styles.searchActionButton,

            index > 0 && {
              marginLeft: searchActionsGap,
            },

            searchActionStyle,

            action.style,
          ]}
        >
          <Ionicons
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={action.iconStyle}
          />
        </Pressable>
      );
    };

    // ============================================================
    // LOCATION
    // ============================================================

    const defaultLocation = (
      <Pressable
        onPress={locationMode === "back" ? onBackPress : onLocationPress}
        disabled={locationMode === "back" ? !onBackPress : !onLocationPress}
        style={[
          styles.locationRow,

          locationRowHeight
            ? {
                minHeight: locationRowHeight,
              }
            : null,

          locationRowStyle,
        ]}
      >
        {/* LOCATION / BACK ICON */}
        <View style={[styles.locationIconContainer, locationIconStyle]}>
          <Ionicons
            name={locationMode === "back" ? backIcon : locationIcon}
            size={locationMode === "back" ? backIconSize : locationIconSize}
            color={locationMode === "back" ? backIconColor : locationIconColor}
          />
        </View>

        {/* LOCATION TEXT */}
        <View style={[styles.locationContent, locationContentStyle]}>
          <View style={styles.locationTitleRow}>
            <Text
              numberOfLines={1}
              style={[styles.locationTitle, locationTitleStyle]}
            >
              {locationTitle}
            </Text>

            {locationMode !== "back" && showLocationChevron && (
              <Ionicons
                name="chevron-down"
                size={16}
                color={locationIconColor}
                style={styles.locationChevron}
              />
            )}
          </View>

          {!!locationAddress && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.locationAddress, locationAddressStyle]}
            >
              {locationAddress}
            </Text>
          )}
        </View>
      </Pressable>
    );

    // ============================================================
    // VEG
    // ============================================================

    const renderVegToggle = () => {
      // undefined = don't show VEG
      if (isVeg === undefined) {
        return null;
      }

      if (renderVeg) {
        return renderVeg({
          isVeg,
          onChange: onVegChange,
        });
      }

      return (
        <Pressable
          onPress={() => onVegChange?.(!isVeg)}
          disabled={!onVegChange}
          style={styles.vegContainer}
        >
          <Text style={styles.vegLabel}>{vegLabel}</Text>

          <View
            style={[
              styles.vegTrack,

              vegTrackStyle,

              isVeg && styles.vegTrackActive,
            ]}
          >
            <View
              style={[
                styles.vegThumb,

                vegThumbStyle,

                isVeg && styles.vegThumbActive,
              ]}
            />
          </View>
        </Pressable>
      );
    };

    // ============================================================
    // SEARCH
    // ============================================================

    const defaultSearch = (
      <View
        style={[
          styles.searchContainer,

          // ------------------------------------------------
          // OUTER SEARCH SPACING
          // ------------------------------------------------

          {
            height: searchHeight,

            marginTop: searchMarginTop,

            marginBottom: searchMarginBottom,

            borderRadius: searchBorderRadius,

            // ------------------------------------------------
            // INNER SEARCH PADDING
            // ------------------------------------------------

            paddingLeft:
              searchPaddingLeft ?? searchPaddingHorizontal ?? searchPadding,

            paddingRight:
              searchPaddingRight ?? searchPaddingHorizontal ?? searchPadding,

            paddingTop:
              searchPaddingTop ?? searchPaddingVertical ?? searchPadding,

            paddingBottom:
              searchPaddingBottom ?? searchPaddingVertical ?? searchPadding,
          },

          searchStyle,
        ]}
      >
        {/* ====================================================
            SEARCH ICON
        ==================================================== */}

        <Ionicons
          name={searchIcon}
          size={searchIconSize}
          color={searchIconColor}
          style={{
            marginRight: searchIconMarginRight,
          }}
        />

        {/* ====================================================
            INPUT AREA
        ==================================================== */}

        <View style={styles.searchInputContainer}>
          {/* Animated Placeholder */}

          {!currentSearchValue && activeSuggestion && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.animatedPlaceholder,

                {
                  opacity: suggestionOpacity,

                  transform: [
                    {
                      translateY: suggestionTranslateY,
                    },
                  ],
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.searchPlaceholder, searchTextStyle]}
              >
                Search "{activeSuggestion}"
              </Text>
            </Animated.View>
          )}

          {/* REAL TEXT INPUT */}

          <TextInput
            ref={inputRef}
            value={currentSearchValue}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder={suggestions.length === 0 ? searchPlaceholder : ""}
            editable={searchEditable}
            autoFocus={searchAutoFocus}
            keyboardType={searchKeyboardType}
            returnKeyType={searchReturnKeyType}
            autoCapitalize={searchAutoCapitalize}
            autoCorrect={searchAutoCorrect}
            maxLength={searchMaxLength}
            secureTextEntry={searchSecureTextEntry}
            selectionColor={searchSelectionColor}
            style={[styles.searchInput, searchTextStyle, searchInputStyle]}
          />
        </View>

        {/* ====================================================
            MICROPHONE
        ==================================================== */}

        {searchMic && (
          <Pressable
            onPress={onMicPress}
            disabled={!onMicPress}
            style={[
              styles.searchIconButton,

              {
                marginLeft: searchMicMarginLeft,
              },
            ]}
          >
            <Ionicons
              name={searchMicIcon}
              size={searchMicSize}
              color={searchMicColor}
            />
          </Pressable>
        )}

        {/* ====================================================
            EXTRA SEARCH ACTIONS
        ==================================================== */}

        {searchActions.length > 0 && (
          <View
            style={[
              styles.searchActions,

              {
                marginLeft: searchActionsMarginLeft,
              },
            ]}
          >
            {searchActions.map(renderSearchAction)}
          </View>
        )}
      </View>
    );

    // ============================================================
    // MAIN
    // ============================================================

    return (
      <View
        style={[
          styles.container,

          {
            paddingHorizontal,
            paddingTop,
            paddingBottom,
          },

          style,
        ]}
      >
        {/* ======================================================
            TOP ROW
        ====================================================== */}

        <View style={styles.topRow}>
          {/* LOCATION */}

          <View style={styles.locationWrapper}>
            {renderLocation
              ? renderLocation({
                  locationMode,

                  locationTitle,

                  locationAddress,

                  locationIcon,

                  locationIconSize,

                  locationIconColor,

                  backIcon,

                  backIconSize,

                  backIconColor,

                  onLocationPress,

                  onBackPress,
                })
              : defaultLocation}
          </View>

          {/* RIGHT ACTIONS */}

          {renderRightActions ? (
            renderRightActions({
              actions: rightActions,
            })
          ) : (
            <View style={[styles.rightActions, rightActionsStyle]}>
              {rightActions.map(renderRightAction)}
            </View>
          )}
        </View>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        {showSearch && (
          <View style={styles.searchRow}>
            {renderSearch
              ? renderSearch({
                  value: currentSearchValue,

                  onChangeText: handleSearchChange,

                  onSubmitEditing: handleSearchSubmit,

                  inputRef,
                })
              : defaultSearch}
          </View>
        )}

        {/* ======================================================
            VEG
        ====================================================== */}

        {renderVegToggle()}

        {/* ======================================================
            CHILDREN
        ====================================================== */}

        {children}
      </View>
    );
  },
);

UIHomeHeader.displayName = "UIHomeHeader";

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  // ==============================================================
  // TOP ROW
  // ==============================================================

  topRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  // ==============================================================
  // LOCATION
  // ==============================================================

  locationWrapper: {
    flex: 1,

    minWidth: 0,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    minWidth: 0,
  },

  locationIconContainer: {
    width: 34,

    alignItems: "flex-start",

    justifyContent: "center",

    marginRight: 6,
  },

  locationContent: {
    flex: 1,

    minWidth: 0,
  },

  locationTitleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  locationTitle: {
    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "700",
  },

  locationChevron: {
    marginLeft: 3,
  },

  locationAddress: {
    marginTop: 2,

    color: "rgba(255,255,255,0.82)",

    fontSize: 12,

    fontWeight: "400",
  },

  // ==============================================================
  // RIGHT ACTIONS
  // ==============================================================

  rightActions: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "flex-end",

    marginLeft: 10,
  },

  actionWrapper: {
    alignItems: "center",

    justifyContent: "center",
  },

  actionButton: {
    alignItems: "center",

    justifyContent: "center",
  },

  // ==============================================================
  // SEARCH
  // ==============================================================

  searchRow: {
    width: "100%",
  },

  searchContainer: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    overflow: "hidden",
  },

  searchInputContainer: {
    flex: 1,

    height: "100%",

    justifyContent: "center",

    position: "relative",

    minWidth: 0,
  },

  searchInput: {
    width: "100%",

    height: "100%",

    paddingHorizontal: 0,

    paddingVertical: 0,

    margin: 0,

    color: "#222222",

    fontSize: 15,
  },

  animatedPlaceholder: {
    position: "absolute",

    left: 0,

    right: 0,

    top: 0,

    bottom: 0,

    justifyContent: "center",
  },

  searchPlaceholder: {
    color: "#777777",

    fontSize: 15,
  },

  searchIconButton: {
    width: 36,

    height: 36,

    alignItems: "center",

    justifyContent: "center",
  },

  searchActions: {
    flexDirection: "row",

    alignItems: "center",
  },

  searchActionWrapper: {
    alignItems: "center",

    justifyContent: "center",
  },

  searchActionButton: {
    alignItems: "center",

    justifyContent: "center",
  },

  // ==============================================================
  // VEG
  // ==============================================================

  vegContainer: {
    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-end",

    marginTop: 8,
  },

  vegLabel: {
    marginRight: 7,

    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "700",
  },

  vegTrack: {
    width: 38,

    height: 21,

    borderRadius: 11,

    padding: 2,

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.35)",
  },

  vegTrackActive: {
    backgroundColor: "#35A853",
  },

  vegThumb: {
    width: 17,

    height: 17,

    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    alignSelf: "flex-start",
  },

  vegThumbActive: {
    alignSelf: "flex-end",
  },
});

export default UIHomeHeader;

export { UIHomeHeader };
