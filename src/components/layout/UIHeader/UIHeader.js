import React, { useEffect, useMemo, useState } from "react";

import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { BlurView } from "expo-blur";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "../../../theme";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const DEFAULT_HEIGHT = 64;
const DEFAULT_SEARCH_HEIGHT = 46;
const DEFAULT_RADIUS = 14;

const DEFAULT_ANIMATION_DURATION = 400;
const DEFAULT_SLIDE_DISTANCE = 24;
const DEFAULT_SCALE_FROM = 0.96;

/*
|--------------------------------------------------------------------------
| Theme helpers
|--------------------------------------------------------------------------
*/

const getThemeValue = (theme, paths, fallback) => {
  for (const path of paths) {
    const parts = path.split(".");
    let value = theme;

    for (const part of parts) {
      value = value?.[part];
    }

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return fallback;
};

const getThemeColors = (theme) => {
  return {
    background: getThemeValue(
      theme,
      [
        "colors.background.primary",
        "colors.background",
        "colors.surface.primary",
      ],
      "#FFFFFF",
    ),

    surface: getThemeValue(
      theme,
      [
        "colors.surface.primary",
        "colors.surface",
        "colors.background.secondary",
      ],
      "#F5F5F5",
    ),

    text: getThemeValue(
      theme,
      ["colors.text.primary", "colors.text"],
      "#111111",
    ),

    secondaryText: getThemeValue(
      theme,
      ["colors.text.secondary", "colors.text.muted", "colors.muted"],
      "#6B7280",
    ),

    border: getThemeValue(
      theme,
      ["colors.border.primary", "colors.border"],
      "#E5E7EB",
    ),

    primary: getThemeValue(
      theme,
      ["colors.primary", "colors.brand.primary"],
      "#2563EB",
    ),

    white: getThemeValue(theme, ["colors.white"], "#FFFFFF"),
  };
};

/*
|--------------------------------------------------------------------------
| Icon renderer
|--------------------------------------------------------------------------
*/

const HeaderIcon = ({ icon, size = 24, color, style }) => {
  if (!icon) {
    return null;
  }

  if (React.isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === "object" && icon.name) {
    return (
      <Ionicons
        name={icon.name}
        size={icon.size || size}
        color={icon.color || color}
        style={style}
      />
    );
  }

  return <Ionicons name={icon} size={size} color={color} style={style} />;
};

/*
|--------------------------------------------------------------------------
| Action Button
|--------------------------------------------------------------------------
*/

const HeaderAction = ({
  action,
  color,
  size,
  badgeStyle,
  badgeTextStyle,
  buttonStyle,
}) => {
  if (!action) {
    return null;
  }

  const {
    icon,
    label,
    badge,
    disabled = false,
    onPress,
    accessibilityLabel,
    hitSlop = 8,
  } = action;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.actionButton,
        buttonStyle,
        pressed && !disabled && styles.actionPressed,
        disabled && styles.actionDisabled,
      ]}
    >
      <HeaderIcon icon={icon} size={size} color={color} />

      {label ? (
        <Text
          style={[
            styles.actionLabel,
            {
              color,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}

      {badge !== undefined && badge !== null && badge !== false ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]} numberOfLines={1}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const HeaderSearch = ({
  value,
  defaultValue,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,

  placeholder = "Search...",

  editable = true,

  autoFocus = false,

  keyboardType = "default",

  returnKeyType = "search",

  searchActions = [],

  searchIcon = "search-outline",

  searchIconSize = 22,

  searchIconColor,

  searchTextColor,

  searchPlaceholderColor,

  searchBackgroundColor,

  searchBorderColor,

  searchBorderWidth = 0,

  searchRadius = 14,

  searchInputStyle,

  searchContainerStyle,

  searchActionStyle,

  actionColor,

  actionSize = 21,

  badgeStyle,

  badgeTextStyle,

  onSearchPress,

  accessibilityLabel = "Search",

  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const inputValue = value !== undefined ? value : internalValue;

  const handleChangeText = (text) => {
    if (value === undefined) {
      setInternalValue(text);
    }

    onChangeText?.(text);
  };

  return (
    <View
      style={[
        styles.searchContainer,
        {
          height: DEFAULT_SEARCH_HEIGHT,
          backgroundColor: searchBackgroundColor,
          borderColor: searchBorderColor,
          borderWidth: searchBorderWidth,
          borderRadius: searchRadius,
        },
        searchContainerStyle,
      ]}
    >
      <Pressable
        onPress={onSearchPress}
        disabled={!onSearchPress}
        accessibilityRole={onSearchPress ? "button" : undefined}
        style={styles.searchIconButton}
      >
        <HeaderIcon
          icon={searchIcon}
          size={searchIconSize}
          color={searchIconColor}
        />
      </Pressable>

      <TextInput
        {...rest}
        value={inputValue}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={searchPlaceholderColor}
        editable={editable}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.searchInput,
          {
            color: searchTextColor,
          },
          searchInputStyle,
        ]}
      />

      {searchActions?.map((action, index) => (
        <HeaderAction
          key={action.key || `${action.icon}-${index}`}
          action={action}
          color={actionColor}
          size={actionSize}
          badgeStyle={badgeStyle}
          badgeTextStyle={badgeTextStyle}
          buttonStyle={[styles.searchAction, searchActionStyle]}
        />
      ))}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Tabs
|--------------------------------------------------------------------------
*/

const HeaderTabs = ({
  tabs = [],
  activeTab,
  defaultActiveTab,
  onTabChange,

  tabStyle,
  activeTabStyle,

  tabTextStyle,
  activeTabTextStyle,

  indicatorStyle,

  color,
  activeColor,

  scrollable = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab ?? tabs?.[0]?.key ?? tabs?.[0]?.value,
  );

  const selectedTab = activeTab !== undefined ? activeTab : internalActiveTab;

  const handleTabPress = (tab) => {
    const key = tab.key ?? tab.value ?? tab.label;

    if (activeTab === undefined) {
      setInternalActiveTab(key);
    }

    onTabChange?.(tab, key);
  };

  const content = tabs.map((tab, index) => {
    const key = tab.key ?? tab.value ?? tab.label ?? index;

    const isActive = selectedTab === key;

    return (
      <Pressable
        key={key}
        onPress={() => handleTabPress(tab)}
        accessibilityRole="tab"
        accessibilityState={{
          selected: isActive,
        }}
        style={[styles.tab, tabStyle, isActive && activeTabStyle]}
      >
        <Text
          style={[
            styles.tabText,
            {
              color: isActive ? activeColor : color,
            },
            tabTextStyle,
            isActive && activeTabTextStyle,
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>

        {isActive ? (
          <View
            style={[
              styles.tabIndicator,
              {
                backgroundColor: activeColor,
              },
              indicatorStyle,
            ]}
          />
        ) : null}
      </Pressable>
    );
  });

  return (
    <View style={[styles.tabsContainer, scrollable && styles.tabsScrollable]}>
      {content}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Animated Header
|--------------------------------------------------------------------------
*/

const AnimatedHeader = ({
  children,

  animation = "fade",

  animationDuration = DEFAULT_ANIMATION_DURATION,

  animationDelay = 0,

  slideDistance = DEFAULT_SLIDE_DISTANCE,

  scaleFrom = DEFAULT_SCALE_FROM,

  springConfig,

  onAnimationStart,
  onAnimationComplete,

  style,

  ...rest
}) => {
  const getInitial = () => {
    switch (animation) {
      case "fade":
      case "fadeIn":
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 0,
        };

      case "scale":
        return {
          opacity: 1,
          scale: scaleFrom,
          x: 0,
          y: 0,
        };

      case "fadeScale":
        return {
          opacity: 0,
          scale: scaleFrom,
          x: 0,
          y: 0,
        };

      case "slide":
      case "slideUp":
      case "slideFade":
        return {
          opacity: animation === "slideUp" ? 1 : 0,
          scale: 1,
          x: 0,
          y: slideDistance,
        };

      case "slideDown":
        return {
          opacity: 1,
          scale: 1,
          x: 0,
          y: -slideDistance,
        };

      case "slideLeft":
        return {
          opacity: 1,
          scale: 1,
          x: slideDistance,
          y: 0,
        };

      case "slideRight":
        return {
          opacity: 1,
          scale: 1,
          x: -slideDistance,
          y: 0,
        };

      case "spring":
        return {
          opacity: 0,
          scale: scaleFrom,
          x: 0,
          y: 0,
        };

      default:
        return {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
        };
    }
  };

  const initial = useMemo(getInitial, [animation, slideDistance, scaleFrom]);

  const opacity = useSharedValue(initial.opacity);

  const scale = useSharedValue(initial.scale);

  const translateX = useSharedValue(initial.x);

  const translateY = useSharedValue(initial.y);

  useEffect(() => {
    if (animation === "none") {
      return;
    }

    opacity.value = initial.opacity;
    scale.value = initial.scale;
    translateX.value = initial.x;
    translateY.value = initial.y;

    onAnimationStart?.();

    const delay = animationDelay;

    const timingConfig = {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    };

    if (animation === "spring") {
      opacity.value = withDelay(
        delay,
        withTiming(1, timingConfig, (finished) => {
          if (finished) {
            onAnimationComplete?.();
          }
        }),
      );

      scale.value = withDelay(
        delay,
        withSpring(1, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateX.value = withDelay(
        delay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
        }),
      );

      translateY.value = withDelay(
        delay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,
          stiffness: springConfig?.stiffness ?? 180,
          mass: springConfig?.mass ?? 0.8,
        }),
      );

      return;
    }

    opacity.value = withDelay(
      delay,
      withTiming(1, timingConfig, (finished) => {
        if (finished) {
          onAnimationComplete?.();
        }
      }),
    );

    scale.value = withDelay(delay, withTiming(1, timingConfig));

    translateX.value = withDelay(delay, withTiming(0, timingConfig));

    translateY.value = withDelay(delay, withTiming(0, timingConfig));
  }, [
    animation,
    animationDuration,
    animationDelay,
    initial,
    springConfig,
    onAnimationStart,
    onAnimationComplete,
    opacity,
    scale,
    translateX,
    translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animation === "none") {
      return {};
    }

    return {
      opacity: opacity.value,

      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
        {
          scale: scale.value,
        },
      ],
    };
  });

  return (
    <Animated.View
      {...rest}
      style={[styles.animatedContainer, style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| Background
|--------------------------------------------------------------------------
*/

const HeaderBackground = ({
  background,

  children,

  themeColors,

  overlayColor,
  overlayOpacity = 0,

  style,
}) => {
  const config = background || {
    type: "theme",
  };

  const type = config.type || "theme";

  /*
   * Theme
   */
  if (type === "theme") {
    return (
      <View
        style={[
          styles.background,
          {
            backgroundColor: themeColors.background,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  /*
   * Solid color
   */
  if (type === "color") {
    return (
      <View
        style={[
          styles.background,
          {
            backgroundColor: config.color || themeColors.background,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  /*
   * Gradient
   */
  if (type === "gradient") {
    return (
      <LinearGradient
        colors={config.colors || [themeColors.primary, themeColors.background]}
        start={
          config.start || {
            x: 0,
            y: 0,
          }
        }
        end={
          config.end || {
            x: 1,
            y: 1,
          }
        }
        locations={config.locations}
        style={[styles.background, style]}
      >
        {overlayOpacity > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.backgroundOverlay,
              {
                backgroundColor: overlayColor || "#000000",
                opacity: overlayOpacity,
              },
            ]}
          />
        ) : null}

        {children}
      </LinearGradient>
    );
  }

  /*
   * Image
   */
  if (type === "image") {
    return (
      <ImageBackground
        source={config.source}
        resizeMode={config.resizeMode || "cover"}
        imageStyle={[styles.backgroundImage, config.imageStyle]}
        style={[styles.background, style]}
      >
        {overlayOpacity > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.backgroundOverlay,
              {
                backgroundColor: overlayColor || "#000000",
                opacity: overlayOpacity,
              },
            ]}
          />
        ) : null}

        {children}
      </ImageBackground>
    );
  }

  /*
   * Blur / Glass
   */
  if (type === "blur") {
    return (
      <View
        style={[
          styles.background,
          {
            backgroundColor: config.backgroundColor || themeColors.background,
          },
          style,
        ]}
      >
        <BlurView
          intensity={config.intensity ?? 70}
          tint={config.tint || "default"}
          style={styles.blur}
        />

        {children}
      </View>
    );
  }

  /*
   * Fallback
   */
  return (
    <View
      style={[
        styles.background,
        {
          backgroundColor: themeColors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| UIHeader
|--------------------------------------------------------------------------
*/

const UIHeader = ({
  /*
   * Left
   */
  showBack = false,
  onBackPress,
  backIcon = "chevron-back",
  backIconSize = 27,
  backIconColor,

  leftContent,

  /*
   * Location
   */
  location,
  showLocation = false,
  locationIcon = "location",
  locationIconSize = 22,
  locationIconColor,

  onLocationPress,

  /*
   * Center
   */
  title,
  subtitle,

  titleColor,
  subtitleColor,

  titleStyle,
  subtitleStyle,

  /*
   * Right actions
   */
  rightActions = [],

  rightActionColor,
  rightActionSize = 24,

  actionStyle,

  badgeStyle,
  badgeTextStyle,

  /*
   * Search
   */
  showSearch = false,

  searchValue,
  searchDefaultValue,

  onSearchChange,
  onSearchSubmit,
  onSearchFocus,
  onSearchBlur,

  searchPlaceholder = "Search...",

  searchActions = [],

  searchIcon = "search-outline",
  searchIconSize = 22,

  searchIconColor,
  searchTextColor,
  searchPlaceholderColor,

  searchBackgroundColor,
  searchBorderColor,
  searchBorderWidth = 0,
  searchRadius = 14,

  searchContainerStyle,
  searchInputStyle,
  searchActionStyle,

  searchActionColor,
  searchActionSize = 21,

  onSearchPress,

  searchProps,

  /*
   * Tabs
   */
  tabs,
  showTabs = false,

  activeTab,
  defaultActiveTab,

  onTabChange,

  tabStyle,
  activeTabStyle,
  tabTextStyle,
  activeTabTextStyle,
  indicatorStyle,

  tabColor,
  activeTabColor,

  tabsScrollable = false,

  /*
   * Background
   */
  background = {
    type: "theme",
  },

  backgroundStyle,

  overlayColor,
  overlayOpacity = 0,

  /*
   * Layout
   */
  height = DEFAULT_HEIGHT,

  searchSpacing = 10,

  horizontalPadding = 16,

  headerSpacing = 8,

  /*
   * Safe area
   */
  edges = ["top"],

  /*
   * Reanimated
   */
  reanimated = false,

  animation = "fade",

  animationDuration = DEFAULT_ANIMATION_DURATION,

  animationDelay = 0,

  slideDistance = DEFAULT_SLIDE_DISTANCE,

  scaleFrom = DEFAULT_SCALE_FROM,

  springConfig,

  onAnimationStart,
  onAnimationComplete,

  /*
   * General
   */
  style,
  contentStyle,

  testID,
  onLayout,

  accessible,
  accessibilityLabel,

  children,

  ...rest
}) => {
  /*
   * Existing global UIProvider theme.
   *
   * UIHeader DOES NOT have a mode prop.
   *
   * UIProvider controls the theme.
   */
  const themeContext = useTheme?.();

  const theme = themeContext?.theme || themeContext || {};

  const themeColors = getThemeColors(theme);

  /*
   * Location visibility
   */
  const hasLocation = showLocation || Boolean(location);

  /*
   * Search visibility
   */
  const hasSearch = showSearch === true;

  /*
   * Tabs visibility
   */
  const hasTabs = showTabs && Array.isArray(tabs) && tabs.length > 0;

  /*
   * Colors
   */
  const resolvedTitleColor = titleColor || themeColors.text;

  const resolvedSubtitleColor = subtitleColor || themeColors.secondaryText;

  const resolvedBackColor = backIconColor || themeColors.text;

  const resolvedLocationColor = locationIconColor || themeColors.text;

  const resolvedRightColor = rightActionColor || themeColors.text;

  const resolvedSearchBackground = searchBackgroundColor || themeColors.surface;

  const resolvedSearchText = searchTextColor || themeColors.text;

  const resolvedSearchPlaceholder =
    searchPlaceholderColor || themeColors.secondaryText;

  const resolvedSearchIcon = searchIconColor || themeColors.secondaryText;

  const resolvedSearchActionColor = searchActionColor || themeColors.text;

  const resolvedTabColor = tabColor || themeColors.secondaryText;

  const resolvedActiveTabColor = activeTabColor || themeColors.primary;

  /*
   * Header content
   */
  const headerContent = (
    <>
      <View
        style={[
          styles.headerRow,
          {
            minHeight: height,
            paddingHorizontal: horizontalPadding,
          },
          contentStyle,
        ]}
      >
        {/* LEFT */}
        <View
          style={[
            styles.leftSection,
            {
              flex: hasLocation && !showBack && !leftContent ? 1 : 1,
            },
          ]}
        >
          {leftContent ? (
            leftContent
          ) : showBack ? (
            <Pressable
              onPress={onBackPress}
              disabled={!onBackPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.actionPressed,
              ]}
            >
              <HeaderIcon
                icon={backIcon}
                size={backIconSize}
                color={resolvedBackColor}
              />
            </Pressable>
          ) : hasLocation ? (
            <Pressable
              onPress={onLocationPress}
              disabled={!onLocationPress}
              accessibilityRole={onLocationPress ? "button" : undefined}
              style={styles.locationContainer}
            >
              <HeaderIcon
                icon={locationIcon}
                size={locationIconSize}
                color={resolvedLocationColor}
              />

              <View style={styles.locationText}>
                {location?.city || location?.title ? (
                  <View style={styles.locationTitleRow}>
                    <Text
                      style={[
                        styles.locationTitle,
                        {
                          color: resolvedTitleColor,
                        },
                        location?.titleStyle,
                      ]}
                      numberOfLines={1}
                    >
                      {location.city || location.title}
                    </Text>

                    {location?.showChevron !== false ? (
                      <Ionicons
                        name="chevron-down"
                        size={15}
                        color={resolvedSubtitleColor}
                      />
                    ) : null}
                  </View>
                ) : null}

                {location?.address ? (
                  <Text
                    style={[
                      styles.locationAddress,
                      {
                        color: resolvedSubtitleColor,
                      },
                      location?.addressStyle,
                    ]}
                    numberOfLines={1}
                  >
                    {location.address}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* CENTER */}
        <View pointerEvents="box-none" style={styles.centerSection}>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: resolvedTitleColor,
                },
                titleStyle,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: resolvedSubtitleColor,
                },
                subtitleStyle,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* RIGHT */}
        <View style={styles.rightSection}>
          {rightActions.map((action, index) => (
            <HeaderAction
              key={action.key || `${action.icon}-${index}`}
              action={action}
              color={action.color || resolvedRightColor}
              size={action.size || rightActionSize}
              badgeStyle={action.badgeStyle || badgeStyle}
              badgeTextStyle={action.badgeTextStyle || badgeTextStyle}
              buttonStyle={[actionStyle, action.style]}
            />
          ))}
        </View>
      </View>

      {/* SEARCH */}
      {hasSearch ? (
        <View
          style={[
            styles.searchWrapper,
            {
              paddingHorizontal: horizontalPadding,
              marginTop: searchSpacing,
            },
          ]}
        >
          <HeaderSearch
            value={searchValue}
            defaultValue={searchDefaultValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder={searchPlaceholder}
            searchActions={searchActions}
            searchIcon={searchIcon}
            searchIconSize={searchIconSize}
            searchIconColor={resolvedSearchIcon}
            searchTextColor={resolvedSearchText}
            searchPlaceholderColor={resolvedSearchPlaceholder}
            searchBackgroundColor={resolvedSearchBackground}
            searchBorderColor={searchBorderColor || themeColors.border}
            searchBorderWidth={searchBorderWidth}
            searchRadius={searchRadius}
            searchContainerStyle={searchContainerStyle}
            searchInputStyle={searchInputStyle}
            searchActionStyle={searchActionStyle}
            actionColor={resolvedSearchActionColor}
            actionSize={searchActionSize}
            badgeStyle={badgeStyle}
            badgeTextStyle={badgeTextStyle}
            onSearchPress={onSearchPress}
            {...searchProps}
          />
        </View>
      ) : null}

      {/* TABS */}
      {hasTabs ? (
        <View
          style={[
            styles.tabsWrapper,
            {
              marginTop: headerSpacing,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <HeaderTabs
            tabs={tabs}
            activeTab={activeTab}
            defaultActiveTab={defaultActiveTab}
            onTabChange={onTabChange}
            tabStyle={tabStyle}
            activeTabStyle={activeTabStyle}
            tabTextStyle={tabTextStyle}
            activeTabTextStyle={activeTabTextStyle}
            indicatorStyle={indicatorStyle}
            color={resolvedTabColor}
            activeColor={resolvedActiveTabColor}
            scrollable={tabsScrollable}
          />
        </View>
      ) : null}

      {children}
    </>
  );

  /*
   * Animated or normal rendering.
   *
   * The animation component is conditionally mounted,
   * so the normal path does not use Reanimated styles.
   */
  const content = reanimated ? (
    <AnimatedHeader
      animation={resolveAnimationType(animation)}
      animationDuration={animationDuration}
      animationDelay={animationDelay}
      slideDistance={slideDistance}
      scaleFrom={scaleFrom}
      springConfig={springConfig}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
      style={styles.flex}
    >
      {headerContent}
    </AnimatedHeader>
  ) : (
    <View style={styles.flex}>{headerContent}</View>
  );

  return (
    <SafeAreaView
      {...rest}
      edges={edges}
      testID={testID}
      onLayout={onLayout}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, style]}
    >
      <HeaderBackground
        background={background}
        themeColors={themeColors}
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
        style={backgroundStyle}
      >
        {content}
      </HeaderBackground>
    </SafeAreaView>
  );
};

/*
|--------------------------------------------------------------------------
| Animation helper
|--------------------------------------------------------------------------
*/

const resolveAnimationType = (animation) => {
  if (!animation) {
    return "fade";
  }

  if (typeof animation === "string") {
    return animation;
  }

  return animation.type || "fade";
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },

  flex: {
    flex: 1,
  },

  background: {
    width: "100%",
    flex: 1,
  },

  backgroundImage: {
    width: "100%",
  },

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  animatedContainer: {
    flex: 1,
  },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  leftSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  centerSection: {
    flex: 1.4,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  rightSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },

  actionButton: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 20,
    flexDirection: "row",
  },

  actionPressed: {
    opacity: 0.55,
  },

  actionDisabled: {
    opacity: 0.4,
  },

  actionLabel: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
  },

  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
  },

  title: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },

  locationContainer: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    minWidth: 0,
    marginLeft: 7,
  },

  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },

  locationTitle: {
    maxWidth: 150,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },

  locationAddress: {
    maxWidth: 170,
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
  },

  searchWrapper: {
    width: "100%",
  },

  searchContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  searchIconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingHorizontal: 5,
    paddingVertical: 0,
    fontSize: 14,
  },

  searchAction: {
    minWidth: 38,
    minHeight: 38,
  },

  tabsWrapper: {
    width: "100%",
  },

  tabsContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
  },

  tabsScrollable: {
    overflow: "hidden",
  },

  tab: {
    minHeight: 42,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },

  tabIndicator: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
});

export default UIHeader;
