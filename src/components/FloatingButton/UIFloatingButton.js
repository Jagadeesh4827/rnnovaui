import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  primarySoft: "#FFF0EA",

  secondary: "#7CFF32",
  secondarySoft: "#F0FFE7",

  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",

  background: "#FFFFFF",
  surface: "#F8F8F8",
  card: "#FFFFFF",

  text: "#111111",
  textSecondary: "#525252",
  textMuted: "#737373",

  border: "#E5E5E5",
  borderStrong: "#D4D4D4",

  onPrimary: "#FFFFFF",
  onSecondary: "#111111",

  backdrop: "rgba(0,0,0,0.45)",
};

/* ==========================================================================
   SAFE COLORS
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

/* ==========================================================================
   SAFE ACTIONS
========================================================================== */

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
    case UIFloatingButtonVariants.secondary:
      return {
        backgroundColor: colors.secondary || "#7CFF32",

        color: colors.onSecondary || "#111111",

        borderColor: colors.secondary || "#7CFF32",

        borderWidth: 0,
      };

    case UIFloatingButtonVariants.success:
      return {
        backgroundColor: colors.success || "#16A34A",

        color: colors.onPrimary || "#FFFFFF",

        borderColor: colors.success || "#16A34A",

        borderWidth: 0,
      };

    case UIFloatingButtonVariants.danger:
      return {
        backgroundColor: colors.danger || "#DC2626",

        color: colors.onPrimary || "#FFFFFF",

        borderColor: colors.danger || "#DC2626",

        borderWidth: 0,
      };

    case UIFloatingButtonVariants.neutral:
      return {
        backgroundColor: colors.card || "#FFFFFF",

        color: colors.text || "#111111",

        borderColor: colors.border || "#E5E5E5",

        borderWidth: 1,
      };

    case UIFloatingButtonVariants.primary:
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
   MAIN BUTTON SIZE
========================================================================== */

function getMainSize(size) {
  switch (size) {
    case UIFloatingButtonSizes.sm:
      return {
        width: 44,
        height: 44,
        radius: 22,
        fontSize: 13,
      };

    case UIFloatingButtonSizes.lg:
      return {
        width: 64,
        height: 64,
        radius: 32,
        fontSize: 16,
      };

    case UIFloatingButtonSizes.md:
    default:
      return {
        width: 54,
        height: 54,
        radius: 27,
        fontSize: 14,
      };
  }
}

/* ==========================================================================
   ACTION SIZE
========================================================================== */

function getActionSize(size, action) {
  const defaultSize =
    size === UIFloatingButtonSizes.sm
      ? 42
      : size === UIFloatingButtonSizes.lg
        ? 58
        : 50;

  const width = action.width !== undefined ? action.width : defaultSize;

  const height = action.height !== undefined ? action.height : defaultSize;

  const borderRadius =
    action.borderRadius !== undefined
      ? action.borderRadius
      : Math.min(width, height) / 2;

  return {
    width,
    height,
    borderRadius,
  };
}

/* ==========================================================================
   MAIN FAB POSITION
========================================================================== */

function getPositionStyle(position, offset) {
  switch (position) {
    case UIFloatingButtonPositions.bottomLeft:
      return {
        left: offset,
        bottom: offset,
      };

    case UIFloatingButtonPositions.topLeft:
      return {
        left: offset,
        top: offset,
      };

    case UIFloatingButtonPositions.topRight:
      return {
        right: offset,
        top: offset,
      };

    case UIFloatingButtonPositions.bottomRight:
    default:
      return {
        right: offset,
        bottom: offset,
      };
  }
}

/* ==========================================================================
   STRAIGHT MENU POSITION
========================================================================== */

function getStraightPosition(direction, index, itemSpacing, distance) {
  const itemDistance = distance + itemSpacing;

  const position = (index + 1) * itemDistance;

  switch (direction) {
    case UIFloatingButtonDirections.down:
      return {
        x: 0,
        y: position,
      };

    case UIFloatingButtonDirections.left:
      return {
        x: -position,
        y: 0,
      };

    case UIFloatingButtonDirections.right:
      return {
        x: position,
        y: 0,
      };

    case UIFloatingButtonDirections.up:
    default:
      return {
        x: 0,
        y: -position,
      };
  }
}

/* ==========================================================================
   CIRCULAR ARC POSITION

   React Native coordinate system:

   0°   = right
   90°  = down
   180° = left
   270° = up

   Example:

   arcStartAngle={180}
   arcEndAngle={270}

   gives:

        270°
         ↑
         |
   180° ←●
========================================================================== */

