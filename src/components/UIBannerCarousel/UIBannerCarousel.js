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

function AnimatedBackground({ animation = "none", enabled = false }) {
  const value = useSharedValue(0);

  useEffect(() => {
    if (!enabled || animation === "none") {
      value.value = 0;
      return;
    }

    if (animation === "pulse") {
      value.value = withRepeat(
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
      value.value = withRepeat(
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
      value.value = withRepeat(
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

    if (animation === "rays") {
      value.value = withRepeat(
        withTiming(1, {
          duration: 9000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      return;
    }

    value.value = 0;
  }, [animation, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(value.value, [0, 1], [0.85, 1]),
      };
    }

    if (animation === "float") {
      return {
        transform: [
          {
            translateY: interpolate(value.value, [0, 1], [0, -5]),
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(value.value, [0, 1], [1, 1.06]),
          },
        ],
      };
    }

    if (animation === "kenBurns") {
      return {
        transform: [
          {
            scale: interpolate(value.value, [0, 1], [1, 1.1]),
          },
          {
            translateX: interpolate(value.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    if (animation === "rays") {
      return {
        transform: [
          {
            rotate: `${interpolate(value.value, [0, 1], [-8, 8])}deg`,
          },
        ],
      };
    }

    return {};
  });

  return {
    animatedStyle,
  };
}

/* =========================================================
   RAYS
========================================================= */

function BannerRays({ enabled, color = "#FFFFFF", opacity = 0.12 }) {
  const value = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      value.value = 0;
      return;
    }

    value.value = withRepeat(
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
          rotate: `${interpolate(value.value, [0, 1], [-8, 8])}deg`,
        },
      ],
    };
  });

  if (!enabled) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.rays, animatedStyle]}>
      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`ray-${index}`}
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

function BannerBackground({
  background,
  backgroundAnimation,
  reanimated,
  width,
  height,
  radius,
}) {
  const type = background?.type || "color";

  const { animatedStyle } = AnimatedBackground({
    animation: backgroundAnimation,
    enabled: reanimated,
  });

  /* ---------------- COLOR ---------------- */

  if (type === "color") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: radius,
            overflow: "hidden",
            backgroundColor: background?.color || "#E91E63",
          },
        ]}
      >
        {backgroundAnimation === "rays" && (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? 0.12}
          />
        )}

        {reanimated && backgroundAnimation === "pulse" ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.backgroundGlow, animatedStyle]}
          />
        ) : null}
      </View>
    );
  }

  /* ---------------- GRADIENT ---------------- */

  if (type === "gradient") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: radius,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={background?.colors || ["#F43F5E", "#C026D3"]}
          start={
            background?.start || {
              x: 0,
              y: 0,
            }
          }
          end={
            background?.end || {
              x: 1,
              y: 1,
            }
          }
          style={StyleSheet.absoluteFillObject}
        />

        {backgroundAnimation === "rays" && (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? 0.12}
          />
        )}

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

  /* ---------------- IMAGE ---------------- */

  if (type === "image") {
    const source = getImageSource(background?.source);

    if (!source) {
      return (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: radius,
              backgroundColor: background?.fallbackColor || "#E91E63",
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
          {
            borderRadius: radius,
            overflow: "hidden",
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
            resizeMode={background?.resizeMode || "cover"}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {backgroundAnimation === "rays" && (
          <BannerRays
            enabled={reanimated}
            color={background?.raysColor || "#FFFFFF"}
            opacity={background?.raysOpacity ?? 0.12}
          />
        )}
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderRadius: radius,
          backgroundColor: "#E91E63",
        },
      ]}
    />
  );
}

/* =========================================================
   ASSET ANIMATION
========================================================= */

