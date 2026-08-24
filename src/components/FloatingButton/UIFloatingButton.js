import React, { memo, useCallback, useMemo, useRef, useState } from "react";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

export const UIFloatingButtonSizes = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export const UIFloatingButtonVariants = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
  neutral: "neutral",
};

export const UIFloatingButtonShapes = {
  circle: "circle",
  rounded: "rounded",
};

export const UIFloatingButtonPositions = {
  bottomRight: "bottomRight",
  bottomLeft: "bottomLeft",
  topRight: "topRight",
  topLeft: "topLeft",
};

export const UIFloatingButtonMenuTypes = {
  straight: "straight",
  circular: "circular",
};

export const UIFloatingButtonDirections = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getSafeActions(actions) {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions.filter(
    (item) => item !== null && item !== undefined && typeof item === "object",
  );
}

function getSafeColors(context) {
  if (context && context.theme && context.theme.colors) {
    return context.theme.colors;
  }

  return {
    primary: "#FF5A1F",
    secondary: "#7CFF32",
    success: "#16A34A",
    danger: "#DC2626",
    card: "#FFFFFF",
    text: "#111111",
    border: "#E5E5E5",
    onPrimary: "#FFFFFF",
    onSecondary: "#111111",
  };
}

function getVariantStyle(variant, colors) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.secondary || "#7CFF32",

        color: colors.onSecondary || "#111111",
      };

    case "success":
      return {
        backgroundColor: colors.success || "#16A34A",

        color: colors.onPrimary || "#FFFFFF",
      };

    case "danger":
      return {
        backgroundColor: colors.danger || "#DC2626",

        color: colors.onPrimary || "#FFFFFF",
      };

    case "neutral":
      return {
        backgroundColor: colors.card || "#FFFFFF",

        color: colors.text || "#111111",

        borderColor: colors.border || "#E5E5E5",

        borderWidth: 1,
      };

    case "primary":
    default:
      return {
        backgroundColor: colors.primary || "#FF5A1F",

        color: colors.onPrimary || "#FFFFFF",
      };
  }
}

function getMainSize(size) {
  switch (size) {
    case "sm":
      return {
        width: 44,
        height: 44,
        radius: 22,
        fontSize: 13,
      };

    case "lg":
      return {
        width: 64,
        height: 64,
        radius: 32,
        fontSize: 16,
      };

    case "md":
    default:
      return {
        width: 54,
        height: 54,
        radius: 27,
        fontSize: 14,
      };
  }
}

function getActionSize(size) {
  switch (size) {
    case "sm":
      return {
        width: 42,
        height: 42,
      };

    case "lg":
      return {
        width: 58,
        height: 58,
      };

    case "md":
    default:
      return {
        width: 50,
        height: 50,
      };
  }
}

function getPosition(position, offset) {
  switch (position) {
    case "bottomLeft":
      return {
        left: offset,
        bottom: offset,
      };

    case "topLeft":
      return {
        left: offset,
        top: offset,
      };

    case "topRight":
      return {
        right: offset,
        top: offset,
      };

    case "bottomRight":
    default:
      return {
        right: offset,
        bottom: offset,
      };
  }
}

/* -------------------------------------------------------------------------- */
/* STRAIGHT POSITION                                                          */
/* -------------------------------------------------------------------------- */

function getStraightPosition(direction, index, itemSpacing) {
  const distance = (index + 1) * (50 + itemSpacing);

  if (direction === "down") {
    return {
      x: 0,
      y: distance,
    };
  }

  if (direction === "left") {
    return {
      x: -distance,
      y: 0,
    };
  }

  if (direction === "right") {
    return {
      x: distance,
      y: 0,
    };
  }

  return {
    x: 0,
    y: -distance,
  };
}

/* -------------------------------------------------------------------------- */
/* CIRCULAR POSITION                                                         */
/* -------------------------------------------------------------------------- */

