import React, { memo, useEffect, useRef } from "react";

import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useUITabs } from "./UITabs";

export const UITabsTrigger = memo(function UITabsTrigger({
  children,

  value,

  icon,
  iconPosition = "left",

  badge,

  disabled = false,

  onPress,

  activeColor,
  inactiveColor,

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

  pressAnimation,
  pressScale = 0.96,

  indicator = true,

  testID,
  accessibilityLabel,
}) {
  const tabs = useUITabs();

  const active = tabs.value === value;

  const isDisabled = disabled || tabs.disabled;

  const scale = useRef(new Animated.Value(1)).current;

  const resolvedPressAnimation = pressAnimation ?? tabs.pressAnimation;

  useEffect(() => {
    if (resolvedPressAnimation === "none") {
      scale.setValue(1);
    }
  }, [resolvedPressAnimation, scale]);

  const animatePressIn = () => {
    if (resolvedPressAnimation === "none") {
      return;
    }

    if (resolvedPressAnimation === "scale") {
      Animated.spring(scale, {
        toValue: pressScale,

        ...tabs.spring,

        useNativeDriver: true,
      }).start();
    }
  };

  const animatePressOut = () => {
    if (resolvedPressAnimation === "none") {
      return;
    }

    Animated.spring(scale, {
      toValue: 1,

      ...tabs.spring,

      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event) => {
    if (isDisabled) {
      return;
    }

    tabs.setValue(value);

    onPress?.(event);
  };

  const activeTextColor = activeColor || tabs.activeColor;

  const inactiveTextColor = inactiveColor || tabs.inactiveColor;

  const iconElement = icon ? (
    <View
      style={[
        styles.icon,

        iconPosition === "right" ? styles.iconRight : styles.iconLeft,

        iconStyle,
      ]}
    >
      {icon}
    </View>
  ) : null;

  return (
    <Animated.View
      style={[
        styles.animatedWrapper,

        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >
      <Pressable
        testID={testID}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        accessibilityRole="tab"
        accessibilityState={{
          selected: active,
          disabled: isDisabled,
        }}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.trigger,

          {
            minHeight: tabs.size === "sm" ? 42 : tabs.size === "lg" ? 58 : 50,

            opacity: isDisabled ? 0.45 : 1,
          },

          inactiveStyle,

          active ? activeStyle : null,

          style,
        ]}
      >
        <View style={[styles.content, contentStyle]}>
          {iconPosition === "left" ? iconElement : null}

          <Text
            numberOfLines={1}
            style={[
              styles.text,

              {
                fontSize:
                  tabs.size === "sm" ? 12 : tabs.size === "lg" ? 16 : 14,

                color: active ? activeTextColor : inactiveTextColor,
              },

              textStyle,

              inactiveTextStyle,

              active ? activeTextStyle : null,
            ]}
          >
            {children}
          </Text>

          {iconPosition === "right" ? iconElement : null}

          {badge !== undefined ? (
            <View
              style={[
                styles.badge,

                {
                  backgroundColor: active
                    ? activeTextColor
                    : tabs.colors.surfaceSecondary || "#EEEEEE",
                },

                badgeStyle,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,

                  {
                    color: active
                      ? tabs.colors.onPrimary || "#FFFFFF"
                      : tabs.colors.textSecondary || "#525252",
                  },

                  badgeTextStyle,
                ]}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        {indicator ? (
          <View style={styles.indicatorContainer}>
            <AnimatedIndicator active={active} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

function AnimatedIndicator({ active }) {
  const tabs = useUITabs();

  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (tabs.indicatorAnimation === "none") {
      progress.setValue(active ? 1 : 0);

      return;
    }

    if (tabs.indicatorAnimation === "spring") {
      Animated.spring(progress, {
        toValue: active ? 1 : 0,

        ...tabs.spring,

        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(progress, {
      toValue: active ? 1 : 0,

      duration: tabs.animationDuration,

      useNativeDriver: true,
    }).start();
  }, [
    active,
    tabs.indicatorAnimation,
    tabs.animationDuration,
    tabs.spring,
    progress,
  ]);

  return (
    <Animated.View
      style={[
        styles.indicator,

        {
          height: tabs.indicatorHeight,

          backgroundColor: tabs.indicatorColor,

          opacity: progress,

          transform: [
            {
              scaleX: progress,
            },
          ],
        },

        tabs.indicatorWidth === "full"
          ? styles.indicatorFull
          : styles.indicatorContent,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  animatedWrapper: {
    flexShrink: 0,
  },

  trigger: {
    position: "relative",

    justifyContent: "center",

    paddingHorizontal: 10,
  },

  content: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,
  },

  text: {
    fontWeight: "600",

    includeFontPadding: false,
  },

  icon: {
    alignItems: "center",

    justifyContent: "center",
  },

  iconLeft: {
    marginRight: 2,
  },

  iconRight: {
    marginLeft: 2,
  },

  badge: {
    minWidth: 18,
    height: 18,

    paddingHorizontal: 5,

    borderRadius: 9,

    alignItems: "center",

    justifyContent: "center",
  },

  badgeText: {
    fontSize: 9,

    fontWeight: "700",

    includeFontPadding: false,
  },

  indicatorContainer: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,
  },

  indicator: {
    position: "absolute",

    bottom: 0,
  },

  indicatorFull: {
    left: 0,
    right: 0,
  },

  indicatorContent: {
    left: 8,
    right: 8,
  },
});

UITabsTrigger.displayName = "UITabs.Trigger";
