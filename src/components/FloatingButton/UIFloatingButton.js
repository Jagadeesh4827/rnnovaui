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

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const FLOATING_BUTTON_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const FLOATING_BUTTON_VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
  neutral: "neutral",
};

const FLOATING_BUTTON_SHAPES = {
  circle: "circle",
  rounded: "rounded",
};

const FLOATING_BUTTON_POSITIONS = {
  bottomRight: "bottomRight",
  bottomLeft: "bottomLeft",
  topRight: "topRight",
  topLeft: "topLeft",
};

const FLOATING_BUTTON_MENU_TYPES = {
  straight: "straight",
  circular: "circular",
};

const FLOATING_BUTTON_DIRECTIONS = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

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

    /*
     * Speed dial
     */
    actions = null,

    expandable = false,

    menuType = "straight",

    direction = "up",

    circularDirection = "up",

    radius = 100,

    itemSpacing = 12,

    animationDuration = 220,

    staggerDelay = 45,

    closeOnAction = true,

    /*
     * Appearance
     */
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

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  /* ---------------------------------------------------------------------- */
  /* NORMALIZE ACTIONS                                                      */
  /* ---------------------------------------------------------------------- */

  const safeActions = useMemo(() => {
    if (!Array.isArray(actions)) {
      return [];
    }

    return actions.filter(
      (action) =>
        action !== null && action !== undefined && typeof action === "object",
    );
  }, [actions]);

  const actionCount = safeActions.length;

  /* ---------------------------------------------------------------------- */
  /* SAFE VALUES                                                            */
  /* ---------------------------------------------------------------------- */

  const safeSize = FLOATING_BUTTON_SIZES[size]
    ? size
    : FLOATING_BUTTON_SIZES.md;

  const safeVariant = FLOATING_BUTTON_VARIANTS[variant]
    ? variant
    : FLOATING_BUTTON_VARIANTS.primary;

  const safeShape = FLOATING_BUTTON_SHAPES[shape]
    ? shape
    : FLOATING_BUTTON_SHAPES.circle;

  const safeMenuType = FLOATING_BUTTON_MENU_TYPES[menuType]
    ? menuType
    : FLOATING_BUTTON_MENU_TYPES.straight;

  const safeDirection = FLOATING_BUTTON_DIRECTIONS[direction]
    ? direction
    : FLOATING_BUTTON_DIRECTIONS.up;

  const safeCircularDirection = FLOATING_BUTTON_DIRECTIONS[circularDirection]
    ? circularDirection
    : FLOATING_BUTTON_DIRECTIONS.up;

  /* ---------------------------------------------------------------------- */
  /* ANIMATION REFS                                                         */
  /* ---------------------------------------------------------------------- */

  const scale = useRef(new Animated.Value(1)).current;

  const menuProgress = useRef(new Animated.Value(0)).current;

  const actionProgress = useRef([]);

  const [open, setOpen] = useState(false);

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
  /* KEEP ANIMATION ARRAY SAFE                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const count = safeActions.length;

    while (actionProgress.current.length < count) {
      actionProgress.current.push(new Animated.Value(0));
    }

    if (actionProgress.current.length > count) {
      actionProgress.current = actionProgress.current.slice(0, count);
    }
  }, [safeActions.length]);

  /* ---------------------------------------------------------------------- */
  /* CLOSE MENU IF ACTIONS DISAPPEAR                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (actionCount === 0 && open) {
      menuProgress.setValue(0);
      scale.setValue(1);

      setOpen(false);
    }
  }, [actionCount, open, menuProgress, scale]);

  /* ---------------------------------------------------------------------- */
  /* MAIN BUTTON PRESS ANIMATION                                            */
  /* ---------------------------------------------------------------------- */

  const animateMainButton = useCallback(
    (pressed) => {
      if (disabled || loading) {
        return;
      }

      Animated.spring(scale, {
        toValue: pressed ? 0.92 : open ? 0.94 : 1,

        friction: 6,

        tension: 150,

        useNativeDriver: true,
      }).start();
    },
    [disabled, loading, open, scale],
  );

  /* ---------------------------------------------------------------------- */
  /* OPEN MENU                                                              */
  /* ---------------------------------------------------------------------- */

  const openMenu = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    /*
     * No actions = behave as
     * normal FAB.
     */
    if (safeActions.length === 0) {
      onPress?.();
      return;
    }

    setOpen(true);

    Animated.parallel([
      Animated.spring(menuProgress, {
        toValue: 1,

        friction: 7,

        tension: 90,

        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 0.94,

        friction: 6,

        tension: 150,

        useNativeDriver: true,
      }),
    ]).start();

    const animations = actionProgress.current.map((progress, index) =>
      Animated.timing(progress, {
        toValue: 1,

        duration: animationDuration,

        delay: index * staggerDelay,

        easing: Easing.out(Easing.cubic),

        useNativeDriver: true,
      }),
    );

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [
    disabled,
    loading,
    safeActions.length,
    onPress,
    menuProgress,
    scale,
    animationDuration,
    staggerDelay,
  ]);

  /* ---------------------------------------------------------------------- */
  /* CLOSE MENU                                                             */
  /* ---------------------------------------------------------------------- */

  const closeMenu = useCallback(() => {
    const progressList = actionProgress.current;

    const animations = progressList.map((progress, index) =>
      Animated.timing(progress, {
        toValue: 0,

        duration: animationDuration,

        delay: Math.max(0, progressList.length - index - 1) * staggerDelay,

        easing: Easing.in(Easing.cubic),

        useNativeDriver: true,
      }),
    );

    const finish = () => {
      setOpen(false);
    };

    if (animations.length === 0) {
      menuProgress.setValue(0);
      scale.setValue(1);

      finish();

      return;
    }

    Animated.parallel([
      Animated.parallel(animations),

      Animated.spring(menuProgress, {
        toValue: 0,

        friction: 7,

        tension: 90,

        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,

        friction: 6,

        tension: 150,

        useNativeDriver: true,
      }),
    ]).start(finish);
  }, [animationDuration, staggerDelay, menuProgress, scale]);

  /* ---------------------------------------------------------------------- */
  /* MAIN PRESS                                                             */
  /* ---------------------------------------------------------------------- */

  const handleMainPress = useCallback(() => {
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

    onPress?.();
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
      if (!action || typeof action !== "object") {
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
  /* TITLE                                                                  */
  /* ---------------------------------------------------------------------- */

  const resolvedTitle = title ?? label;

  const showTitle = !iconOnly && Boolean(resolvedTitle);

  /* ---------------------------------------------------------------------- */
  /* MAIN ICON                                                              */
  /* ---------------------------------------------------------------------- */

  let mainIcon = icon;

  if (loading) {
    mainIcon = <LoadingSpinner color={variantColors.text} />;
  } else if (expandable && safeActions.length > 0 && open) {
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
        {expandable && safeActions.length > 0 ? (
          <SpeedDialActions
            actions={safeActions}
            progressRefs={actionProgress.current}
            menuType={safeMenuType}
            direction={safeDirection}
            circularDirection={safeCircularDirection}
            radius={radius}
            itemSpacing={itemSpacing}
            size={safeSize}
            theme={theme}
            onActionPress={handleActionPress}
            actionContainerStyle={actionContainerStyle}
            actionTextStyle={actionTextStyle}
            actionIconStyle={actionIconStyle}
            renderBadge={renderBadge}
          />
        ) : null}

        <Animated.View
          style={[
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
            {...props}
            ref={ref}
            testID={testID}
            disabled={disabled || loading}
            onPress={handleMainPress}
            onLongPress={onLongPress}
            onPressIn={() => animateMainButton(true)}
            onPressOut={() => animateMainButton(false)}
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

              safeShape === FLOATING_BUTTON_SHAPES.circle
                ? styles.circle
                : null,

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

/* -------------------------------------------------------------------------- */
/* SPEED DIAL ACTIONS                                                         */
/* -------------------------------------------------------------------------- */

const SpeedDialActions = memo(function SpeedDialActions({
  actions,
  progressRefs,

  menuType,
  direction,
  circularDirection,

  radius,
  itemSpacing,

  size,

  theme,

  onActionPress,

  actionContainerStyle,
  actionTextStyle,
  actionIconStyle,

  renderBadge,
}) {
  const colors = theme?.colors || {};

  /*
   * Extra defensive protection.
   */
  const safeActions = Array.isArray(actions) ? actions : [];

  const safeProgressRefs = Array.isArray(progressRefs) ? progressRefs : [];

  return (
    <View pointerEvents="box-none" style={styles.actionsContainer}>
      {safeActions.map((action, index) => {
        if (!action || typeof action !== "object") {
          return null;
        }

        const progress = safeProgressRefs[index];

        if (!progress) {
          return null;
        }

        const sizeData = getActionSize(size);

        const transform = getActionTransform(
          menuType,
          direction,
          circularDirection,
          index,
          safeActions.length,
          radius,
          itemSpacing,
          progress,
        );

        const actionColors = getActionColors(action, colors);

        const actionLabel = action.label ?? action.title;

        return (
          <Animated.View
            key={action.id ?? `fab-action-${index}`}
            pointerEvents="auto"
            style={[
              styles.actionWrapper,

              {
                transform,
                opacity: progress,
              },
            ]}
          >
            <View
              style={[
                styles.actionRow,

                direction === "left" ? styles.actionRowReverse : null,
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

                        fontSize: sizeData.fontSize,
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
                onPress={() => onActionPress(action)}
                accessibilityRole="button"
                accessibilityLabel={
                  action.accessibilityLabel || actionLabel || "Action"
                }
                style={[
                  styles.actionButton,

                  {
                    width: sizeData.size,

                    height: sizeData.size,

                    borderRadius: sizeData.size / 2,

                    backgroundColor: actionColors.background,

                    borderColor: actionColors.border,

                    borderWidth: actionColors.borderWidth,

                    elevation: action.elevation ?? 4,

                    opacity: action.disabled ? 0.5 : 1,
                  },

                  action.style,
                ]}
              >
                {action.loading ? (
                  <LoadingSpinner color={actionColors.text} />
                ) : action.icon ? (
                  <View
                    style={[
                      styles.actionIcon,

                      actionIconStyle,

                      action.iconStyle,
                    ]}
                  >
                    {action.icon}
                  </View>
                ) : null}

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
      })}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* TRANSFORMS                                                                */
/* -------------------------------------------------------------------------- */

function getActionTransform(
  menuType,
  direction,
  circularDirection,
  index,
  count,
  radius,
  itemSpacing,
  progress,
) {
  if (menuType === FLOATING_BUTTON_MENU_TYPES.circular) {
    return getCircularTransform(
      circularDirection,
      index,
      count,
      radius,
      progress,
    );
  }

  return getStraightTransform(direction, index, itemSpacing, progress);
}

function getStraightTransform(direction, index, spacing, progress) {
  const distance = (index + 1) * (54 + spacing);

  switch (direction) {
    case "down":
      return {
        translateY: Animated.multiply(progress, distance),
      };

    case "left":
      return {
        translateX: Animated.multiply(progress, -distance),
      };

    case "right":
      return {
        translateX: Animated.multiply(progress, distance),
      };

    case "up":
    default:
      return {
        translateY: Animated.multiply(progress, -distance),
      };
  }
}

function getCircularTransform(direction, index, count, radius, progress) {
  if (count <= 0) {
    return {
      translateX: 0,
      translateY: 0,
    };
  }

  const angle = getCircularAngle(direction, index, count);

  const radians = (angle * Math.PI) / 180;

  const x = Math.cos(radians) * radius;

  const y = Math.sin(radians) * radius;

  return {
    translateX: Animated.multiply(progress, x),

    translateY: Animated.multiply(progress, y),
  };
}

function getCircularAngle(direction, index, count) {
  if (count <= 1) {
    switch (direction) {
      case "down":
        return 90;

      case "left":
        return 180;

      case "right":
        return 0;

      case "up":
      default:
        return 270;
    }
  }

  const spread = Math.min(90, 35 * (count - 1));

  const step = spread / (count - 1);

  const start = -spread / 2;

  const offset = start + step * index;

  switch (direction) {
    case "down":
      return 90 + offset;

    case "left":
      return 180 + offset;

    case "right":
      return 0 + offset;

    case "up":
    default:
      return 270 + offset;
  }
}

/* -------------------------------------------------------------------------- */
/* DIMENSIONS                                                                 */
/* -------------------------------------------------------------------------- */

function getDimensions(size, shape) {
  const isCircle = shape === FLOATING_BUTTON_SHAPES.circle;

  switch (size) {
    case "sm":
      return {
        height: 44,
        minWidth: isCircle ? 44 : 44,
        paddingHorizontal: 14,
        borderRadius: isCircle ? 22 : 12,
        fontSize: 13,
      };

    case "lg":
      return {
        height: 64,
        minWidth: isCircle ? 64 : 64,
        paddingHorizontal: 20,
        borderRadius: isCircle ? 32 : 16,
        fontSize: 16,
      };

    case "md":
    default:
      return {
        height: 54,
        minWidth: isCircle ? 54 : 54,
        paddingHorizontal: 17,
        borderRadius: isCircle ? 27 : 14,
        fontSize: 14,
      };
  }
}

function getActionSize(size) {
  switch (size) {
    case "sm":
      return {
        size: 42,
        fontSize: 12,
      };

    case "lg":
      return {
        size: 58,
        fontSize: 15,
      };

    case "md":
    default:
      return {
        size: 50,
        fontSize: 13,
      };
  }
}

/* -------------------------------------------------------------------------- */
/* COLORS                                                                     */
/* -------------------------------------------------------------------------- */

function getVariantColors(variant, colors) {
  switch (variant) {
    case "secondary":
      return {
        background: colors.secondary || "#7CFF32",

        text: colors.onSecondary || "#111111",

        border: colors.secondary || "#7CFF32",

        borderWidth: 0,
      };

    case "success":
      return {
        background: colors.success || "#16A34A",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.success || "#16A34A",

        borderWidth: 0,
      };

    case "danger":
      return {
        background: colors.danger || "#DC2626",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.danger || "#DC2626",

        borderWidth: 0,
      };

    case "neutral":
      return {
        background: colors.card || colors.surface || "#FFFFFF",

        text: colors.text || "#111111",

        border: colors.border || "#E5E5E5",

        borderWidth: 1,
      };

    case "primary":
    default:
      return {
        background: colors.primary || "#FF5A1F",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.primary || "#FF5A1F",

        borderWidth: 0,
      };
  }
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

/* -------------------------------------------------------------------------- */
/* POSITION                                                                   */
/* -------------------------------------------------------------------------- */

function getPositionStyle(position, offset) {
  switch (position) {
    case "bottomLeft":
      return {
        left: offset,
        bottom: offset,
      };

    case "topRight":
      return {
        right: offset,
        top: offset,
      };

    case "topLeft":
      return {
        left: offset,
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
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

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

  actionsContainer: {
    position: "absolute",

    width: 1,

    height: 1,

    alignItems: "center",

    justifyContent: "center",
  },

  actionWrapper: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",
  },

  actionRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  actionRowReverse: {
    flexDirection: "row-reverse",
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
});

/* -------------------------------------------------------------------------- */
/* EXPORT                                                                     */
/* -------------------------------------------------------------------------- */

export const UIFloatingButton = memo(UIFloatingButtonComponent);

UIFloatingButton.displayName = "UIFloatingButton";

export {
  FLOATING_BUTTON_SIZES as UIFloatingButtonSizes,
  FLOATING_BUTTON_VARIANTS as UIFloatingButtonVariants,
  FLOATING_BUTTON_SHAPES as UIFloatingButtonShapes,
  FLOATING_BUTTON_POSITIONS as UIFloatingButtonPositions,
  FLOATING_BUTTON_MENU_TYPES as UIFloatingButtonMenuTypes,
  FLOATING_BUTTON_DIRECTIONS as UIFloatingButtonDirections,
};

export default UIFloatingButton;
