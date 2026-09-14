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
  Easing,
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
  scrollable,

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
  /*
  |--------------------------------------------------------------------------
  | ICONS
  |--------------------------------------------------------------------------
  */

  const LeftIcon = item?.leftIcon;

  const RightIcon = item?.rightIcon;

  const disabled = item?.disabled === true;

  /*
  |--------------------------------------------------------------------------
  | SIZE METRICS
  |--------------------------------------------------------------------------
  */

  const metrics = useMemo(() => {
    const fontSizes = typography?.fontSizes || {};

    const fontWeights = typography?.fontWeights || {};

    switch (size) {
      case "xs":
        return {
          horizontal: spacing.xs,

          vertical: spacing.xs,

          icon: iconSize ?? fontSizes.sm ?? 12,

          gap: spacing.xs,

          radius: radius.sm,

          text: fontSizes.sm ?? 12,

          fontWeight: fontWeights.medium ?? "500",
        };

      case "sm":
        return {
          horizontal: spacing.sm,

          vertical: spacing.xs,

          icon: iconSize ?? fontSizes.sm ?? 12,

          gap: spacing.xs,

          radius: radius.md,

          text: fontSizes.sm ?? 12,

          fontWeight: fontWeights.medium ?? "500",
        };

      case "lg":
        return {
          horizontal: spacing.xl,

          vertical: spacing.md,

          icon: iconSize ?? fontSizes.lg ?? 18,

          gap: spacing.sm,

          radius: radius.xl,

          text: fontSizes.lg ?? 18,

          fontWeight: fontWeights.medium ?? "500",
        };

      default:
        return {
          horizontal: spacing.lg,

          vertical: spacing.sm,

          icon: iconSize ?? fontSizes.base ?? 16,

          gap: spacing.xs,

          radius: radius.lg,

          text: fontSizes.md ?? 14,

          fontWeight: fontWeights.medium ?? "500",
        };
    }
  }, [iconSize, radius, size, spacing, typography]);

  /*
  |--------------------------------------------------------------------------
  | BACKGROUND
  |--------------------------------------------------------------------------
  */

  const backgroundColor = useMemo(() => {
    switch (variant) {
      case "filled":
        return active ? palette.active : "transparent";

      case "pill":
        return active ? palette.active : "transparent";

      case "contained":
        return active ? palette.active : "transparent";

      case "soft":
        return active ? palette.activeSoft : "transparent";

      default:
        return "transparent";
    }
  }, [active, palette, variant]);

  /*
  |--------------------------------------------------------------------------
  | TEXT COLOR
  |--------------------------------------------------------------------------
  */

  const textColor = active
    ? variant === "filled" || variant === "contained" || variant === "pill"
      ? palette.onActive
      : palette.active
    : palette.inactive;

  /*
  |--------------------------------------------------------------------------
  | ICON COLOR
  |--------------------------------------------------------------------------
  */

  const resolvedIconColor = iconColor ?? textColor;

  /*
  |--------------------------------------------------------------------------
  | PRESSABLE
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

        equalWidth && styles.equalWidthTab,

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
        {/*
        ----------------------------------------------------------------------
        Left icon
        ----------------------------------------------------------------------
        */}

        {LeftIcon ? (
          <LeftIcon
            size={metrics.icon}
            color={resolvedIconColor}
            strokeWidth={iconStrokeWidth}
          />
        ) : null}

        {/*
        ----------------------------------------------------------------------
        Label
        ----------------------------------------------------------------------
        */}

        {item?.title !== undefined ? (
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

        {/*
        ----------------------------------------------------------------------
        Right icon
        ----------------------------------------------------------------------
        */}

        {RightIcon ? (
          <RightIcon
            size={metrics.icon}
            color={resolvedIconColor}
            strokeWidth={iconStrokeWidth}
          />
        ) : null}

        {/*
        ----------------------------------------------------------------------
        Badge
        ----------------------------------------------------------------------
        */}

        {item?.badge !== undefined && item?.badge !== null ? (
          <View
            style={[
              styles.badge,

              {
                marginLeft: spacing.xxs,

                minWidth: metrics.text + spacing.sm,

                minHeight: metrics.text + spacing.xxs,

                paddingHorizontal: spacing.xs,

                borderRadius: radius.pill,

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

                  fontWeight: typography?.fontWeights?.bold ?? "700",
                },

                badgeTextStyle,
              ]}
            >
              {item.badge}
            </Text>
          </View>
        ) : null}

        {/*
        ----------------------------------------------------------------------
        Dot
        ----------------------------------------------------------------------
        */}

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

  useEffect(() => {
    if (!layout) {
      return;
    }

    translateX.value = withSpring(layout.x, springConfig);

    width.value = withSpring(indicatorWidth ?? layout.width, springConfig);

    height.value = withSpring(indicatorHeight, springConfig);
  }, [
    indicatorHeight,
    indicatorWidth,
    layout,
    springConfig,
    translateX,
    width,
    height,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],

    width: width.value,

    height: height.value,
  }));

  const isUnderline = variant === "underline";

  const background =
    indicatorColor ?? (isUnderline ? palette.indicator : palette.active);

  const resolvedRadius =
    indicatorRadius ?? (isUnderline ? radius.pill : radius.lg);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,

        {
          backgroundColor: background,

          borderRadius: resolvedRadius,

          bottom: isUnderline ? 0 : undefined,

          top: isUnderline ? undefined : 0,

          left: 0,
        },

        animatedStyle,

        indicatorStyle,
      ]}
    />
  );
});

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
    throw new Error("UITabPanel must be used inside UITabs.");
  }

  const {
    value: activeTab,

    keepAlive,

    panelStyle: contextPanelStyle,

    panelContentStyle: contextPanelContentStyle,
  } = context;

  const active = value === activeTab;

  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
    }
  }, [active]);

  /*
    |--------------------------------------------------------------------------
    | Lazy mounting
    |--------------------------------------------------------------------------
    */

  if (!keepAlive && !active) {
    return null;
  }

  if (lazy && !mounted) {
    return null;
  }

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
    },

    contextPanelStyle,

    style,
  ];

  const contentStyles = [
    styles.panelContent,

    contextPanelContentStyle,

    contentContainerStyle,
  ];

  if (!animation) {
    return (
      <View
        style={[
          panelStyles,
          {
            display: active ? "flex" : "none",
          },
        ]}
      >
        <View style={contentStyles}>{children}</View>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(animationDuration)}
      exiting={FadeOut.duration(exitAnimationDuration)}
      style={[
        panelStyles,

        {
          display: active ? "flex" : "none",
        },
      ]}
    >
      <Animated.View style={contentStyles}>{children}</Animated.View>
    </Animated.View>
  );
});

