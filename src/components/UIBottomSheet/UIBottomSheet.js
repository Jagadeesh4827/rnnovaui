import React, {
  forwardRef,
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

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUITheme } from "../../theme/UIProvider";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resolveSnapPoint(point, availableHeight) {
  if (typeof point === "number") {
    if (point > 0 && point <= 1) {
      return availableHeight * point;
    }

    return point;
  }

  if (typeof point === "string") {
    const value = point.trim();

    if (value.endsWith("%")) {
      const percentage = parseFloat(value);

      if (!Number.isNaN(percentage)) {
        return availableHeight * (percentage / 100);
      }
    }

    const numeric = parseFloat(value);

    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return availableHeight;
}

function normalizeSnapPoints(snapPoints, availableHeight) {
  const source =
    Array.isArray(snapPoints) && snapPoints.length
      ? snapPoints
      : [availableHeight];

  const values = source
    .map((point) => resolveSnapPoint(point, availableHeight))
    .filter((point) => Number.isFinite(point) && point > 0)
    .map((point) => clamp(point, 1, availableHeight))
    .sort((a, b) => a - b);

  return values.length ? values : [availableHeight];
}

/* -------------------------------------------------------------------------- */
/* Handle                                                                     */
/* -------------------------------------------------------------------------- */

export function BottomSheetHandle({
  width = 40,
  height = 4,
  color,
  borderRadius = 999,
  style,
}) {
  const { theme } = useUITheme();

  const resolvedColor =
    color ?? theme?.colors?.borderStrong ?? theme?.colors?.border ?? "#CCCCCC";

  return (
    <View
      pointerEvents="none"
      style={[
        styles.handle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: resolvedColor,
        },
        style,
      ]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Backdrop                                                                   */
/* -------------------------------------------------------------------------- */

export function BottomSheetBackdrop({
  visible = true,
  opacity = 0.5,
  color = "#000000",
  onPress,
  style,
}) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close bottom sheet"
      onPress={onPress}
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

export function UIBottomSheetIcon({ name, size = 24, color, style }) {
  const { theme } = useUITheme();

  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? theme?.colors?.text ?? "#111111"}
      style={style}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const UIBottomSheet = forwardRef(function UIBottomSheet(
  {
    /* -------------------------------------------------------------------- */
    /* Visibility                                                           */
    /* -------------------------------------------------------------------- */

    visible,
    defaultVisible = false,
    onVisibleChange,
    onOpen,
    onClose,

    /* -------------------------------------------------------------------- */
    /* Height                                                                */
    /* -------------------------------------------------------------------- */

    snapPoints = ["50%"],
    initialSnapIndex = 0,

    height,
    minHeight = 120,
    maxHeight,

    /* -------------------------------------------------------------------- */
    /* Width                                                                 */
    /* -------------------------------------------------------------------- */

    width = "100%",
    marginHorizontal = 0,
    marginBottom = 0,

    /* -------------------------------------------------------------------- */
    /* Padding                                                               */
    /* -------------------------------------------------------------------- */

    padding = 0,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,

    /* -------------------------------------------------------------------- */
    /* Appearance                                                            */
    /* -------------------------------------------------------------------- */

    backgroundColor,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,

    borderWidth = 0,
    borderColor,

    style,
    contentStyle,

    /* -------------------------------------------------------------------- */
    /* Backdrop                                                              */
    /* -------------------------------------------------------------------- */

    showBackdrop = true,
    backdropOpacity = 0.5,
    backdropColor = "#000000",
    closeOnBackdropPress = true,

    /* -------------------------------------------------------------------- */
    /* Handle                                                                */
    /* -------------------------------------------------------------------- */

    showHandle = true,
    handleWidth = 40,
    handleHeight = 4,
    handleColor,
    handleStyle,

    /* -------------------------------------------------------------------- */
    /* Header                                                                */
    /* -------------------------------------------------------------------- */

    header,
    title,
    titleStyle,

    showClose = false,
    closeIcon = "close",
    closeIconSize = 24,
    closeIconColor,

    onClosePress,
    headerStyle,

    /* -------------------------------------------------------------------- */
    /* Footer                                                                */
    /* -------------------------------------------------------------------- */

    footer,

    /* -------------------------------------------------------------------- */
    /* Content                                                               */
    /* -------------------------------------------------------------------- */

    children,

    scrollable = true,
    keyboardShouldPersistTaps = "handled",

    contentContainerStyle,

    showsVerticalScrollIndicator = false,

    /* -------------------------------------------------------------------- */
    /* Safe Area                                                             */
    /* -------------------------------------------------------------------- */

    safeArea = true,

    /* -------------------------------------------------------------------- */
    /* Animation                                                             */
    /* -------------------------------------------------------------------- */

    reanimated = true,

    animationDuration = 280,

    springConfig,

    /* -------------------------------------------------------------------- */
    /* Drag                                                                  */
    /* -------------------------------------------------------------------- */

    draggable = true,
    closeOnDragDown = true,
    dragThreshold = 120,

    /* -------------------------------------------------------------------- */
    /* Android                                                               */
    /* -------------------------------------------------------------------- */

    enableBackHandler = true,

    /* -------------------------------------------------------------------- */
    /* Misc                                                                  */
    /* -------------------------------------------------------------------- */

    modalProps,
    testID,
  },
  ref,
) {
  const { theme } = useUITheme();
  const insets = useSafeAreaInsets();

  const colors = theme?.colors ?? {};
  const radius = theme?.radius ?? {};
  const shadows = theme?.shadows ?? {};
  const animation = theme?.animation ?? {};

  /* ---------------------------------------------------------------------- */
  /* Visibility                                                             */
  /* ---------------------------------------------------------------------- */

  const isControlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = isControlled ? visible : internalVisible;

  const [modalVisible, setModalVisible] = useState(isVisible);

  const mountedRef = useRef(false);
  const previousVisibleRef = useRef(isVisible);

  /* ---------------------------------------------------------------------- */
  /* Height                                                                 */
  /* ---------------------------------------------------------------------- */

  const availableHeight = useMemo(() => {
    let value =
      typeof height === "number" && height > 0 ? height : SCREEN_HEIGHT;

    if (typeof maxHeight === "number") {
      value = Math.min(value, maxHeight);
    }

    if (typeof minHeight === "number") {
      value = Math.max(value, minHeight);
    }

    return value;
  }, [height, minHeight, maxHeight]);

  /* ---------------------------------------------------------------------- */
  /* Snap points                                                            */
  /* ---------------------------------------------------------------------- */

  const resolvedSnapPoints = useMemo(
    () => normalizeSnapPoints(snapPoints, availableHeight),
    [snapPoints, availableHeight],
  );

  const safeInitialSnapIndex = clamp(
    initialSnapIndex,
    0,
    Math.max(resolvedSnapPoints.length - 1, 0),
  );

  const currentSnapIndexRef = useRef(safeInitialSnapIndex);

  const currentSnapHeightRef = useRef(
    resolvedSnapPoints[safeInitialSnapIndex] ?? availableHeight,
  );

  /* ---------------------------------------------------------------------- */
  /* Native Animated                                                        */
  /* ---------------------------------------------------------------------- */

  const nativeTranslateY = useRef(new RNAnimated.Value(SCREEN_HEIGHT)).current;

  const nativeBackdropOpacity = useRef(new RNAnimated.Value(0)).current;

  /* ---------------------------------------------------------------------- */
  /* Reanimated                                                             */
  /* ---------------------------------------------------------------------- */

  const translateY = useSharedValue(SCREEN_HEIGHT);

  const backdropProgress = useSharedValue(0);

  /* ---------------------------------------------------------------------- */
  /* Theme values                                                           */
  /* ---------------------------------------------------------------------- */

  const resolvedBackgroundColor =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedBorderColor = borderColor ?? colors.border ?? "#E5E5E5";

  const resolvedRadius = borderRadius ?? radius.xl ?? 18;

  const resolvedTextColor = colors.text ?? "#111111";

  const resolvedCloseColor = closeIconColor ?? colors.text ?? "#111111";

  /* ---------------------------------------------------------------------- */
  /* Visibility callback                                                    */
  /* ---------------------------------------------------------------------- */

  const changeVisibility = useCallback(
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

  /* ---------------------------------------------------------------------- */
  /* Native OPEN                                                            */
  /* ---------------------------------------------------------------------- */

  const nativeOpen = useCallback(
    (targetHeight) => {
      const targetTranslate = availableHeight - targetHeight;

      nativeTranslateY.setValue(SCREEN_HEIGHT);

      nativeBackdropOpacity.setValue(0);

      RNAnimated.parallel([
        RNAnimated.spring(nativeTranslateY, {
          toValue: targetTranslate,

          useNativeDriver: true,

          damping: springConfig?.damping ?? 18,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,
        }),

        RNAnimated.timing(nativeBackdropOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [
      availableHeight,
      nativeTranslateY,
      nativeBackdropOpacity,
      springConfig,
      animationDuration,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Native CLOSE                                                           */
  /* ---------------------------------------------------------------------- */

  const nativeClose = useCallback(
    (callback) => {
      RNAnimated.parallel([
        RNAnimated.timing(nativeTranslateY, {
          toValue: SCREEN_HEIGHT,

          duration: animationDuration,

          useNativeDriver: true,
        }),

        RNAnimated.timing(nativeBackdropOpacity, {
          toValue: 0,

          duration: animationDuration,

          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && typeof callback === "function") {
          callback();
        }
      });
    },
    [nativeTranslateY, nativeBackdropOpacity, animationDuration],
  );

  /* ---------------------------------------------------------------------- */
  /* Reanimated OPEN                                                        */
  /* ---------------------------------------------------------------------- */

  const reanimatedOpen = useCallback(
    (targetHeight) => {
      const targetTranslate = availableHeight - targetHeight;

      translateY.value = withSpring(targetTranslate, {
        damping: springConfig?.damping ?? animation?.spring?.damping ?? 18,

        stiffness:
          springConfig?.stiffness ?? animation?.spring?.stiffness ?? 180,

        mass: springConfig?.mass ?? animation?.spring?.mass ?? 0.8,
      });

      backdropProgress.value = withTiming(1, {
        duration: animationDuration,
      });
    },
    [
      availableHeight,
      translateY,
      backdropProgress,
      springConfig,
      animation,
      animationDuration,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Complete close                                                         */
  /* ---------------------------------------------------------------------- */

  const finishClose = useCallback(() => {
    setModalVisible(false);

    if (typeof onClose === "function") {
      onClose();
    }
  }, [onClose]);

  /* ---------------------------------------------------------------------- */
  /* Reanimated CLOSE                                                       */
  /* ---------------------------------------------------------------------- */

  const reanimatedClose = useCallback(() => {
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      {
        duration: animationDuration,
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );

    backdropProgress.value = withTiming(0, {
      duration: animationDuration,
    });
  }, [translateY, backdropProgress, animationDuration, finishClose]);

  /* ---------------------------------------------------------------------- */
  /* Animate OPEN                                                           */
  /* ---------------------------------------------------------------------- */

  const animateOpen = useCallback(
    (targetHeight) => {
      setModalVisible(true);

      if (reanimated) {
        reanimatedOpen(targetHeight);
      } else {
        nativeOpen(targetHeight);
      }
    },
    [reanimated, reanimatedOpen, nativeOpen],
  );

  /* ---------------------------------------------------------------------- */
  /* Animate CLOSE                                                          */
  /* ---------------------------------------------------------------------- */

  const animateClose = useCallback(() => {
    if (reanimated) {
      reanimatedClose();
    } else {
      nativeClose(finishClose);
    }
  }, [reanimated, reanimatedClose, nativeClose, finishClose]);

  /* ---------------------------------------------------------------------- */
  /* OPEN                                                                    */
  /* ---------------------------------------------------------------------- */

  const open = useCallback(
    (snapIndex = currentSnapIndexRef.current) => {
      const safeIndex = clamp(
        snapIndex,
        0,
        Math.max(resolvedSnapPoints.length - 1, 0),
      );

      const targetHeight = resolvedSnapPoints[safeIndex] ?? availableHeight;

      currentSnapIndexRef.current = safeIndex;

      currentSnapHeightRef.current = targetHeight;

      changeVisibility(true);

      animateOpen(targetHeight);

      if (!isVisible && typeof onOpen === "function") {
        onOpen();
      }
    },
    [
      resolvedSnapPoints,
      availableHeight,
      changeVisibility,
      animateOpen,
      isVisible,
      onOpen,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* CLOSE                                                                   */
  /* ---------------------------------------------------------------------- */

  const close = useCallback(() => {
    if (!modalVisible) {
      changeVisibility(false);
      return;
    }

    changeVisibility(false);

    animateClose();
  }, [modalVisible, changeVisibility, animateClose]);

  /* ---------------------------------------------------------------------- */
  /* TOGGLE                                                                  */
  /* ---------------------------------------------------------------------- */

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, close, open]);

  /* ---------------------------------------------------------------------- */
  /* SNAP                                                                    */
  /* ---------------------------------------------------------------------- */

  const snapTo = useCallback(
    (index) => {
      const safeIndex = clamp(
        index,
        0,
        Math.max(resolvedSnapPoints.length - 1, 0),
      );

      const targetHeight = resolvedSnapPoints[safeIndex] ?? availableHeight;

      currentSnapIndexRef.current = safeIndex;

      currentSnapHeightRef.current = targetHeight;

      if (!isVisible) {
        open(safeIndex);
        return;
      }

      const targetTranslate = availableHeight - targetHeight;

      if (reanimated) {
        translateY.value = withSpring(targetTranslate, {
          damping: springConfig?.damping ?? animation?.spring?.damping ?? 18,

          stiffness:
            springConfig?.stiffness ?? animation?.spring?.stiffness ?? 180,

          mass: springConfig?.mass ?? animation?.spring?.mass ?? 0.8,
        });
      } else {
        RNAnimated.spring(nativeTranslateY, {
          toValue: targetTranslate,

          useNativeDriver: true,

          damping: springConfig?.damping ?? 18,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,
        }).start();
      }
    },
    [
      resolvedSnapPoints,
      availableHeight,
      isVisible,
      open,
      reanimated,
      translateY,
      nativeTranslateY,
      springConfig,
      animation,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* EXPAND                                                                 */
  /* ---------------------------------------------------------------------- */

  const expand = useCallback(() => {
    snapTo(resolvedSnapPoints.length - 1);
  }, [snapTo, resolvedSnapPoints.length]);

  /* ---------------------------------------------------------------------- */
  /* COLLAPSE                                                               */
  /* ---------------------------------------------------------------------- */

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  /* ---------------------------------------------------------------------- */
  /* Imperative API                                                         */
  /* ---------------------------------------------------------------------- */

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      toggle,
      snapTo,
      expand,
      collapse,
      getSnapIndex: () => currentSnapIndexRef.current,
    }),
    [open, close, toggle, snapTo, expand, collapse],
  );

  /* ---------------------------------------------------------------------- */
  /* Controlled visible                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const previous = previousVisibleRef.current;

    previousVisibleRef.current = isVisible;

    /*
     * First render.
     */
    if (!mountedRef.current) {
      mountedRef.current = true;

      if (isVisible) {
        setModalVisible(true);

        const timer = setTimeout(() => {
          animateOpen(currentSnapHeightRef.current);

          if (typeof onOpen === "function") {
            onOpen();
          }
        }, 20);

        return () => clearTimeout(timer);
      }

      return undefined;
    }

    /*
     * false -> true
     */
    if (isVisible && !previous) {
      setModalVisible(true);

      const timer = setTimeout(() => {
        animateOpen(currentSnapHeightRef.current);

        if (typeof onOpen === "function") {
          onOpen();
        }
      }, 20);

      return () => clearTimeout(timer);
    }

    /*
     * true -> false
     */
    if (!isVisible && previous) {
      animateClose();
    }

    return undefined;
  }, [isVisible, animateOpen, animateClose, onOpen]);

  /* ---------------------------------------------------------------------- */
  /* Android back                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!modalVisible || !enableBackHandler) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        close();
        return true;
      },
    );

    return () => subscription.remove();
  }, [modalVisible, enableBackHandler, close]);

  /* ---------------------------------------------------------------------- */
  /* Drag                                                                    */
  /* ---------------------------------------------------------------------- */

  const dragStartRef = useRef(0);

  const panResponder = useMemo(() => {
    if (!draggable) {
      return null;
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,

      onPanResponderGrant: () => {
        if (reanimated) {
          dragStartRef.current = translateY.value;
        } else {
          nativeTranslateY.stopAnimation((value) => {
            dragStartRef.current = value;
          });
        }
      },

      onPanResponderMove: (_, gesture) => {
        const next = dragStartRef.current + gesture.dy;

        const value = clamp(next, 0, SCREEN_HEIGHT);

        if (reanimated) {
          translateY.value = value;
        } else {
          nativeTranslateY.setValue(value);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (closeOnDragDown && gesture.dy > dragThreshold) {
          close();
          return;
        }

        const current = reanimated
          ? translateY.value
          : dragStartRef.current + gesture.dy;

        let nearestIndex = 0;
        let nearestDistance = Infinity;

        resolvedSnapPoints.forEach((snapHeight, index) => {
          const snapTranslate = availableHeight - snapHeight;

          const distance = Math.abs(current - snapTranslate);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        snapTo(nearestIndex);
      },

      onPanResponderTerminate: () => {
        snapTo(currentSnapIndexRef.current);
      },
    });
  }, [
    draggable,
    reanimated,
    translateY,
    nativeTranslateY,
    closeOnDragDown,
    dragThreshold,
    close,
    resolvedSnapPoints,
    availableHeight,
    snapTo,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Animated styles                                                        */
  /* ---------------------------------------------------------------------- */

  const reanimatedSheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const reanimatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value,
  }));

  /* ---------------------------------------------------------------------- */
  /* Padding                                                                */
  /* ---------------------------------------------------------------------- */

  const finalPaddingHorizontal = paddingHorizontal ?? padding;

  const finalPaddingVertical = paddingVertical ?? padding;

  const finalPaddingTop = paddingTop ?? finalPaddingVertical;

  const finalPaddingBottom = paddingBottom ?? finalPaddingVertical;

  const finalPaddingLeft = paddingLeft ?? finalPaddingHorizontal;

  const finalPaddingRight = paddingRight ?? finalPaddingHorizontal;

  /* ---------------------------------------------------------------------- */
  /* Sheet style                                                            */
  /* ---------------------------------------------------------------------- */

  const sheetHeight = clamp(
    availableHeight,
    minHeight,
    maxHeight ?? availableHeight,
  );

  const sheetStyle = [
    styles.sheet,

    {
      width,
      height: sheetHeight,

      marginHorizontal,
      marginBottom,

      backgroundColor: resolvedBackgroundColor,

      borderRadius: resolvedRadius,

      borderTopLeftRadius: borderTopLeftRadius ?? resolvedRadius,

      borderTopRightRadius: borderTopRightRadius ?? resolvedRadius,

      borderWidth,
      borderColor: resolvedBorderColor,

      paddingTop: finalPaddingTop,

      paddingBottom: finalPaddingBottom + (safeArea ? insets.bottom : 0),

      paddingLeft: finalPaddingLeft,

      paddingRight: finalPaddingRight,

      ...(shadows?.md ?? {}),
    },

    style,
  ];

  /* ---------------------------------------------------------------------- */
  /* Header                                                                 */
  /* ---------------------------------------------------------------------- */

  const renderHeader = () => {
    if (header) {
      return <View style={[styles.header, headerStyle]}>{header}</View>;
    }

    if (!title && !showClose) {
      return null;
    }

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerTitle}>
          {typeof title === "string" ? (
            <Text
              style={[
                styles.title,
                {
                  color: resolvedTextColor,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            title
          )}
        </View>

        {showClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={() => {
              if (typeof onClosePress === "function") {
                onClosePress();
              } else {
                close();
              }
            }}
            style={styles.closeButton}
          >
            <Ionicons
              name={closeIcon}
              size={closeIconSize}
              color={resolvedCloseColor}
            />
          </Pressable>
        ) : null}
      </View>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Content                                                                */
  /* ---------------------------------------------------------------------- */

  const sheetContent = (
    <>
      {showHandle ? (
        <View style={styles.handleContainer}>
          <BottomSheetHandle
            width={handleWidth}
            height={handleHeight}
            color={handleColor}
            style={handleStyle}
          />
        </View>
      ) : null}

      {renderHeader()}

      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            contentStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[styles.nonScrollContent, contentContainerStyle, contentStyle]}
        >
          {children}
        </View>
      )}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  /* ---------------------------------------------------------------------- */
  /* Backdrop press                                                         */
  /* ---------------------------------------------------------------------- */

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      close();
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Do not render Modal when closed                                        */
  /* ---------------------------------------------------------------------- */

  if (!modalVisible) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
      {...modalProps}
    >
      <View testID={testID} style={styles.modalRoot}>
        {showBackdrop ? (
          reanimated ? (
            <Animated.View
              style={[
                styles.backdrop,
                {
                  backgroundColor: backdropColor,
                },
                reanimatedBackdropStyle,
              ]}
            >
              <Pressable
                onPress={handleBackdropPress}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          ) : (
            <RNAnimated.View
              style={[
                styles.backdrop,
                {
                  backgroundColor: backdropColor,
                  opacity: nativeBackdropOpacity,
                },
              ]}
            >
              <Pressable
                onPress={handleBackdropPress}
                style={StyleSheet.absoluteFillObject}
              />
            </RNAnimated.View>
          )
        ) : null}

        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          {reanimated ? (
            <Animated.View
              {...(panResponder ? panResponder.panHandlers : {})}
              style={[sheetStyle, reanimatedSheetStyle]}
            >
              {sheetContent}
            </Animated.View>
          ) : (
            <RNAnimated.View
              {...(panResponder ? panResponder.panHandlers : {})}
              style={[
                sheetStyle,
                {
                  transform: [
                    {
                      translateY: nativeTranslateY,
                    },
                  ],
                },
              ]}
            >
              {sheetContent}
            </RNAnimated.View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

UIBottomSheet.displayName = "UIBottomSheet";

export default UIBottomSheet;

export { UIBottomSheet };
