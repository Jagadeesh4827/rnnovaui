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

import { LinearGradient } from "expo-linear-gradient";

import { useUITheme } from "../../theme/UIProvider";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  "pulse",

  "float",

  "rotate",

  "rotateReverse",

  "swing",

  "shake",

  "flip",

  "flipX",
  "flipY",

  "elastic",
];

export const CAROUSEL_TEXT_ANIMATIONS = CAROUSEL_ANIMATIONS;

export const CAROUSEL_ASSET_ANIMATIONS = CAROUSEL_ANIMATIONS;

export const CAROUSEL_BACKGROUND_ANIMATIONS = [
  "none",
  "fade",
  "zoom",
  "pulse",
  "float",
  "shimmer",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getAnimationValue = (animation, progress, axis = "y") => {
  if (animation === "none") {
    return 0;
  }

  if (animation === "slideUp") {
    return axis === "y" ? 60 * (1 - progress) : 0;
  }

  if (animation === "slideDown") {
    return axis === "y" ? -60 * (1 - progress) : 0;
  }

  if (animation === "slideLeft") {
    return axis === "x" ? 70 * (1 - progress) : 0;
  }

  if (animation === "slideRight") {
    return axis === "x" ? -70 * (1 - progress) : 0;
  }

  return 0;
};

/* -------------------------------------------------------------------------- */
/* Advanced animated element                                                 */
/* -------------------------------------------------------------------------- */

const UIAnimatedElement = memo(function UIAnimatedElement({
  animation = "none",
  delay = 0,
  duration = 600,
  repeat = false,
  repeatCount = -1,

  children,

  style,
}) {
  const progress = useSharedValue(animation === "none" ? 1 : 0);

  const loop = repeatCount === -1 ? -1 : repeatCount;

  useEffect(() => {
    if (animation === "none") {
      progress.value = 1;
      return;
    }

    progress.value = 0;

    const timing = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    if (repeat) {
      progress.value = withDelay(delay, withRepeat(timing, loop, true));
    } else {
      progress.value = withDelay(delay, timing);
    }
  }, [animation, delay, duration, repeat, repeatCount, progress, loop]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    let opacity = 1;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let rotate = 0;
    let rotateX = 0;
    let rotateY = 0;

    switch (animation) {
      case "fade":
        opacity = p;
        break;

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

      case "scale":
        opacity = p;
        scale = 0.7 + 0.3 * p;
        break;

      case "scaleUp":
        opacity = p;
        scale = 0.5 + 0.5 * p;
        break;

      case "scaleDown":
        opacity = p;
        scale = 1.4 - 0.4 * p;
        break;

      case "zoomIn":
        scale = 0.7 + 0.3 * p;
        break;

      case "zoomOut":
        scale = 1.3 - 0.3 * p;
        break;

      case "bounce":
        translateY = interpolate(
          p,
          [0, 0.6, 0.8, 1],
          [50, -12, 5, 0],
          Extrapolation.CLAMP,
        );
        opacity = p;
        break;

      case "pulse":
        scale = interpolate(p, [0, 0.5, 1], [1, 1.12, 1], Extrapolation.CLAMP);
        break;

      case "float":
        translateY = interpolate(
          p,
          [0, 0.5, 1],
          [0, -12, 0],
          Extrapolation.CLAMP,
        );
        break;

      case "rotate":
        rotate = interpolate(p, [0, 1], [-8, 8], Extrapolation.CLAMP);
        break;

      case "rotateReverse":
        rotate = interpolate(p, [0, 1], [8, -8], Extrapolation.CLAMP);
        break;

      case "swing":
        rotate = interpolate(
          p,
          [0, 0.25, 0.5, 0.75, 1],
          [-12, 10, -8, 5, 0],
          Extrapolation.CLAMP,
        );
        break;

      case "shake":
        translateX = interpolate(
          p,
          [0, 0.2, 0.4, 0.6, 0.8, 1],
          [0, -8, 8, -6, 4, 0],
          Extrapolation.CLAMP,
        );
        break;

      case "flip":
      case "flipY":
        rotateY = interpolate(p, [0, 1], [90, 0], Extrapolation.CLAMP);
        break;

      case "flipX":
        rotateX = interpolate(p, [0, 1], [90, 0], Extrapolation.CLAMP);
        break;

      case "elastic":
        scale = interpolate(
          p,
          [0, 0.4, 0.7, 1],
          [0.4, 1.15, 0.95, 1],
          Extrapolation.CLAMP,
        );
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
  }, [animation]);

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated text                                                              */
/* -------------------------------------------------------------------------- */

const AnimatedText = memo(function AnimatedText({ item }) {
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

    animation = "none",
    delay = 0,
    duration = 600,

    repeat = false,
    repeatCount = -1,

    style,
    numberOfLines,
  } = item;

  return (
    <UIAnimatedElement
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      style={[
        carouselStyles.absoluteElement,
        {
          left: x,
          top: y,
          width,
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
          },
          style,
        ]}
      >
        {text}
      </Text>
    </UIAnimatedElement>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated image                                                            */
/* -------------------------------------------------------------------------- */

const AnimatedImage = memo(function AnimatedImage({ item }) {
  const {
    source,

    x = 0,
    y = 0,

    width = 100,
    height = 100,

    rotation,

    opacity = 1,

    resizeMode = "contain",

    animation = "none",
    delay = 0,
    duration = 600,

    repeat = false,
    repeatCount = -1,

    style,
  } = item;

  return (
    <UIAnimatedElement
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      style={[
        carouselStyles.absoluteElement,

        {
          left: x,
          top: y,

          width,
          height,

          opacity,

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
        style={StyleSheet.absoluteFillObject}
      />
    </UIAnimatedElement>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated icon                                                              */
/* -------------------------------------------------------------------------- */

const AnimatedIcon = memo(function AnimatedIcon({ item }) {
  const {
    name = "star",

    x = 0,
    y = 0,

    size = 24,

    color = "#FFFFFF",

    rotation,

    animation = "none",
    delay = 0,
    duration = 600,

    repeat = false,
    repeatCount = -1,

    style,
  } = item;

  const Icon = item.iconComponent;

  return (
    <UIAnimatedElement
      animation={animation}
      delay={delay}
      duration={duration}
      repeat={repeat}
      repeatCount={repeatCount}
      style={[
        carouselStyles.absoluteElement,

        {
          left: x,
          top: y,
        },

        style,
      ]}
    >
      {Icon ? (
        <Icon size={size} color={color} />
      ) : (
        <Ionicons name={name} size={size} color={color} />
      )}
    </UIAnimatedElement>
  );
});

/* -------------------------------------------------------------------------- */
/* Animated button                                                           */
/* -------------------------------------------------------------------------- */

const AnimatedButton = memo(function AnimatedButton({ item, onPress }) {
  const {
    text = "ORDER NOW",

    x = 20,
    y = 190,

    width,
    height = 44,

    backgroundColor = "#FF5A1F",

    borderRadius = 999,

    textColor = "#FFFFFF",

    fontSize = 14,
    fontWeight = "700",

    icon,

    iconSize = 18,
    iconColor,

    animation = "scale",
    delay = 400,
    duration = 500,

    style,
    textStyle,
  } = item;

  return (
    <UIAnimatedElement
      animation={animation}
      delay={delay}
      duration={duration}
      style={[
        carouselStyles.absoluteElement,

        {
          left: x,
          top: y,
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

            backgroundColor,

            alignItems: "center",
            justifyContent: "center",

            flexDirection: "row",
          },

          style,
        ]}
      >
        {icon ? (
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
      </Pressable>
    </UIAnimatedElement>
  );
});

/* -------------------------------------------------------------------------- */
/* Advanced slide                                                             */
/* -------------------------------------------------------------------------- */

const AdvancedCarouselSlide = memo(function AdvancedCarouselSlide({
  slide,
  width,
  height,

  onPress,
  onButtonPress,

  theme,
}) {
  const background = slide?.background ?? {};

  const backgroundType = background.type ?? "color";

  const backgroundColor = background.color ?? theme.colors.card ?? "#FFFFFF";

  const backgroundSource = background.source;

  return (
    <View
      style={{
        width,
        height,

        overflow: "hidden",

        position: "relative",

        backgroundColor,
      }}
    >
      {/* Background image */}

      {backgroundType === "image" && backgroundSource ? (
        <Image
          source={
            typeof backgroundSource === "string"
              ? {
                  uri: backgroundSource,
                }
              : backgroundSource
          }
          resizeMode={background.resizeMode ?? "cover"}
          style={[StyleSheet.absoluteFillObject, background.style]}
        />
      ) : null}

      {/* Background gradient */}

      {backgroundType === "gradient" ? (
        <LinearGradient
          colors={background.colors ?? ["#111111", "#333333"]}
          start={
            background.start ?? {
              x: 0,
              y: 0,
            }
          }
          end={
            background.end ?? {
              x: 1,
              y: 1,
            }
          }
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}

      {/* Background overlay */}

      {background.overlay ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,

            {
              backgroundColor: background.overlayColor ?? "#000000",

              opacity: background.overlayOpacity ?? 0.25,
            },
          ]}
        />
      ) : null}

      {/* Custom content */}

      {typeof slide.render === "function" ? slide.render() : null}

      {/* Text assets */}

      {Array.isArray(slide.texts)
        ? slide.texts.map((textItem, index) => (
            <AnimatedText
              key={textItem.id ?? `text-${index}`}
              item={textItem}
            />
          ))
        : null}

      {/* Image assets */}

      {Array.isArray(slide.images)
        ? slide.images.map((imageItem, index) => (
            <AnimatedImage
              key={imageItem.id ?? `image-${index}`}
              item={imageItem}
            />
          ))
        : null}

      {/* Icon assets */}

      {Array.isArray(slide.icons)
        ? slide.icons.map((iconItem, index) => (
            <AnimatedIcon
              key={iconItem.id ?? `icon-${index}`}
              item={iconItem}
            />
          ))
        : null}

      {/* Button */}

      {slide.button ? (
        <AnimatedButton
          item={slide.button}
          onPress={() => onButtonPress?.(slide)}
        />
      ) : null}

      {/* Entire slide press */}

      {onPress ? (
        <Pressable
          onPress={() => onPress(slide)}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="box-only"
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
    data = [],

    slides,

    width,

    height = 240,

    slideWidth,

    gap = 0,

    horizontalPadding = 0,

    borderRadius,

    margin = 0,

    marginHorizontal,
    marginVertical,

    marginTop,
    marginBottom,
    marginLeft,
    marginRight,

    style,

    autoplay = false,

    autoplayInterval = 3500,

    loop = true,

    pauseOnInteraction = true,

    scrollEnabled = true,

    showPagination = true,

    dotSize = 8,

    activeDotWidth,

    activeDotHeight,

    dotSpacing = 4,

    activeDotColor,

    inactiveDotColor,

    paginationStyle,

    onIndexChange,

    onPress,

    onButtonPress,

    initialIndex = 0,

    reanimated = true,

    renderItem,

    renderPagination,

    ...flatListProps
  },
  ref,
) {
  const { theme } = useUITheme();

  const colors = theme?.colors ?? {};

  const radius = theme?.radius ?? {};

  const resolvedData = Array.isArray(slides) ? slides : data;

  const count = resolvedData.length;

  const containerWidth = width ?? SCREEN_WIDTH;

  const resolvedSlideWidth = slideWidth ?? containerWidth;

  const resolvedRadius = borderRadius ?? radius.card ?? 18;

  const resolvedGap = gap;

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialIndex, Math.max(count - 1, 0)),
  );

  const flatListRef = useRef(null);

  const timerRef = useRef(null);

  const interactionRef = useRef(false);

  const scrollToIndex = useCallback(
    (index, animated = true) => {
      if (!count) {
        return;
      }

      let target = index;

      if (loop) {
        if (target >= count) {
          target = 0;
        }

        if (target < 0) {
          target = count - 1;
        }
      } else {
        target = Math.max(0, Math.min(target, count - 1));
      }

      flatListRef.current?.scrollToOffset({
        offset: target * (resolvedSlideWidth + resolvedGap),

        animated,
      });
    },
    [count, loop, resolvedSlideWidth, resolvedGap],
  );

  const next = useCallback(() => {
    if (count <= 1) {
      return;
    }

    if (currentIndex >= count - 1) {
      if (loop) {
        scrollToIndex(0);
      }

      return;
    }

    scrollToIndex(currentIndex + 1);
  }, [count, currentIndex, loop, scrollToIndex]);

  const previous = useCallback(() => {
    if (count <= 1) {
      return;
    }

    if (currentIndex <= 0) {
      if (loop) {
        scrollToIndex(count - 1);
      }

      return;
    }

    scrollToIndex(currentIndex - 1);
  }, [count, currentIndex, loop, scrollToIndex]);

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

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();

    if (!autoplay || count <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      if (interactionRef.current) {
        return;
      }

      next();
    }, autoplayInterval);
  }, [autoplay, count, autoplayInterval, next, stopAutoplay]);

  useEffect(() => {
    startAutoplay();

    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const handleScrollEnd = useCallback(
    (event) => {
      const offset = event.nativeEvent.contentOffset.x;

      const index = Math.round(offset / (resolvedSlideWidth + resolvedGap));

      const safeIndex = Math.max(0, Math.min(index, count - 1));

      if (safeIndex !== currentIndex) {
        setCurrentIndex(safeIndex);

        onIndexChange?.(safeIndex, resolvedData[safeIndex]);
      }
    },
    [
      resolvedSlideWidth,
      resolvedGap,
      count,
      currentIndex,
      onIndexChange,
      resolvedData,
    ],
  );

  const handleBeginDrag = useCallback(
    (event) => {
      interactionRef.current = true;

      if (pauseOnInteraction) {
        stopAutoplay();
      }

      flatListProps.onScrollBeginDrag?.(event);
    },
    [pauseOnInteraction, stopAutoplay, flatListProps],
  );

  const handleEndDrag = useCallback(
    (event) => {
      interactionRef.current = false;

      if (pauseOnInteraction) {
        startAutoplay();
      }

      flatListProps.onScrollEndDrag?.(event);
    },
    [pauseOnInteraction, startAutoplay, flatListProps],
  );

  const renderCarouselItem = useCallback(
    ({ item, index }) => {
      if (typeof renderItem === "function") {
        return (
          <View
            style={{
              width: resolvedSlideWidth,

              marginRight: resolvedGap,
            }}
          >
            {renderItem({
              item,
              index,
            })}
          </View>
        );
      }

      return (
        <View
          style={{
            width: resolvedSlideWidth,

            marginRight: resolvedGap,

            overflow: "hidden",

            borderRadius: resolvedRadius,
          }}
        >
          <AdvancedCarouselSlide
            slide={item}
            width={resolvedSlideWidth}
            height={height}
            onPress={onPress ? () => onPress(item, index) : undefined}
            onButtonPress={
              onButtonPress ? () => onButtonPress(item, index) : undefined
            }
            theme={theme}
          />
        </View>
      );
    },
    [
      renderItem,
      resolvedSlideWidth,
      resolvedGap,
      resolvedRadius,
      height,
      onPress,
      onButtonPress,
      theme,
    ],
  );

  const renderDots = () => {
    if (!showPagination || count <= 1) {
      return null;
    }

    if (typeof renderPagination === "function") {
      return renderPagination({
        currentIndex,
        count,
        scrollToIndex,
      });
    }

    return (
      <View style={[carouselStyles.pagination, paginationStyle]}>
        {resolvedData.map((_item, index) => {
          const active = index === currentIndex;

          return (
            <Pressable
              key={`dot-${index}`}
              hitSlop={8}
              onPress={() => scrollToIndex(index)}
              style={{
                width: active ? (activeDotWidth ?? dotSize * 2) : dotSize,

                height: activeDotHeight ?? dotSize,

                borderRadius: 999,

                marginHorizontal: dotSpacing / 2,

                backgroundColor: active
                  ? (activeDotColor ?? colors.primary ?? "#FF5A1F")
                  : (inactiveDotColor ?? "#D1D5DB"),
              }}
            />
          );
        })}
      </View>
    );
  };

  if (!count) {
    return null;
  }

  return (
    <View
      style={[
        carouselStyles.container,

        {
          width: containerWidth,

          marginTop: marginTop ?? marginVertical ?? margin,

          marginBottom: marginBottom ?? marginVertical ?? margin,

          marginLeft: marginLeft ?? marginHorizontal ?? margin,

          marginRight: marginRight ?? marginHorizontal ?? margin,

          paddingHorizontal: horizontalPadding,
        },

        style,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={resolvedData}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={resolvedSlideWidth + resolvedGap}
        snapToAlignment="start"
        disableIntervalMomentum
        nestedScrollEnabled
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={renderCarouselItem}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={handleBeginDrag}
        onScrollEndDrag={handleEndDrag}
        scrollEventThrottle={16}
        initialScrollIndex={initialIndex}
        getItemLayout={(_data, index) => ({
          length: resolvedSlideWidth + resolvedGap,

          offset: (resolvedSlideWidth + resolvedGap) * index,

          index,
        })}
        {...flatListProps}
      />

      {renderDots()}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const carouselStyles = StyleSheet.create({
  container: {
    position: "relative",
  },

  absoluteElement: {
    position: "absolute",

    zIndex: 5,
  },

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,

    bottom: 12,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 100,
  },
});

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export {
  UICarousel,
  UIAnimatedElement,
  AnimatedText,
  AnimatedImage,
  AnimatedIcon,
};

export default memo(UICarousel);
