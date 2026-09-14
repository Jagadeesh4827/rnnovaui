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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

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

import { useUITheme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/*
|--------------------------------------------------------------------------
| ANIMATION CONSTANTS
|--------------------------------------------------------------------------
*/

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
  "slideDown",
  "slideLeft",
  "slideRight",
  "fade",
];

const CONTENT_ANIMATIONS = [
  "none",
  "fade",
  "slideUp",
  "slideDown",
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

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const resolveNumber = (value, fallback) => (isNumber(value) ? value : fallback);

const normalizeBackground = (banner) => {
  if (banner?.background) {
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

  if (banner?.backgroundColor) {
    return {
      type: "color",
      color: banner.backgroundColor,
    };
  }

  if (banner?.backgroundImage) {
    return {
      type: "image",
      source: banner.backgroundImage,
    };
  }

  if (banner?.gradientColors) {
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
      locations: banner.gradientLocations,
    };
  }

  return {
    type: "color",
    color: "#1976D2",
  };
};

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

const getAssetSource = (asset) =>
  asset?.source || asset?.image || asset?.uri || null;

/*
|--------------------------------------------------------------------------
| BACKGROUND ANIMATION
|--------------------------------------------------------------------------
*/

const useBackgroundAnimation = ({ animation, enabled, duration, width }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!enabled || animation === "none") {
      return undefined;
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
  }, [animation, duration, enabled, progress]);

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
              scale: interpolate(progress.value, [0, 1], [1, 1.08]),
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

      case "glow":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.8, 1, 0.8]),
        };

      case "shimmer":
        return {
          opacity: interpolate(progress.value, [0, 0.5, 1], [0.75, 1, 0.75]),
        };

      default:
        return {};
    }
  });

  const raysStyle = useAnimatedStyle(() => {
    if (!enabled || animation !== "rays") {
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
    if (!enabled || animation !== "glow") {
      return {};
    }

    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.6, 0.2]),

      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [0.9, 1.15, 0.9]),
        },
      ],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    if (!enabled || animation !== "shimmer") {
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

  return {
    animatedStyle,
    raysStyle,
    glowStyle,
    shimmerStyle,
  };
};

/*
|--------------------------------------------------------------------------
| BANNER BACKGROUND
|--------------------------------------------------------------------------
*/

