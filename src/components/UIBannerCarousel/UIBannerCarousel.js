import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const BACKGROUND_ANIMATIONS = [
  "none",
  "rays",
  "pulse",
  "float",
  "zoom",
  "kenBurns",
  "glow",
  "wave",
  "shimmer",
];

const ASSET_ANIMATIONS = [
  "none",
  "float",
  "pulse",
  "rotate",
  "zoom",
  "bounce",
  "slideUp",
  "slideLeft",
  "slideRight",
  "fade",
];

const CONTENT_ANIMATIONS = [
  "none",
  "fade",
  "slideUp",
  "slideLeft",
  "slideRight",
  "scale",
  "bounce",
];

/* ==========================================================================
   HELPERS
   ========================================================================== */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPositionStyle = (position = {}) => {
  const result = {};

  if (position.top !== undefined) {
    result.top = position.top;
  }

  if (position.bottom !== undefined) {
    result.bottom = position.bottom;
  }

  if (position.left !== undefined) {
    result.left = position.left;
  }

  if (position.right !== undefined) {
    result.right = position.right;
  }

  return result;
};

const normalizeBackground = (banner) => {
  if (banner.background) {
    if (typeof banner.background === "string") {
      return {
        type: "color",
        color: banner.background,
      };
    }

    return {
      type: banner.background.type || "color",

      ...banner.background,
    };
  }

  if (banner.backgroundColor) {
    return {
      type: "color",
      color: banner.backgroundColor,
    };
  }

  if (banner.backgroundImage) {
    return {
      type: "image",
      source: banner.backgroundImage,
    };
  }

  if (banner.gradientColors) {
    return {
      type: "gradient",
      colors: banner.gradientColors,
      start: banner.gradientStart || {
        x: 0,
        y: 0,
      },
      end: banner.gradientEnd || {
        x: 1,
        y: 1,
      },
    };
  }

  return {
    type: "color",
    color: "#1976D2",
  };
};

/* ==========================================================================
   BACKGROUND ANIMATION
   ========================================================================== */

const useBackgroundAnimation = ({
  animation = "none",
  enabled = false,
  duration = 5000,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!enabled || animation === "none") {
      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => {
      progress.value = 0;
    };
  }, [animation, duration, enabled]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    switch (animation) {
      case "pulse":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.92, 1, 0.92]),
        };

      case "float":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 0.5, 1], [0, -8, 0]),
            },
          ],
        };

      case "zoom":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.06]),
            },
          ],
        };

      case "kenBurns":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.1]),
            },
            {
              translateX: interpolate(progress.value, [0, 1], [0, -10]),
            },
          ],
        };

      case "wave":
        return {
          transform: [
            {
              translateX: interpolate(progress.value, [0, 0.5, 1], [-8, 8, -8]),
            },
          ],
        };

      case "shimmer":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.75, 1, 0.75]),
        };

      case "glow":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.8, 1, 0.8]),
        };

      default:
        return {};
    }
  });

  return {
    progress,
    animatedStyle,
  };
};

/* ==========================================================================
   BANNER BACKGROUND
   ========================================================================== */

