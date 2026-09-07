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
  Polygon,
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

import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   CONSTANTS
========================================================= */

const TAU = Math.PI * 2;

const DEFAULT_SIZE = Math.min(SCREEN_WIDTH - 28, 390);

const CENTER_BUTTON_RATIO = 0.2;

const DEFAULT_SEGMENT_COUNT = 6;

/* =========================================================
   HELPER
========================================================= */

const polarToCartesian = (cx, cy, radius, angle) => {
  return {
    x: cx + radius * Math.cos(angle),

    y: cy + radius * Math.sin(angle),
  };
};

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

const normalizeAngle = (angle) => {
  const normalized = angle % TAU;

  return normalized < 0 ? normalized + TAU : normalized;
};

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
   DEFAULT VARIANTS
========================================================= */

const VARIANTS = {
  foodDiscount: {
    title: "Food Discount Wheel",
    subtitle: "Spin & Get Up to 50% OFF",

    centerColor: "#E51B23",

    outerColors: ["#F52B2B", "#FF8C00", "#FFD43B"],

    segments: [
      {
        label: "50% OFF",
        icon: "discount",
        color: "#E71D2B",
        textColor: "#FFFFFF",
      },

      {
        label: "30% OFF",
        icon: "pizza",
        color: "#FFF0B0",
        textColor: "#111111",
      },

      {
        label: "30% OFF",
        icon: "pizza",
        color: "#FFE6A0",
        textColor: "#111111",
      },

      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E72B31",
        textColor: "#FFFFFF",
      },

      {
        label: "10% OFF",
        icon: "gift",
        color: "#FFE9A6",
        textColor: "#111111",
      },

      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E92B32",
        textColor: "#FFFFFF",
      },
    ],
  },

  freeFood: {
    title: "Free Food Wheel",
    subtitle: "Win Free Dishes",

    centerColor: "#FF9D00",

    outerColors: ["#FFB400", "#FFF0A0", "#FF7A00"],

    segments: [
      {
        label: "Free Pizza",
        icon: "pizza",
        color: "#171717",
        textColor: "#FFFFFF",
      },

      {
        label: "Free Burger",
        icon: "burger",
        color: "#FFF0A0",
        textColor: "#111111",
      },

      {
        label: "Free Drink",
        icon: "drink",
        color: "#FFF0A0",
        textColor: "#111111",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#FFF0A0",
        textColor: "#111111",
        retry: true,
      },

      {
        label: "Free Drink",
        icon: "drink",
        color: "#FFF0A0",
        textColor: "#111111",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#171717",
        textColor: "#FFFFFF",
        retry: true,
      },
    ],
  },

  deliveryPerks: {
    title: "Delivery Perks Wheel",
    subtitle: "Spin for Delivery Benefits",

    centerColor: "#099B43",

    outerColors: ["#00C94F", "#75E34B", "#00A84B"],

    segments: [
      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E9F4A9",
        textColor: "#111111",
      },

      {
        label: "₹100 OFF",
        icon: "delivery",
        color: "#9BE36A",
        textColor: "#111111",
      },

      {
        label: "20% OFF",
        icon: "voucher",
        color: "#E8F4B0",
        textColor: "#111111",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#DDF0A2",
        textColor: "#111111",
        retry: true,
      },

      {
        label: "30% OFF",
        icon: "discount",
        color: "#0AA747",
        textColor: "#FFFFFF",
      },

      {
        label: "₹50 OFF",
        icon: "voucher",
        color: "#0AA747",
        textColor: "#FFFFFF",
      },
    ],
  },

  comboMeal: {
    title: "Combo Meal Wheel",
    subtitle: "Win Exciting Combos",

    centerColor: "#E85A00",

    outerColors: ["#FFB000", "#FF6B00", "#FFD34E"],

    segments: [
      {
        label: "Burger Combo",
        icon: "burger",
        color: "#2C1307",
        textColor: "#FFFFFF",
      },

      {
        label: "Pizza Combo",
        icon: "pizza",
        color: "#FFE5A0",
        textColor: "#111111",
      },

      {
        label: "Biryani Combo",
        icon: "biryani",
        color: "#FFE8A5",
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
        color: "#42170A",
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

    centerColor: "#7A16C8",

    outerColors: ["#E029FF", "#7523F3", "#B117D6"],

    segments: [
      {
        label: "zomato",
        icon: "gift",
        color: "#E82963",
        textColor: "#FFFFFF",
      },

      {
        label: "swiggy",
        icon: "gift",
        color: "#FF5A43",
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
        color: "#1B4CBF",
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
        color: "#D92869",
        textColor: "#FFFFFF",
      },
    ],
  },

  foodieSurprise: {
    title: "Foodie Surprise",
    subtitle: "Spin & Discover",

    centerColor: "#C50B94",

    outerColors: ["#FF3BC8", "#8A19DC", "#D214B8"],

    segments: [
      {
        label: "Mystery Dish",
        icon: "dessert",
        color: "#6C1BBD",
        textColor: "#FFFFFF",
      },

      {
        label: "Surprise Dessert",
        icon: "dessert",
        color: "#F43CC6",
        textColor: "#FFFFFF",
      },

      {
        label: "Free Drink",
        icon: "drink",
        color: "#7732D7",
        textColor: "#FFFFFF",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#6819A8",
        textColor: "#FFFFFF",
        retry: true,
      },

      {
        label: "50% OFF",
        icon: "discount",
        color: "#9D13D5",
        textColor: "#FFFFFF",
      },

      {
        label: "Surprise Deal",
        icon: "gift",
        color: "#F02AB5",
        textColor: "#FFFFFF",
      },
    ],
  },

  healthyEats: {
    title: "Healthy Eats Wheel",
    subtitle: "Win Healthy Rewards",

    centerColor: "#0AA64A",

    outerColors: ["#00C84A", "#7CE35B", "#00A93E"],

    segments: [
      {
        label: "Free Salad",
        icon: "salad",
        color: "#E9F5B4",
        textColor: "#111111",
      },

      {
        label: "Veg Combo",
        icon: "veg",
        color: "#D9F19B",
        textColor: "#111111",
      },

      {
        label: "10% OFF",
        icon: "veg",
        color: "#E9F6B2",
        textColor: "#111111",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#D6EF9A",
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
        color: "#E7F3AE",
        textColor: "#111111",
      },
    ],
  },

  lateNight: {
    title: "Late Night Cravings",
    subtitle: "Spin for Night Deals",

    centerColor: "#111A6B",

    outerColors: ["#142169", "#31378C", "#10164E"],

    segments: [
      {
        label: "50% OFF",
        icon: "drink",
        color: "#111B64",
        textColor: "#FFFFFF",
      },

      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#171C67",
        textColor: "#FFFFFF",
      },

      {
        label: "Free Burger",
        icon: "fries",
        color: "#24256F",
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
        color: "#22256C",
        textColor: "#FFFFFF",
      },

      {
        label: "Midnight Deal",
        icon: "drink",
        color: "#101752",
        textColor: "#FFFFFF",
      },
    ],
  },

  firstOrder: {
    title: "First Order Special",
    subtitle: "Exclusive for New Users",

    centerColor: "#079C48",

    outerColors: ["#00C9D8", "#65E9D9", "#00A7C7"],

    segments: [
      {
        label: "₹100 OFF",
        icon: "voucher",
        color: "#F1E8A4",
        textColor: "#111111",
      },

      {
        label: "Free Delivery",
        icon: "delivery",
        color: "#E8F0B1",
        textColor: "#111111",
      },

      {
        label: "Free Dessert",
        icon: "dessert",
        color: "#D9F1A4",
        textColor: "#111111",
      },

      {
        label: "Try Again",
        icon: "retry",
        color: "#A6E4B4",
        textColor: "#111111",
        retry: true,
      },

      {
        label: "30% OFF",
        icon: "voucher",
        color: "#0DAF7D",
        textColor: "#FFFFFF",
      },

      {
        label: "50% OFF",
        icon: "discount",
        color: "#08A5C8",
        textColor: "#FFFFFF",
      },
    ],
  },

  festivalFeast: {
    title: "Festival Feast",
    subtitle: "Celebrate with Great Food",

    centerColor: "#E87700",

    outerColors: ["#FFAA00", "#FF4B00", "#FFD447"],

    segments: [
      {
        label: "Free Biryani",
        icon: "biryani",
        color: "#FFF0B0",
        textColor: "#111111",
      },

      {
        label: "Free Pizza",
        icon: "pizza",
        color: "#FFE7A1",
        textColor: "#111111",
      },

      {
        label: "₹200 OFF",
        icon: "voucher",
        color: "#FFE8A2",
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
   ICON COMPONENT
========================================================= */

const WheelIcon = ({ name, size = 28, color = "#FFFFFF" }) => {
  const iconName = ICONS[name] || name || "gift-outline";

  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
};

/* =========================================================
   WHEEL SVG
========================================================= */

const WheelGraphic = ({ size, segments, rotation, centerColor, disabled }) => {
  const center = size / 2;

  const outerRadius = size / 2 - 18;

  const innerRadius = size * CENTER_BUTTON_RATIO;

  const segmentAngle = TAU / segments.length;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="wheelGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFF5A0" />

          <Stop offset="0.35" stopColor="#FFB300" />

          <Stop offset="0.65" stopColor="#FFF6A4" />

          <Stop offset="1" stopColor="#FF7A00" />
        </LinearGradient>

        <LinearGradient id="wheelPurple" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF62E7" />

          <Stop offset="0.5" stopColor="#A517D8" />

          <Stop offset="1" stopColor="#5B16C9" />
        </LinearGradient>
      </Defs>

      {/* Outer glow ring */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius + 9}
        fill="none"
        stroke="url(#wheelGold)"
        strokeWidth={12}
      />

      {/* Main wheel */}
      <G rotation={(rotation * 180) / Math.PI} origin={`${center}, ${center}`}>
        {segments.map((segment, index) => {
          const start = -Math.PI / 2 + index * segmentAngle;

          const end = start + segmentAngle;

          const middle = start + segmentAngle / 2;

          const iconRadius = outerRadius * 0.62;

          const textRadius = outerRadius * 0.78;

          const iconPosition = polarToCartesian(
            center,
            center,
            iconRadius,
            middle,
          );

          const textPosition = polarToCartesian(
            center,
            center,
            textRadius,
            middle,
          );

          return (
            <G key={index}>
              <Path
                d={describeArc(center, center, outerRadius, start, end)}
                fill={segment.color || "#FFFFFF"}
                stroke="#FFFFFF"
                strokeWidth={1.2}
              />

              {/* Segment separator */}
              <Path
                d={`M ${center} ${center} L ${
                  polarToCartesian(center, center, outerRadius, start).x
                } ${polarToCartesian(center, center, outerRadius, start).y}`}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={1}
              />

              {/* Icon circle */}
              <Circle
                cx={iconPosition.x}
                cy={iconPosition.y}
                r={24}
                fill="rgba(255,255,255,0.12)"
              />

              {/* Text */}
              <SvgText
                x={textPosition.x}
                y={textPosition.y}
                fill={segment.textColor || "#FFFFFF"}
                fontSize={segment.label.length > 13 ? 10 : 12}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {segment.label}
              </SvgText>
            </G>
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
      </G>

      {/* Center outer ring */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius + 13}
        fill="#FFFFFF"
        opacity={0.9}
      />

      {/* Center button */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius + 9}
        fill={centerColor}
        stroke="#FFDD6B"
        strokeWidth={2}
        opacity={disabled ? 0.55 : 1}
      />

      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill={centerColor}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={2}
      />

      <SvgText
        x={center}
        y={center + 5}
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
   SEGMENT OVERLAY
========================================================= */

const SegmentIcons = ({ size, segments, rotation }) => {
  const center = size / 2;

  const outerRadius = size / 2 - 18;

  const segmentAngle = TAU / segments.length;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            {
              rotate: `${rotation}rad`,
            },
          ],
        },
      ]}
    >
      {segments.map((segment, index) => {
        const middle = -Math.PI / 2 + index * segmentAngle + segmentAngle / 2;

        const iconRadius = outerRadius * 0.62;

        const x = center + Math.cos(middle) * iconRadius;

        const y = center + Math.sin(middle) * iconRadius;

        return (
          <View
            key={index}
            style={[
              styles.segmentIcon,
              {
                left: x - 24,
                top: y - 24,
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
   POINTER
========================================================= */

const WheelPointer = ({ color = "#E3262E" }) => {
  return (
    <View pointerEvents="none" style={styles.pointerContainer}>
      <View
        style={[
          styles.pointerPin,
          {
            backgroundColor: color,
          },
        ]}
      >
        <MaterialCommunityIcons name="map-marker" size={42} color={color} />
      </View>
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

    const finalPointerColor =
      pointerColor || selectedVariant.outerColors?.[0] || "#E3262E";

    const [isSpinning, setIsSpinning] = useState(false);

    const [result, setResult] = useState(null);

    const rotation = useSharedValue(0);

    const progress = useSharedValue(0);

    const scale = useSharedValue(1);

    const currentRotationRef = useRef(0);

    /* =====================================================
       RESULT
    ===================================================== */

    const getResultIndex = useCallback(
      (finalRotation) => {
        /*
         * Pointer is at the top (-PI/2).
         *
         * Calculate which segment ends under
         * the pointer after rotation.
         */

        const normalized = normalizeAngle(-finalRotation);

        const adjusted = normalizeAngle(normalized + Math.PI / 2);

        const segmentAngle = TAU / finalSegments.length;

        let index = Math.floor(adjusted / segmentAngle);

        index = index % finalSegments.length;

        return index;
      },
      [finalSegments.length],
    );

    /* =====================================================
       SPIN
    ===================================================== */

    const spin = useCallback(
      (forcedIndex = null) => {
        if (disabled || isSpinning || !finalSegments.length) {
          return;
        }

        const resultIndex =
          forcedIndex !== null
            ? forcedIndex
            : Math.floor(Math.random() * finalSegments.length);

        const segmentAngle = TAU / finalSegments.length;

        /*
         * Target the center of the selected
         * segment toward the pointer.
         */
        const segmentCenter =
          -Math.PI / 2 + resultIndex * segmentAngle + segmentAngle / 2;

        const current = currentRotationRef.current;

        const currentNormalized = normalizeAngle(current);

        let targetRotation = currentNormalized + spinTurns * TAU;

        const desired = -Math.PI / 2 - segmentCenter;

        const normalizedDesired = normalizeAngle(desired);

        const currentTarget = normalizeAngle(targetRotation);

        let delta = normalizedDesired - currentTarget;

        if (delta < 0) {
          delta += TAU;
        }

        targetRotation += delta;

        setIsSpinning(true);

        setResult(null);

        progress.value = 0;

        if (onSpinStart) {
          onSpinStart({
            index: resultIndex,
            segment: finalSegments[resultIndex],
          });
        }

        if (reanimated) {
          scale.value = withSequence(
            withTiming(1.025, {
              duration: 180,
            }),

            withSpring(1, {
              damping: 10,
            }),
          );
        }

        rotation.value = withTiming(
          targetRotation,
          {
            duration: spinDuration,
          },
          (finished) => {
            if (!finished) {
              return;
            }

            currentRotationRef.current = targetRotation;

            /*
             * JS state must be changed on JS thread.
             */
            setIsSpinning(false);

            const actualIndex = getResultIndex(targetRotation);

            const selected = finalSegments[actualIndex];

            setResult({
              index: actualIndex,

              segment: selected,
            });

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
        );
      },
      [
        disabled,
        finalSegments,
        getResultIndex,
        isSpinning,
        onResult,
        onSpinEnd,
        onSpinStart,
        progress,
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

      setResult(null);

      setIsSpinning(false);

      progress.value = 0;

      scale.value = 1;
    }, [progress, rotation, scale]);

    /* =====================================================
       REF API
    ===================================================== */

    useImperativeHandle(
      ref,
      () => ({
        spin,

        reset,

        isSpinning,

        result,
      }),
      [isSpinning, reset, result, spin],
    );

    /* =====================================================
       ANIMATED STYLE
    ===================================================== */

    const wheelAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          rotate: `${rotation.value}rad`,
        },
        {
          scale: scale.value,
        },
      ],
    }));

    /* =====================================================
       PROGRESS
    ===================================================== */

    /*
     * Reanimated timing doesn't expose every
     * progress frame to JS here. onProgress is
     * therefore emitted as 0/1 for lifecycle usage.
     */
    const handleSpinPress = useCallback(() => {
      if (isSpinning || disabled) {
        return;
      }

      if (onProgress) {
        onProgress(0);
      }

      spin();
    }, [disabled, isSpinning, onProgress, spin]);

    /* =====================================================
       RESULT LABEL
    ===================================================== */

    const resultLabel = result?.segment?.label;

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
          {/* Backdrop */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (closeOnBackdropPress && !isSpinning && onClose) {
                onClose();
              }
            }}
          />

          <View style={styles.modalCenter}>
            <View style={[styles.dialog, cardStyle]}>
              {/* =========================================
                  CLOSE
              ========================================= */}

              {onClose ? (
                <Pressable
                  disabled={isSpinning}
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              ) : null}

              {/* =========================================
                  TITLE
              ========================================= */}

              <Text style={[styles.modalTitle, titleStyle]}>{finalTitle}</Text>

              <Text style={[styles.modalSubtitle, subtitleStyle]}>
                {finalSubtitle}
              </Text>

              {/* =========================================
                  WHEEL
              ========================================= */}

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
                  style={[
                    styles.wheelGlow,
                    {
                      width: size - 2,

                      height: size - 2,

                      borderRadius: size / 2,
                    },
                  ]}
                />

                {/* Animated wheel */}
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
                    rotation={0}
                    centerColor={finalCenterColor}
                    disabled={disabled || isSpinning}
                  />

                  <SegmentIcons
                    size={size}
                    segments={finalSegments}
                    rotation={0}
                  />
                </Animated.View>

                {/* Pointer */}
                <WheelPointer color={finalPointerColor} />
              </View>

              {/* =========================================
                  SPIN BUTTON
              ========================================= */}

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
                  size={22}
                  color="#FFFFFF"
                />

                <Text style={styles.spinButtonText}>
                  {isSpinning ? "SPINNING..." : "SPIN NOW"}
                </Text>
              </Pressable>

              {/* =========================================
                  RESULT
              ========================================= */}

              {result ? (
                <View style={[styles.resultCard, rewardStyle]}>
                  <View style={styles.resultIcon}>
                    {result.segment?.image ? (
                      <Image
                        source={result.segment.image}
                        style={styles.resultImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <WheelIcon
                        name={result.segment?.icon || "gift"}
                        size={27}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <View style={styles.resultText}>
                    <Text style={styles.resultWon}>YOU WON</Text>

                    <Text style={styles.resultValue}>{resultLabel}</Text>
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

    backgroundColor: "rgba(0,0,0,0.78)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 14,
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

    paddingHorizontal: 12,

    borderRadius: 28,

    backgroundColor: "#0E1118",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.12)",
  },

  /* =======================================================
     CLOSE
  ======================================================= */

  closeButton: {
    position: "absolute",

    top: 12,

    right: 12,

    width: 38,

    height: 38,

    borderRadius: 19,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.1)",

    zIndex: 50,
  },

  /* =======================================================
     TITLE
  ======================================================= */

  modalTitle: {
    marginTop: 3,

    paddingHorizontal: 42,

    color: "#FFFFFF",

    fontSize: 24,

    lineHeight: 29,

    fontWeight: "900",

    textAlign: "center",
  },

  modalSubtitle: {
    marginTop: 5,

    paddingHorizontal: 25,

    color: "#AEB5C5",

    fontSize: 13,

    fontWeight: "600",

    textAlign: "center",
  },

  /* =======================================================
     WHEEL
  ======================================================= */

  wheelArea: {
    marginTop: 18,

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

    backgroundColor: "rgba(255,177,0,0.08)",

    borderWidth: 10,

    borderColor: "rgba(255,190,35,0.15)",

    shadowOpacity: 0.8,

    shadowRadius: 22,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 15,
  },

  segmentIcon: {
    position: "absolute",

    width: 48,

    height: 48,

    alignItems: "center",

    justifyContent: "center",
  },

  segmentImage: {
    width: 42,

    height: 42,
  },

  /* =======================================================
     POINTER
  ======================================================= */

  pointerContainer: {
    position: "absolute",

    top: -12,

    left: 0,

    right: 0,

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,
  },

  pointerPin: {
    width: 42,

    height: 52,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "transparent",
  },

  /* =======================================================
     SPIN BUTTON
  ======================================================= */

  spinButton: {
    marginTop: 18,

    minWidth: 170,

    height: 50,

    paddingHorizontal: 25,

    borderRadius: 25,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,

    borderWidth: 2,

    borderColor: "rgba(255,255,255,0.3)",

    elevation: 5,
  },

  spinButtonDisabled: {
    opacity: 0.55,
  },

  spinButtonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "900",

    letterSpacing: 0.5,
  },

  /* =======================================================
     RESULT
  ======================================================= */

  resultCard: {
    marginTop: 15,

    minWidth: 230,

    maxWidth: "92%",

    minHeight: 66,

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
    width: 35,

    height: 35,
  },

  resultText: {
    marginLeft: 10,

    flex: 1,
  },

  resultWon: {
    color: "#444444",

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
   EXPORTS
========================================================= */

export default UISpinWheel;

export {
  UISpinWheel,
  VARIANTS as UISpinWheelVariants,
  ICONS as UISpinWheelIcons,
  DEFAULT_SEGMENT_COUNT,
};
