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
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/* =========================================================
   CONSTANTS
========================================================= */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const TEXT_ANIMATIONS = [
  "none",
  "fade",
  "fadeUp",
  "fadeDown",
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
  "rotate",
  "flip",
];

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeBackground = (background) => {
  if (!background) {
    return {
      type: "color",
      value: "#111827",
    };
  }

  if (typeof background === "string") {
    return {
      type: "color",
      value: background,
    };
  }

  return {
    type: background.type || "color",
    value: background.value,
    colors: background.colors,
    locations: background.locations,
    start: background.start,
    end: background.end,
    resizeMode: background.resizeMode || "cover",
  };
};

/* =========================================================
   BACKGROUND ANIMATION
========================================================= */

const useBackgroundAnimation = ({
  animation,
  duration = 7000,
  reanimated = true,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!reanimated || !animation || animation === "none") {
      progress.value = 0;
      return;
    }

    progress.value = 0;

    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [animation, duration, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || !animation || animation === "none") {
      return {};
    }

    switch (animation) {
      case "rays":
        return {
          transform: [
            {
              rotate: `${progress.value * 360}deg`,
            },
          ],
        };

      case "pulse":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.75, 1, 0.75]),
        };

      case "float":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 0.5, 1], [0, -12, 0]),
            },
          ],
        };

      case "zoom":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.08]),
            },
          ],
        };

      case "kenBurns":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.12]),
            },
            {
              translateX: interpolate(progress.value, [0, 1], [0, -18]),
            },
          ],
        };

      case "glow":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.35, 0.9, 0.35]),
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.8, 1.4]),
            },
          ],
        };

      case "wave":
        return {
          transform: [
            {
              translateX: interpolate(
                progress.value,
                [0, 0.5, 1],
                [-20, 20, -20],
              ),
            },
          ],
        };

      case "shimmer":
        return {
          transform: [
            {
              translateX: interpolate(
                progress.value,
                [0, 1],
                [-SCREEN_WIDTH, SCREEN_WIDTH],
              ),
            },
          ],
        };

      default:
        return {};
    }
  });

  return animatedStyle;
};

/* =========================================================
   BANNER BACKGROUND
========================================================= */

const BannerBackground = ({
  background,
  backgroundAnimation = "none",
  backgroundAnimationDuration = 7000,
  reanimated = true,
  width,
  height,
}) => {
  const bg = normalizeBackground(background);

  const animatedStyle = useBackgroundAnimation({
    animation: backgroundAnimation,
    duration: backgroundAnimationDuration,
    reanimated,
  });

  if (bg.type === "gradient") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, animatedStyle]}
      >
        <LinearGradient
          colors={bg.colors || ["#111827", "#1F2937"]}
          locations={bg.locations}
          start={bg.start || { x: 0, y: 0 }}
          end={bg.end || { x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    );
  }

  if (bg.type === "image") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, animatedStyle]}
      >
        <Image
          source={bg.value}
          resizeMode={bg.resizeMode}
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
          backgroundColor: bg.value || "#111827",
        },
        animatedStyle,
      ]}
    />
  );
};

/* =========================================================
   DECORATIVE BACKGROUND EFFECTS
========================================================= */

