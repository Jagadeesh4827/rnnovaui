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
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../../theme";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_BANNERS = [
  {
    id: "banner-1",
    title: "Special Offer",
    subtitle: "Get exciting discounts on your favorite food",
    description: "Order now and save more",
    backgroundColor: "#F72585",
    secondaryColor: "#7B2CBF",
    icon: "percent",
    iconType: "material",
    iconColor: "#FFD42A",
    buttonText: "Order Now",
    buttonColor: "#FFFFFF",
    buttonTextColor: "#E51B67",
  },

  {
    id: "banner-2",
    title: "Free Delivery",
    subtitle: "Enjoy delicious food with zero delivery fee",
    description: "Limited time offer",
    backgroundColor: "#06B6A4",
    secondaryColor: "#087FD1",
    icon: "moped",
    iconType: "material",
    iconColor: "#FFFFFF",
    buttonText: "Explore",
    buttonColor: "#FFFFFF",
    buttonTextColor: "#087C9C",
  },

  {
    id: "banner-3",
    title: "50% OFF",
    subtitle: "Amazing deals are waiting for you",
    description: "Today only",
    backgroundColor: "#FF512F",
    secondaryColor: "#DD2476",
    icon: "gift",
    iconType: "material",
    iconColor: "#FFE735",
    buttonText: "Claim Offer",
    buttonColor: "#FFE735",
    buttonTextColor: "#9D163A",
  },
];

/* =========================================================
   ICON COMPONENT
========================================================= */

const BannerIcon = ({ banner, size = 50 }) => {
  if (!banner?.icon) {
    return null;
  }

  const color = banner.iconColor || "#FFFFFF";

  if (banner.iconType === "ionicons") {
    return <Ionicons name={banner.icon} size={size} color={color} />;
  }

  if (banner.iconType === "material") {
    return (
      <MaterialCommunityIcons name={banner.icon} size={size} color={color} />
    );
  }

  return <Ionicons name={banner.icon} size={size} color={color} />;
};

/* =========================================================
   BACKGROUND
========================================================= */

const BannerBackground = ({ banner }) => {
  const image = banner?.backgroundImage || banner?.image;

  if (image) {
    return (
      <Image
        source={image}
        resizeMode={banner.imageResizeMode || "cover"}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  if (banner?.backgroundColor && banner?.secondaryColor) {
    return (
      <Svg
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            width: "100%",
            height: "100%",
          },
        ]}
      >
        <Defs>
          <LinearGradient
            id={`bannerGradient-${banner.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor={banner.backgroundColor}
              stopOpacity="1"
            />

            <Stop
              offset="100%"
              stopColor={banner.secondaryColor}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#bannerGradient-${banner.id})`}
        />
      </Svg>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: banner?.backgroundColor || "#222222",
        },
      ]}
    />
  );
};

/* =========================================================
   SINGLE BANNER
========================================================= */

