import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { MaterialCommunityIcons } from "@expo/vector-icons";

/* =========================================================
   VARIANTS
========================================================= */

const VARIANTS = {
  classicBoxTimer: {
    title: "Flash Deal Ends In",
    icon: "lightning-bolt",
    background: ["#E3131D", "#F31B27"],
    accent: "#FFE22E",
    text: "#FFFFFF",
    secondary: "#FFF5F5",
    box: "#C91520",
    boxText: "#FFFFFF",
  },

  circularTimer: {
    title: "Offer Ends In",
    icon: "alarm",
    background: ["#FFF0F7", "#FFDCEB"],
    accent: "#EF2850",
    text: "#101A3A",
    secondary: "#26375E",
    box: "#FFFFFF",
    boxText: "#101A3A",
  },

  neonStyle: {
    title: "Midnight Deal Ends In",
    icon: "moon-waning-crescent",
    background: ["#10104A", "#18004B"],
    accent: "#E94BFF",
    text: "#FFFFFF",
    secondary: "#D9D5FF",
    box: "#100033",
    boxText: "#FFFFFF",
  },

  hourglassTheme: {
    title: "Hurry! Offer Ends In",
    icon: "timer-sand",
    background: ["#FFC928", "#FF9C12"],
    accent: "#FFFFFF",
    text: "#5C1900",
    secondary: "#7A2C00",
    box: "#FFF5C9",
    boxText: "#111111",
  },

  liveIndicator: {
    title: "Deal Ends In",
    icon: "fire",
    background: ["#009B3A", "#1ACD45"],
    accent: "#FF2335",
    text: "#FFFFFF",
    secondary: "#E9FFE8",
    box: "#151C2A",
    boxText: "#FFFFFF",
  },

  flipClock: {
    title: "Limited Time Offer",
    icon: "clock-outline",
    background: ["#EDF3F8", "#DCE6F0"],
    accent: "#111A32",
    text: "#111A32",
    secondary: "#26344E",
    box: "#18202D",
    boxText: "#FFFFFF",
  },

  progressBar: {
    title: "Offer Ends In",
    icon: "alarm",
    background: ["#FFF7FA", "#F7EDF4"],
    accent: "#F1264B",
    text: "#111A32",
    secondary: "#26344E",
    box: "#F1264B",
    boxText: "#FFFFFF",
  },

  minimalStyle: {
    title: "Ends In",
    icon: "alarm",
    background: ["#FFFFFF", "#FFFFFF"],
    accent: "#E32739",
    text: "#111111",
    secondary: "#333333",
    box: "#FFFFFF",
    boxText: "#111111",
  },

  pillStyle: {
    title: "Offer Ends In",
    icon: "alarm",
    background: ["#FFEAF3", "#FFE0EC"],
    accent: "#E62845",
    text: "#111A32",
    secondary: "#26344E",
    box: "#E72D49",
    boxText: "#FFFFFF",
  },

  productBanner: {
    title: "Special Price Ends In",
    icon: "sale",
    background: ["#E3181D", "#F32622"],
    accent: "#FFE032",
    text: "#FFFFFF",
    secondary: "#FFF2F2",
    box: "#FFFFFF",
    boxText: "#111111",
  },

  dualTimezone: {
    title: "Offer Ends In",
    icon: "earth",
    background: ["#D8F4FF", "#C5E9FA"],
    accent: "#2072B8",
    text: "#10284D",
    secondary: "#29476D",
    box: "#FFFFFF",
    boxText: "#10284D",
  },

  circularProgress: {
    title: "Ends In",
    icon: "alarm",
    background: ["#FFF1F5", "#FFE9F0"],
    accent: "#E3283A",
    text: "#111A32",
    secondary: "#26344E",
    box: "#FFFFFF",
    boxText: "#111111",
  },
};

/* =========================================================
   LABELS
========================================================= */

const VARIANT_LABELS = {
  classicBoxTimer: "Classic Box Timer",
  circularTimer: "Circular Timer",
  neonStyle: "Neon Style",
  hourglassTheme: "Hourglass Theme",
  liveIndicator: "Live Indicator",
  flipClock: "Flip Clock",
  progressBar: "Progress Bar",
  minimalStyle: "Minimal Style",
  pillStyle: "Pill Style",
  productBanner: "Product Banner",
  dualTimezone: "Dual Timezone",
  circularProgress: "Circular Progress",
};

/* =========================================================
   DESCRIPTIONS
========================================================= */

