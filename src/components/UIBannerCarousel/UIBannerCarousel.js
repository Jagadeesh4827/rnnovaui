import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";

/* =========================================================
   PUBLIC CONSTANTS
========================================================= */

const BACKGROUND_ANIMATIONS = [
  "none",
  "rays",
  "pulse",
  "float",
  "zoom",
  "kenBurns",
];

const ASSET_ANIMATIONS = ["none", "float", "pulse", "rotate", "zoom", "bounce"];

const CONTENT_ANIMATIONS = ["none", "fade", "slideUp", "slideLeft", "scale"];

/* =========================================================
   HELPERS
========================================================= */

function getImageSource(source) {
  if (!source) {
    return null;
  }

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return {
      uri: source,
    };
  }

  if (source?.uri) {
    return source;
  }

  return source;
}

function isValidReactElement(value) {
  return React.isValidElement(value);
}

/* =========================================================
   BACKGROUND ANIMATION
========================================================= */

function BackgroundAnimation({ animation = "none", enabled = false }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled || animation === "none") {
      progress.value = 0;
      return;
    }

    if (animation === "pulse") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    if (animation === "float") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    if (animation === "zoom" || animation === "kenBurns") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    progress.value = 0;
  }, [animation, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(progress.value, [0, 1], [0.85, 1]),
      };
    }

    if (animation === "float") {
      return {
        transform: [
          {
            translateY: interpolate(progress.value, [0, 1], [0, -6]),
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(progress.value, [0, 1], [1, 1.06]),
          },
        ],
      };
    }

    if (animation === "kenBurns") {
      return {
        transform: [
          {
            scale: interpolate(progress.value, [0, 1], [1, 1.1]),
          },
          {
            translateX: interpolate(progress.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    return {};
  });

  return animatedStyle;
}

/* =========================================================
   RAYS
========================================================= */

function BannerRays({ enabled = false, color = "#FFFFFF", opacity = 0.12 }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      rotation.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(1, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled) {
      return {};
    }

    return {
      transform: [
        {
          rotate: `${interpolate(rotation.value, [0, 1], [-8, 8])}deg`,
        },
      ],
    };
  });

  if (!enabled) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.raysContainer, animatedStyle]}
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`ray-${index}`}
          pointerEvents="none"
          style={[
            styles.ray,
            {
              backgroundColor: color,
              opacity,
              transform: [
                {
                  rotate: `${index * 20}deg`,
                },
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function BannerBackground({ banner, width, height, radius, reanimated }) {
  const background = banner?.background || {};

  /*
   * -------------------------------------------------------
   * BACKGROUND TYPE
   * -------------------------------------------------------
   *
   * Supports:
   *
   * background: {
   *   type: "color",
   *   color: "#E91E63"
   * }
   *
   * background: {
   *   type: "gradient",
   *   colors: [...]
   * }
   *
   * background: {
   *   type: "image",
   *   source: ...
   * }
   *
   * Also shortcuts:
   *
   * backgroundColor
   * gradientColors
   * backgroundImage
   */

  const backgroundType =
    background?.type ||
    (banner?.backgroundImage
      ? "image"
      : banner?.gradientColors
        ? "gradient"
        : "color");

  const backgroundAnimation =
    banner?.backgroundAnimation || background?.animation || "none";

  const animatedStyle = BackgroundAnimation({
    animation: backgroundAnimation,
    enabled: reanimated,
  });

  /* =======================================================
     COLOR
  ======================================================= */

  if (backgroundType === "color") {
    const color = background?.color || banner?.backgroundColor || "#E91E63";

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.backgroundContainer,
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: color,
          },
        ]}
      >
        {backgroundAnimation === "rays" ? (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || banner?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? banner?.raysOpacity ?? 0.12}
          />
        ) : null}

        {reanimated && backgroundAnimation === "pulse" ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.backgroundGlow, animatedStyle]}
          />
        ) : null}
      </View>
    );
  }

  /* =======================================================
     GRADIENT
  ======================================================= */

  if (backgroundType === "gradient") {
    const colors = background?.colors ||
      banner?.gradientColors || ["#E91E63", "#9C27B0"];

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.backgroundContainer,
          {
            width,
            height,
            borderRadius: radius,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={
            background?.start ||
            banner?.gradientStart || {
              x: 0,
              y: 0,
            }
          }
          end={
            background?.end ||
            banner?.gradientEnd || {
              x: 1,
              y: 1,
            }
          }
          locations={background?.locations || banner?.gradientLocations}
          style={[
            StyleSheet.absoluteFillObject,
            {
              width,
              height,
            },
          ]}
        />

        {backgroundAnimation === "rays" ? (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || banner?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? banner?.raysOpacity ?? 0.12}
          />
        ) : null}

        {reanimated &&
        backgroundAnimation !== "none" &&
        backgroundAnimation !== "rays" ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.backgroundGlow, animatedStyle]}
          />
        ) : null}
      </View>
    );
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  if (backgroundType === "image") {
    const source = getImageSource(
      background?.source || background?.image || banner?.backgroundImage,
    );

    if (!source) {
      return (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.backgroundContainer,
            {
              width,
              height,
              borderRadius: radius,
              backgroundColor:
                background?.fallbackColor ||
                banner?.backgroundColor ||
                "#E91E63",
            },
          ]}
        />
      );
    }

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.backgroundContainer,
          {
            width,
            height,
            borderRadius: radius,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            reanimated ? animatedStyle : undefined,
          ]}
        >
          <Image
            source={source}
            resizeMode={
              background?.resizeMode ||
              banner?.backgroundImageResizeMode ||
              "cover"
            }
            style={[
              StyleSheet.absoluteFillObject,
              {
                width,
                height,
              },
            ]}
          />
        </Animated.View>

        {banner?.backgroundOverlay ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: banner.backgroundOverlay,
              },
            ]}
          />
        ) : null}

        {backgroundAnimation === "rays" ? (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || banner?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? banner?.raysOpacity ?? 0.12}
          />
        ) : null}
      </View>
    );
  }

  /* =======================================================
     FALLBACK
  ======================================================= */

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: banner?.backgroundColor || "#E91E63",
        },
      ]}
    />
  );
}

