import React, {
  cloneElement,
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
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

const UI_TOOLTIP_PLACEMENTS = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  auto: "auto",
};

const UI_TOOLTIP_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const UI_TOOLTIP_ANIMATIONS = {
  fade: "fade",
  scale: "scale",
  fadeScale: "fadeScale",
};

const SIZE_CONFIG = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    radius: 6,
    maxWidth: 220,
  },

  md: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    radius: 8,
    maxWidth: 280,
  },

  lg: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    radius: 10,
    maxWidth: 340,
  },
};

const ARROW_SIZE = 6;

const UITooltipComponent = forwardRef(function UITooltip(
  {
    children,

    content,

    title,

    placement = "auto",

    size = "md",

    animation = "fadeScale",

    animated = true,

    animationDuration = 160,

    delay = 300,

    duration = 0,

    visible,

    defaultVisible = false,

    onVisibleChange,

    trigger = "longPress",

    dismissOnPress = true,

    dismissOnOutsidePress = true,

    showArrow = true,

    arrowPosition = "center",

    backgroundColor,

    textColor,

    borderColor,

    borderWidth = 0,

    radius,

    maxWidth,

    offset = 8,

    disabled = false,

    onShow,

    onHide,

    containerStyle,

    tooltipStyle,

    textStyle,

    titleStyle,

    arrowStyle,

    overlayStyle,

    accessibilityLabel,

    testID,

    ...props
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const isControlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = isControlled ? Boolean(visible) : internalVisible;

  const [targetLayout, setTargetLayout] = useState(null);

  const [resolvedPlacement, setResolvedPlacement] = useState(
    placement === "auto" ? "top" : placement,
  );

  const [tooltipSize, setTooltipSize] = useState({
    width: 0,
    height: 0,
  });

  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  const opacity = useRef(
    new Animated.Value(animated && !defaultVisible ? 0 : 1),
  ).current;

  const scale = useRef(
    new Animated.Value(animated && !defaultVisible ? 0.94 : 1),
  ).current;

  const translateY = useRef(new Animated.Value(0)).current;

  const safeSize = UI_TOOLTIP_SIZES[size] ? size : "md";

  const config = SIZE_CONFIG[safeSize];

  const safeAnimation = UI_TOOLTIP_ANIMATIONS[animation]
    ? animation
    : "fadeScale";

  const resolvedBackgroundColor = backgroundColor || colors.text || "#111111";

  const resolvedTextColor = textColor || colors.textInverse || "#FFFFFF";

  const resolvedBorderColor = borderColor || colors.border || "transparent";

  const resolvedRadius = radius !== undefined ? radius : config.radius;

  const resolvedMaxWidth = maxWidth || config.maxWidth;

  const updateVisible = useCallback(
    (nextVisible) => {
      if (!isControlled) {
        setInternalVisible(nextVisible);
      }

      onVisibleChange?.(nextVisible);
    },
    [isControlled, onVisibleChange],
  );

  const clearTimers = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);

      showTimer.current = null;
    }

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);

      hideTimer.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimers();

    if (!isVisible) {
      return;
    }

    if (!animated) {
      opacity.setValue(0);
      scale.setValue(0.94);

      updateVisible(false);
      onHide?.();

      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),

      Animated.timing(scale, {
        toValue: 0.94,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),
    ]).start(() => {
      updateVisible(false);
      onHide?.();
    });
  }, [
    clearTimers,
    isVisible,
    animated,
    opacity,
    scale,
    animationDuration,
    updateVisible,
    onHide,
  ]);

  const show = useCallback(() => {
    if (disabled || !content) {
      return;
    }

    clearTimers();

    if (!targetLayout) {
      measureTarget();
    }

    updateVisible(true);
    onShow?.();

    if (!animated) {
      opacity.setValue(1);
      scale.setValue(1);

      return;
    }

    opacity.setValue(0);
    scale.setValue(safeAnimation === "fade" ? 1 : 0.94);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),

      Animated.timing(scale, {
        toValue: 1,

        duration: Math.max(0, animationDuration),

        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      hideTimer.current = setTimeout(hide, duration);
    }
  }, [
    disabled,
    content,
    clearTimers,
    targetLayout,
    animated,
    opacity,
    scale,
    safeAnimation,
    animationDuration,
    updateVisible,
    onShow,
    duration,
    hide,
  ]);

  const showWithDelay = useCallback(() => {
    if (disabled || !content) {
      return;
    }

    clearTimers();

    if (delay <= 0) {
      show();
      return;
    }

    showTimer.current = setTimeout(show, delay);
  }, [disabled, content, clearTimers, delay, show]);

  const measureTarget = useCallback(() => {
    requestAnimationFrame(() => {
      if (!targetRef.current) {
        return;
      }

      targetRef.current.measureInWindow((x, y, width, height) => {
        setTargetLayout({
          x,
          y,
          width,
          height,
        });
      });
    });
  }, []);

  const targetRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    measureTarget();
  }, [isVisible, measureTarget]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (placement !== "auto") {
      setResolvedPlacement(placement);

      return;
    }

    if (!targetLayout || !tooltipSize.width || !tooltipSize.height) {
      return;
    }

    const screen = Dimensions.get("window");

    const spaceTop = targetLayout.y;

    const spaceBottom = screen.height - (targetLayout.y + targetLayout.height);

    const spaceLeft = targetLayout.x;

    const spaceRight = screen.width - (targetLayout.x + targetLayout.width);

    const verticalEnough = tooltipSize.height + offset + 12;

    const horizontalEnough = tooltipSize.width + offset + 12;

    if (spaceTop >= verticalEnough) {
      setResolvedPlacement("top");
    } else if (spaceBottom >= verticalEnough) {
      setResolvedPlacement("bottom");
    } else if (spaceRight >= horizontalEnough) {
      setResolvedPlacement("right");
    } else {
      setResolvedPlacement("left");
    }
  }, [placement, targetLayout, tooltipSize, offset, isVisible]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handlePress = useCallback(
    (event) => {
      if (trigger !== "press") {
        return;
      }

      if (isVisible) {
        hide();
      } else {
        showWithDelay();
      }
    },
    [trigger, isVisible, hide, showWithDelay],
  );

  const handleLongPress = useCallback(() => {
    if (trigger !== "longPress") {
      return;
    }

    if (isVisible) {
      hide();
    } else {
      showWithDelay();
    }
  }, [trigger, isVisible, hide, showWithDelay]);

  const handleMouseEnter = useCallback(() => {
    if (trigger !== "hover") {
      return;
    }

    showWithDelay();
  }, [trigger, showWithDelay]);

  const handleMouseLeave = useCallback(() => {
    if (trigger !== "hover") {
      return;
    }

    hide();
  }, [trigger, hide]);

  const childProps = {
    ref: (node) => {
      targetRef.current = node;

      if (typeof children?.ref === "function") {
        children.ref(node);
      }
    },

    onPress: (event) => {
      children.props?.onPress?.(event);

      if (trigger === "press") {
        handlePress(event);
      } else if (dismissOnPress && isVisible) {
        hide();
      }
    },

    onLongPress: (event) => {
      children.props?.onLongPress?.(event);

      handleLongPress();
    },

    onMouseEnter: (event) => {
      children.props?.onMouseEnter?.(event);

      handleMouseEnter();
    },

    onMouseLeave: (event) => {
      children.props?.onMouseLeave?.(event);

      handleMouseLeave();
    },
  };

  const wrappedChild = React.isValidElement(children)
    ? cloneElement(children, childProps)
    : children;

  const tooltipPosition = getTooltipPosition({
    placement: resolvedPlacement,

    targetLayout,

    tooltipSize,

    screenWidth: Dimensions.get("window").width,

    screenHeight: Dimensions.get("window").height,

    offset,
  });

  const arrowPositionStyle = getArrowPosition(
    resolvedPlacement,
    arrowPosition,
    tooltipSize,
  );

  const tooltipTransform =
    safeAnimation === "fade"
      ? []
      : [
          {
            scale,
          },
        ];

  const tooltip = (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {dismissOnOutsidePress ? (
        <Pressable
          style={[StyleSheet.absoluteFill, overlayStyle]}
          onPress={hide}
        />
      ) : null}

      <Animated.View
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;

          setTooltipSize({
            width: layout.width,

            height: layout.height,
          });
        }}
        style={[
          styles.tooltip,

          {
            left: tooltipPosition.x,

            top: tooltipPosition.y,

            maxWidth: resolvedMaxWidth,

            backgroundColor: resolvedBackgroundColor,

            borderColor: resolvedBorderColor,

            borderWidth,

            borderRadius: resolvedRadius,

            opacity,

            transform: tooltipTransform,
          },

          tooltipStyle,
        ]}
      >
        {showArrow ? (
          <View
            style={[
              styles.arrow,

              getArrowBaseStyle(resolvedPlacement, resolvedBackgroundColor),

              arrowPositionStyle,

              arrowStyle,
            ]}
          />
        ) : null}

        {title ? (
          <Text
            style={[
              styles.title,

              {
                fontSize: config.fontSize,

                color: resolvedTextColor,
              },

              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}

        <Text
          style={[
            styles.text,

            {
              fontSize: config.fontSize,

              color: resolvedTextColor,

              marginTop: title ? 3 : 0,

              paddingHorizontal: config.paddingHorizontal,

              paddingVertical: config.paddingVertical,
            },

            textStyle,
          ]}
        >
          {content}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <>
      {wrappedChild}

      {isVisible ? (
        <Modal
          transparent
          visible
          animationType="none"
          onRequestClose={hide}
          statusBarTranslucent
        >
          <View
            ref={ref}
            testID={testID}
            style={styles.modalContainer}
            accessibilityLabel={accessibilityLabel}
          >
            {tooltip}
          </View>
        </Modal>
      ) : null}
    </>
  );
});

