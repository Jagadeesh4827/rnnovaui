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
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

const DEFAULT_SPRING = {
  damping: 20,
  stiffness: 180,
  mass: 0.8,
};

const ANIMATION_TYPES = [
  "fade",
  "scale",
  "fadeScale",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "none",
];

/* ============================================================================
 * HELPERS
 * ========================================================================== */

function resolveDimension(value, screenSize) {
  if (typeof value === "string" && value.endsWith("%")) {
    const percentage = parseFloat(value);

    if (Number.isFinite(percentage)) {
      return screenSize * (percentage / 100);
    }
  }

  return value;
}

/* ============================================================================
 * ICON
 * ========================================================================== */

function RenderIcon({ icon, size = 24, color = "#222222", style }) {
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
 * MAIN COMPONENT
 * ========================================================================== */

const UIModal = forwardRef(function UIModal(
  {
    /* ======================================================================
     * VISIBILITY
     * ==================================================================== */

    visible,

    defaultVisible = false,

    onVisibleChange,

    /* ======================================================================
     * MODAL TYPE
     * ==================================================================== */

    position = "center",

    presentation = "modal",

    /* ======================================================================
     * DIMENSIONS
     * ==================================================================== */

    width = "90%",

    height,

    maxWidth,

    maxHeight,

    minWidth,

    minHeight,

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

    shadowRadius = 14,

    shadowOffset = {
      width: 0,
      height: 5,
    },

    elevation = 10,

    /* ======================================================================
     * SPACING
     * ==================================================================== */

    margin = 0,

    marginHorizontal = 0,

    marginVertical = 0,

    marginTop = 0,

    marginBottom = 0,

    marginLeft = 0,

    marginRight = 0,

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

    safeAreaTop = false,

    safeAreaBottom = true,

    safeAreaLeft = false,

    safeAreaRight = false,

    /* ======================================================================
     * HEADER
     * ==================================================================== */

    showHeader = false,

    title,

    titleFontSize = 18,

    titleLineHeight = 24,

    titleFontWeight = "700",

    titleColor,

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

    showsVerticalScrollIndicator = false,

    keyboardDismissMode = "on-drag",

    keyboardShouldPersistTaps = "handled",

    keyboardAvoiding = true,

    keyboardVerticalOffset = 0,

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

    animation = "fadeScale",

    animationDuration = 280,

    closeAnimationDuration = 220,

    animationSpring = DEFAULT_SPRING,

    reanimated = false,

    /* ======================================================================
     * NATIVE MODAL
     * ==================================================================== */

    transparent = true,

    statusBarTranslucent = true,

    hardwareAccelerated = true,

    onRequestClose,

    /* ======================================================================
     * CALLBACKS
     * ==================================================================== */

    onOpen,

    onClose,

    /* ======================================================================
     * STYLE
     * ==================================================================== */

    style,

    overlayStyle,

    /* ======================================================================
     * CHILDREN
     * ==================================================================== */

    children,
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const radius = theme?.radius || {};

  const themeAnimation = theme?.animation || {};

  const insets = useSafeAreaInsets();

  /* ========================================================================
   * CONTROLLED STATE
   * ====================================================================== */

  const isControlled = visible !== undefined;

  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const isVisible = isControlled ? visible : internalVisible;

  const setVisible = useCallback(
    (next) => {
      if (!isControlled) {
        setInternalVisible(next);
      }

      if (typeof onVisibleChange === "function") {
        onVisibleChange(next);
      }
    },
    [isControlled, onVisibleChange],
  );

  /* ========================================================================
   * SCREEN DIMENSIONS
   * ====================================================================== */

  const screenWidth = require("react-native").Dimensions.get("window").width;

  const screenHeight = require("react-native").Dimensions.get("window").height;

  /* ========================================================================
   * DIMENSIONS
   * ====================================================================== */

  const resolvedWidth = resolveDimension(width, screenWidth);

  const resolvedHeight =
    height !== undefined ? resolveDimension(height, screenHeight) : undefined;

  const resolvedMaxWidth =
    maxWidth !== undefined
      ? resolveDimension(maxWidth, screenWidth)
      : undefined;

  const resolvedMaxHeight =
    maxHeight !== undefined
      ? resolveDimension(maxHeight, screenHeight)
      : undefined;

  const resolvedMinWidth =
    minWidth !== undefined
      ? resolveDimension(minWidth, screenWidth)
      : undefined;

  const resolvedMinHeight =
    minHeight !== undefined
      ? resolveDimension(minHeight, screenHeight)
      : undefined;

  /* ========================================================================
   * ANIMATION VALUES
   * ====================================================================== */

  const nativeOpacity = useRef(new RNAnimated.Value(0)).current;

  const nativeScale = useRef(new RNAnimated.Value(0.92)).current;

  const nativeTranslateX = useRef(new RNAnimated.Value(0)).current;

  const nativeTranslateY = useRef(new RNAnimated.Value(0)).current;

  const nativeBackdropOpacity = useRef(new RNAnimated.Value(0)).current;

  /* ========================================================================
   * REANIMATED VALUES
   * ====================================================================== */

  const animatedOpacity = useSharedValue(0);

  const animatedScale = useSharedValue(0.92);

  const animatedTranslateX = useSharedValue(0);

  const animatedTranslateY = useSharedValue(0);

  const animatedBackdropOpacity = useSharedValue(0);

  /* ========================================================================
   * ANIMATION OFFSETS
   * ====================================================================== */

  const getSlideOffset = useCallback(
    (type) => {
      switch (type) {
        case "slideUp":
          return {
            x: 0,
            y: screenHeight,
          };

        case "slideDown":
          return {
            x: 0,
            y: -screenHeight,
          };

        case "slideLeft":
          return {
            x: screenWidth,
            y: 0,
          };

        case "slideRight":
          return {
            x: -screenWidth,
            y: 0,
          };

        default:
          return {
            x: 0,
            y: 0,
          };
      }
    },
    [screenHeight, screenWidth],
  );

  /* ========================================================================
   * OPEN ANIMATION
   * ====================================================================== */

  const openModal = useCallback(() => {
    const type = ANIMATION_TYPES.includes(animation) ? animation : "fadeScale";

    const offset = getSlideOffset(type);

    if (reanimated) {
      animatedBackdropOpacity.value = withTiming(backdropOpacity, {
        duration: animationDuration,
      });

      if (type === "none") {
        animatedOpacity.value = 1;

        animatedScale.value = 1;

        animatedTranslateX.value = 0;

        animatedTranslateY.value = 0;

        return;
      }

      if (type === "fade" || type === "fadeScale") {
        animatedOpacity.value = withTiming(1, {
          duration: animationDuration,
        });
      } else {
        animatedOpacity.value = withTiming(1, {
          duration: animationDuration,
        });
      }

      if (type === "scale" || type === "fadeScale") {
        animatedScale.value = withSpring(
          1,
          animationSpring || themeAnimation.spring || DEFAULT_SPRING,
        );
      } else {
        animatedScale.value = 1;
      }

      if (
        type === "slideUp" ||
        type === "slideDown" ||
        type === "slideLeft" ||
        type === "slideRight"
      ) {
        animatedTranslateX.value = withTiming(0, {
          duration: animationDuration,
        });

        animatedTranslateY.value = withTiming(0, {
          duration: animationDuration,
        });
      } else {
        animatedTranslateX.value = 0;

        animatedTranslateY.value = 0;
      }

      return;
    }

    nativeBackdropOpacity.setValue(0);

    nativeOpacity.setValue(type === "none" ? 1 : 0);

    nativeScale.setValue(type === "scale" || type === "fadeScale" ? 0.92 : 1);

    nativeTranslateX.setValue(offset.x);

    nativeTranslateY.setValue(offset.y);

    const animations = [
      RNAnimated.timing(nativeBackdropOpacity, {
        toValue: backdropOpacity,

        duration: animationDuration,

        useNativeDriver: true,
      }),
    ];

    if (type === "scale" || type === "fadeScale") {
      animations.push(
        RNAnimated.parallel([
          RNAnimated.timing(nativeOpacity, {
            toValue: 1,

            duration: animationDuration,

            useNativeDriver: true,
          }),

          RNAnimated.spring(nativeScale, {
            toValue: 1,

            damping:
              animationSpring?.damping ??
              themeAnimation.spring?.damping ??
              DEFAULT_SPRING.damping,

            stiffness:
              animationSpring?.stiffness ??
              themeAnimation.spring?.stiffness ??
              DEFAULT_SPRING.stiffness,

            mass:
              animationSpring?.mass ??
              themeAnimation.spring?.mass ??
              DEFAULT_SPRING.mass,

            useNativeDriver: true,
          }),
        ]),
      );
    } else {
      animations.push(
        RNAnimated.timing(nativeOpacity, {
          toValue: 1,

          duration: animationDuration,

          useNativeDriver: true,
        }),
      );
    }

    if (
      type === "slideUp" ||
      type === "slideDown" ||
      type === "slideLeft" ||
      type === "slideRight"
    ) {
      animations.push(
        RNAnimated.parallel([
          RNAnimated.timing(nativeTranslateX, {
            toValue: 0,

            duration: animationDuration,

            useNativeDriver: true,
          }),

          RNAnimated.timing(nativeTranslateY, {
            toValue: 0,

            duration: animationDuration,

            useNativeDriver: true,
          }),
        ]),
      );
    }

    RNAnimated.parallel(animations).start();

    if (typeof onOpen === "function") {
      onOpen();
    }
  }, [
    animation,
    animationDuration,
    animationSpring,
    animatedBackdropOpacity,
    animatedOpacity,
    animatedScale,
    animatedTranslateX,
    animatedTranslateY,
    backdropOpacity,
    getSlideOffset,
    nativeBackdropOpacity,
    nativeOpacity,
    nativeScale,
    nativeTranslateX,
    nativeTranslateY,
    onOpen,
    reanimated,
    themeAnimation.spring,
  ]);

  /* ========================================================================
   * CLOSE ANIMATION
   * ====================================================================== */

  const closeModal = useCallback(() => {
    const type = ANIMATION_TYPES.includes(animation) ? animation : "fadeScale";

    const offset = getSlideOffset(type);

    if (reanimated) {
      animatedBackdropOpacity.value = withTiming(0, {
        duration: closeAnimationDuration,
      });

      if (type === "none") {
        animatedOpacity.value = 0;

        animatedScale.value = 0.92;

        setVisible(false);

        if (typeof onClose === "function") {
          onClose();
        }

        return;
      }

      animatedOpacity.value = withTiming(
        0,
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

      if (type === "scale" || type === "fadeScale") {
        animatedScale.value = withTiming(0.92, {
          duration: closeAnimationDuration,
        });
      }

      if (
        type === "slideUp" ||
        type === "slideDown" ||
        type === "slideLeft" ||
        type === "slideRight"
      ) {
        animatedTranslateX.value = withTiming(offset.x, {
          duration: closeAnimationDuration,
        });

        animatedTranslateY.value = withTiming(offset.y, {
          duration: closeAnimationDuration,
        });
      }

      return;
    }

    const animations = [
      RNAnimated.timing(nativeOpacity, {
        toValue: 0,

        duration: closeAnimationDuration,

        useNativeDriver: true,
      }),

      RNAnimated.timing(nativeBackdropOpacity, {
        toValue: 0,

        duration: closeAnimationDuration,

        useNativeDriver: true,
      }),
    ];

    if (type === "scale" || type === "fadeScale") {
      animations.push(
        RNAnimated.timing(nativeScale, {
          toValue: 0.92,

          duration: closeAnimationDuration,

          useNativeDriver: true,
        }),
      );
    }

    if (
      type === "slideUp" ||
      type === "slideDown" ||
      type === "slideLeft" ||
      type === "slideRight"
    ) {
      animations.push(
        RNAnimated.parallel([
          RNAnimated.timing(nativeTranslateX, {
            toValue: offset.x,

            duration: closeAnimationDuration,

            useNativeDriver: true,
          }),

          RNAnimated.timing(nativeTranslateY, {
            toValue: offset.y,

            duration: closeAnimationDuration,

            useNativeDriver: true,
          }),
        ]),
      );
    }

    RNAnimated.parallel(animations).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setVisible(false);

      if (typeof onClose === "function") {
        onClose();
      }
    });
  }, [
    animation,
    animatedBackdropOpacity,
    animatedOpacity,
    animatedScale,
    animatedTranslateX,
    animatedTranslateY,
    closeAnimationDuration,
    getSlideOffset,
    nativeBackdropOpacity,
    nativeOpacity,
    nativeScale,
    nativeTranslateX,
    nativeTranslateY,
    onClose,
    reanimated,
    setVisible,
  ]);

  /* ========================================================================
   * IMPERATIVE API
   * ====================================================================== */

  useImperativeHandle(
    ref,
    () => ({
      open: openModal,

      close: closeModal,

      toggle: () => {
        if (isVisible) {
          closeModal();
        } else {
          setVisible(true);
        }
      },
    }),
    [closeModal, isVisible, openModal, setVisible],
  );

  /* ========================================================================
   * VISIBILITY EFFECT
   * ====================================================================== */

  useEffect(() => {
    if (isVisible) {
      openModal();
    }
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
        if (typeof onRequestClose === "function") {
          onRequestClose();
        } else {
          closeModal();
        }

        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [closeModal, isVisible, onRequestClose]);

  /* ========================================================================
   * REANIMATED STYLES
   * ====================================================================== */

  const reanimatedContentStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,

    transform: [
      {
        scale: animatedScale.value,
      },

      {
        translateX: animatedTranslateX.value,
      },

      {
        translateY: animatedTranslateY.value,
      },
    ],
  }));

  const reanimatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: animatedBackdropOpacity.value,
  }));

  /* ========================================================================
   * SAFE AREA
   * ====================================================================== */

  const safeTop = safeArea && safeAreaTop ? insets.top : 0;

  const safeBottom = safeArea && safeAreaBottom ? insets.bottom : 0;

  const safeLeft = safeArea && safeAreaLeft ? insets.left : 0;

  const safeRight = safeArea && safeAreaRight ? insets.right : 0;

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

  const resolvedCloseIconColor = closeIconColor ?? colors.text ?? "#222222";

  const resolvedCloseBackgroundColor =
    closeButtonBackgroundColor ?? colors.surfaceSecondary ?? "#F2F2F2";

  /* ========================================================================
   * RADIUS
   * ====================================================================== */

  const resolvedRadius = borderRadius ?? radius.xxl ?? 24;

  const resolvedTopLeftRadius = topLeftRadius ?? resolvedRadius;

  const resolvedTopRightRadius = topRightRadius ?? resolvedRadius;

  const resolvedBottomLeftRadius = bottomLeftRadius ?? resolvedRadius;

  const resolvedBottomRightRadius = bottomRightRadius ?? resolvedRadius;

  /* ========================================================================
   * HEADER
   * ====================================================================== */

  const headerContent =
    typeof renderHeader === "function" ? (
      renderHeader({
        close: closeModal,
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
        <View style={styles.headerTitle}>
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
            onPress={onCloseButtonPress || closeModal}
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
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardDismissMode={keyboardDismissMode}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
          close: closeModal,
        })
      : footer;

  /* ========================================================================
   * MODAL CONTENT
   * ====================================================================== */

  const modalContent = reanimated ? (
    <Animated.View
      style={[
        styles.modal,

        {
          width: resolvedWidth,

          height: resolvedHeight,

          maxWidth: resolvedMaxWidth,

          maxHeight: resolvedMaxHeight,

          minWidth: resolvedMinWidth,

          minHeight: resolvedMinHeight,

          margin,

          marginHorizontal,

          marginVertical,

          marginTop,

          marginBottom,

          marginLeft,

          marginRight,

          backgroundColor: resolvedBackgroundColor,

          borderTopLeftRadius: resolvedTopLeftRadius,

          borderTopRightRadius: resolvedTopRightRadius,

          borderBottomLeftRadius: resolvedBottomLeftRadius,

          borderBottomRightRadius: resolvedBottomRightRadius,

          borderWidth,

          borderColor: resolvedBorderColor,

          padding,

          paddingHorizontal,

          paddingVertical,

          paddingTop: paddingTop + safeTop,

          paddingBottom: paddingBottom + safeBottom,

          paddingLeft: paddingLeft + safeLeft,

          paddingRight: paddingRight + safeRight,
        },

        shadow
          ? {
              shadowColor,

              shadowOpacity,

              shadowRadius,

              shadowOffset,

              elevation,
            }
          : null,

        reanimatedContentStyle,

        style,
      ]}
    >
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

              paddingBottom: finalFooterPaddingBottom + safeBottom,

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
      style={[
        styles.modal,

        {
          width: resolvedWidth,

          height: resolvedHeight,

          maxWidth: resolvedMaxWidth,

          maxHeight: resolvedMaxHeight,

          minWidth: resolvedMinWidth,

          minHeight: resolvedMinHeight,

          margin,

          marginHorizontal,

          marginVertical,

          marginTop,

          marginBottom,

          marginLeft,

          marginRight,

          backgroundColor: resolvedBackgroundColor,

          borderTopLeftRadius: resolvedTopLeftRadius,

          borderTopRightRadius: resolvedTopRightRadius,

          borderBottomLeftRadius: resolvedBottomLeftRadius,

          borderBottomRightRadius: resolvedBottomRightRadius,

          borderWidth,

          borderColor: resolvedBorderColor,

          padding,

          paddingHorizontal,

          paddingVertical,

          paddingTop: paddingTop + safeTop,

          paddingBottom: paddingBottom + safeBottom,

          paddingLeft: paddingLeft + safeLeft,

          paddingRight: paddingRight + safeRight,
        },

        shadow
          ? {
              shadowColor,

              shadowOpacity,

              shadowRadius,

              shadowOffset,

              elevation,
            }
          : null,

        {
          opacity: nativeOpacity,

          transform: [
            {
              scale: nativeScale,
            },

            {
              translateX: nativeTranslateX,
            },

            {
              translateY: nativeTranslateY,
            },
          ],
        },

        style,
      ]}
    >
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

              paddingBottom: finalFooterPaddingBottom + safeBottom,

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

  const backdropElement = showBackdrop ? (
    typeof renderBackdrop === "function" ? (
      renderBackdrop({
        close: closeModal,
      })
    ) : reanimated ? (
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
          onPress={closeOnBackdropPress ? closeModal : undefined}
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

          backdropStyle,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdropPress ? closeModal : undefined}
        />
      </RNAnimated.View>
    )
  ) : null;

  /* ========================================================================
   * POSITION
   * ====================================================================== */

  const positionStyle =
    position === "bottom"
      ? styles.positionBottom
      : position === "top"
        ? styles.positionTop
        : position === "left"
          ? styles.positionLeft
          : position === "right"
            ? styles.positionRight
            : styles.positionCenter;

  /* ========================================================================
   * RENDER
   * ====================================================================== */

  return (
    <Modal
      visible={isVisible}
      transparent={transparent}
      animationType="none"
      statusBarTranslucent={statusBarTranslucent}
      hardwareAccelerated={hardwareAccelerated}
      onRequestClose={onRequestClose || closeModal}
    >
      <View style={[styles.overlay, positionStyle, overlayStyle]}>
        {backdropElement}

        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={styles.keyboardContainer}
          >
            {modalContent}
          </KeyboardAvoidingView>
        ) : (
          modalContent
        )}
      </View>
    </Modal>
  );
});

/* ============================================================================
 * STYLES
 * ========================================================================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    width: "100%",

    height: "100%",
  },

  positionCenter: {
    alignItems: "center",

    justifyContent: "center",
  },

  positionBottom: {
    alignItems: "center",

    justifyContent: "flex-end",
  },

  positionTop: {
    alignItems: "center",

    justifyContent: "flex-start",
  },

  positionLeft: {
    alignItems: "flex-start",

    justifyContent: "center",
  },

  positionRight: {
    alignItems: "flex-end",

    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 0,
  },

  keyboardContainer: {
    width: "100%",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 1,
  },

  modal: {
    overflow: "hidden",

    zIndex: 2,
  },

  header: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  headerTitle: {
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

export { RenderIcon, ANIMATION_TYPES as UIModalAnimationTypes };

export default memo(UIModal);
