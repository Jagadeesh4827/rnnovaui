import React, {
  forwardRef,
  memo,
  useCallback,
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

const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
  neutral: "neutral",
};

const SHAPES = {
  circle: "circle",
  rounded: "rounded",
};

const POSITIONS = {
  bottomRight: "bottomRight",
  bottomLeft: "bottomLeft",
  topRight: "topRight",
  topLeft: "topLeft",
};

const MENU_TYPES = {
  straight: "straight",
  circular: "circular",
};

const DIRECTIONS = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

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
    circularDirection = "up",

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

    actionContainerStyle,
    actionTextStyle,
    actionIconStyle,

    overlay = false,
    overlayColor,

    badge,
    renderBadge,

    accessibilityLabel,
    testID,

    ...rest
  },
  ref,
) {
  /* ---------------------------------------------------------------------- */
  /* THEME                                                                  */
  /* ---------------------------------------------------------------------- */

  const context = useUITheme();

  const theme = context && context.theme ? context.theme : {};

  const colors = theme.colors || {};

  /* ---------------------------------------------------------------------- */
  /* SAFE ACTIONS                                                           */
  /* ---------------------------------------------------------------------- */

  const safeActions = useMemo(() => {
    if (!Array.isArray(actions)) {
      return [];
    }

    return actions.filter((item) => item !== null && typeof item === "object");
  }, [actions]);

  /* ---------------------------------------------------------------------- */
  /* SAFE VALUES                                                            */
  /* ---------------------------------------------------------------------- */

  const safeSize = SIZES[size] ? size : SIZES.md;

  const safeVariant = VARIANTS[variant] ? variant : VARIANTS.primary;

  const safeShape = SHAPES[shape] ? shape : SHAPES.circle;

  const safeMenuType = MENU_TYPES[menuType] ? menuType : MENU_TYPES.straight;

  const safeDirection = DIRECTIONS[direction] ? direction : DIRECTIONS.up;

  const safeCircularDirection = DIRECTIONS[circularDirection]
    ? circularDirection
    : DIRECTIONS.up;

  /* ---------------------------------------------------------------------- */
  /* STATE                                                                  */
  /* ---------------------------------------------------------------------- */

  const [open, setOpen] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* MAIN ANIMATION                                                         */
  /* ---------------------------------------------------------------------- */

  const mainScale = useRef(new Animated.Value(1)).current;

  /* ---------------------------------------------------------------------- */
  /* DIMENSIONS                                                             */
  /* ---------------------------------------------------------------------- */

  const dimensions = useMemo(
    () => getDimensions(safeSize, safeShape),
    [safeSize, safeShape],
  );

  const variantColors = useMemo(
    () => getVariantColors(safeVariant, colors),
    [safeVariant, colors],
  );

  /* ---------------------------------------------------------------------- */
  /* MAIN BUTTON ANIMATION                                                  */
  /* ---------------------------------------------------------------------- */

  const animatePress = useCallback(
    (pressed) => {
      if (disabled || loading) {
        return;
      }

      Animated.spring(mainScale, {
        toValue: pressed ? 0.92 : open ? 0.94 : 1,

        friction: 7,
        tension: 140,

        useNativeDriver: true,
      }).start();
    },
    [disabled, loading, open, mainScale],
  );

  /* ---------------------------------------------------------------------- */
  /* OPEN                                                                   */
  /* ---------------------------------------------------------------------- */

  const openMenu = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    if (safeActions.length === 0) {
      if (typeof onPress === "function") {
        onPress();
      }

      return;
    }

    setOpen(true);

    Animated.spring(mainScale, {
      toValue: 0.94,

      friction: 7,
      tension: 140,

      useNativeDriver: true,
    }).start();
  }, [disabled, loading, safeActions.length, onPress, mainScale]);

  /* ---------------------------------------------------------------------- */
  /* CLOSE                                                                  */
  /* ---------------------------------------------------------------------- */

  const closeMenu = useCallback(() => {
    setOpen(false);

    Animated.spring(mainScale, {
      toValue: 1,

      friction: 7,
      tension: 140,

      useNativeDriver: true,
    }).start();
  }, [mainScale]);

  /* ---------------------------------------------------------------------- */
  /* MAIN PRESS                                                             */
  /* ---------------------------------------------------------------------- */

  const handlePress = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    if (expandable && safeActions.length > 0) {
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
    safeActions.length,
    open,
    closeMenu,
    openMenu,
    onPress,
  ]);

  /* ---------------------------------------------------------------------- */
  /* ACTION PRESS                                                           */
  /* ---------------------------------------------------------------------- */

  const handleActionPress = useCallback(
    (action) => {
      if (!action) {
        return;
      }

      if (action.disabled || action.loading) {
        return;
      }

      if (typeof action.onPress === "function") {
        action.onPress();
      }

      if (closeOnAction) {
        closeMenu();
      }
    },
    [closeOnAction, closeMenu],
  );

  /* ---------------------------------------------------------------------- */
  /* MAIN ICON                                                               */
  /* ---------------------------------------------------------------------- */

  let mainIcon = icon;

  if (loading) {
    mainIcon = <LoadingSpinner color={variantColors.text} />;
  }

  if (expandable && safeActions.length > 0 && open && !loading) {
    mainIcon = (
      <Text
        style={[
          styles.closeIcon,
          {
            color: variantColors.text,
          },
        ]}
      >
        ×
      </Text>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* TITLE                                                                  */
  /* ---------------------------------------------------------------------- */

  const resolvedTitle = title ?? label;

  const showTitle = !iconOnly && Boolean(resolvedTitle);

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {overlay && open && expandable && safeActions.length > 0 ? (
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
        style={[styles.positionWrapper, getPositionStyle(position, offset)]}
      >
        {expandable && open && safeActions.length > 0 ? (
          <FloatingActionList
            actions={safeActions}
            menuType={safeMenuType}
            direction={safeDirection}
            circularDirection={safeCircularDirection}
            radius={radius}
            itemSpacing={itemSpacing}
            size={safeSize}
            colors={colors}
            duration={animationDuration}
            stagger={staggerDelay}
            onPress={handleActionPress}
            actionContainerStyle={actionContainerStyle}
            actionTextStyle={actionTextStyle}
            actionIconStyle={actionIconStyle}
            renderBadge={renderBadge}
          />
        ) : null}

        <Animated.View
          style={{
            transform: [
              {
                scale: mainScale,
              },
            ],
          }}
        >
          <Pressable
            {...rest}
            ref={ref}
            testID={testID}
            disabled={disabled || loading}
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={() => animatePress(true)}
            onPressOut={() => animatePress(false)}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel || resolvedTitle || "Floating button"
            }
            accessibilityState={{
              disabled: disabled || loading,

              busy: loading,

              expanded: expandable && safeActions.length > 0 ? open : undefined,
            }}
            style={[
              styles.button,

              {
                minWidth: dimensions.minWidth,

                minHeight: dimensions.height,

                paddingHorizontal: showTitle ? dimensions.paddingHorizontal : 0,

                borderRadius: dimensions.borderRadius,

                backgroundColor: variantColors.background,

                borderColor: variantColors.border,

                borderWidth: variantColors.borderWidth,

                elevation,

                opacity: disabled ? 0.5 : 1,
              },

              shadow ? styles.shadow : null,

              safeShape === SHAPES.circle ? styles.circle : null,

              containerStyle,
            ]}
          >
            {mainIcon ? (
              <View
                style={[
                  styles.icon,

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
                  styles.text,

                  {
                    color: variantColors.text,

                    fontSize: dimensions.fontSize,
                  },

                  textStyle,
                ]}
              >
                {resolvedTitle}
              </Text>
            ) : null}

            {badge !== undefined && badge !== null ? (
              renderBadge ? (
                renderBadge(badge)
              ) : (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{String(badge)}</Text>
                </View>
              )
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
});

/* ========================================================================== */
/* FLOATING ACTION LIST                                                       */
/* ========================================================================== */

const FloatingActionList = memo(function FloatingActionList({
  actions,
  menuType,
  direction,
  circularDirection,
  radius,
  itemSpacing,
  size,
  colors,
  duration,
  stagger,
  onPress,
  actionContainerStyle,
  actionTextStyle,
  actionIconStyle,
  renderBadge,
}) {
  const safeActions = Array.isArray(actions) ? actions : [];

  return (
    <View pointerEvents="box-none" style={styles.actionList}>
      {safeActions.map((action, index) => (
        <FloatingActionItem
          key={action.id || `action-${index}`}
          action={action}
          index={index}
          count={safeActions.length}
          menuType={menuType}
          direction={direction}
          circularDirection={circularDirection}
          radius={radius}
          itemSpacing={itemSpacing}
          size={size}
          colors={colors}
          duration={duration}
          stagger={stagger}
          onPress={onPress}
          actionContainerStyle={actionContainerStyle}
          actionTextStyle={actionTextStyle}
          actionIconStyle={actionIconStyle}
          renderBadge={renderBadge}
        />
      ))}
    </View>
  );
});

/* ========================================================================== */
/* INDIVIDUAL ACTION                                                          */
/* ========================================================================== */

const FloatingActionItem = memo(function FloatingActionItem({
  action,
  index,
  count,

  menuType,
  direction,
  circularDirection,

  radius,
  itemSpacing,

  size,
  colors,

  duration,
  stagger,

  onPress,

  actionContainerStyle,
  actionTextStyle,
  actionIconStyle,

  renderBadge,
}) {
  /*
   * IMPORTANT:
   * Each action owns its own Animated.Value.
   * No shared animation array.
   */

  const progress = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,

        duration,

        easing: Easing.out(Easing.cubic),

        useNativeDriver: true,
      }).start();
    }, index * stagger);

    return () => {
      clearTimeout(timer);

      progress.stopAnimation();
    };
  }, [duration, index, stagger, progress]);

  const transform = useMemo(
    () =>
      createTransform(
        menuType,
        direction,
        circularDirection,
        index,
        count,
        radius,
        itemSpacing,
        progress,
      ),
    [
      menuType,
      direction,
      circularDirection,
      index,
      count,
      radius,
      itemSpacing,
      progress,
    ],
  );

  const actionSize = getActionSize(size);

  const actionColors = getActionColors(action, colors);

  const actionLabel = action.label ?? action.title;

  return (
    <Animated.View
      style={[
        styles.actionItem,

        {
          opacity: progress,

          transform,
        },
      ]}
    >
      <View
        style={[
          styles.actionRow,

          direction === "left" ? styles.reverseRow : null,
        ]}
      >
        {actionLabel ? (
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

                  fontSize: actionSize.fontSize,
                },

                actionTextStyle,
              ]}
            >
              {actionLabel}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={Boolean(action.disabled) || Boolean(action.loading)}
          onPress={() => onPress(action)}
          accessibilityRole="button"
          accessibilityLabel={
            action.accessibilityLabel || actionLabel || "Floating action"
          }
          style={[
            styles.actionButton,

            {
              width: actionSize.size,

              height: actionSize.size,

              borderRadius: actionSize.size / 2,

              backgroundColor: actionColors.background,

              borderColor: actionColors.border,

              borderWidth: actionColors.borderWidth,

              elevation: action.elevation ?? 4,

              opacity: action.disabled ? 0.5 : 1,
            },

            actionContainerStyle,

            action.style,
          ]}
        >
          {action.loading ? (
            <LoadingSpinner color={actionColors.text} />
          ) : (
            <View
              style={[styles.actionIcon, actionIconStyle, action.iconStyle]}
            >
              {action.icon || null}
            </View>
          )}

          {action.badge !== undefined && action.badge !== null ? (
            renderBadge ? (
              renderBadge(action.badge, action)
            ) : (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>
                  {String(action.badge)}
                </Text>
              </View>
            )
          ) : null}
        </Pressable>
      </View>
    </Animated.View>
  );
});

