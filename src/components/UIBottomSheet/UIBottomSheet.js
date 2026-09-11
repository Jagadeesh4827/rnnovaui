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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveSnapPoint = (point, availableHeight) => {
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
};

const normalizeSnapPoints = (snapPoints, availableHeight) => {
  const source =
    Array.isArray(snapPoints) && snapPoints.length > 0
      ? snapPoints
      : [availableHeight];

  const result = source
    .map((point) => resolveSnapPoint(point, availableHeight))
    .filter((point) => Number.isFinite(point) && point > 0)
    .map((point) => clamp(point, 1, availableHeight))
    .sort((a, b) => a - b);

  return result.length ? result : [availableHeight];
};

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

  const backgroundColor =
    color ?? theme?.colors?.borderStrong ?? theme?.colors?.border ?? "#CCCCCC";

  return (
    <View
      pointerEvents="none"
      style={[
        bottomSheetStyles.handle,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
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
        bottomSheetStyles.backdrop,
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
    /* Visibility */

    visible,
    defaultVisible = false,
    onVisibleChange,
    onOpen,
    onClose,

    /* Snap */

    snapPoints = ["50%"],
    initialSnapIndex = 0,

    height,
    minHeight = 120,
    maxHeight,

    /* Width */

    width = "100%",
    marginHorizontal = 0,
    marginBottom = 0,

    /* Padding */

    padding = 0,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,

    /* Appearance */

    backgroundColor,
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,

    borderWidth = 0,
    borderColor,

    style,
    contentStyle,

    /* Backdrop */

    showBackdrop = true,
    backdropOpacity = 0.5,
    backdropColor = "#000000",
    closeOnBackdropPress = true,

    /* Handle */

    showHandle = true,
    handleWidth = 40,
    handleHeight = 4,
    handleColor,
    handleStyle,

    /* Header */

    header,

    title,

    // NEW
    titlePosition = "left",
    titleFontSize = 18,
    titleColor,
    titleFontWeight = "700",

    titleStyle,

    showClose = false,
    closeIcon = "close",
    closeIconSize = 24,
    closeIconColor,

    onClosePress,
    headerStyle,

    /* Footer */

    footer,

    /* Content */

    children,
    scrollable = true,

    keyboardShouldPersistTaps = "handled",

    contentContainerStyle,

    showsVerticalScrollIndicator = false,

    /* Safe area */

    safeArea = true,

    /* Animation */

    reanimated = true,
    animationDuration = 280,

    springConfig,

    /* Drag */

    draggable = true,
    closeOnDragDown = true,
    dragThreshold = 120,

    /* Android */

    enableBackHandler = true,

    /* Misc */

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

  const themeAnimation = theme?.animation ?? {};

  /* ---------------------------------------------------------------------- */
  /* Visibility                                                             */
  /* ---------------------------------------------------------------------- */

  const controlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = controlled ? visible : internalVisible;

  const [modalVisible, setModalVisible] = useState(isVisible);

  const mountedRef = useRef(false);

  const previousVisibleRef = useRef(isVisible);

  /* ---------------------------------------------------------------------- */
  /* Height                                                                 */
  /* ---------------------------------------------------------------------- */

  const availableHeight = useMemo(() => {
    let result =
      typeof height === "number" && height > 0 ? height : SCREEN_HEIGHT;

    if (typeof maxHeight === "number") {
      result = Math.min(result, maxHeight);
    }

    if (typeof minHeight === "number") {
      result = Math.max(result, minHeight);
    }

    return result;
  }, [height, minHeight, maxHeight]);

  /* ---------------------------------------------------------------------- */
  /* Snap points                                                            */
  /* ---------------------------------------------------------------------- */

  const resolvedSnapPoints = useMemo(
    () => normalizeSnapPoints(snapPoints, availableHeight),
    [snapPoints, availableHeight],
  );

  const safeInitialIndex = clamp(
    initialSnapIndex,
    0,
    Math.max(resolvedSnapPoints.length - 1, 0),
  );

  const currentSnapIndex = useRef(safeInitialIndex);

  const currentSnapHeight = useRef(
    resolvedSnapPoints[safeInitialIndex] ?? availableHeight,
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
  /* Colors                                                                 */
  /* ---------------------------------------------------------------------- */

  const resolvedBackground =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedBorder = borderColor ?? colors.border ?? "#E5E5E5";

  const resolvedRadius = borderRadius ?? radius.xl ?? 18;

  const resolvedTextColor = titleColor ?? colors.text ?? "#111111";

  const resolvedCloseColor = closeIconColor ?? colors.text ?? "#111111";

  /* ---------------------------------------------------------------------- */
  /* Title position                                                         */
  /* ---------------------------------------------------------------------- */

  const resolvedTitlePosition =
    titlePosition === "center" || titlePosition === "right"
      ? titlePosition
      : "left";

  /* ---------------------------------------------------------------------- */
  /* Visibility                                                             */
  /* ---------------------------------------------------------------------- */

  const setVisibility = useCallback(
    (nextVisible) => {
      if (!controlled) {
        setInternalVisible(nextVisible);
      }

      if (typeof onVisibleChange === "function") {
        onVisibleChange(nextVisible);
      }
    },
    [controlled, onVisibleChange],
  );

  /* ---------------------------------------------------------------------- */
  /* Native OPEN                                                            */
  /* ---------------------------------------------------------------------- */

  const animateNativeOpen = useCallback(
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

  const finishClose = useCallback(() => {
    setModalVisible(false);

    if (typeof onClose === "function") {
      onClose();
    }
  }, [onClose]);

  const animateNativeClose = useCallback(() => {
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
      if (finished) {
        finishClose();
      }
    });
  }, [nativeTranslateY, nativeBackdropOpacity, animationDuration, finishClose]);

  /* ---------------------------------------------------------------------- */
  /* Reanimated OPEN                                                        */
  /* ---------------------------------------------------------------------- */

  const animateReanimatedOpen = useCallback(
    (targetHeight) => {
      const targetTranslate = availableHeight - targetHeight;

      translateY.value = withSpring(targetTranslate, {
        damping: springConfig?.damping ?? themeAnimation?.spring?.damping ?? 18,

        stiffness:
          springConfig?.stiffness ?? themeAnimation?.spring?.stiffness ?? 180,

        mass: springConfig?.mass ?? themeAnimation?.spring?.mass ?? 0.8,
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
      themeAnimation,
      animationDuration,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Reanimated CLOSE                                                       */
  /* ---------------------------------------------------------------------- */

  const animateReanimatedClose = useCallback(() => {
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
  /* Open animation                                                         */
  /* ---------------------------------------------------------------------- */

  const animateOpen = useCallback(
    (targetHeight) => {
      setModalVisible(true);

      if (reanimated) {
        animateReanimatedOpen(targetHeight);
      } else {
        animateNativeOpen(targetHeight);
      }
    },
    [reanimated, animateReanimatedOpen, animateNativeOpen],
  );

  /* ---------------------------------------------------------------------- */
  /* Close animation                                                        */
  /* ---------------------------------------------------------------------- */

  const animateClose = useCallback(() => {
    if (reanimated) {
      animateReanimatedClose();
    } else {
      animateNativeClose();
    }
  }, [reanimated, animateReanimatedClose, animateNativeClose]);

  /* ---------------------------------------------------------------------- */
  /* Public OPEN                                                            */
  /* ---------------------------------------------------------------------- */

  const open = useCallback(
    (snapIndex = currentSnapIndex.current) => {
      const index = clamp(
        snapIndex,
        0,
        Math.max(resolvedSnapPoints.length - 1, 0),
      );

      const targetHeight = resolvedSnapPoints[index] ?? availableHeight;

      currentSnapIndex.current = index;

      currentSnapHeight.current = targetHeight;

      const wasVisible = isVisible;

      setVisibility(true);

      animateOpen(targetHeight);

      if (!wasVisible && typeof onOpen === "function") {
        onOpen();
      }
    },
    [
      resolvedSnapPoints,
      availableHeight,
      isVisible,
      setVisibility,
      animateOpen,
      onOpen,
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Public CLOSE                                                           */
  /* ---------------------------------------------------------------------- */

  const close = useCallback(() => {
    if (!modalVisible) {
      setVisibility(false);
      return;
    }

    setVisibility(false);

    animateClose();
  }, [modalVisible, setVisibility, animateClose]);

  /* ---------------------------------------------------------------------- */
  /* Toggle                                                                  */
  /* ---------------------------------------------------------------------- */

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, close, open]);

  /* ---------------------------------------------------------------------- */
  /* Snap                                                                    */
  /* ---------------------------------------------------------------------- */

  const snapTo = useCallback(
    (snapIndex) => {
      const index = clamp(
        snapIndex,
        0,
        Math.max(resolvedSnapPoints.length - 1, 0),
      );

      const targetHeight = resolvedSnapPoints[index] ?? availableHeight;

      currentSnapIndex.current = index;

      currentSnapHeight.current = targetHeight;

      if (!isVisible) {
        open(index);
        return;
      }

      const targetTranslate = availableHeight - targetHeight;

      if (reanimated) {
        translateY.value = withSpring(targetTranslate, {
          damping: springConfig?.damping ?? 18,

          stiffness: springConfig?.stiffness ?? 180,

          mass: springConfig?.mass ?? 0.8,
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
    ],
  );

  /* ---------------------------------------------------------------------- */
  /* Expand / Collapse                                                      */
  /* ---------------------------------------------------------------------- */

  const expand = useCallback(() => {
    snapTo(resolvedSnapPoints.length - 1);
  }, [snapTo, resolvedSnapPoints.length]);

  const collapse = useCallback(() => {
    snapTo(0);
  }, [snapTo]);

  /* ---------------------------------------------------------------------- */
  /* Ref API                                                                */
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

      getSnapIndex: () => currentSnapIndex.current,
    }),
    [open, close, toggle, snapTo, expand, collapse],
  );

  /* ---------------------------------------------------------------------- */
  /* Controlled state                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const previous = previousVisibleRef.current;

    previousVisibleRef.current = isVisible;

    if (!mountedRef.current) {
      mountedRef.current = true;

      if (isVisible) {
        setModalVisible(true);

        const timer = setTimeout(() => {
          animateOpen(currentSnapHeight.current);
        }, 20);

        return () => clearTimeout(timer);
      }

      return undefined;
    }

    if (isVisible && !previous) {
      setModalVisible(true);

      const timer = setTimeout(() => {
        animateOpen(currentSnapHeight.current);
      }, 20);

      return () => clearTimeout(timer);
    }

    if (!isVisible && previous) {
      animateClose();
    }

    return undefined;
  }, [isVisible, animateOpen, animateClose]);

  /* ---------------------------------------------------------------------- */
  /* Android Back                                                           */
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

  const dragStart = useRef(0);

  const panResponder = useMemo(() => {
    if (!draggable) {
      return null;
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,

      onPanResponderGrant: () => {
        if (reanimated) {
          dragStart.current = translateY.value;
        } else {
          nativeTranslateY.stopAnimation((value) => {
            dragStart.current = value;
          });
        }
      },

      onPanResponderMove: (_, gesture) => {
        const value = clamp(dragStart.current + gesture.dy, 0, SCREEN_HEIGHT);

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
          : dragStart.current + gesture.dy;

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
        snapTo(currentSnapIndex.current);
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

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value,
      },
    ],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value,
  }));

  /* ---------------------------------------------------------------------- */
  /* Padding                                                                */
  /* ---------------------------------------------------------------------- */

  const finalHorizontal = paddingHorizontal ?? padding;

  const finalVertical = paddingVertical ?? padding;

  const finalTop = paddingTop ?? finalVertical;

  const finalBottom = paddingBottom ?? finalVertical;

  const finalLeft = paddingLeft ?? finalHorizontal;

  const finalRight = paddingRight ?? finalHorizontal;

  /* ---------------------------------------------------------------------- */
  /* Sheet style                                                            */
  /* ---------------------------------------------------------------------- */

  const finalSheetHeight = clamp(
    availableHeight,
    minHeight,
    maxHeight ?? availableHeight,
  );

  const sheetStyle = [
    bottomSheetStyles.sheet,
    {
      width,
      height: finalSheetHeight,

      marginHorizontal,
      marginBottom,

      backgroundColor: resolvedBackground,

      borderRadius: resolvedRadius,

      borderTopLeftRadius: borderTopLeftRadius ?? resolvedRadius,

      borderTopRightRadius: borderTopRightRadius ?? resolvedRadius,

      borderWidth,

      borderColor: resolvedBorder,

      paddingTop: finalTop,

      paddingBottom: finalBottom + (safeArea ? insets.bottom : 0),

      paddingLeft: finalLeft,

      paddingRight: finalRight,

      ...(shadows?.md ?? {}),
    },

    style,
  ];

  /* ---------------------------------------------------------------------- */
  /* Header                                                                 */
  /* ---------------------------------------------------------------------- */

  const renderHeader = () => {
    if (header) {
      return (
        <View style={[bottomSheetStyles.header, headerStyle]}>{header}</View>
      );
    }

    if (!title && !showClose) {
      return null;
    }

    /* -------------------------------------------------------------------- */
    /* CENTER                                                               */
    /* -------------------------------------------------------------------- */

    if (resolvedTitlePosition === "center") {
      return (
        <View
          style={[
            bottomSheetStyles.header,
            bottomSheetStyles.headerCenter,
            headerStyle,
          ]}
        >
          {typeof title === "string" ? (
            <Text
              numberOfLines={1}
              style={[
                bottomSheetStyles.title,
                bottomSheetStyles.titleCenter,
                {
                  fontSize: titleFontSize,
                  color: resolvedTextColor,
                  fontWeight: titleFontWeight,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            title
          )}

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
              style={[
                bottomSheetStyles.closeButton,
                bottomSheetStyles.closeButtonCenter,
              ]}
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
    }

    /* -------------------------------------------------------------------- */
    /* LEFT / RIGHT                                                         */
    /* -------------------------------------------------------------------- */

    return (
      <View
        style={[
          bottomSheetStyles.header,
          resolvedTitlePosition === "right" && bottomSheetStyles.headerRight,
          headerStyle,
        ]}
      >
        {typeof title === "string" ? (
          <Text
            numberOfLines={1}
            style={[
              bottomSheetStyles.title,

              {
                fontSize: titleFontSize,
                color: resolvedTextColor,
                fontWeight: titleFontWeight,
              },

              resolvedTitlePosition === "right" && {
                textAlign: "right",
              },

              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : (
          title
        )}

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
            style={bottomSheetStyles.closeButton}
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
        <View style={bottomSheetStyles.handleContainer}>
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
          style={bottomSheetStyles.scrollView}
          contentContainerStyle={[
            bottomSheetStyles.scrollContent,
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
          style={[
            bottomSheetStyles.nonScrollContent,
            contentContainerStyle,
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}

      {footer ? <View style={bottomSheetStyles.footer}>{footer}</View> : null}
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
  /* Closed                                                                 */
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
      <View testID={testID} style={bottomSheetStyles.modalRoot}>
        {showBackdrop ? (
          reanimated ? (
            <Animated.View
              style={[
                bottomSheetStyles.backdrop,
                {
                  backgroundColor: backdropColor,
                },
                animatedBackdropStyle,
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
                bottomSheetStyles.backdrop,
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
          style={bottomSheetStyles.keyboardContainer}
        >
          {reanimated ? (
            <Animated.View
              {...(panResponder ? panResponder.panHandlers : {})}
              style={[sheetStyle, animatedSheetStyle]}
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

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const bottomSheetStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  keyboardContainer: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    overflow: "hidden",
    maxWidth: "100%",
  },

  handleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  handle: {
    alignSelf: "center",
  },

  /* -------------------------------------------------------------------- */
  /* Header                                                               */
  /* -------------------------------------------------------------------- */

  header: {
    width: "100%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
  },

  headerCenter: {
    position: "relative",
    justifyContent: "center",
  },

  headerRight: {
    justifyContent: "flex-end",
  },

  /* -------------------------------------------------------------------- */
  /* Title                                                                */
  /* -------------------------------------------------------------------- */

  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },

  titleCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  /* -------------------------------------------------------------------- */
  /* Close                                                                 */
  /* -------------------------------------------------------------------- */

  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  closeButtonCenter: {
    marginLeft: "auto",
    zIndex: 20,
  },

  /* -------------------------------------------------------------------- */
  /* Content                                                               */
  /* -------------------------------------------------------------------- */

  scrollView: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
  },

  nonScrollContent: {
    flex: 1,
    width: "100%",
  },

  footer: {
    width: "100%",
  },
});

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export { UIBottomSheet };

export default UIBottomSheet;