const BannerBackground = ({ banner, width, height, reanimated }) => {
  const background = normalizeBackground(banner);

  /*
   * IMPORTANT:
   * Extract primitive values before entering worklets.
   *
   * Do NOT access banner.* inside useAnimatedStyle.
   */

  const backgroundAnimation = banner.backgroundAnimation || "none";

  const backgroundAnimationDuration =
    banner.backgroundAnimationDuration || 5000;

  const { progress, animatedStyle } = useBackgroundAnimation({
    animation: backgroundAnimation,

    enabled: reanimated,

    duration: backgroundAnimationDuration,
  });

  const raysStyle = useAnimatedStyle(() => {
    if (!reanimated || backgroundAnimation !== "rays") {
      return {};
    }

    return {
      transform: [
        {
          rotate: `${progress.value * 360}deg`,
        },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    if (!reanimated || backgroundAnimation !== "glow") {
      return {};
    }

    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.65, 0.2]),

      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [0.9, 1.15, 0.9]),
        },
      ],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    if (!reanimated || backgroundAnimation !== "shimmer") {
      return {};
    }

    return {
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [-width, width]),
        },
      ],
    };
  });

  const renderBackground = () => {
    if (background.type === "image") {
      return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <Image
            source={background.source}
            resizeMode={background.resizeMode || "cover"}
            style={[
              styles.backgroundImage,
              {
                width,
                height,
              },
              background.imageStyle,
            ]}
          />
        </Animated.View>
      );
    }

    if (background.type === "gradient") {
      return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <LinearGradient
            colors={background.colors || ["#1976D2", "#42A5F5"]}
            start={
              background.start || {
                x: 0,
                y: 0,
              }
            }
            end={
              background.end || {
                x: 1,
                y: 1,
              }
            }
            locations={background.locations}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          {
            backgroundColor: background.color || "#1976D2",
          },
        ]}
      />
    );
  };

  const showRings = banner.rings !== false;

  const showRays = banner.rays === true;

  const showGlow = banner.glow !== false;

  const showDecorations = banner.decorations !== false;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          overflow: "hidden",
        },
      ]}
    >
      {/* Main background */}
      {renderBackground()}

      {/* ================================================================ */}
      {/* RINGS                                                            */}
      {/* ================================================================ */}

      {showRings && (
        <>
          <View
            style={[
              styles.ring,
              {
                width: width * 1.5,

                height: width * 1.5,

                borderRadius: width * 0.75,

                left: width * -0.25,

                top: height * 0.25,

                opacity: banner.ringsOpacity ?? 0.15,
              },
            ]}
          />

          <View
            style={[
              styles.ring,
              {
                width: width * 1.1,

                height: width * 1.1,

                borderRadius: width * 0.55,

                left: width * -0.05,

                top: height * 0.34,

                opacity: (banner.ringsOpacity ?? 0.15) * 0.8,
              },
            ]}
          />

          <View
            style={[
              styles.ring,
              {
                width: width * 0.75,

                height: width * 0.75,

                borderRadius: width * 0.375,

                left: width * 0.125,

                top: height * 0.43,

                opacity: (banner.ringsOpacity ?? 0.15) * 0.65,
              },
            ]}
          />
        </>
      )}

      {/* ================================================================ */}
      {/* RAYS                                                             */}
      {/* ================================================================ */}

      {showRays && (
        <Animated.View
          style={[
            styles.rays,
            {
              width: width * 1.6,

              height: width * 1.6,

              left: width * -0.3,

              top: height * 0.18,
            },
            raysStyle,
          ]}
        >
          {Array.from({
            length: banner.rayCount || 12,
          }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.ray,
                {
                  transform: [
                    {
                      rotate: `${index * (360 / (banner.rayCount || 12))}deg`,
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {/* ================================================================ */}
      {/* GLOW                                                             */}
      {/* ================================================================ */}

      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: width * 0.8,

              height: width * 0.8,

              borderRadius: width * 0.4,

              left: width * 0.1,

              top: height * 0.38,
            },
            glowStyle,
          ]}
        />
      )}

      {/* ================================================================ */}
      {/* SHIMMER                                                          */}
      {/* ================================================================ */}

      {banner.shimmer && (
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      )}

      {/* ================================================================ */}
      {/* DECORATIONS                                                      */}
      {/* ================================================================ */}

      {showDecorations &&
        Array.from({
          length: banner.decorationCount || 8,
        }).map((_, index) => (
          <View
            key={`decoration-${index}`}
            style={[
              styles.decoration,
              {
                left: (index * 47) % Math.max(width - 20, 1),

                top: 20 + ((index * 67) % Math.max(height - 40, 1)),

                width: 4 + (index % 3) * 3,

                height: 4 + (index % 3) * 3,

                opacity: banner.decorationOpacity ?? 0.3,
              },
            ]}
          />
        ))}
    </View>
  );
};

/* ==========================================================================
   BANNER ASSET
   ========================================================================== */