/* =========================================================
   ASSET ANIMATION
========================================================= */

function BannerAsset({ item, type = "image", enabled = false }) {
  const progress = useSharedValue(0);

  const animation = item?.animation || "none";

  useEffect(() => {
    if (!enabled || animation === "none") {
      progress.value = 0;
      return;
    }

    if (animation === "float") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    if (animation === "pulse") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 900,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    if (animation === "rotate") {
      progress.value = withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      return;
    }

    if (animation === "zoom") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      return;
    }

    if (animation === "bounce") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 500,
            easing: Easing.out(Easing.ease),
          }),
          withTiming(0, {
            duration: 500,
            easing: Easing.in(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    }
  }, [animation, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    if (animation === "float") {
      return {
        transform: [
          {
            translateY: interpolate(progress.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(progress.value, [0, 1], [1, 0.75]),
        transform: [
          {
            scale: interpolate(progress.value, [0, 1], [1, 1.05]),
          },
        ],
      };
    }

    if (animation === "rotate") {
      return {
        transform: [
          {
            rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg`,
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(progress.value, [0, 1], [1, 1.08]),
          },
        ],
      };
    }

    if (animation === "bounce") {
      return {
        transform: [
          {
            translateY: interpolate(progress.value, [0, 1], [0, -12]),
          },
        ],
      };
    }

    return {};
  });

  const position = item?.position || {};

  const assetStyle = {
    position: "absolute",

    left: position.left,
    right: position.right,
    top: position.top,
    bottom: position.bottom,

    width: item?.width || (type === "icon" ? 36 : 120),

    height: item?.height || (type === "icon" ? 36 : 120),

    opacity: item?.opacity ?? 1,

    zIndex: item?.zIndex ?? 5,

    transform: [
      {
        rotate: `${item?.rotate || 0}deg`,
      },
    ],

    ...item?.style,
  };

  /* =======================================================
     ICON
  ======================================================= */

  if (type === "icon" && isValidReactElement(item?.icon)) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          assetStyle,
          enabled ? animatedStyle : undefined,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {item.icon}
      </Animated.View>
    );
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  const source = getImageSource(item?.source || item?.image);

  if (!source) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[assetStyle, enabled ? animatedStyle : undefined]}
    >
      <Image
        source={source}
        resizeMode={item?.resizeMode || "contain"}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function BannerContent({ banner, enabled }) {
  const animation = banner?.contentAnimation || "none";

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled || animation === "none") {
      progress.value = 0;
      return;
    }

    progress.value = 0;

    progress.value = withTiming(1, {
      duration: banner?.contentAnimationDuration || 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [animation, enabled, banner?.contentAnimationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    if (animation === "fade") {
      return {
        opacity: progress.value,
      };
    }

    if (animation === "slideUp") {
      return {
        opacity: progress.value,
        transform: [
          {
            translateY: interpolate(progress.value, [0, 1], [25, 0]),
          },
        ],
      };
    }

    if (animation === "slideLeft") {
      return {
        opacity: progress.value,
        transform: [
          {
            translateX: interpolate(progress.value, [0, 1], [35, 0]),
          },
        ],
      };
    }

    if (animation === "scale") {
      return {
        opacity: progress.value,
        transform: [
          {
            scale: interpolate(progress.value, [0, 1], [0.85, 1]),
          },
        ],
      };
    }

    return {};
  });

  /* =======================================================
     CUSTOM CONTENT
  ======================================================= */

  if (typeof banner?.renderContent === "function") {
    return (
      <Animated.View
        style={[
          styles.content,
          banner?.contentStyle,
          enabled ? animatedStyle : undefined,
        ]}
      >
        {banner.renderContent(banner)}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.content,
        banner?.contentStyle,
        enabled ? animatedStyle : undefined,
      ]}
    >
      {/* BADGE */}

      {banner?.badge ? (
        <View style={[styles.badge, banner?.badgeStyle]}>
          {isValidReactElement(banner?.badgeIcon) ? (
            <View style={styles.badgeIcon}>{banner.badgeIcon}</View>
          ) : null}

          <Text style={[styles.badgeText, banner?.badgeTextStyle]}>
            {banner.badge}
          </Text>
        </View>
      ) : null}

      {/* EYEBROW */}

      {banner?.eyebrow ? (
        <Text style={[styles.eyebrow, banner?.eyebrowStyle]}>
          {banner.eyebrow}
        </Text>
      ) : null}

      {/* TITLE */}

      {banner?.title ? (
        <Text
          numberOfLines={banner?.titleNumberOfLines || 2}
          style={[styles.title, banner?.titleStyle]}
        >
          {banner.title}
        </Text>
      ) : null}

      {/* SUBTITLE */}

      {banner?.subtitle ? (
        <Text
          numberOfLines={banner?.subtitleNumberOfLines || 2}
          style={[styles.subtitle, banner?.subtitleStyle]}
        >
          {banner.subtitle}
        </Text>
      ) : null}

      {/* BUTTON */}

      {banner?.buttonText ? (
        <Pressable
          onPress={banner?.onButtonPress}
          disabled={typeof banner?.onButtonPress !== "function"}
          style={[styles.button, banner?.buttonStyle]}
        >
          {isValidReactElement(banner?.buttonIcon) ? (
            <View style={styles.buttonIcon}>{banner.buttonIcon}</View>
          ) : null}

          <Text style={[styles.buttonText, banner?.buttonTextStyle]}>
            {banner.buttonText}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/* =========================================================
   BANNER SLIDE
========================================================= */

function BannerSlide({
  banner,
  index,
  width,
  height,
  radius,
  reanimated,
  onPress,
}) {
  const handlePress =
    typeof onPress === "function"
      ? () => onPress(banner, index)
      : typeof banner?.onPress === "function"
        ? () => banner.onPress(banner, index)
        : undefined;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!handlePress}
      style={[
        styles.slide,
        {
          width,
          height,
          borderRadius: radius,
        },
        banner?.slideStyle,
      ]}
    >
      {/* BACKGROUND */}

      <BannerBackground
        banner={banner}
        width={width}
        height={height}
        radius={radius}
        reanimated={reanimated}
      />

      {/* GENERAL OVERLAY */}

      {banner?.overlay ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: banner.overlay,
              borderRadius: radius,
            },
          ]}
        />
      ) : null}

      {/* FOREGROUND IMAGES */}

      {Array.isArray(banner?.images)
        ? banner.images.map((item, imageIndex) => (
            <BannerAsset
              key={item?.id || `image-${index}-${imageIndex}`}
              item={item}
              type="image"
              enabled={reanimated}
            />
          ))
        : null}

      {/* FOREGROUND ICONS */}

      {Array.isArray(banner?.icons)
        ? banner.icons.map((item, iconIndex) => (
            <BannerAsset
              key={item?.id || `icon-${index}-${iconIndex}`}
              item={item}
              type="icon"
              enabled={reanimated}
            />
          ))
        : null}

      {/* TEXT CONTENT */}

      <BannerContent banner={banner} enabled={reanimated} />
    </Pressable>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function UIBannerCarousel({
  banners = [],

  width,
  height = 190,

  radius = 18,
  gap = 0,

  autoplay = true,
  interval = 3500,

  loop = true,
  swipe = true,

  pagination = true,
  navigation = false,

  initialIndex = 0,

  reanimated = false,

  style,
  containerStyle,
  contentContainerStyle,

  paginationStyle,
  dotStyle,
  activeDotStyle,

  navigationButtonStyle,
  navigationTextStyle,

  leftArrow,
  rightArrow,

  onIndexChange,
  onPress,
}) {
  const { width: windowWidth } = useWindowDimensions();

  const scrollRef = useRef(null);

  const timerRef = useRef(null);

  const currentIndexRef = useRef(0);

  const [layoutWidth, setLayoutWidth] = useState(width || windowWidth);

  const [currentIndex, setCurrentIndex] = useState(0);

  const total = Array.isArray(banners) ? banners.length : 0;

  const carouselWidth = width || layoutWidth || windowWidth;

  /*
   * The actual slide width.
   *
   * When gap = 0:
   * slide width = carousel width
   *
   * When gap > 0:
   * slide width = carousel width - gap
   */

  const itemWidth = Math.max(carouselWidth - gap, 1);

  /* =======================================================
     UPDATE INDEX
  ======================================================= */

  const updateIndex = useCallback(
    (index) => {
      if (total <= 0) {
        return;
      }

      const safeIndex = Math.max(0, Math.min(index, total - 1));

      currentIndexRef.current = safeIndex;

      setCurrentIndex(safeIndex);

      if (typeof onIndexChange === "function") {
        onIndexChange(safeIndex);
      }
    },
    [total, onIndexChange],
  );

  /* =======================================================
     CLEAR AUTOPLAY
  ======================================================= */

  const clearAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }, []);

  /* =======================================================
     SCROLL TO INDEX
  ======================================================= */

  const scrollToIndex = useCallback(
    (requestedIndex, animated = true) => {
      if (!scrollRef.current || total <= 0) {
        return;
      }

      let nextIndex = requestedIndex;

      if (loop) {
        if (nextIndex < 0) {
          nextIndex = total - 1;
        }

        if (nextIndex >= total) {
          nextIndex = 0;
        }
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, total - 1));
      }

      scrollRef.current.scrollTo({
        x: nextIndex * itemWidth,
        y: 0,
        animated,
      });

      updateIndex(nextIndex);
    },
    [total, loop, itemWidth, updateIndex],
  );

  /* =======================================================
     START AUTOPLAY
  ======================================================= */

  const startAutoplay = useCallback(() => {
    clearAutoplay();

    if (!autoplay || total <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      const current = currentIndexRef.current;

      if (!loop && current >= total - 1) {
        clearAutoplay();
        return;
      }

      scrollToIndex(current + 1, true);
    }, interval);
  }, [autoplay, total, loop, interval, clearAutoplay, scrollToIndex]);

  /* =======================================================
     AUTOPLAY EFFECT
  ======================================================= */

  useEffect(() => {
    startAutoplay();

    return () => {
      clearAutoplay();
    };
  }, [startAutoplay, clearAutoplay]);

  /* =======================================================
     INITIAL INDEX
  ======================================================= */

  useEffect(() => {
    if (total <= 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(initialIndex, total - 1));

    currentIndexRef.current = safeIndex;

    setCurrentIndex(safeIndex);

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: safeIndex * itemWidth,
        y: 0,
        animated: false,
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [initialIndex, total, itemWidth]);

  /* =======================================================
     LAYOUT
  ======================================================= */

  const handleLayout = useCallback(
    (event) => {
      if (width) {
        return;
      }

      const measuredWidth = event.nativeEvent.layout.width;

      if (measuredWidth > 0 && measuredWidth !== layoutWidth) {
        setLayoutWidth(measuredWidth);
      }
    },
    [width, layoutWidth],
  );

  /* =======================================================
     MOMENTUM END
  ======================================================= */

  const handleMomentumEnd = useCallback(
    (event) => {
      const x = event.nativeEvent.contentOffset.x;

      const index = Math.round(x / itemWidth);

      updateIndex(index);

      if (autoplay) {
        startAutoplay();
      }
    },
    [itemWidth, updateIndex, autoplay, startAutoplay],
  );

  /* =======================================================
     DRAG START
  ======================================================= */

  const handleDragStart = useCallback(() => {
    clearAutoplay();
  }, [clearAutoplay]);

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const handlePrevious = useCallback(() => {
    clearAutoplay();

    scrollToIndex(currentIndexRef.current - 1, true);

    startAutoplay();
  }, [clearAutoplay, scrollToIndex, startAutoplay]);

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = useCallback(() => {
    clearAutoplay();

    scrollToIndex(currentIndexRef.current + 1, true);

    startAutoplay();
  }, [clearAutoplay, scrollToIndex, startAutoplay]);

  /* =======================================================
     EMPTY
  ======================================================= */

  if (total === 0) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          width: width || "100%",
        },
        containerStyle,
        style,
      ]}
    >
      {/* =================================================
          CAROUSEL
      ================================================= */}

      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={swipe}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        pagingEnabled={gap === 0}
        decelerationRate="fast"
        snapToInterval={gap > 0 ? itemWidth : undefined}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={[
          gap > 0
            ? {
                paddingHorizontal: gap / 2,
              }
            : undefined,
          contentContainerStyle,
        ]}
        onScrollBeginDrag={handleDragStart}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {banners.map((banner, index) => (
          <View
            key={banner?.id || `banner-${index}`}
            style={{
              width: itemWidth,
              marginHorizontal: gap > 0 ? gap / 2 : 0,
            }}
          >
            <BannerSlide
              banner={banner}
              index={index}
              width={itemWidth}
              height={height}
              radius={radius}
              reanimated={reanimated}
              onPress={onPress}
            />
          </View>
        ))}
      </ScrollView>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      {navigation && total > 1 ? (
        <>
          <Pressable
            onPress={handlePrevious}
            style={[
              styles.navigationButton,
              styles.navigationLeft,
              navigationButtonStyle,
            ]}
          >
            {leftArrow || (
              <Text style={[styles.navigationText, navigationTextStyle]}>
                ‹
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={[
              styles.navigationButton,
              styles.navigationRight,
              navigationButtonStyle,
            ]}
          >
            {rightArrow || (
              <Text style={[styles.navigationText, navigationTextStyle]}>
                ›
              </Text>
            )}
          </Pressable>
        </>
      ) : null}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {pagination && total > 1 ? (
        <View pointerEvents="none" style={[styles.pagination, paginationStyle]}>
          {banners.map((_, index) => {
            const active = index === currentIndex;

            return (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  dotStyle,
                  active && styles.activeDot,
                  active && activeDotStyle,
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  slide: {
    position: "relative",
    overflow: "hidden",
  },

  backgroundContainer: {
    overflow: "hidden",
  },

  backgroundGlow: {
    position: "absolute",

    width: 190,
    height: 190,

    right: -35,
    top: -35,

    borderRadius: 100,

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  /* =======================================================
     RAYS
  ======================================================= */

  raysContainer: {
    position: "absolute",

    width: "150%",
    height: "200%",

    left: "-25%",
    top: "-50%",

    justifyContent: "center",
    alignItems: "center",
  },

  ray: {
    position: "absolute",

    width: 18,
    height: "100%",

    borderRadius: 20,
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  content: {
    position: "relative",

    zIndex: 30,

    width: "68%",

    paddingHorizontal: 20,
    paddingVertical: 18,

    justifyContent: "center",
    alignItems: "flex-start",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 5,

    marginBottom: 7,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.20)",
  },

  badgeIcon: {
    marginRight: 5,
  },

  badgeText: {
    color: "#FFFFFF",

    fontSize: 11,
    fontWeight: "700",
  },

  eyebrow: {
    color: "#FFFFFF",

    fontSize: 12,
    fontWeight: "700",

    marginBottom: 4,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 25,
    lineHeight: 29,

    fontWeight: "800",
  },

  subtitle: {
    color: "rgba(255,255,255,0.90)",

    fontSize: 13,
    lineHeight: 18,

    marginTop: 6,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 12,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 20,

    backgroundColor: "#FFFFFF",
  },

  buttonIcon: {
    marginRight: 6,
  },

  buttonText: {
    color: "#222222",

    fontSize: 12,
    fontWeight: "800",
  },

  /* =======================================================
     PAGINATION
  ======================================================= */

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 9,

    zIndex: 50,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    width: 6,
    height: 6,

    marginHorizontal: 3,

    borderRadius: 3,

    backgroundColor: "rgba(255,255,255,0.55)",
  },

  activeDot: {
    width: 18,

    backgroundColor: "#FFFFFF",
  },

  /* =======================================================
     NAVIGATION
  ======================================================= */

  navigationButton: {
    position: "absolute",

    top: "50%",
    marginTop: -18,

    width: 36,
    height: 36,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.25)",

    zIndex: 60,
  },

  navigationLeft: {
    left: 10,
  },

  navigationRight: {
    right: 10,
  },

  navigationText: {
    color: "#FFFFFF",

    fontSize: 30,
    lineHeight: 32,

    fontWeight: "400",
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export default UIBannerCarousel;

export {
  UIBannerCarousel,
  BACKGROUND_ANIMATIONS as UIBannerCarouselBackgroundAnimations,
  ASSET_ANIMATIONS as UIBannerCarouselAssetAnimations,
  CONTENT_ANIMATIONS as UIBannerCarouselContentAnimations,
};
