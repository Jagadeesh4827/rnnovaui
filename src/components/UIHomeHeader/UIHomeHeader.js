import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const UIHomeHeader = ({
  /* ---------------------------------------------------------------------- */
  /* Location                                                               */
  /* ---------------------------------------------------------------------- */

  locationMode = "location",

  locationIcon = "location",

  locationTitle = "Home",

  locationAddress = "Plot No 9, Seethapathi Colony, Samrat ...",

  showLocationChevron = true,

  onLocationPress,

  /* ---------------------------------------------------------------------- */
  /* Back                                                                    */
  /* ---------------------------------------------------------------------- */

  backIcon = "arrow-back",

  onBackPress,

  /* ---------------------------------------------------------------------- */
  /* Right Actions                                                           */
  /* ---------------------------------------------------------------------- */

  rightActions = [],

  rightActionsGap = 4,

  rightActionStyle,

  rightActionIconStyle,

  /* ---------------------------------------------------------------------- */
  /* Search                                                                  */
  /* ---------------------------------------------------------------------- */

  showSearch = true,

  searchPlaceholder = 'Search "burger"',

  searchIcon = "search",

  searchIconSize = 30,

  searchIconColor = "#FFF",

  searchMic = true,

  searchMicIcon = "mic-outline",

  searchMicSize = 28,

  searchMicColor = "#FFF",

  onSearchPress,

  onMicPress,

  searchActions = [],

  searchActionsGap = 4,

  searchActionStyle,

  /* ---------------------------------------------------------------------- */
  /* VEG                                                                     */
  /* ---------------------------------------------------------------------- */

  showVeg = true,

  vegLabel = "VEG",

  vegValue = false,

  onVegChange,

  vegTrackStyle,

  vegThumbStyle,

  /* ---------------------------------------------------------------------- */
  /* Layout                                                                  */
  /* ---------------------------------------------------------------------- */

  height,

  paddingHorizontal = 20,

  paddingTop = 8,

  paddingBottom = 10,

  locationRowHeight = 62,

  searchHeight = 58,

  searchMarginTop = 16,

  borderRadius = 18,

  /* ---------------------------------------------------------------------- */
  /* Styles                                                                  */
  /* ---------------------------------------------------------------------- */

  style,

  locationRowStyle,

  locationIconStyle,

  locationContentStyle,

  locationTitleStyle,

  locationAddressStyle,

  rightActionsStyle,

  searchStyle,

  searchTextStyle,

  /* ---------------------------------------------------------------------- */
  /* Custom rendering                                                        */
  /* ---------------------------------------------------------------------- */

  renderLocation,

  renderRightActions,

  renderSearch,

  renderVeg,

  children,
}) => {
  const insets = useSafeAreaInsets();

  const renderLocationArea = () => {
    if (renderLocation) {
      return renderLocation({
        insets,
      });
    }

    return (
      <Pressable
        onPress={onLocationPress}
        disabled={!onLocationPress}
        style={[styles.locationArea, locationRowStyle]}
      >
        {locationMode === "back" ? (
          <Ionicons
            name={backIcon}
            size={28}
            color="#FFF"
            style={locationIconStyle}
          />
        ) : (
          <Ionicons
            name={locationIcon}
            size={30}
            color="#FFF"
            style={locationIconStyle}
          />
        )}

        <View style={[styles.locationContent, locationContentStyle]}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[styles.locationTitle, locationTitleStyle]}
            >
              {locationTitle}
            </Text>

            {showLocationChevron && locationMode !== "back" ? (
              <Ionicons
                name="chevron-down"
                size={21}
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

  const renderActions = () => {
    if (renderRightActions) {
      return renderRightActions();
    }

    return (
      <View style={[styles.rightActions, rightActionsStyle]}>
        {rightActions.map((action, index) => {
          const actionPadding =
            action.paddingHorizontal ?? action.horizontalPadding ?? 8;

          return (
            <Pressable
              key={action.id || `right-action-${index}`}
              onPress={action.onPress}
              disabled={action.disabled}
              style={[
                styles.rightAction,
                {
                  marginLeft: index === 0 ? 0 : rightActionsGap,
                  paddingHorizontal: actionPadding,
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
            borderRadius,
            marginTop: searchMarginTop,
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
            const actionPadding =
              action.paddingHorizontal ?? action.horizontalPadding ?? 8;

            return (
              <Pressable
                key={action.id || `search-action-${index}`}
                onPress={action.onPress}
                style={[
                  styles.searchAction,
                  {
                    marginLeft: index === 0 ? 0 : searchActionsGap,
                    paddingHorizontal: actionPadding,
                  },
                  searchActionStyle,
                  action.style,
                ]}
              >
                {action.render ? (
                  action.render(action)
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
              style={[styles.micButton]}
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

  const renderVegArea = () => {
    if (!showVeg) {
      return null;
    }

    if (renderVeg) {
      return renderVeg({
        value: vegValue,
        onChange: onVegChange,
      });
    }

    return (
      <View style={styles.vegContainer}>
        <Text style={styles.vegLabel}>{vegLabel}</Text>

        <Pressable
          onPress={() => onVegChange?.(!vegValue)}
          style={[
            styles.vegTrack,
            vegTrackStyle,
            vegValue && styles.vegTrackActive,
          ]}
        >
          <View
            style={[
              styles.vegThumb,
              vegThumbStyle,
              vegValue && styles.vegThumbActive,
            ]}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + paddingTop,
          paddingHorizontal,
          paddingBottom,
          ...(height ? { minHeight: height } : {}),
        },
        style,
      ]}
    >
      {/* -------------------------------------------------------------- */}
      {/* TOP ROW                                                        */}
      {/* -------------------------------------------------------------- */}

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

      {/* -------------------------------------------------------------- */}
      {/* SEARCH                                                         */}
      {/* -------------------------------------------------------------- */}

      {renderSearchArea()}

      {/* -------------------------------------------------------------- */}
      {/* CUSTOM CONTENT                                                 */}
      {/* -------------------------------------------------------------- */}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 100,
  },

  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  locationArea: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  locationContent: {
    flexShrink: 1,
    marginLeft: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
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

  locationIconStyle: {
    marginRight: 2,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },

  rightAction: {
    minWidth: 42,
    minHeight: 42,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  vegContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  vegLabel: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },

  vegTrack: {
    width: 48,
    height: 28,
    borderRadius: 20,
    backgroundColor: "rgba(120,120,120,0.75)",
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
    alignSelf: "flex-start",
  },

  vegThumbActive: {
    alignSelf: "flex-end",
  },

  search: {
    width: "100%",
    backgroundColor: "rgba(15,15,18,0.92)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
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
    marginLeft: 8,
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});

export default UIHomeHeader;

export { UIHomeHeader };