const BannerAsset = ({ asset, reanimated }) => {
  /*
   * Extract primitive values.
   * Nothing complex is captured by worklets.
   */

  const animation = asset.animation || "none";

  const animationDuration = asset.animationDuration || 3000;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!reanimated || animation === "none") {
      return;
    }

    if (animation === "bounce") {
      progress.value = withRepeat(
        withSequence(withSpring(1), withSpring(0)),
        -1,
        false,
      );

      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration: animationDuration,

        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => {
      progress.value = 0;
    };
  }, [animation, animationDuration, reanimated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || animation === "none") {
      return {};
    }

    switch (animation) {
      case "float":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 0.5, 1], [0, -12, 0]),
            },
          ],
        };

      case "pulse":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.08, 1]),
            },
          ],
        };

      case "rotate":
        return {
          transform: [
            {
              rotate: `${progress.value * 360}deg`,
            },
          ],
        };

      case "zoom":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.12]),
            },
          ],
        };

      case "bounce":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [0, -16]),
            },
          ],
        };

      case "slideUp":
        return {
          opacity: interpolate(progress.value, [0, 0.25, 1], [0, 1, 1]),

          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [30, 0]),
            },
          ],
        };

      case "slideLeft":
        return {
          opacity: interpolate(progress.value, [0, 0.25, 1], [0, 1, 1]),

          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [40, 0]),
            },
          ],
        };

      case "slideRight":
        return {
          opacity: interpolate(progress.value, [0, 0.25, 1], [0, 1, 1]),

          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-40, 0]),
            },
          ],
        };

      case "fade":
        return {
          opacity: progress.value,
        };

      default:
        return {};
    }
  });

  const source = asset.source || asset.image || asset.uri;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.asset,
        getPositionStyle(asset.position),
        {
          width: asset.width || 100,

          height: asset.height || 100,

          opacity: asset.opacity ?? 1,

          zIndex: asset.zIndex || 1,

          transform: [
            {
              rotate: `${asset.rotate || 0}deg`,
            },
          ],
        },

        animatedStyle,

        asset.style,
      ]}
    >
      {asset.render ? (
        asset.render(asset)
      ) : source ? (
        <Image
          source={source}
          resizeMode={asset.resizeMode || "contain"}
          style={styles.assetImage}
        />
      ) : null}
    </Animated.View>
  );
};

/* ==========================================================================
   BANNER CONTENT
   ========================================================================== */

