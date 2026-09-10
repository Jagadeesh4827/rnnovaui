import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated as RNAnimated,
  BackHandler,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useUITheme } from "../../theme";

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DEFAULT_SNAP_POINTS = ["50%"];

const DEFAULT_SPRING = {
  damping: 20,
  stiffness: 180,
  mass: 0.8,
};

const SCREEN = Dimensions.get("window");

/* ============================================================================
 * HELPERS
 * ========================================================================== */

function normalizeSnapPoint(point, screenHeight) {
  if (typeof point === "string" && point.trim().endsWith("%")) {
    const percentage = parseFloat(point);

    if (Number.isFinite(percentage)) {
      return Math.max(
        0,
        Math.min(screenHeight, screenHeight * (percentage / 100)),
      );
    }
  }

  if (typeof point === "number" && Number.isFinite(point)) {
    return Math.max(0, Math.min(screenHeight, point));
  }

  return 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* ============================================================================
 * ICON
 * ========================================================================== */

function RenderIcon({ icon, size = 20, color = "#000000", style }) {
  if (!icon) {
    return null;
  }

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size,
      color,
      style: [icon.props?.style, style],
    });
  }

  if (typeof icon === "string") {
    return <Ionicons name={icon} size={size} color={color} style={style} />;
  }

  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  return null;
}

/* ============================================================================
 * HANDLE
 * ========================================================================== */

function BottomSheetHandle({
  width = 40,
  height = 4,
  borderRadius,
  color = "#C8C8C8",
  marginTop = 8,
  marginBottom = 8,
  style,
}) {
  return (
    <View
      style={[
        styles.handle,
        {
          width,
          height,
          borderRadius: borderRadius ?? height / 2,
          backgroundColor: color,
          marginTop,
          marginBottom,
        },
        style,
      ]}
    />
  );
}

/* ============================================================================
 * BACKDROP
 * ========================================================================== */

