import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { runOnJS } from "react-native-worklets";

import { MaterialCommunityIcons } from "@expo/vector-icons";

/* =========================================================
   CONSTANTS
========================================================= */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TAU = Math.PI * 2;

const DEFAULT_SIZE = Math.min(SCREEN_WIDTH - 28, 390);

/* =========================================================
   ICON MAP
========================================================= */

const ICONS = {
  pizza: "pizza",
  burger: "hamburger",
  drink: "cup",
  fries: "food",
  dessert: "cake-variant",
  biryani: "food-variant",
  salad: "food-apple",
  veg: "leaf",
  gift: "gift",
  discount: "percent",
  delivery: "moped",
  voucher: "ticket-percent",
  retry: "close",
  free: "gift-outline",
  cake: "cake",
  combo: "food",
};

/* =========================================================
   VARIANTS
========================================================= */

const VARIANTS = {
  foodDiscount: {
    title: "Food Discount Wheel",
    subtitle: "Spin & Get Up to 50% OFF",
    centerColor: "#E51B23",

    segments: [
      {
        label: "50% OFF",
        icon: "discount",
        color: "#ED2632",
        textColor: "#FFFFFF",
      },
      {
        label: "30% OFF",
        icon: "pizza",
        color: "#FFE9A8",
        textColor: "#111111",
      },
      {
        label: "30% OFF",
        icon: "pizza",
        color: "#FFF0B7",
        textColor: "#111111",
      },
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#ED2632",
        textColor: "#FFFFFF",
      },
      {
        label: "10% OFF",
        icon: "gift",
        color: "#FFE7A1",
        textColor: "#111111",
      },
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#ED2632",
        textColor: "#FFFFFF",
      },
    ],
  },

  freeFood: {
    title: "Free Food Wheel",
    subtitle: "Win Free Dishes",
    centerColor: "#F59E00",

    segments: [
      {
        label: "Free Pizza",
        icon: "pizza",
        color: "#1B170F",
        textColor: "#FFFFFF",
      },
      {
        label: "Free Burger",
        icon: "burger",
        color: "#FFF0A7",
        textColor: "#111111",
      },
      {
        label: "Free Drink",
        icon: "drink",
        color: "#FFF0A7",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#FFF0A7",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "Free Drink",
        icon: "drink",
        color: "#FFF0A7",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#1B170F",
        textColor: "#FFFFFF",
        retry: true,
      },
    ],
  },

  deliveryPerks: {
    title: "Delivery Perks Wheel",
    subtitle: "Spin for Delivery Benefits",
    centerColor: "#079B42",

    segments: [
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E9F4A7",
        textColor: "#111111",
      },
      {
        label: "₹100 OFF",
        icon: "delivery",
        color: "#A2E36E",
        textColor: "#111111",
      },
      {
        label: "20% OFF",
        icon: "voucher",
        color: "#E8F2AE",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#D9EF9A",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "30% OFF",
        icon: "discount",
        color: "#079B42",
        textColor: "#FFFFFF",
      },
      {
        label: "₹50 OFF",
        icon: "voucher",
        color: "#079B42",
        textColor: "#FFFFFF",
      },
    ],
  },

  comboMeal: {
    title: "Combo Meal Wheel",
    subtitle: "Win Exciting Combos",
    centerColor: "#E75C00",

    segments: [
      {
        label: "Burger Combo",
        icon: "burger",
        color: "#31170A",
        textColor: "#FFFFFF",
      },
      {
        label: "Pizza Combo",
        icon: "pizza",
        color: "#FFE6A0",
        textColor: "#111111",
      },
      {
        label: "Biryani Combo",
        icon: "biryani",
        color: "#FFE7A2",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#FFE7A4",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "Dessert Combo",
        icon: "dessert",
        color: "#451B0A",
        textColor: "#FFFFFF",
      },
      {
        label: "Dessert Combo",
        icon: "dessert",
        color: "#FFF0B0",
        textColor: "#111111",
      },
    ],
  },

  restaurantVouchers: {
    title: "Restaurant Vouchers",
    subtitle: "Get Vouchers from Top Brands",
    centerColor: "#7C16C8",

    segments: [
      {
        label: "zomato",
        icon: "gift",
        color: "#E92863",
        textColor: "#FFFFFF",
      },
      {
        label: "swiggy",
        icon: "gift",
        color: "#FF5C44",
        textColor: "#FFFFFF",
      },
      {
        label: "KFC",
        icon: "burger",
        color: "#FFFFFF",
        textColor: "#111111",
      },
      {
        label: "Domino's",
        icon: "pizza",
        color: "#204FC2",
        textColor: "#FFFFFF",
      },
      {
        label: "₹200 OFF",
        icon: "voucher",
        color: "#FFFFFF",
        textColor: "#111111",
      },
      {
        label: "Voucher",
        icon: "gift",
        color: "#D72A6B",
        textColor: "#FFFFFF",
      },
    ],
  },

  foodieSurprise: {
    title: "Foodie Surprise",
    subtitle: "Spin & Discover",
    centerColor: "#C50B94",

    segments: [
      {
        label: "Mystery Dish",
        icon: "dessert",
        color: "#6E1DC0",
        textColor: "#FFFFFF",
      },
      {
        label: "Surprise Dessert",
        icon: "dessert",
        color: "#F238C3",
        textColor: "#FFFFFF",
      },
      {
        label: "Free Drink",
        icon: "drink",
        color: "#7731D2",
        textColor: "#FFFFFF",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#6718A8",
        textColor: "#FFFFFF",
        retry: true,
      },
      {
        label: "50% OFF",
        icon: "discount",
        color: "#9B15D2",
        textColor: "#FFFFFF",
      },
      {
        label: "Surprise Deal",
        icon: "gift",
        color: "#EE2CB4",
        textColor: "#FFFFFF",
      },
    ],
  },

  healthyEats: {
    title: "Healthy Eats Wheel",
    subtitle: "Win Healthy Rewards",
    centerColor: "#0AA44A",

    segments: [
      {
        label: "Free Salad",
        icon: "salad",
        color: "#E9F4B2",
        textColor: "#111111",
      },
      {
        label: "Veg Combo",
        icon: "veg",
        color: "#D8F19C",
        textColor: "#111111",
      },
      {
        label: "10% OFF",
        icon: "veg",
        color: "#E8F5B0",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#D7EF99",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "20% OFF",
        icon: "gift",
        color: "#9EE56D",
        textColor: "#111111",
      },
      {
        label: "Free Salad",
        icon: "salad",
        color: "#E5F1A9",
        textColor: "#111111",
      },
    ],
  },

  lateNight: {
    title: "Late Night Cravings",
    subtitle: "Spin for Night Deals",
    centerColor: "#141B6A",

    segments: [
      {
        label: "50% OFF",
        icon: "drink",
        color: "#111B63",
        textColor: "#FFFFFF",
      },
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#171D68",
        textColor: "#FFFFFF",
      },
      {
        label: "Free Burger",
        icon: "fries",
        color: "#252670",
        textColor: "#FFFFFF",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#171B5D",
        textColor: "#FFFFFF",
        retry: true,
      },
      {
        label: "₹100 OFF",
        icon: "voucher",
        color: "#22266D",
        textColor: "#FFFFFF",
      },
      {
        label: "Midnight Deal",
        icon: "drink",
        color: "#111752",
        textColor: "#FFFFFF",
      },
    ],
  },

  firstOrder: {
    title: "First Order Special",
    subtitle: "Exclusive for New Users",
    centerColor: "#079B48",

    segments: [
      {
        label: "₹100 OFF",
        icon: "voucher",
        color: "#F0E7A3",
        textColor: "#111111",
      },
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E6EFB0",
        textColor: "#111111",
      },
      {
        label: "Free Dessert",
        icon: "dessert",
        color: "#D8F0A2",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#A4E4B4",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "30% OFF",
        icon: "voucher",
        color: "#0CAC79",
        textColor: "#FFFFFF",
      },
      {
        label: "50% OFF",
        icon: "discount",
        color: "#08A4C7",
        textColor: "#FFFFFF",
      },
    ],
  },

  festivalFeast: {
    title: "Festival Feast",
    subtitle: "Celebrate with Great Food",
    centerColor: "#E77700",

    segments: [
      {
        label: "Free Biryani",
        icon: "biryani",
        color: "#FFF0AF",
        textColor: "#111111",
      },
      {
        label: "Free Pizza",
        icon: "pizza",
        color: "#FFE6A0",
        textColor: "#111111",
      },
      {
        label: "₹200 OFF",
        icon: "voucher",
        color: "#FFE7A1",
        textColor: "#111111",
      },
      {
        label: "Try Again",
        icon: "retry",
        color: "#FFF0B0",
        textColor: "#111111",
        retry: true,
      },
      {
        label: "Free Drink",
        icon: "drink",
        color: "#E73B16",
        textColor: "#FFFFFF",
      },
      {
        label: "Free Offer",
        icon: "gift",
        color: "#E93B17",
        textColor: "#FFFFFF",
      },
    ],
  },
};

