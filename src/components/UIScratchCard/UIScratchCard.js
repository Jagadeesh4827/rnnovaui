import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { PanResponder, StyleSheet, Text, View, Image } from "react-native";

import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useUITheme } from "../../theme";

/* =========================================================
   BUILT-IN THEMES
========================================================= */

const THEMES = {
  classic: {
    background: ["#4214C7", "#6B20E8"],
    border: "#8B6BFF",

    title: "#FFFFFF",
    subtitle: "#EDE7FF",
    accent: "#FFD42A",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "gift-outline",
      color: "#E8D5FF",
    },

    titleLines: ["Scratch", "& Win"],
    subtitleText: "Reveal your reward!",
    scratchText: "Scratch Here",
  },

  trophy: {
    background: ["#15110A", "#3D2A0A"],
    border: "#D6A72C",

    title: "#FFFFFF",
    subtitle: "#F5E5B1",
    accent: "#FFD43B",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#E7C84A",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "trophy-outline",
      color: "#FFC62B",
    },

    titleLines: ["LUCKY", "SCRATCH"],
    subtitleText: "Win Exciting Prizes!",
    scratchText: "Scratch Here",
  },

  gift: {
    background: ["#E51B18", "#C80F13"],
    border: "#FF6B61",

    title: "#FFFFFF",
    subtitle: "#FFE7E5",
    accent: "#FFD42A",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "gift-outline",
      color: "#FFD42A",
    },

    titleLines: ["Scratch", "& Win"],
    subtitleText: "Big Prizes Await!",
    scratchText: "Scratch Here",
  },

  travel: {
    background: ["#10B8A7", "#12A9D2"],
    border: "#6FE7DF",

    title: "#FFFFFF",
    subtitle: "#E4FFFF",
    accent: "#FFE44D",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "ion",
      name: "airplane-outline",
      color: "#FFE44D",
    },

    titleLines: ["TRAVEL", "LUCK"],
    subtitleText: "Scratch & Get Your Reward",
    scratchText: "Scratch Here",
  },

  discount: {
    background: ["#F62992", "#A91DDB"],
    border: "#FF8ED0",

    title: "#FFFFFF",
    subtitle: "#FFE5F4",
    accent: "#FFE04A",

    scratch: ["#D9DEE5", "#BEC6D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "percent-outline",
      color: "#FFE04A",
    },

    titleLines: ["Special", "DISCOUNT"],
    subtitleText: "Scratch & Save More!",
    scratchText: "Scratch Here",
  },

  space: {
    background: ["#06317D", "#0756C9"],
    border: "#3D8DFF",

    title: "#FFFFFF",
    subtitle: "#DCEBFF",
    accent: "#FFE14A",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "rocket-launch-outline",
      color: "#FFE14A",
    },

    titleLines: ["WIN", "BIG"],
    subtitleText: "Scratch & Claim Your Prize!",
    scratchText: "Scratch Here",
  },

  premium: {
    background: ["#080808", "#222222"],
    border: "#C89B3C",

    title: "#F5D67B",
    subtitle: "#F5E7BC",
    accent: "#E2B94E",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#C89B3C",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "crown-outline",
      color: "#E3B943",
    },

    titleLines: ["PREMIUM", "SCRATCH CARD"],
    subtitleText: "Exclusive Rewards Inside",
    scratchText: "Scratch Here",
  },

  christmas: {
    background: ["#0874D1", "#16A7E7"],
    border: "#72D9FF",

    title: "#FFFFFF",
    subtitle: "#E4F8FF",
    accent: "#FFE14A",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "material",
      name: "snowman",
      color: "#FFFFFF",
    },

    titleLines: ["Holiday", "SURPRISE"],
    subtitleText: "Scratch & Win Gifts",
    scratchText: "Scratch Here",
  },

  mystery: {
    background: ["#B58BFF", "#35BFFF"],
    border: "#E3D5FF",

    title: "#FFFFFF",
    subtitle: "#F2ECFF",
    accent: "#FFFFFF",

    scratch: ["#D9DEE5", "#BEC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",

    icon: {
      type: "feather",
      name: "help-circle",
      color: "#6424C8",
    },

    titleLines: ["Mystery", "Scratch"],
    subtitleText: "What Will You Get?",
    scratchText: "Scratch Here",
  },
};