function BottomSheetBackdrop({
  opacity = 0.45,
  backgroundColor = "#000000",
  onPress,
  style,
}) {
  return (
    <View
      style={[
        styles.backdrop,
        {
          backgroundColor,
          opacity,
        },
        style,
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
    </View>
  );
}

/* ============================================================================
 * MAIN COMPONENT
 * ========================================================================== */

const UIBottomSheet = forwardRef(function UIBottomSheet(
  {
    /* ======================================================================
     * VISIBILITY
     * ==================================================================== */

    visible,
    defaultVisible = false,
    onVisibleChange,

    /* ======================================================================
     * SNAP POINTS
     * ==================================================================== */

    snapPoints = DEFAULT_SNAP_POINTS,
    initialSnapIndex = 0,

    allowDrag = true,
    allowSwipeDown = true,
    closeOnSwipeDown = true,
    swipeDownThreshold = 100,

    /* ======================================================================
     * DIMENSIONS
     * ==================================================================== */

    height,
    minHeight,
    maxHeight,
    width = "100%",

    /* ======================================================================
     * LAYOUT
     * ==================================================================== */

    margin = 0,
    marginHorizontal = 0,
    marginBottom = 0,

    padding = 0,
    paddingHorizontal = 0,
    paddingVertical = 0,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,

    /* ======================================================================
     * SAFE AREA
     * ==================================================================== */

    safeArea = true,
    safeAreaBottom,
    safeAreaTop = false,

    /* ======================================================================
     * APPEARANCE
     * ==================================================================== */

    backgroundColor,
    borderRadius,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,

    borderWidth = 0,
    borderColor,

    /* ======================================================================
     * SHADOW
     * ==================================================================== */

    shadow = true,
    shadowColor = "#000000",
    shadowOpacity = 0.18,
    shadowRadius = 12,
    shadowOffset = {
      width: 0,
      height: -4,
    },
    elevation = 12,

    /* ======================================================================
     * BACKDROP
     * ==================================================================== */

    showBackdrop = true,
    backdropColor = "#000000",
    backdropOpacity = 0.45,
    closeOnBackdropPress = true,
    backdropStyle,

    renderBackdrop,

    /* ======================================================================
     * HANDLE
     * ==================================================================== */

    showHandle = true,
    handleWidth = 40,
    handleHeight = 4,
    handleColor,
    handleMarginTop = 8,
    handleMarginBottom = 8,
    handleStyle,
    renderHandle,

    /* ======================================================================
     * HEADER
     * ==================================================================== */

    showHeader = false,
    title,

    titleFontSize = 18,
    titleLineHeight = 24,
    titleColor,
    titleFontWeight = "700",
    titleAlign = "left",

    headerHeight,

    headerPadding = 16,
    headerPaddingHorizontal,
    headerPaddingVertical,
    headerPaddingTop,
    headerPaddingBottom,
    headerPaddingLeft,
    headerPaddingRight,

    headerStyle,
    titleStyle,
    renderHeader,

    /* ======================================================================
     * CLOSE BUTTON
     * ==================================================================== */

    showCloseButton = false,
    closeIcon = "close",
    closeIconSize = 24,
    closeIconColor,
    closeButtonSize = 40,
    closeButtonBackgroundColor,
    closeButtonBorderRadius,
    closeButtonStyle,
    onCloseButtonPress,

    /* ======================================================================
     * CONTENT
     * ==================================================================== */

    scrollable = false,

    contentPadding = 0,
    contentPaddingHorizontal = 0,
    contentPaddingVertical = 0,
    contentPaddingTop = 0,
    contentPaddingBottom = 0,
    contentPaddingLeft = 0,
    contentPaddingRight = 0,

    contentStyle,
    contentContainerStyle,

    keyboardDismissMode = "on-drag",
    keyboardShouldPersistTaps = "handled",

    /* ======================================================================
     * FOOTER
     * ==================================================================== */

    footer,
    footerHeight,

    footerPadding = 16,
    footerPaddingHorizontal,
    footerPaddingVertical,
    footerPaddingTop,
    footerPaddingBottom,
    footerPaddingLeft,
    footerPaddingRight,

    footerStyle,
    renderFooter,

    /* ======================================================================
     * ANIMATION
     * ==================================================================== */

    reanimated = false,

    animationDuration = 280,
    closeAnimationDuration = 220,

    animationSpring,

    backdropAnimationDuration = 220,

    /* ======================================================================
     * STATUS BAR
     * ==================================================================== */

    statusBarTranslucent = true,
    statusBarStyle = "light-content",
    restoreStatusBar = true,

    /* ======================================================================
     * CALLBACKS
     * ==================================================================== */

    onOpen,
    onClose,
    onSnapChange,
    onDragStart,
    onDrag,
    onDragEnd,

    /* ======================================================================
     * STYLE
     * ==================================================================== */

    style,

    /* ======================================================================
     * CHILDREN
     * ==================================================================== */

    children,
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const themeRadius = theme?.radius || {};

  const themeAnimation = theme?.animation || {};

  const insets = useSafeAreaInsets();

  /* ========================================================================
   * CONTROLLED VISIBILITY
   * ====================================================================== */

  const isControlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = isControlled ? visible : internalVisible;

  const setVisible = useCallback(
    (nextVisible) => {
      if (!isControlled) {
        setInternalVisible(nextVisible);
      }

      if (typeof onVisibleChange === "function") {
        onVisibleChange(nextVisible);
      }
    },
    [isControlled, onVisibleChange],
  );

  /* ========================================================================
   * SNAP POINTS
   * ====================================================================== */

  const resolvedSnapPoints = useMemo(() => {
    let points = Array.isArray(snapPoints) ? snapPoints : DEFAULT_SNAP_POINTS;

    if (!points.length) {
      points = DEFAULT_SNAP_POINTS;
    }

    let result = points
      .map((point) => normalizeSnapPoint(point, SCREEN.height))
      .filter((point) => point > 0);

    if (typeof height === "number" && height > 0) {
      result = [height];
    }

    if (typeof minHeight === "number") {
      result = result.map((point) => Math.max(point, minHeight));
    }

    if (typeof maxHeight === "number") {
      result = result.map((point) => Math.min(point, maxHeight));
    }

    result.sort((a, b) => a - b);

    if (!result.length) {
      result = [Math.min(SCREEN.height * 0.5, maxHeight || SCREEN.height)];
    }

    return result;
  }, [height, maxHeight, minHeight, snapPoints]);

  const safeInitialSnapIndex = clamp(
    initialSnapIndex,
    0,
    resolvedSnapPoints.length - 1,
  );

  const [currentSnapIndex, setCurrentSnapIndex] =
    useState(safeInitialSnapIndex);

  const currentSnapIndexRef = useRef(safeInitialSnapIndex);

  /* ========================================================================
   * SNAP CALLBACK
   * ====================================================================== */

  const updateSnapIndex = useCallback(
    (index) => {
      const nextIndex = clamp(index, 0, resolvedSnapPoints.length - 1);

      currentSnapIndexRef.current = nextIndex;

      setCurrentSnapIndex(nextIndex);

      if (typeof onSnapChange === "function") {
        onSnapChange(nextIndex, resolvedSnapPoints[nextIndex]);
      }
    },
    [onSnapChange, resolvedSnapPoints],
  );

  /* ========================================================================
   * ANIMATION VALUES
   * ====================================================================== */

  const translateY = useRef(new RNAnimated.Value(SCREEN.height)).current;

  const backdropOpacityValue = useRef(new RNAnimated.Value(0)).current;

  const reanimatedTranslateY = useSharedValue(SCREEN.height);

  const reanimatedBackdrop = useSharedValue(0);

  /* ========================================================================
   * SPRING
   * ====================================================================== */

  const resolvedSpring =
    animationSpring || themeAnimation.spring || DEFAULT_SPRING;

  /* ========================================================================
   * TARGET POSITION
   * ====================================================================== */

  const getTargetTranslateY = useCallback(
    (snapIndex) => {
      const sheetHeight = resolvedSnapPoints[snapIndex] || 0;

      const bottomInset = safeArea ? (safeAreaBottom ?? insets.bottom) : 0;

      return Math.max(0, SCREEN.height - sheetHeight - bottomInset);
    },
    [insets.bottom, resolvedSnapPoints, safeArea, safeAreaBottom],
  );

  /* ========================================================================
   * STATUS BAR
   * ====================================================================== */

  const previousStatusBarStyle = useRef(StatusBar.currentStyle);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    previousStatusBarStyle.current = StatusBar.currentStyle;

    StatusBar.setBarStyle(statusBarStyle, true);

    if (Platform.OS === "android" && statusBarTranslucent) {
      StatusBar.setTranslucent(true);
    }

    return () => {
      if (restoreStatusBar) {
        StatusBar.setBarStyle(
          previousStatusBarStyle.current || "default",
          true,
        );
      }
    };
  }, [isVisible, restoreStatusBar, statusBarStyle, statusBarTranslucent]);

  /* ========================================================================
   * OPEN
   * ====================================================================== */

  const openSheet = useCallback(
    (snapIndex = currentSnapIndexRef.current) => {
      const index = clamp(snapIndex, 0, resolvedSnapPoints.length - 1);

      updateSnapIndex(index);

      setVisible(true);

      const target = getTargetTranslateY(index);

      if (reanimated) {
        reanimatedTranslateY.value = withSpring(target, resolvedSpring);

        reanimatedBackdrop.value = withTiming(backdropOpacity, {
          duration: backdropAnimationDuration,
        });
      } else {
        translateY.setValue(SCREEN.height);

        backdropOpacityValue.setValue(0);

        RNAnimated.parallel([
          RNAnimated.spring(translateY, {
            toValue: target,

            damping: resolvedSpring.damping,

            stiffness: resolvedSpring.stiffness,

            mass: resolvedSpring.mass,

            useNativeDriver: true,
          }),

          RNAnimated.timing(backdropOpacityValue, {
            toValue: backdropOpacity,

            duration: backdropAnimationDuration,

            useNativeDriver: true,
          }),
        ]).start();
      }

      Keyboard.dismiss();

      if (typeof onOpen === "function") {
        onOpen(index);
      }
    },
    [
      backdropAnimationDuration,
      backdropOpacity,
      backdropOpacityValue,
      getTargetTranslateY,
      onOpen,
      reanimated,
      reanimatedBackdrop,
      reanimatedTranslateY,
      resolvedSnapPoints.length,
      resolvedSpring,
      setVisible,
      translateY,
      updateSnapIndex,
    ],
  );

  /* ========================================================================
   * CLOSE
   * ====================================================================== */

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();

    if (reanimated) {
      reanimatedTranslateY.value = withTiming(
        SCREEN.height,
        {
          duration: closeAnimationDuration,
        },
        (finished) => {
          if (finished) {
            runOnJS(setVisible)(false);

            if (typeof onClose === "function") {
              runOnJS(onClose)();
            }
          }
        },
      );

      reanimatedBackdrop.value = withTiming(0, {
        duration: backdropAnimationDuration,
      });

      return;
    }

    RNAnimated.parallel([
      RNAnimated.timing(translateY, {
        toValue: SCREEN.height,

        duration: closeAnimationDuration,

        useNativeDriver: true,
      }),

      RNAnimated.timing(backdropOpacityValue, {
        toValue: 0,

        duration: backdropAnimationDuration,

        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setVisible(false);

      if (typeof onClose === "function") {
        onClose();
      }
    });
  }, [
    backdropAnimationDuration,
    backdropOpacityValue,
    closeAnimationDuration,
    onClose,
    reanimated,
    reanimatedBackdrop,
    reanimatedTranslateY,
    setVisible,
    translateY,
  ]);

  /* ========================================================================
   * SNAP
   * ====================================================================== */

  const snapTo = useCallback(
    (snapIndex) => {
      const index = clamp(snapIndex, 0, resolvedSnapPoints.length - 1);

      const target = getTargetTranslateY(index);

      updateSnapIndex(index);

      if (reanimated) {
        reanimatedTranslateY.value = withSpring(target, resolvedSpring);
      } else {
        RNAnimated.spring(translateY, {
          toValue: target,

          damping: resolvedSpring.damping,

          stiffness: resolvedSpring.stiffness,

          mass: resolvedSpring.mass,

          useNativeDriver: true,
        }).start();
      }
    },
    [
      getTargetTranslateY,
      reanimated,
      reanimatedTranslateY,
      resolvedSnapPoints.length,
      resolvedSpring,
      translateY,
      updateSnapIndex,
    ],
  );

  /* ========================================================================
   * IMPERATIVE API
   * ====================================================================== */

  useImperativeHandle(
    ref,
    () => ({
      open: openSheet,

      close: closeSheet,

      toggle: () => {
        if (isVisible) {
          closeSheet();
        } else {
          openSheet();
        }
      },

      snapTo,

      expand: () => {
        snapTo(resolvedSnapPoints.length - 1);
      },

      collapse: () => {
        snapTo(0);
      },

      getSnapIndex: () => currentSnapIndexRef.current,
    }),
    [closeSheet, isVisible, openSheet, resolvedSnapPoints.length, snapTo],
  );

  /* ========================================================================
   * VISIBILITY EFFECT
   * ====================================================================== */

  useEffect(() => {
    if (!isVisible) {
      if (reanimated) {
        reanimatedTranslateY.value = SCREEN.height;

        reanimatedBackdrop.value = 0;
      } else {
        translateY.setValue(SCREEN.height);

        backdropOpacityValue.setValue(0);
      }

      return;
    }

    openSheet(currentSnapIndexRef.current);
  }, [isVisible]);

  /* ========================================================================
   * ANDROID BACK BUTTON
   * ====================================================================== */

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeSheet();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [closeSheet, isVisible]);

  /* ========================================================================
   * PAN RESPONDER
   * ====================================================================== */

  const dragStartValue = useRef(0);

  const handleDragStart = useCallback(() => {
    dragStartValue.current = getTargetTranslateY(currentSnapIndexRef.current);

    if (typeof onDragStart === "function") {
      onDragStart(currentSnapIndexRef.current);
    }
  }, [getTargetTranslateY, onDragStart]);

  const handleDragMove = useCallback(
    (gesture) => {
      if (!allowDrag) {
        return;
      }

      const next = Math.max(0, dragStartValue.current + gesture.dy);

      if (reanimated) {
        reanimatedTranslateY.value = next;
      } else {
        translateY.setValue(next);
      }

      if (typeof onDrag === "function") {
        onDrag(next, gesture.dy);
      }
    },
    [allowDrag, onDrag, reanimated, reanimatedTranslateY, translateY],
  );

  const handleDragEnd = useCallback(
    (gesture) => {
      const current = dragStartValue.current + gesture.dy;

      const velocityY = gesture.vy || 0;

      const currentIndex = currentSnapIndexRef.current;

      if (
        allowSwipeDown &&
        closeOnSwipeDown &&
        (gesture.dy > swipeDownThreshold || velocityY > 1.2)
      ) {
        closeSheet();

        if (typeof onDragEnd === "function") {
          onDragEnd({
            closed: true,
            snapIndex: currentIndex,
            translationY: gesture.dy,
            velocityY,
          });
        }

        return;
      }

      let closestIndex = currentIndex;

      let closestDistance = Infinity;

      resolvedSnapPoints.forEach((_, index) => {
        const target = getTargetTranslateY(index);

        const distance = Math.abs(current - target);

        if (distance < closestDistance) {
          closestDistance = distance;

          closestIndex = index;
        }
      });

      if (gesture.dy > 50 && currentIndex > 0) {
        closestIndex = currentIndex - 1;
      }

      if (gesture.dy < -50 && currentIndex < resolvedSnapPoints.length - 1) {
        closestIndex = currentIndex + 1;
      }

      snapTo(closestIndex);

      if (typeof onDragEnd === "function") {
        onDragEnd({
          closed: false,
          snapIndex: closestIndex,
          translationY: gesture.dy,
          velocityY,
        });
      }
    },
    [
      allowSwipeDown,
      closeOnSwipeDown,
      closeSheet,
      getTargetTranslateY,
      onDragEnd,
      resolvedSnapPoints,
      snapTo,
      swipeDownThreshold,
    ],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => allowDrag,

        onMoveShouldSetPanResponder: (_, gesture) => {
          if (!allowDrag) {
            return false;
          }

          return Math.abs(gesture.dy) > 4;
        },

        onPanResponderGrant: handleDragStart,

        onPanResponderMove: (_, gesture) => handleDragMove(gesture),

        onPanResponderRelease: (_, gesture) => handleDragEnd(gesture),

        onPanResponderTerminate: (_, gesture) => handleDragEnd(gesture),

        onPanResponderTerminationRequest: () => false,
      }),
    [allowDrag, handleDragEnd, handleDragMove, handleDragStart],
  );

  /* ========================================================================
   * REANIMATED STYLES
   * ====================================================================== */

  const reanimatedSheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: reanimatedTranslateY.value,
      },
    ],
  }));

  const reanimatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: reanimatedBackdrop.value,
  }));

  /* ========================================================================
   * SAFE AREA
   * ====================================================================== */

  const bottomInset = safeArea ? (safeAreaBottom ?? insets.bottom) : 0;

  const topInset = safeArea && safeAreaTop ? insets.top : 0;

  /* ========================================================================
   * CONTENT PADDING
   * ====================================================================== */

  const finalContentPaddingLeft =
    contentPaddingLeft ?? contentPaddingHorizontal ?? contentPadding;

  const finalContentPaddingRight =
    contentPaddingRight ?? contentPaddingHorizontal ?? contentPadding;

  const finalContentPaddingTop =
    contentPaddingTop ?? contentPaddingVertical ?? contentPadding;

  const finalContentPaddingBottom =
    contentPaddingBottom ?? contentPaddingVertical ?? contentPadding;

  /* ========================================================================
   * HEADER PADDING
   * ====================================================================== */

  const finalHeaderPaddingLeft =
    headerPaddingLeft ?? headerPaddingHorizontal ?? headerPadding;

  const finalHeaderPaddingRight =
    headerPaddingRight ?? headerPaddingHorizontal ?? headerPadding;

  const finalHeaderPaddingTop =
    headerPaddingTop ?? headerPaddingVertical ?? headerPadding;

  const finalHeaderPaddingBottom =
    headerPaddingBottom ?? headerPaddingVertical ?? headerPadding;

  /* ========================================================================
   * FOOTER PADDING
   * ====================================================================== */

  const finalFooterPaddingLeft =
    footerPaddingLeft ?? footerPaddingHorizontal ?? footerPadding;

  const finalFooterPaddingRight =
    footerPaddingRight ?? footerPaddingHorizontal ?? footerPadding;

  const finalFooterPaddingTop =
    footerPaddingTop ?? footerPaddingVertical ?? footerPadding;

  const finalFooterPaddingBottom =
    footerPaddingBottom ?? footerPaddingVertical ?? footerPadding;

  /* ========================================================================
   * COLORS
   * ====================================================================== */

  const resolvedBackgroundColor =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedBorderColor = borderColor ?? colors.border ?? "#E5E5E5";

  const resolvedTitleColor = titleColor ?? colors.text ?? "#222222";

  const resolvedHandleColor = handleColor ?? colors.border ?? "#C8C8C8";

  const resolvedCloseIconColor = closeIconColor ?? colors.text ?? "#222222";

  const resolvedCloseBackgroundColor =
    closeButtonBackgroundColor ?? colors.surfaceSecondary ?? "#F2F2F2";

  /* ========================================================================
   * RADIUS
   * ====================================================================== */

  const resolvedRadius = borderRadius ?? themeRadius.xxl ?? 24;

  const finalTopLeftRadius = topLeftRadius ?? resolvedRadius;

  const finalTopRightRadius = topRightRadius ?? resolvedRadius;

  const finalBottomLeftRadius = bottomLeftRadius ?? resolvedRadius;

  const finalBottomRightRadius = bottomRightRadius ?? resolvedRadius;

  /* ========================================================================
   * SHEET STYLE
   * ====================================================================== */

  const sheetBaseStyle = {
    width,

    margin,

    marginHorizontal,

    marginBottom,

    backgroundColor: resolvedBackgroundColor,

    borderTopLeftRadius: finalTopLeftRadius,

    borderTopRightRadius: finalTopRightRadius,

    borderBottomLeftRadius: finalBottomLeftRadius,

    borderBottomRightRadius: finalBottomRightRadius,

    borderWidth,

    borderColor: resolvedBorderColor,

    padding,

    paddingHorizontal,

    paddingVertical,

    paddingTop: paddingTop + topInset,

    paddingBottom: paddingBottom + bottomInset,

    paddingLeft,

    paddingRight,

    ...(shadow
      ? {
          shadowColor,
          shadowOpacity,
          shadowRadius,
          shadowOffset,
          elevation,
        }
      : {
          shadowOpacity: 0,
          elevation: 0,
        }),
  };

  /* ========================================================================
   * HANDLE
   * ====================================================================== */

  const handleContent = showHandle ? (
    typeof renderHandle === "function" ? (
      renderHandle()
    ) : (
      <BottomSheetHandle
        width={handleWidth}
        height={handleHeight}
        color={resolvedHandleColor}
        marginTop={handleMarginTop}
        marginBottom={handleMarginBottom}
        style={handleStyle}
      />
    )
  ) : null;

  /* ========================================================================
   * HEADER
   * ====================================================================== */

  const headerContent =
    typeof renderHeader === "function" ? (
      renderHeader({
        snapIndex: currentSnapIndex,
        close: closeSheet,
      })
    ) : showHeader || title ? (
      <View
        style={[
          styles.header,

          headerHeight
            ? {
                minHeight: headerHeight,
              }
            : null,

          {
            paddingTop: finalHeaderPaddingTop,

            paddingBottom: finalHeaderPaddingBottom,

            paddingLeft: finalHeaderPaddingLeft,

            paddingRight: finalHeaderPaddingRight,
          },

          headerStyle,
        ]}
      >
        <View style={styles.headerTitleContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,

              {
                color: resolvedTitleColor,

                fontSize: titleFontSize,

                lineHeight: titleLineHeight,

                fontWeight: titleFontWeight,

                textAlign: titleAlign,
              },

              titleStyle,
            ]}
          >
            {title}
          </Text>
        </View>

        {showCloseButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onCloseButtonPress || closeSheet}
            style={[
              styles.closeButton,

              {
                width: closeButtonSize,

                height: closeButtonSize,

                borderRadius: closeButtonBorderRadius ?? closeButtonSize / 2,

                backgroundColor: resolvedCloseBackgroundColor,
              },

              closeButtonStyle,
            ]}
          >
            <RenderIcon
              icon={closeIcon}
              size={closeIconSize}
              color={resolvedCloseIconColor}
            />
          </Pressable>
        ) : null}
      </View>
    ) : null;

  /* ========================================================================
   * CONTENT
   * ====================================================================== */

  const contentElement = scrollable ? (
    <ScrollView
      style={[styles.scrollContent, contentStyle]}
      contentContainerStyle={[
        {
          paddingTop: finalContentPaddingTop,

          paddingBottom: finalContentPaddingBottom,

          paddingLeft: finalContentPaddingLeft,

          paddingRight: finalContentPaddingRight,
        },

        contentContainerStyle,
      ]}
      keyboardDismissMode={keyboardDismissMode}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,

        {
          paddingTop: finalContentPaddingTop,

          paddingBottom: finalContentPaddingBottom,

          paddingLeft: finalContentPaddingLeft,

          paddingRight: finalContentPaddingRight,
        },

        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  /* ========================================================================
   * FOOTER
   * ====================================================================== */

  const footerContent =
    typeof renderFooter === "function"
      ? renderFooter({
          snapIndex: currentSnapIndex,
          close: closeSheet,
        })
      : footer;

  /* ========================================================================
   * SHEET
   * ====================================================================== */

  const sheetContent = reanimated ? (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.sheet, sheetBaseStyle, reanimatedSheetStyle, style]}
    >
      {handleContent}

      {headerContent}

      {contentElement}

      {footerContent ? (
        <View
          style={[
            styles.footer,

            footerHeight
              ? {
                  minHeight: footerHeight,
                }
              : null,

            {
              paddingTop: finalFooterPaddingTop,

              paddingBottom: finalFooterPaddingBottom + bottomInset,

              paddingLeft: finalFooterPaddingLeft,

              paddingRight: finalFooterPaddingRight,
            },

            footerStyle,
          ]}
        >
          {footerContent}
        </View>
      ) : null}
    </Animated.View>
  ) : (
    <RNAnimated.View
      {...panResponder.panHandlers}
      style={[
        styles.sheet,

        sheetBaseStyle,

        {
          transform: [
            {
              translateY,
            },
          ],
        },

        style,
      ]}
    >
      {handleContent}

      {headerContent}

      {contentElement}

      {footerContent ? (
        <View
          style={[
            styles.footer,

            footerHeight
              ? {
                  minHeight: footerHeight,
                }
              : null,

            {
              paddingTop: finalFooterPaddingTop,

              paddingBottom: finalFooterPaddingBottom + bottomInset,

              paddingLeft: finalFooterPaddingLeft,

              paddingRight: finalFooterPaddingRight,
            },

            footerStyle,
          ]}
        >
          {footerContent}
        </View>
      ) : null}
    </RNAnimated.View>
  );

  /* ========================================================================
   * BACKDROP
   * ====================================================================== */

  let backdropContent = null;

  if (showBackdrop) {
    if (typeof renderBackdrop === "function") {
      backdropContent = renderBackdrop({
        close: closeSheet,
      });
    } else if (reanimated) {
      backdropContent = (
        <Animated.View
          style={[
            styles.backdrop,

            {
              backgroundColor: backdropColor,
            },

            reanimatedBackdropStyle,

            backdropStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeOnBackdropPress ? closeSheet : undefined}
          />
        </Animated.View>
      );
    } else {
      backdropContent = (
        <RNAnimated.View
          style={[
            styles.backdrop,

            {
              backgroundColor: backdropColor,

              opacity: backdropOpacityValue,
            },

            backdropStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeOnBackdropPress ? closeSheet : undefined}
          />
        </RNAnimated.View>
      );
    }
  }

  /* ========================================================================
   * RENDER
   * ====================================================================== */

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      hardwareAccelerated
      onRequestClose={closeSheet}
    >
      <View style={styles.portal}>
        {backdropContent}

        {sheetContent}
      </View>
    </Modal>
  );
});

/* ============================================================================
 * STYLES
 * ========================================================================== */

const styles = StyleSheet.create({
  portal: {
    flex: 1,

    width: "100%",

    height: "100%",

    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 0,
  },

  sheet: {
    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    zIndex: 2,

    overflow: "hidden",

    minHeight: 1,
  },

  handle: {
    alignSelf: "center",
  },

  header: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  headerTitleContainer: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  title: {
    includeFontPadding: false,
  },

  closeButton: {
    alignItems: "center",

    justifyContent: "center",

    marginLeft: 8,

    flexShrink: 0,
  },

  content: {
    width: "100%",
  },

  scrollContent: {
    width: "100%",

    flexGrow: 0,
  },

  footer: {
    width: "100%",
  },
});

/* ============================================================================
 * EXPORTS
 * ========================================================================== */

export {
  BottomSheetHandle,
  BottomSheetBackdrop,
  RenderIcon as UIBottomSheetIcon,
};

export default memo(UIBottomSheet);