const BannerBackground = ({ banner, width, height, reanimated }) => {
  const background = normalizeBackground(banner);

  const backgroundAnimation = banner?.backgroundAnimation || "none";

  const animationDuration = resolveNumber(
    banner?.backgroundAnimationDuration,
    5000,
  );

  const { animatedStyle, raysStyle, glowStyle, shimmerStyle } =
    useBackgroundAnimation({
      animation: backgroundAnimation,
      enabled: reanimated,
      duration: animationDuration,
      width,
    });

  let backgroundElement = null;

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  if (background.type === "image") {
    backgroundElement = (
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
  } else if (background.type === "gradient") {
    /*
  |--------------------------------------------------------------------------
  | GRADIENT
  |--------------------------------------------------------------------------
  */
    backgroundElement = (
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
  } else {
    /*
  |--------------------------------------------------------------------------
  | COLOR
  |--------------------------------------------------------------------------
  */
    backgroundElement = (
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
  }

  const showRings = banner?.rings !== false;

  const showRays = banner?.rays === true;

  const showGlow = banner?.glow !== false;

  const showDecorations = banner?.decorations !== false;

  const ringOpacity = banner?.ringsOpacity ?? 0.14;

  const rayCount = Math.max(1, Math.floor(banner?.rayCount || 12));

  const decorationCount = Math.max(0, Math.floor(banner?.decorationCount || 8));

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.backgroundContainer]}
    >
      {backgroundElement}
      /*
      ------------------------------------------------------------------------
      Rings
      ------------------------------------------------------------------------
      */
      {showRings ? (
        <>
          <View
            style={[
              styles.ring,
              {
                width: width * 1.5,
                height: width * 1.5,
                borderRadius: width * 0.75,
                left: width * -0.25,
                top: height * 0.15,
                opacity: ringOpacity,
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
                top: height * 0.28,
                opacity: ringOpacity * 0.75,
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
                top: height * 0.4,
                opacity: ringOpacity * 0.5,
              },
            ]}
          />
        </>
      ) : null}
      /*
      ------------------------------------------------------------------------
      Rays
      ------------------------------------------------------------------------
      */
      {showRays ? (
        <Animated.View
          style={[
            styles.rays,
            {
              width: width * 1.6,
              height: width * 1.6,
              left: width * -0.3,
              top: height * 0.05,
            },
            raysStyle,
          ]}
        >
          {Array.from({
            length: rayCount,
          }).map((_, index) => (
            <View
              key={`ray-${index}`}
              style={[
                styles.ray,
                {
                  transform: [
                    {
                      rotate: `${index * (360 / rayCount)}deg`,
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      ) : null}
      /*
      ------------------------------------------------------------------------
      Glow
      ------------------------------------------------------------------------
      */
      {showGlow ? (
        <Animated.View
          style={[
            styles.glow,
            {
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: width * 0.4,
              left: width * 0.1,
              top: height * 0.2,
            },
            glowStyle,
          ]}
        />
      ) : null}
      /*
      ------------------------------------------------------------------------
      Shimmer
      ------------------------------------------------------------------------
      */
      {banner?.shimmer ? (
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      ) : null}
      /*
      ------------------------------------------------------------------------
      Decorations
      ------------------------------------------------------------------------
      */
      {showDecorations
        ? Array.from({
            length: decorationCount,
          }).map((_, index) => (
            <View
              key={`decoration-${index}`}
              style={[
                styles.decoration,
                {
                  left: (index * 47) % Math.max(width - 20, 1),

                  top: 20 + ((index * 61) % Math.max(height - 40, 1)),

                  width: 4 + (index % 3) * 3,

                  height: 4 + (index % 3) * 3,

                  opacity: banner?.decorationOpacity ?? 0.3,
                },
              ]}
            />
          ))
        : null}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| ASSET ANIMATION
|--------------------------------------------------------------------------
*/

const useAssetAnimation = ({ animation, duration, enabled }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!enabled || animation === "none") {
      return undefined;
    }

    if (animation === "bounce") {
      progress.value = withRepeat(
        withSequence(
          withSpring(1, {
            damping: 8,
            stiffness: 120,
          }),
          withSpring(0, {
            damping: 8,
            stiffness: 120,
          }),
        ),
        -1,
        false,
      );

      return () => {
        progress.value = 0;
      };
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
  }, [animation, duration, enabled, progress]);

  return useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
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

      case "slideDown":
        return {
          opacity: interpolate(progress.value, [0, 0.25, 1], [0, 1, 1]),
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [-30, 0]),
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
};

/*
|--------------------------------------------------------------------------
| BANNER ASSET
|--------------------------------------------------------------------------
*/

const BannerAsset = ({ asset, bannerHeight, reanimated }) => {
  const animation = asset?.animation || "none";

  const duration = resolveNumber(asset?.animationDuration, 3000);

  const animatedStyle = useAssetAnimation({
    animation,
    duration,
    enabled: reanimated && animation !== "none",
  });

  const responsive = asset?.responsive !== false;

  const responsiveScale = responsive
    ? Math.min(1, Math.max(0.72, bannerHeight / 350))
    : 1;

  const assetWidth = resolveNumber(asset?.width, 100) * responsiveScale;

  const assetHeight = resolveNumber(asset?.height, 100) * responsiveScale;

  const source = getAssetSource(asset);

  const rotation = resolveNumber(asset?.rotate, 0);

  const renderAsset = asset?.render;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.asset,
        {
          width: assetWidth,

          height: assetHeight,

          opacity: asset?.opacity ?? 1,

          zIndex: asset?.zIndex ?? 1,

          transform: [
            {
              rotate: `${rotation}deg`,
            },
          ],
        },

        getPositionStyle(asset?.position),

        animatedStyle,

        asset?.style,
      ]}
    >
      {renderAsset ? (
        renderAsset(asset)
      ) : source ? (
        <Image
          source={source}
          resizeMode={asset?.resizeMode || "contain"}
          style={[styles.assetImage, asset?.imageStyle]}
        />
      ) : asset?.iconElement ? (
        asset.iconElement
      ) : asset?.icon ? (
        asset.icon
      ) : asset?.text ? (
        <Text style={[styles.assetText, asset.textStyle]}>{asset.text}</Text>
      ) : null}
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| TEXT ANIMATION
|--------------------------------------------------------------------------
*/

const useTextAnimation = ({ animation, duration, delay, enabled }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!enabled || animation === "none") {
      return undefined;
    }

    const runAnimation = () => {
      switch (animation) {
        case "bounce":
          progress.value = withSequence(
            withTiming(0.65, {
              duration: Math.round(duration * 0.55),
              easing: Easing.out(Easing.cubic),
            }),
            withSpring(1, {
              damping: 8,
              stiffness: 120,
            }),
          );
          break;

        case "elastic":
          progress.value = withSpring(1, {
            damping: 6,
            stiffness: 90,
            mass: 0.7,
          });
          break;

        default:
          progress.value = withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
          });
      }
    };

    if (delay > 0) {
      const timer = setTimeout(runAnimation, delay);

      return () => {
        clearTimeout(timer);
        progress.value = 0;
      };
    }

    runAnimation();

    return () => {
      progress.value = 0;
    };
  }, [animation, duration, delay, enabled, progress]);

  return useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
      return {};
    }

    const value = progress.value;

    switch (animation) {
      case "fade":
        return {
          opacity: value,
        };

      case "fadeUp":
      case "slideUp":
        return {
          opacity: value,
          transform: [
            {
              translateY: interpolate(value, [0, 1], [30, 0]),
            },
          ],
        };

      case "fadeDown":
      case "slideDown":
        return {
          opacity: value,
          transform: [
            {
              translateY: interpolate(value, [0, 1], [-30, 0]),
            },
          ],
        };

      case "slideLeft":
        return {
          opacity: value,
          transform: [
            {
              translateX: interpolate(value, [0, 1], [45, 0]),
            },
          ],
        };

      case "slideRight":
        return {
          opacity: value,
          transform: [
            {
              translateX: interpolate(value, [0, 1], [-45, 0]),
            },
          ],
        };

      case "scale":
      case "scaleUp":
        return {
          opacity: value,
          transform: [
            {
              scale: interpolate(value, [0, 1], [0.75, 1]),
            },
          ],
        };

      case "scaleDown":
        return {
          opacity: value,
          transform: [
            {
              scale: interpolate(value, [0, 1], [1.25, 1]),
            },
          ],
        };

      case "zoomIn":
        return {
          opacity: value,
          transform: [
            {
              scale: interpolate(value, [0, 1], [0.4, 1]),
            },
          ],
        };

      case "zoomOut":
        return {
          opacity: value,
          transform: [
            {
              scale: interpolate(value, [0, 1], [1.5, 1]),
            },
          ],
        };

      case "bounce":
        return {
          opacity: interpolate(value, [0, 0.65, 1], [0, 1, 1]),
          transform: [
            {
              translateY: interpolate(value, [0, 0.65, 1], [35, -5, 0]),
            },
            {
              scale: interpolate(value, [0, 0.65, 1], [0.7, 1.04, 1]),
            },
          ],
        };

      case "elastic":
        return {
          opacity: value,
          transform: [
            {
              scale: interpolate(value, [0, 1], [0.65, 1]),
            },
          ],
        };

      case "rotate":
        return {
          opacity: value,
          transform: [
            {
              rotate: `${interpolate(value, [0, 1], [-8, 0])}deg`,
            },
          ],
        };

      case "flip":
        return {
          opacity: value,
          transform: [
            {
              rotateX: `${interpolate(value, [0, 1], [90, 0])}deg`,
            },
          ],
        };

      default:
        return {};
    }
  });
};

