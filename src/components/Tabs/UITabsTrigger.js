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

  __registerMeasurement,

  testID,

  accessibilityLabel,
}) {
  const tabs = useUITabs();

  const isActive = tabs.value === value;

  const isDisabled = disabled || tabs.disabled;

  const scale = useRef(new Animated.Value(1)).current;

  const resolvedPressAnimation = pressAnimation ?? tabs.pressAnimation;

  const handleLayout = (event) => {
    const layout = event.nativeEvent.layout;

    __registerMeasurement?.(value, layout);
  };

  useEffect(() => {
    if (resolvedPressAnimation === "none") {
      scale.setValue(1);
    }
  }, [resolvedPressAnimation, scale]);

  const handlePressIn = () => {
    if (isDisabled || resolvedPressAnimation === "none") {
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

  const handlePressOut = () => {
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

  const resolvedActiveColor = activeColor || tabs.activeColor;

  const resolvedInactiveColor = inactiveColor || tabs.inactiveColor;

  return (
    <Animated.View
      style={[
        styles.wrapper,

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
        onLayout={handleLayout}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="tab"
        accessibilityState={{
          selected: isActive,
          disabled: isDisabled,
        }}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.trigger,

          {
            minHeight: tabs.sizeConfig.minHeight,

            paddingHorizontal: tabs.sizeConfig.horizontalPadding,

            opacity: isDisabled ? 0.45 : 1,
          },

          inactiveStyle,

          isActive ? activeStyle : null,

          style,
        ]}
      >
        <View style={[styles.content, contentStyle]}>
          {iconPosition === "left" && icon ? (
            <View style={[styles.icon, iconStyle]}>{icon}</View>
          ) : null}

          <Text
            numberOfLines={1}
            style={[
              styles.text,

              {
                fontSize: tabs.sizeConfig.fontSize,

                color: isActive ? resolvedActiveColor : resolvedInactiveColor,
              },

              textStyle,

              inactiveTextStyle,

              isActive ? activeTextStyle : null,
            ]}
          >
            {children}
          </Text>

          {iconPosition === "right" && icon ? (
            <View style={[styles.icon, iconStyle]}>{icon}</View>
          ) : null}

          {badge !== undefined ? (
            <View
              style={[
                styles.badge,

                {
                  backgroundColor: isActive
                    ? resolvedActiveColor
                    : tabs.colors.surfaceSecondary || "#EEEEEE",
                },

                badgeStyle,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,

                  {
                    color: isActive
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

        {indicator === false ? null : null}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexShrink: 0,
  },

  trigger: {
    justifyContent: "center",

    alignItems: "center",

    position: "relative",
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
});

UITabsTrigger.displayName = "UITabs.Trigger";