/*
|--------------------------------------------------------------------------
| MAIN UI TABS
|--------------------------------------------------------------------------
*/

function UITab({
  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  items = [],

  value,

  defaultValue,

  onChange,

  children,

  /*
  |--------------------------------------------------------------------------
  | Variant
  |--------------------------------------------------------------------------
  */

  variant = "underline",

  size = "md",

  /*
  |--------------------------------------------------------------------------
  | Layout
  |--------------------------------------------------------------------------
  */

  scrollable = false,

  equalWidth = false,

  /*
  |--------------------------------------------------------------------------
  | Animation
  |--------------------------------------------------------------------------
  */

  animated = true,

  animationDuration = 220,

  springConfig,

  /*
  |--------------------------------------------------------------------------
  | Divider
  |--------------------------------------------------------------------------
  */

  showDivider = true,

  dividerColor,

  dividerHeight,

  /*
  |--------------------------------------------------------------------------
  | Panel
  |--------------------------------------------------------------------------
  */

  keepAlive = false,

  panelStyle,

  panelContentStyle,

  /*
  |--------------------------------------------------------------------------
  | Colors
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
  | Tab styles
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
  | Tab metrics
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
  | Indicator
  |--------------------------------------------------------------------------
  */

  indicatorHeight,

  indicatorWidth,

  indicatorRadius,

  /*
  |--------------------------------------------------------------------------
  | Badge / dot
  |--------------------------------------------------------------------------
  */

  badgeStyle,

  badgeTextStyle,

  dotSize = 7,

  /*
  |--------------------------------------------------------------------------
  | Scroll
  |--------------------------------------------------------------------------
  */

  scrollToActive = true,

  scrollOffset = 16,

  /*
  |--------------------------------------------------------------------------
  | Accessibility
  |--------------------------------------------------------------------------
  */

  accessibilityLabel,

  testID,
}) {
  const { theme } = useUITheme();

  const {
    colors,
    spacing,
    radius,
    typography,
    animation: themeAnimation,
  } = theme;

  /*
  |--------------------------------------------------------------------------
  | Controlled / uncontrolled
  |--------------------------------------------------------------------------
  */

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items?.[0]?.id,
  );

  const activeValue = isControlled ? value : internalValue;

  /*
  |--------------------------------------------------------------------------
  | Theme-safe color helpers
  |--------------------------------------------------------------------------
  */

  const resolvedColors = colors || {};

  const resolvedPrimary = resolvedColors.primary || "#1976D2";

  const resolvedText = resolvedColors.text;

  const resolvedBorder = resolvedColors.border;

  const resolvedBackground = resolvedColors.background;

  /*
  |--------------------------------------------------------------------------
  | Palette
  |--------------------------------------------------------------------------
  */

  const palette = useMemo(
    () => ({
      active: activeColor ?? resolvedPrimary,

      inactive:
        inactiveColor ??
        resolvedText?.secondary ??
        resolvedText?.primary ??
        "#666666",

      indicator: indicatorColor ?? resolvedPrimary,

      background:
        backgroundColor ??
        resolvedBackground?.primary ??
        resolvedColors.surface ??
        "#FFFFFF",

      border: borderColor ?? resolvedBorder?.primary ?? "#E5E7EB",

      activeSoft:
        activeSoftColor ?? resolvedColors.primarySoft ?? `${resolvedPrimary}20`,

      onActive: onActiveColor ?? resolvedColors.onPrimary ?? "#FFFFFF",

      activeRipple: rippleColor ?? `${resolvedPrimary}22`,

      badgeActive: badgeActiveColor ?? resolvedPrimary,

      badgeInactive:
        badgeInactiveColor ??
        inactiveColor ??
        resolvedText?.secondary ??
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
      dotColor,
      inactiveColor,
      indicatorColor,
      onActiveColor,
      resolvedBackground,
      resolvedBorder,
      resolvedColors,
      resolvedPrimary,
      resolvedText,
      rippleColor,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Scroll ref
  |--------------------------------------------------------------------------
  */

  const scrollRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Tab layouts
  |--------------------------------------------------------------------------
  */

  const layouts = useRef({});

  const [indicatorLayout, setIndicatorLayout] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Spring configuration
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
  | Size-based spacing
  |--------------------------------------------------------------------------
  */

  const resolvedTabStyle = useMemo(() => {
    const styleObject = {};

    if (tabHorizontalPadding !== undefined) {
      styleObject.paddingHorizontal = tabHorizontalPadding;
    }

    if (tabVerticalPadding !== undefined) {
      styleObject.paddingVertical = tabVerticalPadding;
    }

    return styleObject;
  }, [tabHorizontalPadding, tabVerticalPadding]);

  /*
  |--------------------------------------------------------------------------
  | Move indicator
  |--------------------------------------------------------------------------
  */

  const moveIndicator = useCallback(
    (id) => {
      if (!id && id !== 0) {
        return;
      }

      const layout = layouts.current[id];

      if (!layout) {
        return;
      }

      setIndicatorLayout(layout);

      /*
        ----------------------------------------------------------------------
        Scroll active tab into view
        ----------------------------------------------------------------------
        */

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
  | Active tab changed
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (activeValue === undefined || activeValue === null) {
      return;
    }

    /*
    ------------------------------------------------------------------------
    Wait for layout to be available
    ------------------------------------------------------------------------
    */

    const frame = requestAnimationFrame(() => {
      moveIndicator(activeValue);
    });

    return () => cancelAnimationFrame(frame);
  }, [activeValue, moveIndicator]);

  /*
  |--------------------------------------------------------------------------
  | Handle tab press
  |--------------------------------------------------------------------------
  */

  const handlePress = useCallback(
    (item) => {
      if (item?.disabled) {
        return;
      }

      const nextValue = item?.id;

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, item);
    },
    [isControlled, onChange],
  );

  /*
  |--------------------------------------------------------------------------
  | Handle tab layout
  |--------------------------------------------------------------------------
  */

  const handleTabLayout = useCallback(
    (id, layout) => {
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
  | Render tab
  |--------------------------------------------------------------------------
  */

  const renderTab = useCallback(
    (item, index) => (
      <UITabItem
        key={item?.id ?? `tab-${index}`}
        item={item}
        active={activeValue === item?.id}
        variant={variant}
        size={size}
        palette={palette}
        typography={typography}
        spacing={spacing}
        radius={radius}
        equalWidth={equalWidth}
        scrollable={scrollable}
        onPress={() => handlePress(item)}
        onLayout={(event) =>
          handleTabLayout(item?.id, event.nativeEvent.layout)
        }
        tabStyle={[resolvedTabStyle, item?.style]}
        labelStyle={[labelStyle, item?.labelStyle]}
        iconSize={item?.iconSize ?? iconSize}
        iconColor={item?.iconColor ?? iconColor}
        iconStrokeWidth={item?.iconStrokeWidth ?? iconStrokeWidth}
        badgeStyle={[badgeStyle, item?.badgeStyle]}
        badgeTextStyle={[badgeTextStyle, item?.badgeTextStyle]}
        dotSize={item?.dotSize ?? dotSize}
        disabledOpacity={disabledOpacity}
      />
    ),
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
      scrollable,
      size,
      spacing,
      typography,
      variant,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Header row
  |--------------------------------------------------------------------------
  */

  const headerContent = useMemo(() => {
    const indicator =
      animated && indicatorLayout ? (
        <UITabIndicator
          layout={indicatorLayout}
          variant={variant}
          palette={palette}
          radius={radius}
          indicatorHeight={indicatorHeight ?? (variant === "underline" ? 2 : 0)}
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
  | Header
  |--------------------------------------------------------------------------
  */

  const Header = scrollable ? (
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
          paddingHorizontal: spacing.xs,
        },
        contentContainerStyle,
      ]}
    >
      <View
        style={[
          styles.row,
          {
            minHeight: size === "lg" ? spacing.xxxl : spacing.xxl,
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
          minHeight: size === "lg" ? spacing.xxxl : spacing.xxl,
        },
        contentContainerStyle,
      ]}
    >
      {headerContent}
    </View>
  );

  /*
  |--------------------------------------------------------------------------
  | Divider
  |--------------------------------------------------------------------------
  */

  const resolvedDividerHeight = dividerHeight ?? StyleSheet.hairlineWidth;

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return (
    <UITabsContext.Provider
      value={{
        value: activeValue,

        keepAlive,

        panelStyle,

        panelContentStyle,
      }}
    >
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
        {/*
        ======================================================================
        HEADER
        ======================================================================
        */}

        {Header}

        {/*
        ======================================================================
        DIVIDER
        ======================================================================
        */}

        {showDivider && variant === "underline" ? (
          <View
            style={{
              height: resolvedDividerHeight,

              backgroundColor: dividerColor ?? palette.border,
            }}
          />
        ) : null}

        {/*
        ======================================================================
        PANELS
        ======================================================================
        */}

        <View style={styles.panelsContainer}>{children}</View>
      </View>
    </UITabsContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  /*
    ========================================================================
    TABS CONTAINER
    ========================================================================
    */

  container: {
    width: "100%",
  },

  /*
    ========================================================================
    SCROLL
    ========================================================================
    */

  scrollContent: {
    flexGrow: 1,
  },

  /*
    ========================================================================
    ROW
    ========================================================================
    */

  row: {
    position: "relative",

    flexDirection: "row",

    alignItems: "center",
  },

  /*
    ========================================================================
    TAB
    ========================================================================
    */

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

  /*
    ========================================================================
    BADGE
    ========================================================================
    */

  badge: {
    alignItems: "center",

    justifyContent: "center",
  },

  badgeText: {
    includeFontPadding: false,

    textAlign: "center",
  },

  /*
    ========================================================================
    DOT
    ========================================================================
    */

  dot: {
    flexShrink: 0,
  },

  /*
    ========================================================================
    INDICATOR
    ========================================================================
    */

  indicator: {
    position: "absolute",

    zIndex: 20,
  },

  /*
    ========================================================================
    PANELS
    ========================================================================
    */

  panelsContainer: {
    flex: 1,
  },

  panel: {
    flex: 1,
  },

  panelContent: {
    flex: 1,
  },
});

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export { UITabItem, UITabPanel, UITabIndicator };

export default UITab;