/* =========================================================
   ICON
========================================================= */

const WheelIcon = ({ name, size = 28, color = "#FFFFFF" }) => {
  return (
    <MaterialCommunityIcons
      name={ICONS[name] || name || "gift-outline"}
      size={size}
      color={color}
    />
  );
};

/* =========================================================
   POLAR
========================================================= */

const polarToCartesian = (cx, cy, radius, angle) => {
  return {
    x: cx + radius * Math.cos(angle),

    y: cy + radius * Math.sin(angle),
  };
};

/* =========================================================
   ARC
========================================================= */

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, startAngle);

  const end = polarToCartesian(cx, cy, radius, endAngle);

  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

/* =========================================================
   NORMALIZE
========================================================= */

const normalizeAngle = (angle) => {
  const value = angle % TAU;

  return value < 0 ? value + TAU : value;
};

/* =========================================================
   WHEEL SVG
========================================================= */

const WheelGraphic = ({ size, segments, centerColor, disabled }) => {
  const center = size / 2;

  const outerRadius = size / 2 - 18;

  const centerRadius = size * 0.2;

  const segmentAngle = TAU / segments.length;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="wheelGoldGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFF6A4" />

          <Stop offset="0.3" stopColor="#FFB300" />

          <Stop offset="0.6" stopColor="#FFF3A0" />

          <Stop offset="1" stopColor="#FF7A00" />
        </LinearGradient>
      </Defs>

      {/* Outer golden ring */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius + 9}
        fill="none"
        stroke="url(#wheelGoldGradient)"
        strokeWidth={12}
      />

      {/* Wheel segments */}
      {segments.map((segment, index) => {
        const start = -Math.PI / 2 + index * segmentAngle;

        const end = start + segmentAngle;

        return (
          <Path
            key={`segment-${index}`}
            d={describeArc(center, center, outerRadius, start, end)}
            fill={segment.color || "#FFFFFF"}
            stroke="#FFFFFF"
            strokeWidth={1.3}
            opacity={disabled ? 0.55 : 1}
          />
        );
      })}

      {/* Segment lines */}
      {segments.map((_, index) => {
        const angle = -Math.PI / 2 + index * segmentAngle;

        const point = polarToCartesian(center, center, outerRadius, angle);

        return (
          <Path
            key={`line-${index}`}
            d={`M ${center} ${center} L ${point.x} ${point.y}`}
            stroke="#FFFFFF"
            strokeWidth={1}
            opacity={0.9}
          />
        );
      })}

      {/* Inner ring */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius - 5}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.65}
      />

      {/* Center outer ring */}
      <Circle cx={center} cy={center} r={centerRadius + 14} fill="#FFFFFF" />

      {/* Center button */}
      <Circle
        cx={center}
        cy={center}
        r={centerRadius + 10}
        fill={centerColor}
        stroke="#FFD96A"
        strokeWidth={2}
        opacity={disabled ? 0.6 : 1}
      />

      <Circle
        cx={center}
        cy={center}
        r={centerRadius}
        fill={centerColor}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth={2}
      />

      <SvgText
        x={center}
        y={center + 6}
        fill="#FFFFFF"
        fontSize={size * 0.075}
        fontWeight="900"
        textAnchor="middle"
      >
        SPIN
      </SvgText>
    </Svg>
  );
};