const VARIANT_LABELS = {
  classic: "Classic",
  trophy: "Trophy",
  gift: "Gift",
  travel: "Travel",
  discount: "Discount",
  space: "Space",
  premium: "Premium",
  christmas: "Christmas",
  mystery: "Mystery",
};

/* =========================================================
   ICON
========================================================= */

const ThemeIcon = ({ icon, size = 54, color, style }) => {
  if (!icon) {
    return null;
  }

  const iconColor = color || icon.color || "#FFFFFF";

  if (icon.type === "ion") {
    return (
      <Ionicons name={icon.name} size={size} color={iconColor} style={style} />
    );
  }

  if (icon.type === "feather") {
    return (
      <Feather name={icon.name} size={size} color={iconColor} style={style} />
    );
  }

  return (
    <MaterialCommunityIcons
      name={icon.name}
      size={size}
      color={iconColor}
      style={style}
    />
  );
};

/* =========================================================
   SCRATCH SURFACE
========================================================= */

const ScratchSurface = ({
  width,
  height,
  colors,
  borderColor,
  scratchText,
  textColor,
  scratchThreshold = 0.45,
  onProgress,
  onReveal,
}) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  const totalDistanceRef = useRef(0);
  const revealedRef = useRef(false);
  const lastPointRef = useRef(null);

  const gradientId = useRef(
    `scratchGradient_${Math.random().toString(36).slice(2)}`,
  ).current;

  const maskId = `${gradientId}_mask`;

  /* =======================================================
     REVEAL
  ======================================================= */

  const reveal = useCallback(() => {
    if (revealedRef.current) {
      return;
    }

    revealedRef.current = true;

    setCurrentPath("");

    if (onProgress) {
      onProgress(1);
    }

    if (onReveal) {
      onReveal();
    }
  }, [onProgress, onReveal]);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const calculateProgress = useCallback(() => {
    /*
     * Practical scratching distance.
     *
     * This is intentionally much lower than the
     * previous version so normal finger movement
     * can reach the reveal threshold.
     */

    const area = width * height;

    const requiredDistance = Math.max(900, area * 0.42);

    const progress = Math.min(totalDistanceRef.current / requiredDistance, 1);

    if (onProgress) {
      onProgress(progress);
    }

    if (progress >= scratchThreshold && !revealedRef.current) {
      reveal();
    }
  }, [width, height, scratchThreshold, onProgress, reveal]);

  /* =======================================================
     PAN RESPONDER
  ======================================================= */

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !revealedRef.current,

        onMoveShouldSetPanResponder: () => !revealedRef.current,

        onPanResponderGrant: (event) => {
          if (revealedRef.current) {
            return;
          }

          const { locationX, locationY } = event.nativeEvent;

          lastPointRef.current = {
            x: locationX,
            y: locationY,
          };

          setCurrentPath(`M ${locationX} ${locationY}`);
        },

        onPanResponderMove: (event) => {
          if (revealedRef.current) {
            return;
          }

          const { locationX, locationY } = event.nativeEvent;

          const last = lastPointRef.current;

          if (!last) {
            lastPointRef.current = {
              x: locationX,
              y: locationY,
            };

            return;
          }

          const dx = locationX - last.x;

          const dy = locationY - last.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          totalDistanceRef.current += distance;

          lastPointRef.current = {
            x: locationX,
            y: locationY,
          };

          setCurrentPath(
            (previous) => `${previous} L ${locationX} ${locationY}`,
          );

          calculateProgress();
        },

        onPanResponderRelease: () => {
          if (revealedRef.current) {
            return;
          }

          setPaths((previous) => {
            if (!currentPath) {
              return previous;
            }

            return [...previous, currentPath];
          });

          setCurrentPath("");

          lastPointRef.current = null;

          calculateProgress();
        },

        onPanResponderTerminate: () => {
          setCurrentPath("");

          lastPointRef.current = null;
        },
      }),
    [calculateProgress, currentPath],
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />

            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>

          <Mask id={maskId} x="0" y="0" width={width} height={height}>
            {/* Initially everything is visible */}
            <Rect width={width} height={height} fill="white" />

            {/* Black areas become transparent */}
            <G
              fill="none"
              stroke="black"
              strokeWidth={42}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {paths.map((path, index) => (
                <Path key={`scratch-${index}`} d={path} />
              ))}

              {currentPath ? <Path d={currentPath} /> : null}
            </G>
          </Mask>
        </Defs>

        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={14}
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
          stroke={borderColor}
          strokeWidth={1.2}
        />
      </Svg>

      {/* Scratch instructions */}
      <View pointerEvents="none" style={styles.scratchOverlay}>
        <View style={styles.scratchShine} />

        <Text
          style={[
            styles.scratchText,
            {
              color: textColor,
            },
          ]}
        >
          {scratchText}
        </Text>

        <Text
          style={[
            styles.scratchHint,
            {
              color: textColor,
            },
          ]}
        >
          ✦ Scratch to reveal ✦
        </Text>
      </View>
    </View>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UIScratchCard = forwardRef(
  (
    {
      variant = "classic",

      width = 330,
      height = 210,

      title,
      subtitle,

      scratchText,

      reward = "₹100 Cashback",

      rewardIcon = "gift",

      icon,
      image,

      scratchThreshold = 0.45,

      reanimated = false,

      onProgress,
      onReveal,
      onPress,

      backgroundColors,
      backgroundColor,

      borderRadius = 20,

      cardStyle,
      contentStyle,
      titleStyle,
      subtitleStyle,
      scratchStyle,
      rewardStyle,
      imageStyle,
      iconContainerStyle,

      children,

      disabled = false,
    },
    ref,
  ) => {
    const theme = useUITheme();

    const selectedTheme = THEMES[variant] || THEMES.classic;

    const [isRevealed, setIsRevealed] = useState(false);

    const progressRef = useRef(0);

    const scale = useSharedValue(1);

    const rewardScale = useSharedValue(0.75);

    const rewardOpacity = useSharedValue(0);

    /* =====================================================
       BACKGROUND
    ===================================================== */

    const cardBackground = backgroundColors || selectedTheme.background;

    const resolvedBackground = backgroundColor || cardBackground;

    /* =====================================================
       CONTENT
    ===================================================== */

    const finalIcon = icon || selectedTheme.icon;

    const finalTitle = title || selectedTheme.titleLines;

    const finalSubtitle = subtitle || selectedTheme.subtitleText;

    const finalScratchText = scratchText || selectedTheme.scratchText;

    /* =====================================================
       REVEAL
    ===================================================== */

    const handleReveal = useCallback(() => {
      setIsRevealed((previous) => {
        if (previous) {
          return previous;
        }

        return true;
      });

      if (reanimated) {
        rewardOpacity.value = withTiming(1, {
          duration: 300,
        });

        rewardScale.value = withSequence(
          withTiming(1.08, {
            duration: 180,
          }),
          withSpring(1, {
            damping: 10,
            stiffness: 150,
          }),
        );

        scale.value = withSequence(
          withTiming(1.03, {
            duration: 120,
          }),
          withSpring(1, {
            damping: 12,
          }),
        );
      }

      /*
       * IMPORTANT:
       *
       * ScratchSurface calls onReveal.
       * Therefore this callback is the only place
       * where the parent reveal state is changed.
       */

      if (onReveal) {
        onReveal();
      }
    }, [onReveal, reanimated, rewardOpacity, rewardScale, scale]);

    /* =====================================================
       PROGRESS
    ===================================================== */

    const handleProgress = useCallback(
      (value) => {
        progressRef.current = value;

        if (onProgress) {
          onProgress(value);
        }
      },
      [onProgress],
    );

    /* =====================================================
       IMPERATIVE REVEAL
    ===================================================== */

    const revealCard = useCallback(() => {
      handleReveal();
    }, [handleReveal]);

    /* =====================================================
       RESET
    ===================================================== */

    const resetCard = useCallback(() => {
      setIsRevealed(false);

      progressRef.current = 0;

      if (onProgress) {
        onProgress(0);
      }

      if (reanimated) {
        rewardOpacity.value = 0;
        rewardScale.value = 0.75;
        scale.value = 1;
      }
    }, [onProgress, reanimated, rewardOpacity, rewardScale, scale]);

    /* =====================================================
       REF
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        reveal: revealCard,
        reset: resetCard,
        isRevealed,
      }),
      [isRevealed, revealCard, resetCard],
    );

    /* =====================================================
       ANIMATED CARD
    ===================================================== */

    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }));

    const animatedRewardStyle = useAnimatedStyle(() => ({
      opacity: rewardOpacity.value,

      transform: [
        {
          scale: rewardScale.value,
        },
      ],
    }));

    /* =====================================================
       DIMENSIONS
    ===================================================== */

    const scratchWidth = width - 44;

    const scratchHeight = Math.min(82, Math.max(65, height * 0.38));

    /* =====================================================
       CARD STYLE
    ===================================================== */

    const cardStyleObject = [
      styles.card,
      {
        width,
        height,
        borderRadius,
        borderColor: selectedTheme.border,
      },

      reanimated && animatedCardStyle,

      cardStyle,
    ];

    /* =====================================================
       TITLE
    ===================================================== */

    const renderTitle = () => {
      if (typeof finalTitle === "string") {
        return (
          <Text
            style={[
              styles.title,
              {
                color: selectedTheme.title,
              },
              titleStyle,
            ]}
          >
            {finalTitle}
          </Text>
        );
      }

      return (
        <Text
          style={[
            styles.title,
            {
              color: selectedTheme.title,
            },
            titleStyle,
          ]}
        >
          {finalTitle?.map((line, index) => (
            <Text key={`title-${index}`}>
              {line}

              {index < finalTitle.length - 1 ? "\n" : ""}
            </Text>
          ))}
        </Text>
      );
    };

    /* =====================================================
       REWARD ICON
    ===================================================== */

    const renderRewardIcon = () => {
      if (React.isValidElement(rewardIcon)) {
        return rewardIcon;
      }

      if (typeof rewardIcon === "string") {
        const iconMap = {
          gift: "gift-outline",
          trophy: "trophy-outline",
          star: "star-outline",
          crown: "crown-outline",
          discount: "percent-outline",
          rocket: "rocket-launch-outline",
          check: "check-circle-outline",
        };

        return (
          <MaterialCommunityIcons
            name={iconMap[rewardIcon] || "gift-outline"}
            size={30}
            color="#FFFFFF"
          />
        );
      }

      return (
        <MaterialCommunityIcons name="gift-outline" size={30} color="#FFFFFF" />
      );
    };

    /* =====================================================
       REWARD VIEW
    ===================================================== */

    const renderReward = () => {
      return (
        <Animated.View
          entering={!reanimated ? FadeIn.duration(250) : undefined}
          style={[
            styles.rewardContainer,

            reanimated && animatedRewardStyle,

            {
              borderColor: selectedTheme.accent,
            },

            rewardStyle,
          ]}
        >
          <View
            style={[
              styles.rewardIcon,
              {
                backgroundColor: selectedTheme.accent,
              },
            ]}
          >
            {renderRewardIcon()}
          </View>

          <View style={styles.rewardTextContainer}>
            <Text
              style={[
                styles.rewardLabel,
                {
                  color: selectedTheme.scratchText,
                },
              ]}
            >
              YOU WON
            </Text>

            <Text
              numberOfLines={2}
              style={[
                styles.rewardText,
                {
                  color: theme?.colors?.text?.primary || "#151515",
                },
              ]}
            >
              {String(reward)}
            </Text>
          </View>
        </Animated.View>
      );
    };

    /* =====================================================
       RETURN
    ===================================================== */

    return (
      <Animated.View style={cardStyleObject}>
        {/* =================================================
            CARD BACKGROUND
        ================================================= */}

        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              overflow: "hidden",
            },
          ]}
        >
          {Array.isArray(resolvedBackground) ? (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient
                  id="cardBackgroundGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor={resolvedBackground[0]} />

                  <Stop offset="1" stopColor={resolvedBackground[1]} />
                </LinearGradient>
              </Defs>

              <Rect
                width={width}
                height={height}
                fill="url(#cardBackgroundGradient)"
              />
            </Svg>
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: resolvedBackground,
                },
              ]}
            />
          )}
        </View>

        {/* =================================================
            TOP CONTENT
        ================================================= */}

        <View style={[styles.content, contentStyle]}>
          <View style={styles.textArea}>
            {renderTitle()}

            <Text
              numberOfLines={2}
              style={[
                styles.subtitle,
                {
                  color: selectedTheme.subtitle,
                },
                subtitleStyle,
              ]}
            >
              {finalSubtitle}
            </Text>
          </View>

          <View style={[styles.iconContainer, iconContainerStyle]}>
            {image ? (
              <Image
                source={image}
                resizeMode="contain"
                style={[styles.image, imageStyle]}
              />
            ) : (
              <ThemeIcon icon={finalIcon} size={58} />
            )}
          </View>
        </View>

        {/* =================================================
            SCRATCH / REWARD
        ================================================= */}

        <View
          style={[
            styles.scratchWrapper,
            {
              left: 22,
              right: 22,
              bottom: 15,
              height: scratchHeight,
              borderRadius: 14,
            },
            scratchStyle,
          ]}
        >
          {isRevealed ? (
            /*
             * IMPORTANT:
             *
             * ScratchSurface is completely removed after
             * reveal. The reward is now the only component
             * occupying the scratch area.
             */
            renderReward()
          ) : (
            <ScratchSurface
              width={scratchWidth}
              height={scratchHeight}
              colors={selectedTheme.scratch}
              borderColor={selectedTheme.scratchBorder}
              scratchText={finalScratchText}
              textColor={selectedTheme.scratchText}
              scratchThreshold={scratchThreshold}
              onProgress={handleProgress}
              onReveal={handleReveal}
            />
          )}
        </View>

        {/* =================================================
            CUSTOM CHILDREN
        ================================================= */}

        {children}
      </Animated.View>
    );
  },
);