const BackgroundEffects = ({ type, reanimated }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!reanimated || !type || type === "none") {
      return;
    }

    progress.value = 0;

    progress.value = withRepeat(
      withTiming(1, {
        duration: 7000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [type, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated) {
      return {};
    }

    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.7, 0.2]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [0.8, 1.25]),
        },
      ],
    };
  });

  if (!type || type === "none") {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.effectsLayer, animatedStyle]}
    >
      {type === "rings" && (
        <>
          <View style={[styles.ring, styles.ringOne]} />
          <View style={[styles.ring, styles.ringTwo]} />
          <View style={[styles.ring, styles.ringThree]} />
        </>
      )}

      {type === "rays" && (
        <View style={styles.raysContainer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.ray,
                {
                  transform: [
                    {
                      rotate: `${index * 36}deg`,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}

      {type === "glow" && (
        <View style={styles.glowContainer}>
          <View style={styles.glowCircle} />
        </View>
      )}

      {type === "shimmer" && (
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.16)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      )}

      <View style={styles.particleContainer}>
        {Array.from({ length: 12 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.particle,
              {
                left: `${(index * 23) % 100}%`,
                top: `${(index * 37) % 100}%`,
                opacity: 0.15 + (index % 4) * 0.12,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

/* =========================================================
   POSITION
========================================================= */

const getPositionStyle = (asset, width, height) => {
  const position = asset.position || {};

  return {
    position: "absolute",

    left:
      position.left !== undefined
        ? position.left
        : position.right !== undefined
          ? undefined
          : 0,

    right: position.right !== undefined ? position.right : undefined,

    top:
      position.top !== undefined
        ? position.top
        : position.bottom !== undefined
          ? undefined
          : 0,

    bottom: position.bottom !== undefined ? position.bottom : undefined,

    width: asset.width !== undefined ? asset.width : width * 0.35,

    height: asset.height !== undefined ? asset.height : height * 0.7,

    zIndex: asset.zIndex !== undefined ? asset.zIndex : 1,
  };
};

/* =========================================================
   BANNER ASSET
========================================================= */

const BannerAsset = ({ asset, width, height, reanimated = true }) => {
  /*
   * IMPORTANT:
   * Only primitive values are extracted here.
   * We NEVER capture the complete asset object
   * inside a Reanimated worklet.
   */

  const animation =
    typeof asset.animation === "string" ? asset.animation : "none";

  const duration =
    typeof asset.animationDuration === "number"
      ? asset.animationDuration
      : 1800;

  const delay =
    typeof asset.animationDelay === "number" ? asset.animationDelay : 0;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!reanimated || animation === "none") {
      progress.value = 1;
      return;
    }

    progress.value = 0;

    const animate = () => {
      switch (animation) {
        case "bounce":
          progress.value = withDelay(
            delay,
            withRepeat(
              withSequence(withSpring(1.08), withSpring(1)),
              -1,
              false,
            ),
          );
          break;

        default:
          progress.value = withDelay(
            delay,
            withRepeat(
              withTiming(1, {
                duration,
                easing: Easing.inOut(Easing.ease),
              }),
              -1,
              true,
            ),
          );
      }
    };

    animate();
  }, [animation, duration, delay, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || animation === "none") {
      return {};
    }

    switch (animation) {
      case "float":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [0, -14]),
            },
          ],
        };

      case "pulse":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.85, 1, 0.85]),
          transform: [
            {
              scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.04, 1]),
            },
          ],
        };

      case "rotate":
        return {
          transform: [
            {
              rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg`,
            },
          ],
        };

      case "zoom":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.08]),
            },
          ],
        };

      case "bounce":
        return {
          transform: [
            {
              scale: progress.value,
            },
          ],
        };

      case "slideUp":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [35, 0]),
            },
          ],
          opacity: progress.value,
        };

      case "slideLeft":
        return {
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [45, 0]),
            },
          ],
          opacity: progress.value,
        };

      case "slideRight":
        return {
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-45, 0]),
            },
          ],
          opacity: progress.value,
        };

      case "fade":
        return {
          opacity: progress.value,
        };

      default:
        return {};
    }
  });

  const positionStyle = getPositionStyle(asset, width, height);

  const resizeMode = asset.resizeMode || "contain";

  return (
    <Animated.View
      pointerEvents="none"
      style={[positionStyle, animatedStyle, asset.style]}
    >
      {asset.image ? (
        <Image
          source={asset.image}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFillObject}
        />
      ) : asset.icon ? (
        asset.icon
      ) : null}
    </Animated.View>
  );
};

/* =========================================================
   TEXT ANIMATION
========================================================= */

const useTextAnimation = ({
  animation = "none",
  duration = 600,
  delay = 0,
  reanimated = true,
}) => {
  const progress = useSharedValue(animation === "none" ? 1 : 0);

  useEffect(() => {
    if (!reanimated || animation === "none") {
      progress.value = 1;
      return;
    }

    progress.value = 0;

    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [animation, duration, delay, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || animation === "none") {
      return {};
    }

    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    switch (animation) {
      case "fade":
        return { opacity };

      case "fadeUp":
      case "slideUp":
        return {
          opacity,
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [28, 0]),
            },
          ],
        };

      case "fadeDown":
      case "slideDown":
        return {
          opacity,
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [-28, 0]),
            },
          ],
        };

      case "slideLeft":
        return {
          opacity,
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [45, 0]),
            },
          ],
        };

      case "slideRight":
        return {
          opacity,
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-45, 0]),
            },
          ],
        };

      case "scale":
      case "scaleUp":
      case "zoomIn":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.75, 1]),
            },
          ],
        };

      case "scaleDown":
      case "zoomOut":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1.25, 1]),
            },
          ],
        };

      case "bounce":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(progress.value, [0, 0.7, 1], [0.7, 1.08, 1]),
            },
          ],
        };

      case "elastic":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(
                progress.value,
                [0, 0.5, 0.75, 1],
                [0.7, 1.12, 0.96, 1],
              ),
            },
          ],
        };

      case "rotate":
        return {
          opacity,
          transform: [
            {
              rotate: `${interpolate(progress.value, [0, 1], [-12, 0])}deg`,
            },
          ],
        };

      case "flip":
        return {
          opacity,
          transform: [
            {
              rotateX: `${interpolate(progress.value, [0, 1], [90, 0])}deg`,
            },
          ],
        };

      default:
        return {
          opacity,
        };
    }
  });

  return animatedStyle;
};

/* =========================================================
   ANIMATED TEXT
========================================================= */

const AnimatedText = ({
  children,
  animation,
  duration,
  delay,
  reanimated,
  style,
  numberOfLines,
}) => {
  const animatedStyle = useTextAnimation({
    animation,
    duration,
    delay,
    reanimated,
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text
        style={style}
        numberOfLines={numberOfLines}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {children}
      </Text>
    </Animated.View>
  );
};

/* =========================================================
   BANNER CONTENT
========================================================= */

const BannerContent = ({ banner, width, height, reanimated }) => {
  /*
   * Primitive extraction prevents FiberNode serialization.
   */

  const badge = banner.badge;
  const eyebrow = banner.eyebrow;
  const title = banner.title;
  const subtitle = banner.subtitle;
  const buttonText = banner.buttonText;

  const badgeAnimation = banner.badgeAnimation || "none";

  const eyebrowAnimation = banner.eyebrowAnimation || "none";

  const titleAnimation =
    banner.titleAnimation || banner.contentAnimation || "none";

  const subtitleAnimation = banner.subtitleAnimation || "none";

  const buttonAnimation = banner.buttonAnimation || "none";

  const compact = height < 320;
  const veryCompact = height < 285;

  const titleSize =
    banner.titleFontSize || (veryCompact ? 26 : compact ? 30 : 38);

  const buttonHeight = compact ? 38 : 46;

  return (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: compact ? 18 : 24,
          paddingBottom: compact ? 16 : 22,
        },
        banner.contentStyle,
      ]}
    >
      {badge ? (
        <AnimatedText
          animation={badgeAnimation}
          duration={banner.badgeAnimationDuration || 600}
          delay={banner.badgeAnimationDelay || 0}
          reanimated={reanimated}
          style={[
            styles.badge,
            {
              fontSize: banner.badgeFontSize || 12,
            },
            banner.badgeStyle,
            banner.badgeTextStyle,
          ]}
        >
          {banner.badge}
        </AnimatedText>
      ) : null}

      {eyebrow ? (
        <AnimatedText
          animation={eyebrowAnimation}
          duration={banner.eyebrowAnimationDuration || 600}
          delay={banner.eyebrowAnimationDelay || 100}
          reanimated={reanimated}
          style={[
            styles.eyebrow,
            {
              fontSize: banner.eyebrowFontSize || 14,
            },
            banner.eyebrowStyle,
          ]}
        >
          {eyebrow}
        </AnimatedText>
      ) : null}

      {title ? (
        <AnimatedText
          animation={titleAnimation}
          duration={
            banner.titleAnimationDuration ||
            banner.contentAnimationDuration ||
            700
          }
          delay={banner.titleAnimationDelay || 150}
          reanimated={reanimated}
          numberOfLines={banner.titleNumberOfLines || 2}
          style={[
            styles.title,
            {
              fontSize: titleSize,
            },
            banner.titleStyle,
          ]}
        >
          {title}
        </AnimatedText>
      ) : null}

      {subtitle ? (
        <AnimatedText
          animation={subtitleAnimation}
          duration={banner.subtitleAnimationDuration || 650}
          delay={banner.subtitleAnimationDelay || 300}
          reanimated={reanimated}
          numberOfLines={3}
          style={[
            styles.subtitle,
            {
              fontSize: banner.subtitleFontSize || (compact ? 14 : 16),
            },
            banner.subtitleStyle,
          ]}
        >
          {subtitle}
        </AnimatedText>
      ) : null}

      {buttonText ? (
        <AnimatedText
          animation={buttonAnimation}
          duration={banner.buttonAnimationDuration || 750}
          delay={banner.buttonAnimationDelay || 450}
          reanimated={reanimated}
          style={styles.buttonAnimationWrapper}
        >
          <View
            style={[
              styles.button,
              {
                height: buttonHeight,
              },
              banner.buttonStyle,
            ]}
          >
            {banner.buttonIcon}
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: banner.buttonFontSize || 16,
                },
                banner.buttonTextStyle,
              ]}
            >
              {buttonText}
            </Text>
          </View>
        </AnimatedText>
      ) : null}
    </View>
  );
};

/* =========================================================
   CAROUSEL
========================================================= */

const UIBannerCarousel = ({
  banners = [],

  width = SCREEN_WIDTH,
  height = 350,

  autoplay = true,
  interval = 4000,
  loop = true,

  swipe = true,
  showPagination = true,
  showNavigation = false,

  gap = 0,

  reanimated = true,

  stickyHeader = false,

  renderHeader,
  header,

  children,

  style,
  contentContainerStyle,

  bannerStyle,
  paginationStyle,
  dotStyle,
  activeDotStyle,

  onIndexChange,
  onPress,

  coverStatusBar = true,

  statusBarStyle,

  initialIndex = 0,
}) => {
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(
    clamp(initialIndex, 0, Math.max(0, banners.length - 1)),
  );

  const [headerHeight, setHeaderHeight] = useState(0);

  const scrollRef = useRef(null);
  const verticalScrollRef = useRef(null);

  const safeTopInset = coverStatusBar ? insets.top : 0;

  const totalWidth = width + gap;

  const totalBannerHeight = height;

  const totalHeight = safeTopInset + headerHeight + totalBannerHeight;

  const currentBanner = banners[index] || {};

  /*
   * -------------------------------------------------------
   * STATUS BAR
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!coverStatusBar) {
      return;
    }

    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }

    StatusBar.setBarStyle(
      statusBarStyle || currentBanner.statusBarStyle || "light-content",
    );
  }, [coverStatusBar, statusBarStyle, currentBanner.statusBarStyle]);

  /*
   * -------------------------------------------------------
   * INDEX
   * -------------------------------------------------------
   */

  const updateIndex = useCallback(
    (nextIndex) => {
      if (!banners.length) {
        return;
      }

      const normalized = loop
        ? (nextIndex + banners.length) % banners.length
        : clamp(nextIndex, 0, banners.length - 1);

      setIndex(normalized);

      onIndexChange?.(normalized);
    },
    [banners.length, loop, onIndexChange],
  );

  /*
   * -------------------------------------------------------
   * AUTOPLAY
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!autoplay || banners.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      updateIndex(index + 1);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [autoplay, banners.length, interval, index, updateIndex]);

  /*
   * -------------------------------------------------------
   * HORIZONTAL SCROLL
   * -------------------------------------------------------
   */

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: index * totalWidth,
        animated: true,
      });
    });
  }, [index, totalWidth]);

  const handleMomentumEnd = useCallback(
    (event) => {
      const x = event.nativeEvent.contentOffset.x;

      const nextIndex = Math.round(x / totalWidth);

      if (nextIndex !== index) {
        updateIndex(nextIndex);
      }
    },
    [index, totalWidth, updateIndex],
  );

  /*
   * -------------------------------------------------------
   * SWIPE
   * -------------------------------------------------------
   */

  const handleScrollEndDrag = useCallback(
    (event) => {
      if (!swipe) {
        return;
      }

      const x = event.nativeEvent.contentOffset.x;

      const nextIndex = Math.round(x / totalWidth);

      updateIndex(nextIndex);
    },
    [swipe, totalWidth, updateIndex],
  );

  /*
   * -------------------------------------------------------
   * HEADER
   * -------------------------------------------------------
   */

  const renderedHeader = useMemo(() => {
    if (renderHeader) {
      return renderHeader({
        insets,
        width,
      });
    }

    return header || null;
  }, [renderHeader, header, insets, width]);

  /*
   * -------------------------------------------------------
   * BACKGROUND
   * -------------------------------------------------------
   */

  const background = currentBanner.background;

  const backgroundAnimation = currentBanner.backgroundAnimation || "none";

  /*
   * -------------------------------------------------------
   * BANNER PRESS
   * -------------------------------------------------------
   */

  const handleBannerPress = useCallback(
    (banner, bannerIndex) => {
      if (banner.onPress) {
        banner.onPress(banner, bannerIndex);
        return;
      }

      onPress?.(banner, bannerIndex);
    },
    [onPress],
  );

  /*
   * -------------------------------------------------------
   * NAVIGATION
   * -------------------------------------------------------
   */

  const goPrevious = () => {
    updateIndex(index - 1);
  };

  const goNext = () => {
    updateIndex(index + 1);
  };

  /*
   * -------------------------------------------------------
   * BANNER RENDER
   * -------------------------------------------------------
   */

  const renderBanner = (banner, bannerIndex) => {
    const assets = Array.isArray(banner.assets) ? banner.assets : [];

    return (
      <Pressable
        key={banner.id ?? `banner-${bannerIndex}`}
        onPress={() => handleBannerPress(banner, bannerIndex)}
        style={[
          {
            width,
            height,
            marginRight: bannerIndex < banners.length - 1 ? gap : 0,
          },
          bannerStyle,
        ]}
      >
        <View
          style={[
            styles.banner,
            {
              width,
              height,
            },
          ]}
        >
          <BannerBackground
            background={banner.background}
            backgroundAnimation={banner.backgroundAnimation || "none"}
            backgroundAnimationDuration={
              banner.backgroundAnimationDuration || 7000
            }
            reanimated={reanimated}
            width={width}
            height={height}
          />

          <BackgroundEffects
            type={banner.backgroundEffects || "none"}
            reanimated={reanimated}
          />

          {assets.map((asset, assetIndex) => (
            <BannerAsset
              key={asset.id ?? `asset-${bannerIndex}-${assetIndex}`}
              asset={asset}
              width={width}
              height={height}
              reanimated={reanimated}
            />
          ))}

          {banner.renderContent ? (
            banner.renderContent({
              banner,
              index: bannerIndex,
              width,
              height,
            })
          ) : (
            <BannerContent
              banner={banner}
              width={width}
              height={height}
              reanimated={reanimated}
            />
          )}
        </View>
      </Pressable>
    );
  };

  /*
   * -------------------------------------------------------
   * STICKY HEADER ARCHITECTURE
   * -------------------------------------------------------
   *
   * When stickyHeader=true:
   *
   * Safe area
   *    ↓
   * Header
   *    ↓
   * Banner
   *    ↓
   * children
   *
   * The vertical ScrollView belongs to this component.
   *
   * stickyHeaderIndices={0}
   * makes the header remain at the top.
   */

  const headerNode = renderedHeader ? (
    <View
      key="carousel-header"
      onLayout={(event) => {
        const measuredHeight = event.nativeEvent.layout.height;

        if (measuredHeight !== headerHeight) {
          setHeaderHeight(measuredHeight);
        }
      }}
      style={[styles.headerWrapper, stickyHeader && styles.stickyHeaderWrapper]}
    >
      {renderedHeader}
    </View>
  ) : null;

  const bannerNode = (
    <View
      key="carousel-banner"
      style={{
        height,
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={gap === 0}
        scrollEnabled={swipe}
        showsHorizontalScrollIndicator={false}
        bounces={swipe}
        decelerationRate="fast"
        snapToInterval={gap > 0 ? totalWidth : undefined}
        snapToAlignment="start"
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={{
          paddingRight: gap > 0 ? gap : 0,
        }}
      >
        {banners.map(renderBanner)}
      </ScrollView>

      {showNavigation && banners.length > 1 ? (
        <>
          <Pressable
            onPress={goPrevious}
            style={[styles.navigationButton, styles.previousButton]}
          >
            <Text style={styles.navigationText}>‹</Text>
          </Pressable>

          <Pressable
            onPress={goNext}
            style={[styles.navigationButton, styles.nextButton]}
          >
            <Text style={styles.navigationText}>›</Text>
          </Pressable>
        </>
      ) : null}

      {showPagination && banners.length > 1 ? (
        <View style={[styles.pagination, paginationStyle]}>
          {banners.map((_, dotIndex) => (
            <Pressable key={dotIndex} onPress={() => updateIndex(dotIndex)}>
              <View
                style={[
                  styles.dot,
                  dotStyle,
                  dotIndex === index && styles.activeDot,
                  dotIndex === index && activeDotStyle,
                ]}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );

  /*
   * -------------------------------------------------------
   * NON-STICKY MODE
   * -------------------------------------------------------
   */

  if (!stickyHeader) {
    return (
      <View
        style={[
          styles.root,
          {
            minHeight: totalBannerHeight + safeTopInset,
          },
          style,
        ]}
      >
        <BannerBackground
          background={background}
          backgroundAnimation={backgroundAnimation}
          backgroundAnimationDuration={
            currentBanner.backgroundAnimationDuration || 7000
          }
          reanimated={reanimated}
          width={width}
          height={totalHeight}
        />

        <View
          style={{
            paddingTop: safeTopInset,
          }}
        >
          {headerNode}

          {bannerNode}

          {children ? (
            <View style={contentContainerStyle}>{children}</View>
          ) : null}
        </View>
      </View>
    );
  }

  /*
   * -------------------------------------------------------
   * STICKY MODE
   * -------------------------------------------------------
   */

  return (
    <View
      style={[
        styles.root,
        {
          flex: 1,
        },
        style,
      ]}
    >
      <BannerBackground
        background={background}
        backgroundAnimation={backgroundAnimation}
        backgroundAnimationDuration={
          currentBanner.backgroundAnimationDuration || 7000
        }
        reanimated={reanimated}
        width={width}
        height={SCREEN_WIDTH * 3}
      />

      <Animated.ScrollView
        ref={verticalScrollRef}
        style={styles.verticalScroll}
        contentContainerStyle={[
          styles.verticalContent,
          {
            paddingTop: safeTopInset,
          },
          contentContainerStyle,
        ]}
        stickyHeaderIndices={renderedHeader ? [0] : undefined}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
      >
        {headerNode}

        {bannerNode}

        {children ? (
          <View style={styles.childrenContainer}>{children}</View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
  },

  verticalScroll: {
    flex: 1,
  },

  verticalContent: {
    width: "100%",
  },

  headerWrapper: {
    width: "100%",
    zIndex: 100,
    elevation: 100,
  },

  stickyHeaderWrapper: {
    backgroundColor: "transparent",
  },

  banner: {
    position: "relative",
    overflow: "hidden",
  },

  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 20,

    alignItems: "flex-start",
  },

  badge: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 6,
  },

  eyebrow: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 5,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    lineHeight: 44,
    maxWidth: "72%",
    marginBottom: 6,
  },

  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    lineHeight: 22,
    maxWidth: "72%",
    marginBottom: 14,
  },

  buttonAnimationWrapper: {
    alignSelf: "flex-start",
  },

  button: {
    minWidth: 120,
    paddingHorizontal: 18,

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    backgroundColor: "#FFFFFF",
  },

  buttonText: {
    color: "#111111",
    fontWeight: "700",
  },

  effectsLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  ring: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
  },

  ringOne: {
    width: 420,
    height: 420,
    right: -160,
    top: -130,
  },

  ringTwo: {
    width: 330,
    height: 330,
    right: -110,
    top: -80,
  },

  ringThree: {
    width: 240,
    height: 240,
    right: -60,
    top: -35,
  },

  raysContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  ray: {
    position: "absolute",
    width: 2,
    height: "150%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  glowCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  shimmer: {
    position: "absolute",
    width: 100,
    height: "160%",
    transform: [
      {
        rotate: "20deg",
      },
    ],
  },

  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },

  navigationButton: {
    position: "absolute",

    top: "50%",

    width: 40,
    height: 40,

    marginTop: -20,

    borderRadius: 20,

    backgroundColor: "rgba(0,0,0,0.3)",

    alignItems: "center",
    justifyContent: "center",

    zIndex: 50,
  },

  previousButton: {
    left: 12,
  },

  nextButton: {
    right: 12,
  },

  navigationText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "300",
  },

  pagination: {
    position: "absolute",

    bottom: 12,
    left: 0,
    right: 0,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 6,

    zIndex: 60,
  },

  dot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "rgba(255,255,255,0.5)",
  },

  activeDot: {
    width: 20,

    backgroundColor: "#FFFFFF",
  },

  childrenContainer: {
    width: "100%",
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
  TEXT_ANIMATIONS as UIBannerCarouselTextAnimations,
};
