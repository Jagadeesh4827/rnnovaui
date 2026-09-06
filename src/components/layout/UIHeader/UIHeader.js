import React, { useEffect, useMemo, useState } from "react";

import {
  ImageBackground,
  Platform,
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUITheme } from "../../../theme";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const DEFAULT_HEIGHT = 64;
const DEFAULT_SEARCH_HEIGHT = 46;

const DEFAULT_ANIMATION_DURATION = 400;
const DEFAULT_SLIDE_DISTANCE = 24;
const DEFAULT_SCALE_FROM = 0.96;

/*
|--------------------------------------------------------------------------
| Theme
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

const getThemeColors = (theme) => ({
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
    ["colors.surface.primary", "colors.surface", "colors.background.secondary"],
    "#F5F5F5",
  ),

  text: getThemeValue(theme, ["colors.text.primary", "colors.text"], "#111111"),

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
});

/*
|--------------------------------------------------------------------------
| Icon
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
| Action
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
          numberOfLines={1}
          style={[
            styles.actionLabel,
            {
              color,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      {badge !== undefined && badge !== null && badge !== false ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text numberOfLines={1} style={[styles.badgeText, badgeTextStyle]}>
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
  defaultValue = "",

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

  searchContainerStyle,
  searchInputStyle,
  searchActionStyle,

  actionColor,
  actionSize = 21,

  badgeStyle,
  badgeTextStyle,

  onSearchPress,

  accessibilityLabel = "Search",

  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

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
        accessibilityLabel={onSearchPress ? "Search" : undefined}
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

      {searchActions.map((action, index) => (
        <HeaderAction
          key={action.key || `${action.icon}-${index}`}
          action={action}
          color={action.color || actionColor}
          size={action.size || actionSize}
          badgeStyle={action.badgeStyle || badgeStyle}
          badgeTextStyle={action.badgeTextStyle || badgeTextStyle}
          buttonStyle={[styles.searchAction, searchActionStyle, action.style]}
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

  return (
    <View style={[styles.tabsContainer, scrollable && styles.tabsScrollable]}>
      {tabs.map((tab, index) => {
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
              numberOfLines={1}
              style={[
                styles.tabText,
                {
                  color: isActive ? activeColor : color,
                },

                tabTextStyle,

                isActive && activeTabTextStyle,
              ]}
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
      })}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Animation
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
}) => {
  const initial = useMemo(() => {
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
      case "slideFade":
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: slideDistance,
        };

      case "slideUp":
        return {
          opacity: 1,
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
  }, [animation, slideDistance, scaleFrom]);

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

    if (onAnimationStart) {
      runOnJS(onAnimationStart)();
    }

    const timingConfig = {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    };

    const complete = (finished) => {
      if (finished && onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    };

    if (animation === "spring") {
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, timingConfig, complete),
      );

      scale.value = withDelay(
        animationDelay,
        withSpring(1, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,

          overshootClamping: springConfig?.overshootClamping ?? false,
        }),
      );

      translateX.value = withDelay(
        animationDelay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,
        }),
      );

      translateY.value = withDelay(
        animationDelay,
        withSpring(0, {
          damping: springConfig?.damping ?? 16,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,
        }),
      );

      return;
    }

    opacity.value = withDelay(
      animationDelay,
      withTiming(1, timingConfig, complete),
    );

    scale.value = withDelay(animationDelay, withTiming(1, timingConfig));

    translateX.value = withDelay(animationDelay, withTiming(0, timingConfig));

    translateY.value = withDelay(animationDelay, withTiming(0, timingConfig));
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
    <Animated.View style={[styles.animatedContainer, style, animatedStyle]}>
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
  themeColors,

  overlayColor,
  overlayOpacity = 0,

  children,

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
   * Color
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
              styles.overlay,
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
        imageStyle={config.imageStyle}
        style={[styles.background, style]}
      >
        {overlayOpacity > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.overlay,
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
   * Blur
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
   * Back
   */
  showBack = false,
  onBackPress,

  backIcon = "chevron-back",
  backIconSize = 27,
  backIconColor,

  /*
   * Custom left
   */
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
   * Dimensions
   */
  height = DEFAULT_HEIGHT,

  horizontalPadding = 16,

  searchSpacing = 10,

  tabsSpacing = 8,

  /*
   * Safe Area
   *
   * Recommended:
   *
   * <UILayout>
   *   <UIHeader />
   * </UILayout>
   *
   * In that case safeArea=false prevents
   * double top inset.
   *
   * For standalone UIHeader:
   *
   * <UIHeader safeArea />
   */
  safeArea = false,

  safeAreaEdges = ["top"],

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
   * Styles
   */
  style,

  contentStyle,

  /*
   * Accessibility
   */
  accessible,
  accessibilityLabel,

  /*
   * Misc
   */
  testID,
  onLayout,

  children,
}) => {
  /*
   * Global UIProvider theme.
   *
   * UIHeader ONLY reads it.
   */
  const themeContext = useUITheme();

  const theme = themeContext?.theme || themeContext || {};

  const themeColors = getThemeColors(theme);

  /*
   * Resolve colors.
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

  const resolvedSearchAction = searchActionColor || themeColors.text;

  const resolvedTabColor = tabColor || themeColors.secondaryText;

  const resolvedActiveTabColor = activeTabColor || themeColors.primary;

  /*
   * Feature checks.
   */
  const hasLocation = showLocation || Boolean(location);

  const hasSearch = showSearch === true;

  const hasTabs = showTabs === true && Array.isArray(tabs) && tabs.length > 0;

  /*
   * Header row.
   */
  const headerRow = (
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

      <View style={styles.leftSection}>
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
                    numberOfLines={1}
                    style={[
                      styles.locationTitle,
                      {
                        color: resolvedTitleColor,
                      },
                      location?.titleStyle,
                    ]}
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
                  numberOfLines={1}
                  style={[
                    styles.locationAddress,
                    {
                      color: resolvedSubtitleColor,
                    },
                    location?.addressStyle,
                  ]}
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
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.title,
              {
                color: resolvedTitleColor,
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}

        {subtitle ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.subtitle,
              {
                color: resolvedSubtitleColor,
              },
              subtitleStyle,
            ]}
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
  );

  /*
   * Search.
   */
  const searchContent = hasSearch ? (
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
        actionColor={resolvedSearchAction}
        actionSize={searchActionSize}
        badgeStyle={badgeStyle}
        badgeTextStyle={badgeTextStyle}
        onSearchPress={onSearchPress}
        {...searchProps}
      />
    </View>
  ) : null;

  /*
   * Tabs.
   */
  const tabsContent = hasTabs ? (
    <View
      style={[
        styles.tabsWrapper,
        {
          marginTop: tabsSpacing,

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
  ) : null;

  /*
   * Header body.
   *
   * IMPORTANT:
   * No flex: 1 here.
   */
  const headerBody = (
    <View style={styles.headerBody}>
      {headerRow}

      {searchContent}

      {tabsContent}

      {children}
    </View>
  );

  /*
   * Optional animation.
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
    >
      {headerBody}
    </AnimatedHeader>
  ) : (
    headerBody
  );

  /*
   * Background.
   *
   * IMPORTANT:
   * Background does NOT use flex: 1.
   */
  const backgroundContent = (
    <HeaderBackground
      background={background}
      themeColors={themeColors}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
      style={backgroundStyle}
    >
      {content}
    </HeaderBackground>
  );

  /*
   * Standalone safe area.
   *
   * When UILayout already provides safe area,
   * leave safeArea={false}.
   */
  if (safeArea) {
    return (
      <SafeAreaView
        edges={safeAreaEdges}
        style={[styles.root, style]}
        testID={testID}
        onLayout={onLayout}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      >
        {backgroundContent}
      </SafeAreaView>
    );
  }

  return (
    <View
      style={[styles.root, style]}
      testID={testID}
      onLayout={onLayout}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      {backgroundContent}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Animation resolver
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
  /*
   * IMPORTANT:
   * UIHeader must NOT have flex: 1.
   */
  root: {
    width: "100%",
  },

  background: {
    width: "100%",
  },

  headerBody: {
    width: "100%",
  },

  animatedContainer: {
    width: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  /*
   * Header row
   */
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
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
  },

  /*
   * Buttons
   */
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
    marginLeft: 2,
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

  /*
   * Badge
   */
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

  /*
   * Title
   */
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

  /*
   * Location
   */
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

  /*
   * Search
   */
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

  /*
   * Tabs
   */
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
