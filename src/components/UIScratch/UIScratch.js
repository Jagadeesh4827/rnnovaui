import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
} from "react-native";

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

import { useTheme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   THEMES
========================================================= */

const THEMES = {
  classic: {
    background: ["#4214C7", "#6B20E8"],
    border: "#8B6BFF",

    title: "#FFFFFF",
    subtitle: "#EDE7FF",
    accent: "#FFD42A",

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

    icon: {
      type: "material",
      name: "percent-outline",
      color: "#FFE04A",
    },

    titleLines: ["SPECIAL", "OFFER"],
    subtitleText: "Scratch & Save More!",
    scratchText: "Scratch Here",
  },

  space: {
    background: ["#06317D", "#0756C9"],
    border: "#3D8DFF",

    title: "#FFFFFF",
    subtitle: "#DCEBFF",
    accent: "#FFE14A",

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

const ThemeIcon = ({ icon, size = 58, color, style }) => {
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
  scratchText,
  scratchThreshold = 0.6,
  onProgress,
  onReveal,
}) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  const revealedRef = useRef(false);

  const lastPointRef = useRef(null);

  /*
   * Coverage tracking.
   *
   * The scratch area is divided into small cells.
   * When the user scratches a cell, that cell becomes
   * counted as scratched.
   */
  const coverageRef = useRef(new Set());

  const columns = 12;
  const rows = 6;

  const cellWidth = width / columns;

  const cellHeight = height / rows;

  const gradientId = useRef(
    `scratch_${Math.random().toString(36).slice(2)}`,
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
     COVERAGE
  ======================================================= */

  const markCoverage = useCallback(
    (x, y) => {
      if (revealedRef.current) {
        return;
      }

      /*
       * Scratch brush radius.
       */
      const radius = 25;

      const minColumn = Math.max(0, Math.floor((x - radius) / cellWidth));

      const maxColumn = Math.min(
        columns - 1,
        Math.floor((x + radius) / cellWidth),
      );

      const minRow = Math.max(0, Math.floor((y - radius) / cellHeight));

      const maxRow = Math.min(rows - 1, Math.floor((y + radius) / cellHeight));

      for (let row = minRow; row <= maxRow; row += 1) {
        for (let column = minColumn; column <= maxColumn; column += 1) {
          const centerX = column * cellWidth + cellWidth / 2;

          const centerY = row * cellHeight + cellHeight / 2;

          const dx = centerX - x;

          const dy = centerY - y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius * 1.4) {
            coverageRef.current.add(`${column}:${row}`);
          }
        }
      }

      const totalCells = columns * rows;

      const progress = coverageRef.current.size / totalCells;

      const safeProgress = Math.min(progress, 1);

      if (onProgress) {
        onProgress(safeProgress);
      }

      if (safeProgress >= scratchThreshold) {
        reveal();
      }
    },
    [cellWidth, cellHeight, scratchThreshold, onProgress, reveal],
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

          const dx = locationX - last.x;

          const dy = locationY - last.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          /*
           * Interpolate the finger movement
           * so fast scratching does not create
           * gaps.
           */
          const steps = Math.max(1, Math.ceil(distance / 8));

          for (let i = 1; i <= steps; i += 1) {
            const amount = i / steps;

            const x = last.x + dx * amount;

            const y = last.y + dy * amount;

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
     RENDER
  ======================================================= */

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F0F2F4" />

            <Stop offset="0.3" stopColor="#BFC5CC" />

            <Stop offset="0.55" stopColor="#E7EAED" />

            <Stop offset="0.8" stopColor="#B8BEC6" />

            <Stop offset="1" stopColor="#E7EAED" />
          </LinearGradient>

          <Mask id={maskId} x="0" y="0" width={width} height={height}>
            {/* Silver initially visible */}
            <Rect width={width} height={height} fill="white" />

            {/* Scratched area */}
            <G
              fill="none"
              stroke="black"
              strokeWidth={48}
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

        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={15}
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
          stroke="#252525"
          strokeWidth={1.5}
        />
      </Svg>

      {/* Silver shine */}
      <View pointerEvents="none" style={styles.scratchShine}>
        <View style={styles.shineLineOne} />

        <View style={styles.shineLineTwo} />

        <View style={styles.shineLineThree} />
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
      /*
       * MODAL
       *
       * false = hidden
       * true  = centered modal
       */
      visible = false,

      onClose,

      variant = "classic",

      /*
       * Card dimensions
       */
      width = Math.min(SCREEN_WIDTH - 40, 360),

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
       * 0.6 = scratch 60% of the area
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
    const theme = useTheme();

    const selectedTheme = THEMES[variant] || THEMES.classic;

    const [isRevealed, setIsRevealed] = useState(false);

    /*
     * Used to recreate the scratch surface
     * when reset() is called.
     */
    const [scratchKey, setScratchKey] = useState(0);

    const scale = useSharedValue(1);

    const rewardScale = useSharedValue(0.75);

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
       IMPERATIVE REVEAL
    ===================================================== */

    const reveal = useCallback(() => {
      if (!isRevealed) {
        handleReveal();
      }
    }, [handleReveal, isRevealed]);

    /* =====================================================
       RESET
    ===================================================== */

    const reset = useCallback(() => {
      setIsRevealed(false);

      /*
       * Recreate ScratchSurface.
       */
      setScratchKey((value) => value + 1);

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
       REF API
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
       ANIMATIONS
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
       SCRATCH DIMENSIONS
    ===================================================== */

    const scratchWidth = width - 44;

    const scratchHeight = Math.min(130, Math.max(110, height * 0.39));

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
          color="#F7B900"
        />
      );
    };

    /* =====================================================
       REWARD
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

          <View style={styles.rewardGift}>{renderRewardIcon()}</View>

          <View style={styles.rewardTextArea}>
            <Text style={styles.youWon}>YOU WON</Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={styles.rewardValue}
            >
              {String(reward)}
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
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

    const renderCard = () => (
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
        {/* ===============================================
              BACKGROUND
          =============================================== */}

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
                  id={`card_bg_${scratchKey}`}
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
                fill={`url(#card_bg_${scratchKey})`}
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

        {/* ===============================================
              TOP CONTENT
          =============================================== */}

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

        {/* ===============================================
              SCRATCH / REWARD
          =============================================== */}

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
            renderReward()
          ) : disabled ? (
            <View style={styles.disabledScratch}>
              <Text style={styles.disabledText}>{resolvedScratchText}</Text>
            </View>
          ) : (
            <ScratchSurface
              key={scratchKey}
              width={scratchWidth}
              height={scratchHeight}
              scratchText={resolvedScratchText}
              scratchThreshold={scratchThreshold}
              onProgress={handleProgress}
              onReveal={handleReveal}
            />
          )}
        </View>

        {children}
      </Animated.View>
    );

    /* =====================================================
       MODAL
    ===================================================== */

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType={reanimated ? "fade" : "fade"}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalRoot}>
          {/* =============================================
              BACKDROP
          ============================================= */}

          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          {/* =============================================
              CENTER CARD
          ============================================= */}

          <View style={styles.modalCenter}>{renderCard()}</View>
        </View>
      </Modal>
    );
  },
);

