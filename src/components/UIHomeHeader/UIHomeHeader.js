import React from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

/**
 * Reusable home header.
 *
 * IMPORTANT:
 * This component does NOT add safe-area top padding by default.
 *
 * When used inside UIBannerCarousel, the carousel owns the
 * status-bar safe area so the header starts immediately below it.
 */
const UIHomeHeader = ({
  /* ========================================================================
     LOCATION
     ======================================================================== */

  locationMode = "location",

  locationIcon = "location",

  backIcon = "arrow-back",

  locationTitle = "Home",

  locationAddress = "",

  showLocationChevron = true,

  onLocationPress,

  onBackPress,

  /* ========================================================================
     RIGHT ACTIONS
     ======================================================================== */

  rightActions = [],

  rightActionsGap = 5,

  rightActionStyle,

  rightActionIconStyle,

  rightActionsStyle,

  /* ========================================================================
     SEARCH
     ======================================================================== */

  showSearch = true,

  searchPlaceholder = 'Search "burger"',

  searchIcon = "search",

  searchIconSize = 30,

  searchIconColor = "#FFF",

  searchMic = true,

  searchMicIcon = "mic-outline",

  searchMicSize = 28,

  searchMicColor = "#FFF",

  searchActions = [],

  searchActionsGap = 4,

  searchActionStyle,

  onSearchPress,

  onMicPress,

  /* ========================================================================
     VEG
     ======================================================================== */

  /**
   * Optional.
   *
   * isVeg={true}  -> show VEG switch ON
   * isVeg={false} -> show VEG switch OFF
   * isVeg omitted -> hide VEG switch
   */
  isVeg,

  vegLabel = "VEG",

  onVegChange,

  vegTrackStyle,

  vegThumbStyle,

  /* ========================================================================
     LAYOUT
     ======================================================================== */

  paddingHorizontal = 20,

  /**
   * This is now ONLY header internal spacing.
   * It does NOT include status-bar inset.
   */
  paddingTop = 0,

  paddingBottom = 10,

  locationRowHeight = 62,

  searchHeight = 58,

  searchMarginTop = 10,

  searchBorderRadius = 18,

  /* ========================================================================
     CUSTOM STYLES
     ======================================================================== */

  style,

  locationRowStyle,

  locationIconStyle,

  locationContentStyle,

  locationTitleStyle,

  locationAddressStyle,

  searchStyle,

  searchTextStyle,

  /* ========================================================================
     CUSTOM RENDERERS
     ======================================================================== */

  renderLocation,

  renderRightActions,

  renderSearch,

  renderVeg,

  children,
}) => {
  /*
   * VEG is displayed only when isVeg was actually supplied.
   *
   * This means:
   *
   * <UIHomeHeader />
   * => no VEG
   *
   * <UIHomeHeader isVeg={false} />
   * => VEG OFF
   *
   * <UIHomeHeader isVeg={true} />
   * => VEG ON
   */
  const showVeg = isVeg !== undefined;

  /* ========================================================================
     LOCATION
     ======================================================================== */

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

  /* ========================================================================
     RIGHT ACTIONS
     ======================================================================== */

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

  /* ========================================================================
     VEG
     ======================================================================== */

  const renderVegArea = () => {
    if (!showVeg) {
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

  /* ========================================================================
     SEARCH
     ======================================================================== */

  const renderSearchArea = () => {
    if (!showSearch) {
      return null;
    }

    if (renderSearch) {
      return renderSearch();
    }

    return (
      <Pressable
        onPress={onSearchPress}
        disabled={!onSearchPress}
        style={[
          styles.search,

          {
            height: searchHeight,

            marginTop: searchMarginTop,

            borderRadius: searchBorderRadius,
          },

          searchStyle,
        ]}
      >
        <Ionicons
          name={searchIcon}
          size={searchIconSize}
          color={searchIconColor}
        />

        <Text numberOfLines={1} style={[styles.searchText, searchTextStyle]}>
          {searchPlaceholder}
        </Text>

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
      </Pressable>
    );
  };

  /* ========================================================================
     RENDER
     ======================================================================== */

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
      {/* ================================================================ */}
      {/* LOCATION + RIGHT ACTIONS + OPTIONAL VEG                          */}
      {/* ================================================================ */}

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

      {/* ================================================================ */}
      {/* SEARCH                                                            */}
      {/* ================================================================ */}

      {renderSearchArea()}

      {/* ================================================================ */}
      {/* CUSTOM CONTENT                                                    */}
      {/* ================================================================ */}

      {children}
    </View>
  );
};

/* ==========================================================================
   STYLES
   ========================================================================== */

const styles = StyleSheet.create({
  container: {
    width: "100%",

    backgroundColor: "transparent",

    zIndex: 100,
  },

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

  /* ====================================================================== */
  /* RIGHT ACTIONS                                                          */
  /* ====================================================================== */

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

  /* ====================================================================== */
  /* VEG                                                                     */
  /* ====================================================================== */

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

  /* ====================================================================== */
  /* SEARCH                                                                  */
  /* ====================================================================== */

  search: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 17,

    backgroundColor: "rgba(10,10,12,0.92)",
  },

  searchText: {
    flex: 1,

    color: "#DDD",

    fontSize: 18,

    marginLeft: 12,
  },

  searchActions: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: 5,
  },

  searchAction: {
    minWidth: 36,

    minHeight: 40,

    alignItems: "center",

    justifyContent: "center",
  },

  micButton: {
    minWidth: 36,

    minHeight: 40,

    marginLeft: 3,

    alignItems: "center",

    justifyContent: "center",
  },
});

export default UIHomeHeader;

export { UIHomeHeader };