/*
|--------------------------------------------------------------------------
| ANIMATED TEXT
|--------------------------------------------------------------------------
*/

const AnimatedText = ({
  children,
  animation = "none",
  duration = 650,
  delay = 0,
  reanimated = false,
  style,
  wrapperStyle,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
}) => {
  const animatedStyle = useTextAnimation({
    animation,
    duration,
    delay,
    enabled: reanimated && animation !== "none",
  });

  return (
    <Animated.View style={[styles.textWrapper, wrapperStyle, animatedStyle]}>
      <Text
        numberOfLines={numberOfLines}
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        minimumFontScale={minimumFontScale}
        style={style}
      >
        {children}
      </Text>
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| CONTENT ANIMATION
|--------------------------------------------------------------------------
*/

const useContentAnimation = ({ animation, duration, enabled }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (!enabled || animation === "none") {
      return undefined;
    }

    if (animation === "bounce") {
      progress.value = withSequence(
        withTiming(0.7, {
          duration: Math.round(duration * 0.5),
        }),
        withSpring(1, {
          damping: 8,
          stiffness: 120,
        }),
      );
    } else {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }

    return () => {
      progress.value = 0;
    };
  }, [animation, duration, enabled, progress]);

  return useAnimatedStyle(() => {
    if (!enabled || animation === "none") {
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

      case "slideDown":
        return {
          opacity: progress.value,

          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [-35, 0]),
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
              translateY: interpolate(progress.value, [0, 0.7, 1], [30, -5, 0]),
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
};

/*
|--------------------------------------------------------------------------
| BANNER CONTENT
|--------------------------------------------------------------------------
*/

const BannerContent = ({ banner, bannerHeight, reanimated, onPress }) => {
  const contentAnimation = banner?.contentAnimation || "none";

  const contentDuration = resolveNumber(banner?.contentAnimationDuration, 650);

  const contentAnimatedStyle = useContentAnimation({
    animation: contentAnimation,
    duration: contentDuration,
    enabled: reanimated && contentAnimation !== "none",
  });

  /*
  |--------------------------------------------------------------------------
  | CUSTOM CONTENT
  |--------------------------------------------------------------------------
  */

  if (banner?.renderContent) {
    return (
      <Animated.View
        style={[
          styles.content,

          getContentLayoutStyle(bannerHeight, banner),

          banner.contentStyle,

          contentAnimatedStyle,
        ]}
      >
        {banner.renderContent()}
      </Animated.View>
    );
  }

  const compact = bannerHeight < 320;

  const veryCompact = bannerHeight < 285;

  /*
  |--------------------------------------------------------------------------
  | FONT SIZES
  |--------------------------------------------------------------------------
  */

  const badgeFontSize = banner?.badgeFontSize ?? (veryCompact ? 11 : 13);

  const eyebrowFontSize = banner?.eyebrowFontSize ?? (veryCompact ? 12 : 15);

  const titleFontSize =
    banner?.titleFontSize ?? (veryCompact ? 26 : compact ? 30 : 38);

  const subtitleFontSize =
    banner?.subtitleFontSize ?? (veryCompact ? 13 : compact ? 14 : 16);

  const buttonFontSize =
    banner?.buttonFontSize ?? (veryCompact ? 13 : compact ? 15 : 16);

  /*
  |--------------------------------------------------------------------------
  | INDIVIDUAL ANIMATIONS
  |--------------------------------------------------------------------------
  */

  const badgeAnimation = banner?.badgeAnimation ?? contentAnimation;

  const eyebrowAnimation = banner?.eyebrowAnimation ?? contentAnimation;

  const titleAnimation = banner?.titleAnimation ?? contentAnimation;

  const subtitleAnimation = banner?.subtitleAnimation ?? contentAnimation;

  const buttonAnimation = banner?.buttonAnimation ?? contentAnimation;

  /*
  |--------------------------------------------------------------------------
  | DURATIONS
  |--------------------------------------------------------------------------
  */

  const badgeDuration = banner?.badgeAnimationDuration ?? contentDuration;

  const eyebrowDuration = banner?.eyebrowAnimationDuration ?? contentDuration;

  const titleDuration = banner?.titleAnimationDuration ?? contentDuration;

  const subtitleDuration = banner?.subtitleAnimationDuration ?? contentDuration;

  const buttonDuration = banner?.buttonAnimationDuration ?? contentDuration;

  /*
  |--------------------------------------------------------------------------
  | DELAYS
  |--------------------------------------------------------------------------
  */

  const badgeDelay = banner?.badgeAnimationDelay ?? 0;

  const eyebrowDelay = banner?.eyebrowAnimationDelay ?? 0;

  const titleDelay = banner?.titleAnimationDelay ?? 0;

  const subtitleDelay = banner?.subtitleAnimationDelay ?? 0;

  const buttonDelay = banner?.buttonAnimationDelay ?? 0;

  /*
  |--------------------------------------------------------------------------
  | BUTTON
  |--------------------------------------------------------------------------
  */

  const buttonHeight = veryCompact ? 38 : compact ? 42 : 46;

  return (
    <Animated.View
      style={[
        styles.content,

        getContentLayoutStyle(bannerHeight, banner),

        banner?.contentStyle,

        contentAnimatedStyle,
      ]}
    >
      {/*
      ------------------------------------------------------------------------
      Badge
      ------------------------------------------------------------------------
      */}

      {banner?.badge ? (
        <AnimatedText
          animation={badgeAnimation}
          duration={badgeDuration}
          delay={badgeDelay}
          reanimated={reanimated}
          wrapperStyle={[styles.badgeWrapper, banner.badgeWrapperStyle]}
          style={[
            styles.badgeTextContainer,

            {
              paddingTop: banner?.badgePaddingTop ?? 7,

              paddingBottom: banner?.badgePaddingBottom ?? 7,

              paddingLeft: banner?.badgePaddingLeft ?? 13,

              paddingRight: banner?.badgePaddingRight ?? 13,

              backgroundColor: banner?.badgeBackgroundColor ?? "#FFD32A",

              borderRadius: banner?.badgeBorderRadius ?? 20,
            },

            banner.badgeStyle,
          ]}
        >
          <View style={styles.badgeInner}>
            {banner.badgeIcon ? (
              <View
                style={[
                  styles.badgeIcon,

                  {
                    width: banner?.badgeIconSize ?? 18,

                    height: banner?.badgeIconSize ?? 18,
                  },

                  banner.badgeIconStyle,
                ]}
              >
                {banner.badgeIcon}
              </View>
            ) : null}

            <Text
              style={[
                styles.badgeText,

                {
                  fontSize: badgeFontSize,

                  color: banner?.badgeTextColor ?? "#111",
                },

                banner.badgeTextStyle,
              ]}
            >
              {banner.badge}
            </Text>
          </View>
        </AnimatedText>
      ) : null}

      {/*
      ------------------------------------------------------------------------
      Eyebrow
      ------------------------------------------------------------------------
      */}

      {banner?.eyebrow ? (
        <AnimatedText
          animation={eyebrowAnimation}
          duration={eyebrowDuration}
          delay={eyebrowDelay}
          reanimated={reanimated}
          numberOfLines={banner?.eyebrowNumberOfLines ?? 2}
          wrapperStyle={[banner.eyebrowWrapperStyle]}
          style={[
            styles.eyebrow,

            {
              fontSize: eyebrowFontSize,

              paddingTop: banner?.eyebrowPaddingTop ?? 0,

              paddingBottom: banner?.eyebrowPaddingBottom ?? 0,

              paddingLeft: banner?.eyebrowPaddingLeft ?? 0,

              paddingRight: banner?.eyebrowPaddingRight ?? 0,

              color: banner?.eyebrowColor ?? "#FFF",
            },

            banner.eyebrowStyle,
          ]}
        >
          {banner.eyebrow}
        </AnimatedText>
      ) : null}

      {/*
      ------------------------------------------------------------------------
      Title
      ------------------------------------------------------------------------
      */}

      {banner?.title ? (
        <AnimatedText
          animation={titleAnimation}
          duration={titleDuration}
          delay={titleDelay}
          reanimated={reanimated}
          numberOfLines={banner?.titleNumberOfLines ?? (veryCompact ? 2 : 3)}
          adjustsFontSizeToFit={
            banner?.titleAdjustsFontSizeToFit ?? veryCompact
          }
          minimumFontScale={banner?.titleMinimumFontScale ?? 0.75}
          wrapperStyle={[banner.titleWrapperStyle]}
          style={[
            styles.title,

            {
              fontSize: titleFontSize,

              lineHeight: banner?.titleLineHeight ?? titleFontSize + 4,

              paddingTop: banner?.titlePaddingTop ?? 0,

              paddingBottom: banner?.titlePaddingBottom ?? 0,

              paddingLeft: banner?.titlePaddingLeft ?? 0,

              paddingRight: banner?.titlePaddingRight ?? 0,

              color: banner?.titleColor ?? "#FFF",
            },

            banner.titleStyle,
          ]}
        >
          {banner.title}
        </AnimatedText>
      ) : null}

      {/*
      ------------------------------------------------------------------------
      Subtitle
      ------------------------------------------------------------------------
      */}

      {banner?.subtitle ? (
        <AnimatedText
          animation={subtitleAnimation}
          duration={subtitleDuration}
          delay={subtitleDelay}
          reanimated={reanimated}
          numberOfLines={banner?.subtitleNumberOfLines ?? 2}
          wrapperStyle={[banner.subtitleWrapperStyle]}
          style={[
            styles.subtitle,

            {
              fontSize: subtitleFontSize,

              lineHeight: banner?.subtitleLineHeight ?? subtitleFontSize + 5,

              marginTop: banner?.subtitleMarginTop ?? (veryCompact ? 3 : 7),

              paddingTop: banner?.subtitlePaddingTop ?? 0,

              paddingBottom: banner?.subtitlePaddingBottom ?? 0,

              paddingLeft: banner?.subtitlePaddingLeft ?? 0,

              paddingRight: banner?.subtitlePaddingRight ?? 0,

              color: banner?.subtitleColor ?? "#FFF",
            },

            banner.subtitleStyle,
          ]}
        >
          {banner.subtitle}
        </AnimatedText>
      ) : null}

      {/*
      ------------------------------------------------------------------------
      Button
      ------------------------------------------------------------------------
      */}

      {banner?.buttonText ? (
        <AnimatedButton
          animation={buttonAnimation}
          duration={buttonDuration}
          delay={buttonDelay}
          reanimated={reanimated}
          onPress={onPress}
          height={buttonHeight}
          buttonStyle={banner.buttonStyle}
          buttonTextStyle={banner.buttonTextStyle}
          buttonText={banner.buttonText}
          buttonIcon={banner.buttonIcon}
          buttonIconSize={banner.buttonIconSize}
          buttonIconStyle={banner.buttonIconStyle}
          buttonFontSize={buttonFontSize}
          buttonTextColor={banner.buttonTextColor}
          buttonBackgroundColor={banner.buttonBackgroundColor}
          buttonBorderColor={banner.buttonBorderColor}
          buttonBorderWidth={banner.buttonBorderWidth}
          buttonBorderRadius={banner.buttonBorderRadius}
          buttonPaddingTop={banner.buttonPaddingTop}
          buttonPaddingBottom={banner.buttonPaddingBottom}
          buttonPaddingLeft={banner.buttonPaddingLeft}
          buttonPaddingRight={banner.buttonPaddingRight}
        />
      ) : null}
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| BUTTON ANIMATION
|--------------------------------------------------------------------------
*/

const AnimatedButton = ({
  animation = "none",
  duration = 650,
  delay = 0,
  reanimated = false,
  onPress,
  height,
  buttonStyle,
  buttonTextStyle,
  buttonText,
  buttonIcon,
  buttonIconSize = 20,
  buttonIconStyle,
  buttonFontSize = 16,
  buttonTextColor = "#FFF",
  buttonBackgroundColor = "#111",
  buttonBorderColor = "#FFF",
  buttonBorderWidth = 1.5,
  buttonBorderRadius = 25,
  buttonPaddingTop,
  buttonPaddingBottom,
  buttonPaddingLeft,
  buttonPaddingRight,
}) => {
  const animatedStyle = useTextAnimation({
    animation,
    duration,
    delay,
    enabled: reanimated && animation !== "none",
  });

  return (
    <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.button,

          {
            minHeight: height,

            paddingTop: buttonPaddingTop ?? 0,

            paddingBottom: buttonPaddingBottom ?? 0,

            paddingLeft: buttonPaddingLeft ?? 21,

            paddingRight: buttonPaddingRight ?? 21,

            backgroundColor: buttonBackgroundColor,

            borderColor: buttonBorderColor,

            borderWidth: buttonBorderWidth,

            borderRadius: buttonBorderRadius,
          },

          buttonStyle,
        ]}
      >
        <Text
          style={[
            styles.buttonText,

            {
              fontSize: buttonFontSize,

              color: buttonTextColor,
            },

            buttonTextStyle,
          ]}
        >
          {buttonText}
        </Text>

        {buttonIcon ? (
          <View
            style={[
              styles.buttonIcon,

              {
                width: buttonIconSize,

                height: buttonIconSize,
              },

              buttonIconStyle,
            ]}
          >
            {buttonIcon}
          </View>
        ) : (
          <Text style={[styles.arrow]}>›</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

/*
|--------------------------------------------------------------------------
| CONTENT LAYOUT
|--------------------------------------------------------------------------
*/

const getContentLayoutStyle = (bannerHeight, banner) => {
  const compact = bannerHeight < 320;

  const veryCompact = bannerHeight < 285;

  const horizontal =
    banner?.contentHorizontalPadding ?? (veryCompact ? 18 : compact ? 22 : 28);

  const bottom =
    banner?.contentBottom ?? (veryCompact ? 28 : compact ? 32 : 48);

  const top = banner?.contentTop;

  const left = banner?.contentLeft ?? horizontal;

  const right = banner?.contentRight ?? horizontal;

  return {
    left,
    right,
    bottom,
    ...(top !== undefined ? { top } : {}),
  };
};

/*
|--------------------------------------------------------------------------
| MAIN CAROUSEL
|--------------------------------------------------------------------------
*/

const UIBannerCarousel = ({
  banners = [],

  width = SCREEN_WIDTH,

  height = 350,

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This component no longer adds a safe-area inset.
  |
  | UILayout owns the safe area.
  |
  */

  renderHeader,

  header,

  headerStyle,

  /*
  |--------------------------------------------------------------------------
  | Kept for backwards compatibility.
  |--------------------------------------------------------------------------
  |
  | It no longer changes Android translucent status-bar layout.
  |
  */

  coverStatusBar = false,

  statusBarStyle,

  /*
  |--------------------------------------------------------------------------
  | Carousel
  |--------------------------------------------------------------------------
  */

  autoplay = true,

  interval = 4500,

  loop = true,

  swipe = true,

  paging = true,

  showPagination = true,

  paginationPosition = "bottom",

  showNavigation = false,

  gap = 0,

  /*
  |--------------------------------------------------------------------------
  | Animation
  |--------------------------------------------------------------------------
  */

  reanimated = false,

  /*
  |--------------------------------------------------------------------------
  | Styles
  |--------------------------------------------------------------------------
  */

  style,

  slideStyle,

  contentContainerStyle,

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  navigationStyle,

  /*
  |--------------------------------------------------------------------------
  | Callbacks
  |--------------------------------------------------------------------------
  */

  onIndexChange,

  onPress,

  onScroll,

  /*
  |--------------------------------------------------------------------------
  | Extra
  |--------------------------------------------------------------------------
  */

  scrollEventThrottle = 16,

  testID,
}) => {
  const { theme } = useUITheme();

  const themeColors = theme?.colors || {};

  const resolvedWidth = resolveNumber(width, SCREEN_WIDTH);

  const resolvedHeight = Math.max(resolveNumber(height, 350), 1);

  const resolvedGap = Math.max(resolveNumber(gap, 0), 0);

  const bannerCount = banners.length;

  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef(null);

  const timerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Header measurement
  |--------------------------------------------------------------------------
  */

  const [headerHeight, setHeaderHeight] = useState(0);

  const hasHeader = Boolean(renderHeader || header);

  /*
  |--------------------------------------------------------------------------
  | Safe active index
  |--------------------------------------------------------------------------
  */

  const safeIndex =
    bannerCount > 0 ? Math.min(Math.max(activeIndex, 0), bannerCount - 1) : 0;

  /*
  |--------------------------------------------------------------------------
  | Status bar
  |--------------------------------------------------------------------------
  |
  | DO NOT make the status bar translucent here.
  |
  | UILayout is responsible for safe-area layout.
  |
  */

  useEffect(() => {
    const banner = banners[safeIndex];

    const resolvedStatusBarStyle = statusBarStyle || banner?.statusBarStyle;

    if (resolvedStatusBarStyle) {
      StatusBar.setBarStyle(resolvedStatusBarStyle, true);
    }

    /*
    ------------------------------------------------------------------------
    IMPORTANT
    ------------------------------------------------------------------------

    We intentionally do NOT call:

      StatusBar.setTranslucent(true)

    and do NOT call:

      StatusBar.setBackgroundColor("transparent")

    because that would allow the carousel to cover the status bar on Android.
    */
  }, [banners, safeIndex, statusBarStyle]);

  /*
  |--------------------------------------------------------------------------
  | Header layout
  |--------------------------------------------------------------------------
  */

  const handleHeaderLayout = useCallback((event) => {
    const measuredHeight = event.nativeEvent.layout.height;

    setHeaderHeight((previous) =>
      previous === measuredHeight ? previous : measuredHeight,
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Scroll to index
  |--------------------------------------------------------------------------
  */

  const scrollToIndex = useCallback(
    (requestedIndex, animated = true) => {
      if (bannerCount <= 0) {
        return;
      }

      let nextIndex = requestedIndex;

      if (loop) {
        if (nextIndex >= bannerCount) {
          nextIndex = 0;
        }

        if (nextIndex < 0) {
          nextIndex = bannerCount - 1;
        }
      } else {
        nextIndex = Math.max(0, Math.min(requestedIndex, bannerCount - 1));
      }

      const itemWidth = resolvedWidth + resolvedGap;

      scrollRef.current?.scrollTo({
        x: nextIndex * itemWidth,

        animated,
      });

      setActiveIndex(nextIndex);

      onIndexChange?.(nextIndex, banners[nextIndex]);
    },
    [bannerCount, banners, loop, onIndexChange, resolvedGap, resolvedWidth],
  );

  /*
  |--------------------------------------------------------------------------
  | Autoplay
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!autoplay || bannerCount <= 1) {
      return undefined;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      scrollToIndex(safeIndex + 1, true);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }
    };
  }, [autoplay, bannerCount, interval, safeIndex, scrollToIndex]);

  /*
  |--------------------------------------------------------------------------
  | Momentum
  |--------------------------------------------------------------------------
  */

  const handleMomentumEnd = useCallback(
    (event) => {
      if (bannerCount <= 0) {
        return;
      }

      const x = event.nativeEvent.contentOffset.x;

      const itemWidth = resolvedWidth + resolvedGap;

      const rawIndex = itemWidth > 0 ? Math.round(x / itemWidth) : 0;

      const nextIndex = Math.max(0, Math.min(rawIndex, bannerCount - 1));

      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);

        onIndexChange?.(nextIndex, banners[nextIndex]);
      }
    },
    [
      activeIndex,
      bannerCount,
      banners,
      onIndexChange,
      resolvedGap,
      resolvedWidth,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | Press
  |--------------------------------------------------------------------------
  */

  const handlePress = useCallback(
    (banner, index) => {
      onPress?.(banner, index);

      banner?.onPress?.(banner, index);
    },
    [onPress],
  );

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const renderPagination = () => {
    if (!showPagination || bannerCount <= 1) {
      return null;
    }

    return (
      <View
        style={[
          styles.pagination,

          paginationPosition === "top" && styles.paginationTop,

          paginationStyle,
        ]}
      >
        {banners.map((banner, index) => (
          <Pressable
            key={banner?.id || `dot-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Go to slide ${index + 1}`}
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

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (bannerCount === 0) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Root height
  |--------------------------------------------------------------------------
  |
  | Header is part of the carousel.
  | Banner begins below measured header.
  |
  */

  const totalHeight = hasHeader
    ? headerHeight + resolvedHeight
    : resolvedHeight;

  /*
  |--------------------------------------------------------------------------
  | Theme defaults
  |--------------------------------------------------------------------------
  */

  const defaultDotColor = themeColors.onPrimary || "#FFFFFF";

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View
      testID={testID}
      style={[
        styles.root,

        {
          width: resolvedWidth,

          height: totalHeight,
        },

        style,
      ]}
    >
      {/*
      =========================================================================
      HEADER
      =========================================================================
      */}

      {hasHeader ? (
        <View
          style={[styles.headerLayer, headerStyle]}
          onLayout={handleHeaderLayout}
        >
          {renderHeader
            ? renderHeader({
                width: resolvedWidth,

                height: headerHeight,
              })
            : header?.render
              ? header.render({
                  width: resolvedWidth,

                  height: headerHeight,
                })
              : header}
        </View>
      ) : null}

      {/*
      =========================================================================
      CAROUSEL
      =========================================================================
      */}

      <View
        style={[
          styles.carouselLayer,

          {
            top: hasHeader ? headerHeight : 0,

            height: resolvedHeight,
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={paging && resolvedGap === 0}
          snapToInterval={
            resolvedGap > 0 ? resolvedWidth + resolvedGap : undefined
          }
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={swipe}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={scrollEventThrottle}
          onScroll={onScroll}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {banners.map((banner, index) => (
            <Pressable
              key={banner?.id || `banner-${index}`}
              onPress={() => handlePress(banner, index)}
              style={[
                styles.slide,

                {
                  width: resolvedWidth,

                  height: resolvedHeight,

                  marginRight: index === bannerCount - 1 ? 0 : resolvedGap,
                },

                slideStyle,

                banner?.style,
              ]}
            >
              {/*
                ===============================================================
                BACKGROUND
                ===============================================================
                */}

              <BannerBackground
                banner={banner}
                width={resolvedWidth}
                height={resolvedHeight}
                reanimated={reanimated && index === safeIndex}
              />

              {/*
                ===============================================================
                IMAGES
                ===============================================================
                */}

              {Array.isArray(banner?.images)
                ? banner.images.map((asset, assetIndex) => (
                    <BannerAsset
                      key={asset?.id || `image-${assetIndex}`}
                      asset={asset}
                      bannerHeight={resolvedHeight}
                      reanimated={reanimated && index === safeIndex}
                    />
                  ))
                : null}

              {/*
                ===============================================================
                ICONS
                ===============================================================
                */}

              {Array.isArray(banner?.icons)
                ? banner.icons.map((asset, assetIndex) => (
                    <BannerAsset
                      key={asset?.id || `icon-${assetIndex}`}
                      asset={asset}
                      bannerHeight={resolvedHeight}
                      reanimated={reanimated && index === safeIndex}
                    />
                  ))
                : null}

              {/*
                ===============================================================
                OTHER ASSETS
                ===============================================================
                */}

              {Array.isArray(banner?.assets)
                ? banner.assets.map((asset, assetIndex) => (
                    <BannerAsset
                      key={asset?.id || `asset-${assetIndex}`}
                      asset={asset}
                      bannerHeight={resolvedHeight}
                      reanimated={reanimated && index === safeIndex}
                    />
                  ))
                : null}

              {/*
                ===============================================================
                CONTENT
                ===============================================================
                */}

              <BannerContent
                banner={banner}
                bannerHeight={resolvedHeight}
                reanimated={reanimated && index === safeIndex}
                onPress={() => handlePress(banner, index)}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/*
      =========================================================================
      PAGINATION
      =========================================================================
      */}

      {renderPagination()}

      {/*
      =========================================================================
      NAVIGATION
      =========================================================================
      */}

      {showNavigation && bannerCount > 1 ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
            style={[styles.navigation, styles.navigationLeft, navigationStyle]}
            onPress={() => scrollToIndex(safeIndex - 1, true)}
          >
            <Text style={[styles.navigationText]}>‹</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next slide"
            style={[styles.navigation, styles.navigationRight, navigationStyle]}
            onPress={() => scrollToIndex(safeIndex + 1, true)}
          >
            <Text style={[styles.navigationText]}>›</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  root: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  /*
    ========================================================================
    HEADER
    ========================================================================
    */

  headerLayer: {
    width: "100%",
    zIndex: 1000,
  },

  /*
    ========================================================================
    CAROUSEL
    ========================================================================
    */

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

  /*
    ========================================================================
    BACKGROUND
    ========================================================================
    */

  backgroundContainer: {
    overflow: "hidden",
  },

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
    width: 110,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  decoration: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "#FFF",
  },

  /*
    ========================================================================
    ASSETS
    ========================================================================
    */

  asset: {
    position: "absolute",
  },

  assetImage: {
    width: "100%",
    height: "100%",
  },

  assetText: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
  },

  /*
    ========================================================================
    CONTENT
    ========================================================================
    */

  content: {
    position: "absolute",
    zIndex: 100,
  },

  textWrapper: {
    alignSelf: "flex-start",
  },

  /*
    ========================================================================
    BADGE
    ========================================================================
    */

  badgeWrapper: {
    alignSelf: "flex-start",
    marginBottom: 6,
  },

  badgeTextContainer: {
    alignSelf: "flex-start",
  },

  badgeInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  badgeIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  badgeText: {
    fontWeight: "800",
  },

  /*
    ========================================================================
    EYEBROW
    ========================================================================
    */

  eyebrow: {
    fontWeight: "700",
    marginBottom: 3,
  },

  /*
    ========================================================================
    TITLE
    ========================================================================
    */

  title: {
    fontWeight: "900",
    letterSpacing: -1,
  },

  /*
    ========================================================================
    SUBTITLE
    ========================================================================
    */

  subtitle: {
    fontWeight: "500",
  },

  /*
    ========================================================================
    BUTTON
    ========================================================================
    */

  buttonWrapper: {
    alignSelf: "flex-start",
  },

  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "800",
  },

  buttonIcon: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: "#FFF",
    fontSize: 28,
    lineHeight: 28,
    marginLeft: 8,
  },

  /*
    ========================================================================
    PAGINATION
    ========================================================================
    */

  pagination: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
  },

  paginationTop: {
    top: 10,
    bottom: undefined,
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

  /*
    ========================================================================
    NAVIGATION
    ========================================================================
    */

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
    zIndex: 400,
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

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

export default UIBannerCarousel;

export {
  UIBannerCarousel,
  BACKGROUND_ANIMATIONS as UIBannerCarouselBackgroundAnimations,
  ASSET_ANIMATIONS as UIBannerCarouselAssetAnimations,
  CONTENT_ANIMATIONS as UIBannerCarouselContentAnimations,
  TEXT_ANIMATIONS as UIBannerCarouselTextAnimations,
};