function BannerAsset({ item, type = "image", enabled = false }) {
  const value = useSharedValue(0);

  const animation = item?.animation || "none";

  useEffect(() => {
    if (!enabled || animation === "none") {
      value.value = 0;
      return;
    }

    if (animation === "float") {
      value.value = withRepeat(
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
      value.value = withRepeat(
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
      value.value = withRepeat(
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
      value.value = withRepeat(
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
      value.value = withRepeat(
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
            translateY: interpolate(value.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(value.value, [0, 1], [1, 0.75]),
        transform: [
          {
            scale: interpolate(value.value, [0, 1], [1, 1.05]),
          },
        ],
      };
    }

    if (animation === "rotate") {
      return {
        transform: [
          {
            rotate: `${interpolate(value.value, [0, 1], [0, 360])}deg`,
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(value.value, [0, 1], [1, 1.08]),
          },
        ],
      };
    }

    if (animation === "bounce") {
      return {
        transform: [
          {
            translateY: interpolate(value.value, [0, 1], [0, -12]),
          },
        ],
      };
    }

    return {};
  });

  const position = item?.position || {};

  const baseStyle = {
    position: "absolute",

    left: position.left,
    right: position.right,
    top: position.top,
    bottom: position.bottom,

    width: item?.width || (type === "icon" ? 36 : 120),

    height: item?.height || (type === "icon" ? 36 : 120),

    opacity: item?.opacity ?? 1,

    zIndex: item?.zIndex ?? 2,

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
          baseStyle,
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
      style={[baseStyle, enabled ? animatedStyle : undefined]}
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

  const value = useSharedValue(0);

  useEffect(() => {
    if (!enabled || animation === "none") {
      value.value = 0;
      return;
    }

    value.value = 0;

    value.value = withTiming(1, {
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
        opacity: value.value,
      };
    }

    if (animation === "slideUp") {
      return {
        opacity: value.value,
        transform: [
          {
            translateY: interpolate(value.value, [0, 1], [25, 0]),
          },
        ],
      };
    }

    if (animation === "slideLeft") {
      return {
        opacity: value.value,
        transform: [
          {
            translateX: interpolate(value.value, [0, 1], [35, 0]),
          },
        ],
      };
    }

    if (animation === "scale") {
      return {
        opacity: value.value,
        transform: [
          {
            scale: interpolate(value.value, [0, 1], [0.85, 1]),
          },
        ],
      };
    }

    return {};
  });

  const contentStyle = [
    styles.content,
    banner?.contentStyle,
    enabled ? animatedStyle : undefined,
  ];

  /* =======================================================
     CUSTOM CONTENT
  ======================================================= */

  if (typeof banner?.renderContent === "function") {
    return (
      <Animated.View style={contentStyle}>
        {banner.renderContent(banner)}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={contentStyle}>
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
          disabled={!banner?.onButtonPress}
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
   SINGLE BANNER
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
  const background = banner?.background || {
    type: "color",
    color: "#E91E63",
  };

  const backgroundAnimation = banner?.backgroundAnimation || "none";

  const handlePress = () => {
    if (onPress) {
      onPress(banner, index);
    }

    if (typeof banner?.onPress === "function") {
      banner.onPress(banner, index);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress && typeof banner?.onPress !== "function"}
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
        background={background}
        backgroundAnimation={backgroundAnimation}
        reanimated={reanimated}
        width={width}
        height={height}
        radius={radius}
      />

      {/* OVERLAY */}

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

      {/* IMAGES */}

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

      {/* ICONS */}

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

      {/* CONTENT */}

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

  leftArrow,
  rightArrow,

  onIndexChange,
  onPress,
}) {
  const { width: screenWidth } = useWindowDimensions();

  const scrollRef = useRef(null);

  const timerRef = useRef(null);

  const currentIndexRef = useRef(0);

  const [layoutWidth, setLayoutWidth] = useState(width || screenWidth);

  const [currentIndex, setCurrentIndex] = useState(0);

  const total = Array.isArray(banners) ? banners.length : 0;

  const carouselWidth = width || layoutWidth || screenWidth;

  const itemWidth = Math.max(carouselWidth - gap, 1);

  /* =======================================================
     CURRENT INDEX
  ======================================================= */

  const updateIndex = useCallback(
    (index) => {
      if (total <= 0) {
        return;
      }

      const safeIndex = Math.max(0, Math.min(index, total - 1));

      currentIndexRef.current = safeIndex;

      setCurrentIndex(safeIndex);

      if (onIndexChange) {
        onIndexChange(safeIndex);
      }
    },
    [total, onIndexChange],
  );

  /* =======================================================
     CLEAR AUTOPLAY
  ======================================================= */

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }, []);

  /* =======================================================
     SCROLL
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
     AUTOPLAY
  ======================================================= */

  const startAutoplay = useCallback(() => {
    clearTimer();

    if (!autoplay || total <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      const current = currentIndexRef.current;

      if (!loop && current >= total - 1) {
        clearTimer();
        return;
      }

      scrollToIndex(current + 1, true);
    }, interval);
  }, [autoplay, total, loop, interval, clearTimer, scrollToIndex]);

  useEffect(() => {
    startAutoplay();

    return () => {
      clearTimer();
    };
  }, [startAutoplay, clearTimer]);

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

  const handleLayout = (event) => {
    if (width) {
      return;
    }

    const measuredWidth = event.nativeEvent.layout.width;

    if (measuredWidth > 0 && measuredWidth !== layoutWidth) {
      setLayoutWidth(measuredWidth);
    }
  };

  /* =======================================================
     MOMENTUM
  ======================================================= */

  const handleMomentumEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;

    const index = Math.round(x / itemWidth);

    updateIndex(index);

    if (autoplay) {
      startAutoplay();
    }
  };

  /* =======================================================
     DRAG START
  ======================================================= */

  const handleDragStart = () => {
    clearTimer();
  };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const handlePrevious = () => {
    clearTimer();

    scrollToIndex(currentIndexRef.current - 1, true);

    startAutoplay();
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    clearTimer();

    scrollToIndex(currentIndexRef.current + 1, true);

    startAutoplay();
  };

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
        {
          width: width || "100%",
        },
        containerStyle,
        style,
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={gap === 0}
        scrollEnabled={swipe}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={gap > 0 ? itemWidth : undefined}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={[
          gap > 0
            ? {
                paddingHorizontal: gap / 2,
              }
            : null,
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

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      {navigation && total > 1 ? (
        <>
          <Pressable
            onPress={handlePrevious}
            style={[styles.navigationButton, styles.navigationLeft]}
          >
            {leftArrow || <Text style={styles.arrow}>‹</Text>}
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={[styles.navigationButton, styles.navigationRight]}
          >
            {rightArrow || <Text style={styles.arrow}>›</Text>}
          </Pressable>
        </>
      ) : null}

      {/* ===================================================
          PAGINATION
      =================================================== */}

      {pagination && total > 1 ? (
        <View style={[styles.pagination, paginationStyle]}>
          {banners.map((_, index) => (
            <Pressable
              key={`dot-${index}`}
              disabled
              style={[
                styles.dot,
                dotStyle,
                index === currentIndex && {
                  width: 18,
                },
                index === currentIndex && activeDotStyle,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  slide: {
    position: "relative",
    overflow: "hidden",
  },

  /* -------------------------------------------------------
     BACKGROUND
  ------------------------------------------------------- */

  backgroundGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: -30,
    top: -30,
  },

  /* -------------------------------------------------------
     RAYS
  ------------------------------------------------------- */

  rays: {
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

  /* -------------------------------------------------------
     CONTENT
  ------------------------------------------------------- */

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

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.20)",

    marginBottom: 7,
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

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

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

  arrow: {
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