UIScratchCard.displayName = "UIScratchCard";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     MODAL
  ======================================================= */

  modalRoot: {
    flex: 1,

    backgroundColor: "rgba(0, 0, 0, 0.72)",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
  },

  modalCenter: {
    width: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =======================================================
     CARD
  ======================================================= */

  card: {
    position: "relative",

    overflow: "hidden",

    borderWidth: 1.3,

    backgroundColor: "#F62992",
  },

  /* =======================================================
     CONTENT
  ======================================================= */

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

  /* =======================================================
     SCRATCH
  ======================================================= */

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
    color: "#111111",

    fontSize: 25,

    lineHeight: 29,

    fontWeight: "900",

    textAlign: "center",
  },

  scratchHint: {
    marginTop: 6,

    color: "#4A4A4A",

    fontSize: 12,

    fontWeight: "700",

    textAlign: "center",
  },

  scratchShine: {
    ...StyleSheet.absoluteFillObject,

    opacity: 0.2,

    pointerEvents: "none",
  },

  shineLineOne: {
    position: "absolute",

    left: -20,

    right: -20,

    top: 25,

    height: 1,

    backgroundColor: "#FFFFFF",

    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },

  shineLineTwo: {
    position: "absolute",

    left: -20,

    right: -20,

    top: 60,

    height: 1,

    backgroundColor: "#FFFFFF",

    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },

  shineLineThree: {
    position: "absolute",

    left: -20,

    right: -20,

    top: 95,

    height: 1,

    backgroundColor: "#FFFFFF",

    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },

  /* =======================================================
     REWARD
  ======================================================= */

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

  /* =======================================================
     CONFETTI
  ======================================================= */

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

  /* =======================================================
     DISABLED
  ======================================================= */

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
  THEMES as UIScratchThemes,
  VARIANT_LABELS as UIScratchLabels,
};
