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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUITheme } from "../../theme/UIProvider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const MODAL_VARIANTS = [
  "default",
  "center",
  "fullscreen",
  "bottom",
  "top",
];

export const MODAL_POSITIONS = ["center", "top", "bottom"];

export const MODAL_TITLE_POSITIONS = ["left", "center", "right"];

export const MODAL_ANIMATIONS = [
  "none",
  "fade",
  "scale",
  "scaleUp",
  "scaleDown",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isValidNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const getSafeValue = (value, fallback) => {
  return value !== undefined && value !== null ? value : fallback;
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const UIModal = forwardRef(function UIModal(
  {
    /* ------------------------------------------------------------------ */
    /* Visibility                                                          */
    /* ------------------------------------------------------------------ */

    visible,
    defaultVisible = false,

    onVisibleChange,
    onOpen,
    onClose,

    /* ------------------------------------------------------------------ */
    /* Variant                                                             */
    /* ------------------------------------------------------------------ */

    variant = "default",
    position,

    /* ------------------------------------------------------------------ */
    /* Size                                                                */
    /* ------------------------------------------------------------------ */

    width = "90%",
    height,

    minWidth,
    maxWidth,

    minHeight,
    maxHeight,

    /* ------------------------------------------------------------------ */
    /* Margin                                                              */
    /* ------------------------------------------------------------------ */

    margin = 0,

    marginHorizontal,
    marginVertical,

    marginTop,
    marginBottom,
    marginLeft,
    marginRight,

    /* ------------------------------------------------------------------ */
    /* Padding                                                             */
    /* ------------------------------------------------------------------ */

    padding = 20,

    paddingHorizontal,
    paddingVertical,

    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,

    /* ------------------------------------------------------------------ */
    /* Appearance                                                         */
    /* ------------------------------------------------------------------ */

    backgroundColor,

    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,

    borderWidth = 0,
    borderColor,

    shadow = true,

    style,
    contentStyle,

    /* ------------------------------------------------------------------ */
    /* Backdrop                                                            */
    /* ------------------------------------------------------------------ */

    showBackdrop = true,

    backdropColor = "#000000",
    backdropOpacity = 0.5,

    closeOnBackdropPress = true,

    /* ------------------------------------------------------------------ */
    /* Header                                                              */
    /* ------------------------------------------------------------------ */

    header,

    title,

    titlePosition = "left",
    titleFontSize = 18,
    titleColor,
    titleFontWeight = "700",
    titleLineHeight,

    titleStyle,
    headerStyle,

    /* ------------------------------------------------------------------ */
    /* Close                                                               */
    /* ------------------------------------------------------------------ */

    showClose = false,

    closeIcon = "close",

    closeIconSize = 24,
    closeIconColor,

    closeButtonStyle,

    onClosePress,

    /* ------------------------------------------------------------------ */
    /* Content                                                             */
    /* ------------------------------------------------------------------ */

    children,

    scrollable = false,

    keyboardShouldPersistTaps = "handled",

    contentContainerStyle,

    showsVerticalScrollIndicator = false,

    /* ------------------------------------------------------------------ */
    /* Footer                                                              */
    /* ------------------------------------------------------------------ */

    footer,
    footerStyle,

    /* ------------------------------------------------------------------ */
    /* Safe Area                                                           */
    /* ------------------------------------------------------------------ */

    safeArea = true,

    /* ------------------------------------------------------------------ */
    /* Animation                                                           */
    /* ------------------------------------------------------------------ */

    animation = "fade",

    animationDuration,

    springConfig,

    reanimated = true,

    /* ------------------------------------------------------------------ */
    /* Keyboard                                                            */
    /* ------------------------------------------------------------------ */

    keyboardAvoiding = true,

    keyboardBehavior,

    keyboardVerticalOffset = 0,

    /* ------------------------------------------------------------------ */
    /* Android                                                             */
    /* ------------------------------------------------------------------ */

    enableBackHandler = true,

    /* ------------------------------------------------------------------ */
    /* Modal                                                               */
    /* ------------------------------------------------------------------ */

    modalProps,

    /* ------------------------------------------------------------------ */
    /* Misc                                                                */
    /* ------------------------------------------------------------------ */

    testID,
  },
  ref,
) {
  /* -------------------------------------------------------------------- */
  /* Theme                                                                */
  /* -------------------------------------------------------------------- */

  const { theme } = useUITheme();

  const insets = useSafeAreaInsets();

  const colors = theme?.colors ?? {};

  const radius = theme?.radius ?? {};

  const shadows = theme?.shadows ?? {};

  const themeAnimation = theme?.animation ?? {};

  /* -------------------------------------------------------------------- */
  /* Controlled state                                                     */
  /* -------------------------------------------------------------------- */

  const controlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = controlled ? visible : internalVisible;

  const [modalVisible, setModalVisible] = useState(isVisible);

  const mountedRef = useRef(false);

  const previousVisibleRef = useRef(isVisible);

  /* -------------------------------------------------------------------- */
  /* Resolve variant                                                      */
  /* -------------------------------------------------------------------- */

  const resolvedVariant = MODAL_VARIANTS.includes(variant)
    ? variant
    : "default";

  const resolvedPosition = MODAL_POSITIONS.includes(position)
    ? position
    : resolvedVariant === "bottom"
      ? "bottom"
      : resolvedVariant === "top"
        ? "top"
        : "center";

  const resolvedTitlePosition = MODAL_TITLE_POSITIONS.includes(titlePosition)
    ? titlePosition
    : "left";

  const resolvedAnimation = MODAL_ANIMATIONS.includes(animation)
    ? animation
    : "fade";

  /* -------------------------------------------------------------------- */
  /* Theme colors                                                         */
  /* -------------------------------------------------------------------- */

  const resolvedBackgroundColor =
    backgroundColor ??
    colors.card ??
    colors.surface ??
    colors.background ??
    "#FFFFFF";

  const resolvedBorderColor = borderColor ?? colors.border ?? "#E5E5E5";

  const resolvedTitleColor = titleColor ?? colors.text ?? "#111111";

  const resolvedCloseIconColor = closeIconColor ?? colors.text ?? "#111111";

  const resolvedBorderRadius = borderRadius ?? radius.xl ?? 18;

  /* -------------------------------------------------------------------- */
  /* Animation duration                                                   */
  /* -------------------------------------------------------------------- */

  const resolvedAnimationDuration =
    animationDuration ?? themeAnimation.normal ?? 280;

  /* -------------------------------------------------------------------- */
  /* Padding                                                              */
  /* -------------------------------------------------------------------- */

  const horizontalPadding = paddingHorizontal ?? padding;

  const verticalPadding = paddingVertical ?? padding;

  const resolvedPaddingTop = paddingTop ?? verticalPadding;

  const resolvedPaddingBottom = paddingBottom ?? verticalPadding;

  const resolvedPaddingLeft = paddingLeft ?? horizontalPadding;

  const resolvedPaddingRight = paddingRight ?? horizontalPadding;

  /* -------------------------------------------------------------------- */
  /* Margin                                                               */
  /* -------------------------------------------------------------------- */

  const horizontalMargin = marginHorizontal ?? margin;

  const verticalMargin = marginVertical ?? margin;

  const resolvedMarginTop = marginTop ?? verticalMargin;

  const resolvedMarginBottom = marginBottom ?? verticalMargin;

  const resolvedMarginLeft = marginLeft ?? horizontalMargin;

  const resolvedMarginRight = marginRight ?? horizontalMargin;

  /* -------------------------------------------------------------------- */
  /* Animation values                                                     */
  /* -------------------------------------------------------------------- */

  const opacity = useSharedValue(0);

  const scale = useSharedValue(1);

  const translateX = useSharedValue(0);

  const translateY = useSharedValue(0);

  /* -------------------------------------------------------------------- */
  /* Native Animated values                                               */
  /* -------------------------------------------------------------------- */

  const nativeOpacity = useRef(new RNAnimated.Value(0)).current;

  const nativeScale = useRef(new RNAnimated.Value(1)).current;

  const nativeTranslateX = useRef(new RNAnimated.Value(0)).current;

  const nativeTranslateY = useRef(new RNAnimated.Value(0)).current;

  /* -------------------------------------------------------------------- */
  /* Spring configuration                                                 */
  /* -------------------------------------------------------------------- */

  const resolvedSpringConfig = useMemo(
    () => ({
      damping: springConfig?.damping ?? themeAnimation?.spring?.damping ?? 18,

      stiffness:
        springConfig?.stiffness ?? themeAnimation?.spring?.stiffness ?? 180,

      mass: springConfig?.mass ?? themeAnimation?.spring?.mass ?? 0.8,
    }),
    [springConfig, themeAnimation],
  );

  /* -------------------------------------------------------------------- */
  /* Visibility setter                                                    */
  /* -------------------------------------------------------------------- */

  const setVisibility = useCallback(
    (nextVisible) => {
      if (!controlled) {
        setInternalVisible(nextVisible);
      }

      onVisibleChange?.(nextVisible);
    },
    [controlled, onVisibleChange],
  );

  /* -------------------------------------------------------------------- */
  /* Initial animation values                                            */
  /* -------------------------------------------------------------------- */

  const getInitialAnimationValues = useCallback(() => {
    switch (resolvedAnimation) {
      case "none":
        return {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
        };

      case "fade":
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 0,
        };

      case "scale":
      case "scaleUp":
        return {
          opacity: 0,
          scale: 0.85,
          x: 0,
          y: 0,
        };

      case "scaleDown":
        return {
          opacity: 0,
          scale: 1.15,
          x: 0,
          y: 0,
        };

      case "slideUp":
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 60,
        };

      case "slideDown":
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: -60,
        };

      case "slideLeft":
        return {
          opacity: 0,
          scale: 1,
          x: 80,
          y: 0,
        };

      case "slideRight":
        return {
          opacity: 0,
          scale: 1,
          x: -80,
          y: 0,
        };

      default:
        return {
          opacity: 0,
          scale: 1,
          x: 0,
          y: 0,
        };
    }
  }, [resolvedAnimation]);

  /* -------------------------------------------------------------------- */
  /* Reanimated open                                                      */
  /* -------------------------------------------------------------------- */

  const animateReanimatedOpen = useCallback(() => {
    const initial = getInitialAnimationValues();

    opacity.value = initial.opacity;

    scale.value = initial.scale;

    translateX.value = initial.x;

    translateY.value = initial.y;

    setModalVisible(true);

    if (resolvedAnimation === "none") {
      return;
    }

    opacity.value = withTiming(1, {
      duration: resolvedAnimationDuration,
    });

    if (
      resolvedAnimation === "scale" ||
      resolvedAnimation === "scaleUp" ||
      resolvedAnimation === "scaleDown"
    ) {
      scale.value = withSpring(1, resolvedSpringConfig);
    } else {
      scale.value = withTiming(1, {
        duration: resolvedAnimationDuration,
      });
    }

    translateX.value = withTiming(0, {
      duration: resolvedAnimationDuration,
    });

    translateY.value = withTiming(0, {
      duration: resolvedAnimationDuration,
    });
  }, [
    getInitialAnimationValues,
    opacity,
    scale,
    translateX,
    translateY,
    resolvedAnimation,
    resolvedAnimationDuration,
    resolvedSpringConfig,
  ]);

  /* -------------------------------------------------------------------- */
  /* Reanimated close                                                     */
  /* -------------------------------------------------------------------- */

  const animateReanimatedClose = useCallback(() => {
    if (resolvedAnimation === "none") {
      opacity.value = 0;
      setModalVisible(false);
      return;
    }

    opacity.value = withTiming(0, {
      duration: resolvedAnimationDuration,
    });

    scale.value = withTiming(0.96, {
      duration: resolvedAnimationDuration,
    });

    translateX.value = withTiming(0, {
      duration: resolvedAnimationDuration,
    });

    translateY.value = withTiming(0, {
      duration: resolvedAnimationDuration,
    });

    setTimeout(() => {
      setModalVisible(false);
    }, resolvedAnimationDuration);
  }, [
    resolvedAnimation,
    opacity,
    scale,
    translateX,
    translateY,
    resolvedAnimationDuration,
  ]);

  /* -------------------------------------------------------------------- */
  /* Native open                                                           */
  /* -------------------------------------------------------------------- */

  const animateNativeOpen = useCallback(() => {
    const initial = getInitialAnimationValues();

    nativeOpacity.setValue(initial.opacity);

    nativeScale.setValue(initial.scale);

    nativeTranslateX.setValue(initial.x);

    nativeTranslateY.setValue(initial.y);

    setModalVisible(true);

    if (resolvedAnimation === "none") {
      nativeOpacity.setValue(1);
      return;
    }

    RNAnimated.parallel([
      RNAnimated.timing(nativeOpacity, {
        toValue: 1,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }),

      RNAnimated.spring(nativeScale, {
        toValue: 1,
        useNativeDriver: true,
        ...resolvedSpringConfig,
      }),

      RNAnimated.timing(nativeTranslateX, {
        toValue: 0,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }),

      RNAnimated.timing(nativeTranslateY, {
        toValue: 0,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    getInitialAnimationValues,
    nativeOpacity,
    nativeScale,
    nativeTranslateX,
    nativeTranslateY,
    resolvedAnimation,
    resolvedAnimationDuration,
    resolvedSpringConfig,
  ]);

  /* -------------------------------------------------------------------- */
  /* Native close                                                          */
  /* -------------------------------------------------------------------- */

  const finishNativeClose = useCallback(() => {
    setModalVisible(false);
    onClose?.();
  }, [onClose]);

  const animateNativeClose = useCallback(() => {
    if (resolvedAnimation === "none") {
      finishNativeClose();
      return;
    }

    RNAnimated.parallel([
      RNAnimated.timing(nativeOpacity, {
        toValue: 0,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }),

      RNAnimated.timing(nativeScale, {
        toValue: 0.96,
        duration: resolvedAnimationDuration,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        finishNativeClose();
      }
    });
  }, [
    resolvedAnimation,
    nativeOpacity,
    nativeScale,
    resolvedAnimationDuration,
    finishNativeClose,
  ]);

  /* -------------------------------------------------------------------- */
  /* Open                                                                  */
  /* -------------------------------------------------------------------- */

  const animateOpen = useCallback(() => {
    if (reanimated) {
      animateReanimatedOpen();
    } else {
      animateNativeOpen();
    }
  }, [reanimated, animateReanimatedOpen, animateNativeOpen]);

  /* -------------------------------------------------------------------- */
  /* Close                                                                 */
  /* -------------------------------------------------------------------- */

  const animateClose = useCallback(() => {
    if (reanimated) {
      animateReanimatedClose();
    } else {
      animateNativeClose();
    }
  }, [reanimated, animateReanimatedClose, animateNativeClose]);

  /* -------------------------------------------------------------------- */
  /* Public open                                                           */
  /* -------------------------------------------------------------------- */

  const open = useCallback(() => {
    const wasVisible = isVisible;

    setVisibility(true);

    animateOpen();

    if (!wasVisible) {
      onOpen?.();
    }
  }, [isVisible, setVisibility, animateOpen, onOpen]);

  /* -------------------------------------------------------------------- */
  /* Public close                                                          */
  /* -------------------------------------------------------------------- */

  const close = useCallback(() => {
    if (!modalVisible) {
      setVisibility(false);
      return;
    }

    setVisibility(false);

    animateClose();
  }, [modalVisible, setVisibility, animateClose]);

  /* -------------------------------------------------------------------- */
  /* Toggle                                                                */
  /* -------------------------------------------------------------------- */

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, close, open]);

  /* -------------------------------------------------------------------- */
  /* Imperative API                                                        */
  /* -------------------------------------------------------------------- */

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      toggle,

      isVisible: () => isVisible,
    }),
    [open, close, toggle, isVisible],
  );

  /* -------------------------------------------------------------------- */
  /* Controlled visibility effect                                          */
  /* -------------------------------------------------------------------- */

  useEffect(() => {
    const previous = previousVisibleRef.current;

    previousVisibleRef.current = isVisible;

    if (!mountedRef.current) {
      mountedRef.current = true;

      if (isVisible) {
        setModalVisible(true);

        const timer = setTimeout(() => {
          animateOpen();
        }, 20);

        return () => clearTimeout(timer);
      }

      return undefined;
    }

    if (isVisible && !previous) {
      setModalVisible(true);

      const timer = setTimeout(() => {
        animateOpen();
      }, 20);

      return () => clearTimeout(timer);
    }

    if (!isVisible && previous) {
      animateClose();
    }

    return undefined;
  }, [isVisible, animateOpen, animateClose]);

  /* -------------------------------------------------------------------- */
  /* Android back                                                         */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Reanimated styles                                                    */
  /* -------------------------------------------------------------------- */

  const animatedModalStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value,

      transform: [
        {
          translateX: translateX.value,
        },

        {
          translateY: translateY.value,
        },

        {
          scale: scale.value,
        },
      ],
    }),
    [],
  );

  const animatedBackdropStyle = useAnimatedStyle(
    () => ({
      opacity: opacity.value * backdropOpacity,
    }),
    [backdropOpacity],
  );

  /* -------------------------------------------------------------------- */
  /* Native styles                                                        */
  /* -------------------------------------------------------------------- */

  const nativeModalStyle = {
    opacity: nativeOpacity,

    transform: [
      {
        translateX: nativeTranslateX,
      },

      {
        translateY: nativeTranslateY,
      },

      {
        scale: nativeScale,
      },
    ],
  };

  const nativeBackdropStyle = {
    opacity: nativeOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, backdropOpacity],
    }),
  };

  /* -------------------------------------------------------------------- */
  /* Position                                                             */
  /* -------------------------------------------------------------------- */

  const positionStyle = useMemo(() => {
    switch (resolvedPosition) {
      case "top":
        return {
          justifyContent: "flex-start",
        };

      case "bottom":
        return {
          justifyContent: "flex-end",
        };

      case "center":
      default:
        return {
          justifyContent: "center",
        };
    }
  }, [resolvedPosition]);

  /* -------------------------------------------------------------------- */
  /* Variant                                                              */
  /* -------------------------------------------------------------------- */

  const variantStyle = useMemo(() => {
    if (resolvedVariant === "fullscreen") {
      return {
        width: "100%",
        height: "100%",
        margin: 0,
        borderRadius: 0,
      };
    }

    if (resolvedVariant === "bottom") {
      return {
        width: "100%",

        borderTopLeftRadius: borderTopLeftRadius ?? resolvedBorderRadius,

        borderTopRightRadius: borderTopRightRadius ?? resolvedBorderRadius,

        borderBottomLeftRadius: borderBottomLeftRadius ?? 0,

        borderBottomRightRadius: borderBottomRightRadius ?? 0,

        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
      };
    }

    if (resolvedVariant === "top") {
      return {
        width: "100%",

        borderTopLeftRadius: borderTopLeftRadius ?? 0,

        borderTopRightRadius: borderTopRightRadius ?? 0,

        borderBottomLeftRadius: borderBottomLeftRadius ?? resolvedBorderRadius,

        borderBottomRightRadius:
          borderBottomRightRadius ?? resolvedBorderRadius,

        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
      };
    }

    return {};
  }, [
    resolvedVariant,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    resolvedBorderRadius,
  ]);

  /* -------------------------------------------------------------------- */
  /* Modal style                                                          */
  /* -------------------------------------------------------------------- */

  const modalStyle = [
    modalStyles.modal,

    {
      width: resolvedVariant === "fullscreen" ? "100%" : width,

      height: resolvedVariant === "fullscreen" ? "100%" : height,

      minWidth,
      maxWidth,
      minHeight,
      maxHeight,

      marginTop: resolvedVariant === "fullscreen" ? 0 : resolvedMarginTop,

      marginBottom: resolvedVariant === "fullscreen" ? 0 : resolvedMarginBottom,

      marginLeft: resolvedVariant === "fullscreen" ? 0 : resolvedMarginLeft,

      marginRight: resolvedVariant === "fullscreen" ? 0 : resolvedMarginRight,

      backgroundColor: resolvedBackgroundColor,

      borderWidth,

      borderColor: resolvedBorderColor,

      borderRadius: resolvedBorderRadius,

      borderTopLeftRadius: borderTopLeftRadius ?? resolvedBorderRadius,

      borderTopRightRadius: borderTopRightRadius ?? resolvedBorderRadius,

      borderBottomLeftRadius: borderBottomLeftRadius ?? resolvedBorderRadius,

      borderBottomRightRadius: borderBottomRightRadius ?? resolvedBorderRadius,

      paddingTop:
        resolvedPaddingTop +
        (safeArea && resolvedPosition === "top" ? insets.top : 0),

      paddingBottom:
        resolvedPaddingBottom +
        (safeArea && resolvedPosition === "bottom" ? insets.bottom : 0),

      paddingLeft: resolvedPaddingLeft,

      paddingRight: resolvedPaddingRight,

      ...(shadow ? (shadows?.md ?? {}) : {}),
    },

    variantStyle,

    style,
  ];

  /* -------------------------------------------------------------------- */
  /* Header                                                               */
  /* -------------------------------------------------------------------- */

  const renderHeader = () => {
    if (header) {
      return <View style={[modalStyles.header, headerStyle]}>{header}</View>;
    }

    if (!title && !showClose) {
      return null;
    }

    /* ---------------------------------------------------------------- */
    /* Center                                                            */
    /* ---------------------------------------------------------------- */

    if (resolvedTitlePosition === "center") {
      return (
        <View
          style={[modalStyles.header, modalStyles.headerCenter, headerStyle]}
        >
          {typeof title === "string" ? (
            <Text
              numberOfLines={1}
              style={[
                modalStyles.title,

                modalStyles.titleCenter,

                {
                  fontSize: titleFontSize,

                  color: resolvedTitleColor,

                  fontWeight: titleFontWeight,

                  ...(titleLineHeight
                    ? {
                        lineHeight: titleLineHeight,
                      }
                    : {}),
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
                if (onClosePress) {
                  onClosePress();
                } else {
                  close();
                }
              }}
              style={[modalStyles.closeButton, closeButtonStyle]}
            >
              <Ionicons
                name={closeIcon}
                size={closeIconSize}
                color={resolvedCloseIconColor}
              />
            </Pressable>
          ) : null}
        </View>
      );
    }

    /* ---------------------------------------------------------------- */
    /* Left / Right                                                      */
    /* ---------------------------------------------------------------- */

    return (
      <View
        style={[
          modalStyles.header,

          resolvedTitlePosition === "right" && modalStyles.headerRight,

          headerStyle,
        ]}
      >
        {typeof title === "string" ? (
          <Text
            numberOfLines={1}
            style={[
              modalStyles.title,

              {
                fontSize: titleFontSize,

                color: resolvedTitleColor,

                fontWeight: titleFontWeight,

                ...(titleLineHeight
                  ? {
                      lineHeight: titleLineHeight,
                    }
                  : {}),
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
              if (onClosePress) {
                onClosePress();
              } else {
                close();
              }
            }}
            style={[modalStyles.closeButton, closeButtonStyle]}
          >
            <Ionicons
              name={closeIcon}
              size={closeIconSize}
              color={resolvedCloseIconColor}
            />
          </Pressable>
        ) : null}
      </View>
    );
  };

  /* -------------------------------------------------------------------- */
  /* Content                                                              */
  /* -------------------------------------------------------------------- */

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={modalStyles.scrollView}
          contentContainerStyle={[
            modalStyles.scrollContent,
            contentContainerStyle,
            contentStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[modalStyles.content, contentContainerStyle, contentStyle]}>
        {children}
      </View>
    );
  };

  /* -------------------------------------------------------------------- */
  /* Card content                                                         */
  /* -------------------------------------------------------------------- */

  const cardContent = (
    <>
      {renderHeader()}

      {renderContent()}

      {footer ? (
        <View style={[modalStyles.footer, footerStyle]}>{footer}</View>
      ) : null}
    </>
  );

  /* -------------------------------------------------------------------- */
  /* Backdrop                                                             */
  /* -------------------------------------------------------------------- */

  const renderBackdrop = () => {
    if (!showBackdrop) {
      return null;
    }

    const onBackdropPress = () => {
      if (closeOnBackdropPress) {
        close();
      }
    };

    if (reanimated) {
      return (
        <Animated.View
          style={[
            modalStyles.backdrop,

            {
              backgroundColor: backdropColor,
            },

            animatedBackdropStyle,
          ]}
        >
          <Pressable
            onPress={onBackdropPress}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      );
    }

    return (
      <RNAnimated.View
        style={[
          modalStyles.backdrop,

          {
            backgroundColor: backdropColor,
          },

          nativeBackdropStyle,
        ]}
      >
        <Pressable
          onPress={onBackdropPress}
          style={StyleSheet.absoluteFillObject}
        />
      </RNAnimated.View>
    );
  };

  /* -------------------------------------------------------------------- */
  /* Closed                                                               */
  /* -------------------------------------------------------------------- */

  if (!modalVisible) {
    return null;
  }

  /* -------------------------------------------------------------------- */
  /* Render                                                               */
  /* -------------------------------------------------------------------- */

  const renderedCard = reanimated ? (
    <Animated.View style={[modalStyle, animatedModalStyle]}>
      {cardContent}
    </Animated.View>
  ) : (
    <RNAnimated.View style={[modalStyle, nativeModalStyle]}>
      {cardContent}
    </RNAnimated.View>
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
      {...modalProps}
    >
      <View testID={testID} style={[modalStyles.modalRoot, positionStyle]}>
        {renderBackdrop()}

        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={
              keyboardBehavior ??
              (Platform.OS === "ios" ? "padding" : undefined)
            }
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={modalStyles.keyboardContainer}
          >
            {renderedCard}
          </KeyboardAvoidingView>
        ) : (
          renderedCard
        )}
      </View>
    </Modal>
  );
});

UIModal.displayName = "UIModal";

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const modalStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    width: "100%",
  },

  keyboardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modal: {
    overflow: "hidden",
    maxWidth: "100%",
  },

  /* -------------------------------------------------------------------- */
  /* Header                                                               */
  /* -------------------------------------------------------------------- */

  header: {
    width: "100%",
    minHeight: 52,

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
  /* Close                                                                */
  /* -------------------------------------------------------------------- */

  closeButton: {
    width: 44,

    height: 44,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,
  },

  /* -------------------------------------------------------------------- */
  /* Content                                                              */
  /* -------------------------------------------------------------------- */

  content: {
    width: "100%",

    flexShrink: 1,
  },

  scrollView: {
    width: "100%",

    flexShrink: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* -------------------------------------------------------------------- */
  /* Footer                                                               */
  /* -------------------------------------------------------------------- */

  footer: {
    width: "100%",
  },
});

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export { UIModal };

export default memo(UIModal);