const BannerContent = ({ banner, reanimated, onPress }) => {
  const animation = banner.contentAnimation || "none";

  const animationDuration = banner.contentAnimationDuration || 650;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!reanimated || animation === "none") {
      return;
    }

    progress.value = withTiming(1, {
      duration: animationDuration,

      easing: Easing.out(Easing.cubic),
    });

    return () => {
      progress.value = 0;
    };
  }, [animation, animationDuration, reanimated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || animation === "none") {
      return {};
    }

    switch (animation) {
      case "fade":
        return {
          opacity: progress.value,
        };

      case "slideUp":
        return {
          opacity: progress.value,

          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [35, 0]),
            },
          ],
        };

      case "slideLeft":
        return {
          opacity: progress.value,

          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [50, 0]),
            },
          ],
        };

      case "slideRight":
        return {
          opacity: progress.value,

          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-50, 0]),
            },
          ],
        };

      case "scale":
        return {
          opacity: progress.value,

          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.85, 1]),
            },
          ],
        };

      case "bounce":
        return {
          opacity: progress.value,

          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [30, 0]),
            },
            {
              scale: interpolate(progress.value, [0, 0.7, 1], [0.8, 1.05, 1]),
            },
          ],
        };

      default:
        return {};
    }
  });

  /*
   * renderContent stays on JS thread.
   */
  if (banner.renderContent) {
    return (
      <Animated.View
        style={[styles.content, banner.contentStyle, animatedStyle]}
      >
        {banner.renderContent()}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.content, banner.contentStyle, animatedStyle]}>
      {banner.badge ? (
        <View style={[styles.badge, banner.badgeStyle]}>
          {banner.badgeIcon}

          <Text style={[styles.badgeText, banner.badgeTextStyle]}>
            {banner.badge}
          </Text>
        </View>
      ) : null}

      {banner.eyebrow ? (
        <Text style={[styles.eyebrow, banner.eyebrowStyle]}>
          {banner.eyebrow}
        </Text>
      ) : null}

      {banner.title ? (
        <Text style={[styles.title, banner.titleStyle]}>{banner.title}</Text>
      ) : null}

      {banner.subtitle ? (
        <Text style={[styles.subtitle, banner.subtitleStyle]}>
          {banner.subtitle}
        </Text>
      ) : null}

      {banner.buttonText ? (
        <Pressable
          onPress={onPress}
          style={[styles.button, banner.buttonStyle]}
        >
          <Text style={[styles.buttonText, banner.buttonTextStyle]}>
            {banner.buttonText}
          </Text>

          {banner.buttonIcon || <Text style={styles.arrow}>›</Text>}
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

/* ==========================================================================
   HEADER WRAPPER
   ========================================================================== */

const BannerHeader = ({ renderHeader, header, insets, width }) => {
  if (renderHeader) {
    return (
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        {renderHeader({
          insets,
          width,
        })}
      </View>
    );
  }

  if (!header) {
    return null;
  }

  return (
    <View
      style={[
        styles.headerWrapper,
        {
          paddingTop: insets.top,
        },
        header.style,
      ]}
    >
      {header.render ? (
        header.render({
          insets,
          width,
        })
      ) : (
        <View style={styles.headerRow}>
          {header.left ? (
            <View style={styles.headerLeft}>{header.left}</View>
          ) : null}

          <View style={styles.headerCenter}>
            {header.title ? (
              <Text style={styles.headerTitle}>{header.title}</Text>
            ) : null}

            {header.subtitle ? (
              <Text numberOfLines={1} style={styles.headerSubtitle}>
                {header.subtitle}
              </Text>
            ) : null}
          </View>

          {header.right ? (
            <View style={styles.headerRight}>{header.right}</View>
          ) : null}
        </View>
      )}
    </View>
  );
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

const UIBannerCarousel = ({
  banners = [],

  width = SCREEN_WIDTH,

  /*
   * Complete height including:
   *
   * status bar
   * header
   * search
   * carousel content
   */
  height = 590,

  /*
   * Space reserved for UIHomeHeader.
   */
  headerHeight = 205,

  /*
   * Banner background extends across
   * status bar + header + carousel.
   */
  coverStatusBar = true,

  header,
  renderHeader,

  autoplay = true,

  interval = 4500,

  loop = true,

  swipe = true,

  showPagination = true,

  paginationPosition = "bottom",

  showNavigation = false,

  gap = 0,

  reanimated = false,

  style,

  slideStyle,

  contentContainerStyle,

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  onIndexChange,

  onPress,
}) => {
  const insets = useSafeAreaInsets();

  const scrollRef = useRef(null);

  const timerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const bannerCount = banners.length;

  const safeIndex = clamp(activeIndex, 0, Math.max(bannerCount - 1, 0));

  /*
   * The body cannot become negative.
   */
  const carouselBodyHeight = Math.max(height - headerHeight, 1);

  /* ====================================================================== */
  /* INDEX                                                                   */
  /* ====================================================================== */

  const scrollToIndex = useCallback(
    (index, animated = true) => {
      if (!bannerCount) {
        return;
      }

      let nextIndex = index;

      if (loop) {
        if (nextIndex >= bannerCount) {
          nextIndex = 0;
        }

        if (nextIndex < 0) {
          nextIndex = bannerCount - 1;
        }
      } else {
        nextIndex = clamp(nextIndex, 0, bannerCount - 1);
      }

      scrollRef.current?.scrollTo({
        x: nextIndex * (width + gap),

        animated,
      });

      setActiveIndex(nextIndex);

      onIndexChange?.(nextIndex, banners[nextIndex]);
    },
    [bannerCount, banners, gap, loop, onIndexChange, width],
  );

  /* ====================================================================== */
  /* AUTOPLAY                                                               */
  /* ====================================================================== */

  useEffect(() => {
    if (!autoplay || bannerCount <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      scrollToIndex(safeIndex + 1, true);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoplay, bannerCount, interval, safeIndex, scrollToIndex]);

  /* ====================================================================== */
  /* STATUS BAR                                                              */
  /* ====================================================================== */

  useEffect(() => {
    if (!coverStatusBar) {
      return;
    }

    const statusBarStyle =
      banners[safeIndex]?.statusBarStyle || "light-content";

    StatusBar.setBarStyle(statusBarStyle, true);

    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);

      StatusBar.setBackgroundColor("transparent");
    }
  }, [banners, coverStatusBar, safeIndex]);

  /* ====================================================================== */
  /* SCROLL                                                                  */
  /* ====================================================================== */

  const handleMomentumEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;

    const index = Math.round(x / (width + gap));

    const nextIndex = clamp(index, 0, bannerCount - 1);

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);

      onIndexChange?.(nextIndex, banners[nextIndex]);
    }
  };

  /* ====================================================================== */
  /* PRESS                                                                   */
  /* ====================================================================== */

  const handlePress = (banner, index) => {
    onPress?.(banner, index);

    banner.onPress?.(banner, index);
  };

  /* ====================================================================== */
  /* PAGINATION                                                              */
  /* ====================================================================== */

  const renderPagination = () => {
    if (!showPagination || bannerCount <= 1) {
      return null;
    }

    return (
      <View
        style={[
          styles.pagination,

          paginationPosition === "bottom"
            ? styles.paginationBottom
            : styles.paginationCenter,

          paginationStyle,
        ]}
      >
        {banners.map((banner, index) => (
          <Pressable
            key={banner.id || `dot-${index}`}
            onPress={() => scrollToIndex(index, true)}
            style={[
              styles.dot,

              index === safeIndex
                ? [styles.activeDot, activeDotStyle]
                : [styles.inactiveDot, inactiveDotStyle],
            ]}
          />
        ))}
      </View>
    );
  };

  if (!bannerCount) {
    return null;
  }

  /* ====================================================================== */
  /* RENDER                                                                  */
  /* ====================================================================== */

  return (
    <View
      style={[
        styles.root,

        {
          width,
          height,
        },

        style,
      ]}
    >
      {/* ================================================================== */}
      {/* ACTIVE FULL-SCREEN BACKGROUND                                      */}
      {/* ================================================================== */}

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <BannerBackground
          banner={banners[safeIndex]}
          width={width}
          height={height}
          reanimated={reanimated}
        />
      </View>

      {/* ================================================================== */}
      {/* HEADER                                                              */}
      {/* ================================================================== */}

      <View
        style={[
          styles.headerLayer,
          {
            height: headerHeight,
          },
        ]}
      >
        <BannerHeader
          renderHeader={renderHeader}
          header={header}
          insets={insets}
          width={width}
        />
      </View>

      {/* ================================================================== */}
      {/* CAROUSEL BODY                                                       */}
      {/* ================================================================== */}

      <View
        style={[
          styles.carouselLayer,
          {
            top: headerHeight,

            bottom: 0,
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={gap === 0}
          snapToInterval={gap > 0 ? width + gap : undefined}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={swipe}
          bounces={false}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {banners.map((banner, index) => (
            <Pressable
              key={banner.id || `banner-${index}`}
              onPress={() => handlePress(banner, index)}
              style={[
                styles.slide,

                {
                  width,

                  height: carouselBodyHeight,

                  marginRight: index === bannerCount - 1 ? 0 : gap,
                },

                slideStyle,

                banner.style,
              ]}
            >
              {/* ====================================================== */}
              {/* IMAGES                                                  */}
              {/* ====================================================== */}

              {banner.images?.map((asset, assetIndex) => (
                <BannerAsset
                  key={asset.id || `image-${assetIndex}`}
                  asset={asset}
                  reanimated={reanimated && index === safeIndex}
                />
              ))}

              {/* ====================================================== */}
              {/* ICONS                                                   */}
              {/* ====================================================== */}

              {banner.icons?.map((asset, assetIndex) => (
                <BannerAsset
                  key={asset.id || `icon-${assetIndex}`}
                  asset={asset}
                  reanimated={reanimated && index === safeIndex}
                />
              ))}

              {/* ====================================================== */}
              {/* CONTENT                                                 */}
              {/* ====================================================== */}

              <BannerContent
                banner={banner}
                reanimated={reanimated && index === safeIndex}
                onPress={() => handlePress(banner, index)}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ================================================================== */}
      {/* PAGINATION                                                         */}
      {/* ================================================================== */}

      {renderPagination()}

      {/* ================================================================== */}
      {/* NAVIGATION                                                         */}
      {/* ================================================================== */}

      {showNavigation && bannerCount > 1 ? (
        <>
          <Pressable
            style={[styles.navigation, styles.navigationLeft]}
            onPress={() => scrollToIndex(safeIndex - 1)}
          >
            <Text style={styles.navigationText}>‹</Text>
          </Pressable>

          <Pressable
            style={[styles.navigation, styles.navigationRight]}
            onPress={() => scrollToIndex(safeIndex + 1)}
          >
            <Text style={styles.navigationText}>›</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
};

/* ==========================================================================
   STYLES
   ========================================================================== */

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "hidden",
  },

  /* ====================================================================== */
  /* LAYOUT                                                                  */
  /* ====================================================================== */

  headerLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,

    zIndex: 100,
  },

  carouselLayer: {
    position: "absolute",
    left: 0,
    right: 0,

    zIndex: 20,
  },

  scrollContent: {
    alignItems: "stretch",
  },

  slide: {
    position: "relative",
    overflow: "hidden",
  },

  /* ====================================================================== */
  /* BACKGROUND                                                              */
  /* ====================================================================== */

  backgroundImage: {
    position: "absolute",
    left: 0,
    top: 0,
  },

  ring: {
    position: "absolute",

    borderWidth: 1.5,

    borderColor: "rgba(255,255,255,0.8)",
  },

  rays: {
    position: "absolute",

    alignItems: "center",
    justifyContent: "center",
  },

  ray: {
    position: "absolute",

    width: 3,
    height: "50%",

    top: 0,

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  glow: {
    position: "absolute",

    backgroundColor: "rgba(255,255,255,0.28)",
  },

  shimmer: {
    position: "absolute",

    top: 0,
    bottom: 0,

    width: 100,

    backgroundColor: "rgba(255,255,255,0.10)",

    transform: [
      {
        skewX: "-15deg",
      },
    ],
  },

  decoration: {
    position: "absolute",

    borderRadius: 100,

    backgroundColor: "#FFF",
  },

  /* ====================================================================== */
  /* ASSETS                                                                  */
  /* ====================================================================== */

  asset: {
    position: "absolute",
  },

  assetImage: {
    width: "100%",
    height: "100%",
  },

  /* ====================================================================== */
  /* CONTENT                                                                 */
  /* ====================================================================== */

  content: {
    position: "absolute",

    left: 28,
    right: 28,

    bottom: 48,

    zIndex: 50,
  },

  badge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,
    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor: "#FFD32A",

    marginBottom: 8,
  },

  badgeText: {
    color: "#111",

    fontSize: 13,

    fontWeight: "800",
  },

  eyebrow: {
    color: "#FFF",

    fontSize: 15,

    fontWeight: "700",

    marginBottom: 4,
  },

  title: {
    color: "#FFF",

    fontSize: 38,

    lineHeight: 42,

    fontWeight: "900",

    letterSpacing: -1,
  },

  subtitle: {
    color: "#FFF",

    fontSize: 16,

    lineHeight: 22,

    marginTop: 8,
  },

  button: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 16,

    minHeight: 46,

    paddingHorizontal: 21,

    borderRadius: 25,

    backgroundColor: "#111",

    borderWidth: 1.5,

    borderColor: "#FFF",
  },

  buttonText: {
    color: "#FFF",

    fontSize: 16,

    fontWeight: "800",
  },

  arrow: {
    color: "#FFF",

    fontSize: 28,

    lineHeight: 28,

    marginLeft: 9,
  },

  /* ====================================================================== */
  /* HEADER FALLBACK                                                        */
  /* ====================================================================== */

  headerWrapper: {
    width: "100%",

    zIndex: 100,
  },

  headerRow: {
    minHeight: 62,

    flexDirection: "row",

    alignItems: "center",
  },

  headerLeft: {
    marginRight: 12,
  },

  headerCenter: {
    flex: 1,
  },

  headerRight: {
    marginLeft: 12,

    flexDirection: "row",

    alignItems: "center",
  },

  headerTitle: {
    color: "#FFF",

    fontSize: 24,

    fontWeight: "800",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",

    fontSize: 14,

    marginTop: 3,
  },

  /* ====================================================================== */
  /* PAGINATION                                                              */
  /* ====================================================================== */

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    zIndex: 200,
  },

  paginationBottom: {
    bottom: 13,
  },

  paginationCenter: {
    bottom: "50%",
  },

  dot: {
    marginHorizontal: 4,

    borderRadius: 20,
  },

  activeDot: {
    width: 9,
    height: 9,

    backgroundColor: "#FFF",
  },

  inactiveDot: {
    width: 7,
    height: 7,

    backgroundColor: "rgba(255,255,255,0.45)",
  },

  /* ====================================================================== */
  /* NAVIGATION                                                              */
  /* ====================================================================== */

  navigation: {
    position: "absolute",

    top: "50%",

    width: 42,
    height: 42,

    marginTop: -21,

    borderRadius: 21,

    backgroundColor: "rgba(0,0,0,0.35)",

    alignItems: "center",
    justifyContent: "center",

    zIndex: 250,
  },

  navigationLeft: {
    left: 10,
  },

  navigationRight: {
    right: 10,
  },

  navigationText: {
    color: "#FFF",

    fontSize: 32,

    lineHeight: 35,
  },
});

/* ==========================================================================
   EXPORTS
   ========================================================================== */

export default UIBannerCarousel;

export {
  UIBannerCarousel,
  BACKGROUND_ANIMATIONS as UIBannerCarouselBackgroundAnimations,
  ASSET_ANIMATIONS as UIBannerCarouselAssetAnimations,
  CONTENT_ANIMATIONS as UIBannerCarouselContentAnimations,
};
