import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useUITheme } from "../../theme";

/*
|--------------------------------------------------------------------------
| CONTEXT
|--------------------------------------------------------------------------
*/

export const UITabsContext = createContext(null);

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

export const UI_TABS_VARIANTS = [
  "underline",
  "filled",
  "pill",
  "contained",
  "soft",
];

export const UI_TABS_SIZES = ["xs", "sm", "md", "lg"];

/*
|--------------------------------------------------------------------------
| TAB ITEM
|--------------------------------------------------------------------------
*/

const UITabItem = memo(function UITabItem({
  item,
  active,

  variant,
  size,

  palette,

  spacing,
  radius,
  typography,

  equalWidth,

  onPress,
  onLayout,

  tabStyle,
  labelStyle,

  iconSize,
  iconColor,
  iconStrokeWidth,

  badgeStyle,
  badgeTextStyle,

  dotSize,

  disabledOpacity,
}) {
  const LeftIcon = item?.leftIcon;
  const RightIcon = item?.rightIcon;

  const disabled = item?.disabled === true;

  const fontSizes = typography?.fontSizes || {};
  const fontWeights = typography?.fontWeights || {};

  /*
  |--------------------------------------------------------------------------
  | SIZE METRICS
  |--------------------------------------------------------------------------
  */

  const metrics = useMemo(() => {
    switch (size) {
      case "xs":
        return {
          horizontal: spacing?.xs ?? 4,

          vertical: spacing?.xs ?? 4,

          icon: iconSize ?? fontSizes.sm ?? 12,

          gap: spacing?.xs ?? 4,

          radius: radius?.sm ?? 6,

          text: fontSizes.sm ?? 12,

          fontWeight: String(fontWeights.medium ?? 500),
        };

      case "sm":
        return {
          horizontal: spacing?.sm ?? 8,

          vertical: spacing?.xs ?? 4,

          icon: iconSize ?? fontSizes.sm ?? 12,

          gap: spacing?.xs ?? 4,

          radius: radius?.md ?? 10,

          text: fontSizes.sm ?? 12,

          fontWeight: String(fontWeights.medium ?? 500),
        };

      case "lg":
        return {
          horizontal: spacing?.xl ?? 24,

          vertical: spacing?.md ?? 12,

          icon: iconSize ?? fontSizes.lg ?? 18,

          gap: spacing?.sm ?? 8,

          radius: radius?.xl ?? 18,

          text: fontSizes.lg ?? 18,

          fontWeight: String(fontWeights.medium ?? 500),
        };

      case "md":
      default:
        return {
          horizontal: spacing?.lg ?? 16,

          vertical: spacing?.sm ?? 8,

          icon: iconSize ?? fontSizes.base ?? 16,

          gap: spacing?.xs ?? 4,

          radius: radius?.lg ?? 14,

          text: fontSizes.md ?? 14,

          fontWeight: String(fontWeights.medium ?? 500),
        };
    }
  }, [fontSizes, fontWeights, iconSize, radius, size, spacing]);

  /*
  |--------------------------------------------------------------------------
  | BACKGROUND
  |--------------------------------------------------------------------------
  */

  const backgroundColor = useMemo(() => {
    switch (variant) {
      case "filled":
      case "pill":
      case "contained":
        return active ? palette.active : "transparent";

      case "soft":
        return active ? palette.activeSoft : "transparent";

      case "underline":
      default:
        return "transparent";
    }
  }, [active, palette.active, palette.activeSoft, variant]);

  /*
  |--------------------------------------------------------------------------
  | TEXT COLOR
  |--------------------------------------------------------------------------
  */

  const textColor =
    active &&
    (variant === "filled" || variant === "contained" || variant === "pill")
      ? palette.onActive
      : active
        ? palette.active
        : palette.inactive;

  /*
  |--------------------------------------------------------------------------
  | ICON COLOR
  |--------------------------------------------------------------------------
  */

  const resolvedIconColor = iconColor ?? textColor;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{
        selected: active,
        disabled,
      }}
      android_ripple={{
        color: palette.activeRipple,
      }}
      style={[
        styles.tabPressable,

        equalWidth ? styles.equalWidthTab : null,

        {
          paddingHorizontal: metrics.horizontal,

          paddingVertical: metrics.vertical,

          borderRadius: metrics.radius,

          backgroundColor,

          opacity: disabled ? disabledOpacity : 1,
        },

        tabStyle,
      ]}
    >
      <View
        style={[
          styles.tabContent,
          {
            gap: metrics.gap,
          },
        ]}
      >
        {LeftIcon ? (
          <LeftIcon
            size={metrics.icon}
            color={resolvedIconColor}
            strokeWidth={iconStrokeWidth}
          />
        ) : null}

        {item?.title !== undefined && item?.title !== null ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.tabLabel,

              {
                color: textColor,

                fontSize: metrics.text,

                fontWeight: metrics.fontWeight,
              },

              labelStyle,
            ]}
          >
            {item.title}
          </Text>
        ) : null}

        {RightIcon ? (
          <RightIcon
            size={metrics.icon}
            color={resolvedIconColor}
            strokeWidth={iconStrokeWidth}
          />
        ) : null}

        {item?.badge !== undefined && item?.badge !== null ? (
          <View
            style={[
              styles.badge,

              {
                marginLeft: spacing?.xxs ?? 2,

                minWidth: metrics.text + (spacing?.sm ?? 8),

                minHeight: metrics.text + (spacing?.xxs ?? 2),

                paddingHorizontal: spacing?.xs ?? 4,

                borderRadius: radius?.pill ?? 999,

                backgroundColor: active
                  ? palette.badgeActive
                  : palette.badgeInactive,
              },

              badgeStyle,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.badgeText,

                {
                  color: palette.badgeText,

                  fontSize: Math.max(metrics.text - 2, 9),

                  fontWeight: String(fontWeights.bold ?? 700),
                },

                badgeTextStyle,
              ]}
            >
              {item.badge}
            </Text>
          </View>
        ) : null}

        {item?.dot ? (
          <View
            style={[
              styles.dot,

              {
                width: dotSize,

                height: dotSize,

                borderRadius: dotSize / 2,

                backgroundColor: palette.dot,
              },
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
});

UITabItem.displayName = "UITabItem";

/*
|--------------------------------------------------------------------------
| TAB INDICATOR
|--------------------------------------------------------------------------
*/

const UITabIndicator = memo(function UITabIndicator({
  layout,

  variant,
  palette,
  radius,

  indicatorHeight,
  indicatorWidth,
  indicatorRadius,

  indicatorColor,

  indicatorStyle,

  springConfig,
}) {
  const translateX = useSharedValue(0);

  const width = useSharedValue(0);

  const height = useSharedValue(indicatorHeight);

  /*
    |--------------------------------------------------------------------------
    | ANIMATION
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    if (!layout) {
      return;
    }

    translateX.value = withSpring(layout.x, springConfig);

    width.value = withSpring(indicatorWidth ?? layout.width, springConfig);

    height.value = withSpring(indicatorHeight, springConfig);
  }, [
    layout,
    indicatorWidth,
    indicatorHeight,
    springConfig,
    translateX,
    width,
    height,
  ]);

  /*
    |--------------------------------------------------------------------------
    | ANIMATED STYLE
    |--------------------------------------------------------------------------
    */

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],

    width: width.value,

    height: height.value,
  }));

  /*
    |--------------------------------------------------------------------------
    | VARIANT
    |--------------------------------------------------------------------------
    */

  const isUnderline = variant === "underline";

  /*
    |--------------------------------------------------------------------------
    | COLOR
    |--------------------------------------------------------------------------
    */

  const background =
    indicatorColor ?? (isUnderline ? palette.indicator : palette.active);

  /*
    |--------------------------------------------------------------------------
    | RADIUS
    |--------------------------------------------------------------------------
    */

  const resolvedRadius =
    indicatorRadius ??
    (isUnderline ? (radius?.pill ?? 999) : (radius?.lg ?? 14));

  /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,

        {
          backgroundColor: background,

          borderRadius: resolvedRadius,

          left: 0,

          bottom: isUnderline ? 0 : undefined,

          top: isUnderline ? undefined : 0,
        },

        animatedStyle,

        indicatorStyle,
      ]}
    />
  );
});

