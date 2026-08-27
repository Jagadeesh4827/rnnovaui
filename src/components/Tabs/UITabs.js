import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

/* =========================================================
 * CONSTANTS
 * ======================================================= */

export const UITabsSizes = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export const UITabsAnimations = {
  none: "none",

  fade: "fade",
  scale: "scale",
  fadeScale: "fadeScale",

  slide: "slide",
  slideFade: "slideFade",
  slideScale: "slideScale",

  spring: "spring",
  springScale: "springScale",
  springSlide: "springSlide",

  bounce: "bounce",
  pulse: "pulse",

  indicatorSlide: "indicatorSlide",
  indicatorSpring: "indicatorSpring",
  indicatorFade: "indicatorFade",
  indicatorScale: "indicatorScale",
  indicatorFadeScale:
    "indicatorFadeScale",
};

export const UITabsAnimationPresets = {
  none: {
    animation: "none",
    duration: 0,
  },

  subtle: {
    animation: "fade",
    duration: 160,
  },

  smooth: {
    animation: "indicatorSlide",
    duration: 240,
  },

  snappy: {
    animation: "indicatorSlide",
    duration: 160,
  },

  spring: {
    animation: "indicatorSpring",
    duration: 280,
  },

  bouncy: {
    animation: "bounce",
    duration: 420,
  },
};

/* =========================================================
 * CONTEXT
 * ======================================================= */

const TabsContext =
  createContext(null);

/* =========================================================
 * HELPERS
 * ======================================================= */

function getSizeConfig(size) {
  switch (size) {
    case "sm":
      return {
        height: 42,
        horizontalPadding: 10,
        fontSize: 12,
        iconSize: 16,
      };

    case "lg":
      return {
        height: 58,
        horizontalPadding: 16,
        fontSize: 16,
        iconSize: 22,
      };

    case "md":
    default:
      return {
        height: 48,
        horizontalPadding: 12,
        fontSize: 14,
        iconSize: 18,
      };
  }
}

function getEasing(easing) {
  switch (easing) {
    case "linear":
      return Easing.linear;

    case "easeIn":
      return Easing.in(Easing.ease);

    case "easeOut":
      return Easing.out(Easing.ease);

    case "easeInOut":
      return Easing.inOut(Easing.ease);

    case "quad":
      return Easing.out(Easing.quad);

    case "cubic":
      return Easing.out(Easing.cubic);

    case "sin":
      return Easing.out(Easing.sin);

    default:
      return Easing.out(Easing.ease);
  }
}

function getAnimationConfig({
  animation,
  animationPreset,
  animationDuration,
}) {
  if (
    animationPreset &&
    UITabsAnimationPresets[
      animationPreset
    ]
  ) {
    const preset =
      UITabsAnimationPresets[
        animationPreset
      ];

    return {
      animation:
        animation || preset.animation,

      duration:
        animationDuration ??
        preset.duration,
    };
  }

  return {
    animation:
      animation || "indicatorSlide",

    duration:
      animationDuration ?? 240,
  };
}

/* =========================================================
 * ROOT
 * ======================================================= */