const VARIANT_DESCRIPTIONS = {
  classicBoxTimer: "Simple & Bold",
  circularTimer: "Modern & Clean",
  neonStyle: "Dark & Trendy",
  hourglassTheme: "Unique & Eye-catching",
  liveIndicator: "Urgent & Live",
  flipClock: "Classic Flip Animation",
  progressBar: "With Completion Status",
  minimalStyle: "Clean & Simple",
  pillStyle: "Soft & Modern",
  productBanner: "For Product Pages",
  dualTimezone: "With Multiple Timezones",
  circularProgress: "Animated Ring",
};

/* =========================================================
   ICON
========================================================= */

const CountdownIcon = ({ name, size = 30, color = "#FFFFFF" }) => {
  return (
    <MaterialCommunityIcons name={name || "alarm"} size={size} color={color} />
  );
};

/* =========================================================
   FORMAT
========================================================= */

const pad = (value) => String(Math.max(0, value)).padStart(2, "0");

/* =========================================================
   CIRCULAR TIMER
========================================================= */

const CircularUnit = ({ value, label, color, size = 65, stroke = 5 }) => {
  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress = Math.max(0, Math.min(1, value / 60));

  const dash = circumference * progress;

  return (
    <View
      style={[
        styles.circularUnit,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D6DCE5"
          strokeWidth={stroke}
          fill="none"
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <Text
        style={[
          styles.circularValue,
          {
            color,
          },
        ]}
      >
        {pad(value)}
      </Text>

      <Text
        style={[
          styles.circularLabel,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

/* =========================================================
   TIMER BOX
========================================================= */

const TimerBox = ({
  value,
  label,
  backgroundColor,
  textColor,
  rounded = false,
  glow = false,
}) => {
  return (
    <View
      style={[
        styles.timerBox,

        rounded && styles.timerBoxRounded,

        {
          backgroundColor,
        },

        glow && {
          shadowColor: backgroundColor,
          shadowOpacity: 0.65,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          elevation: 8,
        },
      ]}
    >
      <Text
        style={[
          styles.timerBoxValue,
          {
            color: textColor,
          },
        ]}
      >
        {pad(value)}
      </Text>

      <Text
        style={[
          styles.timerBoxLabel,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

/* =========================================================
   TIME ROW
========================================================= */

const TimeRow = ({ hours, minutes, seconds, variant }) => {
  const theme = VARIANTS[variant] || VARIANTS.classicBoxTimer;

  if (variant === "circularTimer") {
    return (
      <View style={styles.circularTimerRow}>
        <CircularUnit value={hours} label="Hours" color={theme.accent} />

        <CircularUnit value={minutes} label="Minutes" color={theme.accent} />

        <CircularUnit value={seconds} label="Seconds" color={theme.accent} />
      </View>
    );
  }

  if (variant === "pillStyle") {
    return (
      <View style={styles.pillTimerRow}>
        <View
          style={[
            styles.pillUnit,
            {
              backgroundColor: "#7182F2",
            },
          ]}
        >
          <Text style={styles.pillValue}>{pad(hours)}h</Text>
        </View>

        <View
          style={[
            styles.pillUnit,
            {
              backgroundColor: "#AF1935",
            },
          ]}
        >
          <Text style={styles.pillValue}>{pad(minutes)}m</Text>
        </View>

        <View
          style={[
            styles.pillUnit,
            {
              backgroundColor: "#F13A4A",
            },
          ]}
        >
          <Text style={styles.pillValue}>{pad(seconds)}s</Text>
        </View>
      </View>
    );
  }

  if (variant === "circularProgress") {
    return null;
  }

  return (
    <View style={styles.timeRow}>
      <TimerBox
        value={hours}
        label={variant === "flipClock" ? "HOURS" : "Hours"}
        backgroundColor={theme.box}
        textColor={theme.boxText}
        glow={variant === "neonStyle"}
      />

      <Text
        style={[
          styles.colon,
          {
            color: theme.text,
          },
        ]}
      >
        :
      </Text>

      <TimerBox
        value={minutes}
        label={variant === "flipClock" ? "MINS" : "Mins"}
        backgroundColor={theme.box}
        textColor={theme.boxText}
        glow={variant === "neonStyle"}
      />

      <Text
        style={[
          styles.colon,
          {
            color: theme.text,
          },
        ]}
      >
        :
      </Text>

      <TimerBox
        value={seconds}
        label={variant === "flipClock" ? "SECS" : "Secs"}
        backgroundColor={theme.box}
        textColor={theme.boxText}
        glow={variant === "neonStyle"}
      />
    </View>
  );
};

/* =========================================================
   CIRCULAR PROGRESS
========================================================= */

const CircularProgressTimer = ({
  hours,
  minutes,
  seconds,
  totalSeconds,
  remainingSeconds,
  color,
  textColor,
}) => {
  const size = 205;

  const stroke = 7;

  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  const dash = circumference * progress;

  return (
    <View
      style={[
        styles.circularProgressContainer,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#B71E2C"
          strokeWidth={stroke}
          fill="none"
          opacity={0.3}
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.circularProgressInner}>
        <Text
          style={[
            styles.circularEnds,
            {
              color: textColor,
            },
          ]}
        >
          ⏰ Ends In
        </Text>

        <Text
          style={[
            styles.circularTime,
            {
              color: textColor,
            },
          ]}
        >
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </Text>

        <Text
          style={[
            styles.circularRemaining,
            {
              color: textColor,
            },
          ]}
        >
          Time Left
        </Text>
      </View>
    </View>
  );
};

/* =========================================================
   FLIP DIGIT
========================================================= */

const FlipDigit = ({ value, label }) => {
  return (
    <View style={styles.flipColumn}>
      <View style={styles.flipCard}>
        <View style={styles.flipTop} />

        <View style={styles.flipDivider} />

        <Text style={styles.flipValue}>{pad(value)}</Text>
      </View>

      <Text style={styles.flipLabel}>{label}</Text>
    </View>
  );
};

/* =========================================================
   REANIMATED ICON
========================================================= */

const AnimatedIcon = ({ icon, color, reanimated }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!reanimated) {
      return;
    }

    rotation.value = withRepeat(
      withSequence(
        withTiming(-8, {
          duration: 450,
        }),
        withTiming(8, {
          duration: 450,
        }),
        withTiming(0, {
          duration: 450,
        }),
      ),
      -1,
      false,
    );
  }, [reanimated, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <Animated.View style={reanimated ? animatedStyle : undefined}>
      <CountdownIcon name={icon} size={31} color={color} />
    </Animated.View>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UICountDown = forwardRef(
  (
    {
      variant = "classicBoxTimer",

      /*
       * Countdown starting values.
       *
       * Default matches the reference:
       * 02 : 15 : 36
       */
      hours = 2,
      minutes = 15,
      seconds = 36,

      /*
       * Alternative:
       *
       * duration={8100}
       *
       * Duration is seconds.
       */
      duration,

      /*
       * Alternative:
       *
       * targetDate={new Date(...)}
       */
      targetDate,

      /*
       * Modal
       */
      modal = false,
      visible = true,
      onClose,

      /*
       * Background
       *
       * "default"
       * "transparent"
       * "#FFFFFF"
       */
      background = "default",

      /*
       * Optional custom image.
       */
      image,

      /*
       * Optional custom icon.
       */
      icon,

      /*
       * Optional text overrides.
       */
      title,
      subtitle,

      /*
       * Product banner discount.
       */
      badge = "50% OFF",

      /*
       * Product image / CTA
       */
      ctaText = "ORDER NOW",

      /*
       * Dual timezone.
       */
      userTimezone = "Your Time",
      dealTimezone = "Deal Time (IST)",

      /*
       * Animation.
       */
      reanimated = false,

      /*
       * Timer controls.
       */
      autoStart = true,

      /*
       * Callbacks.
       */
      onTick,
      onComplete,

      /*
       * Styles.
       */
      style,
      titleStyle,
      subtitleStyle,
      timerStyle,

      /*
       * Progress settings.
       */
      progress = 0.7,

      /*
       * Custom product image.
       */
      productImage,

      /*
       * Optional children.
       */
      children,
    },
    ref,
  ) => {
    const theme = VARIANTS[variant] || VARIANTS.classicBoxTimer;

    /* =====================================================
       INITIAL SECONDS
    ===================================================== */

    const initialSeconds = useMemo(() => {
      if (typeof duration === "number") {
        return Math.max(0, Math.floor(duration));
      }

      if (targetDate) {
        const target = new Date(targetDate).getTime();

        return Math.max(0, Math.floor((target - Date.now()) / 1000));
      }

      return (
        Math.max(0, Number(hours) || 0) * 3600 +
        Math.max(0, Number(minutes) || 0) * 60 +
        Math.max(0, Number(seconds) || 0)
      );
    }, [duration, hours, minutes, seconds, targetDate]);

    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

    const [running, setRunning] = useState(autoStart);

    const initialRef = useRef(initialSeconds);

    const timerRef = useRef(null);

    /* =====================================================
       SYNC INITIAL VALUE
    ===================================================== */

    useEffect(() => {
      initialRef.current = initialSeconds;

      setRemainingSeconds(initialSeconds);

      setRunning(autoStart);
    }, [initialSeconds, autoStart]);

    /* =====================================================
       TIME VALUES
    ===================================================== */

    const time = useMemo(() => {
      const safe = Math.max(0, remainingSeconds);

      return {
        hours: Math.floor(safe / 3600),

        minutes: Math.floor((safe % 3600) / 60),

        seconds: safe % 60,
      };
    }, [remainingSeconds]);

    /* =====================================================
       COMPLETE
    ===================================================== */

    const complete = useCallback(() => {
      setRemainingSeconds(0);

      setRunning(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);

        timerRef.current = null;
      }

      if (onComplete) {
        onComplete();
      }
    }, [onComplete]);

    /* =====================================================
       TICK
    ===================================================== */

    useEffect(() => {
      if (!running) {
        return undefined;
      }

      if (remainingSeconds <= 0) {
        complete();

        return undefined;
      }

      timerRef.current = setInterval(() => {
        setRemainingSeconds((current) => {
          const next = current - 1;

          if (next <= 0) {
            return 0;
          }

          return next;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);

          timerRef.current = null;
        }
      };
    }, [running, complete, remainingSeconds]);

    /* =====================================================
       COMPLETE WHEN ZERO
    ===================================================== */

    useEffect(() => {
      if (remainingSeconds === 0 && running) {
        complete();
      }
    }, [complete, remainingSeconds, running]);

    /* =====================================================
       ON TICK
    ===================================================== */

    useEffect(() => {
      if (onTick) {
        onTick({
          totalSeconds: remainingSeconds,

          hours: time.hours,

          minutes: time.minutes,

          seconds: time.seconds,

          running,
        });
      }
    }, [onTick, remainingSeconds, running, time]);

    /* =====================================================
       CONTROLS
    ===================================================== */

    const start = useCallback(() => {
      if (remainingSeconds <= 0) {
        return;
      }

      setRunning(true);
    }, [remainingSeconds]);

    const pause = useCallback(() => {
      setRunning(false);
    }, []);

    const reset = useCallback(() => {
      setRemainingSeconds(initialRef.current);

      setRunning(false);
    }, []);

    const restart = useCallback(() => {
      setRemainingSeconds(initialRef.current);

      setRunning(true);
    }, []);

    /* =====================================================
       REF
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        start,
        pause,
        reset,
        restart,

        getTime: () => ({
          totalSeconds: remainingSeconds,

          hours: time.hours,

          minutes: time.minutes,

          seconds: time.seconds,
        }),

        isRunning: running,
      }),
      [pause, remainingSeconds, reset, restart, running, start, time],
    );

    /* =====================================================
       BACKGROUND
    ===================================================== */

    const backgroundStyle = useMemo(() => {
      if (background === "transparent") {
        return {
          backgroundColor: "transparent",
        };
      }

      if (typeof background === "string" && background !== "default") {
        return {
          backgroundColor: background,
        };
      }

      return null;
    }, [background]);

    /* =====================================================
       CONTENT
    ===================================================== */

    const resolvedTitle = title || theme.title;

    const resolvedIcon = icon || theme.icon;

    /* =====================================================
       CLASSIC BOX
    ===================================================== */

    const renderClassic = () => (
      <>
        <View style={styles.classicHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={theme.accent}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.classicTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <TimeRow
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          variant={variant}
        />

        <View style={styles.classicBottom}>
          <View style={styles.foodIllustration}>
            {image ? (
              <Image
                source={image}
                resizeMode="contain"
                style={styles.foodImage}
              />
            ) : (
              <Text style={styles.foodEmoji}>🍔</Text>
            )}
          </View>

          <View
            style={[
              styles.offerBadge,
              {
                backgroundColor: theme.accent,
              },
            ]}
          >
            <Text style={styles.offerBadgeText}>{badge}</Text>
          </View>
        </View>
      </>
    );

    /* =====================================================
       CIRCULAR TIMER
    ===================================================== */

    const renderCircular = () => (
      <>
        <View style={styles.simpleHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={theme.accent}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.simpleTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <View style={styles.circularTimerRow}>
          <CircularUnit value={time.hours} label="Hours" color={theme.accent} />

          <CircularUnit
            value={time.minutes}
            label="Minutes"
            color={theme.accent}
          />

          <CircularUnit
            value={time.seconds}
            label="Seconds"
            color={theme.accent}
          />
        </View>

        <View style={styles.decorativeFood}>🍟</View>
      </>
    );

    /* =====================================================
       NEON
    ===================================================== */

    const renderNeon = () => (
      <>
        <View style={styles.simpleHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={"#FFF04B"}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.simpleTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <View style={[styles.neonTimerRow, timerStyle]}>
          <TimerBox
            value={time.hours}
            label="Hours"
            backgroundColor="#160046"
            textColor="#FFFFFF"
            glow
          />

          <Text style={styles.neonColon}>:</Text>

          <TimerBox
            value={time.minutes}
            label="Mins"
            backgroundColor="#160046"
            textColor="#FFFFFF"
            glow
          />

          <Text style={styles.neonColon}>:</Text>

          <TimerBox
            value={time.seconds}
            label="Secs"
            backgroundColor="#160046"
            textColor="#FFFFFF"
            glow
          />
        </View>

        <View style={styles.neonFood}>🍕</View>
      </>
    );

    /* =====================================================
       HOURGLASS
    ===================================================== */

    const renderHourglass = () => (
      <>
        <View style={styles.hourglassLayout}>
          <View style={styles.hourglassIcon}>
            <AnimatedIcon
              icon="timer-sand"
              color="#B91E00"
              size={58}
              reanimated={reanimated}
            />
          </View>

          <View style={styles.hourglassRight}>
            <Text
              style={[
                styles.hourglassTitle,
                {
                  color: theme.text,
                },
                titleStyle,
              ]}
            >
              {resolvedTitle}
            </Text>

            <TimeRow
              hours={time.hours}
              minutes={time.minutes}
              seconds={time.seconds}
              variant={variant}
            />
          </View>
        </View>
      </>
    );

    /* =====================================================
       LIVE
    ===================================================== */

    const renderLive = () => (
      <>
        <View style={styles.liveHeader}>
          <AnimatedIcon icon="fire" color="#FFE62E" reanimated={reanimated} />

          <Text style={styles.liveTitle}>{resolvedTitle}</Text>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <TimeRow
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          variant={variant}
        />
      </>
    );

    /* =====================================================
       FLIP CLOCK
    ===================================================== */

    const renderFlip = () => (
      <>
        <Text
          style={[
            styles.flipTitle,
            {
              color: theme.text,
            },
            titleStyle,
          ]}
        >
          {resolvedTitle}
        </Text>

        <View style={styles.flipRow}>
          <FlipDigit value={time.hours} label="HOURS" />

          <Text style={styles.flipColon}>:</Text>

          <FlipDigit value={time.minutes} label="MINS" />

          <Text style={styles.flipColon}>:</Text>

          <FlipDigit value={time.seconds} label="SECS" />
        </View>
      </>
    );

    /* =====================================================
       PROGRESS BAR
    ===================================================== */

    const renderProgress = () => {
      const total = Math.max(1, initialRef.current);

      const remaining = remainingSeconds;

      const percent = Math.max(0, Math.min(1, remaining / total));

      return (
        <>
          <View style={styles.progressHeader}>
            <AnimatedIcon
              icon={resolvedIcon}
              color={theme.accent}
              reanimated={reanimated}
            />

            <Text
              style={[
                styles.progressTitle,
                {
                  color: theme.text,
                },
                titleStyle,
              ]}
            >
              {resolvedTitle}
            </Text>

            <Text
              style={[
                styles.progressTime,
                {
                  color: theme.accent,
                },
              ]}
            >
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percent * 100}%`,
                  backgroundColor: theme.accent,
                },
              ]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text
              style={[
                styles.progressLeft,
                {
                  color: theme.accent,
                },
              ]}
            >
              Hurry! {Math.round((1 - percent) * 100)}% Claimed
            </Text>

            <Text style={styles.progressRight}>
              {Math.round(percent * 100)}% Left
            </Text>
          </View>
        </>
      );
    };

    /* =====================================================
       MINIMAL
    ===================================================== */

    const renderMinimal = () => (
      <>
        <View style={styles.minimalHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={theme.accent}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.minimalTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <TimeRow
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          variant={variant}
        />
      </>
    );

    /* =====================================================
       PILL
    ===================================================== */

    const renderPill = () => (
      <>
        <View style={styles.pillHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={theme.accent}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.pillTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <TimeRow
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          variant={variant}
        />
      </>
    );

    /* =====================================================
       PRODUCT BANNER
    ===================================================== */

    const renderProduct = () => (
      <>
        <View style={styles.productLayout}>
          <View style={styles.productLeft}>
            <Text style={styles.productTitle}>{resolvedTitle}</Text>

            <TimeRow
              hours={time.hours}
              minutes={time.minutes}
              seconds={time.seconds}
              variant={variant}
            />

            <View style={styles.productCta}>
              <Text style={styles.productCtaText}>{ctaText}</Text>
            </View>
          </View>

          <View style={styles.productRight}>
            {productImage || image ? (
              <Image
                source={productImage || image}
                resizeMode="contain"
                style={styles.productImage}
              />
            ) : (
              <Text style={styles.productEmoji}>🍕</Text>
            )}
          </View>
        </View>
      </>
    );

    /* =====================================================
       DUAL TIMEZONE
    ===================================================== */

    const renderDual = () => (
      <>
        <View style={styles.dualHeader}>
          <AnimatedIcon
            icon={resolvedIcon}
            color={theme.accent}
            reanimated={reanimated}
          />

          <Text
            style={[
              styles.dualTitle,
              {
                color: theme.text,
              },
              titleStyle,
            ]}
          >
            {resolvedTitle}
          </Text>
        </View>

        <View style={styles.dualBody}>
          <View style={styles.dualColumn}>
            <Text style={styles.dualHeading}>{userTimezone}</Text>

            <Text style={styles.dualTime}>
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </Text>

            <View style={styles.dualLabels}>
              <Text>Hrs</Text>
              <Text>Mins</Text>
              <Text>Secs</Text>
            </View>
          </View>

          <View style={styles.dualDivider} />

          <View style={styles.dualColumn}>
            <Text style={styles.dualHeading}>{dealTimezone}</Text>

            <Text style={styles.dualTime}>
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </Text>

            <View style={styles.dualLabels}>
              <Text>Hrs</Text>
              <Text>Mins</Text>
              <Text>Secs</Text>
            </View>
          </View>
        </View>
      </>
    );

    /* =====================================================
       CIRCULAR PROGRESS
    ===================================================== */

    const renderCircularProgress = () => (
      <>
        <CircularProgressTimer
          hours={time.hours}
          minutes={time.minutes}
          seconds={time.seconds}
          totalSeconds={initialRef.current}
          remainingSeconds={remainingSeconds}
          color={theme.accent}
          textColor={theme.text}
        />
      </>
    );

    /* =====================================================
       VARIANT RENDER
    ===================================================== */

    const renderVariant = () => {
      switch (variant) {
        case "circularTimer":
          return renderCircular();

        case "neonStyle":
          return renderNeon();

        case "hourglassTheme":
          return renderHourglass();

        case "liveIndicator":
          return renderLive();

        case "flipClock":
          return renderFlip();

        case "progressBar":
          return renderProgress();

        case "minimalStyle":
          return renderMinimal();

        case "pillStyle":
          return renderPill();

        case "productBanner":
          return renderProduct();

        case "dualTimezone":
          return renderDual();

        case "circularProgress":
          return renderCircularProgress();

        case "classicBoxTimer":
        default:
          return renderClassic();
      }
    };

    /* =====================================================
       CARD
    ===================================================== */

    const card = (
      <View
        style={[
          styles.card,
          {
            borderColor: theme.accent,
          },

          backgroundStyle,

          variant === "minimalStyle" && styles.minimalCard,

          variant === "circularProgress" && styles.circularProgressCard,

          variant === "dualTimezone" && styles.dualCard,

          style,
        ]}
      >
        {/* Background gradient */}

        {background === "default" ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.gradientLayer]}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.background[0],
                },
              ]}
            />

            <View
              style={[
                styles.gradientSecond,
                {
                  backgroundColor: theme.background[1],
                },
              ]}
            />
          </View>
        ) : null}

        {/* Product / food decoration */}

        {variant === "productBanner" && !productImage && !image && (
          <Text pointerEvents="none" style={styles.productDecoration}>
            🍕
          </Text>
        )}

        {/* Main content */}

        <View style={styles.content}>{renderVariant()}</View>

        {children}
      </View>
    );

    /* =====================================================
       MODAL
    ===================================================== */

    if (modal) {
      return (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={onClose}
        >
          <View style={styles.modalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <View style={styles.modalCenter}>{card}</View>
          </View>
        </Modal>
      );
    }

    return card;
  },
);

UICountDown.displayName = "UICountDown";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     CARD
  ======================================================= */

  card: {
    width: "100%",

    minHeight: 175,

    borderRadius: 16,

    overflow: "hidden",

    borderWidth: 1,

    position: "relative",

    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,

    paddingHorizontal: 18,

    paddingVertical: 15,

    zIndex: 2,
  },

  gradientLayer: {
    opacity: 1,
  },

  gradientSecond: {
    position: "absolute",

    right: -80,

    bottom: -100,

    width: "80%",

    height: "120%",

    borderRadius: 200,

    opacity: 0.55,
  },

  /* =======================================================
     CLASSIC
  ======================================================= */

  classicHeader: {
    flexDirection: "row",

    alignItems: "center",

    gap: 7,

    marginBottom: 10,
  },

  classicTitle: {
    fontSize: 20,

    lineHeight: 24,

    fontWeight: "900",
  },

  classicBottom: {
    position: "absolute",

    right: 15,

    bottom: 10,

    alignItems: "center",
  },

  foodIllustration: {
    position: "absolute",

    right: 0,

    bottom: 35,
  },

  foodEmoji: {
    fontSize: 57,
  },

  foodImage: {
    width: 85,

    height: 65,
  },

  offerBadge: {
    minWidth: 85,

    paddingHorizontal: 9,

    paddingVertical: 7,

    borderRadius: 6,

    transform: [
      {
        rotate: "-4deg",
      },
    ],
  },

  offerBadgeText: {
    color: "#111111",

    fontSize: 13,

    fontWeight: "900",

    textAlign: "center",
  },

  /* =======================================================
     TIME ROW
  ======================================================= */

  timeRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "flex-start",

    paddingRight: 105,
  },

  timerBox: {
    minWidth: 58,

    height: 62,

    borderRadius: 8,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 7,
  },

  timerBoxRounded: {
    borderRadius: 20,
  },

  timerBoxValue: {
    fontSize: 25,

    lineHeight: 28,

    fontWeight: "900",
  },

  timerBoxLabel: {
    marginTop: 3,

    fontSize: 9,

    fontWeight: "700",
  },

  colon: {
    fontSize: 28,

    lineHeight: 50,

    fontWeight: "900",

    marginHorizontal: 3,
  },

  /* =======================================================
     CIRCULAR
  ======================================================= */

  simpleHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    marginBottom: 11,
  },

  simpleTitle: {
    fontSize: 19,

    fontWeight: "900",
  },

  circularTimerRow: {
    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "center",

    width: "100%",
  },

  circularUnit: {
    alignItems: "center",

    justifyContent: "center",
  },

  circularValue: {
    fontSize: 20,

    fontWeight: "900",
  },

  circularLabel: {
    marginTop: 2,

    fontSize: 8,

    fontWeight: "700",
  },

  decorativeFood: {
    position: "absolute",

    right: 0,

    bottom: 3,

    fontSize: 43,

    opacity: 0.35,
  },

  /* =======================================================
     NEON
  ======================================================= */

  neonTimerRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "center",

    paddingRight: 65,
  },

  neonColon: {
    color: "#F548FF",

    fontSize: 29,

    fontWeight: "900",

    marginHorizontal: 2,

    lineHeight: 52,
  },

  neonFood: {
    position: "absolute",

    right: 5,

    bottom: 0,

    fontSize: 55,

    opacity: 0.95,
  },

  /* =======================================================
     HOURGLASS
  ======================================================= */

  hourglassLayout: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  hourglassIcon: {
    width: 75,

    alignItems: "center",

    justifyContent: "center",
  },

  hourglassRight: {
    flex: 1,

    alignItems: "center",
  },

  hourglassTitle: {
    fontSize: 18,

    fontWeight: "900",

    marginBottom: 8,
  },

  /* =======================================================
     LIVE
  ======================================================= */

  liveHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 11,

    gap: 6,
  },

  liveTitle: {
    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "900",

    flex: 1,
  },

  liveBadge: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#E91D32",

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 20,
  },

  liveDot: {
    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor: "#FFFFFF",

    marginRight: 5,
  },

  liveText: {
    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "900",
  },

  /* =======================================================
     FLIP
  ======================================================= */

  flipTitle: {
    fontSize: 19,

    fontWeight: "900",

    textAlign: "center",

    marginBottom: 12,
  },

  flipRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "center",
  },

  flipColumn: {
    alignItems: "center",
  },

  flipCard: {
    width: 65,

    height: 59,

    borderRadius: 7,

    backgroundColor: "#19202C",

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity: 0.25,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  flipTop: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    height: "50%",

    backgroundColor: "#222B39",

    opacity: 0.7,
  },

  flipDivider: {
    position: "absolute",

    left: 0,

    right: 0,

    top: "50%",

    height: 1,

    backgroundColor: "#05070B",
  },

  flipValue: {
    color: "#FFFFFF",

    fontSize: 31,

    fontWeight: "900",

    zIndex: 2,
  },

  flipLabel: {
    marginTop: 5,

    color: "#1A2438",

    fontSize: 8,

    fontWeight: "800",
  },

  flipColon: {
    fontSize: 27,

    fontWeight: "900",

    color: "#182034",

    marginHorizontal: 5,

    marginTop: 12,
  },

  /* =======================================================
     PROGRESS
  ======================================================= */

  progressHeader: {
    flexDirection: "row",

    alignItems: "center",

    gap: 7,

    marginBottom: 13,
  },

  progressTitle: {
    fontSize: 18,

    fontWeight: "900",
  },

  progressTime: {
    fontSize: 17,

    fontWeight: "900",

    marginLeft: 3,
  },

  progressTrack: {
    width: "100%",

    height: 15,

    borderRadius: 8,

    backgroundColor: "#E0E5ED",

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    borderRadius: 8,
  },

  progressLabels: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 8,
  },

  progressLeft: {
    fontSize: 11,

    fontWeight: "800",
  },

  progressRight: {
    color: "#31558B",

    fontSize: 11,

    fontWeight: "700",
  },

  /* =======================================================
     MINIMAL
  ======================================================= */

  minimalCard: {
    borderWidth: 1.5,
  },

  minimalHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    marginBottom: 12,
  },

  minimalTitle: {
    fontSize: 19,

    fontWeight: "900",
  },

  /* =======================================================
     PILL
  ======================================================= */

  pillHeader: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    gap: 6,

    marginBottom: 10,
  },

  pillTitle: {
    fontSize: 18,

    fontWeight: "900",
  },

  pillTimerRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 9,
  },

  pillUnit: {
    minWidth: 70,

    height: 48,

    paddingHorizontal: 13,

    borderRadius: 25,

    alignItems: "center",

    justifyContent: "center",
  },

  pillValue: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "900",
  },

  /* =======================================================
     PRODUCT
  ======================================================= */

  productLayout: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
  },

  productLeft: {
    flex: 1,

    zIndex: 3,
  },

  productTitle: {
    color: "#FFFFFF",

    fontSize: 19,

    fontWeight: "900",

    marginBottom: 8,
  },

  productRight: {
    width: 105,

    height: 105,

    alignItems: "center",

    justifyContent: "center",
  },

  productImage: {
    width: 105,

    height: 105,
  },

  productEmoji: {
    fontSize: 76,
  },

  productDecoration: {
    position: "absolute",

    right: 7,

    top: 10,

    fontSize: 80,

    opacity: 0.9,

    zIndex: 1,
  },

  productCta: {
    alignSelf: "flex-start",

    marginTop: 5,

    paddingHorizontal: 13,

    paddingVertical: 6,

    borderRadius: 6,

    backgroundColor: "#FFE02D",

    transform: [
      {
        rotate: "-3deg",
      },
    ],
  },

  productCtaText: {
    color: "#171717",

    fontSize: 12,

    fontWeight: "900",
  },

  /* =======================================================
     DUAL
  ======================================================= */

  dualCard: {
    borderWidth: 0,
  },

  dualHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    marginBottom: 10,
  },

  dualTitle: {
    fontSize: 18,

    fontWeight: "900",
  },

  dualBody: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    backgroundColor: "rgba(255,255,255,0.75)",

    borderRadius: 10,

    paddingVertical: 10,
  },

  dualColumn: {
    flex: 1,

    alignItems: "center",
  },

  dualHeading: {
    color: "#17294C",

    fontSize: 10,

    fontWeight: "800",

    marginBottom: 4,
  },

  dualTime: {
    color: "#0F2347",

    fontSize: 21,

    fontWeight: "900",
  },

  dualLabels: {
    width: "72%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 2,

    color: "#324E70",

    fontSize: 8,
  },

  dualDivider: {
    width: 1,

    height: 65,

    backgroundColor: "#5D9BC6",
  },

  /* =======================================================
     CIRCULAR PROGRESS
  ======================================================= */

  circularProgressCard: {
    alignItems: "center",

    justifyContent: "center",
  },

  circularProgressContainer: {
    alignItems: "center",

    justifyContent: "center",
  },

  circularProgressInner: {
    alignItems: "center",

    justifyContent: "center",
  },

  circularEnds: {
    fontSize: 13,

    fontWeight: "900",

    marginBottom: 4,
  },

  circularTime: {
    fontSize: 23,

    fontWeight: "900",
  },

  circularRemaining: {
    marginTop: 3,

    fontSize: 9,

    fontWeight: "600",
  },

  /* =======================================================
     MODAL
  ======================================================= */

  modalRoot: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.72)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 16,
  },

  modalCenter: {
    width: "100%",

    maxWidth: 500,

    alignItems: "center",

    justifyContent: "center",
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export default UICountDown;

export {
  UICountDown,
  VARIANTS as UICountDownVariants,
  VARIANT_LABELS as UICountDownLabels,
  VARIANT_DESCRIPTIONS as UICountDownDescriptions,
};