/* ========================================================================== */
/* TRANSFORM                                                                  */
/* ========================================================================== */

function createTransform(
  menuType,
  direction,
  circularDirection,
  index,
  count,
  radius,
  itemSpacing,
  progress,
) {
  if (menuType === MENU_TYPES.circular) {
    return createCircularTransform(
      circularDirection,
      index,
      count,
      radius,
      progress,
    );
  }

  return createStraightTransform(direction, index, itemSpacing, progress);
}

function createStraightTransform(direction, index, spacing, progress) {
  const distance = (index + 1) * (54 + spacing);

  if (direction === "down") {
    return {
      translateY: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, distance],
      }),
    };
  }

  if (direction === "left") {
    return {
      translateX: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -distance],
      }),
    };
  }

  if (direction === "right") {
    return {
      translateX: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, distance],
      }),
    };
  }

  return {
    translateY: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -distance],
    }),
  };
}

function createCircularTransform(direction, index, count, radius, progress) {
  const angle = getCircularAngle(direction, index, count);

  const radians = (angle * Math.PI) / 180;

  const x = Math.cos(radians) * radius;

  const y = Math.sin(radians) * radius;

  return {
    translateX: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, x],
    }),

    translateY: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, y],
    }),
  };
}

function getCircularAngle(direction, index, count) {
  if (count <= 1) {
    if (direction === "down") {
      return 90;
    }

    if (direction === "left") {
      return 180;
    }

    if (direction === "right") {
      return 0;
    }

    return 270;
  }

  const spread = Math.min(90, 35 * (count - 1));

  const step = spread / (count - 1);

  const start = -spread / 2;

  if (direction === "down") {
    return 90 + start + step * index;
  }

  if (direction === "left") {
    return 180 + start + step * index;
  }

  if (direction === "right") {
    return start + step * index;
  }

  return 270 + start + step * index;
}

