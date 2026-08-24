import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

/* ==========================================================================
   CONSTANTS
========================================================================== */

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

/* ==========================================================================
   FALLBACK COLORS
========================================================================== */

const FALLBACK_COLORS = {
  transparent: "transparent",

  primary: "#FF5A1F",
  primaryPressed: "#E94D17",

  secondary: "#7CFF32",

  success: "#16A34A",
  danger: "#DC2626",

  background: "#FFFFFF",
  surface: "#F8F8F8",
  card: "#FFFFFF",

  text: "#111111",
  textSecondary: "#525252",

  border: "#E5E5E5",

  onPrimary: "#FFFFFF",
  onSecondary: "#111111",

  backdrop: "rgba(0,0,0,0.45)",
};

/* ==========================================================================
   SAFE HELPERS
========================================================================== */

function getColors(context) {
  if (context && context.theme && context.theme.colors) {
    return {
      ...FALLBACK_COLORS,
      ...context.theme.colors,
    };
  }

  return FALLBACK_COLORS;
}

function getSafeActions(actions) {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions.filter(
    (action) =>
      action !== null && action !== undefined && typeof action === "object",
  );
}

/* ==========================================================================
   VARIANT
========================================================================== */

function getVariantColors(variant, colors) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.secondary || "#7CFF32",

        color: colors.onSecondary || "#111111",

        borderColor: colors.secondary || "#7CFF32",

        borderWidth: 0,
      };

    case "success":
      return {
        backgroundColor: colors.success || "#16A34A",

        color: colors.onPrimary || "#FFFFFF",

        borderColor: colors.success || "#16A34A",

        borderWidth: 0,
      };

    case "danger":
      return {
        backgroundColor: colors.danger || "#DC2626",

        color: colors.onPrimary || "#FFFFFF",

        borderColor: colors.danger || "#DC2626",

        borderWidth: 0,
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

        borderColor: colors.primary || "#FF5A1F",

        borderWidth: 0,
      };
  }
}

/* ==========================================================================
   SIZE
========================================================================== */

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

function getActionSize(size, action) {
  const defaultSize = size === "sm" ? 42 : size === "lg" ? 58 : 50;

  const width = action.width ?? defaultSize;

  const height = action.height ?? defaultSize;

  return {
    width,
    height,
    radius: action.borderRadius ?? Math.min(width, height) / 2,
  };
}

/* ==========================================================================
   POSITION
========================================================================== */

function getPositionStyle(position, offset) {
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

/* ==========================================================================
   STRAIGHT POSITION
========================================================================== */

function getStraightPosition(direction, index, itemSpacing) {
  const distance = (index + 1) * (50 + itemSpacing);

  switch (direction) {
    case "down":
      return {
        x: 0,
        y: distance,
      };

    case "left":
      return {
        x: -distance,
        y: 0,
      };

    case "right":
      return {
        x: distance,
        y: 0,
      };

    case "up":
    default:
      return {
        x: 0,
        y: -distance,
      };
  }
}

/* ==========================================================================
   CIRCULAR POSITION
========================================================================== */

function getCircularPosition(direction, index, count, radius, spread) {
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

  const safeSpread = Math.max(10, Math.min(180, spread || 90));

  const step = safeSpread / (count - 1);

  const start = -safeSpread / 2;

  let angle = start + step * index;

  switch (direction) {
    case "down":
      angle += 90;
      break;

    case "left":
      angle += 180;
      break;

    case "right":
      angle += 0;
      break;

    case "up":
    default:
      angle += 270;
      break;
  }

  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.cos(radians) * radius,

    y: Math.sin(radians) * radius,
  };
}

/* ==========================================================================
   LOADING
========================================================================== */

function LoadingIndicator({ color, size = 20 }) {
  return (
    <View
      style={[
        styles.loading,

        {
          width: size,
          height: size,
          borderRadius: size / 2,

          borderTopColor: color,

          borderRightColor: color,

          borderBottomColor: "transparent",

          borderLeftColor: "transparent",
        },
      ]}
    />
  );
}

/* ==========================================================================
   ACTION ITEM
========================================================================== */