/* =========================================================
   DISPLAY NAME
========================================================= */

UIScratchCard.displayName = "UIScratchCard";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  card: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.2,
    backgroundColor: "#4214C7",
  },

  content: {
    position: "absolute",

    top: 17,
    left: 20,
    right: 17,

    height: 105,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  textArea: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 5,

    fontSize: 11.5,
    lineHeight: 15,

    fontWeight: "600",

    maxWidth: 190,
  },

  iconContainer: {
    width: 90,
    height: 90,

    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 86,
    height: 86,
  },

  scratchWrapper: {
    position: "absolute",

    overflow: "hidden",

    backgroundColor: "#D9DEE5",

    borderWidth: 1,
  },

  scratchOverlay: {
    ...StyleSheet.absoluteFillObject,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
  },

  scratchShine: {
    position: "absolute",

    top: 10,
    left: 18,
    right: 18,

    height: 1,

    opacity: 0.35,

    backgroundColor: "#FFFFFF",
  },

  scratchText: {
    fontSize: 18,

    fontWeight: "900",

    letterSpacing: 0.4,

    textAlign: "center",
  },

  scratchHint: {
    marginTop: 5,

    fontSize: 10,

    fontWeight: "700",

    opacity: 0.65,

    textAlign: "center",
  },

  rewardContainer: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    margin: 2,

    paddingHorizontal: 18,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    borderWidth: 2,
  },

  rewardIcon: {
    width: 52,
    height: 52,

    marginRight: 13,

    borderRadius: 26,

    alignItems: "center",
    justifyContent: "center",
  },

  rewardTextContainer: {
    flex: 1,

    justifyContent: "center",
  },

  rewardLabel: {
    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1.1,
  },

  rewardText: {
    marginTop: 2,

    fontSize: 20,
    lineHeight: 24,

    fontWeight: "900",
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export default UIScratchCard;

export {
  UIScratchCard,
  THEMES as UIScratchCardThemes,
  VARIANT_LABELS as UIScratchCardLabels,
};