/* =========================================================
   SEGMENT ICONS
========================================================= */

const SegmentIcons = ({ size, segments }) => {
  const center = size / 2;

  const outerRadius = size / 2 - 18;

  const segmentAngle = TAU / segments.length;

  const iconRadius = outerRadius * 0.62;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {segments.map((segment, index) => {
        const middle = -Math.PI / 2 + index * segmentAngle + segmentAngle / 2;

        const position = polarToCartesian(center, center, iconRadius, middle);

        return (
          <View
            key={`icon-${index}`}
            style={[
              styles.segmentIcon,
              {
                left: position.x - 24,

                top: position.y - 24,
              },
            ]}
          >
            {segment.image ? (
              <Image
                source={segment.image}
                resizeMode="contain"
                style={styles.segmentImage}
              />
            ) : (
              <WheelIcon
                name={segment.icon}
                size={28}
                color={segment.iconColor || segment.textColor || "#FFFFFF"}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

/* =========================================================
   SEGMENT TEXT
========================================================= */

const SegmentLabels = ({ size, segments }) => {
  const center = size / 2;

  const outerRadius = size / 2 - 18;

  const segmentAngle = TAU / segments.length;

  const textRadius = outerRadius * 0.82;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {segments.map((segment, index) => {
        const middle = -Math.PI / 2 + index * segmentAngle + segmentAngle / 2;

        const position = polarToCartesian(center, center, textRadius, middle);

        const maxWidth = segment.label.length > 14 ? 65 : 82;

        return (
          <View
            key={`label-${index}`}
            style={[
              styles.segmentLabel,
              {
                left: position.x - maxWidth / 2,

                top: position.y - 10,

                width: maxWidth,
              },
            ]}
          >
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[
                styles.segmentLabelText,
                {
                  color: segment.textColor || "#FFFFFF",
                },
              ]}
            >
              {segment.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

/* =========================================================
   POINTER
========================================================= */

const WheelPointer = ({ color = "#E5232A" }) => {
  return (
    <View pointerEvents="none" style={styles.pointer}>
      <View
        style={[
          styles.pointerTriangle,
          {
            borderTopColor: color,
          },
        ]}
      />

      <View
        style={[
          styles.pointerBody,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UISpinWheel = forwardRef(
  (
    {
      visible = false,

      onClose,

      variant = "foodDiscount",

      size = DEFAULT_SIZE,

      segments,

      title,

      subtitle,

      centerColor,

      pointerColor,

      spinDuration = 4200,

      spinTurns = 7,

      disabled = false,

      reanimated = true,

      closeOnBackdropPress = true,

      onSpinStart,

      onSpinEnd,

      onResult,

      onProgress,

      cardStyle,

      modalStyle,

      titleStyle,

      subtitleStyle,

      rewardStyle,

      children,
    },
    ref,
  ) => {
    const selectedVariant = VARIANTS[variant] || VARIANTS.foodDiscount;

    const finalSegments = segments || selectedVariant.segments;

    const finalTitle = title || selectedVariant.title;

    const finalSubtitle = subtitle || selectedVariant.subtitle;

    const finalCenterColor = centerColor || selectedVariant.centerColor;

    const finalPointerColor = pointerColor || "#E5232A";

    const [isSpinning, setIsSpinning] = useState(false);

    const [result, setResult] = useState(null);

    const rotation = useSharedValue(0);

    const scale = useSharedValue(1);

    const currentRotationRef = useRef(0);

    /* =====================================================
       RESULT INDEX
    ===================================================== */

    const getResultIndex = useCallback(
      (finalRotation) => {
        const segmentAngle = TAU / finalSegments.length;

        /*
         * The pointer is located at
         * -PI / 2.
         */

        const pointerAngle = -Math.PI / 2;

        /*
         * Convert pointer angle into
         * wheel-local coordinates.
         */

        const localAngle = normalizeAngle(pointerAngle - finalRotation);

        /*
         * Convert to segment index.
         */

        let index = Math.floor(
          normalizeAngle(localAngle + Math.PI / 2) / segmentAngle,
        );

        index = index % finalSegments.length;

        return index;
      },
      [finalSegments.length],
    );

    /* =====================================================
       FINISH SPIN
       
       IMPORTANT:
       This is a normal JavaScript function.

       It contains all React state updates.

       It is called through runOnJS() from
       the Reanimated worklet.
    ===================================================== */

    const finishSpin = useCallback(
      (finalRotation) => {
        currentRotationRef.current = finalRotation;

        setIsSpinning(false);

        const actualIndex = getResultIndex(finalRotation);

        const selected = finalSegments[actualIndex];

        setResult({
          index: actualIndex,
          segment: selected,
        });

        if (onProgress) {
          onProgress(1);
        }

        if (onSpinEnd) {
          onSpinEnd({
            index: actualIndex,
            segment: selected,
          });
        }

        if (onResult) {
          onResult(selected, actualIndex);
        }
      },
      [finalSegments, getResultIndex, onProgress, onResult, onSpinEnd],
    );

    /* =====================================================
       SPIN
    ===================================================== */

    const spin = useCallback(
      (forcedIndex = null) => {
        if (disabled || isSpinning || !finalSegments.length) {
          return;
        }

        let resultIndex = forcedIndex;

        if (resultIndex === null || resultIndex === undefined) {
          resultIndex = Math.floor(Math.random() * finalSegments.length);
        }

        resultIndex = Math.max(
          0,
          Math.min(resultIndex, finalSegments.length - 1),
        );

        const segmentAngle = TAU / finalSegments.length;

        /*
         * Center angle of selected segment.
         */
        const selectedSegmentCenter =
          -Math.PI / 2 + resultIndex * segmentAngle + segmentAngle / 2;

        /*
         * We want the selected segment
         * center to arrive underneath
         * the pointer.
         */
        const desiredRotation = -Math.PI / 2 - selectedSegmentCenter;

        const currentRotation = currentRotationRef.current;

        const normalizedCurrent = normalizeAngle(currentRotation);

        const normalizedDesired = normalizeAngle(desiredRotation);

        let delta = normalizedDesired - normalizedCurrent;

        if (delta < 0) {
          delta += TAU;
        }

        /*
         * Full rotations + final segment
         * alignment.
         */
        const targetRotation = currentRotation + spinTurns * TAU + delta;

        setIsSpinning(true);

        setResult(null);

        if (onProgress) {
          onProgress(0);
        }

        if (onSpinStart) {
          onSpinStart({
            index: resultIndex,

            segment: finalSegments[resultIndex],
          });
        }

        if (reanimated) {
          scale.value = withSequence(
            withTiming(1.025, {
              duration: 150,
            }),

            withSpring(1, {
              damping: 10,
              stiffness: 150,
            }),
          );
        }

        /*
         * IMPORTANT:
         *
         * The completion callback runs
         * on the UI/Worklet runtime.
         *
         * DO NOT call setState() here.
         *
         * Use runOnJS().
         */

        rotation.value = withTiming(
          targetRotation,
          {
            duration: spinDuration,
          },
          (finished) => {
            if (!finished) {
              return;
            }

            runOnJS(finishSpin)(targetRotation);
          },
        );
      },
      [
        disabled,
        finalSegments,
        finishSpin,
        isSpinning,
        onProgress,
        onSpinStart,
        reanimated,
        rotation,
        scale,
        spinDuration,
        spinTurns,
      ],
    );

    /* =====================================================
       RESET
    ===================================================== */

    const reset = useCallback(() => {
      rotation.value = 0;

      currentRotationRef.current = 0;

      setIsSpinning(false);

      setResult(null);

      scale.value = 1;

      if (onProgress) {
        onProgress(0);
      }
    }, [onProgress, rotation, scale]);

    /* =====================================================
       REF API
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        spin,

        reset,

        getResult: () => result,

        isSpinning,

        result,
      }),
      [isSpinning, reset, result, spin],
    );

    /* =====================================================
       ANIMATED STYLE
    ===================================================== */

    const wheelAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            rotate: `${rotation.value}rad`,
          },

          {
            scale: scale.value,
          },
        ],
      };
    });

    /* =====================================================
       PRESS
    ===================================================== */

    const handleSpinPress = useCallback(() => {
      if (disabled || isSpinning) {
        return;
      }

      spin();
    }, [disabled, isSpinning, spin]);

    /* =====================================================
       RESULT
    ===================================================== */

    const resultSegment = result?.segment;

    /* =====================================================
       RENDER
    ===================================================== */

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={[styles.modalRoot, modalStyle]}>
          {/* =================================================
              BACKDROP
          ================================================= */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (closeOnBackdropPress && !isSpinning && onClose) {
                onClose();
              }
            }}
          />

          {/* =================================================
              DIALOG
          ================================================= */}

          <View style={styles.modalCenter}>
            <View style={[styles.dialog, cardStyle]}>
              {/* =================================================
                  CLOSE BUTTON
              ================================================= */}

              {onClose ? (
                <Pressable
                  disabled={isSpinning}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={23}
                    color="#FFFFFF"
                  />
                </Pressable>
              ) : null}

              {/* =================================================
                  TITLE
              ================================================= */}

              <Text style={[styles.modalTitle, titleStyle]}>{finalTitle}</Text>

              <Text style={[styles.modalSubtitle, subtitleStyle]}>
                {finalSubtitle}
              </Text>

              {/* =================================================
                  WHEEL
              ================================================= */}

              <View
                style={[
                  styles.wheelArea,
                  {
                    width: size,
                    height: size,
                  },
                ]}
              >
                {/* Glow */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.wheelGlow,
                    {
                      width: size - 2,

                      height: size - 2,

                      borderRadius: size / 2,
                    },
                  ]}
                />

                {/* Rotating wheel */}
                <Animated.View
                  style={[
                    styles.wheel,
                    {
                      width: size,
                      height: size,
                    },

                    wheelAnimatedStyle,
                  ]}
                >
                  <WheelGraphic
                    size={size}
                    segments={finalSegments}
                    centerColor={finalCenterColor}
                    disabled={disabled || isSpinning}
                  />

                  {/*
                    Icons and labels are inside the
                    same rotating container, so they
                    remain attached to their segment.
                  */}

                  <SegmentIcons size={size} segments={finalSegments} />

                  <SegmentLabels size={size} segments={finalSegments} />
                </Animated.View>

                {/* Fixed pointer */}
                <WheelPointer color={finalPointerColor} />
              </View>

              {/* =================================================
                  SPIN BUTTON
              ================================================= */}

              <Pressable
                disabled={disabled || isSpinning}
                onPress={handleSpinPress}
                style={[
                  styles.spinButton,
                  {
                    backgroundColor: finalCenterColor,
                  },

                  (disabled || isSpinning) && styles.spinButtonDisabled,
                ]}
              >
                <MaterialCommunityIcons
                  name="rotate-right"
                  size={23}
                  color="#FFFFFF"
                />

                <Text style={styles.spinButtonText}>
                  {isSpinning ? "SPINNING..." : "SPIN NOW"}
                </Text>
              </Pressable>

              {/* =================================================
                  RESULT
              ================================================= */}

              {result ? (
                <View style={[styles.resultCard, rewardStyle]}>
                  <View style={styles.resultIcon}>
                    {resultSegment?.image ? (
                      <Image
                        source={resultSegment.image}
                        resizeMode="contain"
                        style={styles.resultImage}
                      />
                    ) : (
                      <WheelIcon
                        name={resultSegment?.icon || "gift"}
                        size={27}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <View style={styles.resultText}>
                    <Text style={styles.resultWon}>YOU WON</Text>

                    <Text style={styles.resultValue}>
                      {resultSegment?.label}
                    </Text>
                  </View>
                </View>
              ) : null}

              {children}
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

UISpinWheel.displayName = "UISpinWheel";

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     MODAL
  ======================================================= */

  modalRoot: {
    flex: 1,

    backgroundColor: "rgba(0, 0, 0, 0.78)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 12,
  },

  modalCenter: {
    width: "100%",

    alignItems: "center",

    justifyContent: "center",
  },

  dialog: {
    width: "100%",

    maxWidth: 430,

    alignItems: "center",

    justifyContent: "center",

    paddingTop: 24,

    paddingBottom: 24,

    paddingHorizontal: 10,

    borderRadius: 28,

    backgroundColor: "#0D1017",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.13)",

    overflow: "hidden",
  },

  /* =======================================================
     CLOSE
  ======================================================= */

  closeButton: {
    position: "absolute",

    top: 12,

    right: 12,

    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.10)",

    zIndex: 100,
  },

  /* =======================================================
     TITLE
  ======================================================= */

  modalTitle: {
    paddingHorizontal: 48,

    color: "#FFFFFF",

    fontSize: 25,

    lineHeight: 31,

    fontWeight: "900",

    textAlign: "center",
  },

  modalSubtitle: {
    marginTop: 4,

    paddingHorizontal: 25,

    color: "#AEB5C5",

    fontSize: 14,

    lineHeight: 20,

    fontWeight: "600",

    textAlign: "center",
  },

  /* =======================================================
     WHEEL
  ======================================================= */

  wheelArea: {
    marginTop: 17,

    alignItems: "center",

    justifyContent: "center",

    position: "relative",
  },

  wheel: {
    position: "absolute",

    alignItems: "center",

    justifyContent: "center",
  },

  wheelGlow: {
    position: "absolute",

    backgroundColor: "rgba(255,190,35,0.07)",

    borderWidth: 9,

    borderColor: "rgba(255,190,35,0.18)",

    shadowOpacity: 0.8,

    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 15,
  },

  /* =======================================================
     ICONS
  ======================================================= */

  segmentIcon: {
    position: "absolute",

    width: 48,

    height: 48,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 24,
  },

  segmentImage: {
    width: 42,

    height: 42,
  },

  /* =======================================================
     LABELS
  ======================================================= */

  segmentLabel: {
    position: "absolute",

    minHeight: 22,

    alignItems: "center",

    justifyContent: "center",
  },

  segmentLabelText: {
    fontSize: 11,

    lineHeight: 13,

    fontWeight: "900",

    textAlign: "center",
  },

  /* =======================================================
     POINTER
  ======================================================= */

  pointer: {
    position: "absolute",

    top: -13,

    width: 48,

    height: 70,

    alignItems: "center",

    justifyContent: "flex-start",

    zIndex: 50,
  },

  pointerBody: {
    width: 48,

    height: 58,

    borderRadius: 2,

    marginTop: 0,

    elevation: 8,
  },

  pointerTriangle: {
    position: "absolute",

    bottom: 0,

    width: 0,

    height: 0,

    borderLeftWidth: 12,

    borderRightWidth: 12,

    borderTopWidth: 18,

    borderLeftColor: "transparent",

    borderRightColor: "transparent",

    zIndex: 2,
  },

  /* =======================================================
     SPIN BUTTON
  ======================================================= */

  spinButton: {
    marginTop: 17,

    minWidth: 175,

    height: 52,

    paddingHorizontal: 25,

    borderRadius: 27,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,

    borderWidth: 2,

    borderColor: "rgba(255,255,255,0.32)",

    elevation: 6,
  },

  spinButtonDisabled: {
    opacity: 0.55,
  },

  spinButtonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "900",

    letterSpacing: 0.4,
  },

  /* =======================================================
     RESULT
  ======================================================= */

  resultCard: {
    marginTop: 15,

    minWidth: 230,

    maxWidth: "92%",

    minHeight: 68,

    paddingHorizontal: 14,

    paddingVertical: 9,

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 2,

    borderColor: "#FFD43B",
  },

  resultIcon: {
    width: 47,

    height: 47,

    borderRadius: 24,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#F3B600",
  },

  resultImage: {
    width: 34,

    height: 34,
  },

  resultText: {
    flex: 1,

    marginLeft: 10,
  },

  resultWon: {
    color: "#555555",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1,
  },

  resultValue: {
    marginTop: 1,

    color: "#E12626",

    fontSize: 18,

    fontWeight: "900",
  },
});

/* =========================================================
   EXPORT
========================================================= */

export default UISpinWheel;

export {
  UISpinWheel,
  VARIANTS as UISpinWheelVariants,
  ICONS as UISpinWheelIcons,
};