/* ========================================================================== */
/* DIMENSIONS                                                                 */
/* ========================================================================== */

function getDimensions(size, shape) {
  const circle = shape === SHAPES.circle;

  if (size === "sm") {
    return {
      width: 44,
      height: 44,
      minWidth: 44,
      paddingHorizontal: 14,
      borderRadius: circle ? 22 : 12,
      fontSize: 13,
    };
  }

  if (size === "lg") {
    return {
      width: 64,
      height: 64,
      minWidth: 64,
      paddingHorizontal: 20,
      borderRadius: circle ? 32 : 16,
      fontSize: 16,
    };
  }

  return {
    width: 54,
    height: 54,
    minWidth: 54,
    paddingHorizontal: 17,
    borderRadius: circle ? 27 : 14,
    fontSize: 14,
  };
}

function getActionSize(size) {
  if (size === "sm") {
    return {
      size: 42,
      fontSize: 12,
    };
  }

  if (size === "lg") {
    return {
      size: 58,
      fontSize: 15,
    };
  }

  return {
    size: 50,
    fontSize: 13,
  };
}

/* ========================================================================== */
/* COLORS                                                                     */
/* ========================================================================== */

function getVariantColors(variant, colors) {
  if (variant === "secondary") {
    return {
      background: colors.secondary || "#7CFF32",

      text: colors.onSecondary || "#111111",

      border: colors.secondary || "#7CFF32",

      borderWidth: 0,
    };
  }

  if (variant === "success") {
    return {
      background: colors.success || "#16A34A",

      text: colors.onPrimary || "#FFFFFF",

      border: colors.success || "#16A34A",

      borderWidth: 0,
    };
  }

  if (variant === "danger") {
    return {
      background: colors.danger || "#DC2626",

      text: colors.onPrimary || "#FFFFFF",

      border: colors.danger || "#DC2626",

      borderWidth: 0,
    };
  }

  if (variant === "neutral") {
    return {
      background: colors.card || colors.surface || "#FFFFFF",

      text: colors.text || "#111111",

      border: colors.border || "#E5E5E5",

      borderWidth: 1,
    };
  }

  return {
    background: colors.primary || "#FF5A1F",

    text: colors.onPrimary || "#FFFFFF",

    border: colors.primary || "#FF5A1F",

    borderWidth: 0,
  };
}