function getTooltipPosition({
  placement,
  targetLayout,
  tooltipSize,
  screenWidth,
  screenHeight,
  offset,
}) {
  if (!targetLayout) {
    return {
      x: 0,
      y: 0,
    };
  }

  let x = targetLayout.x + targetLayout.width / 2 - tooltipSize.width / 2;

  let y = targetLayout.y - tooltipSize.height - offset;

  switch (placement) {
    case "bottom":
      y = targetLayout.y + targetLayout.height + offset;

      break;

    case "left":
      x = targetLayout.x - tooltipSize.width - offset;

      y = targetLayout.y + targetLayout.height / 2 - tooltipSize.height / 2;

      break;

    case "right":
      x = targetLayout.x + targetLayout.width + offset;

      y = targetLayout.y + targetLayout.height / 2 - tooltipSize.height / 2;

      break;

    case "top":
    default:
      y = targetLayout.y - tooltipSize.height - offset;

      break;
  }

  const horizontalMargin = 8;

  x = Math.max(
    horizontalMargin,
    Math.min(x, screenWidth - tooltipSize.width - horizontalMargin),
  );

  y = Math.max(8, Math.min(y, screenHeight - tooltipSize.height - 8));

  return {
    x,
    y,
  };
}

function getArrowBaseStyle(placement, backgroundColor) {
  const transparent = "transparent";

  switch (placement) {
    case "bottom":
      return {
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderLeftColor: transparent,
        borderRightColor: transparent,
        borderBottomColor: backgroundColor,
        position: "absolute",
        top: -ARROW_SIZE,
      };

    case "left":
      return {
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderLeftWidth: ARROW_SIZE,
        borderTopColor: transparent,
        borderBottomColor: transparent,
        borderLeftColor: backgroundColor,
        position: "absolute",
        right: -ARROW_SIZE,
      };

    case "right":
      return {
        borderTopWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopColor: transparent,
        borderBottomColor: transparent,
        borderRightColor: backgroundColor,
        position: "absolute",
        left: -ARROW_SIZE,
      };

    case "top":
    default:
      return {
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderLeftColor: transparent,
        borderRightColor: transparent,
        borderTopColor: backgroundColor,
        position: "absolute",
        bottom: -ARROW_SIZE,
      };
  }
}