UITabIndicator.displayName = "UITabIndicator";

/*
|--------------------------------------------------------------------------
| TAB PANEL
|--------------------------------------------------------------------------
*/

const UITabPanel = memo(function UITabPanel({
  value,

  children,

  lazy = true,

  style,
  contentContainerStyle,

  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingHorizontal,
  paddingVertical,

  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  marginHorizontal,
  marginVertical,

  animation = true,

  animationDuration = 180,

  exitAnimationDuration = 150,
}) {
  const context = useContext(UITabsContext);

  if (!context) {
    throw new Error("UITabPanel must be used inside UITab.");
  }

  const {
    value: activeTab,

    keepAlive,

    panelStyle: contextPanelStyle,

    panelContentStyle: contextPanelContentStyle,
  } = context;

  /*
    |--------------------------------------------------------------------------
    | ACTIVE
    |--------------------------------------------------------------------------
    */

  const active = value === activeTab;

  /*
    |--------------------------------------------------------------------------
    | LAZY MOUNT
    |--------------------------------------------------------------------------
    */

  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
    }
  }, [active]);

  /*
    |--------------------------------------------------------------------------
    | VISIBILITY
    |--------------------------------------------------------------------------
    */

  if (!keepAlive && !active) {
    return null;
  }

  if (lazy && !mounted) {
    return null;
  }

  /*
    |--------------------------------------------------------------------------
    | PANEL STYLE
    |--------------------------------------------------------------------------
    */

  const panelStyles = [
    styles.panel,

    {
      padding,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingHorizontal,
      paddingVertical,

      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      marginHorizontal,
      marginVertical,

      display: active ? "flex" : "none",
    },

    contextPanelStyle,

    style,
  ];

  /*
    |--------------------------------------------------------------------------
    | CONTENT STYLE
    |--------------------------------------------------------------------------
    */

  const contentStyles = [
    styles.panelContent,

    contextPanelContentStyle,

    contentContainerStyle,
  ];

  /*
    |--------------------------------------------------------------------------
    | NO ANIMATION
    |--------------------------------------------------------------------------
    */

  if (!animation) {
    return (
      <View style={panelStyles}>
        <View style={contentStyles}>{children}</View>
      </View>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | ANIMATED
    |--------------------------------------------------------------------------
    */

  return (
    <Animated.View
      entering={FadeIn.duration(animationDuration)}
      exiting={FadeOut.duration(exitAnimationDuration)}
      style={panelStyles}
    >
      <Animated.View style={contentStyles}>{children}</Animated.View>
    </Animated.View>
  );
});

