import React, { forwardRef, useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
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
      // ====================================================================
      // LOCATION
      // ====================================================================

      locationMode = "location",

      locationIcon = "location",

      backIcon = "arrow-back",

      locationTitle = "Home",

      locationAddress = "",

      showLocationChevron = true,

      onLocationPress,

      onBackPress,

      // ====================================================================
      // RIGHT ACTIONS
      // ====================================================================

      rightActions = [],

      rightActionsGap = 5,

      rightActionStyle,

      rightActionIconStyle,

      rightActionsStyle,

      // ====================================================================
      // SEARCH
      // ====================================================================

      showSearch = true,

      searchValue = "",

      onSearchChangeText,

      onSearchSubmit,

      onSearchFocus,

      onSearchBlur,

      /**
       * Static placeholder used when no
       * animated suggestions are provided.
       */
      searchPlaceholder = 'Search "Biryani"',

      /**
       * Animated search suggestions.
       *
       * Example:
       *
       * [
       *   "Biryani",
       *   "Pizza Hut",
       *   "Burger",
       *   "Chinese Food"
       * ]
       */
      searchSuggestions = [],

      /**
       * Time before changing suggestion.
       */
      searchSuggestionInterval = 2500,

      /**
       * Animation duration.
       */
      searchSuggestionAnimationDuration = 450,

      searchIcon = "search",

      searchIconSize = 30,

      searchIconColor = "#FFF",

      searchMic = true,

      searchMicIcon = "mic-outline",

      searchMicSize = 28,

      searchMicColor = "#FFF",

      onMicPress,

      searchActions = [],

      searchActionsGap = 4,

      searchActionStyle,

      // ====================================================================
      // SEARCH INPUT
      // ====================================================================

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

      // ====================================================================
      // VEG
      // ====================================================================

      /**
       * undefined = hidden
       * false     = visible OFF
       * true      = visible ON
       */
      isVeg,

      vegLabel = "VEG",

      onVegChange,

      vegTrackStyle,

      vegThumbStyle,

      // ====================================================================
      // LAYOUT
      // ====================================================================

      paddingHorizontal = 20,

      paddingTop = 0,

      paddingBottom = 10,

      locationRowHeight = 62,

      searchHeight = 58,

      searchMarginTop = 8,

      searchMarginBottom = 0,

      searchBorderRadius = 18,

      // ====================================================================
      // STYLES
      // ====================================================================

      style,

      locationRowStyle,

      locationIconStyle,

      locationContentStyle,

      locationTitleStyle,

      locationAddressStyle,

      searchStyle,

      searchTextStyle,

      // ====================================================================
      // CUSTOM RENDERERS
      // ====================================================================

      renderLocation,

      renderRightActions,

      renderSearch,

      renderVeg,

      children,
    },
    ref,
  ) => {
    const internalInputRef = useRef(null);

    const inputRef = ref || internalInputRef;

    // ======================================================================
    // SEARCH SUGGESTION STATE
    // ======================================================================

    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const suggestionTranslate = useRef(new Animated.Value(0)).current;

    const suggestionOpacity = useRef(new Animated.Value(1)).current;

    // ======================================================================
    // VALID SUGGESTIONS
    // ======================================================================

    const suggestions = Array.isArray(searchSuggestions)
      ? searchSuggestions.filter(
          (item) => typeof item === "string" && item.trim().length > 0,
        )
      : [];

    const hasSuggestions = suggestions.length > 0;

    const hasSearchText =
      typeof searchValue === "string" && searchValue.length > 0;

    // ======================================================================
    // RESET SUGGESTION WHEN USER TYPES
    // ======================================================================

    useEffect(() => {
      if (hasSearchText) {
        suggestionTranslate.setValue(0);

        suggestionOpacity.setValue(1);
      }
    }, [hasSearchText, suggestionOpacity, suggestionTranslate]);

    // ======================================================================
    // ROTATING PLACEHOLDER
    // ======================================================================

    useEffect(() => {
      if (!showSearch || !hasSuggestions || hasSearchText) {
        return;
      }

      if (suggestions.length <= 1) {
        return;
      }

      const timer = setInterval(() => {
        /*
         * Current suggestion slides upward.
         */
        Animated.parallel([
          Animated.timing(suggestionTranslate, {
            toValue: -10,

            duration: searchSuggestionAnimationDuration,

            easing: Easing.out(Easing.cubic),

            useNativeDriver: true,
          }),

          Animated.timing(suggestionOpacity, {
            toValue: 0,

            duration: searchSuggestionAnimationDuration,

            easing: Easing.out(Easing.cubic),

            useNativeDriver: true,
          }),
        ]).start(() => {
          /*
           * Change the text only after
           * the old text has disappeared.
           */
          setSuggestionIndex((previous) => (previous + 1) % suggestions.length);

          /*
           * Put new text below.
           */
          suggestionTranslate.setValue(10);

          suggestionOpacity.setValue(0);

          /*
           * New suggestion slides
           * upward into position.
           */
          Animated.parallel([
            Animated.timing(suggestionTranslate, {
              toValue: 0,

              duration: searchSuggestionAnimationDuration,

              easing: Easing.out(Easing.cubic),

              useNativeDriver: true,
            }),

            Animated.timing(suggestionOpacity, {
              toValue: 1,

              duration: searchSuggestionAnimationDuration,

              easing: Easing.out(Easing.cubic),

              useNativeDriver: true,
            }),
          ]).start();
        });
      }, searchSuggestionInterval);

      return () => {
        clearInterval(timer);

        suggestionTranslate.stopAnimation();

        suggestionOpacity.stopAnimation();
      };
    }, [
      hasSuggestions,
      hasSearchText,
      searchSuggestionInterval,
      searchSuggestionAnimationDuration,
      showSearch,
      suggestions.length,
      suggestionOpacity,
      suggestionTranslate,
    ]);

    // ======================================================================
    // CURRENT SUGGESTION
    // ======================================================================

    const currentSuggestion = hasSuggestions
      ? suggestions[suggestionIndex % suggestions.length]
      : null;

    // ======================================================================
    // LOCATION
    // ======================================================================

    const renderLocationArea = () => {
      if (renderLocation) {
        return renderLocation();
      }

      const isBack = locationMode === "back";

      return (
        <Pressable
          onPress={isBack ? onBackPress : onLocationPress}
          disabled={isBack ? !onBackPress : !onLocationPress}
          style={[styles.locationArea, locationRowStyle]}
        >
          <Ionicons
            name={isBack ? backIcon : locationIcon}
            size={isBack ? 28 : 30}
            color="#FFF"
            style={locationIconStyle}
          />

          <View style={[styles.locationContent, locationContentStyle]}>
            <View style={styles.titleRow}>
              <Text
                numberOfLines={1}
                style={[styles.locationTitle, locationTitleStyle]}
              >
                {locationTitle}
              </Text>

              {!isBack && showLocationChevron ? (
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#FFF"
                  style={styles.chevron}
                />
              ) : null}
            </View>

            {locationAddress ? (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.locationAddress, locationAddressStyle]}
              >
                {locationAddress}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    };

    // ======================================================================
    // RIGHT ACTIONS
    // ======================================================================

    const renderActions = () => {
      if (renderRightActions) {
        return renderRightActions();
      }

      return (
        <View style={[styles.rightActions, rightActionsStyle]}>
          {rightActions.map((action, index) => {
            const horizontalPadding =
              action.paddingHorizontal ?? action.horizontalPadding ?? 0;

            return (
              <Pressable
                key={action.id || `right-${index}`}
                onPress={action.onPress}
                disabled={action.disabled}
                style={[
                  styles.rightAction,

                  {
                    marginLeft: index === 0 ? 0 : rightActionsGap,

                    paddingHorizontal: horizontalPadding,
                  },

                  rightActionStyle,

                  action.style,
                ]}
              >
                {action.render ? (
                  action.render(action)
                ) : action.icon ? (
                  action.icon
                ) : (
                  <Ionicons
                    name={action.name || "ellipse-outline"}
                    size={action.size || 25}
                    color={action.color || "#FFF"}
                    style={rightActionIconStyle}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      );
    };

    // ======================================================================
    // VEG
    // ======================================================================

    const renderVegArea = () => {
      if (isVeg === undefined) {
        return null;
      }

      if (renderVeg) {
        return renderVeg({
          value: isVeg,
          onChange: onVegChange,
        });
      }

      return (
        <View style={styles.vegContainer}>
          <Text style={styles.vegLabel}>{vegLabel}</Text>

          <Pressable
            onPress={() => onVegChange?.(!isVeg)}
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
          </Pressable>
        </View>
      );
    };

    // ======================================================================
    // SEARCH
    // ======================================================================

    const renderSearchArea = () => {
      if (!showSearch) {
        return null;
      }

      if (renderSearch) {
        return renderSearch({
          value: searchValue,

          onChangeText: onSearchChangeText,

          inputRef,
        });
      }

      return (
        <View
          style={[
            styles.search,

            {
              height: searchHeight,

              marginTop: searchMarginTop,

              marginBottom: searchMarginBottom,

              borderRadius: searchBorderRadius,
            },

            searchStyle,
          ]}
        >
          {/* SEARCH ICON */}

          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.searchIconButton}
          >
            <Ionicons
              name={searchIcon}
              size={searchIconSize}
              color={searchIconColor}
            />
          </Pressable>

          {/* ========================================================== */}
          {/* INPUT CONTAINER                                             */}
          {/* ========================================================== */}

          <View style={styles.inputContainer}>
            {/* ======================================================== */}
            {/* ANIMATED PLACEHOLDER                                     */}
            {/* ======================================================== */}

            {!hasSearchText && hasSuggestions ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.animatedPlaceholder,

                  {
                    opacity: suggestionOpacity,

                    transform: [
                      {
                        translateY: suggestionTranslate,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.placeholderSearchText, searchTextStyle]}
                >
                  Search <Text style={styles.placeholderQuote}>"</Text>
                  {currentSuggestion}
                  <Text style={styles.placeholderQuote}>"</Text>
                </Text>
              </Animated.View>
            ) : null}

            {/* ======================================================== */}
            {/* REAL TEXT INPUT                                          */}
            {/* ======================================================== */}

            <TextInput
              ref={inputRef}
              value={searchValue}
              onChangeText={onSearchChangeText}
              onSubmitEditing={onSearchSubmit}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              /*
               * When suggestions exist,
               * we hide the native placeholder
               * because our animated placeholder
               * handles it.
               */
              placeholder={hasSuggestions ? "" : searchPlaceholder}
              placeholderTextColor={"rgba(255,255,255,0.68)"}
              editable={searchEditable}
              autoFocus={searchAutoFocus}
              keyboardType={searchKeyboardType}
              returnKeyType={searchReturnKeyType}
              autoCapitalize={searchAutoCapitalize}
              autoCorrect={searchAutoCorrect}
              maxLength={searchMaxLength}
              secureTextEntry={searchSecureTextEntry}
              selectionColor={searchSelectionColor || "#FFF"}
              cursorColor={searchSelectionColor || "#FFF"}
              style={[styles.searchInput, searchTextStyle, searchInputStyle]}
            />
          </View>

          {/* ========================================================== */}
          {/* SEARCH ACTIONS                                             */}
          {/* ========================================================== */}

          <View style={styles.searchActions}>
            {searchActions.map((action, index) => {
              const horizontalPadding =
                action.paddingHorizontal ?? action.horizontalPadding ?? 0;

              return (
                <Pressable
                  key={action.id || `search-action-${index}`}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={[
                    styles.searchAction,

                    {
                      marginLeft: index === 0 ? 0 : searchActionsGap,

                      paddingHorizontal: horizontalPadding,
                    },

                    searchActionStyle,

                    action.style,
                  ]}
                >
                  {action.render ? (
                    action.render(action)
                  ) : action.icon ? (
                    action.icon
                  ) : (
                    <Ionicons
                      name={action.name || "ellipsis-horizontal"}
                      size={action.size || 25}
                      color={action.color || "#FFF"}
                    />
                  )}
                </Pressable>
              );
            })}

            {/* MIC */}

            {searchMic ? (
              <Pressable
                onPress={onMicPress}
                disabled={!onMicPress}
                style={styles.micButton}
              >
                <Ionicons
                  name={searchMicIcon}
                  size={searchMicSize}
                  color={searchMicColor}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      );
    };

    // ======================================================================
    // RENDER
    // ======================================================================

    return (
      <View
        style={[
          styles.container,

          {
            paddingTop,
            paddingHorizontal,
            paddingBottom,
          },

          style,
        ]}
      >
        <View
          style={[
            styles.topRow,

            {
              minHeight: locationRowHeight,
            },
          ]}
        >
          {renderLocationArea()}

          {renderActions()}

          {renderVegArea()}
        </View>

        {renderSearchArea()}

        {children}
      </View>
    );
  },
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",

    backgroundColor: "transparent",

    zIndex: 1000,
  },

  // ========================================================================
  // LOCATION
  // ========================================================================

  topRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",
  },

  locationArea: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",

    alignItems: "center",
  },

  locationContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 7,
  },

  titleRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  locationTitle: {
    color: "#FFF",

    fontSize: 25,

    fontWeight: "800",

    flexShrink: 1,
  },

  chevron: {
    marginLeft: 3,
  },

  locationAddress: {
    color: "rgba(255,255,255,0.92)",

    fontSize: 15,

    marginTop: 2,

    flexShrink: 1,
  },

  // ========================================================================
  // RIGHT ACTIONS
  // ========================================================================

  rightActions: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: 7,
  },

  rightAction: {
    minWidth: 42,

    minHeight: 42,

    borderRadius: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  // ========================================================================
  // VEG
  // ========================================================================

  vegContainer: {
    alignItems: "center",

    justifyContent: "center",

    marginLeft: 8,
  },

  vegLabel: {
    color: "#FFF",

    fontSize: 15,

    fontWeight: "800",

    marginBottom: 4,
  },

  vegTrack: {
    width: 48,

    height: 28,

    borderRadius: 20,

    backgroundColor: "rgba(100,100,100,0.75)",

    justifyContent: "center",

    paddingHorizontal: 3,
  },

  vegTrackActive: {
    backgroundColor: "#20B45A",
  },

  vegThumb: {
    width: 22,

    height: 22,

    borderRadius: 11,

    backgroundColor: "#FFF",
  },

  vegThumbActive: {
    alignSelf: "flex-end",
  },

  // ========================================================================
  // SEARCH
  // ========================================================================

  search: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 8,

    backgroundColor: "rgba(10,10,12,0.92)",
  },

  searchIconButton: {
    width: 45,

    height: 48,

    alignItems: "center",

    justifyContent: "center",
  },

  // ========================================================================
  // INPUT
  // ========================================================================

  inputContainer: {
    flex: 1,

    minWidth: 0,

    height: "100%",

    justifyContent: "center",

    position: "relative",

    overflow: "hidden",
  },

  searchInput: {
    position: "absolute",

    left: 0,

    right: 0,

    top: 0,

    bottom: 0,

    width: "100%",

    height: "100%",

    paddingHorizontal: 5,

    paddingVertical: 0,

    color: "#FFF",

    fontSize: 18,

    fontWeight: "400",
  },

  // ========================================================================
  // ANIMATED PLACEHOLDER
  // ========================================================================

  animatedPlaceholder: {
    position: "absolute",

    left: 5,

    right: 0,

    top: 0,

    bottom: 0,

    justifyContent: "center",

    zIndex: 1,
  },

  placeholderSearchText: {
    color: "rgba(255,255,255,0.68)",

    fontSize: 18,

    fontWeight: "400",
  },

  placeholderQuote: {
    color: "rgba(255,255,255,0.68)",
  },

  // ========================================================================
  // SEARCH ACTIONS
  // ========================================================================

  searchActions: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: 4,
  },

  searchAction: {
    minWidth: 36,

    minHeight: 40,

    alignItems: "center",

    justifyContent: "center",
  },

  micButton: {
    minWidth: 42,

    minHeight: 44,

    alignItems: "center",

    justifyContent: "center",
  },
});

export default UIHomeHeader;

export { UIHomeHeader };
