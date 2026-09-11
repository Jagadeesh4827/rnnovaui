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
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUITheme } from "../../theme/UIProvider";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* -------------------------------------------------------------------------- */
/* Animation constants                                                        */
/* -------------------------------------------------------------------------- */

export const CAROUSEL_ANIMATIONS = [
  "none",

  "fade",

  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",

  "scale",
  "scaleUp",
  "scaleDown",

  "zoomIn",
  "zoomOut",

  "bounce",
  "elastic",

  "pulse",
  "float",

  "rotate",
  "rotateReverse",

  "swing",
  "shake",

  "flip",
  "flipX",
  "flipY",
];

export const CAROUSEL_TEXT_ANIMATIONS = CAROUSEL_ANIMATIONS;

export const CAROUSEL_ASSET_ANIMATIONS = CAROUSEL_ANIMATIONS;

export const CAROUSEL_BACKGROUND_ANIMATIONS = [
  "none",
  "fade",
  "zoomIn",
  "zoomOut",
  "pulse",
  "float",
  "shimmer",
];

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

const isValidAnimation = (animation) => CAROUSEL_ANIMATIONS.includes(animation);

/* -------------------------------------------------------------------------- */
/* Animated asset                                                             */
/* -------------------------------------------------------------------------- */

const UIAnimatedAsset = memo(function UIAnimatedAsset({
  animation = "fade",

  delay = 0,

  duration = 600,

  repeat = false,

  repeatCount = -1,

  repeatReverse = true,

  active = true,

  style,

  children,
}) {
  const progress = useSharedValue(0);

  const resolvedAnimation = isValidAnimation(animation) ? animation : "none";

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    if (resolvedAnimation === "none") {
      progress.value = 1;
      return;
    }

    progress.value = 0;

    let animationValue;

    if (repeat) {
      animationValue = withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.cubic),
        }),
        repeatCount,
        repeatReverse,
      );
    } else {
      animationValue = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }

    progress.value = withDelay(delay, animationValue);
  }, [
    active,
    resolvedAnimation,
    delay,
    duration,
    repeat,
    repeatCount,
    repeatReverse,
    progress,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    let opacity = 1;

    let translateX = 0;
    let translateY = 0;

    let scale = 1;

    let rotate = 0;

    let rotateX = 0;
    let rotateY = 0;

    switch (resolvedAnimation) {
      /* ------------------------------------------------------------ */
      /* Fade                                                          */
      /* ------------------------------------------------------------ */

      case "fade":
        opacity = p;
        break;

      /* ------------------------------------------------------------ */
      /* Slides                                                        */
      /* ------------------------------------------------------------ */

      case "slideUp":
        opacity = p;

        translateY = 60 * (1 - p);

        break;

      case "slideDown":
        opacity = p;

        translateY = -60 * (1 - p);

        break;

      case "slideLeft":
        opacity = p;

        translateX = 70 * (1 - p);

        break;

      case "slideRight":
        opacity = p;

        translateX = -70 * (1 - p);

        break;

      /* ------------------------------------------------------------ */
      /* Scale                                                         */
      /* ------------------------------------------------------------ */

      case "scale":
        opacity = p;

        scale = 0.75 + 0.25 * p;

        break;

      case "scaleUp":
        opacity = p;

        scale = 0.4 + 0.6 * p;

        break;

      case "scaleDown":
        opacity = p;

        scale = 1.3 - 0.3 * p;

        break;

      /* ------------------------------------------------------------ */
      /* Zoom                                                          */
      /* ------------------------------------------------------------ */

      case "zoomIn":
        scale = 0.7 + 0.3 * p;

        break;

      case "zoomOut":
        scale = 1.3 - 0.3 * p;

        break;

      /* ------------------------------------------------------------ */
      /* Bounce                                                        */
      /* ------------------------------------------------------------ */

      case "bounce":
        opacity = p;

        translateY = interpolate(
          p,
          [0, 0.45, 0.65, 0.82, 1],
          [55, -16, 8, -3, 0],
          Extrapolation.CLAMP,
        );

        break;

      /* ------------------------------------------------------------ */
      /* Elastic                                                       */
      /* ------------------------------------------------------------ */

      case "elastic":
        scale = interpolate(
          p,
          [0, 0.3, 0.55, 0.75, 1],
          [0.4, 1.18, 0.92, 1.04, 1],
          Extrapolation.CLAMP,
        );

        opacity = p;

        break;

      /* ------------------------------------------------------------ */
      /* Pulse                                                         */
      /* ------------------------------------------------------------ */

      case "pulse":
        scale = interpolate(p, [0, 0.5, 1], [1, 1.12, 1], Extrapolation.CLAMP);

        break;

      /* ------------------------------------------------------------ */
      /* Float                                                         */
      /* ------------------------------------------------------------ */

      case "float":
        translateY = interpolate(
          p,
          [0, 0.5, 1],
          [0, -12, 0],
          Extrapolation.CLAMP,
        );

        break;

      /* ------------------------------------------------------------ */
      /* Rotation                                                      */
      /* ------------------------------------------------------------ */

      case "rotate":
        rotate = interpolate(p, [0, 1], [-8, 8], Extrapolation.CLAMP);

        break;

      case "rotateReverse":
        rotate = interpolate(p, [0, 1], [8, -8], Extrapolation.CLAMP);

        break;

      /* ------------------------------------------------------------ */
      /* Swing                                                         */
      /* ------------------------------------------------------------ */

      case "swing":
        rotate = interpolate(
          p,
          [0, 0.2, 0.4, 0.6, 0.8, 1],
          [-12, 10, -8, 6, -3, 0],
          Extrapolation.CLAMP,
        );

        break;

      /* ------------------------------------------------------------ */
      /* Shake                                                         */
      /* ------------------------------------------------------------ */

      case "shake":
        translateX = interpolate(
          p,
          [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
          [0, -8, 8, -7, 6, -3, 0],
          Extrapolation.CLAMP,
        );

        break;

      /* ------------------------------------------------------------ */
      /* Flip                                                          */
      /* ------------------------------------------------------------ */

      case "flip":
      case "flipY":
        rotateY = interpolate(p, [0, 1], [90, 0], Extrapolation.CLAMP);

        opacity = p;

        break;

      case "flipX":
        rotateX = interpolate(p, [0, 1], [90, 0], Extrapolation.CLAMP);

        opacity = p;

        break;

      default:
        break;
    }

    return {
      opacity,

      transform: [
        {
          translateX,
        },

        {
          translateY,
        },

        {
          scale,
        },

        {
          rotate: `${rotate}deg`,
        },

        {
          rotateX: `${rotateX}deg`,
        },

        {
          rotateY: `${rotateY}deg`,
        },
      ],
    };
  }, [resolvedAnimation]);

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated text                                                              */
/* -------------------------------------------------------------------------- */