function getArrowPosition(placement, position, tooltipSize) {
  if (position === "start") {
    return placement === "top" || placement === "bottom"
      ? {
          left: 16,
        }
      : {
          top: 16,
        };
  }

  if (position === "end") {
    return placement === "top" || placement === "bottom"
      ? {
          right: 16,
        }
      : {
          bottom: 16,
        };
  }

  if (placement === "top" || placement === "bottom") {
    return {
      left: tooltipSize.width / 2 - ARROW_SIZE,
    };
  }

  return {
    top: tooltipSize.height / 2 - ARROW_SIZE,
  };
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },

  tooltip: {
    position: "absolute",

    elevation: 10,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,

    shadowRadius: 8,

    zIndex: 99999,
  },

  text: {
    includeFontPadding: false,

    lineHeight: 18,
  },

  title: {
    paddingHorizontal: 10,

    paddingTop: 8,

    fontWeight: "700",

    includeFontPadding: false,
  },

  arrow: {
    zIndex: 10,
  },
});

export const UITooltip = memo(UITooltipComponent);

UITooltip.displayName = "UITooltip";

export {
  UI_TOOLTIP_PLACEMENTS as UITooltipPlacements,
  UI_TOOLTIP_SIZES as UITooltipSizes,
  UI_TOOLTIP_ANIMATIONS as UITooltipAnimations,
};

export default UITooltip;
