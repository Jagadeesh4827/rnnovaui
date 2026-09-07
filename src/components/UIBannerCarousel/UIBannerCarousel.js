import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

/* =========================================================
   DEFAULT BANNERS
========================================================= */

const DEFAULT_BANNERS = [
  {
    id: "items-under-149",

    title: "ITEMS UNDER ₹149",

    subtitle: "EXPLORE BEST DEALS",

    backgroundColor: "#009C96",

    secondaryColor: "#0878C9",

    icon: "food",

    iconType: "material",

    buttonText: "Explore Now",

    buttonColor: "#FFFFFF",

    buttonTextColor: "#111111",
  },

  {
    id: "free-delivery",

    title: "FREE DELIVERY",

    subtitle: "ON ORDERS ABOVE ₹299",

    backgroundColor: "#0877D1",

    secondaryColor: "#1646A5",

    icon: "moped",

    iconType: "material",

    buttonText: "Order Now",

    buttonColor: "#FFFFFF",

    buttonTextColor: "#111111",
  },

  {
    id: "minimum-discount",

    title: "MINIMUM ₹125 OFF",

    subtitle: "ON YOUR FAVORITE MEALS",

    backgroundColor: "#A40086",

    secondaryColor: "#E51B70",

    icon: "sale",

    iconType: "material",

    buttonText: "Order Now",

    buttonColor: "#FFFFFF",

    buttonTextColor: "#111111",
  },

  {
    id: "breakfast",

    title: "BREAKFAST SUBSCRIPTIONS",

    subtitle: "START YOUR DAY WITH GREAT FOOD",

    backgroundColor: "#18A8E0",

    secondaryColor: "#0B72D0",

    icon: "coffee",

    iconType: "material",

    buttonText: "Explore Now",

    buttonColor: "#FFFFFF",

    buttonTextColor: "#111111",
  },

  {
    id: "items-50-off",

    title: "ITEMS AT 50% OFF",

    subtitle: "AMAZING FOOD. AMAZING PRICES.",

    backgroundColor: "#E31D25",

    secondaryColor: "#A40E38",

    icon: "percent",

    iconType: "material",

    buttonText: "Order Now",

    buttonColor: "#FFFFFF",

    buttonTextColor: "#111111",
  },
];

/* =========================================================
   ICON
========================================================= */