const BannerItem = ({
  banner,
  index,
  currentIndex,
  width,
  height,
  borderRadius,
  reanimated,
  onPress,
  contentStyle,
  titleStyle,
  subtitleStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!reanimated) {
      return;
    }

    progress.value = withTiming(index === currentIndex ? 1 : 0, {
      duration: 450,
    });
  }, [currentIndex, index, progress, reanimated]);

  const animatedCardStyle = useAnimatedStyle(() => {
    if (!reanimated) {
      return {};
    }

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.96, 1],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0.82, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        {
          scale,
        },
      ],
      opacity,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    if (!reanimated) {
      return {};
    }

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [8, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        {
          translateY,
        },
      ],
    };
  });

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(banner, index);
    }
  }, [banner, index, onPress]);

  const hasButton = !!banner.buttonText;

  const renderImage =
    banner.image && !banner.backgroundImage ? (
      <Image
        source={banner.image}
        resizeMode={banner.imageResizeMode || "contain"}
        style={[styles.bannerImage, banner.imageStyle]}
      />
    ) : null;

  const content = (
    <Animated.View
      style={[
        styles.banner,
        {
          width,
          height,
          borderRadius,
        },
        animatedCardStyle,
      ]}
    >
      <BannerBackground banner={banner} />

      {/* Dark overlay for image banners */}

      {banner.image || banner.backgroundImage ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.imageOverlay,
            {
              backgroundColor: banner.overlayColor || "rgba(0,0,0,0.16)",
            },
          ]}
        />
      ) : null}

      {/* Decorative circles */}

      {banner.showDecorations !== false && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.decorationOne,
              {
                backgroundColor:
                  banner.decorationColor || "rgba(255,255,255,0.14)",
              },
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.decorationTwo,
              {
                backgroundColor:
                  banner.decorationColor || "rgba(255,255,255,0.10)",
              },
            ]}
          />
        </>
      )}

      <Animated.View
        style={[styles.bannerContent, animatedContentStyle, contentStyle]}
      >
        {/* Left side */}

        <View style={styles.textContainer}>
          {banner.badge ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    banner.badgeColor || "rgba(255,255,255,0.18)",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: banner.badgeTextColor || "#FFFFFF",
                  },
                ]}
              >
                {banner.badge}
              </Text>
            </View>
          ) : null}

          {banner.icon && banner.iconPosition !== "right" ? (
            <View style={[styles.iconContainer, banner.iconContainerStyle]}>
              <BannerIcon banner={banner} size={banner.iconSize || 45} />
            </View>
          ) : null}

          <Text
            numberOfLines={banner.titleLines || 2}
            style={[
              styles.title,
              {
                color: banner.titleColor || "#FFFFFF",
              },
              titleStyle,
              banner.titleStyle,
            ]}
          >
            {banner.title}
          </Text>

          {banner.subtitle ? (
            <Text
              numberOfLines={banner.subtitleLines || 2}
              style={[
                styles.subtitle,
                {
                  color: banner.subtitleColor || "rgba(255,255,255,0.92)",
                },
                subtitleStyle,
                banner.subtitleStyle,
              ]}
            >
              {banner.subtitle}
            </Text>
          ) : null}

          {banner.description ? (
            <Text
              numberOfLines={2}
              style={[
                styles.description,
                {
                  color: banner.descriptionColor || "rgba(255,255,255,0.82)",
                },
              ]}
            >
              {banner.description}
            </Text>
          ) : null}

          {hasButton ? (
            <Pressable
              onPress={handlePress}
              style={[
                styles.button,
                {
                  backgroundColor: banner.buttonColor || "#FFFFFF",
                },
                buttonStyle,
                banner.buttonStyle,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: banner.buttonTextColor || "#222222",
                  },
                  buttonTextStyle,
                  banner.buttonTextStyle,
                ]}
              >
                {banner.buttonText}
              </Text>

              {banner.showButtonArrow !== false ? (
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={banner.buttonTextColor || "#222222"}
                />
              ) : null}
            </Pressable>
          ) : null}
        </View>

        {/* Right image */}

        {renderImage}

        {/* Right icon */}

        {banner.icon && banner.iconPosition === "right" ? (
          <View style={[styles.rightIconContainer, banner.iconContainerStyle]}>
            <BannerIcon banner={banner} size={banner.iconSize || 85} />
          </View>
        ) : null}

        {/* Custom content */}

        {banner.renderContent ? banner.renderContent(banner, index) : null}
      </Animated.View>
    </Animated.View>
  );

  if (!hasButton && onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={{
          width,
          height,
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UIBannerCarousel = forwardRef(
  (
    {
      data = DEFAULT_BANNERS,

      width = SCREEN_WIDTH,

      height = 180,

      borderRadius = 18,

      gap = 12,

      autoplay = true,

      autoplayInterval = 3500,

      loop = true,

      initialIndex = 0,

      reanimated = false,

      showPagination = true,

      paginationPosition = "bottom",

      paginationType = "dots",

      activeDotColor = "#FFFFFF",

      inactiveDotColor = "rgba(255,255,255,0.45)",

      paginationSize = 7,

      paginationGap = 6,

      showArrows = false,

      arrowColor = "#FFFFFF",

      arrowBackgroundColor = "rgba(0,0,0,0.35)",

      onIndexChange,

      onPress,

      onScroll,

      onMomentumScrollEnd,

      renderItem,

      keyExtractor,

      contentContainerStyle,

      containerStyle,

      contentStyle,

      titleStyle,

      subtitleStyle,

      buttonStyle,

      buttonTextStyle,

      style,

      disabled = false,

      snapToInterval,

      ...rest
    },
    ref,
  ) => {
    const theme = useTheme?.();

    const listRef = useRef(null);

    const timerRef = useRef(null);

    const currentIndexRef = useRef(initialIndex);

    const [currentIndex, setCurrentIndex] = useState(
      Math.max(0, Math.min(initialIndex, Math.max(0, data.length - 1))),
    );

    const scrollX = useSharedValue(initialIndex * (width + gap));

    /* =====================================================
         NORMALIZE DATA
      ===================================================== */

    const banners = useMemo(() => {
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item, index) => ({
        ...item,
        id: item.id ?? `banner-${index}`,
      }));
    }, [data]);

    /* =====================================================
         INDEX UPDATE
      ===================================================== */

    const updateIndex = useCallback(
      (index) => {
        if (banners.length === 0) {
          return;
        }

        const safeIndex = Math.max(0, Math.min(index, banners.length - 1));

        currentIndexRef.current = safeIndex;

        setCurrentIndex(safeIndex);

        if (onIndexChange) {
          onIndexChange(safeIndex, banners[safeIndex]);
        }
      },
      [banners, onIndexChange],
    );

    /* =====================================================
         SCROLL HANDLER
      ===================================================== */

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;

        if (onScroll) {
          onScroll(event);
        }
      },
    });

    /* =====================================================
         MOMENTUM END
      ===================================================== */

    const handleMomentumEnd = useCallback(
      (event) => {
        const x = event.nativeEvent.contentOffset.x;

        const interval = snapToInterval || width + gap;

        const index = Math.round(x / interval);

        updateIndex(index);

        if (onMomentumScrollEnd) {
          onMomentumScrollEnd(event);
        }
      },
      [gap, onMomentumScrollEnd, snapToInterval, updateIndex, width],
    );

    /* =====================================================
         GO TO INDEX
      ===================================================== */

    const goTo = useCallback(
      (index, animated = true) => {
        if (!listRef.current || banners.length === 0) {
          return;
        }

        let target = index;

        if (loop) {
          if (target < 0) {
            target = banners.length - 1;
          }

          if (target >= banners.length) {
            target = 0;
          }
        } else {
          target = Math.max(0, Math.min(target, banners.length - 1));
        }

        listRef.current.scrollToOffset({
          offset: target * (snapToInterval || width + gap),

          animated,
        });

        updateIndex(target);
      },
      [banners.length, gap, loop, snapToInterval, updateIndex, width],
    );

    /* =====================================================
         NEXT
      ===================================================== */

    const next = useCallback(() => {
      if (banners.length <= 1) {
        return;
      }

      const nextIndex = currentIndexRef.current + 1;

      if (nextIndex >= banners.length && !loop) {
        goTo(banners.length - 1);

        return;
      }

      goTo(nextIndex);
    }, [banners.length, goTo, loop]);

    /* =====================================================
         PREVIOUS
      ===================================================== */

    const previous = useCallback(() => {
      if (banners.length <= 1) {
        return;
      }

      goTo(currentIndexRef.current - 1);
    }, [banners.length, goTo]);

    /* =====================================================
         AUTOPLAY
      ===================================================== */

    const stopAutoplay = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }
    }, []);

    const startAutoplay = useCallback(() => {
      stopAutoplay();

      if (!autoplay || disabled || banners.length <= 1) {
        return;
      }

      timerRef.current = setInterval(() => {
        next();
      }, autoplayInterval);
    }, [
      autoplay,
      autoplayInterval,
      banners.length,
      disabled,
      next,
      stopAutoplay,
    ]);

    useEffect(() => {
      startAutoplay();

      return () => {
        stopAutoplay();
      };
    }, [startAutoplay, stopAutoplay]);

    /* =====================================================
         IMPERATIVE API
      ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        next,

        previous,

        goTo,

        startAutoplay,

        stopAutoplay,

        getCurrentIndex: () => currentIndexRef.current,

        getCurrentBanner: () => banners[currentIndexRef.current],
      }),
      [banners, goTo, next, previous, startAutoplay, stopAutoplay],
    );

    /* =====================================================
         EMPTY
      ===================================================== */

    if (banners.length === 0) {
      return null;
    }

    /* =====================================================
         PAGINATION
      ===================================================== */

    const renderPagination = () => {
      if (!showPagination || banners.length <= 1) {
        return null;
      }

      if (paginationType === "numbers") {
        return (
          <View style={styles.numberPagination}>
            <Text
              style={[
                styles.numberText,
                {
                  color: activeDotColor,
                },
              ]}
            >
              {currentIndex + 1}
            </Text>

            <Text
              style={[
                styles.numberSlash,
                {
                  color: inactiveDotColor,
                },
              ]}
            >
              /
            </Text>

            <Text
              style={[
                styles.numberText,
                {
                  color: inactiveDotColor,
                },
              ]}
            >
              {banners.length}
            </Text>
          </View>
        );
      }

      if (paginationType === "lines") {
        return (
          <View style={styles.linePagination}>
            {banners.map((banner, index) => (
              <Pressable
                key={banner.id}
                onPress={() => goTo(index)}
                style={[
                  styles.paginationLine,
                  {
                    width: index === currentIndex ? 26 : 10,

                    backgroundColor:
                      index === currentIndex
                        ? activeDotColor
                        : inactiveDotColor,
                  },
                ]}
              />
            ))}
          </View>
        );
      }

      return (
        <View style={styles.dotPagination}>
          {banners.map((banner, index) => (
            <Pressable
              key={banner.id}
              onPress={() => goTo(index)}
              hitSlop={8}
              style={[
                styles.paginationDot,
                {
                  width:
                    index === currentIndex
                      ? paginationSize * 2.5
                      : paginationSize,

                  height: paginationSize,

                  borderRadius: paginationSize,

                  marginHorizontal: paginationGap / 2,

                  backgroundColor:
                    index === currentIndex ? activeDotColor : inactiveDotColor,
                },
              ]}
            />
          ))}
        </View>
      );
    };

    /* =====================================================
         ARROWS
      ===================================================== */

    const renderArrows = () => {
      if (!showArrows || banners.length <= 1) {
        return null;
      }

      return (
        <>
          <Pressable
            disabled={disabled}
            onPress={previous}
            style={[
              styles.arrow,
              styles.leftArrow,
              {
                backgroundColor: arrowBackgroundColor,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={arrowColor} />
          </Pressable>

          <Pressable
            disabled={disabled}
            onPress={next}
            style={[
              styles.arrow,
              styles.rightArrow,
              {
                backgroundColor: arrowBackgroundColor,
              },
            ]}
          >
            <Ionicons name="chevron-forward" size={20} color={arrowColor} />
          </Pressable>
        </>
      );
    };

    /* =====================================================
         ITEM
      ===================================================== */

    const renderBannerItem = ({ item, index }) => {
      if (renderItem) {
        return renderItem({
          item,
          index,
          currentIndex,
          width,
          height,
        });
      }

      return (
        <BannerItem
          banner={item}
          index={index}
          currentIndex={currentIndex}
          width={width}
          height={height}
          borderRadius={borderRadius}
          reanimated={reanimated}
          onPress={onPress}
          contentStyle={contentStyle}
          titleStyle={titleStyle}
          subtitleStyle={subtitleStyle}
          buttonStyle={buttonStyle}
          buttonTextStyle={buttonTextStyle}
        />
      );
    };

    /* =====================================================
         KEY
      ===================================================== */

    const getKey = keyExtractor || ((item, index) => String(item.id ?? index));

    /* =====================================================
         MAIN
      ===================================================== */

    return (
      <View style={[styles.container, containerStyle, style]}>
        <AnimatedFlatList
          ref={listRef}
          data={banners}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={snapToInterval || width + gap}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          scrollEventThrottle={16}
          initialScrollIndex={initialIndex}
          keyExtractor={getKey}
          renderItem={renderBannerItem}
          contentContainerStyle={[
            {
              paddingHorizontal: 0,
            },
            contentContainerStyle,
          ]}
          ItemSeparatorComponent={() => (
            <View
              style={{
                width: gap,
              }}
            />
          )}
          onScroll={scrollHandler}
          onMomentumScrollEnd={handleMomentumEnd}
          onTouchStart={stopAutoplay}
          onTouchEnd={startAutoplay}
          {...rest}
        />

        {renderArrows()}

        {paginationPosition === "bottom" && renderPagination()}

        {paginationPosition === "top" && (
          <View style={styles.topPagination}>{renderPagination()}</View>
        )}

        {theme ? null : null}
      </View>
    );
  },
);

UIBannerCarousel.displayName = "UIBannerCarousel";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    width: "100%",

    position: "relative",
  },

  banner: {
    overflow: "hidden",

    position: "relative",

    justifyContent: "center",
  },

  imageOverlay: {
    zIndex: 1,
  },

  bannerContent: {
    flex: 1,

    zIndex: 3,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 20,

    paddingVertical: 16,

    position: "relative",
  },

  textContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "flex-start",
  },

  badge: {
    paddingHorizontal: 9,

    paddingVertical: 4,

    borderRadius: 20,

    marginBottom: 5,
  },

  badgeText: {
    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 0.4,
  },

  iconContainer: {
    marginBottom: 5,
  },

  title: {
    fontSize: 25,

    lineHeight: 29,

    fontWeight: "900",

    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 13,

    lineHeight: 18,

    fontWeight: "600",

    marginTop: 3,

    maxWidth: "95%",
  },

  description: {
    fontSize: 10,

    marginTop: 3,

    fontWeight: "500",
  },

  button: {
    minHeight: 34,

    paddingHorizontal: 14,

    borderRadius: 18,

    marginTop: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,
  },

  buttonText: {
    fontSize: 11,

    fontWeight: "900",
  },

  bannerImage: {
    width: "43%",

    height: "92%",

    marginLeft: 5,
  },

  rightIconContainer: {
    width: "38%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 5,
  },

  decorationOne: {
    position: "absolute",

    width: 130,

    height: 130,

    borderRadius: 70,

    right: -45,

    top: -55,

    zIndex: 2,
  },

  decorationTwo: {
    position: "absolute",

    width: 85,

    height: 85,

    borderRadius: 50,

    left: -35,

    bottom: -40,

    zIndex: 2,
  },

  /* =======================================================
     PAGINATION
  ======================================================= */

  dotPagination: {
    position: "absolute",

    bottom: 9,

    left: 0,

    right: 0,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 10,
  },

  paginationDot: {
    minWidth: 7,
  },

  linePagination: {
    position: "absolute",

    bottom: 10,

    left: 0,

    right: 0,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 10,
  },

  paginationLine: {
    height: 4,

    borderRadius: 4,

    marginHorizontal: 3,
  },

  numberPagination: {
    position: "absolute",

    bottom: 9,

    right: 12,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 9,

    paddingVertical: 4,

    borderRadius: 14,

    backgroundColor: "rgba(0,0,0,0.35)",

    zIndex: 10,
  },

  numberText: {
    fontSize: 11,

    fontWeight: "800",
  },

  numberSlash: {
    fontSize: 10,

    marginHorizontal: 3,
  },

  topPagination: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: 30,

    zIndex: 10,
  },

  /* =======================================================
     ARROWS
  ======================================================= */

  arrow: {
    position: "absolute",

    width: 34,

    height: 34,

    borderRadius: 18,

    alignItems: "center",

    justifyContent: "center",

    top: "50%",

    marginTop: -17,

    zIndex: 20,
  },

  leftArrow: {
    left: 8,
  },

  rightArrow: {
    right: 8,
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export default UIBannerCarousel;

export { UIBannerCarousel, DEFAULT_BANNERS as UIBannerCarouselDefaultData };