const FloatingActionItem = memo(function FloatingActionItem({
  action,

  index,
  count,

  menuType,
  direction,

  radius,
  circularSpread,

  itemSpacing,

  size,

  colors,

  duration,
  staggerDelay,

  onPress,

  actionTextStyle,
  actionIconStyle,
}) {
  const animation = useRef(new Animated.Value(0)).current;

  const pressed = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animation, {
        toValue: 1,

        duration,

        easing: Easing.out(Easing.cubic),

        useNativeDriver: true,
      }).start();
    }, index * staggerDelay);

    return () => {
      clearTimeout(timer);

      animation.stopAnimation();
    };
  }, [animation, duration, index, staggerDelay]);

  const position = useMemo(() => {
    if (menuType === UIFloatingButtonMenuTypes.circular) {
      return getCircularPosition(
        direction,
        index,
        count,
        radius,
        circularSpread,
      );
    }

    return getStraightPosition(direction, index, itemSpacing);
  }, [menuType, direction, index, count, radius, circularSpread, itemSpacing]);

  const actionSize = getActionSize(size, action);

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

  const actionScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const pressScale = pressed.current;

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.9,

      friction: 7,

      tension: 140,

      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,

      friction: 7,

      tension: 140,

      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (action.disabled || action.loading) {
      return;
    }

    if (typeof action.onPress === "function") {
      action.onPress();
    }

    onPress();
  };

  const actionStyle = {
    width: actionSize.width,

    height: actionSize.height,

    borderRadius: actionSize.radius,

    backgroundColor,

    borderColor: action.borderColor || "transparent",

    borderWidth: action.borderWidth || 0,

    padding: action.padding,

    paddingTop: action.paddingTop,

    paddingRight: action.paddingRight,

    paddingBottom: action.paddingBottom,

    paddingLeft: action.paddingLeft,

    paddingHorizontal: action.paddingHorizontal,

    paddingVertical: action.paddingVertical,

    margin: action.margin,

    marginTop: action.marginTop,

    marginRight: action.marginRight,

    marginBottom: action.marginBottom,

    marginLeft: action.marginLeft,

    elevation: action.elevation ?? 4,

    opacity: action.disabled ? 0.5 : 1,
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
              scale: actionScale,
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
                backgroundColor:
                  action.labelBackgroundColor || colors.card || "#FFFFFF",
              },

              action.labelStyle,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.actionLabelText,

                {
                  color: action.labelColor || colors.text || "#111111",
                },

                actionTextStyle,
              ]}
            >
              {action.label}
            </Text>
          </View>
        ) : null}

        <Animated.View
          style={{
            transform: [
              {
                scale: pressScale,
              },
            ],
          }}
        >
          <Pressable
            disabled={Boolean(action.disabled) || Boolean(action.loading)}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={
              action.accessibilityLabel || action.label || "Floating action"
            }
            style={[styles.actionButton, actionStyle, action.style]}
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
              <View style={[styles.actionBadge, action.badgeStyle]}>
                <Text style={[styles.actionBadgeText, action.badgeTextStyle]}>
                  {String(action.badge)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

/* ==========================================================================
   MAIN COMPONENT
========================================================================== */

const UIFloatingButtonComponent = forwardRef(function UIFloatingButton(
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
    circularSpread = 90,

    itemSpacing = 12,

    animationDuration = 220,
    staggerDelay = 40,

    closeOnAction = true,

    elevation = 6,
    shadow = true,

    iconOnly = false,

    containerStyle,
    textStyle,
    iconStyle,

    /*
     * WHOLE ACTION GROUP
     */
    actionGroupStyle,

    /*
     * Shared action styles
     */
    actionTextStyle,
    actionIconStyle,

    overlay = false,
    overlayColor,

    badge,
    badgeStyle,
    badgeTextStyle,

    accessibilityLabel,
    testID,

    ...rest
  },
  ref,
) {
  const context = useUITheme();

  const colors = getColors(context);

  const safeActions = useMemo(() => getSafeActions(actions), [actions]);

  const actionCount = safeActions.length;

  const [open, setOpen] = useState(false);

  const mainScale = useRef(new Animated.Value(1)).current;

  const actionGroupAnimation = useRef(new Animated.Value(0)).current;

  const mainSize = getMainSize(size);

  const variantColors = getVariantColors(variant, colors);

  /* -------------------------------------------------------------------- */
  /* MAIN PRESS ANIMATION                                                 */
  /* -------------------------------------------------------------------- */

  const animateMain = useCallback(
    (toValue) => {
      Animated.spring(mainScale, {
        toValue,

        friction: 7,

        tension: 140,

        useNativeDriver: true,
      }).start();
    },
    [mainScale],
  );

  /* -------------------------------------------------------------------- */
  /* OPEN                                                                  */
  /* -------------------------------------------------------------------- */

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

    Animated.timing(actionGroupAnimation, {
      toValue: 1,

      duration: animationDuration,

      easing: Easing.out(Easing.cubic),

      useNativeDriver: true,
    }).start();

    animateMain(0.94);
  }, [
    disabled,
    loading,
    actionCount,
    onPress,
    actionGroupAnimation,
    animationDuration,
    animateMain,
  ]);

  /* -------------------------------------------------------------------- */
  /* CLOSE                                                                 */
  /* -------------------------------------------------------------------- */

  const closeMenu = useCallback(() => {
    Animated.timing(actionGroupAnimation, {
      toValue: 0,

      duration: animationDuration,

      easing: Easing.in(Easing.cubic),

      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });

    animateMain(1);
  }, [actionGroupAnimation, animationDuration, animateMain]);

  /* -------------------------------------------------------------------- */
  /* PRESS                                                                 */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* ACTION PRESS                                                          */
  /* -------------------------------------------------------------------- */

  const handleActionPress = useCallback(() => {
    if (closeOnAction) {
      closeMenu();
    }
  }, [closeOnAction, closeMenu]);

  /* -------------------------------------------------------------------- */
  /* MAIN ICON                                                             */
  /* -------------------------------------------------------------------- */

  let mainIcon = icon || null;

  if (loading) {
    mainIcon = <LoadingIndicator color={variantColors.color} />;
  } else if (expandable && actionCount > 0 && open) {
    mainIcon = (
      <Text
        style={[
          styles.closeIcon,

          {
            color: variantColors.color,
          },
        ]}
      >
        ×
      </Text>
    );
  }

  /* -------------------------------------------------------------------- */
  /* TITLE                                                                 */
  /* -------------------------------------------------------------------- */

  const resolvedTitle = title ?? label;

  const showTitle = !iconOnly && Boolean(resolvedTitle);

  /* -------------------------------------------------------------------- */
  /* ACTION GROUP                                                          */
  /* -------------------------------------------------------------------- */

  const groupOpacity = actionGroupAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const groupScale = actionGroupAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  /* -------------------------------------------------------------------- */
  /* RENDER                                                                */
  /* -------------------------------------------------------------------- */

  return (
    <>
      {overlay && open && actionCount > 0 ? (
        <Pressable
          style={[
            styles.overlay,

            {
              backgroundColor:
                overlayColor || colors.backdrop || FALLBACK_COLORS.backdrop,
            },
          ]}
          onPress={closeMenu}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.positionWrapper, getPositionStyle(position, offset)]}
      >
        {expandable && open && actionCount > 0 ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.actionGroup,

              {
                opacity: groupOpacity,

                transform: [
                  {
                    scale: groupScale,
                  },
                ],
              },

              /*
               * USER CUSTOM GROUP STYLE
               */
              actionGroupStyle,
            ]}
          >
            {safeActions.map((action, index) => (
              <FloatingActionItem
                key={action.id || `floating-action-${index}`}
                action={action}
                index={index}
                count={actionCount}
                menuType={menuType}
                direction={direction}
                radius={radius}
                circularSpread={circularSpread}
                itemSpacing={itemSpacing}
                size={size}
                colors={colors}
                duration={animationDuration}
                staggerDelay={staggerDelay}
                onPress={handleActionPress}
                actionTextStyle={actionTextStyle}
                actionIconStyle={actionIconStyle}
              />
            ))}
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.mainAnimated,

            {
              transform: [
                {
                  scale: mainScale,
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
            onPressIn={() => {
              if (!disabled && !loading) {
                animateMain(0.92);
              }
            }}
            onPressOut={() => {
              if (!disabled && !loading) {
                animateMain(open ? 0.94 : 1);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel || resolvedTitle || "Floating button"
            }
            accessibilityState={{
              disabled: disabled || loading,

              busy: loading,

              expanded: expandable && actionCount > 0 ? open : undefined,
            }}
            style={[
              styles.mainButton,

              {
                width: showTitle ? undefined : mainSize.width,

                minWidth: mainSize.width,

                height: mainSize.height,

                paddingHorizontal: showTitle ? 16 : 0,

                borderRadius: shape === "circle" ? mainSize.radius : 14,

                backgroundColor: variantColors.backgroundColor,

                borderColor: variantColors.borderColor,

                borderWidth: variantColors.borderWidth,

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
                    color: variantColors.color,

                    fontSize: mainSize.fontSize,
                  },

                  textStyle,
                ]}
              >
                {resolvedTitle}
              </Text>
            ) : null}

            {badge !== undefined && badge !== null ? (
              <View style={[styles.badge, badgeStyle]}>
                <Text style={[styles.badgeText, badgeTextStyle]}>
                  {String(badge)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
});

/* ==========================================================================
   EXPORT
========================================================================== */

export const UIFloatingButton = memo(UIFloatingButtonComponent);

UIFloatingButton.displayName = "UIFloatingButton";

export default UIFloatingButton;

/* ==========================================================================
   STYLES
========================================================================== */

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

  mainAnimated: {
    zIndex: 1002,
  },

  mainButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
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
    borderWidth: 2,
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

  /*
   * WHOLE ACTION GROUP
   *
   * This is the wrapper around all floating
   * action items.
   */
  actionGroup: {
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

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,

    shadowRadius: 5,
  },

  actionLabelText: {
    fontSize: 13,

    fontWeight: "600",

    includeFontPadding: false,
  },

  actionButton: {
    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
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

    includeFontPadding: false,
  },
});
