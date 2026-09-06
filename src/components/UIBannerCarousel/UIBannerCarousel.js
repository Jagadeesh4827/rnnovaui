import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";

// Keep this pointing to the SAME theme hook used by your UIProvider.
import { useTheme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_HEIGHT = 190;

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const numberOr = (value, fallback) =>
  typeof value === "number" ? value : fallback;

const normalizeGradient = (gradient) => {
  if (!Array.isArray(gradient) || gradient.length === 0) {
    return ["#7C3AED", "#EC4899"];
  }

  if (gradient.length === 1) {
    return [gradient[0], gradient[0]];
  }

  return gradient;
};

const getAnimationName = (item) => item?.animation || "none";

/* =========================================================
   ANIMATED ASSET
   Used for individual images and icons.
========================================================= */

function AnimatedBannerAsset({ item, type = "image" }) {
  const progress = useSharedValue(0);

  const animation = item?.animation || "none";

  useEffect(() => {
    if (animation === "none") {
      progress.value = 0;
      return undefined;
    }

    const duration = item?.animationDuration || 2200;

    progress.value = 0;

    if (animation === "float") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration,
          }),
          withTiming(0, {
            duration,
          }),
        ),
        -1,
        false,
      );
    }

    if (animation === "pulse") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration,
          }),
          withTiming(0, {
            duration,
          }),
        ),
        -1,
        false,
      );
    }

    if (animation === "rotate") {
      progress.value = withRepeat(
        withTiming(1, {
          duration: item?.animationDuration || 5000,
        }),
        -1,
        false,
      );
    }

    if (animation === "zoom") {
      progress.value = withRepeat(
        withTiming(1, {
          duration: item?.animationDuration || 5000,
        }),
        -1,
        true,
      );
    }

    if (animation === "bounce") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 700,
          }),
          withTiming(0, {
            duration: 700,
          }),
        ),
        -1,
        false,
      );
    }

    return () => {
      progress.value = 0;
    };
  }, [animation, item?.animationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animation === "none") {
      return {};
    }

    if (animation === "float") {
      return {
        transform: [
          {
            translateY: interpolate(
              progress.value,
              [0, 1],
              [0, -8],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    if (animation === "pulse") {
      return {
        opacity: interpolate(
          progress.value,
          [0, 1],
          [0.75, 1],
          Extrapolation.CLAMP,
        ),
        transform: [
          {
            scale: interpolate(
              progress.value,
              [0, 1],
              [0.96, 1.04],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    if (animation === "rotate") {
      return {
        transform: [
          {
            rotate: `${progress.value * 360}deg`,
          },
        ],
      };
    }

    if (animation === "zoom") {
      return {
        transform: [
          {
            scale: interpolate(
              progress.value,
              [0, 1],
              [0.96, 1.08],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    if (animation === "bounce") {
      return {
        transform: [
          {
            translateY: interpolate(
              progress.value,
              [0, 1],
              [0, -12],
              Extrapolation.CLAMP,
            ),
          },
          {
            scale: interpolate(
              progress.value,
              [0, 1],
              [1, 1.05],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    return {};
  });

  const positionStyle =
    item?.position && typeof item.position === "object" ? item.position : {};

  const rotation = item?.rotation || "0deg";

  const opacity = numberOr(item?.opacity, 1);

  const zIndex = numberOr(item?.zIndex, 1);

  const width = numberOr(item?.width, type === "icon" ? 32 : 100);

  const height = numberOr(item?.height, type === "icon" ? 32 : 100);

  if (type === "icon") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.asset,
          positionStyle,
          {
            width,
            height,
            zIndex,
            opacity,
            transform: [
              {
                rotate: rotation,
              },
            ],
          },
          animatedStyle,
          item?.style,
        ]}
      >
        {item?.icon}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.asset,
        positionStyle,
        {
          width,
          height,
          zIndex,
          opacity,
          transform: [
            {
              rotate: rotation,
            },
          ],
        },
        animatedStyle,
        item?.containerStyle,
      ]}
    >
      <Image
        source={item?.source}
        resizeMode={item?.resizeMode || "contain"}
        style={[StyleSheet.absoluteFill, item?.imageStyle]}
      />
    </Animated.View>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function BannerBackground({ banner, width, height, reanimated }) {
  const progress = useSharedValue(0);

  const animation = banner?.backgroundAnimation || "none";

  useEffect(() => {
    if (!reanimated || animation === "none") {
      progress.value = 0;
      return undefined;
    }

    const duration = banner?.animationDuration || 7000;

    progress.value = 0;

    if (
      animation === "rays" ||
      animation === "zoom" ||
      animation === "kenBurns"
    ) {
      progress.value = withRepeat(
        withTiming(1, {
          duration,
        }),
        -1,
        animation !== "rays",
      );
    }

    if (animation === "pulse") {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: banner?.animationDuration || 1800,
          }),
          withTiming(0, {
            duration: banner?.animationDuration || 1800,
          }),
        ),
        -1,
        false,
      );
    }

    return () => {
      progress.value = 0;
    };
  }, [reanimated, animation, banner?.animationDuration]);

  const raysStyle = useAnimatedStyle(() => {
    if (!reanimated || animation !== "rays") {
      return {};
    }

    return {
      transform: [
        {
          rotate: `${progress.value * 360}deg`,
        },
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [1, 1.08],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    if (!reanimated || animation !== "pulse") {
      return {};
    }

    return {
      opacity: interpolate(
        progress.value,
        [0, 1],
        [0.08, 0.3],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [0.85, 1.15],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    if (!reanimated || !(animation === "zoom" || animation === "kenBurns")) {
      return {};
    }

    return {
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            animation === "kenBurns" ? [1.03, 1.14] : [1, 1.08],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateX:
            animation === "kenBurns"
              ? interpolate(
                  progress.value,
                  [0, 1],
                  [0, -12],
                  Extrapolation.CLAMP,
                )
              : 0,
        },
      ],
    };
  });

  const backgroundType = banner?.backgroundType || "color";

  const backgroundColor = banner?.backgroundColor || "#E91E63";

  const gradient = normalizeGradient(banner?.gradient);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* COLOR */}
      {backgroundType === "color" && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor,
            },
          ]}
        />
      )}

      {/* GRADIENT */}
      {backgroundType === "gradient" && (
        <LinearGradient
          colors={gradient}
          start={
            banner?.gradientStart || {
              x: 0,
              y: 0,
            }
          }
          end={
            banner?.gradientEnd || {
              x: 1,
              y: 1,
            }
          }
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* IMAGE */}
      {backgroundType === "image" && banner?.image && (
        <Animated.Image
          source={banner.image}
          resizeMode={banner?.imageResizeMode || "cover"}
          style={[
            StyleSheet.absoluteFill,
            {
              width,
              height,
            },
            imageStyle,
          ]}
        />
      )}

      {/* RAYS */}
      {animation === "rays" && (
        <Animated.View
          style={[
            styles.rays,
            {
              width: width * 1.8,
              height: height * 3,
              left: -width * 0.4,
              top: -height,
            },
            raysStyle,
          ]}
        >
          {Array.from({
            length: 12,
          }).map((_, index) => (
            <View
              key={`ray-${index}`}
              style={[
                styles.ray,
                {
                  transform: [
                    {
                      rotate: `${index * 30}deg`,
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {/* PULSE */}
      {animation === "pulse" && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: width * 0.9,
              height: width * 0.9,
              borderRadius: width * 0.45,
              right: -width * 0.2,
              top: -width * 0.25,
            },
            pulseStyle,
          ]}
        />
      )}

      {/* CUSTOM OVERLAY */}
      {banner?.overlayColor && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: banner.overlayColor,
              opacity: clamp(numberOr(banner.overlayOpacity, 0), 0, 1),
            },
          ]}
        />
      )}

      {/* GRADIENT OVERLAY */}
      {banner?.gradientOverlay && (
        <LinearGradient
          colors={
            banner.gradientOverlay.colors || ["transparent", "rgba(0,0,0,0.4)"]
          }
          start={
            banner.gradientOverlay.start || {
              x: 0,
              y: 0,
            }
          }
          end={
            banner.gradientOverlay.end || {
              x: 1,
              y: 1,
            }
          }
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}

/* =========================================================
   CONTENT ANIMATION
========================================================= */

function BannerTextContent({
  banner,
  theme,
  width,
  height,
  index,
  activeIndex,
  reanimated,
  onPress,
}) {
  const progress = useSharedValue(0);

  const animation = banner?.contentAnimation || "fadeSlide";

  useEffect(() => {
    if (!reanimated || index !== activeIndex) {
      progress.value = 1;
      return undefined;
    }

    progress.value = 0;

    progress.value = withTiming(1, {
      duration: banner?.contentAnimationDuration || 500,
    });

    return () => {
      progress.value = 0;
    };
  }, [reanimated, index, activeIndex, animation]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (!reanimated) {
      return {};
    }

    if (animation === "none") {
      return {};
    }

    if (animation === "fade") {
      return {
        opacity: progress.value,
      };
    }

    if (animation === "scale") {
      return {
        opacity: progress.value,
        transform: [
          {
            scale: interpolate(
              progress.value,
              [0, 1],
              [0.9, 1],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    return {
      opacity: progress.value,
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [18, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  if (typeof banner?.renderContent === "function") {
    return (
      <Animated.View style={[styles.customContent, contentAnimatedStyle]}>
        {banner.renderContent({
          banner,
          index,
          activeIndex,
          width,
          height,
          theme,
        })}
      </Animated.View>
    );
  }

  const textColor =
    banner?.textColor || theme?.colors?.text?.inverse || "#FFFFFF";

  const secondaryColor = banner?.secondaryTextColor || textColor;

  const buttonBackground = banner?.buttonBackgroundColor || "#FFFFFF";

  const buttonTextColor = banner?.buttonTextColor || "#111827";

  const contentPosition = banner?.contentPosition || "left";

  const align =
    contentPosition === "center"
      ? "center"
      : contentPosition === "right"
        ? "flex-end"
        : "flex-start";

  const textAlign = contentPosition === "center" ? "center" : "left";

  return (
    <Animated.View
      style={[
        styles.content,
        {
          alignItems: align,
          paddingHorizontal: banner?.contentPaddingHorizontal ?? 22,
          paddingVertical: banner?.contentPaddingVertical ?? 20,
          width:
            banner?.contentWidth ||
            (contentPosition === "center" ? width * 0.86 : width * 0.65),
        },
        contentAnimatedStyle,
        banner?.contentContainerStyle,
      ]}
    >
      {/* BADGE */}

      {banner?.badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                banner?.badgeBackgroundColor || "rgba(255,255,255,0.18)",
            },
            banner?.badgeStyle,
          ]}
        >
          {banner?.badgeIcon && (
            <View style={styles.badgeIcon}>{banner.badgeIcon}</View>
          )}

          <Text
            style={[
              styles.badgeText,
              {
                color: banner?.badgeTextColor || textColor,
              },
              banner?.badgeTextStyle,
            ]}
          >
            {banner.badge}
          </Text>
        </View>
      )}

      {/* EYEBROW */}

      {banner?.eyebrow && (
        <Text
          style={[
            styles.eyebrow,
            {
              color: secondaryColor,
              textAlign,
            },
            banner?.eyebrowStyle,
          ]}
        >
          {banner.eyebrow}
        </Text>
      )}

      {/* TITLE */}

      {banner?.title && (
        <Text
          numberOfLines={banner?.titleNumberOfLines || 2}
          style={[
            styles.title,
            {
              color: textColor,
              textAlign,
            },
            banner?.titleStyle,
          ]}
        >
          {banner.title}
        </Text>
      )}

      {/* SUBTITLE */}

      {banner?.subtitle && (
        <Text
          numberOfLines={banner?.subtitleNumberOfLines || 2}
          style={[
            styles.subtitle,
            {
              color: secondaryColor,
              textAlign,
            },
            banner?.subtitleStyle,
          ]}
        >
          {banner.subtitle}
        </Text>
      )}

      {/* CTA */}

      {banner?.buttonText && (
        <Pressable
          onPress={() => {
            if (typeof banner?.onPress === "function") {
              banner.onPress();
            } else if (typeof onPress === "function") {
              onPress(banner, index);
            }
          }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: buttonBackground,
              opacity: pressed ? 0.75 : 1,
            },
            banner?.buttonStyle,
          ]}
        >
          {banner?.buttonIcon && (
            <View style={styles.buttonIcon}>{banner.buttonIcon}</View>
          )}

          <Text
            style={[
              styles.buttonText,
              {
                color: buttonTextColor,
              },
              banner?.buttonTextStyle,
            ]}
          >
            {banner.buttonText}
          </Text>

          {banner?.buttonIcon === undefined &&
            banner?.showButtonArrow !== false && (
              <Text
                style={[
                  styles.buttonArrow,
                  {
                    color: buttonTextColor,
                  },
                ]}
              >
                →
              </Text>
            )}
        </Pressable>
      )}
    </Animated.View>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  count,
  activeIndex,
  onPress,
  dotSize,
  activeWidth,
  gap,
  activeColor,
  inactiveColor,
  style,
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <View
      style={[
        styles.pagination,
        {
          gap,
        },
        style,
      ]}
    >
      {Array.from({
        length: count,
      }).map((_, index) => {
        const active = index === activeIndex;

        return (
          <Pressable
            key={`dot-${index}`}
            onPress={() => onPress(index)}
            hitSlop={8}
            style={[
              styles.paginationDot,
              {
                width: active ? activeWidth : dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: active ? activeColor : inactiveColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function NavigationButton({
  direction,
  size,
  backgroundColor,
  iconColor,
  onPress,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.navigationButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.navigationIcon,
          {
            color: iconColor,
          },
        ]}
      >
        {direction === "left" ? "‹" : "›"}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UIBannerCarousel({
  banners = [],

  /*
   * Reanimated
   */
  reanimated = false,

  /*
   * Dimensions
   */
  width,
  height = DEFAULT_HEIGHT,

  /*
   * Outer spacing
   */
  margin = 0,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,

  paddingHorizontal = 0,
  paddingVertical = 0,

  /*
   * Banner spacing
   */
  gap = 0,

  /*
   * Shape
   */
  borderRadius = 18,

  /*
   * Carousel
   */
  autoplay = true,
  autoplayInterval = 4500,
  loop = true,
  initialIndex = 0,

  /*
   * Pagination
   */
  showPagination = true,
  paginationPosition = "bottom",

  paginationDotSize = 7,
  paginationActiveWidth = 20,
  paginationGap = 6,

  paginationActiveColor,
  paginationInactiveColor,

  /*
   * Navigation
   */
  showNavigation = false,
  navigationSize = 34,
  navigationBackgroundColor,
  navigationIconColor,

  /*
   * Events
   */
  onIndexChange,
  onPress,

  /*
   * Custom rendering
   */
  renderItem,

  /*
   * Styles
   */
  containerStyle,
  carouselStyle,
  slideStyle,
  paginationStyle,
  navigationStyle,

  testID,
}) {
  /*
   * Theme is READ ONLY.
   *
   * UIProvider controls the theme.
   * This component never changes theme.
   */
  const { theme } = useTheme();

  const safeBanners = useMemo(
    () => (Array.isArray(banners) ? banners : []),
    [banners],
  );

  const carouselWidth = width || SCREEN_WIDTH - paddingHorizontal * 2;

  const carouselHeight = numberOr(height, DEFAULT_HEIGHT);

  const [activeIndex, setActiveIndex] = useState(() =>
    clamp(numberOr(initialIndex, 0), 0, Math.max(safeBanners.length - 1, 0)),
  );

  const activeIndexRef = useRef(activeIndex);

  const scrollRef = useRef(null);

  const scrollX = useSharedValue(activeIndex * carouselWidth);

  /*
   * Keep active index synchronized.
   */
  const setIndex = useCallback(
    (index) => {
      if (!safeBanners.length) {
        return;
      }

      const nextIndex = clamp(index, 0, safeBanners.length - 1);

      activeIndexRef.current = nextIndex;

      setActiveIndex(nextIndex);

      if (typeof onIndexChange === "function") {
        onIndexChange(nextIndex, safeBanners[nextIndex]);
      }
    },
    [safeBanners, onIndexChange],
  );

  /*
   * Go to specific slide.
   */
  const goToIndex = useCallback(
    (index, animated = true) => {
      if (!safeBanners.length) {
        return;
      }

      const nextIndex = clamp(index, 0, safeBanners.length - 1);

      scrollRef.current?.scrollTo({
        x: nextIndex * carouselWidth,
        animated,
      });

      setIndex(nextIndex);
    },
    [safeBanners.length, carouselWidth, setIndex],
  );

  /*
   * Next.
   */
  const goNext = useCallback(() => {
    if (safeBanners.length <= 1) {
      return;
    }

    const current = activeIndexRef.current;

    if (current < safeBanners.length - 1) {
      goToIndex(current + 1);
      return;
    }

    if (loop) {
      goToIndex(0);
    }
  }, [safeBanners.length, loop, goToIndex]);

  /*
   * Previous.
   */
  const goPrevious = useCallback(() => {
    if (safeBanners.length <= 1) {
      return;
    }

    const current = activeIndexRef.current;

    if (current > 0) {
      goToIndex(current - 1);
      return;
    }

    if (loop) {
      goToIndex(safeBanners.length - 1);
    }
  }, [safeBanners.length, loop, goToIndex]);

  /*
   * AUTOPLAY
   */
  useEffect(() => {
    if (!autoplay || safeBanners.length <= 1) {
      return undefined;
    }

    const timer = setInterval(
      () => {
        goNext();
      },
      Math.max(1000, autoplayInterval),
    );

    return () => {
      clearInterval(timer);
    };
  }, [autoplay, autoplayInterval, safeBanners.length, goNext]);

  /*
   * Reanimated scroll handler.
   */
  const animatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  /*
   * Native scroll end.
   */
  const handleMomentumScrollEnd = useCallback(
    (event) => {
      const index = clamp(
        Math.round(event.nativeEvent.contentOffset.x / carouselWidth),
        0,
        Math.max(safeBanners.length - 1, 0),
      );

      setIndex(index);
    },
    [carouselWidth, safeBanners.length, setIndex],
  );

  /*
   * Theme fallback colors.
   */
  const activePaginationColor =
    paginationActiveColor ||
    theme?.colors?.brand?.primary ||
    theme?.colors?.primary ||
    "#E91E63";

  const inactivePaginationColor =
    paginationInactiveColor ||
    theme?.colors?.border?.default ||
    "rgba(0,0,0,0.18)";

  const navBackground =
    navigationBackgroundColor ||
    theme?.colors?.background?.primary ||
    "#FFFFFF";

  const navIconColor =
    navigationIconColor || theme?.colors?.text?.primary || "#111827";

  /*
   * Empty state.
   */
  if (!safeBanners.length) {
    return null;
  }

  return (
    <View
      testID={testID}
      style={[
        styles.outerContainer,
        {
          margin,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,

          paddingHorizontal,
          paddingVertical,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.carousel,
          {
            width: carouselWidth,
            height: carouselHeight,
          },
          carouselStyle,
        ]}
      >
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          contentOffset={{
            x: activeIndex * carouselWidth,
            y: 0,
          }}
          onScroll={reanimated ? animatedScrollHandler : undefined}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={{
            paddingHorizontal: gap / 2,
          }}
        >
          {safeBanners.map((banner, index) => {
            const slideWidth = carouselWidth - gap;

            /*
             * Custom renderItem.
             */
            if (typeof renderItem === "function") {
              return (
                <View
                  key={banner?.id || `banner-${index}`}
                  style={[
                    styles.slide,
                    {
                      width: slideWidth,
                      height: carouselHeight,
                      marginHorizontal: gap / 2,
                    },
                    slideStyle,
                    banner?.slideStyle,
                  ]}
                >
                  {renderItem({
                    banner,
                    index,
                    activeIndex,
                    width: slideWidth,
                    height: carouselHeight,
                    theme,
                  })}
                </View>
              );
            }

            return (
              <BannerSlide
                key={banner?.id || `banner-${index}`}
                banner={{
                  ...banner,

                  borderRadius: banner?.borderRadius ?? borderRadius,

                  contentPaddingHorizontal: banner?.contentPaddingHorizontal,

                  contentPaddingVertical: banner?.contentPaddingVertical,
                }}
                index={index}
                activeIndex={activeIndex}
                width={slideWidth}
                height={carouselHeight}
                reanimated={reanimated}
                theme={theme}
                onPress={onPress}
                slideStyle={slideStyle}
              />
            );
          })}
        </Animated.ScrollView>

        {/* NAVIGATION */}

        {showNavigation && safeBanners.length > 1 && (
          <>
            <View
              pointerEvents="box-none"
              style={[styles.navigationLeft, navigationStyle]}
            >
              <NavigationButton
                direction="left"
                size={navigationSize}
                backgroundColor={navBackground}
                iconColor={navIconColor}
                onPress={goPrevious}
              />
            </View>

            <View
              pointerEvents="box-none"
              style={[styles.navigationRight, navigationStyle]}
            >
              <NavigationButton
                direction="right"
                size={navigationSize}
                backgroundColor={navBackground}
                iconColor={navIconColor}
                onPress={goNext}
              />
            </View>
          </>
        )}

        {/* PAGINATION */}

        {showPagination && (
          <View
            pointerEvents="box-none"
            style={
              paginationPosition === "top"
                ? styles.paginationTop
                : styles.paginationBottom
            }
          >
            <Pagination
              count={safeBanners.length}
              activeIndex={activeIndex}
              onPress={goToIndex}
              dotSize={paginationDotSize}
              activeWidth={paginationActiveWidth}
              gap={paginationGap}
              activeColor={activePaginationColor}
              inactiveColor={inactivePaginationColor}
              style={paginationStyle}
            />
          </View>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   BANNER SLIDE
========================================================= */

function BannerSlide({
  banner,
  index,
  activeIndex,
  width,
  height,
  reanimated,
  theme,
  onPress,
  slideStyle,
}) {
  const handlePress = banner?.onPress || onPress;

  return (
    <View
      style={[
        styles.slide,
        {
          width,
          height,
          marginHorizontal: 0,
        },
        slideStyle,
        banner?.slideStyle,
      ]}
    >
      <View
        style={[
          styles.banner,
          {
            width,
            height,
            borderRadius: banner?.borderRadius || 18,
          },
        ]}
      >
        {/* BACKGROUND */}

        <BannerBackground
          banner={banner}
          width={width}
          height={height}
          reanimated={reanimated}
        />

        {/* PRESSABLE CONTENT */}

        <Pressable
          disabled={typeof handlePress !== "function"}
          onPress={() => {
            if (typeof banner?.onPress === "function") {
              banner.onPress();
              return;
            }

            if (typeof onPress === "function") {
              onPress(banner, index);
            }
          }}
          style={StyleSheet.absoluteFill}
        />

        {/* MULTIPLE IMAGES */}

        {Array.isArray(banner?.images) &&
          banner.images.map((item, imageIndex) => (
            <AnimatedBannerAsset
              key={item?.id || `image-${index}-${imageIndex}`}
              item={item}
              type="image"
            />
          ))}

        {/* MULTIPLE ICONS */}

        {Array.isArray(banner?.icons) &&
          banner.icons.map((item, iconIndex) => (
            <AnimatedBannerAsset
              key={item?.id || `icon-${index}-${iconIndex}`}
              item={item}
              type="icon"
            />
          ))}

        {/* TEXT / CTA */}

        <BannerTextContent
          banner={banner}
          theme={theme}
          width={width}
          height={height}
          index={index}
          activeIndex={activeIndex}
          reanimated={reanimated}
          onPress={onPress}
        />
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
  },

  carousel: {
    position: "relative",
    overflow: "visible",
  },

  slide: {
    position: "relative",
  },

  banner: {
    position: "relative",
    overflow: "hidden",
  },

  asset: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * Content
   */

  content: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },

  customContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  /*
   * Badge
   */

  badge: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  badgeIcon: {
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /*
   * Text
   */

  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    marginTop: 5,
    opacity: 0.92,
  },

  /*
   * Button
   */

  button: {
    minHeight: 36,
    paddingHorizontal: 15,
    borderRadius: 999,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonIcon: {
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  buttonArrow: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "700",
    marginLeft: 5,
  },

  /*
   * Rays
   */

  rays: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  ray: {
    position: "absolute",
    width: 24,
    height: "72%",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
  },

  /*
   * Pulse
   */

  pulse: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  /*
   * Pagination
   */

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  paginationDot: {
    minWidth: 6,
  },

  paginationTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 9,
  },

  paginationBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 9,
  },

  /*
   * Navigation
   */

  navigationLeft: {
    position: "absolute",
    left: -7,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },

  navigationRight: {
    position: "absolute",
    right: -7,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },

  navigationButton: {
    alignItems: "center",
    justifyContent: "center",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.16,
    shadowRadius: 5,

    elevation: 4,
  },

  navigationIcon: {
    fontSize: 29,
    lineHeight: 32,
    fontWeight: "400",
    marginTop: -2,
  },
});