UITabPanel.displayName = "UITabPanel";

/*
|--------------------------------------------------------------------------
| MAIN UITAB
|--------------------------------------------------------------------------
*/

function UITab({
  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  items = [],

  value,

  defaultValue,

  onChange,

  children,

  /*
  |--------------------------------------------------------------------------
  | VARIANT
  |--------------------------------------------------------------------------
  */

  variant = "underline",

  size = "md",

  /*
  |--------------------------------------------------------------------------
  | LAYOUT
  |--------------------------------------------------------------------------
  */

  scrollable = false,

  equalWidth = false,

  /*
  |--------------------------------------------------------------------------
  | ANIMATION
  |--------------------------------------------------------------------------
  */

  animated = true,

  animationDuration = 220,

  springConfig,

  /*
  |--------------------------------------------------------------------------
  | DIVIDER
  |--------------------------------------------------------------------------
  */

  showDivider = true,

  dividerColor,

  dividerHeight,

  /*
  |--------------------------------------------------------------------------
  | PANELS
  |--------------------------------------------------------------------------
  */

  keepAlive = false,

  panelStyle,

  panelContentStyle,

  /*
  |--------------------------------------------------------------------------
  | COLORS
  |--------------------------------------------------------------------------
  */

  activeColor,

  inactiveColor,

  indicatorColor,

  backgroundColor,

  borderColor,

  activeSoftColor,

  onActiveColor,

  rippleColor,

  badgeActiveColor,

  badgeInactiveColor,

  badgeTextColor,

  dotColor,

  /*
  |--------------------------------------------------------------------------
  | STYLES
  |--------------------------------------------------------------------------
  */

  style,

  className,

  tabStyle,

  labelStyle,

  indicatorStyle,

  contentContainerStyle,

  /*
  |--------------------------------------------------------------------------
  | TAB METRICS
  |--------------------------------------------------------------------------
  */

  tabHorizontalPadding,

  tabVerticalPadding,

  iconSize,

  iconColor,

  iconStrokeWidth = 2,

  disabledOpacity = 0.45,

  /*
  |--------------------------------------------------------------------------
  | INDICATOR
  |--------------------------------------------------------------------------
  */

  indicatorHeight,

  indicatorWidth,

  indicatorRadius,

  /*
  |--------------------------------------------------------------------------
  | BADGE / DOT
  |--------------------------------------------------------------------------
  */

  badgeStyle,

  badgeTextStyle,

  dotSize = 7,

  /*
  |--------------------------------------------------------------------------
  | SCROLL
  |--------------------------------------------------------------------------
  */

  scrollToActive = true,

  scrollOffset = 16,

  /*
  |--------------------------------------------------------------------------
  | ACCESSIBILITY
  |--------------------------------------------------------------------------
  */

  accessibilityLabel,

  testID,
}) {
  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  */

  const { theme } = useUITheme();

  const {
    colors = {},
    spacing = {},
    radius = {},
    typography = {},
    animation: themeAnimation = {},
  } = theme || {};

  /*
  |--------------------------------------------------------------------------
  | CONTROLLED / UNCONTROLLED
  |--------------------------------------------------------------------------
  */

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items?.[0]?.id,
  );

  const activeValue = isControlled ? value : internalValue;

  /*
  |--------------------------------------------------------------------------
  | COLORS
  |--------------------------------------------------------------------------
  */

  const resolvedPrimary = colors.primary ?? "#1976D2";

  const resolvedText = colors.text || {};

  const resolvedBorder = colors.border || {};

  const resolvedBackground = colors.background || {};

  /*
  |--------------------------------------------------------------------------
  | PALETTE
  |--------------------------------------------------------------------------
  */

  const palette = useMemo(
    () => ({
      active: activeColor ?? resolvedPrimary,

      inactive:
        inactiveColor ??
        resolvedText.secondary ??
        resolvedText.primary ??
        "#666666",

      indicator: indicatorColor ?? resolvedPrimary,

      background:
        backgroundColor ??
        resolvedBackground.primary ??
        colors.surface ??
        "#FFFFFF",

      border: borderColor ?? resolvedBorder.primary ?? "#E5E7EB",

      activeSoft:
        activeSoftColor ?? colors.primarySoft ?? `${resolvedPrimary}20`,

      onActive: onActiveColor ?? colors.onPrimary ?? "#FFFFFF",

      activeRipple: rippleColor ?? `${resolvedPrimary}22`,

      badgeActive: badgeActiveColor ?? resolvedPrimary,

      badgeInactive:
        badgeInactiveColor ??
        inactiveColor ??
        resolvedText.secondary ??
        "#777777",

      badgeText: badgeTextColor ?? "#FFFFFF",

      dot: dotColor ?? resolvedPrimary,
    }),
    [
      activeColor,
      activeSoftColor,
      backgroundColor,
      badgeActiveColor,
      badgeInactiveColor,
      badgeTextColor,
      borderColor,
      colors,
      dotColor,
      inactiveColor,
      indicatorColor,
      onActiveColor,
      resolvedBackground,
      resolvedBorder,
      resolvedPrimary,
      resolvedText,
      rippleColor,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | SCROLL REF
  |--------------------------------------------------------------------------
  */

  const scrollRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | TAB LAYOUTS
  |--------------------------------------------------------------------------
  */

  const layouts = useRef({});

  const [indicatorLayout, setIndicatorLayout] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | SPRING CONFIG
  |--------------------------------------------------------------------------
  */

  const resolvedSpring = useMemo(
    () => ({
      damping: springConfig?.damping ?? themeAnimation?.spring?.damping ?? 18,

      stiffness:
        springConfig?.stiffness ?? themeAnimation?.spring?.stiffness ?? 180,

      mass: springConfig?.mass ?? themeAnimation?.spring?.mass ?? 0.8,

      overshootClamping: springConfig?.overshootClamping ?? false,

      restDisplacementThreshold:
        springConfig?.restDisplacementThreshold ?? 0.01,

      restSpeedThreshold: springConfig?.restSpeedThreshold ?? 0.01,
    }),
    [springConfig, themeAnimation],
  );

  /*
  |--------------------------------------------------------------------------
  | CUSTOM TAB PADDING
  |--------------------------------------------------------------------------
  */

  const resolvedTabStyle = useMemo(() => {
    const result = {};

    if (tabHorizontalPadding !== undefined) {
      result.paddingHorizontal = tabHorizontalPadding;
    }

    if (tabVerticalPadding !== undefined) {
      result.paddingVertical = tabVerticalPadding;
    }

    return result;
  }, [tabHorizontalPadding, tabVerticalPadding]);

  /*
  |--------------------------------------------------------------------------
  | MOVE INDICATOR
  |--------------------------------------------------------------------------
  */

  const moveIndicator = useCallback(
    (id) => {
      if (id === undefined || id === null) {
        return;
      }

      const layout = layouts.current[id];

      if (!layout) {
        return;
      }

      setIndicatorLayout(layout);

      if (scrollable && scrollToActive && scrollRef.current) {
        const offset = Math.max(layout.x - scrollOffset, 0);

        scrollRef.current.scrollTo({
          x: offset,
          animated: true,
        });
      }
    },
    [scrollOffset, scrollToActive, scrollable],
  );

  /*
  |--------------------------------------------------------------------------
  | ACTIVE TAB CHANGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (activeValue === undefined || activeValue === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      moveIndicator(activeValue);
    });

    return () => cancelAnimationFrame(frame);
  }, [activeValue, moveIndicator]);

  /*
  |--------------------------------------------------------------------------
  | HANDLE PRESS
  |--------------------------------------------------------------------------
  */

  const handlePress = useCallback(
    (item) => {
      if (!item || item.disabled) {
        return;
      }

      const nextValue = item.id;

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, item);
    },
    [isControlled, onChange],
  );

  /*
  |--------------------------------------------------------------------------
  | HANDLE LAYOUT
  |--------------------------------------------------------------------------
  */

  const handleTabLayout = useCallback(
    (id, layout) => {
      if (id === undefined || id === null) {
        return;
      }

      layouts.current[id] = layout;

      if (activeValue === id) {
        requestAnimationFrame(() => {
          moveIndicator(id);
        });
      }
    },
    [activeValue, moveIndicator],
  );

  /*
  |--------------------------------------------------------------------------
  | RENDER TAB
  |--------------------------------------------------------------------------
  */

  const renderTab = useCallback(
    (item, index) => {
      if (!item) {
        return null;
      }

      const itemId = item.id ?? `tab-${index}`;

      return (
        <UITabItem
          key={itemId}
          item={item}
          active={activeValue === item.id}
          variant={variant}
          size={size}
          palette={palette}
          typography={typography}
          spacing={spacing}
          radius={radius}
          equalWidth={equalWidth}
          onPress={() => handlePress(item)}
          onLayout={(event) =>
            handleTabLayout(item.id, event.nativeEvent.layout)
          }
          tabStyle={[resolvedTabStyle, tabStyle, item.style]}
          labelStyle={[labelStyle, item.labelStyle]}
          iconSize={item.iconSize ?? iconSize}
          iconColor={item.iconColor ?? iconColor}
          iconStrokeWidth={item.iconStrokeWidth ?? iconStrokeWidth}
          badgeStyle={[badgeStyle, item.badgeStyle]}
          badgeTextStyle={[badgeTextStyle, item.badgeTextStyle]}
          dotSize={item.dotSize ?? dotSize}
          disabledOpacity={disabledOpacity}
        />
      );
    },
    [
      activeValue,
      badgeStyle,
      badgeTextStyle,
      disabledOpacity,
      dotSize,
      equalWidth,
      handlePress,
      handleTabLayout,
      iconColor,
      iconSize,
      iconStrokeWidth,
      labelStyle,
      palette,
      radius,
      resolvedTabStyle,
      size,
      spacing,
      tabStyle,
      typography,
      variant,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | HEADER CONTENT
  |--------------------------------------------------------------------------
  */

  const headerContent = useMemo(() => {
    const indicator =
      animated && indicatorLayout && variant === "underline" ? (
        <UITabIndicator
          layout={indicatorLayout}
          variant={variant}
          palette={palette}
          radius={radius}
          indicatorHeight={indicatorHeight ?? 2}
          indicatorWidth={indicatorWidth}
          indicatorRadius={indicatorRadius}
          indicatorColor={indicatorColor}
          indicatorStyle={indicatorStyle}
          springConfig={resolvedSpring}
        />
      ) : null;

    return (
      <>
        {indicator}

        {items.map(renderTab)}
      </>
    );
  }, [
    animated,
    indicatorColor,
    indicatorHeight,
    indicatorLayout,
    indicatorRadius,
    indicatorStyle,
    indicatorWidth,
    items,
    palette,
    radius,
    renderTab,
    resolvedSpring,
    variant,
  ]);

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  const header = scrollable ? (
    <ScrollView
      ref={scrollRef}
      horizontal
      bounces={false}
      overScrollMode="never"
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,

        {
          paddingHorizontal: spacing.xs ?? 4,
        },

        contentContainerStyle,
      ]}
    >
      <View
        style={[
          styles.row,

          {
            minHeight:
              size === "lg" ? (spacing.xxxl ?? 40) : (spacing.xxl ?? 32),
          },
        ]}
      >
        {headerContent}
      </View>
    </ScrollView>
  ) : (
    <View
      style={[
        styles.row,

        {
          minHeight: size === "lg" ? (spacing.xxxl ?? 40) : (spacing.xxl ?? 32),
        },

        contentContainerStyle,
      ]}
    >
      {headerContent}
    </View>
  );

  /*
  |--------------------------------------------------------------------------
  | DIVIDER
  |--------------------------------------------------------------------------
  */

  const resolvedDividerHeight = dividerHeight ?? StyleSheet.hairlineWidth;

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const contextValue = useMemo(
    () => ({
      value: activeValue,

      keepAlive,

      panelStyle,

      panelContentStyle,
    }),
    [activeValue, keepAlive, panelStyle, panelContentStyle],
  );

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return (
    <UITabsContext.Provider value={contextValue}>
      <View
        testID={testID}
        className={className}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.container,

          {
            backgroundColor: palette.background,
          },

          style,
        ]}
      >
        {header}

        {showDivider && variant === "underline" ? (
          <View
            style={{
              height: resolvedDividerHeight,

              backgroundColor: dividerColor ?? palette.border,
            }}
          />
        ) : null}

        <View style={styles.panelsContainer}>{children}</View>
      </View>
    </UITabsContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| DISPLAY NAME
|--------------------------------------------------------------------------
*/

UITab.displayName = "UITab";

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  row: {
    position: "relative",

    flexDirection: "row",

    alignItems: "center",
  },

  tabPressable: {
    justifyContent: "center",

    alignItems: "center",

    overflow: "hidden",
  },

  equalWidthTab: {
    flex: 1,
  },

  tabContent: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 1,
  },

  tabLabel: {
    flexShrink: 1,

    includeFontPadding: false,

    textAlignVertical: "center",
  },

  badge: {
    alignItems: "center",

    justifyContent: "center",
  },

  badgeText: {
    includeFontPadding: false,

    textAlign: "center",
  },

  dot: {
    flexShrink: 0,
  },

  indicator: {
    position: "absolute",

    zIndex: 20,
  },

  panelsContainer: {
    width: "100%",
  },

  panel: {
    width: "100%",
  },

  panelContent: {
    width: "100%",
  },
});

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

/*
 * Default export
 */
export default UITab;

/*
 * Named exports
 *
 * IMPORTANT:
 * UITab itself is explicitly exported here.
 * This fixes:
 *
 * TypeError: Cannot read property 'displayName' of undefined
 */
export { UITab, UITabItem, UITabPanel, UITabIndicator };
