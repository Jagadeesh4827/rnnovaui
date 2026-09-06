import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
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
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 230;

const THEMES = {
  classic: {
    background: ["#4214C7", "#6B20E8"],
    border: "#8B6BFF",
    title: "#FFFFFF",
    subtitle: "#EDE7FF",
    accent: "#FFD42A",
    scratch: ["#D9DEE5", "#BFC6D0"],
    scratchBorder: "#FFFFFF",
    scratchText: "#263248",
    scratchIcon: "#263248",
    icon: "gift",
    iconType: "material",
    iconColor: "#E9D5FF",
    titleLines: ["Scratch", "& Win"],
    titleAccentLine: 1,
    eyebrow: null,
    subtitleText: "Reveal your reward!",
    scratchText: "Scratch Here",
  },

  trophy: {
    background: ["#17120A", "#3A2810"],
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
    eyebrow: null,
    subtitleText: "Win Exciting Prizes!",
    scratchText: "Scratch Here",
  },

  gift: {
    background: ["#E51B18", "#C90F13"],
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
    eyebrow: null,
    subtitleText: "Big Prizes Await!",
    scratchText: "Scratch Here",
  },

  travel: {
    background: ["#12B7A7", "#13A8D2"],
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
    eyebrow: null,
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
    eyebrow: null,
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
    eyebrow: null,
    subtitleText: "Scratch & Claim Your Prize!",
    scratchText: "Scratch Here",
  },

  premium: {
    background: ["#090909", "#202020"],
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
    eyebrow: null,
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
    eyebrow: null,
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
    eyebrow: null,
    subtitleText: "What Will You Get?",
    scratchText: "Scratch Here",
  },
};

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

function getIcon(theme, size = 65) {
  const color = theme.iconColor;

  if (theme.iconType === "ion") {
    return <Ionicons name="airplane" size={size} color={color} />;
  }

  if (theme.iconType === "feather") {
    return <Feather name="help-circle" size={size} color={color} />;
  }

  const names = {
    gift: "gift",
    trophy: "trophy",
    percent: "percent",
    rocket: "rocket-launch",
    crown: "crown",
    snowman: "snowman",
  };

  return (
    <MaterialCommunityIcons
      name={names[theme.icon] || "gift"}
      size={size}
      color={color}
    />
  );
}

function ThemeIcon({ icon, theme, size = 65 }) {
  if (React.isValidElement(icon)) {
    return icon;
  }

  return getIcon(theme, size);
}