const CarouselText = memo(function CarouselText({ item, active }) {
  if (!item) {
    return null;
  }

  const {
    text,

    x = 0,
    y = 0,

    width,

    fontSize = 20,
    lineHeight,

    color = "#FFFFFF",

    fontWeight = "700",

    textAlign = "left",

    numberOfLines,

    animation = "fade",

    delay = 0,

    duration = 600,

    repeat = false,

    repeatCount = -1,

    repeatReverse = true,

    opacity = 1,

    rotation,

    zIndex = 20,

    style,
  } = item;

  return (
    <UIAnimatedAsset
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      repeatReverse={repeatReverse}
      active={active}
      style={[
        carouselStyles.absoluteAsset,

        {
          left: x,
          top: y,

          width,

          opacity,

          zIndex,

          transform: rotation
            ? [
                {
                  rotate: rotation,
                },
              ]
            : undefined,
        },
      ]}
    >
      <Text
        numberOfLines={numberOfLines}
        style={[
          {
            fontSize,

            lineHeight,

            color,

            fontWeight,

            textAlign,

            includeFontPadding: false,
          },

          style,
        ]}
      >
        {text}
      </Text>
    </UIAnimatedAsset>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated image                                                             */
/* -------------------------------------------------------------------------- */

const CarouselImage = memo(function CarouselImage({ item, active }) {
  if (!item?.source) {
    return null;
  }

  const {
    source,

    x = 0,
    y = 0,

    width = 100,
    height = 100,

    resizeMode = "contain",

    opacity = 1,

    rotation,

    zIndex = 10,

    borderRadius = 0,

    animation = "fade",

    delay = 0,

    duration = 700,

    repeat = false,

    repeatCount = -1,

    repeatReverse = true,

    style,

    imageStyle,
  } = item;

  return (
    <UIAnimatedAsset
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      repeatReverse={repeatReverse}
      active={active}
      style={[
        carouselStyles.absoluteAsset,

        {
          left: x,
          top: y,

          width,
          height,

          opacity,

          zIndex,

          transform: rotation
            ? [
                {
                  rotate: rotation,
                },
              ]
            : undefined,
        },

        style,
      ]}
    >
      <Image
        source={
          typeof source === "string"
            ? {
                uri: source,
              }
            : source
        }
        resizeMode={resizeMode}
        style={[
          {
            width: "100%",
            height: "100%",

            borderRadius,
          },

          imageStyle,
        ]}
      />
    </UIAnimatedAsset>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated icon                                                              */
/* -------------------------------------------------------------------------- */

const CarouselIcon = memo(function CarouselIcon({ item, active }) {
  if (!item) {
    return null;
  }

  const {
    name = "star",

    iconComponent,

    x = 0,
    y = 0,

    size = 24,

    color = "#FFFFFF",

    opacity = 1,

    rotation,

    zIndex = 30,

    animation = "fade",

    delay = 0,

    duration = 600,

    repeat = false,

    repeatCount = -1,

    repeatReverse = true,

    style,
  } = item;

  const CustomIcon = iconComponent;

  return (
    <UIAnimatedAsset
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      repeatReverse={repeatReverse}
      active={active}
      style={[
        carouselStyles.absoluteAsset,

        {
          left: x,
          top: y,

          opacity,

          zIndex,

          transform: rotation
            ? [
                {
                  rotate: rotation,
                },
              ]
            : undefined,
        },

        style,
      ]}
    >
      {CustomIcon ? (
        <CustomIcon size={size} color={color} />
      ) : (
        <Ionicons name={name} size={size} color={color} />
      )}
    </UIAnimatedAsset>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated button                                                            */
/* -------------------------------------------------------------------------- */

const CarouselButton = memo(function CarouselButton({ item, active, onPress }) {
  if (!item) {
    return null;
  }

  const {
    text = "ORDER NOW",

    x = 20,
    y = 200,

    width,
    height = 44,

    backgroundColor = "#FF5A1F",

    borderRadius = 999,

    borderWidth = 0,
    borderColor,

    textColor = "#FFFFFF",

    fontSize = 14,
    fontWeight = "700",

    icon,

    iconSize = 18,
    iconColor,

    iconPosition = "right",

    animation = "scale",

    delay = 500,

    duration = 600,

    repeat = false,

    repeatCount = -1,

    repeatReverse = true,

    zIndex = 50,

    style,

    textStyle,
  } = item;

  return (
    <UIAnimatedAsset
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      repeatReverse={repeatReverse}
      active={active}
      style={[
        carouselStyles.absoluteAsset,

        {
          left: x,
          top: y,

          zIndex,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          {
            width,

            height,

            paddingHorizontal: 18,

            borderRadius,

            borderWidth,

            borderColor,

            backgroundColor,

            flexDirection: "row",

            alignItems: "center",

            justifyContent: "center",
          },

          style,
        ]}
      >
        {icon && iconPosition === "left" ? (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor ?? textColor}
            style={{
              marginRight: 7,
            }}
          />
        ) : null}

        <Text
          style={[
            {
              color: textColor,

              fontSize,

              fontWeight,
            },

            textStyle,
          ]}
        >
          {text}
        </Text>

        {icon && iconPosition === "right" ? (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor ?? textColor}
            style={{
              marginLeft: 7,
            }}
          />
        ) : null}
      </Pressable>
    </UIAnimatedAsset>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated background                                                        */
/* -------------------------------------------------------------------------- */

const CarouselBackground = memo(function CarouselBackground({
  background,
  width,
  height,
  active,
}) {
  if (!background) {
    return null;
  }

  const {
    type = "color",

    color = "#111111",

    colors = ["#111111", "#333333"],

    start = {
      x: 0,
      y: 0,
    },

    end = {
      x: 1,
      y: 1,
    },

    source,

    resizeMode = "cover",

    animation = "none",

    duration = 1000,

    opacity = 1,

    style,
  } = background;

  const backgroundProgress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      backgroundProgress.value = 0;
      return;
    }

    if (animation === "none") {
      backgroundProgress.value = 1;
      return;
    }

    backgroundProgress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [active, animation, duration, backgroundProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let animatedOpacity = opacity;

    switch (animation) {
      case "fade":
        animatedOpacity = interpolate(
          backgroundProgress.value,
          [0, 1],
          [0.7, opacity],
          Extrapolation.CLAMP,
        );
        break;

      case "zoomIn":
        scale = interpolate(
          backgroundProgress.value,
          [0, 1],
          [1, 1.08],
          Extrapolation.CLAMP,
        );
        break;

      case "zoomOut":
        scale = interpolate(
          backgroundProgress.value,
          [0, 1],
          [1.08, 1],
          Extrapolation.CLAMP,
        );
        break;

      case "pulse":
        scale = interpolate(
          backgroundProgress.value,
          [0, 0.5, 1],
          [1, 1.04, 1],
          Extrapolation.CLAMP,
        );
        break;

      case "float":
        translateY = interpolate(
          backgroundProgress.value,
          [0, 0.5, 1],
          [0, -8, 0],
          Extrapolation.CLAMP,
        );
        break;

      case "shimmer":
        translateX = interpolate(
          backgroundProgress.value,
          [0, 1],
          [-width, width],
          Extrapolation.CLAMP,
        );
        break;

      default:
        break;
    }

    return {
      opacity: animatedOpacity,

      transform: [
        {
          translateX,
        },

        {
          translateY,
        },

        {
          scale,
        },
      ],
    };
  }, [animation, opacity, width]);

  if (type === "gradient") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, animatedStyle, style]}
      >
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          style={{
            width,
            height,
          }}
        />
      </Animated.View>
    );
  }

  if (type === "image" && source) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, animatedStyle, style]}
      >
        <Image
          source={
            typeof source === "string"
              ? {
                  uri: source,
                }
              : source
          }
          resizeMode={resizeMode}
          style={{
            width,
            height,
          }}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,

        {
          backgroundColor: color,
        },

        animatedStyle,

        style,
      ]}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Advanced slide                                                             */
/* -------------------------------------------------------------------------- */

const CarouselSlide = memo(function CarouselSlide({
  slide,
  width,
  height,
  active,
  borderRadius,
  onPress,
  onButtonPress,
}) {
  const {
    background,

    texts = [],

    images = [],

    icons = [],

    button,

    overlay,

    overlayColor = "#000000",

    overlayOpacity = 0.2,

    renderContent,
  } = slide;

  return (
    <View
      style={[
        carouselStyles.slide,

        {
          width,
          height,

          borderRadius,
        },
      ]}
    >
      {/* -------------------------------------------------------------- */}
      {/* BACKGROUND                                                     */}
      {/* -------------------------------------------------------------- */}

      <CarouselBackground
        background={background}
        width={width}
        height={height}
        active={active}
      />

      {/* -------------------------------------------------------------- */}
      {/* OVERLAY                                                        */}
      {/* -------------------------------------------------------------- */}

      {overlay ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,

            {
              backgroundColor: overlayColor,

              opacity: overlayOpacity,

              borderRadius,
            },
          ]}
        />
      ) : null}

      {/* -------------------------------------------------------------- */}
      {/* IMAGES                                                         */}
      {/* -------------------------------------------------------------- */}

      {images.map((image, index) => (
        <CarouselImage
          key={image.id ?? `image-${index}`}
          item={image}
          active={active}
        />
      ))}

      {/* -------------------------------------------------------------- */}
      {/* ICONS                                                          */}
      {/* -------------------------------------------------------------- */}

      {icons.map((icon, index) => (
        <CarouselIcon
          key={icon.id ?? `icon-${index}`}
          item={icon}
          active={active}
        />
      ))}

      {/* -------------------------------------------------------------- */}
      {/* TEXTS                                                          */}
      {/* -------------------------------------------------------------- */}

      {texts.map((text, index) => (
        <CarouselText
          key={text.id ?? `text-${index}`}
          item={text}
          active={active}
        />
      ))}

      {/* -------------------------------------------------------------- */}
      {/* CUSTOM CONTENT                                                  */}
      {/* -------------------------------------------------------------- */}

      {typeof renderContent === "function"
        ? renderContent({
            slide,
            active,
          })
        : null}

      {/* -------------------------------------------------------------- */}
      {/* BUTTON                                                          */}
      {/* -------------------------------------------------------------- */}

      {button ? (
        <CarouselButton
          item={button}
          active={active}
          onPress={() => onButtonPress?.(slide)}
        />
      ) : null}

      {/* -------------------------------------------------------------- */}
      {/* SLIDE PRESS                                                     */}
      {/* -------------------------------------------------------------- */}

      {onPress ? (
        <Pressable
          onPress={() => onPress(slide)}
          style={carouselStyles.slidePress}
        />
      ) : null}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Main UICarousel                                                            */
/* -------------------------------------------------------------------------- */

const UICarousel = forwardRef(function UICarousel(
  {
    /* ---------------------------------------------------------------- */
    /* Data                                                              */
    /* ---------------------------------------------------------------- */

    data = [],

    /* ---------------------------------------------------------------- */
    /* Dimensions                                                       */
    /* ---------------------------------------------------------------- */

    width,

    height = 240,

    slideWidth,

    gap = 0,

    horizontalPadding = 0,

    /* ---------------------------------------------------------------- */
    /* Appearance                                                       */
    /* ---------------------------------------------------------------- */

    borderRadius,

    backgroundColor,

    style,

    slideStyle,

    /* ---------------------------------------------------------------- */
    /* Margin                                                            */
    /* ---------------------------------------------------------------- */

    margin = 0,

    marginHorizontal,

    marginVertical,

    marginTop,

    marginBottom,

    marginLeft,

    marginRight,

    /* ---------------------------------------------------------------- */
    /* Autoplay                                                         */
    /* ---------------------------------------------------------------- */

    autoplay = false,

    autoplayInterval = 3500,

    pauseOnInteraction = true,

    /* ---------------------------------------------------------------- */
    /* Loop                                                              */
    /* ---------------------------------------------------------------- */

    loop = true,

    /* ---------------------------------------------------------------- */
    /* Scroll                                                            */
    /* ---------------------------------------------------------------- */

    scrollEnabled = true,

    showsHorizontalScrollIndicator = false,

    bounces = false,

    /* ---------------------------------------------------------------- */
    /* Pagination                                                       */
    /* ---------------------------------------------------------------- */

    showPagination = true,

    dotSize = 8,

    activeDotWidth,

    activeDotHeight,

    dotSpacing = 4,

    activeDotColor,

    inactiveDotColor,

    paginationPosition = "bottom",

    paginationStyle,

    dotStyle,

    activeDotStyle,

    renderPagination,

    /* ---------------------------------------------------------------- */
    /* Index                                                             */
    /* ---------------------------------------------------------------- */

    initialIndex = 0,

    onIndexChange,

    /* ---------------------------------------------------------------- */
    /* Callbacks                                                        */
    /* ---------------------------------------------------------------- */

    onPress,

    onButtonPress,

    /* ---------------------------------------------------------------- */
    /* Rendering                                                        */
    /* ---------------------------------------------------------------- */

    renderItem,

    /* ---------------------------------------------------------------- */
    /* Reanimated                                                       */
    /* ---------------------------------------------------------------- */

    reanimated = true,

    /* ---------------------------------------------------------------- */
    /* Misc                                                             */
    /* ---------------------------------------------------------------- */

    testID,

    ...flatListProps
  },
  ref,
) {
  /* ------------------------------------------------------------------ */
  /* Theme                                                              */
  /* ------------------------------------------------------------------ */

  const { theme } = useUITheme();

  const colors = theme?.colors ?? {};

  const radius = theme?.radius ?? {};

  /* ------------------------------------------------------------------ */
  /* Data                                                               */
  /* ------------------------------------------------------------------ */

  const safeData = Array.isArray(data) ? data : [];

  const itemCount = safeData.length;

  /* ------------------------------------------------------------------ */
  /* Dimensions                                                         */
  /* ------------------------------------------------------------------ */

  const containerWidth = width ?? SCREEN_WIDTH;

  const resolvedSlideWidth = slideWidth ?? containerWidth;

  const resolvedBorderRadius = borderRadius ?? radius.card ?? radius.lg ?? 18;

  /* ------------------------------------------------------------------ */
  /* Margins                                                            */
  /* ------------------------------------------------------------------ */

  const resolvedMarginTop = marginTop ?? marginVertical ?? margin;

  const resolvedMarginBottom = marginBottom ?? marginVertical ?? margin;

  const resolvedMarginLeft = marginLeft ?? marginHorizontal ?? margin;

  const resolvedMarginRight = marginRight ?? marginHorizontal ?? margin;

  /* ------------------------------------------------------------------ */
  /* Current index                                                      */
  /* ------------------------------------------------------------------ */

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, Math.max(itemCount - 1, 0))),
  );

  /* ------------------------------------------------------------------ */
  /* FlatList                                                            */
  /* ------------------------------------------------------------------ */

  const flatListRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* Autoplay                                                            */
  /* ------------------------------------------------------------------ */

  const autoplayTimer = useRef(null);

  const interactionRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /* Scroll to index                                                     */
  /* ------------------------------------------------------------------ */

  const scrollToIndex = useCallback(
    (index, animated = true) => {
      if (itemCount <= 0) {
        return;
      }

      let target = index;

      if (loop) {
        if (target >= itemCount) {
          target = 0;
        }

        if (target < 0) {
          target = itemCount - 1;
        }
      } else {
        target = Math.max(0, Math.min(target, itemCount - 1));
      }

      flatListRef.current?.scrollToOffset({
        offset: target * (resolvedSlideWidth + gap),

        animated,
      });
    },
    [itemCount, loop, resolvedSlideWidth, gap],
  );

  /* ------------------------------------------------------------------ */
  /* Next                                                                */
  /* ------------------------------------------------------------------ */

  const next = useCallback(() => {
    if (itemCount <= 1) {
      return;
    }

    if (currentIndex >= itemCount - 1) {
      if (loop) {
        scrollToIndex(0);
      }

      return;
    }

    scrollToIndex(currentIndex + 1);
  }, [itemCount, currentIndex, loop, scrollToIndex]);

  /* ------------------------------------------------------------------ */
  /* Previous                                                            */
  /* ------------------------------------------------------------------ */

  const previous = useCallback(() => {
    if (itemCount <= 1) {
      return;
    }

    if (currentIndex <= 0) {
      if (loop) {
        scrollToIndex(itemCount - 1);
      }

      return;
    }

    scrollToIndex(currentIndex - 1);
  }, [itemCount, currentIndex, loop, scrollToIndex]);

  /* ------------------------------------------------------------------ */
  /* Ref API                                                             */
  /* ------------------------------------------------------------------ */

  useImperativeHandle(
    ref,
    () => ({
      next,

      previous,

      scrollToIndex,

      getCurrentIndex: () => currentIndex,

      getFlatListRef: () => flatListRef.current,
    }),
    [next, previous, scrollToIndex, currentIndex],
  );

  /* ------------------------------------------------------------------ */
  /* Autoplay stop                                                       */
  /* ------------------------------------------------------------------ */

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);

      autoplayTimer.current = null;
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Autoplay start                                                      */
  /* ------------------------------------------------------------------ */

  const startAutoplay = useCallback(() => {
    stopAutoplay();

    if (!autoplay || itemCount <= 1) {
      return;
    }

    autoplayTimer.current = setInterval(() => {
      if (interactionRef.current) {
        return;
      }

      next();
    }, autoplayInterval);
  }, [autoplay, itemCount, autoplayInterval, next, stopAutoplay]);

  /* ------------------------------------------------------------------ */
  /* Autoplay lifecycle                                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    startAutoplay();

    return () => {
      stopAutoplay();
    };
  }, [startAutoplay, stopAutoplay]);

  /* ------------------------------------------------------------------ */
  /* Scroll end                                                          */
  /* ------------------------------------------------------------------ */

  const handleMomentumScrollEnd = useCallback(
    (event) => {
      const offset = event.nativeEvent.contentOffset.x;

      const index = Math.round(offset / (resolvedSlideWidth + gap));

      const safeIndex = Math.max(0, Math.min(index, itemCount - 1));

      if (safeIndex !== currentIndex) {
        setCurrentIndex(safeIndex);

        onIndexChange?.(safeIndex, safeData[safeIndex]);
      }

      flatListProps.onMomentumScrollEnd?.(event);
    },
    [
      resolvedSlideWidth,
      gap,
      itemCount,
      currentIndex,
      onIndexChange,
      safeData,
      flatListProps,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* Begin drag                                                          */
  /* ------------------------------------------------------------------ */

  const handleScrollBeginDrag = useCallback(
    (event) => {
      interactionRef.current = true;

      if (pauseOnInteraction) {
        stopAutoplay();
      }

      flatListProps.onScrollBeginDrag?.(event);
    },
    [pauseOnInteraction, stopAutoplay, flatListProps],
  );

  /* ------------------------------------------------------------------ */
  /* End drag                                                            */
  /* ------------------------------------------------------------------ */

  const handleScrollEndDrag = useCallback(
    (event) => {
      interactionRef.current = false;

      if (pauseOnInteraction) {
        startAutoplay();
      }

      flatListProps.onScrollEndDrag?.(event);
    },
    [pauseOnInteraction, startAutoplay, flatListProps],
  );

  /* ------------------------------------------------------------------ */
  /* Render item                                                         */
  /* ------------------------------------------------------------------ */

  const renderCarouselItem = useCallback(
    ({ item, index }) => {
      const active = index === currentIndex;

      if (typeof renderItem === "function") {
        return (
          <View
            style={{
              width: resolvedSlideWidth,

              marginRight: gap,
            }}
          >
            {renderItem({
              item,
              index,
              active,
            })}
          </View>
        );
      }

      return (
        <View
          style={[
            {
              width: resolvedSlideWidth,

              marginRight: gap,
            },

            slideStyle,
          ]}
        >
          <CarouselSlide
            slide={item}
            width={resolvedSlideWidth}
            height={height}
            active={active}
            borderRadius={resolvedBorderRadius}
            onPress={onPress ? () => onPress(item, index) : undefined}
            onButtonPress={
              onButtonPress ? () => onButtonPress(item, index) : undefined
            }
          />
        </View>
      );
    },
    [
      currentIndex,
      renderItem,
      resolvedSlideWidth,
      gap,
      slideStyle,
      height,
      resolvedBorderRadius,
      onPress,
      onButtonPress,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* Pagination                                                          */
  /* ------------------------------------------------------------------ */

  const renderDefaultPagination = () => {
    if (!showPagination || itemCount <= 1) {
      return null;
    }

    return (
      <View
        style={[
          carouselStyles.pagination,

          paginationPosition === "top" ? carouselStyles.paginationTop : null,

          paginationStyle,
        ]}
      >
        {safeData.map((item, index) => {
          const active = index === currentIndex;

          return (
            <Pressable
              key={item?.id ?? `dot-${index}`}
              hitSlop={8}
              onPress={() => scrollToIndex(index)}
              style={[
                carouselStyles.dot,

                {
                  width: active ? (activeDotWidth ?? dotSize * 2) : dotSize,

                  height: activeDotHeight ?? dotSize,

                  marginHorizontal: dotSpacing / 2,

                  backgroundColor: active
                    ? (activeDotColor ?? colors.primary ?? "#FF5A1F")
                    : (inactiveDotColor ?? "#D1D5DB"),
                },

                dotStyle,

                active ? activeDotStyle : null,
              ]}
            />
          );
        })}
      </View>
    );
  };

  /* ------------------------------------------------------------------ */
  /* Empty                                                               */
  /* ------------------------------------------------------------------ */

  if (itemCount === 0) {
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <View
      testID={testID}
      style={[
        carouselStyles.container,

        {
          width: containerWidth,

          marginTop: resolvedMarginTop,

          marginBottom: resolvedMarginBottom,

          marginLeft: resolvedMarginLeft,

          marginRight: resolvedMarginRight,

          paddingHorizontal: horizontalPadding,

          backgroundColor,
        },

        style,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={safeData}
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        scrollEnabled={scrollEnabled}
        bounces={bounces}
        decelerationRate="fast"
        snapToInterval={resolvedSlideWidth + gap}
        snapToAlignment="start"
        disableIntervalMomentum
        nestedScrollEnabled
        initialScrollIndex={Math.min(initialIndex, itemCount - 1)}
        getItemLayout={(_data, index) => ({
          length: resolvedSlideWidth + gap,

          offset: (resolvedSlideWidth + gap) * index,

          index,
        })}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={renderCarouselItem}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        {...flatListProps}
      />

      {typeof renderPagination === "function"
        ? renderPagination({
            currentIndex,
            count: itemCount,
            scrollToIndex,
          })
        : renderDefaultPagination()}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Display name                                                               */
/* -------------------------------------------------------------------------- */

UICarousel.displayName = "UICarousel";

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const carouselStyles = StyleSheet.create({
  container: {
    position: "relative",
  },

  slide: {
    position: "relative",

    overflow: "hidden",

    backgroundColor: "#E5E7EB",
  },

  absoluteAsset: {
    position: "absolute",
  },

  slidePress: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    zIndex: 1,
  },

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,

    bottom: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 100,
  },

  paginationTop: {
    top: 12,

    bottom: undefined,
  },

  dot: {
    minWidth: 4,

    minHeight: 4,

    borderRadius: 999,
  },
});

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export {
  UICarousel,
  UIAnimatedAsset,
  CarouselText,
  CarouselImage,
  CarouselIcon,
  CarouselButton,
  CarouselBackground,
  CarouselSlide,
};

export default memo(UICarousel);
