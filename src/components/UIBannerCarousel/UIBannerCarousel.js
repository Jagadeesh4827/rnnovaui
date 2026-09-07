import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  Animated as RNAnimated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   HELPERS
========================================================= */

const isValidElement = (value) => {
  return React.isValidElement(value);
};

const getAssetSource = (source) => {
  if (!source) return null;

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return { uri: source };
  }

  if (source?.uri) {
    return source;
  }

  return source;
};

/* =========================================================
   BACKGROUND
========================================================= */

function BannerBackground({
  background,
  animation,
  enabled,
  width,
  height,
  borderRadius,
}) {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (!enabled || !animation || animation === "none") {
      animationValue.value = 0;
      return;
    }

    if (animation === "pulse") {
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
        withTiming(1, {
          duration: 9000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      return;
    }

    animationValue.value = 0;
  }, [animation, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || !animation || animation === "none") {
      return {};
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(animationValue.value, [0, 1], [0.9, 1]),
      };
    }

    if (animation === "float") {
      return {
        transform: [
          {
            translateY: interpolate(animationValue.value, [0, 1], [0, -6]),
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(animationValue.value, [0, 1], [1, 1.06]),
          },
        ],
      };
    }

    if (animation === "kenBurns") {
      return {
        transform: [
          {
            scale: interpolate(animationValue.value, [0, 1], [1, 1.1]),
          },
          {
            translateX: interpolate(animationValue.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    if (animation === "rays") {
      return {
        transform: [
          {
            rotate: `${interpolate(animationValue.value, [0, 1], [-8, 8])}deg`,
          },
        ],
      };
    }

    return {};
  });

  const backgroundType = background?.type || "color";

  /* ---------------- COLOR ---------------- */

  if (backgroundType === "color") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: background?.color || "#E91E63",
            borderRadius,
            overflow: "hidden",
          },
        ]}
      />
    );
  }

  /* ---------------- GRADIENT ---------------- */

  if (backgroundType === "gradient") {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={background?.colors || ["#E91E63", "#9C27B0"]}
          start={background?.start || { x: 0, y: 0 }}
          end={background?.end || { x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {enabled && animation && animation !== "none" && (
          <Animated.View
            pointerEvents="none"
            style={[styles.backgroundAnimationLayer, animatedStyle]}
          >
            <View
              style={[
                styles.gradientGlow,
                {
                  width: width * 0.7,
                  height: height * 1.5,
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    );
  }

  /* ---------------- IMAGE ---------------- */

  if (backgroundType === "image") {
    const source = getAssetSource(background?.source);

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            overflow: "hidden",
          },
        ]}
      >
        {source ? (
          <Animated.Image
            source={source}
            resizeMode={background?.resizeMode || "cover"}
            style={[StyleSheet.absoluteFillObject, animatedStyle]}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: background?.fallbackColor || "#E91E63",
              },
            ]}
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
          backgroundColor: "#E91E63",
          borderRadius,
          overflow: "hidden",
        },
      ]}
    />
  );
}

/* =========================================================
   RAYS
========================================================= */