function getActionColors(action, colors) {
  if (action && action.variant) {
    return getVariantColors(action.variant, colors);
  }

  return {
    background: action?.backgroundColor || colors.card || "#FFFFFF",

    text: action?.iconColor || colors.text || "#111111",

    border: action?.borderColor || colors.border || "#E5E5E5",

    borderWidth: action?.borderWidth ?? 1,
  };
}

/* ========================================================================== */
/* POSITION                                                                   */
/* ========================================================================== */

function getPositionStyle(position, offset) {
  if (position === POSITIONS.bottomLeft) {
    return {
      left: offset,
      bottom: offset,
    };
  }

  if (position === POSITIONS.topRight) {
    return {
      right: offset,
      top: offset,
    };
  }

  if (position === POSITIONS.topLeft) {
    return {
      left: offset,
      top: offset,
    };
  }

  return {
    right: offset,
    bottom: offset,
  };
}

/* ========================================================================== */
/* LOADING                                                                    */
/* ========================================================================== */

function LoadingSpinner({ color }) {
  return (
    <View
      style={[
        styles.spinner,

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

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },

  positionWrapper: {
    position: "absolute",
    zIndex: 1000,

    alignItems: "center",
    justifyContent: "center",
  },

  button: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    overflow: "visible",
  },

  circle: {
    aspectRatio: 1,
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

  icon: {
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontWeight: "700",
    includeFontPadding: false,
  },

  closeIcon: {
    fontSize: 34,
    lineHeight: 36,

    fontWeight: "300",

    includeFontPadding: false,
  },

  spinner: {
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

  actionList: {
    position: "absolute",

    width: 1,
    height: 1,

    alignItems: "center",
    justifyContent: "center",
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

/* ========================================================================== */
/* EXPORT                                                                     */
/* ========================================================================== */

export const UIFloatingButton = memo(UIFloatingButtonComponent);

UIFloatingButton.displayName = "UIFloatingButton";

export {
  SIZES as UIFloatingButtonSizes,
  VARIANTS as UIFloatingButtonVariants,
  SHAPES as UIFloatingButtonShapes,
  POSITIONS as UIFloatingButtonPositions,
  MENU_TYPES as UIFloatingButtonMenuTypes,
  DIRECTIONS as UIFloatingButtonDirections,
};

export default UIFloatingButton;