function getCircularPosition(direction, index, count, radius) {
  if (count <= 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  if (count === 1) {
    if (direction === "down") {
      return {
        x: 0,
        y: radius,
      };
    }

    if (direction === "left") {
      return {
        x: -radius,
        y: 0,
      };
    }

    if (direction === "right") {
      return {
        x: radius,
        y: 0,
      };
    }

    return {
      x: 0,
      y: -radius,
    };
  }

  const spread = 90;

  const step = spread / (count - 1);

  const start = -spread / 2;

  let angle = start + step * index;

  if (direction === "down") {
    angle += 90;
  } else if (direction === "left") {
    angle += 180;
  } else if (direction === "right") {
    angle += 0;
  } else {
    angle += 270;
  }

  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.cos(radians) * radius,

    y: Math.sin(radians) * radius,
  };
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingIndicator({ color }) {
  return (
    <View
      style={[
        styles.loading,

        {
          borderTopColor: color,

          borderRightColor: color,

          borderBottomColor: "transparent",

          borderLeftColor: "transparent",
        },
      ]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* ACTION ITEM                                                                */
/* -------------------------------------------------------------------------- */

const FloatingActionItem = memo(function FloatingActionItem({
  action,
  index,
  count,

  menuType,
  direction,

  radius,
  itemSpacing,

  size,

  colors,

  onPress,

  duration,

  stagger,

  actionTextStyle,
  actionIconStyle,
}) {
  const animation = useRef(new Animated.Value(0)).current;

  const [pressed, setPressed] = useState(false);

  const position = useMemo(() => {
    if (menuType === UIFloatingButtonMenuTypes.circular) {
      return getCircularPosition(direction, index, count, radius);
    }

    return getStraightPosition(direction, index, itemSpacing);
  }, [menuType, direction, index, count, radius, itemSpacing]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animation, {
        toValue: 1,

        duration,

        easing: Easing.out(Easing.cubic),

        useNativeDriver: true,
      }).start();
    }, index * stagger);

    return () => {
      clearTimeout(timer);
    };
  }, [animation, duration, index, stagger]);

  const actionSize = getActionSize(size);

  const backgroundColor = action.backgroundColor || colors.card || "#FFFFFF";

  const iconColor = action.iconColor || colors.text || "#111111";

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, position.x],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, position.y],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handlePress = () => {
    if (action.disabled || action.loading) {
      return;
    }

    if (typeof action.onPress === "function") {
      action.onPress();
    }

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.actionItem,

        {
          opacity,

          transform: [
            {
              translateX,
            },
            {
              translateY,
            },
            {
              scale,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.actionRow,

          direction === "left" ? styles.reverseRow : null,
        ]}
      >
        {action.label ? (
          <View
            style={[
              styles.actionLabel,

              {
                backgroundColor: colors.card || "#FFFFFF",
              },
            ]}
          >
            <Text
              style={[
                styles.actionLabelText,

                {
                  color: colors.text || "#111111",
                },

                actionTextStyle,
              ]}
            >
              {action.label}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={Boolean(action.disabled) || Boolean(action.loading)}
          onPress={handlePress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[
            styles.actionButton,

            {
              width: actionSize.width,

              height: actionSize.height,

              borderRadius: actionSize.width / 2,

              backgroundColor,

              opacity: action.disabled ? 0.5 : 1,

              transform: [
                {
                  scale: pressed ? 0.92 : 1,
                },
              ],
            },

            action.style,
          ]}
        >
          {action.loading ? (
            <LoadingIndicator color={iconColor} />
          ) : (
            <View
              style={[styles.actionIcon, actionIconStyle, action.iconStyle]}
            >
              {action.icon || null}
            </View>
          )}

          {action.badge !== undefined && action.badge !== null ? (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>{String(action.badge)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const UIFloatingButtonComponent = function UIFloatingButton(
  {
    title,
    label,

    icon,

    onPress,
    onLongPress,

    variant = "primary",
    size = "md",
    shape = "circle",

    position = "bottomRight",
    offset = 20,

    disabled = false,
    loading = false,

    expandable = false,

    actions = [],

    menuType = "straight",
    direction = "up",

    radius = 100,
    itemSpacing = 12,

    animationDuration = 220,
    staggerDelay = 40,

    closeOnAction = true,

    elevation = 6,
    shadow = true,

    iconOnly = false,

    textStyle,
    iconStyle,
    containerStyle,

    actionTextStyle,
    actionIconStyle,

    overlay = false,
    overlayColor,

    badge,

    testID,

    accessibilityLabel,

    ...rest
  },
  ref,
) {
  const context = useUITheme();

  const colors = getSafeColors(context);

  const safeActions = useMemo(() => getSafeActions(actions), [actions]);

  const actionCount = safeActions.length;

  const [open, setOpen] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const dimensions = getMainSize(size);

  const variantStyle = getVariantStyle(variant, colors);

  const animateButton = useCallback(
    (value) => {
      if (disabled || loading) {
        return;
      }

      Animated.spring(scale, {
        toValue: value,

        friction: 7,

        tension: 140,

        useNativeDriver: true,
      }).start();
    },
    [disabled, loading, scale],
  );

  const openMenu = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    if (actionCount === 0) {
      if (typeof onPress === "function") {
        onPress();
      }

      return;
    }

    setOpen(true);

    animateButton(0.94);
  }, [disabled, loading, actionCount, onPress, animateButton]);

  const closeMenu = useCallback(() => {
    setOpen(false);

    animateButton(1);
  }, [animateButton]);

  const handlePress = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    if (expandable && actionCount > 0) {
      if (open) {
        closeMenu();
      } else {
        openMenu();
      }

      return;
    }

    if (typeof onPress === "function") {
      onPress();
    }
  }, [
    disabled,
    loading,
    expandable,
    actionCount,
    open,
    closeMenu,
    openMenu,
    onPress,
  ]);

  const handleActionPress = useCallback(() => {
    if (closeOnAction) {
      closeMenu();
    }
  }, [closeOnAction, closeMenu]);

  let mainIcon = icon || null;

  if (loading) {
    mainIcon = <LoadingIndicator color={variantStyle.color} />;
  }

  if (expandable && actionCount > 0 && open && !loading) {
    mainIcon = (
      <Text
        style={[
          styles.closeIcon,

          {
            color: variantStyle.color,
          },
        ]}
      >
        ×
      </Text>
    );
  }

  const resolvedTitle = title ?? label;

  const showTitle = !iconOnly && Boolean(resolvedTitle);

  return (
    <>
      {overlay && open && actionCount > 0 ? (
        <Pressable
          style={[
            styles.overlay,

            {
              backgroundColor:
                overlayColor || colors.backdrop || "rgba(0,0,0,0.35)",
            },
          ]}
          onPress={closeMenu}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.positionWrapper, getPosition(position, offset)]}
      >
        {expandable && open && actionCount > 0 ? (
          <View pointerEvents="box-none" style={styles.actionContainer}>
            {safeActions.map((action, index) => (
              <FloatingActionItem
                key={action.id || `action-${index}`}
                action={action}
                index={index}
                count={actionCount}
                menuType={menuType}
                direction={direction}
                radius={radius}
                itemSpacing={itemSpacing}
                size={size}
                colors={colors}
                duration={animationDuration}
                stagger={staggerDelay}
                onPress={handleActionPress}
                actionTextStyle={actionTextStyle}
                actionIconStyle={actionIconStyle}
              />
            ))}
          </View>
        ) : null}

        <Animated.View
          style={[
            styles.animatedMain,

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
            {...rest}
            ref={ref}
            testID={testID}
            disabled={disabled || loading}
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={() => animateButton(0.92)}
            onPressOut={() => animateButton(open ? 0.94 : 1)}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel || resolvedTitle || "Floating button"
            }
            style={[
              styles.mainButton,

              {
                width: showTitle ? undefined : dimensions.width,

                minWidth: showTitle ? dimensions.width : dimensions.width,

                height: dimensions.height,

                paddingHorizontal: showTitle ? 16 : 0,

                borderRadius: shape === "circle" ? dimensions.radius : 14,

                backgroundColor: variantStyle.backgroundColor,

                borderColor: variantStyle.borderColor || "transparent",

                borderWidth: variantStyle.borderWidth || 0,

                elevation,

                opacity: disabled ? 0.5 : 1,
              },

              shadow ? styles.shadow : null,

              containerStyle,
            ]}
          >
            {mainIcon ? (
              <View
                style={[
                  styles.mainIcon,

                  {
                    marginRight: showTitle ? 8 : 0,
                  },

                  iconStyle,
                ]}
              >
                {mainIcon}
              </View>
            ) : null}

            {showTitle ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.mainText,

                  {
                    color: variantStyle.color,

                    fontSize: dimensions.fontSize,
                  },

                  textStyle,
                ]}
              >
                {resolvedTitle}
              </Text>
            ) : null}

            {badge !== undefined && badge !== null ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{String(badge)}</Text>
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* EXPORT                                                                     */
/* -------------------------------------------------------------------------- */

export const UIFloatingButton = memo(
  React.forwardRef(UIFloatingButtonComponent),
);

UIFloatingButton.displayName = "UIFloatingButton";

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 998,
  },

  positionWrapper: {
    position: "absolute",

    zIndex: 1000,

    alignItems: "center",

    justifyContent: "center",
  },

  animatedMain: {
    zIndex: 1002,
  },

  mainButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
  },

  shadow: {
    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.22,

    shadowRadius: 7,
  },

  mainIcon: {
    alignItems: "center",

    justifyContent: "center",
  },

  mainText: {
    fontWeight: "700",

    includeFontPadding: false,
  },

  closeIcon: {
    fontSize: 34,

    lineHeight: 36,

    fontWeight: "300",

    includeFontPadding: false,
  },

  loading: {
    width: 20,

    height: 20,

    borderWidth: 2,

    borderRadius: 10,
  },

  badge: {
    position: "absolute",

    top: -4,

    right: -4,

    minWidth: 19,

    height: 19,

    paddingHorizontal: 4,

    borderRadius: 10,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#DC2626",

    borderWidth: 2,

    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",

    fontSize: 9,

    fontWeight: "700",

    includeFontPadding: false,
  },

  actionContainer: {
    position: "absolute",

    width: 1,

    height: 1,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 1001,
  },

  actionItem: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",
  },

  actionRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  reverseRow: {
    flexDirection: "row-reverse",
  },

  actionLabel: {
    marginRight: 8,

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 8,

    elevation: 3,
  },

  actionLabelText: {
    fontSize: 13,

    fontWeight: "600",

    includeFontPadding: false,
  },

  actionButton: {
    alignItems: "center",

    justifyContent: "center",

    elevation: 4,
  },

  actionIcon: {
    alignItems: "center",

    justifyContent: "center",
  },

  actionBadge: {
    position: "absolute",

    top: -5,

    right: -5,

    minWidth: 19,

    height: 19,

    paddingHorizontal: 4,

    borderRadius: 10,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#DC2626",

    borderWidth: 2,

    borderColor: "#FFFFFF",
  },

  actionBadgeText: {
    color: "#FFFFFF",

    fontSize: 9,

    fontWeight: "700",
  },
});

export default UIFloatingButton;