function ScratchSurface({
  width,
  height,
  coverColors,
  borderColor,
  text,
  iconColor,
  onProgress,
  threshold,
  revealed,
  onReveal,
  style,
}) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const scratchedDistance = useRef(0);
  const lastPoint = useRef(null);

  const progressRef = useRef(0);

  const calculateProgress = useCallback(
    (amount) => {
      scratchedDistance.current += amount;

      /*
       * This intentionally uses distance rather than number of
       * touch events so slow and fast scratches both behave naturally.
       */
      const estimatedArea =
        scratchedDistance.current / Math.max(width * height * 0.75, 1);

      const nextProgress = Math.min(100, Math.round(estimatedArea * 100));

      if (nextProgress > progressRef.current) {
        progressRef.current = nextProgress;
        onProgress?.(nextProgress);
      }

      if (nextProgress >= threshold && !revealed) {
        onReveal?.();
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
        styles.scratchContainer,
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
            <Stop offset="0" stopColor={coverColors[0]} />
            <Stop offset="0.5" stopColor={coverColors[1]} />
            <Stop offset="1" stopColor={coverColors[0]} />
          </LinearGradient>

          <Mask id="scratchMask">
            <Rect x="0" y="0" width={width} height={height} fill="white" />

            {paths.map((path, index) => (
              <Path
                key={`scratch-${index}`}
                d={path}
                stroke="black"
                strokeWidth={34}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {currentPath ? (
              <Path
                d={currentPath}
                stroke="black"
                strokeWidth={34}
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

          {/* Scratch texture */}
          {Array.from({
            length: 13,
          }).map((_, index) => (
            <Path
              key={`texture-${index}`}
              d={`M ${-20 + index * 35} ${height}
                  L ${60 + index * 35} 0`}
              stroke="#FFFFFF"
              strokeOpacity={0.16}
              strokeWidth={1}
            />
          ))}

          {Array.from({
            length: 8,
          }).map((_, index) => (
            <Path
              key={`texture2-${index}`}
              d={`M ${index * 55} 0
                  L ${index * 55 + 80} ${height}`}
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
            styles.scratchText,
            {
              color: "#263248",
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const UIScratchCard = forwardRef(
  (
    {
      variant = "classic",

      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,

      title,
      subtitle,
      scratchText = "Scratch Here",

      reward,
      rewardIcon,

      icon,
      image,

      scratchThreshold = 55,

      reanimated = true,

      onProgress,
      onReveal,
      onPress,

      showThemeLabel = false,

      borderRadius = 16,

      titleStyle,
      subtitleStyle,
      rewardStyle,

      scratchStyle,
      cardStyle,
      contentStyle,

      backgroundColors,
      backgroundColor,

      children,

      disabled = false,
    },
    ref,
  ) => {
    const theme = THEMES[variant] || THEMES.classic;

    const [revealed, setRevealed] = useState(false);

    const progressValue = useSharedValue(0);

    const revealScale = useSharedValue(1);

    const resolvedTitle = title || theme.titleLines;

    const resolvedSubtitle = subtitle || theme.subtitleText;

    const resolvedBackground = backgroundColors || theme.background;

    const triggerReveal = useCallback(() => {
      if (revealed) {
        return;
      }

      setRevealed(true);

      if (reanimated) {
        revealScale.value = withSequence(
          withTiming(0.96, {
            duration: 100,
          }),
          withSpring(1),
        );
      }

      onReveal?.();
    }, [onReveal, reanimated, revealScale, revealed]);

    const reset = useCallback(() => {
      setRevealed(false);
      progressValue.value = 0;
    }, [progressValue]);

    useImperativeHandle(
      ref,
      () => ({
        reset,
        reveal: triggerReveal,
        isRevealed: revealed,
      }),
      [reset, revealed, triggerReveal],
    );

    const animatedRevealStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: revealScale.value,
        },
      ],
    }));

    const handleProgress = useCallback(
      (progress) => {
        progressValue.value = withTiming(progress, {
          duration: 100,
        });

        onProgress?.(progress);
      },
      [onProgress, progressValue],
    );

    const cardContent = (
      <View
        style={[
          styles.card,
          {
            width,
            height,
            borderRadius,
            borderColor: theme.border,
            backgroundColor: backgroundColor || resolvedBackground[0],
          },
          cardStyle,
        ]}
      >
        {/* Background */}
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

        {/* Decorative stars / particles */}
        <View pointerEvents="none" style={styles.decorations}>
          <Text
            style={[
              styles.star,
              {
                color: theme.accent,
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
                color: theme.accent,
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
                color: theme.accent,
              },
            ]}
          >
            •
          </Text>
        </View>

        {/* Main top content */}
        <View style={[styles.topContent, contentStyle]}>
          <View style={styles.textArea}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.title,
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
                          index === theme.titleAccentLine
                            ? theme.accent
                            : theme.title,
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
                  color: theme.subtitle,
                },
                subtitleStyle,
              ]}
            >
              {resolvedSubtitle}
            </Text>
          </View>

          <View style={styles.visualArea}>
            {image ? (
              typeof image === "function" ? (
                image(theme)
              ) : (
                <Animated.Image
                  source={image}
                  resizeMode="contain"
                  style={styles.visualImage}
                />
              )
            ) : (
              <ThemeIcon icon={icon} theme={theme} />
            )}
          </View>
        </View>

        {/* Scratch / reward */}
        <View
          style={[
            styles.scratchWrapper,
            {
              left: 24,
              right: 24,
              bottom: 16,
              height: Math.min(82, height * 0.37),
            },
          ]}
        >
          {revealed ? (
            <Animated.View
              entering={reanimated ? FadeIn.duration(220) : undefined}
              style={[
                styles.rewardContainer,
                {
                  borderColor: theme.scratchBorder,
                  borderRadius: Math.min(14, borderRadius),
                },
                reanimated ? animatedRevealStyle : null,
                scratchStyle,
              ]}
            >
              {rewardIcon ? (
                <View style={styles.rewardIcon}>{rewardIcon}</View>
              ) : null}

              {reward ? (
                <Text style={[styles.rewardText, rewardStyle]}>{reward}</Text>
              ) : (
                <Text style={[styles.rewardText, rewardStyle]}>
                  🎉 Reward Revealed!
                </Text>
              )}
            </Animated.View>
          ) : (
            <ScratchSurface
              width={width - 48}
              height={Math.min(82, height * 0.37)}
              coverColors={theme.scratch}
              borderColor={theme.scratchBorder}
              iconColor={theme.scratchIcon}
              text={scratchText}
              threshold={scratchThreshold}
              revealed={revealed}
              onProgress={handleProgress}
              onReveal={triggerReveal}
              style={scratchStyle}
            />
          )}
        </View>

        {children}
      </View>
    );

    if (disabled) {
      return cardContent;
    }

    return (
      <Pressable
        onPress={() =>
          onPress?.({
            variant,
            revealed,
          })
        }
        style={({ pressed }) => ({
          opacity: pressed ? 0.96 : 1,
        })}
      >
        {cardContent}
      </Pressable>
    );
  },
);

UIScratchCard.displayName = "UIScratchCard";

export { UIScratchCard };

export { THEMES as UIScratchCardThemes, VARIANT_LABELS as UIScratchCardLabels };

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1.2,
    position: "relative",
  },

  topContent: {
    position: "absolute",
    top: 20,
    left: 22,
    right: 18,
    height: 100,
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
    marginTop: 7,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
  },

  visualArea: {
    width: 94,
    height: 86,
    justifyContent: "center",
    alignItems: "center",
  },

  visualImage: {
    width: 94,
    height: 86,
  },

  decorations: {
    ...StyleSheet.absoluteFillObject,
  },

  star: {
    position: "absolute",
    top: 18,
    right: 18,
    fontSize: 17,
  },

  starTwo: {
    top: 48,
    right: 112,
    fontSize: 12,
  },

  starThree: {
    top: 12,
    left: 16,
    fontSize: 13,
  },

  scratchWrapper: {
    position: "absolute",
  },

  scratchContainer: {
    overflow: "hidden",
    borderWidth: 1.3,
    borderRadius: 14,
    position: "relative",
  },

  scratchPrompt: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  scratchText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
  },

  rewardContainer: {
    flex: 1,
    borderWidth: 1.3,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  rewardText: {
    color: "#263248",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  rewardIcon: {
    marginBottom: 4,
  },
});
