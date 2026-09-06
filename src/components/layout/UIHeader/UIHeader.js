import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeInZoom,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { useUITheme } from "../../../theme";

/* =========================================================
   HEADER ICON
========================================================= */

function HeaderIcon({
  icon,
  size = 24,
  color,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}) {
  if (!icon) return null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

/* =========================================================
   HEADER ACTION
========================================================= */

function HeaderAction({
  action,
  color,
  size,
  actionStyle,
  badgeStyle,
  badgeTextStyle,
}) {
  if (!action) return null;

  return (
    <View style={styles.actionWrapper}>
      <HeaderIcon
        icon={action.icon}
        size={action.size || size}
        color={action.color || color}
        onPress={action.onPress}
        disabled={action.disabled}
        style={[actionStyle, action.style]}
        accessibilityLabel={
          action.accessibilityLabel || action.label || action.icon
        }
      />

      {action.badge !== undefined && action.badge !== null && (
        <View style={[styles.badge, badgeStyle, action.badgeStyle]}>
          <Text
            style={[styles.badgeText, badgeTextStyle, action.badgeTextStyle]}
          >
            {action.badge}
          </Text>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   HEADER ACTIONS
========================================================= */

function HeaderActions({
  actions = [],
  color,
  size = 24,
  gap = 8,
  actionStyle,
  badgeStyle,
  badgeTextStyle,
  containerStyle,
}) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.actionsRow, containerStyle]}>
      {actions.map((action, index) => (
        <View
          key={action.key || action.id || `${action.icon}-${index}`}
          style={[
            index > 0 && {
              marginLeft: gap,
            },
          ]}
        >
          <HeaderAction
            action={action}
            color={color}
            size={size}
            actionStyle={actionStyle}
            badgeStyle={badgeStyle}
            badgeTextStyle={badgeTextStyle}
          />
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   SEARCH ACTIONS
========================================================= */

function SearchActions({
  actions = [],
  color,
  size = 22,
  gap = 8,
  actionStyle,
  containerStyle,
}) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.searchActionsRow, containerStyle]}>
      {actions.map((action, index) => (
        <View
          key={action.key || action.id || `${action.icon}-${index}`}
          style={[
            index > 0 && {
              marginLeft: gap,
            },
          ]}
        >
          <HeaderIcon
            icon={action.icon}
            size={action.size || size}
            color={action.color || color}
            onPress={action.onPress}
            disabled={action.disabled}
            style={[actionStyle, action.style]}
            accessibilityLabel={
              action.accessibilityLabel || action.label || action.icon
            }
          />
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   SEARCH
========================================================= */

function HeaderSearch({
  value,
  defaultValue,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,

  placeholder = "Search...",

  searchIcon = "search-outline",
  searchIconSize = 21,
  searchIconColor,

  searchTextColor,
  searchPlaceholderColor,

  backgroundColor,
  borderColor,
  borderWidth = 0,
  radius = 12,

  actions = [],
  actionsGap = 8,
  actionColor,
  actionSize = 22,

  onSearchPress,

  containerStyle,
  inputStyle,
  actionStyle,
  actionsContainerStyle,

  searchProps = {},
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (text) => {
    if (!isControlled) {
      setInternalValue(text);
    }

    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: radius,
        },
        containerStyle,
      ]}
    >
      <Pressable
        disabled={!onSearchPress}
        onPress={onSearchPress}
        style={styles.searchIconContainer}
      >
        <Ionicons
          name={searchIcon}
          size={searchIconSize}
          color={searchIconColor}
        />
      </Pressable>

      <TextInput
        {...searchProps}
        value={currentValue}
        onChangeText={handleChange}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={searchPlaceholderColor}
        style={[
          styles.searchInput,
          {
            color: searchTextColor,
          },
          inputStyle,
        ]}
        returnKeyType={searchProps.returnKeyType || "search"}
      />

      <SearchActions
        actions={actions}
        color={actionColor}
        size={actionSize}
        gap={actionsGap}
        actionStyle={actionStyle}
        containerStyle={actionsContainerStyle}
      />
    </View>
  );
}

/* =========================================================
   TABS
========================================================= */

function HeaderTabs({
  tabs = [],
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

  scrollable = false,

  containerStyle,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || (tabs.length > 0 ? tabs[0]?.key || tabs[0]?.id : null),
  );

  const selectedTab = activeTab !== undefined ? activeTab : internalActiveTab;

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const handleTabPress = (tab) => {
    const key = tab.key || tab.id;

    if (activeTab === undefined) {
      setInternalActiveTab(key);
    }

    if (onTabChange) {
      onTabChange(key, tab);
    }
  };

  return (
    <View
      style={[
        styles.tabsContainer,
        scrollable && styles.tabsScrollable,
        containerStyle,
      ]}
    >
      {tabs.map((tab, index) => {
        const key = tab.key || tab.id || index;
        const isActive = selectedTab === key;

        return (
          <Pressable
            key={key}
            onPress={() => handleTabPress(tab)}
            style={[
              styles.tab,
              tabStyle,
              isActive && activeTabStyle,
              tab.style,
            ]}
            accessibilityRole="tab"
            accessibilityState={{
              selected: isActive,
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? activeTabColor : tabColor,
                },
                tabTextStyle,
                isActive && activeTabTextStyle,
                tab.textStyle,
              ]}
            >
              {tab.label || tab.title}
            </Text>

            {isActive && (
              <View
                style={[
                  styles.tabIndicator,
                  indicatorStyle,
                  tab.indicatorStyle,
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function HeaderBackground({
  background,
  backgroundStyle,
  overlayColor,
  overlayOpacity,
  children,
}) {
  if (!background || background.type === "theme") {
    return (
      <View style={[StyleSheet.absoluteFillObject, backgroundStyle]}>
        {overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        {children}
      </View>
    );
  }

  if (background.type === "color") {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: background.color,
          },
          backgroundStyle,
        ]}
      >
        {overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        {children}
      </View>
    );
  }

  if (background.type === "gradient") {
    return (
      <LinearGradient
        colors={background.colors || []}
        start={background.start || { x: 0, y: 0 }}
        end={background.end || { x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, backgroundStyle]}
      >
        {overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        {children}
      </LinearGradient>
    );
  }

  if (background.type === "image") {
    return (
      <ImageBackground
        source={background.source}
        resizeMode={background.resizeMode || "cover"}
        style={[StyleSheet.absoluteFillObject, backgroundStyle]}
      >
        {overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        {children}
      </ImageBackground>
    );
  }

  if (background.type === "blur") {
    return (
      <BlurView
        intensity={background.intensity || 70}
        tint={background.tint || "default"}
        style={[StyleSheet.absoluteFillObject, backgroundStyle]}
      >
        {overlayOpacity > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        {children}
      </BlurView>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, backgroundStyle]}>
      {children}
    </View>
  );
}

/* =========================================================
   ANIMATION
========================================================= */

function getEnteringAnimation({
  animation,
  duration,
  delay,
  slideDistance,
  scaleFrom,
}) {
  if (!animation || animation === "none") {
    return undefined;
  }

  const config = {
    duration,
    delay,
  };

  switch (animation) {
    case "fade":
      return FadeIn.duration(duration).delay(delay);

    case "fadeScale":
      return FadeInZoom.duration(duration).delay(delay);

    case "slide":
    case "slideUp":
      return SlideInUp.duration(duration).delay(delay);

    case "slideDown":
      return SlideInDown.duration(duration).delay(delay);

    case "slideLeft":
      return SlideInLeft.duration(duration).delay(delay);

    case "slideRight":
      return SlideInRight.duration(duration).delay(delay);

    case "spring":
      return ZoomIn.springify().damping(14).stiffness(150).delay(delay);

    default:
      return FadeIn.duration(duration).delay(delay);
  }
}

/* =========================================================
   ANIMATED HEADER
========================================================= */

function AnimatedHeader({
  reanimated,
  animation,
  animationDuration,
  animationDelay,
  slideDistance,
  scaleFrom,

  onAnimationStart,
  onAnimationComplete,

  children,
  style,
}) {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (reanimated && animation !== "none") {
      setAnimationStarted(false);

      const timer = setTimeout(() => {
        setAnimationStarted(true);

        if (onAnimationStart) {
          onAnimationStart();
        }
      }, animationDelay || 0);

      return () => clearTimeout(timer);
    }
  }, [reanimated, animation, animationDelay, onAnimationStart]);

  if (!reanimated) {
    return <View style={style}>{children}</View>;
  }

  const entering = getEnteringAnimation({
    animation,
    duration: animationDuration,
    delay: animationDelay,
    slideDistance,
    scaleFrom,
  });

  return (
    <Animated.View
      entering={entering}
      style={style}
      onLayout={() => {
        if (animationStarted && onAnimationComplete) {
          onAnimationComplete();
        }
      }}
    >
      {children}
    </Animated.View>
  );
}

/* =========================================================
   UI HEADER
========================================================= */

export default function UIHeader({
  /* -----------------------------------------
     LEFT
  ----------------------------------------- */

  showBack = false,
  onBackPress,

  backIcon = "arrow-back",
  backIconSize = 24,
  backIconColor,

  leftContent,

  location,
  showLocation = false,

  locationIcon = "location-outline",
  locationIconSize = 22,
  locationIconColor,

  onLocationPress,

  leftWidth,
  leftFlex,
  leftStyle,

  /* -----------------------------------------
     CENTER
  ----------------------------------------- */

  title,
  subtitle,

  titleColor,
  subtitleColor,

  titleStyle,
  subtitleStyle,

  centerWidth,
  centerFlex,
  centerStyle,

  /* -----------------------------------------
     RIGHT
  ----------------------------------------- */

  rightActions = [],

  rightActionColor,
  rightActionSize = 24,

  rightActionsGap = 8,

  actionStyle,
  badgeStyle,
  badgeTextStyle,

  rightWidth,
  rightFlex,
  rightStyle,

  /* -----------------------------------------
     SEARCH
  ----------------------------------------- */

  showSearch = false,

  searchValue,
  searchDefaultValue,

  onSearchChange,
  onSearchSubmit,
  onSearchFocus,
  onSearchBlur,

  searchPlaceholder = "Search...",

  searchIcon = "search-outline",
  searchIconSize = 21,
  searchIconColor,

  searchTextColor,
  searchPlaceholderColor,

  searchBackgroundColor,
  searchBorderColor,
  searchBorderWidth = 0,
  searchRadius = 12,

  searchActions = [],
  searchActionsGap = 8,

  searchActionColor,
  searchActionSize = 22,

  onSearchPress,

  searchContainerStyle,
  searchInputStyle,
  searchActionStyle,
  searchActionsStyle,

  searchProps,

  /* -----------------------------------------
     TABS
  ----------------------------------------- */

  tabs = [],
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

  tabsContainerStyle,

  /* -----------------------------------------
     BACKGROUND
  ----------------------------------------- */

  background = {
    type: "theme",
  },

  backgroundStyle,

  overlayColor = "#000000",
  overlayOpacity = 0,

  /* -----------------------------------------
     HEADER GEOMETRY
  ----------------------------------------- */

  height,

  minHeight,
  maxHeight,

  padding,
  paddingHorizontal = 16,
  paddingVertical,

  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft,
  paddingRight,

  margin,
  marginHorizontal = 0,
  marginVertical = 0,

  marginTop = 0,
  marginBottom = 0,
  marginLeft,
  marginRight,

  headerRowHeight,

  headerRowGap = 0,

  searchSpacing = 12,
  searchMarginTop,
  searchMarginBottom = 0,

  tabsSpacing = 12,
  tabsMarginTop,
  tabsMarginBottom = 0,

  /* -----------------------------------------
     SAFE AREA
  ----------------------------------------- */

  safeArea = false,

  safeAreaEdges = ["top"],

  /* -----------------------------------------
     ANIMATION
  ----------------------------------------- */

  reanimated = false,

  animation = "none",

  animationDuration = 350,
  animationDelay = 0,

  slideDistance = 20,
  scaleFrom = 0.95,

  onAnimationStart,
  onAnimationComplete,

  /* -----------------------------------------
     ROOT
  ----------------------------------------- */

  style,
  headerRowStyle,

  contentStyle,

  accessible = true,
  accessibilityLabel,

  testID,

  onLayout,

  children,
}) {
  /* =====================================================
     THEME
  ===================================================== */

  const themeContext = useUITheme();

  const theme =
    themeContext?.theme || themeContext?.activeTheme || themeContext;

  const colors = themeContext?.colors || theme?.colors || {};

  const isDark = themeContext?.isDark ?? false;

  /* =====================================================
     THEME COLORS
  ===================================================== */

  const themeBackground =
    colors?.background?.primary ||
    colors?.background ||
    (isDark ? "#111111" : "#FFFFFF");

  const themeText =
    colors?.text?.primary || colors?.text || (isDark ? "#FFFFFF" : "#111111");

  const themeSecondaryText =
    colors?.text?.secondary || (isDark ? "#AAAAAA" : "#666666");

  const themeBorder =
    colors?.border?.primary ||
    colors?.border ||
    (isDark ? "#333333" : "#E5E5E5");

  const themeSurface =
    colors?.surface?.primary ||
    colors?.surface ||
    (isDark ? "#222222" : "#F5F5F5");

  const resolvedBackground = useMemo(() => {
    if (background && background.type === "theme") {
      return {
        type: "color",
        color: themeBackground,
      };
    }

    return background;
  }, [background, themeBackground]);

  /* =====================================================
     RESOLVED COLORS
  ===================================================== */

  const resolvedBackColor = backIconColor || themeText;

  const resolvedLocationColor = locationIconColor || themeText;

  const resolvedTitleColor = titleColor || themeText;

  const resolvedSubtitleColor = subtitleColor || themeSecondaryText;

  const resolvedRightActionColor = rightActionColor || themeText;

  const resolvedSearchIconColor = searchIconColor || themeSecondaryText;

  const resolvedSearchTextColor = searchTextColor || themeText;

  const resolvedSearchPlaceholderColor =
    searchPlaceholderColor || themeSecondaryText;

  const resolvedSearchBackground = searchBackgroundColor || themeSurface;

  const resolvedSearchBorder = searchBorderColor || themeBorder;

  const resolvedSearchActionColor = searchActionColor || themeText;

  const resolvedTabColor = tabColor || themeSecondaryText;

  const resolvedActiveTabColor = activeTabColor || themeText;

  /* =====================================================
     GEOMETRY
  ===================================================== */

  const resolvedPaddingLeft = paddingLeft ?? paddingHorizontal;

  const resolvedPaddingRight = paddingRight ?? paddingHorizontal;

  const resolvedPaddingTop = paddingTop ?? paddingVertical ?? 0;

  const resolvedPaddingBottom = paddingBottom ?? paddingVertical ?? 0;

  const resolvedMarginLeft = marginLeft ?? marginHorizontal;

  const resolvedMarginRight = marginRight ?? marginHorizontal;

  const resolvedMarginTop = marginTop ?? marginVertical;

  const resolvedMarginBottom = marginBottom ?? marginVertical;

  /* =====================================================
     ROOT STYLE
  ===================================================== */

  const rootStyle = [
    styles.root,

    {
      backgroundColor: "transparent",

      ...(height !== undefined && {
        height,
      }),

      ...(minHeight !== undefined && {
        minHeight,
      }),

      ...(maxHeight !== undefined && {
        maxHeight,
      }),

      ...(padding !== undefined && {
        padding,
      }),

      ...(paddingLeft !== undefined && {
        paddingLeft,
      }),

      ...(paddingRight !== undefined && {
        paddingRight,
      }),

      ...(paddingTop !== undefined && {
        paddingTop,
      }),

      ...(paddingBottom !== undefined && {
        paddingBottom,
      }),

      ...(paddingHorizontal !== undefined && {
        paddingLeft: resolvedPaddingLeft,
        paddingRight: resolvedPaddingRight,
      }),

      ...(paddingVertical !== undefined && {
        paddingTop: resolvedPaddingTop,
        paddingBottom: resolvedPaddingBottom,
      }),

      ...(margin !== undefined && {
        margin,
      }),

      marginLeft: resolvedMarginLeft,
      marginRight: resolvedMarginRight,
      marginTop: resolvedMarginTop,
      marginBottom: resolvedMarginBottom,
    },

    style,
  ];

  /* =====================================================
     HEADER ROW
  ===================================================== */

  const rowStyle = [
    styles.headerRow,

    headerRowHeight !== undefined && {
      height: headerRowHeight,
    },

    headerRowGap !== undefined && {
      columnGap: 0,
    },

    {
      paddingLeft: resolvedPaddingLeft,
      paddingRight: resolvedPaddingRight,
    },

    headerRowStyle,
    contentStyle,
  ];

  /* =====================================================
     LEFT STYLE
  ===================================================== */

  const resolvedLeftStyle = [
    styles.leftSection,

    leftWidth !== undefined && {
      width: leftWidth,
      flexGrow: 0,
      flexShrink: 0,
    },

    leftFlex !== undefined && {
      flex: leftFlex,
    },

    leftStyle,
  ];

  /* =====================================================
     CENTER STYLE
  ===================================================== */

  const resolvedCenterStyle = [
    styles.centerSection,

    centerWidth !== undefined && {
      width: centerWidth,
      flexGrow: 0,
      flexShrink: 0,
    },

    centerFlex !== undefined && {
      flex: centerFlex,
    },

    centerStyle,
  ];

  /* =====================================================
     RIGHT STYLE
  ===================================================== */

  const resolvedRightStyle = [
    styles.rightSection,

    rightWidth !== undefined && {
      width: rightWidth,
      flexGrow: 0,
      flexShrink: 0,
    },

    rightFlex !== undefined && {
      flex: rightFlex,
    },

    rightStyle,
  ];

  /* =====================================================
     HEADER CONTENT
  ===================================================== */

  const headerContent = (
    <>
      {/* ================================================
          HEADER ROW
      ================================================ */}

      <View style={rowStyle}>
        {/* --------------------------------------------
            LEFT
        -------------------------------------------- */}

        <View style={resolvedLeftStyle}>
          {leftContent}

          {!leftContent && showBack && (
            <HeaderIcon
              icon={backIcon}
              size={backIconSize}
              color={resolvedBackColor}
              onPress={onBackPress}
              accessibilityLabel="Go back"
            />
          )}

          {!leftContent && !showBack && showLocation && (
            <Pressable
              onPress={onLocationPress}
              disabled={!onLocationPress}
              style={styles.locationContainer}
              accessibilityRole={onLocationPress ? "button" : undefined}
            >
              <Ionicons
                name={locationIcon}
                size={locationIconSize}
                color={resolvedLocationColor}
              />

              {location ? (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.locationText,
                    {
                      color: resolvedTitleColor,
                    },
                  ]}
                >
                  {location}
                </Text>
              ) : null}
            </Pressable>
          )}
        </View>

        {/* --------------------------------------------
            CENTER
        -------------------------------------------- */}

        <View style={resolvedCenterStyle}>
          {title ? (
            <Text
              numberOfLines={1}
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

        {/* --------------------------------------------
            RIGHT
        -------------------------------------------- */}

        <View style={resolvedRightStyle}>
          <HeaderActions
            actions={rightActions}
            color={resolvedRightActionColor}
            size={rightActionSize}
            gap={rightActionsGap}
            actionStyle={actionStyle}
            badgeStyle={badgeStyle}
            badgeTextStyle={badgeTextStyle}
          />
        </View>
      </View>

      {/* ================================================
          SEARCH
      ================================================ */}

      {showSearch && (
        <View
          style={[
            {
              marginTop: searchMarginTop ?? searchSpacing,

              marginBottom: searchMarginBottom,
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
            searchIcon={searchIcon}
            searchIconSize={searchIconSize}
            searchIconColor={resolvedSearchIconColor}
            searchTextColor={resolvedSearchTextColor}
            searchPlaceholderColor={resolvedSearchPlaceholderColor}
            backgroundColor={resolvedSearchBackground}
            borderColor={resolvedSearchBorder}
            borderWidth={searchBorderWidth}
            radius={searchRadius}
            actions={searchActions}
            actionsGap={searchActionsGap}
            actionColor={resolvedSearchActionColor}
            actionSize={searchActionSize}
            onSearchPress={onSearchPress}
            containerStyle={searchContainerStyle}
            inputStyle={searchInputStyle}
            actionStyle={searchActionStyle}
            actionsContainerStyle={searchActionsStyle}
            searchProps={searchProps}
          />
        </View>
      )}

      {/* ================================================
          TABS
      ================================================ */}

      {showTabs && tabs.length > 0 && (
        <View
          style={[
            {
              marginTop: tabsMarginTop ?? tabsSpacing,

              marginBottom: tabsMarginBottom,
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
            tabColor={resolvedTabColor}
            activeTabColor={resolvedActiveTabColor}
            scrollable={tabsScrollable}
            containerStyle={tabsContainerStyle}
          />
        </View>
      )}

      {children}
    </>
  );

  /* =====================================================
     BACKGROUND
  ===================================================== */

  const backgroundLayer = (
    <HeaderBackground
      background={resolvedBackground}
      backgroundStyle={backgroundStyle}
      overlayColor={overlayColor}
      overlayOpacity={overlayOpacity}
    >
      {null}
    </HeaderBackground>
  );

  /* =====================================================
     MAIN HEADER
  ===================================================== */

  const header = (
    <AnimatedHeader
      reanimated={reanimated}
      animation={animation}
      animationDuration={animationDuration}
      animationDelay={animationDelay}
      slideDistance={slideDistance}
      scaleFrom={scaleFrom}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
      style={rootStyle}
    >
      <View style={styles.backgroundLayer} pointerEvents="none">
        <HeaderBackground
          background={resolvedBackground}
          backgroundStyle={backgroundStyle}
          overlayColor={overlayColor}
          overlayOpacity={overlayOpacity}
        />
      </View>

      <View
        style={styles.contentLayer}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onLayout={onLayout}
      >
        {headerContent}
      </View>
    </AnimatedHeader>
  );

  /* =====================================================
     SAFE AREA
  ===================================================== */

  if (safeArea) {
    return (
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        {header}
      </SafeAreaView>
    );
  }

  return header;
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },

  root: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  contentLayer: {
    width: "100%",
    position: "relative",
    zIndex: 1,
  },

  headerRow: {
    width: "100%",
    minHeight: 56,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",
  },

  leftSection: {
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "flex-start",

    flexShrink: 1,
  },

  centerSection: {
    minWidth: 0,

    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    flex: 1,

    paddingHorizontal: 8,
  },

  rightSection: {
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "flex-end",

    flexShrink: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    textAlign: "center",
  },

  iconButton: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 20,
  },

  pressed: {
    opacity: 0.6,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  actionWrapper: {
    position: "relative",

    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",

    top: -2,
    right: -2,

    minWidth: 16,
    height: 16,

    paddingHorizontal: 4,

    borderRadius: 8,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EF4444",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",

    maxWidth: "100%",
  },

  locationText: {
    marginLeft: 6,

    fontSize: 14,
    fontWeight: "500",

    flexShrink: 1,
  },

  searchContainer: {
    width: "100%",

    minHeight: 46,

    flexDirection: "row",
    alignItems: "center",

    paddingLeft: 10,
    paddingRight: 6,
  },

  searchIconContainer: {
    width: 36,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,

    minWidth: 0,

    paddingVertical: 0,
    paddingHorizontal: 4,

    fontSize: 15,
  },

  searchActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  tabsContainer: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
    fontWeight: "500",
  },

  tabIndicator: {
    position: "absolute",

    bottom: 0,

    left: 10,
    right: 10,

    height: 2,

    borderRadius: 2,
  },
});