function RaysLayer({ enabled, width, height, color, opacity = 0.12 }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      rotation.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(1, {
        duration: 12000,
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
          rotate: `${interpolate(rotation.value, [0, 1], [-10, 10])}deg`,
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
      style={[
        styles.raysContainer,
        {
          width: width * 1.5,
          height: height * 2,
          left: -width * 0.25,
          top: -height * 0.5,
        },
        animatedStyle,
      ]}
    >
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
   BANNER ASSET
========================================================= */

function BannerAsset({ item, type, enabled }) {
  const animationValue = useSharedValue(0);

  const animation = item?.animation || "none";

  useEffect(() => {
    if (!enabled || !animation || animation === "none") {
      animationValue.value = 0;
      return;
    }

    if (animation === "float") {
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
      animationValue.value = withRepeat(
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
            translateY: interpolate(animationValue.value, [0, 1], [0, -8]),
          },
        ],
      };
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(animationValue.value, [0, 1], [1, 0.72]),
        transform: [
          {
            scale: interpolate(animationValue.value, [0, 1], [1, 1.05]),
          },
        ],
      };
    }

    if (animation === "rotate") {
      return {
        transform: [
          {
            rotate: `${interpolate(animationValue.value, [0, 1], [0, 360])}deg`,
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(animationValue.value, [0, 1], [1, 1.08]),
          },
        ],
      };
    }

    if (animation === "bounce") {
      return {
        transform: [
          {
            translateY: interpolate(animationValue.value, [0, 1], [0, -12]),
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

    opacity: item?.opacity == null ? 1 : item.opacity,

    zIndex: item?.zIndex == null ? 2 : item.zIndex,

    transform: [
      {
        rotate: `${item?.rotate || 0}deg`,
      },
    ],

    ...item?.style,
  };

  /* ---------------- ICON ---------------- */

  if (type === "icon" && isValidElement(item?.icon)) {
    return (
      <Animated.View pointerEvents="none" style={[assetStyle, animatedStyle]}>
        {item.icon}
      </Animated.View>
    );
  }

  /* ---------------- IMAGE ---------------- */

  const source = getAssetSource(item?.source || item?.image);

  if (!source) {
    return null;
  }

  return (
    <Animated.Image
      pointerEvents="none"
      source={source}
      resizeMode={item?.resizeMode || "contain"}
      style={[assetStyle, animatedStyle]}
    />
  );
}

/* =========================================================
   CONTENT
========================================================= */

function BannerContent({ banner, enabled }) {
  const contentAnimation = banner?.contentAnimation || "none";

  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (!enabled || contentAnimation === "none") {
      animationValue.value = 0;
      return;
    }

    animationValue.value = withSequence(
      withTiming(1, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [contentAnimation, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || contentAnimation === "none") {
      return {};
    }

    if (contentAnimation === "fade") {
      return {
        opacity: animationValue.value,
      };
    }

    if (contentAnimation === "slideUp") {
      return {
        opacity: animationValue.value,
        transform: [
          {
            translateY: interpolate(animationValue.value, [0, 1], [25, 0]),
          },
        ],
      };
    }

    if (contentAnimation === "slideLeft") {
      return {
        opacity: animationValue.value,
        transform: [
          {
            translateX: interpolate(animationValue.value, [0, 1], [35, 0]),
          },
        ],
      };
    }

    if (contentAnimation === "scale") {
      return {
        opacity: animationValue.value,
        transform: [
          {
            scale: interpolate(animationValue.value, [0, 1], [0.85, 1]),
          },
        ],
      };
    }

    return {};
  });

  if (typeof banner?.renderContent === "function") {
    return (
      <Animated.View
        style={[styles.contentContainer, banner?.contentStyle, animatedStyle]}
      >
        {banner.renderContent(banner)}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.contentContainer, banner?.contentStyle, animatedStyle]}
    >
      {/* BADGE */}

      {banner?.badge ? (
        <View style={[styles.badge, banner?.badgeStyle]}>
          {isValidElement(banner?.badgeIcon) && (
            <View style={styles.badgeIcon}>{banner.badgeIcon}</View>
          )}

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
          {isValidElement(banner?.buttonIcon) && (
            <View style={styles.buttonIcon}>{banner.buttonIcon}</View>
          )}

          <Text style={[styles.buttonText, banner?.buttonTextStyle]}>
            {banner.buttonText}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/* =========================================================
   SINGLE SLIDE
========================================================= */

function BannerSlide({
  banner,
  index,
  width,
  height,
  reanimated,
  radius,
  onPress,
}) {
  const backgroundAnimation = banner?.backgroundAnimation || "none";

  const background = banner?.background || {
    type: "color",
    color: "#E91E63",
  };

  const backgroundColor =
    background?.type === "color" ? background?.color || "#E91E63" : "#E91E63";

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress(banner, index);
        }

        if (banner?.onPress) {
          banner.onPress(banner, index);
        }
      }}
      disabled={!onPress && !banner?.onPress}
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
        animation={backgroundAnimation}
        enabled={reanimated}
        width={width}
        height={height}
        borderRadius={radius}
      />

      {/* RAYS */}

      {backgroundAnimation === "rays" && (
        <RaysLayer
          enabled={reanimated}
          width={width}
          height={height}
          color={banner?.raysColor || "#FFFFFF"}
          opacity={banner?.raysOpacity == null ? 0.12 : banner.raysOpacity}
        />
      )}

      {/* DECORATIVE OVERLAY */}

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

      {Array.isArray(banner?.images) &&
        banner.images.map((item, imageIndex) => (
          <BannerAsset
            key={item?.id || `image-${index}-${imageIndex}`}
            item={item}
            type="image"
            enabled={reanimated}
          />
        ))}

      {/* ICONS */}

      {Array.isArray(banner?.icons) &&
        banner.icons.map((item, iconIndex) => (
          <BannerAsset
            key={item?.id || `icon-${index}-${iconIndex}`}
            item={item}
            type="icon"
            enabled={reanimated}
          />
        ))}

      {/* CONTENT */}

      <BannerContent banner={banner} enabled={reanimated} />
    </Pressable>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UIBannerCarousel({
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
  contentContainerStyle,

  paginationStyle,
  dotStyle,
  activeDotStyle,

  leftArrow,
  rightArrow,

  onIndexChange,
  onPress,

  containerStyle,
}) {
  const scrollRef = useRef(null);

  const currentIndexRef = useRef(initialIndex);

  const timerRef = useRef(null);

  const [containerWidth, setContainerWidth] = React.useState(
    width || SCREEN_WIDTH,
  );

  const bannerWidth = width || containerWidth || SCREEN_WIDTH;

  const totalBanners = Array.isArray(banners) ? banners.length : 0;

  const safeInitialIndex =
    totalBanners > 0
      ? Math.min(Math.max(initialIndex, 0), totalBanners - 1)
      : 0;

  const itemWidth = bannerWidth - gap;

  /* =====================================================
     CLEAR AUTOPLAY
  ===================================================== */

  const clearAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* =====================================================
     SCROLL TO INDEX
  ===================================================== */

  const scrollToIndex = useCallback(
    (index, animated = true) => {
      if (!scrollRef.current) {
        return;
      }

      if (totalBanners === 0) {
        return;
      }

      let nextIndex = index;

      if (loop) {
        if (nextIndex < 0) {
          nextIndex = totalBanners - 1;
        }

        if (nextIndex >= totalBanners) {
          nextIndex = 0;
        }
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, totalBanners - 1));
      }

      currentIndexRef.current = nextIndex;

      scrollRef.current.scrollTo({
        x: nextIndex * itemWidth,
        y: 0,
        animated,
      });

      if (onIndexChange) {
        onIndexChange(nextIndex);
      }
    },
    [totalBanners, loop, itemWidth, onIndexChange],
  );

  /* =====================================================
     AUTOPLAY
  ===================================================== */

  useEffect(() => {
    clearAutoplay();

    if (!autoplay || totalBanners <= 1) {
      return undefined;
    }

    timerRef.current = setInterval(() => {
      const current = currentIndexRef.current;

      if (!loop && current >= totalBanners - 1) {
        clearAutoplay();
        return;
      }

      scrollToIndex(current + 1, true);
    }, interval);

    return clearAutoplay;
  }, [autoplay, interval, totalBanners, loop, scrollToIndex, clearAutoplay]);

  /* =====================================================
     INITIAL INDEX
  ===================================================== */

  useEffect(() => {
    if (totalBanners === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollToIndex(safeInitialIndex, false);
    }, 50);

    return () => {
      clearTimeout(timeout);
    };
  }, [safeInitialIndex, totalBanners, scrollToIndex]);

  /* =====================================================
     SCROLL END
  ===================================================== */

  const handleMomentumScrollEnd = useCallback(
    (event) => {
      const x = event.nativeEvent.contentOffset.x;

      const index = Math.round(x / itemWidth);

      if (totalBanners === 0) {
        return;
      }

      let normalizedIndex = index;

      if (loop) {
        if (index < 0) {
          normalizedIndex = totalBanners - 1;
        }

        if (index >= totalBanners) {
          normalizedIndex = 0;
        }
      }

      normalizedIndex = Math.max(
        0,
        Math.min(normalizedIndex, totalBanners - 1),
      );

      currentIndexRef.current = normalizedIndex;

      if (onIndexChange) {
        onIndexChange(normalizedIndex);
      }
    },
    [itemWidth, totalBanners, loop, onIndexChange],
  );

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (totalBanners === 0) {
    return null;
  }

  /* =====================================================
     CONTAINER WIDTH
  ===================================================== */

  const handleLayout = (event) => {
    if (width) {
      return;
    }

    const measuredWidth = event.nativeEvent.layout.width;

    if (measuredWidth > 0 && measuredWidth !== containerWidth) {
      setContainerWidth(measuredWidth);
    }
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handlePrevious = () => {
    clearAutoplay();

    scrollToIndex(currentIndexRef.current - 1, true);
  };

  const handleNext = () => {
    clearAutoplay();

    scrollToIndex(currentIndexRef.current + 1, true);
  };

  /* =====================================================
     RENDER
  ===================================================== */

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
        showsHorizontalScrollIndicator={false}
        pagingEnabled={gap === 0}
        scrollEnabled={swipe}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={gap > 0 ? itemWidth : undefined}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={[
          {
            paddingHorizontal: gap > 0 ? gap / 2 : 0,
          },
          contentContainerStyle,
        ]}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={clearAutoplay}
        onTouchEnd={() => {
          if (autoplay && totalBanners > 1) {
            clearAutoplay();

            timerRef.current = setInterval(() => {
              const current = currentIndexRef.current;

              if (!loop && current >= totalBanners - 1) {
                clearAutoplay();
                return;
              }

              scrollToIndex(current + 1, true);
            }, interval);
          }
        }}
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
              reanimated={reanimated}
              radius={radius}
              onPress={onPress}
            />
          </View>
        ))}
      </ScrollView>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      {navigation && totalBanners > 1 ? (
        <>
          <Pressable
            onPress={handlePrevious}
            style={[styles.navigationButton, styles.leftNavigation]}
          >
            {leftArrow || <Text style={styles.navigationText}>‹</Text>}
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={[styles.navigationButton, styles.rightNavigation]}
          >
            {rightArrow || <Text style={styles.navigationText}>›</Text>}
          </Pressable>
        </>
      ) : null}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {pagination && totalBanners > 1 ? (
        <View pointerEvents="none" style={[styles.pagination, paginationStyle]}>
          {banners.map((_, index) => {
            const active = index === currentIndexRef.current;

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
  slide: {
    overflow: "hidden",
    position: "relative",
  },

  backgroundAnimationLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  gradientGlow: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  raysContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },

  ray: {
    position: "absolute",
    width: 18,
    height: "100%",
    borderRadius: 20,
  },

  contentContainer: {
    position: "relative",
    zIndex: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "flex-start",
    justifyContent: "center",
    maxWidth: "65%",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    fontWeight: "800",
    lineHeight: 29,
  },

  subtitle: {
    color: "rgba(255,255,255,0.9)",
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
    fontSize: 12,
    fontWeight: "800",
    color: "#222222",
  },

  pagination: {
    position: "absolute",
    bottom: 9,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  activeDot: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },

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

  leftNavigation: {
    left: 10,
  },

  rightNavigation: {
    right: 10,
  },

  navigationText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "400",
  },
});
