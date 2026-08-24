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
  contentStyle,
  textStyle,
  iconStyle,
  badgeStyle,

  testID,

  accessibilityLabel,
}) {
  const tabs = useUITabs();

  const active = tabs.value === value;

  const isDisabled = disabled || tabs.disabled;

  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (!tabs.animated) {
      progress.setValue(active ? 1 : 0);

      return;
    }

    Animated.timing(progress, {
      toValue: active ? 1 : 0,

      duration: tabs.animationDuration,

      useNativeDriver: true,
    }).start();
  }, [active, tabs.animated, tabs.animationDuration, progress]);

  const handlePress = (event) => {
    if (isDisabled) {
      return;
    }

    tabs.setValue(value);

    onPress?.(event);
  };

  const resolvedActiveColor = activeColor || tabs.activeColor;

  const resolvedInactiveColor = inactiveColor || tabs.inactiveColor;

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

  const textElement = (
    <Text
      numberOfLines={1}
      style={[
        styles.text,

        {
          fontSize: tabs.size === "sm" ? 12 : tabs.size === "lg" ? 16 : 14,

          color: active ? resolvedActiveColor : resolvedInactiveColor,

          opacity: isDisabled ? 0.45 : 1,
        },

        textStyle,
      ]}
    >
      {children}
    </Text>
  );

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{
        selected: active,
        disabled: isDisabled,
      }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.trigger,

        {
          minHeight: tabs.size === "sm" ? 42 : tabs.size === "lg" ? 56 : 48,

          opacity: pressed ? 0.7 : 1,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.content,

          iconPosition === "right" ? styles.contentRight : null,

          contentStyle,
        ]}
      >
        {iconPosition === "left" ? iconElement : null}

        {textElement}

        {iconPosition === "right" ? iconElement : null}

        {badge !== undefined ? (
          <View
            style={[
              styles.badge,

              {
                backgroundColor: active
                  ? resolvedActiveColor
                  : tabs.colors.surfaceSecondary || "#F1F1F1",
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
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <Animated.View
        style={[
          styles.indicator,

          {
            backgroundColor: tabs.indicatorColor,

            height: tabs.indicatorHeight,

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
    </Pressable>
  );
});

const styles = StyleSheet.create({
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

  contentRight: {
    flexDirection: "row",
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

  text: {
    fontWeight: "600",

    includeFontPadding: false,
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

  indicator: {
    position: "absolute",

    bottom: 0,

    left: 0,

    right: 0,
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
