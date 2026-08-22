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

const FLOATING_BUTTON_CIRCULAR_DIRECTIONS = {
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

    /*
     * Speed dial
     */
    actions = [],

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
    activeOpacity = 0.85,

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

  const [open, setOpen] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const menuProgress = useRef(new Animated.Value(0)).current;

  const actionProgress = useRef([]).current;

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

  const safeCircularDirection = FLOATING_BUTTON_CIRCULAR_DIRECTIONS[
    circularDirection
  ]
    ? circularDirection
    : FLOATING_BUTTON_CIRCULAR_DIRECTIONS.up;

  const dimensions = useMemo(
    () => getDimensions(safeSize, safeShape),
    [safeSize, safeShape],
  );

  const variantColors = useMemo(
    () => getVariantColors(safeVariant, colors),
    [safeVariant, colors],
  );

  /*
   * Keep animation refs aligned
   * with action count.
   */
  useEffect(() => {
    while (actionProgress.current.length < actions.length) {
      actionProgress.current.push(new Animated.Value(0));
    }

    if (actionProgress.current.length > actions.length) {
      actionProgress.current = actionProgress.current.slice(0, actions.length);
    }
  }, [actions.length]);

  const animateMainButton = useCallback(
    (pressed) => {
      Animated.spring(scale, {
        toValue: pressed ? 0.92 : 1,

        friction: 6,

        tension: 150,

        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const openMenu = useCallback(() => {
    if (disabled || loading || !actions.length) {
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

      Animated.timing(scale, {
        toValue: 0.94,

        duration: 100,

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

    Animated.parallel(animations).start();
  }, [
    disabled,
    loading,
    actions.length,
    onPress,
    menuProgress,
    scale,
    animationDuration,
    staggerDelay,
  ]);

  const closeMenu = useCallback(() => {
    const animations = actionProgress.current.map((progress, index) =>
      Animated.timing(progress, {
        toValue: 0,

        duration: animationDuration,

        delay: (actions.length - index - 1) * staggerDelay,

        easing: Easing.in(Easing.cubic),

        useNativeDriver: true,
      }),
    );

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
    ]).start(() => {
      setOpen(false);
    });
  }, [actions.length, animationDuration, staggerDelay, menuProgress, scale]);

  const handleMainPress = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    if (expandable && actions.length) {
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
    actions.length,
    open,
    closeMenu,
    openMenu,
    onPress,
  ]);

  const handleActionPress = useCallback(
    (action) => {
      if (action?.disabled || action?.loading) {
        return;
      }

      action?.onPress?.();

      if (closeOnAction) {
        closeMenu();
      }
    },
    [closeOnAction, closeMenu],
  );

  const showTitle = !iconOnly && Boolean(title ?? label);

  const mainIcon = loading ? (
    <LoadingSpinner color={variantColors.text} />
  ) : open && expandable && actions.length ? (
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
  ) : (
    icon
  );

  return (
    <>
      {overlay && open && expandable ? (
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
        {expandable && actions.length ? (
          <SpeedDialActions
            actions={actions}
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
          style={{
            transform: [
              {
                scale,
              },
            ],
          }}
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
            accessibilityLabel={accessibilityLabel || title || label}
            accessibilityState={{
              disabled: disabled || loading,

              expanded: expandable && actions.length ? open : undefined,

              busy: loading,
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
                {title ?? label}
              </Text>
            ) : null}

            {badge ? (
              renderBadge ? (
                renderBadge(badge)
              ) : (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
});

/*
 * ------------------------------------------
 * SPEED DIAL ACTIONS
 * ------------------------------------------
 */

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

  return (
    <View pointerEvents="box-none" style={styles.actionsContainer}>
      {actions.map((action, index) => {
        const progress = progressRefs[index];

        if (!progress) {
          return null;
        }

        const sizeData = getActionSize(size);

        const transform = getActionTransform(
          menuType,
          direction,
          circularDirection,
          index,
          actions.length,
          radius,
          itemSpacing,
          progress,
        );

        const actionColors = getActionColors(action, colors);

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

                actionContainerStyle,
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
                    {action.label}
                  </Text>
                </View>
              ) : null}

              <Pressable
                disabled={action.disabled || action.loading}
                onPress={() => onActionPress(action)}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel || action.label}
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

                  actionContainerStyle,
                ]}
              >
                {action.loading ? (
                  <LoadingSpinner color={actionColors.text} />
                ) : (
                  <View style={[styles.actionIcon, actionIconStyle]}>
                    {action.icon}
                  </View>
                )}

                {action.badge ? (
                  renderBadge ? (
                    renderBadge(action.badge, action)
                  ) : (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
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
    case FLOATING_BUTTON_DIRECTIONS.down:
      return {
        translateY: Animated.multiply(progress, distance),
      };

    case FLOATING_BUTTON_DIRECTIONS.left:
      return {
        translateX: Animated.multiply(progress, -distance),
      };

    case FLOATING_BUTTON_DIRECTIONS.right:
      return {
        translateX: Animated.multiply(progress, distance),
      };

    case FLOATING_BUTTON_DIRECTIONS.up:
    default:
      return {
        translateY: Animated.multiply(progress, -distance),
      };
  }
}

function getCircularTransform(direction, index, count, radius, progress) {
  if (count <= 0) {
    return {};
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
  /*
   * Spread actions over
   * approximately 90 degrees.
   */

  const spread = count === 1 ? 0 : Math.min(90, 35 * (count - 1));

  const step = count === 1 ? 0 : spread / (count - 1);

  switch (direction) {
    case FLOATING_BUTTON_CIRCULAR_DIRECTIONS.down:
      return 90 - spread / 2 + step * index;

    case FLOATING_BUTTON_CIRCULAR_DIRECTIONS.left:
      return 180 - spread / 2 + step * index;

    case FLOATING_BUTTON_CIRCULAR_DIRECTIONS.right:
      return -spread / 2 + step * index;

    case FLOATING_BUTTON_CIRCULAR_DIRECTIONS.up:
    default:
      return 270 - spread / 2 + step * index;
  }
}

function getActionSize(size) {
  switch (size) {
    case FLOATING_BUTTON_SIZES.sm:
      return {
        size: 42,
        fontSize: 12,
      };

    case FLOATING_BUTTON_SIZES.lg:
      return {
        size: 58,
        fontSize: 15,
      };

    case FLOATING_BUTTON_SIZES.md:
    default:
      return {
        size: 50,
        fontSize: 13,
      };
  }
}

function getActionColors(action, colors) {
  if (action?.variant) {
    return getVariantColors(action.variant, colors);
  }

  return {
    background: action?.backgroundColor || colors.card || "#FFFFFF",

    text: action?.iconColor || colors.text || "#111111",

    border: action?.borderColor || colors.border || "#E5E5E5",

    borderWidth: action?.borderWidth ?? 1,
  };
}

function getDimensions(size, shape) {
  const circle = shape === FLOATING_BUTTON_SHAPES.circle;

  switch (size) {
    case FLOATING_BUTTON_SIZES.sm:
      return {
        height: 44,
        minWidth: circle ? 44 : 44,
        paddingHorizontal: 14,
        borderRadius: circle ? 22 : 12,
        fontSize: 13,
      };

    case FLOATING_BUTTON_SIZES.lg:
      return {
        height: 64,
        minWidth: circle ? 64 : 64,
        paddingHorizontal: 20,
        borderRadius: circle ? 32 : 16,
        fontSize: 16,
      };

    case FLOATING_BUTTON_SIZES.md:
    default:
      return {
        height: 54,
        minWidth: circle ? 54 : 54,
        paddingHorizontal: 17,
        borderRadius: circle ? 27 : 14,
        fontSize: 14,
      };
  }
}

function getVariantColors(variant, colors) {
  switch (variant) {
    case FLOATING_BUTTON_VARIANTS.secondary:
      return {
        background: colors.secondary || "#7CFF32",

        text: colors.onSecondary || "#111111",

        border: colors.secondary || "#7CFF32",

        borderWidth: 0,
      };

    case FLOATING_BUTTON_VARIANTS.success:
      return {
        background: colors.success || "#16A34A",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.success || "#16A34A",

        borderWidth: 0,
      };

    case FLOATING_BUTTON_VARIANTS.danger:
      return {
        background: colors.danger || "#DC2626",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.danger || "#DC2626",

        borderWidth: 0,
      };

    case FLOATING_BUTTON_VARIANTS.neutral:
      return {
        background: colors.card || colors.surface || "#FFFFFF",

        text: colors.text || "#111111",

        border: colors.border || "#E5E5E5",

        borderWidth: 1,
      };

    case FLOATING_BUTTON_VARIANTS.primary:
    default:
      return {
        background: colors.primary || "#FF5A1F",

        text: colors.onPrimary || "#FFFFFF",

        border: colors.primary || "#FF5A1F",

        borderWidth: 0,
      };
  }
}

function getPositionStyle(position, offset) {
  switch (position) {
    case FLOATING_BUTTON_POSITIONS.bottomLeft:
      return {
        left: offset,
        bottom: offset,
      };

    case FLOATING_BUTTON_POSITIONS.topRight:
      return {
        right: offset,
        top: offset,
      };

    case FLOATING_BUTTON_POSITIONS.topLeft:
      return {
        left: offset,
        top: offset,
      };

    case FLOATING_BUTTON_POSITIONS.bottomRight:
    default:
      return {
        right: offset,
        bottom: offset,
      };
  }
}

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

    alignItems: "center",

    justifyContent: "center",

    width: 1,

    height: 1,
  },

  actionWrapper: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",
  },

  actionRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,
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
    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 8,

    elevation: 3,

    shadowColor: "#000",

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

    top: -4,

    right: -4,

    minWidth: 18,

    height: 18,

    paddingHorizontal: 4,

    borderRadius: 9,

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

  badge: {
    position: "absolute",

    top: -4,

    right: -4,

    minWidth: 18,

    height: 18,

    paddingHorizontal: 4,

    borderRadius: 9,

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
});

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
