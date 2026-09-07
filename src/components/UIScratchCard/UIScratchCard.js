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
   THEMES
========================================================= */

const THEMES = {
  classic: {
    background: ["#F20D86", "#A719E8"],
    border: "#FF75D0",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFE044",

    icon: {
      type: "material",
      name: "percent",
      color: "#FFE044",
    },

    titleLines: ["SPECIAL", "OFFER"],
    subtitleText: "Scratch to reveal your discount",
    scratchText: "Scratch Here",
  },

  trophy: {
    background: ["#15110A", "#4A3208"],
    border: "#D7A82B",

    title: "#FFFFFF",
    subtitle: "#F8E9B2",
    accent: "#FFD43B",

    icon: {
      type: "material",
      name: "trophy-outline",
      color: "#FFD43B",
    },

    titleLines: ["LUCKY", "SCRATCH"],
    subtitleText: "Scratch to reveal your prize",
    scratchText: "Scratch Here",
  },

  gift: {
    background: ["#E81A20", "#C30E18"],
    border: "#FF716D",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFD42A",

    icon: {
      type: "material",
      name: "gift-outline",
      color: "#FFD42A",
    },

    titleLines: ["SPECIAL", "OFFER"],
    subtitleText: "Scratch to reveal your discount",
    scratchText: "Scratch Here",
  },

  travel: {
    background: ["#10B7A7", "#159DD6"],
    border: "#73E9DF",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFE44D",

    icon: {
      type: "ion",
      name: "airplane-outline",
      color: "#FFE44D",
    },

    titleLines: ["TRAVEL", "LUCK"],
    subtitleText: "Scratch to reveal your reward",
    scratchText: "Scratch Here",
  },

  discount: {
    background: ["#F20C88", "#A71BE2"],
    border: "#FF7DCD",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFE044",

    icon: {
      type: "material",
      name: "percent",
      color: "#FFE044",
    },

    titleLines: ["SPECIAL", "OFFER"],
    subtitleText: "Scratch to reveal your discount",
    scratchText: "Scratch Here",
  },

  space: {
    background: ["#06327F", "#0759CB"],
    border: "#4D91FF",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFE044",

    icon: {
      type: "material",
      name: "rocket-launch-outline",
      color: "#FFE044",
    },

    titleLines: ["WIN", "BIG"],
    subtitleText: "Scratch to claim your prize",
    scratchText: "Scratch Here",
  },

  premium: {
    background: ["#080808", "#252525"],
    border: "#C79A3A",

    title: "#F4D277",
    subtitle: "#F4E6BC",
    accent: "#E2B943",

    icon: {
      type: "material",
      name: "crown-outline",
      color: "#E2B943",
    },

    titleLines: ["PREMIUM", "OFFER"],
    subtitleText: "Scratch to reveal your exclusive reward",
    scratchText: "Scratch Here",
  },

  christmas: {
    background: ["#0874D1", "#16A8E7"],
    border: "#70D8FF",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFE044",

    icon: {
      type: "material",
      name: "snowman",
      color: "#FFFFFF",
    },

    titleLines: ["HOLIDAY", "SURPRISE"],
    subtitleText: "Scratch to reveal your gift",
    scratchText: "Scratch Here",
  },

  mystery: {
    background: ["#B488FF", "#32BCFF"],
    border: "#E3D5FF",

    title: "#FFFFFF",
    subtitle: "#FFFFFF",
    accent: "#FFFFFF",

    icon: {
      type: "feather",
      name: "help-circle",
      color: "#6527C8",
    },

    titleLines: ["MYSTERY", "OFFER"],
    subtitleText: "Scratch to reveal your reward",
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

const ThemeIcon = ({ icon, size = 58, color }) => {
  if (!icon) {
    return null;
  }

  const iconColor = color || icon.color || "#FFFFFF";

  if (icon.type === "ion") {
    return <Ionicons name={icon.name} size={size} color={iconColor} />;
  }

  if (icon.type === "feather") {
    return <Feather name={icon.name} size={size} color={iconColor} />;
  }

  return (
    <MaterialCommunityIcons name={icon.name} size={size} color={iconColor} />
  );
};

/* =========================================================
   SCRATCH SURFACE
========================================================= */

const ScratchSurface = ({
  width,
  height,
  scratchText,
  scratchThreshold,
  onProgress,
  onReveal,
}) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  const revealedRef = useRef(false);

  const lastPointRef = useRef(null);

  /*
   * Coverage grid.
   *
   * Instead of calculating how far the finger moved,
   * we calculate how much of the actual scratch area
   * has been touched.
   */
  const coverageRef = useRef(new Set());

  const columns = 10;
  const rows = 5;

  const cellWidth = width / columns;

  const cellHeight = height / rows;

  const gradientId = useRef(
    `scratch_${Math.random().toString(36).slice(2)}`,
  ).current;

  const maskId = `${gradientId}_mask`;

  /* =======================================================
     RESET INTERNAL STATE
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
     MARK SCRATCHED CELLS
  ======================================================= */

  const markCoverage = useCallback(
    (x, y) => {
      const radius = 24;

      const minColumn = Math.max(0, Math.floor((x - radius) / cellWidth));

      const maxColumn = Math.min(
        columns - 1,
        Math.floor((x + radius) / cellWidth),
      );

      const minRow = Math.max(0, Math.floor((y - radius) / cellHeight));

      const maxRow = Math.min(rows - 1, Math.floor((y + radius) / cellHeight));

      for (let row = minRow; row <= maxRow; row += 1) {
        for (let column = minColumn; column <= maxColumn; column += 1) {
          const cellCenterX = column * cellWidth + cellWidth / 2;

          const cellCenterY = row * cellHeight + cellHeight / 2;

          const dx = cellCenterX - x;

          const dy = cellCenterY - y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius * 1.35) {
            coverageRef.current.add(`${column}:${row}`);
          }
        }
      }

      const totalCells = columns * rows;

      const coverage = coverageRef.current.size / totalCells;

      const progress = Math.min(coverage, 1);

      if (onProgress) {
        onProgress(progress);
      }

      if (progress >= scratchThreshold && !revealedRef.current) {
        reveal();
      }
    },
    [
      cellWidth,
      cellHeight,
      columns,
      rows,
      scratchThreshold,
      onProgress,
      reveal,
    ],
  );

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

          markCoverage(locationX, locationY);
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

          /*
           * Interpolate between the previous
           * and current finger position so
           * fast swipes don't leave gaps.
           */
          const dx = locationX - last.x;

          const dy = locationY - last.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          const steps = Math.max(1, Math.ceil(distance / 8));

          for (let i = 1; i <= steps; i += 1) {
            const progress = i / steps;

            const x = last.x + dx * progress;

            const y = last.y + dy * progress;

            markCoverage(x, y);
          }

          lastPointRef.current = {
            x: locationX,
            y: locationY,
          };

          setCurrentPath(
            (previous) => `${previous} L ${locationX} ${locationY}`,
          );
        },

        onPanResponderRelease: () => {
          if (revealedRef.current) {
            return;
          }

          if (currentPath) {
            setPaths((previous) => [...previous, currentPath]);
          }

          setCurrentPath("");

          lastPointRef.current = null;
        },

        onPanResponderTerminate: () => {
          setCurrentPath("");

          lastPointRef.current = null;
        },
      }),
    [currentPath, markCoverage],
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E4E8ED" />

            <Stop offset="0.5" stopColor="#C9D0D8" />

            <Stop offset="1" stopColor="#E5E9EE" />
          </LinearGradient>

          <Mask id={maskId} x="0" y="0" width={width} height={height}>
            {/* Entire silver layer visible initially */}
            <Rect width={width} height={height} fill="white" />

            {/* Black = scratched / transparent */}
            <G
              fill="none"
              stroke="black"
              strokeWidth={42}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {paths.map((path, index) => (
                <Path key={`path-${index}`} d={path} />
              ))}

              {currentPath ? <Path d={currentPath} /> : null}
            </G>
          </Mask>
        </Defs>

        {/* Silver scratch layer */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={14}
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
          stroke="#111111"
          strokeWidth={1.5}
        />
      </Svg>

      {/* Silver texture */}
      <View pointerEvents="none" style={styles.scratchTexture}>
        <View
          style={[
            styles.textureLine,
            {
              transform: [
                {
                  rotate: "-18deg",
                },
              ],
              top: 22,
            },
          ]}
        />

        <View
          style={[
            styles.textureLine,
            {
              transform: [
                {
                  rotate: "-18deg",
                },
              ],
              top: 45,
            },
          ]}
        />

        <View
          style={[
            styles.textureLine,
            {
              transform: [
                {
                  rotate: "-18deg",
                },
              ],
              top: 68,
            },
          ]}
        />
      </View>

      {/* Scratch text */}
      <View pointerEvents="none" style={styles.scratchOverlay}>
        <Text style={styles.scratchTitle}>{scratchText}</Text>

        <Text style={styles.scratchHint}>✦ Scratch to reveal ✦</Text>
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
      height = 330,

      title,
      subtitle,

      scratchText,

      reward = "50% OFF",

      rewardSubtitle = "On your next order",

      rewardIcon = "gift",

      icon,
      image,

      /*
       * 0.60 means approximately 60%
       * of the scratch area needs to be touched.
       *
       * Even if the user scratches much more,
       * the reward is guaranteed to appear.
       */
      scratchThreshold = 0.6,

      reanimated = false,

      onProgress,
      onReveal,

      backgroundColors,
      backgroundColor,

      borderRadius = 22,

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

    const [scratchInstance, setScratchInstance] = useState(0);

    const scale = useSharedValue(1);

    const rewardScale = useSharedValue(0.8);

    const rewardOpacity = useSharedValue(0);

    /* =====================================================
       CONTENT
    ===================================================== */

    const resolvedTitle = title || selectedTheme.titleLines;

    const resolvedSubtitle = subtitle || selectedTheme.subtitleText;

    const resolvedScratchText = scratchText || selectedTheme.scratchText;

    const resolvedIcon = icon || selectedTheme.icon;

    /* =====================================================
       BACKGROUND
    ===================================================== */

    const resolvedBackground =
      backgroundColor || backgroundColors || selectedTheme.background;

    /* =====================================================
       REVEAL
    ===================================================== */

    const handleReveal = useCallback(() => {
      setIsRevealed(true);

      if (reanimated) {
        rewardOpacity.value = withTiming(1, {
          duration: 350,
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
          withTiming(1.025, {
            duration: 120,
          }),

          withSpring(1, {
            damping: 12,
          }),
        );
      }

      if (onReveal) {
        onReveal();
      }
    }, [onReveal, reanimated, rewardOpacity, rewardScale, scale]);

    /* =====================================================
       PROGRESS
    ===================================================== */

    const handleProgress = useCallback(
      (progress) => {
        if (onProgress) {
          onProgress(progress);
        }
      },
      [onProgress],
    );

    /* =====================================================
       REVEAL API
    ===================================================== */

    const reveal = useCallback(() => {
      if (!isRevealed) {
        handleReveal();
      }
    }, [handleReveal, isRevealed]);

    /* =====================================================
       RESET API
    ===================================================== */

    const reset = useCallback(() => {
      setIsRevealed(false);

      /*
       * Force ScratchSurface to completely
       * recreate its internal scratch state.
       */
      setScratchInstance((value) => value + 1);

      if (onProgress) {
        onProgress(0);
      }

      if (reanimated) {
        rewardOpacity.value = 0;
        rewardScale.value = 0.8;
        scale.value = 1;
      }
    }, [onProgress, reanimated, rewardOpacity, rewardScale, scale]);

    /* =====================================================
       IMPERATIVE REF
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        reveal,
        reset,
        isRevealed,
      }),
      [reveal, reset, isRevealed],
    );

    /* =====================================================
       ANIMATION
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

    const scratchHeight = Math.min(130, Math.max(110, height * 0.39));

    const scratchWidth = width - 44;

    /* =====================================================
       TITLE
    ===================================================== */

    const renderTitle = () => {
      if (typeof resolvedTitle === "string") {
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
            {resolvedTitle}
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
          {resolvedTitle.map((line, index) => (
            <Text key={`title-${index}`}>
              {line}

              {index < resolvedTitle.length - 1 ? "\n" : ""}
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

      const iconMap = {
        gift: "gift",
        trophy: "trophy-outline",
        star: "star-outline",
        crown: "crown-outline",
        discount: "percent",
        rocket: "rocket-launch-outline",
        check: "check-circle-outline",
      };

      return (
        <MaterialCommunityIcons
          name={iconMap[rewardIcon] || "gift"}
          size={52}
          color="#F8B900"
        />
      );
    };

    /* =====================================================
       REWARD CONTENT
    ===================================================== */

    const renderReward = () => {
      return (
        <Animated.View
          entering={!reanimated ? FadeIn.duration(300) : undefined}
          style={[
            styles.rewardCard,

            reanimated && animatedRewardStyle,

            rewardStyle,
          ]}
        >
          {/* Confetti */}
          <Text
            pointerEvents="none"
            style={[styles.confetti, styles.confettiOne]}
          >
            ✦
          </Text>

          <Text
            pointerEvents="none"
            style={[styles.confetti, styles.confettiTwo]}
          >
            ◆
          </Text>

          <Text
            pointerEvents="none"
            style={[styles.confetti, styles.confettiThree]}
          >
            ✦
          </Text>

          <Text
            pointerEvents="none"
            style={[styles.confetti, styles.confettiFour]}
          >
            ◆
          </Text>

          {/* Gift */}
          <View style={styles.rewardGift}>
            <MaterialCommunityIcons name="gift" size={58} color="#F7B900" />

            <View style={styles.giftRibbon} />

            <View style={styles.giftRibbonVertical} />
          </View>

          {/* Reward text */}
          <View style={styles.rewardTextArea}>
            <Text style={styles.youWon}>YOU WON</Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.rewardValue}
            >
              {String(reward)}
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.rewardSubtitle}
            >
              {rewardSubtitle}
            </Text>
          </View>
        </Animated.View>
      );
    };

    /* =====================================================
       CARD
    ===================================================== */

    return (
      <Animated.View
        style={[
          styles.card,
          {
            width,
            height,
            borderRadius,
            borderColor: selectedTheme.border,
          },

          reanimated && animatedCardStyle,

          cardStyle,
        ]}
      >
        {/* =================================================
            BACKGROUND
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
                  id={`background_${variant}_${scratchInstance}`}
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
                fill={`url(#background_${variant}_${scratchInstance})`}
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
              {resolvedSubtitle}
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
              <ThemeIcon icon={resolvedIcon} size={62} />
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
              width: scratchWidth,
              height: scratchHeight,
              left: 22,
              bottom: 18,
              borderRadius: 15,
            },
            scratchStyle,
          ]}
        >
          {isRevealed ? (
            /*
             * The ScratchSurface is completely removed.
             *
             * Therefore the silver "Scratch Here"
             * layer cannot remain visible.
             */
            renderReward()
          ) : disabled ? (
            <View style={styles.disabledScratch}>
              <Text style={styles.disabledText}>{resolvedScratchText}</Text>
            </View>
          ) : (
            <ScratchSurface
              key={scratchInstance}
              width={scratchWidth}
              height={scratchHeight}
              scratchText={resolvedScratchText}
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

UIScratchCard.displayName = "UIScratchCard";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  card: {
    position: "relative",
    overflow: "hidden",

    borderWidth: 1.3,

    backgroundColor: "#F20D86",
  },

  /* -------------------------------------------------------
     TOP CONTENT
  ------------------------------------------------------- */

  content: {
    position: "absolute",

    top: 25,
    left: 32,
    right: 25,

    height: 112,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  textArea: {
    flex: 1,

    paddingRight: 8,
  },

  title: {
    fontSize: 31,
    lineHeight: 34,

    fontWeight: "900",

    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 7,

    fontSize: 13.5,
    lineHeight: 18,

    fontWeight: "600",

    maxWidth: 230,
  },

  iconContainer: {
    width: 88,
    height: 88,

    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 82,
    height: 82,
  },

  /* -------------------------------------------------------
     SCRATCH AREA
  ------------------------------------------------------- */

  scratchWrapper: {
    position: "absolute",

    overflow: "hidden",

    backgroundColor: "#D9DEE5",

    borderRadius: 15,
  },

  scratchOverlay: {
    ...StyleSheet.absoluteFillObject,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 15,
  },

  scratchTitle: {
    color: "#050505",

    fontSize: 25,
    lineHeight: 29,

    fontWeight: "900",

    textAlign: "center",
  },

  scratchHint: {
    marginTop: 6,

    color: "#4B4B4B",

    fontSize: 12,

    fontWeight: "700",

    textAlign: "center",
  },

  scratchTexture: {
    ...StyleSheet.absoluteFillObject,

    opacity: 0.15,
  },

  textureLine: {
    position: "absolute",

    left: -40,
    right: -40,

    height: 1,

    backgroundColor: "#FFFFFF",
  },

  /* -------------------------------------------------------
     REWARD
  ------------------------------------------------------- */

  rewardCard: {
    flex: 1,

    margin: 2,

    borderRadius: 13,

    borderWidth: 2,

    borderColor: "#F8C400",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 18,

    overflow: "hidden",
  },

  rewardGift: {
    width: 82,
    height: 82,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  giftRibbon: {
    position: "absolute",

    width: 45,
    height: 7,

    borderRadius: 3,

    backgroundColor: "#F02B2B",

    top: 39,
  },

  giftRibbonVertical: {
    position: "absolute",

    width: 7,
    height: 50,

    borderRadius: 3,

    backgroundColor: "#F02B2B",

    top: 27,
  },

  rewardTextArea: {
    flex: 1,

    alignItems: "flex-start",

    justifyContent: "center",
  },

  youWon: {
    color: "#111111",

    fontSize: 13,

    fontWeight: "700",

    letterSpacing: 0.3,
  },

  rewardValue: {
    marginTop: 1,

    color: "#E12626",

    fontSize: 27,
    lineHeight: 30,

    fontWeight: "900",
  },

  rewardSubtitle: {
    marginTop: 2,

    color: "#222222",

    fontSize: 12.5,

    fontWeight: "600",
  },

  /* -------------------------------------------------------
     CONFETTI
  ------------------------------------------------------- */

  confetti: {
    position: "absolute",

    fontSize: 14,

    fontWeight: "900",
  },

  confettiOne: {
    top: 13,
    left: 38,

    color: "#F7B900",
  },

  confettiTwo: {
    top: 21,
    right: 35,

    color: "#E82BAA",
  },

  confettiThree: {
    bottom: 14,
    left: 25,

    color: "#FF5A5A",
  },

  confettiFour: {
    bottom: 12,
    right: 30,

    color: "#F7B900",
  },

  /* -------------------------------------------------------
     DISABLED
  ------------------------------------------------------- */

  disabledScratch: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#BFC5CC",
  },

  disabledText: {
    color: "#555555",

    fontSize: 18,

    fontWeight: "800",
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