const UITabsRoot = memo(
  forwardRef(function UITabs(
    {
      children,

      value,
      defaultValue = null,

      onValueChange,

      size = "md",

      variant = "default",

      animated = true,

      animation = "indicatorSlide",

      animationPreset,

      animationDuration = 240,

      animationEasing = "easeOut",

      indicatorAnimation,

      contentAnimation = "fade",

      directionAware = true,

      spring = {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      },

      activeColor,
      inactiveColor,

      indicatorColor,

      indicatorHeight = 2,

      indicatorWidth = "content",

      indicatorRadius,

      pressAnimation = "scale",

      pressScale = 0.96,

      disabled = false,

      style,
      containerStyle,

      onTabPress,

      testID,
    },
    ref,
  ) {
    const { theme } =
      useUITheme();

    const colors =
      theme?.colors || {};

    const controlled =
      value !== undefined;

    const [internalValue, setInternalValue] =
      useState(defaultValue);

    const currentValue =
      controlled
        ? value
        : internalValue;

    const previousValue =
      useRef(currentValue);

    const [
      triggerLayouts,
      setTriggerLayouts,
    ] = useState({});

    const [
      listWidth,
      setListWidth,
    ] = useState(0);

    const listScrollRef =
      useRef(null);

    const safeSize =
      UITabsSizes[size]
        ? size
        : "md";

    const sizeConfig =
      getSizeConfig(safeSize);

    const animationConfig =
      getAnimationConfig({
        animation,
        animationPreset,
        animationDuration,
      });

    const resolvedAnimation =
      animated
        ? animationConfig.animation
        : "none";

    const resolvedDuration =
      animated
        ? animationConfig.duration
        : 0;

    const resolvedActiveColor =
      activeColor ||
      colors.primary ||
      "#FF5A1F";

    const resolvedInactiveColor =
      inactiveColor ||
      colors.textSecondary ||
      "#737373";

    const resolvedIndicatorColor =
      indicatorColor ||
      resolvedActiveColor;

    const selectValue =
      useCallback(
        nextValue => {
          if (disabled) {
            return;
          }

          previousValue.current =
            currentValue;

          if (!controlled) {
            setInternalValue(
              nextValue,
            );
          }

          onValueChange?.(
            nextValue,
          );
        },
        [
          disabled,
          controlled,
          currentValue,
          onValueChange,
        ],
      );

    const isActive =
      useCallback(
        tabValue =>
          currentValue ===
          tabValue,
        [currentValue],
      );

    const registerTrigger =
      useCallback(
        (
          tabValue,
          layout,
        ) => {
          setTriggerLayouts(
            previous => {
              const key =
                String(tabValue);

              const old =
                previous[key];

              if (
                old &&
                old.x === layout.x &&
                old.width ===
                  layout.width &&
                old.height ===
                  layout.height
              ) {
                return previous;
              }

              return {
                ...previous,
                [key]: layout,
              };
            },
          );
        },
        [],
      );

    const scrollToTab =
      useCallback(
        tabValue => {
          const layout =
            triggerLayouts[
              String(tabValue)
            ];

          if (
            !layout ||
            !listScrollRef.current ||
            !listWidth
          ) {
            return;
          }

          const target = Math.max(
            0,
            layout.x +
              layout.width / 2 -
              listWidth / 2,
          );

          listScrollRef.current.scrollTo(
            {
              x: target,
              animated: true,
            },
          );
        },
        [
          triggerLayouts,
          listWidth,
        ],
      );

    useEffect(() => {
      if (
        currentValue === null ||
        currentValue === undefined
      ) {
        return;
      }

      scrollToTab(
        currentValue,
      );
    }, [
      currentValue,
      scrollToTab,
    ]);

    const getDirection =
      useCallback(
        tabValue => {
          if (
            !directionAware
          ) {
            return 1;
          }

          const previous =
            previousValue.current;

          const previousLayout =
            triggerLayouts[
              String(previous)
            ];

          const nextLayout =
            triggerLayouts[
              String(tabValue)
            ];

          if (
            !previousLayout ||
            !nextLayout
          ) {
            return 1;
          }

          return nextLayout.x >=
            previousLayout.x
            ? 1
            : -1;
        },
        [
          directionAware,
          triggerLayouts,
        ],
      );

    const contextValue =
      useMemo(
        () => ({
          colors,

          value:
            currentValue,

          previousValue:
            previousValue.current,

          size:
            safeSize,

          sizeConfig,

          variant,

          disabled,

          animated,

          animation:
            resolvedAnimation,

          animationDuration:
            resolvedDuration,

          animationEasing,

          indicatorAnimation:
            indicatorAnimation ||
            resolvedAnimation,

          contentAnimation,

          directionAware,

          spring,

          activeColor:
            resolvedActiveColor,

          inactiveColor:
            resolvedInactiveColor,

          indicatorColor:
            resolvedIndicatorColor,

          indicatorHeight,

          indicatorWidth,

          indicatorRadius,

          pressAnimation,

          pressScale,

          selectValue,

          isActive,

          triggerLayouts,

          registerTrigger,

          listWidth,

          setListWidth,

          listScrollRef,

          getDirection,

          onTabPress,
        }),
        [
          colors,
          currentValue,
          safeSize,
          sizeConfig,
          variant,
          disabled,
          animated,
          resolvedAnimation,
          resolvedDuration,
          animationEasing,
          indicatorAnimation,
          contentAnimation,
          directionAware,
          spring,
          resolvedActiveColor,
          resolvedInactiveColor,
          resolvedIndicatorColor,
          indicatorHeight,
          indicatorWidth,
          indicatorRadius,
          pressAnimation,
          pressScale,
          selectValue,
          isActive,
          triggerLayouts,
          registerTrigger,
          listWidth,
          getDirection,
          onTabPress,
        ],
      );

    return (
      <TabsContext.Provider
        value={contextValue}
      >
        <View
          ref={ref}
          testID={testID}
          style={[
            styles.root,

            variant === "filled"
              ? {
                  backgroundColor:
                    colors.surface ||
                    "#F7F7F7",
                }
              : null,

            style,
            containerStyle,
          ]}
        >
          {children}
        </View>
      </TabsContext.Provider>
    );
  },
);

/* =========================================================
 * LIST
 * ======================================================= */

const UITabsList = memo(
  function UITabsList({
    children,

    scrollable = false,

    showsHorizontalScrollIndicator =
      false,

    keyboardShouldPersistTaps =
      "handled",

    style,
    contentContainerStyle,

    backgroundColor,

    borderBottomWidth = 0,
    borderBottomColor,

    paddingHorizontal,

    gap = 0,

    onLayout,

    testID,
  }) {
    const tabs =
      useUITabsContext();

    const content = (
      <View
        style={[
          styles.listContent,

          {
            minHeight:
              tabs.sizeConfig.height,

            paddingHorizontal:
              paddingHorizontal ??
              tabs.sizeConfig
                .horizontalPadding,

            gap,
          },

          contentContainerStyle,
        ]}
      >
        {children}

        <UITabs.Indicator />
      </View>
    );

    const handleLayout =
      event => {
        const width =
          event.nativeEvent
            .layout.width;

        tabs.setListWidth(
          width,
        );

        onLayout?.(event);
      };

    if (scrollable) {
      return (
        <View
          testID={testID}
          onLayout={
            handleLayout
          }
          style={[
            styles.list,

            {
              backgroundColor:
                backgroundColor ||
                (tabs.variant ===
                "filled"
                  ? tabs.colors
                      .surface ||
                    "#F7F7F7"
                  : "transparent"),

              borderBottomWidth,

              borderBottomColor:
                borderBottomColor ||
                tabs.colors.border ||
                "#E5E5E5",
            },

            style,
          ]}
        >
          <ScrollView
            ref={
              tabs.listScrollRef
            }
            horizontal
            showsHorizontalScrollIndicator={
              showsHorizontalScrollIndicator
            }
            keyboardShouldPersistTaps={
              keyboardShouldPersistTaps
            }
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {content}
          </ScrollView>
        </View>
      );
    }

    return (
      <View
        testID={testID}
        onLayout={
          handleLayout
        }
        style={[
          styles.list,

          {
            backgroundColor:
              backgroundColor ||
              (tabs.variant ===
              "filled"
                ? tabs.colors
                    .surface ||
                  "#F7F7F7"
                : "transparent"),

            borderBottomWidth,

            borderBottomColor:
              borderBottomColor ||
              tabs.colors.border ||
              "#E5E5E5",
          },

          style,
        ]}
      >
        {content}
      </View>
    );
  },
);

/* =========================================================
 * TRIGGER
 * ======================================================= */

const UITabsTrigger = memo(
  function UITabsTrigger({
    children,

    value,

    icon,
    iconPosition = "left",

    badge,

    disabled = false,

    onPress,

    style,
    activeStyle,
    inactiveStyle,

    contentStyle,

    textStyle,
    activeTextStyle,
    inactiveTextStyle,

    iconStyle,

    badgeStyle,
    badgeTextStyle,

    activeColor,
    inactiveColor,

    pressAnimation,
    pressScale,

    testID,

    accessibilityLabel,
    accessibilityHint,
  }) {
    const tabs =
      useUITabsContext();

    const active =
      tabs.isActive(value);

    const isDisabled =
      disabled ||
      tabs.disabled;

    const scale =
      useRef(
        new Animated.Value(1),
      ).current;

    const opacity =
      useRef(
        new Animated.Value(1),
      ).current;

    const handlePressIn =
      () => {
        if (
          isDisabled
        ) {
          return;
        }

        const animation =
          pressAnimation ??
          tabs.pressAnimation;

        if (
          animation === "none"
        ) {
          return;
        }

        if (
          animation ===
          "opacity"
        ) {
          Animated.timing(
            opacity,
            {
              toValue: 0.65,

              duration: 80,

              useNativeDriver:
                true,
            },
          ).start();

          return;
        }

        Animated.parallel([
          Animated.spring(
            scale,
            {
              toValue:
                pressScale ??
                tabs.pressScale,

              useNativeDriver:
                true,

              ...tabs.spring,
            },
          ),

          Animated.timing(
            opacity,
            {
              toValue: 0.8,

              duration: 80,

              useNativeDriver:
                true,
            },
          ),
        ]).start();
      };

    const handlePressOut =
      () => {
        Animated.parallel([
          Animated.spring(
            scale,
            {
              toValue: 1,

              useNativeDriver:
                true,

              ...tabs.spring,
            },
          ),

          Animated.timing(
            opacity,
            {
              toValue: 1,

              duration: 100,

              useNativeDriver:
                true,
            },
          ),
        ]).start();
      };

    const handlePress =
      event => {
        if (
          isDisabled
        ) {
          return;
        }

        tabs.selectValue(
          value,
        );

        tabs.onTabPress?.(
          value,
          event,
        );

        onPress?.(event);
      };

    const handleLayout =
      event => {
        const layout =
          event.nativeEvent
            .layout;

        tabs.registerTrigger(
          value,
          layout,
        );
      };

    const resolvedActiveColor =
      activeColor ||
      tabs.activeColor;

    const resolvedInactiveColor =
      inactiveColor ||
      tabs.inactiveColor;

    const textColor =
      active
        ? resolvedActiveColor
        : resolvedInactiveColor;

    return (
      <Animated.View
        onLayout={
          handleLayout
        }
        style={{
          transform: [
            {
              scale,
            },
          ],

          opacity,
        }}
      >
        <Pressable
          testID={testID}
          disabled={isDisabled}
          onPress={
            handlePress
          }
          onPressIn={
            handlePressIn
          }
          onPressOut={
            handlePressOut
          }
          accessibilityRole="tab"
          accessibilityLabel={
            accessibilityLabel
          }
          accessibilityHint={
            accessibilityHint
          }
          accessibilityState={{
            selected: active,
            disabled: isDisabled,
          }}
          style={[
            styles.trigger,

            {
              minHeight:
                tabs.sizeConfig
                  .height,

              paddingHorizontal:
                tabs.sizeConfig
                  .horizontalPadding,

              opacity:
                isDisabled
                  ? 0.45
                  : 1,
            },

            inactiveStyle,

            active
              ? activeStyle
              : null,

            style,
          ]}
        >
          <View
            style={[
              styles.triggerContent,

              contentStyle,
            ]}
          >
            {icon &&
            iconPosition ===
              "left" ? (
              <View
                style={[
                  styles.icon,
                  {
                    marginRight: 6,
                  },
                  iconStyle,
                ]}
              >
                {icon}
              </View>
            ) : null}

            <Text
              numberOfLines={1}
              style={[
                styles.text,

                {
                  fontSize:
                    tabs.sizeConfig
                      .fontSize,

                  color:
                    textColor,
                },

                textStyle,

                active
                  ? activeTextStyle
                  : inactiveTextStyle,
              ]}
            >
              {children}
            </Text>

            {icon &&
            iconPosition ===
              "right" ? (
              <View
                style={[
                  styles.icon,
                  {
                    marginLeft: 6,
                  },
                  iconStyle,
                ]}
              >
                {icon}
              </View>
            ) : null}

            {badge !==
              undefined &&
            badge !== null ? (
              <View
                style={[
                  styles.badge,

                  {
                    backgroundColor:
                      active
                        ? tabs
                            .activeColor
                        : tabs
                            .colors
                            .surfaceSecondary ||
                          "#EEEEEE",
                  },

                  badgeStyle,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,

                    {
                      color:
                        active
                          ? tabs
                              .colors
                              .onPrimary ||
                            "#FFFFFF"
                          : tabs
                              .colors
                              .textSecondary ||
                            "#525252",
                    },

                    badgeTextStyle,
                  ]}
                >
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

/* =========================================================
 * INDICATOR
 * ======================================================= */

const UITabsIndicator = memo(
  function UITabsIndicator({
    style,

    color,

    height,

    width,

    radius,

    children,
  }) {
    const tabs =
      useUITabsContext();

    const activeLayout =
      tabs.value !== null &&
      tabs.value !==
        undefined
        ? tabs.triggerLayouts[
            String(tabs.value)
          ]
        : null;

    const x =
      useRef(
        new Animated.Value(0),
      ).current;

    const indicatorWidth =
      useRef(
        new Animated.Value(0),
      ).current;

    const opacity =
      useRef(
        new Animated.Value(0),
      ).current;

    const scale =
      useRef(
        new Animated.Value(1),
      ).current;

    useEffect(() => {
      if (!activeLayout) {
        return;
      }

      const targetX =
        activeLayout.x;

      const targetWidth =
        activeLayout.width;

      const animation =
        tabs.indicatorAnimation;

      if (
        !tabs.animated ||
        animation === "none"
      ) {
        x.setValue(targetX);

        indicatorWidth.setValue(
          targetWidth,
        );

        opacity.setValue(1);

        scale.setValue(1);

        return;
      }

      if (
        animation ===
        "indicatorFade"
      ) {
        opacity.setValue(0);
      }

      if (
        animation ===
          "indicatorFadeScale" ||
        animation ===
          "indicatorScale"
      ) {
        scale.setValue(0.8);
      }

      if (
        animation ===
          "indicatorSpring" ||
        animation ===
          "spring"
      ) {
        Animated.parallel([
          Animated.spring(x, {
            toValue: targetX,

            useNativeDriver:
              false,

            ...tabs.spring,
          }),

          Animated.spring(
            indicatorWidth,
            {
              toValue:
                targetWidth,

              useNativeDriver:
                false,

              ...tabs.spring,
            },
          ),

          Animated.spring(scale, {
            toValue: 1,

            useNativeDriver:
              false,

            ...tabs.spring,
          }),

          Animated.timing(
            opacity,
            {
              toValue: 1,

              duration:
                tabs.animationDuration,

              useNativeDriver:
                false,
            },
          ),
        ]).start();

        return;
      }

      Animated.parallel([
        Animated.timing(x, {
          toValue: targetX,

          duration:
            tabs.animationDuration,

          easing: getEasing(
            tabs.animationEasing,
          ),

          useNativeDriver:
            false,
        }),

        Animated.timing(
          indicatorWidth,
          {
            toValue:
              targetWidth,

            duration:
              tabs.animationDuration,

            easing: getEasing(
              tabs.animationEasing,
            ),

            useNativeDriver:
              false,
          },
        ),

        Animated.timing(opacity, {
          toValue: 1,

          duration:
            tabs.animationDuration,

          useNativeDriver:
            false,
        }),

        Animated.timing(scale, {
          toValue: 1,

          duration:
            tabs.animationDuration,

          useNativeDriver:
            false,
        }),
      ]).start();
    }, [
      activeLayout,
      tabs.animated,
      tabs.indicatorAnimation,
      tabs.animationDuration,
      tabs.animationEasing,
      tabs.spring,
      x,
      indicatorWidth,
      opacity,
      scale,
    ]);

    if (!activeLayout) {
      return null;
    }

    const resolvedHeight =
      height ??
      tabs.indicatorHeight;

    const resolvedColor =
      color ||
      tabs.indicatorColor;

    const resolvedWidth =
      width ||
      tabs.indicatorWidth;

    const resolvedRadius =
      radius ??
      tabs.indicatorRadius ??
      resolvedHeight / 2;

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,

          {
            left: x,

            width:
              indicatorWidth,

            height:
              resolvedHeight,

            backgroundColor:
              resolvedColor,

            borderRadius:
              resolvedRadius,

            opacity,

            transform: [
              {
                scaleX: scale,
              },
            ],
          },

          resolvedWidth ===
          "full"
            ? {
                left: 0,
              }
            : null,

          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  },
);

/* =========================================================
 * CONTENT
 * ======================================================= */

const UITabsContent = memo(
  function UITabsContent({
    children,

    value,

    style,
    contentContainerStyle,

    animation,

    animationDuration,

    lazy = true,

    unmountOnExit = true,

    accessible = false,

    accessibilityLabel,

    testID,

    ...props
  }) {
    const tabs =
      useUITabsContext();

    const active =
      tabs.isActive(value);

    const [mounted, setMounted] =
      useState(
        active || !lazy,
      );

    const progress =
      useRef(
        new Animated.Value(
          active ? 1 : 0,
        ),
      ).current;

    const previousActive =
      useRef(active);

    const direction =
      tabs.getDirection(
        value,
      );

    const resolvedAnimation =
      animation ||
      tabs.contentAnimation;

    useEffect(() => {
      if (active) {
        setMounted(true);

        if (
          !tabs.animated ||
          resolvedAnimation ===
            "none"
        ) {
          progress.setValue(1);

          previousActive.current =
            true;

          return;
        }

        progress.setValue(0);

        Animated.timing(
          progress,
          {
            toValue: 1,

            duration:
              animationDuration ??
              tabs.animationDuration,

            easing: getEasing(
              tabs.animationEasing,
            ),

            useNativeDriver:
              true,
          },
        ).start();

        previousActive.current =
          true;

        return;
      }

      if (
        !previousActive.current
      ) {
        return;
      }

      if (
        !tabs.animated ||
        resolvedAnimation ===
          "none"
      ) {
        progress.setValue(0);

        if (unmountOnExit) {
          setMounted(false);
        }

        previousActive.current =
          false;

        return;
      }

      Animated.timing(
        progress,
        {
          toValue: 0,

          duration:
            animationDuration ??
            tabs.animationDuration,

          useNativeDriver:
            true,
        },
      ).start(() => {
        if (unmountOnExit) {
          setMounted(false);
        }
      });

      previousActive.current =
        false;
    }, [
      active,
      tabs.animated,
      tabs.animationDuration,
      tabs.animationEasing,
      resolvedAnimation,
      animationDuration,
      progress,
      unmountOnExit,
    ]);

    if (!mounted) {
      return null;
    }

    const isFade =
      resolvedAnimation ===
        "fade" ||
      resolvedAnimation ===
        "slideFade" ||
      resolvedAnimation ===
        "fadeScale";

    const isScale =
      resolvedAnimation ===
        "scale" ||
      resolvedAnimation ===
        "fadeScale" ||
      resolvedAnimation ===
        "slideScale";

    const isSlide =
      resolvedAnimation ===
        "slide" ||
      resolvedAnimation ===
        "slideFade" ||
      resolvedAnimation ===
        "slideScale";

    const translateStart =
      direction * 16;

    const translateX =
      isSlide
        ? progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              translateStart,
              0,
            ],
          })
        : 0;

    const scaleValue =
      isScale
        ? progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              0.96,
              1,
            ],
          })
        : 1;

    return (
      <Animated.View
        testID={testID}
        accessible={accessible}
        accessibilityLabel={
          accessibilityLabel
        }
        style={[
          {
            opacity: isFade
              ? progress
              : 1,

            transform: [
              {
                translateX,
              },
              {
                scale:
                  scaleValue,
              },
            ],
          },

          style,

          contentContainerStyle,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    );
  },
);

/* =========================================================
 * CONTEXT HOOK
 * ======================================================= */

function useUITabsContext() {
  const context =
    useContext(TabsContext);

  if (!context) {
    throw new Error(
      "UITabs components must be used inside UITabs.",
    );
  }

  return context;
}

export function useUITabs() {
  return useUITabsContext();
}

/* =========================================================
 * COMPOUND API
 * ======================================================= */

UITabsRoot.List =
  UITabsList;

UITabsRoot.Trigger =
  UITabsTrigger;

UITabsRoot.Content =
  UITabsContent;

UITabsRoot.Indicator =
  UITabsIndicator;

/* =========================================================
 * EXPORT
 * ======================================================= */

export const UITabs =
  UITabsRoot;

/* =========================================================
 * DISPLAY NAMES
 * ======================================================= */

UITabsRoot.displayName =
  "UITabs";

UITabsList.displayName =
  "UITabs.List";

UITabsTrigger.displayName =
  "UITabs.Trigger";

UITabsContent.displayName =
  "UITabs.Content";

UITabsIndicator.displayName =
  "UITabs.Indicator";

/* =========================================================
 * STYLES
 * ======================================================= */

const styles =
  StyleSheet.create({
    root: {
      width: "100%",
    },

    list: {
      width: "100%",

      overflow: "hidden",
    },

    scrollContent: {
      flexGrow: 1,
    },

    listContent: {
      position: "relative",

      flexDirection: "row",

      alignItems: "stretch",
    },

    trigger: {
      position: "relative",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    triggerContent: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",
    },

    text: {
      fontWeight: "600",

      includeFontPadding:
        false,
    },

    icon: {
      alignItems:
        "center",

      justifyContent:
        "center",
    },

    badge: {
      minWidth: 18,

      height: 18,

      marginLeft: 6,

      paddingHorizontal: 5,

      borderRadius: 9,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    badgeText: {
      fontSize: 9,

      fontWeight: "700",

      includeFontPadding:
        false,
    },

    indicator: {
      position: "absolute",

      bottom: 0,

      zIndex: 20,
    },
  });