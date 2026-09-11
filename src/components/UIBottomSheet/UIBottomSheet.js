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
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme/UIProvider";

let Reanimated = null;

try {
  Reanimated = require("react-native-reanimated");
} catch {
  Reanimated = null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DEFAULT_SNAP_POINTS = ["50%"];

const resolveTheme = (theme) => {
  return {
    colors: theme?.colors || {},
    spacing: theme?.spacing || {},
    radius: theme?.radius || {},
    typography: theme?.typography || {},
    shadows: theme?.shadows || {},
    animation: theme?.animation || {},
    sizes: theme?.sizes || {},
  };
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const parseSnapPoint = (point, screenHeight = SCREEN_HEIGHT) => {
  if (typeof point === "number") {
    return clamp(point, 0, screenHeight);
  }

  if (typeof point === "string") {
    if (point.endsWith("%")) {
      const percentage = parseFloat(point);

      if (!Number.isNaN(percentage)) {
        return clamp((screenHeight * percentage) / 100, 0, screenHeight);
      }
    }

    const numeric = parseFloat(point);

    if (!Number.isNaN(numeric)) {
      return clamp(numeric, 0, screenHeight);
    }
  }

  return screenHeight * 0.5;
};

const getHeightFromSnapIndex = (
  snapPoints,
  index,
  screenHeight = SCREEN_HEIGHT,
) => {
  if (!snapPoints?.length) {
    return screenHeight * 0.5;
  }

  const safeIndex = clamp(index, 0, snapPoints.length - 1);

  return parseSnapPoint(snapPoints[safeIndex], screenHeight);
};

const getSnapIndexFromHeight = (
  height,
  snapPoints,
  screenHeight = SCREEN_HEIGHT,
) => {
  if (!snapPoints?.length) {
    return 0;
  }

  let closestIndex = 0;
  let closestDistance = Infinity;

  snapPoints.forEach((point, index) => {
    const pointHeight = parseSnapPoint(point, screenHeight);
    const distance = Math.abs(pointHeight - height);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

const getThemeValue = (value, fallback) => {
  return value !== undefined && value !== null ? value : fallback;
};

/* -------------------------------------------------------------------------- */
/* Handle                                                                      */
/* -------------------------------------------------------------------------- */

export const BottomSheetHandle = memo(function BottomSheetHandle({
  width = 40,
  height = 4,
  color = "#D0D0D0",
  style,
}) {
  return (
    <View
      style={[
        bottomSheetStyles.handle,
        {
          width,
          height,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Backdrop                                                                    */
/* -------------------------------------------------------------------------- */

export const BottomSheetBackdrop = memo(function BottomSheetBackdrop({
  opacity = 0.45,
  backgroundColor = "#000000",
  onPress,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        bottomSheetStyles.backdrop,
        {
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Close Icon                                                                   */
/* -------------------------------------------------------------------------- */

export const UIBottomSheetIcon = memo(function UIBottomSheetIcon({
  size = 22,
  color = "#555",
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size * 0.65,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
          borderRadius: 2,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: size * 0.65,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: "-45deg" }],
          borderRadius: 2,
        }}
      />
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Main Component                                                               */
/* -------------------------------------------------------------------------- */

export const UIBottomSheet = forwardRef(function UIBottomSheet(
  {
    /* Visibility ----------------------------------------------------------- */

    visible,
    defaultVisible = false,
    onVisibleChange,
    onOpen,
    onClose,

    /* Snap points ----------------------------------------------------------- */

    snapPoints = DEFAULT_SNAP_POINTS,
    initialSnapIndex = 0,

    /* Height ---------------------------------------------------------------- */

    height,
    minHeight,
    maxHeight,

    /* Width ----------------------------------------------------------------- */

    width = "100%",
    marginHorizontal = 0,
    marginBottom = 0,

    /* Padding --------------------------------------------------------------- */

    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,

    /* Appearance ------------------------------------------------------------ */

    backgroundColor,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderWidth = 0,
    borderColor,
    style,
    contentStyle,

    /* Backdrop -------------------------------------------------------------- */

    showBackdrop = true,
    backdropOpacity = 0.45,
    backdropColor = "#000000",
    closeOnBackdropPress = true,

    /* Handle ---------------------------------------------------------------- */

    showHandle = true,
    handleWidth = 40,
    handleHeight = 4,
    handleColor,
    handleStyle,

    /* Header ---------------------------------------------------------------- */

    header,
    title,
    titlePosition = "left",
    titleStyle,
    headerStyle,

    /* Close ----------------------------------------------------------------- */

    showClose = false,
    closeIcon,
    closeIconSize = 22,
    closeIconColor,
    onClosePress,

    /* Content --------------------------------------------------------------- */

    children,
    scrollable = true,
    keyboardShouldPersistTaps = "handled",
    contentContainerStyle,
    showsVerticalScrollIndicator = false,

    /* Footer ---------------------------------------------------------------- */

    footer,

    /* Safe area ------------------------------------------------------------- */

    safeArea = true,

    /* Animation ------------------------------------------------------------- */

    reanimated = false,
    animationDuration,
    springConfig,

    /* Drag ------------------------------------------------------------------ */

    draggable = true,
    closeOnDragDown = true,
    dragThreshold = 100,

    /* Android --------------------------------------------------------------- */

    enableBackHandler = true,

    /* Modal ----------------------------------------------------------------- */

    modalProps,

    /* Misc ------------------------------------------------------------------ */

    testID,
  },
  ref,
) {
  const { theme } = useUITheme();

  const { colors, spacing, radius, typography, shadows, animation } =
    resolveTheme(theme);

  /* ------------------------------------------------------------------------ */
  /* Theme defaults                                                           */
  /* ------------------------------------------------------------------------ */

  const resolvedBackgroundColor = getThemeValue(
    backgroundColor,
    colors.surface || colors.card || "#FFFFFF",
  );

  const resolvedBorderColor = getThemeValue(
    borderColor,
    colors.border || "#E5E5E5",
  );

  const resolvedHandleColor = getThemeValue(
    handleColor,
    colors.border || "#D0D0D0",
  );

  const resolvedCloseIconColor = getThemeValue(
    closeIconColor,
    colors.textSecondary || colors.text || "#555555",
  );

  const resolvedRadius = getThemeValue(borderRadius, radius?.xl || 18);

  const resolvedHeaderTitleStyle = {
    color: colors.text || "#111111",
    ...(typography?.h3 || {}),
    fontWeight: typography?.fontWeights?.semibold || "600",
  };

  /* ------------------------------------------------------------------------ */
  /* Visibility state                                                         */
  /* ------------------------------------------------------------------------ */

  const isControlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = isControlled ? visible : internalVisible;

  /* ------------------------------------------------------------------------ */
  /* Snap index                                                               */
  /* ------------------------------------------------------------------------ */

  const normalizedSnapPoints = useMemo(() => {
    if (!Array.isArray(snapPoints) || snapPoints.length === 0) {
      return DEFAULT_SNAP_POINTS;
    }

    return snapPoints;
  }, [snapPoints]);

  const safeInitialSnapIndex = clamp(
    initialSnapIndex,
    0,
    normalizedSnapPoints.length - 1,
  );

  const [snapIndex, setSnapIndex] = useState(safeInitialSnapIndex);

  /* ------------------------------------------------------------------------ */
  /* Animated values                                                          */
  /* ------------------------------------------------------------------------ */

  const resolvedAnimationDuration = getThemeValue(
    animationDuration,
    animation?.normal || 200,
  );

  const rnAnimatedHeight = useRef(
    new RNAnimated.Value(
      getHeightFromSnapIndex(normalizedSnapPoints, safeInitialSnapIndex),
    ),
  ).current;

  const rnBackdropOpacity = useRef(new RNAnimated.Value(0)).current;

  const reanimatedHeight = useRef(null);
  const reanimatedBackdropOpacity = useRef(null);

  if (Reanimated) {
    const { useSharedValue, useAnimatedStyle } = Reanimated;

    if (!reanimatedHeight.current) {
      reanimatedHeight.current = useSharedValue(
        getHeightFromSnapIndex(normalizedSnapPoints, safeInitialSnapIndex),
      );
    }

    if (!reanimatedBackdropOpacity.current) {
      reanimatedBackdropOpacity.current = useSharedValue(0);
    }

    void useAnimatedStyle;
  }

  const isMountedRef = useRef(false);
  const previousVisibleRef = useRef(isVisible);
  const currentHeightRef = useRef(
    getHeightFromSnapIndex(normalizedSnapPoints, safeInitialSnapIndex),
  );

  /* ------------------------------------------------------------------------ */
  /* Visibility setter                                                        */
  /* ------------------------------------------------------------------------ */

  const setVisibility = useCallback(
    (nextVisible) => {
      if (!isControlled) {
        setInternalVisible(nextVisible);
      }

      onVisibleChange?.(nextVisible);
    },
    [isControlled, onVisibleChange],
  );

  /* ------------------------------------------------------------------------ */
  /* Animation helpers                                                        */
  /* ------------------------------------------------------------------------ */

  const animateToHeight = useCallback(
    (targetHeight, callback) => {
      currentHeightRef.current = targetHeight;

      if (reanimated && Reanimated && reanimatedHeight.current) {
        const { withSpring, withTiming, runOnJS } = Reanimated;

        if (springConfig) {
          reanimatedHeight.current.value = withSpring(
            targetHeight,
            springConfig,
            callback
              ? (finished) => {
                  if (finished) {
                    runOnJS(callback)();
                  }
                }
              : undefined,
          );
        } else {
          reanimatedHeight.current.value = withTiming(
            targetHeight,
            {
              duration: resolvedAnimationDuration,
            },
            callback
              ? (finished) => {
                  if (finished) {
                    runOnJS(callback)();
                  }
                }
              : undefined,
          );
        }

        return;
      }

      if (springConfig) {
        RNAnimated.spring(rnAnimatedHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          ...springConfig,
        }).start(callback);
      } else {
        RNAnimated.timing(rnAnimatedHeight, {
          toValue: targetHeight,
          duration: resolvedAnimationDuration,
          useNativeDriver: false,
        }).start(callback);
      }
    },
    [reanimated, springConfig, resolvedAnimationDuration, rnAnimatedHeight],
  );

  const animateBackdrop = useCallback(
    (toValue, callback) => {
      if (reanimated && Reanimated && reanimatedBackdropOpacity.current) {
        const { withTiming, runOnJS } = Reanimated;

        reanimatedBackdropOpacity.current.value = withTiming(
          toValue,
          {
            duration: resolvedAnimationDuration,
          },
          callback
            ? (finished) => {
                if (finished) {
                  runOnJS(callback)();
                }
              }
            : undefined,
        );

        return;
      }

      RNAnimated.timing(rnBackdropOpacity, {
        toValue,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }).start(callback);
    },
    [reanimated, resolvedAnimationDuration, rnBackdropOpacity],
  );

  /* ------------------------------------------------------------------------ */
  /* Open                                                                      */
  /* ------------------------------------------------------------------------ */

  const open = useCallback(
    (index = safeInitialSnapIndex) => {
      const nextIndex = clamp(index, 0, normalizedSnapPoints.length - 1);

      const nextHeight =
        height !== undefined
          ? height
          : getHeightFromSnapIndex(normalizedSnapPoints, nextIndex);

      const wasVisible = isVisible;

      setSnapIndex(nextIndex);
      setVisibility(true);

      if (!wasVisible) {
        onOpen?.();
      }

      animateToHeight(nextHeight);
      animateBackdrop(showBackdrop ? backdropOpacity : 0);
    },
    [
      safeInitialSnapIndex,
      normalizedSnapPoints,
      height,
      isVisible,
      setVisibility,
      onOpen,
      animateToHeight,
      animateBackdrop,
      showBackdrop,
      backdropOpacity,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Close                                                                     */
  /* ------------------------------------------------------------------------ */

  const close = useCallback(() => {
    animateBackdrop(0, () => {
      setVisibility(false);
      onClose?.();
    });
  }, [animateBackdrop, setVisibility, onClose]);

  /* ------------------------------------------------------------------------ */
  /* Snap                                                                      */
  /* ------------------------------------------------------------------------ */

  const snapTo = useCallback(
    (index) => {
      const nextIndex = clamp(index, 0, normalizedSnapPoints.length - 1);

      setSnapIndex(nextIndex);

      const nextHeight =
        height !== undefined
          ? height
          : getHeightFromSnapIndex(normalizedSnapPoints, nextIndex);

      animateToHeight(nextHeight);
    },
    [normalizedSnapPoints, height, animateToHeight],
  );

  const expand = useCallback(() => {
    snapTo(normalizedSnapPoints.length - 1);
  }, [snapTo, normalizedSnapPoints]);

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, close, open]);

  const getCurrentSnapIndex = useCallback(() => {
    return snapIndex;
  }, [snapIndex]);

  /* ------------------------------------------------------------------------ */
  /* Imperative API                                                           */
  /* ------------------------------------------------------------------------ */

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      toggle,
      snapTo,
      expand,
      collapse,
      getSnapIndex: getCurrentSnapIndex,
    }),
    [open, close, toggle, snapTo, expand, collapse, getCurrentSnapIndex],
  );

  /* ------------------------------------------------------------------------ */
  /* Visibility effect                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const wasVisible = previousVisibleRef.current;

    if (isVisible && !wasVisible) {
      const targetHeight =
        height !== undefined
          ? height
          : getHeightFromSnapIndex(normalizedSnapPoints, snapIndex);

      animateToHeight(targetHeight);
      animateBackdrop(showBackdrop ? backdropOpacity : 0);
    }

    if (!isVisible && wasVisible) {
      animateBackdrop(0);
    }

    previousVisibleRef.current = isVisible;
  }, [
    isVisible,
    height,
    normalizedSnapPoints,
    snapIndex,
    animateToHeight,
    animateBackdrop,
    showBackdrop,
    backdropOpacity,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Open initial state                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Android back button                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (Platform.OS !== "android" || !enableBackHandler || !isVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        close();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [enableBackHandler, isVisible, close]);

  /* ------------------------------------------------------------------------ */
  /* Drag                                                                      */
  /* ------------------------------------------------------------------------ */

  const dragStartHeightRef = useRef(currentHeightRef.current);

  const panResponder = useMemo(() => {
    if (!draggable) {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => false,
      });
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },

      onPanResponderGrant: () => {
        dragStartHeightRef.current = currentHeightRef.current;

        if (!reanimated || !Reanimated) {
          rnAnimatedHeight.stopAnimation((value) => {
            currentHeightRef.current = value;
            dragStartHeightRef.current = value;
          });
        }
      },

      onPanResponderMove: (_, gestureState) => {
        const nextHeight = clamp(
          dragStartHeightRef.current - gestureState.dy,
          0,
          SCREEN_HEIGHT,
        );

        currentHeightRef.current = nextHeight;

        if (reanimated && Reanimated && reanimatedHeight.current) {
          reanimatedHeight.current.value = nextHeight;
        } else {
          rnAnimatedHeight.setValue(nextHeight);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const draggedDown = gestureState.dy > dragThreshold;

        if (draggedDown && closeOnDragDown) {
          close();
          return;
        }

        const targetIndex = getSnapIndexFromHeight(
          currentHeightRef.current,
          normalizedSnapPoints,
        );

        snapTo(targetIndex);
      },
    });
  }, [
    draggable,
    reanimated,
    rnAnimatedHeight,
    close,
    closeOnDragDown,
    dragThreshold,
    normalizedSnapPoints,
    snapTo,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Reanimated styles                                                        */
  /* ------------------------------------------------------------------------ */

  let reanimatedSheetStyle = null;
  let reanimatedBackdropStyle = null;

  if (
    reanimated &&
    Reanimated &&
    reanimatedHeight.current &&
    reanimatedBackdropOpacity.current
  ) {
    const { useAnimatedStyle } = Reanimated;

    reanimatedSheetStyle = useAnimatedStyle(
      () => ({
        height: reanimatedHeight.current.value,
      }),
      [],
    );

    reanimatedBackdropStyle = useAnimatedStyle(
      () => ({
        opacity: reanimatedBackdropOpacity.current.value,
      }),
      [],
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Sheet height                                                              */
  /* ------------------------------------------------------------------------ */

  const calculatedHeight = useMemo(() => {
    let result;

    if (height !== undefined) {
      result = height;
    } else {
      result = getHeightFromSnapIndex(normalizedSnapPoints, snapIndex);
    }

    if (typeof result === "number") {
      if (minHeight !== undefined) {
        result = Math.max(result, minHeight);
      }

      if (maxHeight !== undefined) {
        result = Math.min(result, maxHeight);
      }
    }

    return result;
  }, [height, normalizedSnapPoints, snapIndex, minHeight, maxHeight]);

  /* ------------------------------------------------------------------------ */
  /* Padding                                                                   */
  /* ------------------------------------------------------------------------ */

  const resolvedPadding = getThemeValue(padding, spacing?.lg || 16);

  const resolvedPaddingHorizontal =
    paddingHorizontal !== undefined ? paddingHorizontal : resolvedPadding;

  const resolvedPaddingVertical =
    paddingVertical !== undefined ? paddingVertical : resolvedPadding;

  const resolvedPaddingTop =
    paddingTop !== undefined ? paddingTop : resolvedPaddingVertical;

  const resolvedPaddingBottom =
    paddingBottom !== undefined ? paddingBottom : resolvedPaddingVertical;

  const resolvedPaddingLeft =
    paddingLeft !== undefined ? paddingLeft : resolvedPaddingHorizontal;

  const resolvedPaddingRight =
    paddingRight !== undefined ? paddingRight : resolvedPaddingHorizontal;

  /* ------------------------------------------------------------------------ */
  /* Header title positioning                                                  */
  /* ------------------------------------------------------------------------ */

  const normalizedTitlePosition =
    titlePosition === "center" || titlePosition === "right"
      ? titlePosition
      : "left";

  /* ------------------------------------------------------------------------ */
  /* Header                                                                    */
  /* ------------------------------------------------------------------------ */

  const renderHeader = () => {
    if (header) {
      return header;
    }

    if (!title && !showClose) {
      return null;
    }

    return (
      <View
        style={[
          bottomSheetStyles.header,
          {
            position:
              normalizedTitlePosition === "center" ? "relative" : "relative",
          },
          headerStyle,
        ]}
      >
        {title ? (
          <Text
            numberOfLines={1}
            style={[
              bottomSheetStyles.title,
              resolvedHeaderTitleStyle,
              normalizedTitlePosition === "left" && {
                textAlign: "left",
              },
              normalizedTitlePosition === "center" && {
                textAlign: "center",
                position: "absolute",
                left: 0,
                right: 0,
              },
              normalizedTitlePosition === "right" && {
                textAlign: "right",
                flex: 1,
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}

        {showClose ? (
          <Pressable
            onPress={onClosePress || close}
            hitSlop={10}
            style={[
              bottomSheetStyles.closeButton,
              normalizedTitlePosition === "left" && {
                marginLeft: "auto",
              },
              normalizedTitlePosition === "center" && {
                marginLeft: "auto",
              },
              normalizedTitlePosition === "right" && {
                marginLeft: 12,
              },
            ]}
          >
            {closeIcon || (
              <UIBottomSheetIcon
                size={closeIconSize}
                color={resolvedCloseIconColor}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Content                                                                   */
  /* ------------------------------------------------------------------------ */

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={bottomSheetStyles.scrollView}
          contentContainerStyle={[
            bottomSheetStyles.scrollContent,
            {
              paddingTop: resolvedPaddingTop,
              paddingBottom: resolvedPaddingBottom,
              paddingLeft: resolvedPaddingLeft,
              paddingRight: resolvedPaddingRight,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View
        style={[
          bottomSheetStyles.nonScrollContent,
          {
            paddingTop: resolvedPaddingTop,
            paddingBottom: resolvedPaddingBottom,
            paddingLeft: resolvedPaddingLeft,
            paddingRight: resolvedPaddingRight,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Animated styles                                                          */
  /* ------------------------------------------------------------------------ */

  const normalSheetStyle = {
    height: calculatedHeight,
  };

  const sheetAnimatedStyle =
    reanimated && reanimatedSheetStyle
      ? reanimatedSheetStyle
      : normalSheetStyle;

  const backdropAnimatedStyle =
    reanimated && reanimatedBackdropStyle
      ? reanimatedBackdropStyle
      : {
          opacity: rnBackdropOpacity,
        };

  /* ------------------------------------------------------------------------ */
  /* Sheet                                                                     */
  /* ------------------------------------------------------------------------ */

  const sheet = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={bottomSheetStyles.keyboardContainer}
      pointerEvents="box-none"
    >
      <View
        style={[
          bottomSheetStyles.sheetWrapper,
          {
            width,
            marginHorizontal,
            marginBottom,
          },
        ]}
        pointerEvents="box-none"
      >
        <RNAnimated.View
          testID={testID}
          {...panResponder.panHandlers}
          style={[
            bottomSheetStyles.sheet,
            {
              backgroundColor: resolvedBackgroundColor,

              borderRadius: resolvedRadius,

              borderTopLeftRadius:
                borderTopLeftRadius !== undefined
                  ? borderTopLeftRadius
                  : resolvedRadius,

              borderTopRightRadius:
                borderTopRightRadius !== undefined
                  ? borderTopRightRadius
                  : resolvedRadius,

              borderWidth,

              borderColor:
                borderWidth > 0 ? resolvedBorderColor : "transparent",

              paddingHorizontal: 0,

              paddingTop: 0,

              paddingBottom: safeArea ? (Platform.OS === "ios" ? 0 : 0) : 0,
            },

            shadows?.lg,

            style,

            sheetAnimatedStyle,
          ]}
        >
          {showHandle ? (
            <View style={bottomSheetStyles.handleContainer}>
              <BottomSheetHandle
                width={handleWidth}
                height={handleHeight}
                color={resolvedHandleColor}
                style={handleStyle}
              />
            </View>
          ) : null}

          {renderHeader()}

          {renderContent()}

          {footer ? (
            <View
              style={[
                bottomSheetStyles.footer,
                {
                  paddingLeft: resolvedPaddingLeft,
                  paddingRight: resolvedPaddingRight,
                  paddingBottom: safeArea
                    ? Math.max(resolvedPaddingBottom, spacing?.md || 12)
                    : resolvedPaddingBottom,
                },
              ]}
            >
              {footer}
            </View>
          ) : null}
        </RNAnimated.View>
      </View>
    </KeyboardAvoidingView>
  );

  /* ------------------------------------------------------------------------ */
  /* Modal                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <Modal
      transparent
      visible={!!isVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (Platform.OS === "android") {
          close();
        }
      }}
      {...modalProps}
    >
      <View style={bottomSheetStyles.modalRoot} pointerEvents="box-none">
        {showBackdrop ? (
          <RNAnimated.View
            style={[bottomSheetStyles.backdrop, backdropAnimatedStyle]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeOnBackdropPress ? close : undefined}
            />
          </RNAnimated.View>
        ) : null}

        {sheet}
      </View>
    </Modal>
  );
});

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const bottomSheetStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  keyboardContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },

  sheetWrapper: {
    alignSelf: "center",
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    width: "100%",
    overflow: "hidden",
  },

  handleContainer: {
    width: "100%",
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  handle: {
    borderRadius: 999,
  },

  header: {
    minHeight: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  title: {
    flexShrink: 1,
  },

  closeButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    flexGrow: 1,
  },

  nonScrollContent: {
    width: "100%",
  },

  footer: {
    width: "100%",
  },
});

export default memo(UIBottomSheet);