function getCircularArcPosition(
  index,
  count,
  radius,
  arcStartAngle,
  arcEndAngle,
) {
  if (count <= 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  if (count === 1) {
    const radians = (arcStartAngle * Math.PI) / 180;

    return {
      x: Math.cos(radians) * radius,

      y: Math.sin(radians) * radius,
    };
  }

  const angleStep = (arcEndAngle - arcStartAngle) / (count - 1);

  const angle = arcStartAngle + angleStep * index;

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
   FLOATING ACTION ITEM
========================================================================== */

const FloatingActionItem = memo(function FloatingActionItem({
  action,

  index,
  count,

  menuType,
  direction,

  radius,

  arcStartAngle,
  arcEndAngle,

  itemSpacing,
  straightDistance,

  size,

  colors,

  duration,
  staggerDelay,

  onActionPress,

  actionTextStyle,
  actionIconStyle,
}) {
  /* ---------------------------------------------------------------------- */
  /* ENTER ANIMATION                                                        */
  /* ---------------------------------------------------------------------- */

  const animation = useRef(new Animated.Value(0)).current;

  /* ---------------------------------------------------------------------- */
  /* PRESS ANIMATION                                                        */
  /* ---------------------------------------------------------------------- */

  const pressScale = useRef(new Animated.Value(1)).current;

  /* ---------------------------------------------------------------------- */
  /* ENTER EFFECT                                                            */
  /* ---------------------------------------------------------------------- */

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

      pressScale.stopAnimation();
    };
  }, [animation, pressScale, duration, index, staggerDelay]);

  /* ---------------------------------------------------------------------- */
  /* POSITION                                                                */
  /* ---------------------------------------------------------------------- */

  const position = useMemo(() => {
    if (menuType === UIFloatingButtonMenuTypes.circular) {
      return getCircularArcPosition(
        index,
        count,
        radius,
        arcStartAngle,
        arcEndAngle,
      );
    }

    return getStraightPosition(direction, index, itemSpacing, straightDistance);
  }, [
    menuType,
    direction,
    index,
    count,
    radius,
    arcStartAngle,
    arcEndAngle,
    itemSpacing,
    straightDistance,
  ]);

  /* ---------------------------------------------------------------------- */
  /* SIZE                                                                    */
  /* ---------------------------------------------------------------------- */

  const actionSize = getActionSize(size, action);

  /* ---------------------------------------------------------------------- */
  /* COLORS                                                                  */
  /* ---------------------------------------------------------------------- */

  const backgroundColor = action.backgroundColor || colors.card || "#FFFFFF";

  const iconColor = action.iconColor || colors.text || "#111111";

  /* ---------------------------------------------------------------------- */
  /* ENTER ANIMATION VALUES                                                  */
  /* ---------------------------------------------------------------------- */

  const translateX = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, position.x],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, position.y],
  });

  const itemScale = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0.6, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, 1],
  });

  /* ---------------------------------------------------------------------- */
  /* PRESS IN                                                               */
  /* ---------------------------------------------------------------------- */

  const handlePressIn = useCallback(() => {
    if (action.disabled || action.loading) {
      return;
    }

    Animated.spring(pressScale, {
      toValue: 0.9,

      friction: 7,

      tension: 140,

      useNativeDriver: true,
    }).start();
  }, [action.disabled, action.loading, pressScale]);

  /* ---------------------------------------------------------------------- */
  /* PRESS OUT                                                              */
  /* ---------------------------------------------------------------------- */

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,

      friction: 7,

      tension: 140,

      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  /* ---------------------------------------------------------------------- */
  /* PRESS                                                                   */
  /* ---------------------------------------------------------------------- */

  const handlePress = useCallback(() => {
    if (action.disabled || action.loading) {
      return;
    }

    if (typeof action.onPress === "function") {
      action.onPress();
    }

    if (typeof onActionPress === "function") {
      onActionPress(action);
    }
  }, [action, onActionPress]);

  /* ---------------------------------------------------------------------- */
  /* ACTION STYLE                                                            */
  /* ---------------------------------------------------------------------- */

  const actionBaseStyle = {
    width: actionSize.width,

    height: actionSize.height,

    borderRadius: actionSize.borderRadius,

    backgroundColor,

    borderColor: action.borderColor || "transparent",

    borderWidth: action.borderWidth || 0,

    minWidth: action.minWidth,

    minHeight: action.minHeight,

    maxWidth: action.maxWidth,

    maxHeight: action.maxHeight,

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

    elevation: action.elevation !== undefined ? action.elevation : 4,

    opacity: action.disabled ? 0.5 : 1,
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

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
              scale: itemScale,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.actionRow,

          direction === UIFloatingButtonDirections.left
            ? styles.reverseRow
            : null,
        ]}
      >
        {/* -------------------------------------------------------------- */}
        {/* LABEL                                                            */}
        {/* -------------------------------------------------------------- */}

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

        {/* -------------------------------------------------------------- */}
        {/* BUTTON                                                           */}
        {/* -------------------------------------------------------------- */}

        <Animated.View
          style={[
            styles.actionPressWrapper,

            {
              transform: [
                {
                  scale: pressScale,
                },
              ],
            },
          ]}
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
            style={[styles.actionButton, actionBaseStyle, action.style]}
          >
            {/* -------------------------------------------------------- */}
            {/* ICON                                                       */}
            {/* -------------------------------------------------------- */}

            {action.loading ? (
              <LoadingIndicator color={iconColor} />
            ) : (
              <View
                style={[styles.actionIcon, actionIconStyle, action.iconStyle]}
              >
                {action.icon || null}
              </View>
            )}

            {/* -------------------------------------------------------- */}
            {/* BADGE                                                       */}
            {/* -------------------------------------------------------- */}

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