const BannerIcon = ({
  name,
  type = "material",
  size = 60,
  color = "#FFFFFF",
}) => {
  if (!name) {
    return null;
  }

  if (type === "ionicons") {
    return <Ionicons name={name} size={size} color={color} />;
  }

  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

/* =========================================================
   GRADIENT BACKGROUND
========================================================= */

const GradientBackground = ({ banner, gradientId }) => {
  const first = banner.backgroundColor || "#0877D1";

  const second = banner.secondaryColor || first;

  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={first} stopOpacity="1" />

          <Stop offset="100%" stopColor={second} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
};

/* =========================================================
   BANNER BACKGROUND
========================================================= */

const BannerBackground = ({ banner, gradientId }) => {
  /*
   * Full background image has priority.
   */

  if (banner.backgroundImage) {
    return (
      <Image
        source={banner.backgroundImage}
        resizeMode={banner.backgroundImageResizeMode || "cover"}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  /*
   * Gradient.
   */

  if (banner.backgroundColor && banner.secondaryColor) {
    return <GradientBackground banner={banner} gradientId={gradientId} />;
  }

  /*
   * Solid color.
   */

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: banner.backgroundColor || "#222222",
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
  gap,
  reanimated,
  onPress,
  titleStyle,
  subtitleStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  const active = index === currentIndex;

  const animation = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (!reanimated) {
      return;
    }

    animation.value = withTiming(active ? 1 : 0, {
      duration: 420,
    });
  }, [active, animation, reanimated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated) {
      return {};
    }

    const scale = interpolate(
      animation.value,
      [0, 1],
      [0.96, 1],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      animation.value,
      [0, 1],
      [0.86, 1],
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
      animation.value,
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

  /*
   * Every item gets exactly width + gap.
   * This prevents the FlatList from changing
   * the banner height/layout.
   */

  const gradientId = `uiBannerGradient_${banner.id}_${index}`;

  return (
    <View
      style={{
        width: width + gap,

        height,
      }}
    >
      <Animated.View
        style={[
          styles.banner,
          {
            width,
            height,
            borderRadius,
          },
          animatedStyle,
        ]}
      >
        <BannerBackground banner={banner} gradientId={gradientId} />

        {/*
         * Optional dark overlay for
         * background images.
         */}

        {banner.backgroundImage && banner.overlay !== false ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: banner.overlayColor || "rgba(0,0,0,0.18)",
              },
            ]}
          />
        ) : null}

        {/*
         * Decorative circles.
         */}

        {banner.decorations !== false && (
          <>
            <View
              pointerEvents="none"
              style={[
                styles.decorativeCircleOne,
                {
                  backgroundColor:
                    banner.decorationColor || "rgba(255,255,255,0.10)",
                },
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.decorativeCircleTwo,
                {
                  backgroundColor:
                    banner.decorationColor || "rgba(255,255,255,0.08)",
                },
              ]}
            />
          </>
        )}

        <Animated.View style={[styles.bannerContent, animatedContentStyle]}>
          {/*
           * LEFT CONTENT
           */}

          <View style={styles.leftContent}>
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
              <View style={styles.iconWrapper}>
                <BannerIcon
                  name={banner.icon}
                  type={banner.iconType}
                  size={banner.iconSize || 46}
                  color={banner.iconColor || "#FFFFFF"}
                />
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

            {banner.buttonText ? (
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
                      color: banner.buttonTextColor || "#111111",
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
                    color={banner.buttonTextColor || "#111111"}
                  />
                ) : null}
              </Pressable>
            ) : null}
          </View>

          {/*
           * FOREGROUND IMAGE
           */}

          {banner.image ? (
            <Image
              source={banner.image}
              resizeMode={banner.imageResizeMode || "contain"}
              style={[styles.foregroundImage, banner.imageStyle]}
            />
          ) : null}

          {/*
           * RIGHT ICON
           */}

          {banner.icon && banner.iconPosition === "right" ? (
            <View style={[styles.rightIcon, banner.iconContainerStyle]}>
              <BannerIcon
                name={banner.icon}
                type={banner.iconType}
                size={banner.iconSize || 82}
                color={banner.iconColor || "#FFFFFF"}
              />
            </View>
          ) : null}

          {/*
           * CUSTOM RENDER
           */}

          {banner.renderContent ? banner.renderContent(banner, index) : null}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UIBannerCarousel = forwardRef(
  (
    {
      data = DEFAULT_BANNERS,

      /*
       * IMPORTANT:
       * Height is fixed.
       */

      height = 180,

      /*
       * Width can be:
       *
       * "100%"
       *
       * or number.
       *
       * Default uses screen width
       * through onLayout.
       */

      width,

      borderRadius = 20,

      gap = 0,

      autoplay = true,

      autoplayInterval = 3500,

      loop = true,

      initialIndex = 0,

      reanimated = false,

      showPagination = true,

      paginationType = "dots",

      activeDotColor = "#FFFFFF",

      inactiveDotColor = "rgba(255,255,255,0.40)",

      paginationSize = 7,

      paginationGap = 5,

      paginationBottom = 9,

      showArrows = false,

      arrowColor = "#FFFFFF",

      arrowBackgroundColor = "rgba(0,0,0,0.35)",

      onIndexChange,

      onPress,

      onScroll,

      onMomentumScrollEnd,

      /*
       * Custom renderer.
       */

      renderItem,

      keyExtractor,

      /*
       * Styles.
       */

      containerStyle,

      contentContainerStyle,

      titleStyle,

      subtitleStyle,

      buttonStyle,

      buttonTextStyle,

      /*
       * Disable.
       */

      disabled = false,
    },
    ref,
  ) => {
    /*
     * Width measured from parent.
     *
     * This is important because
     * "100%" cannot be used directly
     * as a FlatList numeric layout size.
     */

    const [containerWidth, setContainerWidth] = useState(0);

    const listRef = useRef(null);

    const autoplayRef = useRef(null);

    const currentIndexRef = useRef(Math.max(0, initialIndex));

    const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));

    const [isDragging, setIsDragging] = useState(false);

    const scrollX = useSharedValue(0);

    /*
     * Normalize data.
     */

    const banners = useMemo(() => {
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item, index) => ({
        ...item,

        id: item.id ?? `banner-${index}`,
      }));
    }, [data]);

    /*
     * Actual width.
     */

    const actualWidth = typeof width === "number" ? width : containerWidth;

    /*
     * Nothing can be rendered until
     * parent width is known.
     */

    const itemSize = actualWidth > 0 ? actualWidth : 1;

    /* =====================================================
         UPDATE INDEX
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
         SCROLL
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
         MOMENTUM
      ===================================================== */

    const handleMomentumEnd = useCallback(
      (event) => {
        const x = event.nativeEvent.contentOffset.x;

        const index = Math.round(x / (itemSize + gap));

        updateIndex(index);

        setIsDragging(false);

        if (onMomentumScrollEnd) {
          onMomentumScrollEnd(event);
        }
      },
      [gap, itemSize, onMomentumScrollEnd, updateIndex],
    );

    /* =====================================================
         GO TO
      ===================================================== */

    const goTo = useCallback(
      (requestedIndex, animated = true) => {
        if (!listRef.current || banners.length === 0 || actualWidth <= 0) {
          return;
        }

        let index = requestedIndex;

        if (loop) {
          if (index < 0) {
            index = banners.length - 1;
          }

          if (index >= banners.length) {
            index = 0;
          }
        } else {
          index = Math.max(0, Math.min(index, banners.length - 1));
        }

        listRef.current.scrollToOffset({
          offset: index * (itemSize + gap),

          animated,
        });

        updateIndex(index);
      },
      [actualWidth, banners.length, gap, itemSize, loop, updateIndex],
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
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);

        autoplayRef.current = null;
      }
    }, []);

    const startAutoplay = useCallback(() => {
      stopAutoplay();

      if (!autoplay || disabled || banners.length <= 1 || isDragging) {
        return;
      }

      autoplayRef.current = setInterval(() => {
        next();
      }, autoplayInterval);
    }, [
      autoplay,
      autoplayInterval,
      banners.length,
      disabled,
      isDragging,
      next,
      stopAutoplay,
    ]);

    /*
     * Start autoplay.
     */

    useEffect(() => {
      startAutoplay();

      return () => {
        stopAutoplay();
      };
    }, [startAutoplay, stopAutoplay]);

    /*
     * Re-start after drag.
     */

    useEffect(() => {
      if (!isDragging) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    }, [isDragging, startAutoplay, stopAutoplay]);

    /* =====================================================
         IMPERATIVE REF
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
         PAGINATION
      ===================================================== */

    const renderPagination = () => {
      if (!showPagination || banners.length <= 1) {
        return null;
      }

      if (paginationType === "numbers") {
        return (
          <View
            style={[
              styles.numberPagination,
              {
                bottom: paginationBottom,
              },
            ]}
          >
            <Text
              style={[
                styles.numberActive,
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
                styles.numberTotal,
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
          <View
            pointerEvents="box-none"
            style={[
              styles.pagination,
              {
                bottom: paginationBottom,
              },
            ]}
          >
            {banners.map((banner, index) => (
              <Pressable
                key={banner.id}
                onPress={() => goTo(index)}
                hitSlop={8}
                style={[
                  styles.paginationLine,
                  {
                    width: index === currentIndex ? 28 : 9,

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
        <View
          pointerEvents="box-none"
          style={[
            styles.pagination,
            {
              bottom: paginationBottom,
            },
          ]}
        >
          {banners.map((banner, index) => (
            <Pressable
              key={banner.id}
              onPress={() => goTo(index)}
              hitSlop={8}
              style={[
                styles.dot,
                {
                  width:
                    index === currentIndex
                      ? paginationSize * 2.5
                      : paginationSize,

                  height: paginationSize,

                  borderRadius: paginationSize,

                  marginHorizontal: paginationGap,

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
         RENDER ITEM
      ===================================================== */

    const renderBanner = ({ item, index }) => {
      if (renderItem) {
        return renderItem({
          item,
          index,
          currentIndex,
          width: actualWidth,
          height,
        });
      }

      return (
        <BannerItem
          banner={item}
          index={index}
          currentIndex={currentIndex}
          width={actualWidth}
          height={height}
          borderRadius={borderRadius}
          gap={gap}
          reanimated={reanimated}
          onPress={onPress}
          titleStyle={titleStyle}
          subtitleStyle={subtitleStyle}
          buttonStyle={buttonStyle}
          buttonTextStyle={buttonTextStyle}
        />
      );
    };

    /* =====================================================
         EMPTY
      ===================================================== */

    if (banners.length === 0) {
      return null;
    }

    /* =====================================================
         RETURN
      ===================================================== */

    return (
      <View
        onLayout={(event) => {
          if (typeof width !== "number") {
            const measuredWidth = event.nativeEvent.layout.width;

            if (measuredWidth > 0) {
              setContainerWidth(measuredWidth);
            }
          }
        }}
        style={[
          styles.container,
          {
            height,
          },
          containerStyle,
        ]}
      >
        {actualWidth > 0 ? (
          <AnimatedFlatList
            ref={listRef}
            data={banners}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            scrollEventThrottle={16}
            /*
             * Fixed item width.
             */

            snapToInterval={actualWidth + gap}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            /*
             * Initial position.
             */

            initialScrollIndex={Math.max(
              0,
              Math.min(initialIndex, banners.length - 1),
            )}
            getItemLayout={(_data, index) => ({
              length: actualWidth + gap,

              offset: (actualWidth + gap) * index,

              index,
            })}
            keyExtractor={(item, index) =>
              String(
                keyExtractor ? keyExtractor(item, index) : (item.id ?? index),
              )
            }
            renderItem={renderBanner}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            onScroll={scrollHandler}
            onScrollBeginDrag={() => {
              setIsDragging(true);

              stopAutoplay();
            }}
            onMomentumScrollEnd={handleMomentumEnd}
            onTouchEnd={() => {
              setIsDragging(false);
            }}
            scrollEnabled={!disabled && banners.length > 1}
          />
        ) : null}

        {/*
         * Pagination is INSIDE the
         * fixed-height container.
         */}

        {renderPagination()}

        {renderArrows()}
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

    overflow: "hidden",
  },

  listContent: {
    padding: 0,

    margin: 0,
  },

  banner: {
    position: "relative",

    overflow: "hidden",

    justifyContent: "center",
  },

  bannerContent: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    paddingVertical: 12,

    position: "relative",

    zIndex: 5,
  },

  leftContent: {
    flex: 1,

    justifyContent: "center",

    alignItems: "flex-start",

    paddingBottom: 5,
  },

  iconWrapper: {
    marginBottom: 3,
  },

  title: {
    fontSize: 25,

    lineHeight: 29,

    fontWeight: "900",

    letterSpacing: -0.5,

    maxWidth: "100%",
  },

  subtitle: {
    fontSize: 12.5,

    lineHeight: 17,

    fontWeight: "600",

    marginTop: 3,

    maxWidth: "100%",
  },

  description: {
    fontSize: 10,

    lineHeight: 14,

    fontWeight: "500",

    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 9,

    paddingVertical: 4,

    borderRadius: 20,

    marginBottom: 5,
  },

  badgeText: {
    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 0.5,
  },

  button: {
    minHeight: 32,

    paddingHorizontal: 13,

    paddingVertical: 6,

    borderRadius: 17,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,

    marginTop: 8,
  },

  buttonText: {
    fontSize: 11,

    fontWeight: "900",
  },

  foregroundImage: {
    width: "43%",

    height: "92%",

    marginLeft: 5,

    zIndex: 4,
  },

  rightIcon: {
    width: "38%",

    height: "100%",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 4,
  },

  decorativeCircleOne: {
    position: "absolute",

    width: 140,

    height: 140,

    borderRadius: 70,

    right: -55,

    top: -65,

    zIndex: 2,
  },

  decorativeCircleTwo: {
    position: "absolute",

    width: 95,

    height: 95,

    borderRadius: 50,

    left: -48,

    bottom: -55,

    zIndex: 2,
  },

  /* =======================================================
     PAGINATION
  ======================================================= */

  pagination: {
    position: "absolute",

    left: 0,

    right: 0,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 100,
  },

  dot: {
    minWidth: 7,
  },

  paginationLine: {
    height: 4,

    borderRadius: 4,

    marginHorizontal: 3,
  },

  numberPagination: {
    position: "absolute",

    right: 10,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 9,

    paddingVertical: 4,

    borderRadius: 15,

    backgroundColor: "rgba(0,0,0,0.35)",

    zIndex: 100,
  },

  numberActive: {
    fontSize: 11,

    fontWeight: "900",
  },

  numberSlash: {
    fontSize: 10,

    marginHorizontal: 3,
  },

  numberTotal: {
    fontSize: 10,

    fontWeight: "700",
  },

  /* =======================================================
     ARROWS
  ======================================================= */

  arrow: {
    position: "absolute",

    width: 34,

    height: 34,

    borderRadius: 17,

    alignItems: "center",

    justifyContent: "center",

    top: "50%",

    marginTop: -17,

    zIndex: 200,
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
