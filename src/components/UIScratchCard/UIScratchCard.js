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

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_WIDTH = 350;
const DEFAULT_HEIGHT = 220;

/* =========================================================
   BUILT-IN CARD THEMES
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
    scratchIcon: "#263248",

    icon: "gift",
    iconType: "material",
    iconColor: "#E8D5FF",

    titleLines: ["Scratch", "& Win"],
    titleAccentLine: 1,

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
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "trophy",
    iconType: "material",
    iconColor: "#FFC62B",

    titleLines: ["LUCKY", "SCRATCH"],
    titleAccentLine: 0,

    subtitleText: "Win Exciting Prizes!",
    scratchText: "Scratch Here",
  },

  gift: {
    background: ["#E51B18", "#C80F13"],
    border: "#FF6B61",

    title: "#FFFFFF",
    subtitle: "#FFF0EA",
    accent: "#FFD42A",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "gift",
    iconType: "material",
    iconColor: "#FFD43B",

    titleLines: ["Scratch", "& Win"],
    titleAccentLine: 1,

    subtitleText: "Big Prizes Await!",
    scratchText: "Scratch Here",
  },

  travel: {
    background: ["#10B8A7", "#12A9D2"],
    border: "#6FE7DF",

    title: "#FFFFFF",
    subtitle: "#E7FFFF",
    accent: "#D7FFFF",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "airplane",
    iconType: "ion",
    iconColor: "#FFFFFF",

    titleLines: ["TRAVEL", "LUCK"],
    titleAccentLine: null,

    subtitleText: "Scratch & Get Your Reward",
    scratchText: "Scratch Here",
  },

  discount: {
    background: ["#F62992", "#A91DDB"],
    border: "#FF8ED0",

    title: "#FFFFFF",
    subtitle: "#FFE8F6",
    accent: "#FFE32E",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "percent",
    iconType: "material",
    iconColor: "#FFD52C",

    titleLines: ["Special", "DISCOUNT"],
    titleAccentLine: 1,

    subtitleText: "Scratch & Save More!",
    scratchText: "Scratch Here",
  },

  space: {
    background: ["#06317D", "#0756C9"],
    border: "#3D8DFF",

    title: "#FFFFFF",
    subtitle: "#DDEBFF",
    accent: "#55D8FF",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "rocket",
    iconType: "material",
    iconColor: "#FF775C",

    titleLines: ["WIN", "BIG"],
    titleAccentLine: null,

    subtitleText: "Scratch & Claim Your Prize!",
    scratchText: "Scratch Here",
  },

  premium: {
    background: ["#080808", "#222222"],
    border: "#C89B3C",

    title: "#F5D67B",
    subtitle: "#F5E7BC",
    accent: "#E2B94E",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#D8B454",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "crown",
    iconType: "material",
    iconColor: "#E3B943",

    titleLines: ["PREMIUM", "SCRATCH CARD"],
    titleAccentLine: null,

    subtitleText: "Exclusive Rewards Inside",
    scratchText: "Scratch Here",
  },

  christmas: {
    background: ["#0874D1", "#16A7E7"],
    border: "#72D9FF",

    title: "#FFFFFF",
    subtitle: "#E4F7FF",
    accent: "#FFFFFF",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "snowman",
    iconType: "material",
    iconColor: "#FFFFFF",

    titleLines: ["Holiday", "SURPRISE"],
    titleAccentLine: null,

    subtitleText: "Scratch & Win Gifts",
    scratchText: "Scratch Here",
  },

  mystery: {
    background: ["#B58BFF", "#35BFFF"],
    border: "#E3D5FF",

    title: "#FFFFFF",
    subtitle: "#F8F2FF",
    accent: "#FF3A96",

    scratch: ["#E1E5EA", "#C1C8D1"],
    scratchBorder: "#FFFFFF",
    scratchText: "#273043",
    scratchIcon: "#273043",

    icon: "help-circle",
    iconType: "feather",
    iconColor: "#6424C8",

    titleLines: ["Mystery", "Scratch"],
    titleAccentLine: null,

    subtitleText: "What Will You Get?",
    scratchText: "Scratch Here",
  },
};

/* =========================================================
   LABELS
========================================================= */