FloatingActionItem.displayName = "FloatingActionItem";

/* ==========================================================================
   MAIN COMPONENT
========================================================================== */

const UIFloatingButtonComponent = forwardRef(function UIFloatingButton(
  {
    /* -------------------------------------------------------------- */
    /* CONTENT                                                         */
    /* -------------------------------------------------------------- */

    title,
    label,
    icon,

    /* -------------------------------------------------------------- */
    /* EVENTS                                                         */
    /* -------------------------------------------------------------- */

    onPress,
    onLongPress,

    /* -------------------------------------------------------------- */
    /* APPEARANCE                                                     */
    /* -------------------------------------------------------------- */

    variant = "primary",
    size = "md",
    shape = "circle",

    /* -------------------------------------------------------------- */
    /* POSITION                                                        */
    /* -------------------------------------------------------------- */

    position = "bottomRight",
    offset = 20,

    /* -------------------------------------------------------------- */
    /* STATE                                                          */
    /* -------------------------------------------------------------- */

    disabled = false,
    loading = false,

    /* -------------------------------------------------------------- */
    /* EXPANDABLE                                                     */
    /* -------------------------------------------------------------- */

    expandable = false,

    actions = [],

    menuType = "straight",
    direction = "up",

    /* -------------------------------------------------------------- */
    /* STRAIGHT MENU                                                  */
    /* -------------------------------------------------------------- */

    itemSpacing = 12,
    straightDistance = 50,

    /* -------------------------------------------------------------- */
    /* CIRCULAR ARC                                                  */
    /* -------------------------------------------------------------- */

    radius = 105,

    /*
     * React Native angles:
     *
     * 0   = right
     * 90  = down
     * 180 = left
     * 270 = up
     */

    arcStartAngle = 180,
    arcEndAngle = 270,

    /* -------------------------------------------------------------- */
    /* ANIMATION                                                      */
    /* -------------------------------------------------------------- */

    animationDuration = 220,
    staggerDelay = 50,

    /* -------------------------------------------------------------- */
    /* ACTION BEHAVIOR                                                */
    /* -------------------------------------------------------------- */

    closeOnAction = true,

    /* -------------------------------------------------------------- */
    /* MAIN STYLE                                                     */
    /* -------------------------------------------------------------- */

    containerStyle,
    textStyle,
    iconStyle,

    /* -------------------------------------------------------------- */
    /* ACTION GROUP STYLE                                             */
    /* -------------------------------------------------------------- */

    actionGroupStyle,

    /* -------------------------------------------------------------- */
    /* SHARED ACTION STYLES                                           */
    /* -------------------------------------------------------------- */

    actionTextStyle,
    actionIconStyle,

    /* -------------------------------------------------------------- */
    /* SHADOW                                                         */
    /* -------------------------------------------------------------- */

    shadow = true,
    elevation = 6,

    /* -------------------------------------------------------------- */
    /* ICON ONLY                                                      */
    /* -------------------------------------------------------------- */

    iconOnly = false,

    /* -------------------------------------------------------------- */
    /* OVERLAY                                                        */
    /* -------------------------------------------------------------- */

    overlay = false,
    overlayColor,

    /* -------------------------------------------------------------- */
    /* BADGE                                                          */
    /* -------------------------------------------------------------- */

    badge,
    badgeStyle,
    badgeTextStyle,

    /* -------------------------------------------------------------- */
    /* ACCESSIBILITY                                                 */
    /* -------------------------------------------------------------- */

    accessibilityLabel,
    testID,

    ...rest
  },
  ref,
) {
  /* ---------------------------------------------------------------- */
  /* THEME                                                             */
  /* ---------------------------------------------------------------- */

  const themeContext = useUITheme();

  const colors = getColors(themeContext);

  /* ---------------------------------------------------------------- */
  /* SAFE ACTIONS                                                      */
  /* ---------------------------------------------------------------- */

  const safeActions = useMemo(() => getSafeActions(actions), [actions]);

  const actionCount = safeActions.length;

  /* ---------------------------------------------------------------- */
  /* OPEN STATE                                                        */
  /* ---------------------------------------------------------------- */

  const [open, setOpen] = React.useState(false);

  /* ---------------------------------------------------------------- */
  /* MAIN SCALE                                                        */
  /* ---------------------------------------------------------------- */

  const mainScale = useRef(new Animated.Value(1)).current;

  /* ---------------------------------------------------------------- */
  /* ACTION GROUP SCALE                                                */
  /* ---------------------------------------------------------------- */

  const groupAnimation = useRef(new Animated.Value(0)).current;

  /* ---------------------------------------------------------------- */
  /* MAIN SIZE                                                         */
  /* ---------------------------------------------------------------- */

  const mainSize = getMainSize(size);

  /* ---------------------------------------------------------------- */
  /* VARIANT                                                           */
  /* ---------------------------------------------------------------- */

  const variantColors = getVariantColors(variant, colors);

  /* ---------------------------------------------------------------- */
  /* MAIN BUTTON ANIMATION                                             */
  /* ---------------------------------------------------------------- */

  const animateMain = useCallback(
    (value) => {
      Animated.spring(mainScale, {
        toValue: value,

        friction: 7,

        tension: 140,

        useNativeDriver: true,
      }).start();
    },
    [mainScale],
  );

  /* ---------------------------------------------------------------- */
  /* OPEN MENU                                                         */
  /* ---------------------------------------------------------------- */

  const openMenu = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    /*
     * Expandable without actions:
     * behave like normal FAB.
     */
    if (actionCount === 0) {
      if (typeof onPress === "function") {
        onPress();
      }

      return;
    }

    setOpen(true);

    groupAnimation.setValue(0);

    Animated.timing(groupAnimation, {
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
    groupAnimation,
    animationDuration,
    animateMain,
  ]);

  /* ---------------------------------------------------------------- */
  /* CLOSE MENU                                                        */
  /* ---------------------------------------------------------------- */

  const closeMenu = useCallback(() => {
    Animated.timing(groupAnimation, {
      toValue: 0,

      duration: animationDuration,

      easing: Easing.in(Easing.cubic),

      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });

    animateMain(1);
  }, [groupAnimation, animationDuration, animateMain]);

  /* ---------------------------------------------------------------- */
  /* MAIN PRESS                                                        */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /* ACTION PRESS                                                      */
  /* ---------------------------------------------------------------- */

  const handleActionPress = useCallback(
    (action) => {
      if (closeOnAction) {
        closeMenu();
      }
    },
    [closeOnAction, closeMenu],
  );

  /* ---------------------------------------------------------------- */
  /* MAIN ICON                                                         */
  /* ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- */
  /* TITLE                                                             */
  /* ---------------------------------------------------------------- */

  const resolvedTitle = title ?? label;

  const showTitle = !iconOnly && Boolean(resolvedTitle);

  /* ---------------------------------------------------------------- */
  /* GROUP ANIMATION                                                   */
  /* ---------------------------------------------------------------- */

  const groupOpacity = groupAnimation.interpolate({
    inputRange: [0, 1],

    outputRange: [0, 1],
  });

  const groupScale = groupAnimation.interpolate({
    inputRange: [0, 1],

    outputRange: [0.85, 1],
  });

  /* ---------------------------------------------------------------- */
  /* MAIN BUTTON STYLE                                                 */
  /* ---------------------------------------------------------------- */

  const mainButtonStyle = {
    width: showTitle ? undefined : mainSize.width,

    minWidth: mainSize.width,

    height: mainSize.height,

    paddingHorizontal: showTitle ? 16 : 0,

    borderRadius:
      shape === UIFloatingButtonShapes.circle ? mainSize.radius : 14,

    backgroundColor: variantColors.backgroundColor,

    borderColor: variantColors.borderColor,

    borderWidth: variantColors.borderWidth,

    elevation,

    opacity: disabled ? 0.5 : 1,
  };

  /* ---------------------------------------------------------------- */
  /* RENDER                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ============================================================ */}
      {/* OVERLAY                                                       */}
      {/* ============================================================ */}

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

      {/* ============================================================ */}
      {/* FAB POSITION                                                  */}
      {/* ============================================================ */}

      <View
        pointerEvents="box-none"
        style={[styles.positionWrapper, getPositionStyle(position, offset)]}
      >
        {/* ========================================================== */}
        {/* ACTION GROUP                                                */}
        {/* ========================================================== */}

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
               * Whole action group
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
                arcStartAngle={arcStartAngle}
                arcEndAngle={arcEndAngle}
                itemSpacing={itemSpacing}
                straightDistance={straightDistance}
                size={size}
                colors={colors}
                duration={animationDuration}
                staggerDelay={staggerDelay}
                onActionPress={handleActionPress}
                actionTextStyle={actionTextStyle}
                actionIconStyle={actionIconStyle}
              />
            ))}
          </Animated.View>
        ) : null}

        {/* ========================================================== */}
        {/* MAIN FAB                                                     */}
        {/* ========================================================== */}

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

              mainButtonStyle,

              shadow ? styles.shadow : null,

              containerStyle,
            ]}
          >
            {/* ------------------------------------------------------ */}
            {/* MAIN ICON                                                 */}
            {/* ------------------------------------------------------ */}

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

            {/* ------------------------------------------------------ */}
            {/* TITLE                                                     */}
            {/* ------------------------------------------------------ */}

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

            {/* ------------------------------------------------------ */}
            {/* MAIN BADGE                                                 */}
            {/* ------------------------------------------------------ */}

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
  /* -------------------------------------------------------------------- */
  /* OVERLAY                                                              */
  /* -------------------------------------------------------------------- */

  overlay: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 998,
  },

  /* -------------------------------------------------------------------- */
  /* POSITION                                                             */
  /* -------------------------------------------------------------------- */

  positionWrapper: {
    position: "absolute",

    zIndex: 1000,

    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
  },

  /* -------------------------------------------------------------------- */
  /* MAIN                                                                  */
  /* -------------------------------------------------------------------- */

  mainAnimated: {
    zIndex: 1002,

    overflow: "visible",
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

  /* -------------------------------------------------------------------- */
  /* LOADING                                                              */
  /* -------------------------------------------------------------------- */

  loading: {
    borderWidth: 2,
  },

  /* -------------------------------------------------------------------- */
  /* MAIN SHADOW                                                          */
  /* -------------------------------------------------------------------- */

  shadow: {
    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.22,

    shadowRadius: 7,
  },

  /* -------------------------------------------------------------------- */
  /* MAIN BADGE                                                           */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* WHOLE ACTION GROUP                                                   */
  /* -------------------------------------------------------------------- */

  actionGroup: {
    position: "absolute",

    width: 1,
    height: 1,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 1001,

    overflow: "visible",
  },

  /* -------------------------------------------------------------------- */
  /* ACTION ITEM                                                           */
  /* -------------------------------------------------------------------- */

  actionItem: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
  },

  /* -------------------------------------------------------------------- */
  /* ACTION ROW                                                            */
  /* -------------------------------------------------------------------- */

  actionRow: {
    flexDirection: "row",

    alignItems: "center",

    overflow: "visible",
  },

  reverseRow: {
    flexDirection: "row-reverse",
  },

  /* -------------------------------------------------------------------- */
  /* ACTION PRESS WRAPPER                                                  */
  /* -------------------------------------------------------------------- */

  actionPressWrapper: {
    overflow: "visible",
  },

  /* -------------------------------------------------------------------- */
  /* ACTION LABEL                                                          */
  /* -------------------------------------------------------------------- */

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

    overflow: "visible",
  },

  actionLabelText: {
    fontSize: 13,

    fontWeight: "600",

    includeFontPadding: false,
  },

  /* -------------------------------------------------------------------- */
  /* ACTION BUTTON                                                         */
  /* -------------------------------------------------------------------- */

  actionButton: {
    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
  },

  actionIcon: {
    alignItems: "center",

    justifyContent: "center",
  },

  /* -------------------------------------------------------------------- */
  /* ACTION BADGE                                                          */
  /* -------------------------------------------------------------------- */

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