const VARIANT_LABELS = {
  classic: "1. Classic Reward",
  trophy: "2. Trophy Theme",
  gift: "3. Gift Theme",
  travel: "4. Travel Theme",
  discount: "5. Discount Theme",
  space: "6. Space Theme",
  premium: "7. Premium Theme",
  christmas: "8. Christmas Theme",
  mystery: "9. Mystery Theme",
};

/* =========================================================
   THEME ICON
========================================================= */

function ThemeIcon({ theme, size = 68 }) {
  if (theme.iconType === "ion") {
    return <Ionicons name="airplane" size={size} color={theme.iconColor} />;
  }

  if (theme.iconType === "feather") {
    return <Feather name="help-circle" size={size} color={theme.iconColor} />;
  }

  const icons = {
    gift: "gift",
    trophy: "trophy",
    percent: "percent",
    rocket: "rocket-launch",
    crown: "crown",
    snowman: "snowman",
  };

  return (
    <MaterialCommunityIcons
      name={icons[theme.icon] || "gift"}
      size={size}
      color={theme.iconColor}
    />
  );
}

/* =========================================================
   SCRATCH SURFACE
========================================================= */

function ScratchSurface({
  width,
  height,
  colors,
  borderColor,
  scratchText,
  iconColor,
  threshold,
  revealed,
  onProgress,
  onReveal,
  style,
}) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  const lastPoint = useRef(null);
  const scratchedDistance = useRef(0);
  const progressRef = useRef(0);

  const calculateProgress = useCallback(
    (distance) => {
      scratchedDistance.current += distance;

      const estimated =
        scratchedDistance.current / Math.max(width * height * 0.75, 1);

      const nextProgress = Math.min(100, Math.round(estimated * 100));

      if (nextProgress > progressRef.current) {
        progressRef.current = nextProgress;

        if (onProgress) {
          onProgress(nextProgress);
        }
      }

      if (nextProgress >= threshold && !revealed) {
        if (onReveal) {
          onReveal();
        }
      }
    },
    [height, onProgress, onReveal, threshold, width, revealed],
  );

  const scratchAt = useCallback(
    (x, y) => {
      const point = `${x.toFixed(1)},${y.toFixed(1)}`;

      setCurrentPath((previous) => {
        if (!previous) {
          return `M ${point}`;
        }

        return `${previous} L ${point}`;
      });

      if (lastPoint.current) {
        const dx = x - lastPoint.current.x;

        const dy = y - lastPoint.current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        calculateProgress(distance);
      }

      lastPoint.current = {
        x,
        y,
      };
    },
    [calculateProgress],
  );

  const finishScratch = useCallback(() => {
    if (currentPath) {
      setPaths((previous) => [...previous, currentPath]);
    }

    setCurrentPath("");
    lastPoint.current = null;
  }, [currentPath]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !revealed,

        onMoveShouldSetPanResponder: () => !revealed,

        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;

          scratchAt(locationX, locationY);
        },

        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;

          scratchAt(locationX, locationY);
        },

        onPanResponderRelease: finishScratch,

        onPanResponderTerminate: finishScratch,
      }),
    [finishScratch, revealed, scratchAt],
  );

  if (revealed) {
    return null;
  }

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.scratchSurface,
        {
          width,
          height,
          borderColor,
        },
        style,
      ]}
    >
      <Svg width={width} height={height} pointerEvents="none">
        <Defs>
          <LinearGradient id="scratchGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />

            <Stop offset="0.5" stopColor={colors[1]} />

            <Stop offset="1" stopColor={colors[0]} />
          </LinearGradient>

          <Mask id="scratchMask">
            <Rect x="0" y="0" width={width} height={height} fill="white" />

            {paths.map((path, index) => (
              <Path
                key={`scratch-${index}`}
                d={path}
                stroke="black"
                strokeWidth={38}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {currentPath ? (
              <Path
                d={currentPath}
                stroke="black"
                strokeWidth={38}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </Mask>
        </Defs>

        <G mask="url(#scratchMask)">
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="url(#scratchGradient)"
          />

          {Array.from({
            length: 15,
          }).map((_, index) => (
            <Path
              key={`texture-a-${index}`}
              d={`M ${-30 + index * 34} ${height}
              L ${60 + index * 34} 0`}
              stroke="#FFFFFF"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          ))}

          {Array.from({
            length: 8,
          }).map((_, index) => (
            <Path
              key={`texture-b-${index}`}
              d={`M ${index * 55} 0
              L ${index * 55 + 85} ${height}`}
              stroke="#6D7783"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          ))}
        </G>
      </Svg>

      <View pointerEvents="none" style={styles.scratchPrompt}>
        <MaterialCommunityIcons
          name="gesture-tap"
          size={30}
          color={iconColor}
        />

        <Text
          style={[
            styles.scratchPromptText,
            {
              color: iconColor,
            },
          ]}
        >
          {scratchText}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UIScratchCard = forwardRef(
  (
    {
      variant = "classic",

      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,

      title,
      subtitle,
      scratchText,

      reward,
      rewardIcon,

      icon,
      image,

      scratchThreshold = 55,

      reanimated = true,

      onProgress,
      onReveal,

      backgroundColors,
      backgroundColor,

      borderRadius = 16,

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
    const cardTheme = THEMES[variant] || THEMES.classic;

    const [revealed, setRevealed] = useState(false);

    const rewardScale = useSharedValue(1);

    const progressValue = useSharedValue(0);

    const resolvedBackground = backgroundColors || cardTheme.background;

    const resolvedTitle = title || cardTheme.titleLines;

    const resolvedSubtitle = subtitle || cardTheme.subtitleText;

    const resolvedScratchText = scratchText || cardTheme.scratchText;

    /* =====================================================
       REVEAL
    ===================================================== */

    const reveal = useCallback(() => {
      if (revealed) {
        return;
      }

      setRevealed(true);

      if (reanimated) {
        rewardScale.value = withSequence(
          withTiming(0.92, {
            duration: 100,
          }),
          withSpring(1),
        );
      }

      if (onReveal) {
        onReveal({
          variant,
          reward,
        });
      }
    }, [onReveal, reanimated, revealed, reward, rewardScale, variant]);

    /* =====================================================
       RESET
    ===================================================== */

    const reset = useCallback(() => {
      setRevealed(false);

      progressValue.value = 0;
      rewardScale.value = 1;
    }, [progressValue, rewardScale]);

    /* =====================================================
       REF API
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        reveal,
        reset,
        isRevealed: revealed,
      }),
      [reveal, reset, revealed],
    );

    /* =====================================================
       PROGRESS
    ===================================================== */

    const handleProgress = useCallback(
      (progress) => {
        progressValue.value = withTiming(progress, {
          duration: 100,
        });

        if (onProgress) {
          onProgress(progress);
        }
      },
      [onProgress, progressValue],
    );

    /* =====================================================
       REWARD ANIMATION
    ===================================================== */

    const rewardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: rewardScale.value,
        },
      ],
    }));

    return (
      <View
        style={[
          styles.wrapper,
          {
            width,
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              width,
              height,
              borderRadius,
              borderColor: cardTheme.border,
              backgroundColor: backgroundColor || resolvedBackground[0],
            },
            cardStyle,
          ]}
        >
          {/* =============================================
              BACKGROUND
          ============================================= */}

          <Svg
            pointerEvents="none"
            width={width}
            height={height}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <LinearGradient
                id={`cardGradient-${variant}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <Stop offset="0" stopColor={resolvedBackground[0]} />

                <Stop
                  offset="1"
                  stopColor={resolvedBackground[1] || resolvedBackground[0]}
                />
              </LinearGradient>
            </Defs>

            <Rect
              x="0"
              y="0"
              width={width}
              height={height}
              rx={borderRadius}
              fill={
                backgroundColor
                  ? backgroundColor
                  : `url(#cardGradient-${variant})`
              }
            />
          </Svg>

          {/* =============================================
              DECORATIONS
          ============================================= */}

          <View pointerEvents="none" style={styles.decorations}>
            <Text
              style={[
                styles.star,
                {
                  color: cardTheme.accent,
                },
              ]}
            >
              ✦
            </Text>

            <Text
              style={[
                styles.star,
                styles.starTwo,
                {
                  color: cardTheme.accent,
                },
              ]}
            >
              ✦
            </Text>

            <Text
              style={[
                styles.star,
                styles.starThree,
                {
                  color: cardTheme.accent,
                },
              ]}
            >
              •
            </Text>

            <Text
              style={[
                styles.star,
                styles.starFour,
                {
                  color: cardTheme.accent,
                },
              ]}
            >
              ✦
            </Text>
          </View>

          {/* =============================================
              CONTENT
          ============================================= */}

          <View style={[styles.content, contentStyle]}>
            <View style={styles.textArea}>
              <Text
                style={[
                  styles.title,
                  {
                    color: cardTheme.title,
                  },
                  titleStyle,
                ]}
              >
                {Array.isArray(resolvedTitle)
                  ? resolvedTitle.map((line, index) => (
                      <Text
                        key={`${line}-${index}`}
                        style={{
                          color:
                            index === cardTheme.titleAccentLine
                              ? cardTheme.accent
                              : cardTheme.title,
                        }}
                      >
                        {line}

                        {index < resolvedTitle.length - 1 ? "\n" : ""}
                      </Text>
                    ))
                  : resolvedTitle}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: cardTheme.subtitle,
                  },
                  subtitleStyle,
                ]}
              >
                {resolvedSubtitle}
              </Text>
            </View>

            {/* =========================================
                IMAGE / ICON
            ========================================= */}

            <View style={[styles.visualArea, iconContainerStyle]}>
              {image ? (
                typeof image === "function" ? (
                  image({
                    theme: cardTheme,
                  })
                ) : (
                  <Image
                    source={image}
                    resizeMode="contain"
                    style={[styles.visualImage, imageStyle]}
                  />
                )
              ) : (
                icon || <ThemeIcon theme={cardTheme} />
              )}
            </View>
          </View>

          {/* =============================================
              SCRATCH AREA
          ============================================= */}

          <View
            style={[
              styles.scratchWrapper,
              {
                left: 22,
                right: 22,
                bottom: 15,
                height: Math.min(82, height * 0.38),
              },
            ]}
          >
            {revealed ? (
              <Animated.View
                entering={reanimated ? FadeIn.duration(250) : undefined}
                style={[
                  styles.rewardContainer,
                  {
                    borderColor: cardTheme.scratchBorder,
                    borderRadius: Math.min(14, borderRadius),
                  },
                  reanimated ? rewardAnimatedStyle : null,
                  scratchStyle,
                ]}
              >
                {rewardIcon ? (
                  <View style={styles.rewardIcon}>{rewardIcon}</View>
                ) : null}

                <Text style={[styles.rewardText, rewardStyle]}>
                  {reward || "🎉 Reward Revealed!"}
                </Text>
              </Animated.View>
            ) : (
              <ScratchSurface
                width={width - 44}
                height={Math.min(82, height * 0.38)}
                colors={cardTheme.scratch}
                borderColor={cardTheme.scratchBorder}
                scratchText={resolvedScratchText}
                iconColor={cardTheme.scratchIcon}
                threshold={scratchThreshold}
                revealed={revealed || disabled}
                onProgress={handleProgress}
                onReveal={reveal}
                style={scratchStyle}
              />
            )}
          </View>

          {children}
        </View>
      </View>
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
  wrapper: {
    alignSelf: "center",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.2,
  },

  content: {
    position: "absolute",
    top: 18,
    left: 20,
    right: 16,
    height: 105,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  textArea: {
    flex: 1,
    paddingRight: 4,
  },

  title: {
    fontSize: 27,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
  },

  visualArea: {
    width: 100,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },

  visualImage: {
    width: 100,
    height: 88,
  },

  decorations: {
    ...StyleSheet.absoluteFillObject,
  },

  star: {
    position: "absolute",
    top: 14,
    right: 17,
    fontSize: 17,
  },

  starTwo: {
    top: 46,
    right: 120,
    fontSize: 12,
  },

  starThree: {
    top: 10,
    left: 15,
    fontSize: 12,
  },

  starFour: {
    bottom: 90,
    right: 155,
    fontSize: 11,
  },

  scratchWrapper: {
    position: "absolute",
  },

  scratchSurface: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.2,
    borderRadius: 14,
  },

  scratchPrompt: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  scratchPromptText: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },

  rewardContainer: {
    flex: 1,
    borderWidth: 1.2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  rewardIcon: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  rewardText: {
    color: "#263248",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
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
