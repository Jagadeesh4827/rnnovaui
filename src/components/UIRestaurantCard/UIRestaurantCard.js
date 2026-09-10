import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useUITheme } from "../../UIProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ==========================================================================
 * DEFAULTS
 * ========================================================================== */

const DEFAULT_SPRING = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
};

const DEFAULT_COLORS = {
  card: "#FFFFFF",
  surface: "#FFFFFF",

  text: "#171A21",
  textSecondary: "#737985",
  textTertiary: "#9AA0AA",

  border: "#E7E8EB",

  primary: "#FF5A1F",
  primarySoft: "rgba(255,90,31,0.10)",

  success: "#20A34A",

  white: "#FFFFFF",
  black: "#000000",
};

const DEFAULT_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  md2: 14,
  lg: 16,
  lg2: 20,
  xl: 24,
};

const DEFAULT_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  card: 18,
  pill: 999,
};

/* ==========================================================================
 * THEME
 * ========================================================================== */

function resolveTheme(theme) {
  return {
    colors: {
      ...DEFAULT_COLORS,
      ...(theme?.colors || {}),
    },

    spacing: {
      ...DEFAULT_SPACING,
      ...(theme?.spacing || {}),
    },

    radius: {
      ...DEFAULT_RADIUS,
      ...(theme?.radius || {}),
    },

    animation: {
      ...(theme?.animation || {}),
    },

    sizes: theme?.sizes || {},
    typography: theme?.typography || {},
  };
}

/* ==========================================================================
 * IMAGE SOURCE
 * ========================================================================== */

function normalizeImageSource(source) {
  if (!source) {
    return null;
  }

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return {
      uri: source,
    };
  }

  if (typeof source === "object" && source !== null) {
    if (source.uri) {
      return source;
    }

    if (source.source) {
      return normalizeImageSource(source.source);
    }

    return source;
  }

  return null;
}

/* ==========================================================================
 * RESOLVE IMAGES
 * ========================================================================== */

function resolveRestaurantImages({ restaurant, image, images }) {
  let result = [];

  if (Array.isArray(images) && images.length > 0) {
    result = images;
  } else if (
    Array.isArray(restaurant?.images) &&
    restaurant.images.length > 0
  ) {
    result = restaurant.images;
  } else if (image) {
    result = [image];
  } else if (restaurant?.image) {
    result = [restaurant.image];
  }

  return result.map(normalizeImageSource).filter(Boolean);
}

/* ==========================================================================
 * ICON RENDERER
 * ========================================================================== */

function RenderIcon({ icon, size = 20, color = "#000000", style }) {
  if (!icon) {
    return null;
  }

  /*
   * Already rendered:
   *
   * icon={<Ionicons name="heart" />}
   */
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size: icon.props?.size ?? size,

      color: icon.props?.color ?? color,

      style: [style, icon.props?.style],
    });
  }

  /*
   * Component:
   *
   * icon={Ionicons}
   */
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  /*
   * String icon:
   *
   * icon="heart"
   */
  if (typeof icon === "string") {
    return <Ionicons name={icon} size={size} color={color} style={style} />;
  }

  return null;
}

/* ==========================================================================
 * IMAGE CAROUSEL
 * ========================================================================== */

const RestaurantImageCarousel = memo(function RestaurantImageCarousel({
  images = [],

  height = 220,

  resizeMode = "cover",

  autoplay = true,

  autoplayInterval = 3000,

  loop = true,

  pauseOnTouch = true,

  showPagination = true,

  activeDotColor = "#FFFFFF",

  inactiveDotColor = "rgba(255,255,255,0.45)",

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  onImageChange,
}) {
  const [containerWidth, setContainerWidth] = useState(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isTouching, setIsTouching] = useState(false);

  const listRef = useRef(null);

  const data = Array.isArray(images) ? images.filter(Boolean) : [];

  /* ------------------------------------------------------------------ */
  /* Layout                                                             */
  /* ------------------------------------------------------------------ */

  const handleLayout = useCallback(
    (event) => {
      const measuredWidth = event.nativeEvent.layout.width;

      if (measuredWidth > 0 && measuredWidth !== containerWidth) {
        setContainerWidth(measuredWidth);
      }
    },
    [containerWidth],
  );

  /* ------------------------------------------------------------------ */
  /* Update index                                                       */
  /* ------------------------------------------------------------------ */

  const updateIndex = useCallback(
    (index) => {
      setActiveIndex(index);

      if (typeof onImageChange === "function") {
        onImageChange(index);
      }
    },
    [onImageChange],
  );

  /* ------------------------------------------------------------------ */
  /* Scroll                                                             */
  /* ------------------------------------------------------------------ */

  const handleScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;

      const layoutWidth = event.nativeEvent.layoutMeasurement?.width;

      const pageWidth = layoutWidth || containerWidth;

      if (!pageWidth) {
        return;
      }

      const index = Math.round(offsetX / pageWidth);

      if (index < 0 || index >= data.length) {
        return;
      }

      if (index !== activeIndex) {
        updateIndex(index);
      }
    },
    [activeIndex, containerWidth, data.length, updateIndex],
  );

  /* ------------------------------------------------------------------ */
  /* Autoplay                                                           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!autoplay) {
      return undefined;
    }

    if (data.length <= 1) {
      return undefined;
    }

    if (containerWidth <= 0) {
      return undefined;
    }

    if (pauseOnTouch && isTouching) {
      return undefined;
    }

    const timer = setInterval(
      () => {
        setActiveIndex((currentIndex) => {
          let nextIndex = currentIndex + 1;

          if (nextIndex >= data.length) {
            if (!loop) {
              return currentIndex;
            }

            nextIndex = 0;
          }

          requestAnimationFrame(() => {
            if (listRef.current) {
              listRef.current.scrollToOffset({
                offset: nextIndex * containerWidth,

                animated: true,
              });
            }
          });

          if (typeof onImageChange === "function") {
            onImageChange(nextIndex);
          }

          return nextIndex;
        });
      },
      Math.max(500, autoplayInterval),
    );

    return () => {
      clearInterval(timer);
    };
  }, [
    autoplay,
    autoplayInterval,
    containerWidth,
    data.length,
    isTouching,
    loop,
    onImageChange,
    pauseOnTouch,
  ]);

  /* ------------------------------------------------------------------ */
  /* Touch                                                               */
  /* ------------------------------------------------------------------ */

  const handleTouchStart = useCallback(() => {
    if (pauseOnTouch) {
      setIsTouching(true);
    }
  }, [pauseOnTouch]);

  const handleTouchEnd = useCallback(() => {
    if (pauseOnTouch) {
      setIsTouching(false);
    }
  }, [pauseOnTouch]);

  /* ------------------------------------------------------------------ */
  /* Empty                                                               */
  /* ------------------------------------------------------------------ */

  if (data.length === 0) {
    return (
      <View
        onLayout={handleLayout}
        style={[
          styles.carousel,
          {
            height,
          },
        ]}
      >
        <View
          style={[
            styles.imagePlaceholder,
            {
              height,
            },
          ]}
        >
          <Ionicons name="restaurant-outline" size={46} color="#AEB4BE" />

          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Single image                                                        */
  /* ------------------------------------------------------------------ */

  if (data.length === 1) {
    return (
      <View
        onLayout={handleLayout}
        style={[
          styles.carousel,
          {
            height,
          },
        ]}
      >
        <Image
          source={data[0]}
          resizeMode={resizeMode}
          style={[
            styles.restaurantImage,
            {
              height,
            },
          ]}
        />
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Multiple images                                                     */
  /* ------------------------------------------------------------------ */

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.carousel,
        {
          height,
        },
      ]}
    >
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleTouchStart}
        onScrollEndDrag={handleTouchEnd}
        onMomentumScrollEnd={handleTouchEnd}
        keyExtractor={(_, index) => `restaurant-image-${index}`}
        renderItem={({ item }) => {
          const itemWidth = containerWidth || SCREEN_WIDTH;

          return (
            <View
              style={[
                styles.carouselItem,
                {
                  width: itemWidth,

                  height,
                },
              ]}
            >
              <Image
                source={item}
                resizeMode={resizeMode}
                style={[
                  styles.restaurantImage,
                  {
                    width: itemWidth,

                    height,
                  },
                ]}
              />
            </View>
          );
        }}
      />

      {showPagination ? (
        <View pointerEvents="none" style={[styles.pagination, paginationStyle]}>
          {data.map((_, index) => {
            const active = index === activeIndex;

            return (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,

                  {
                    backgroundColor: active ? activeDotColor : inactiveDotColor,
                  },

                  active ? activeDotStyle : inactiveDotStyle,
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

/* ==========================================================================
 * TOP RATED
 * ========================================================================== */

const TopRatedBadge = memo(function TopRatedBadge({
  text = "Top Rated",

  icon = "flame",

  iconSize = 16,

  backgroundColor = "#FF5A5F",

  color = "#FFFFFF",

  fontSize = 13,

  style,

  textStyle,
}) {
  if (!text) {
    return null;
  }

  return (
    <View
      style={[
        styles.topRatedBadge,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      {icon ? <RenderIcon icon={icon} size={iconSize} color={color} /> : null}

      <Text
        numberOfLines={1}
        style={[
          styles.topRatedText,
          {
            color,
            fontSize,
            lineHeight: Math.round(fontSize * 1.25),
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
});

/* ==========================================================================
 * RATING
 * ========================================================================== */

const Rating = memo(function Rating({
  rating,

  reviewCount,

  icon = "star",

  iconSize = 19,

  iconColor = "#FFB020",

  fontSize = 18,

  lineHeight,

  reviewFontSize = 14,

  reviewLineHeight,

  textColor = "#171A21",

  reviewColor = "#737985",

  showReviewCount = true,

  style,
}) {
  if (rating === undefined || rating === null || rating === "") {
    return null;
  }

  let formattedReviews = "";

  if (reviewCount !== undefined && reviewCount !== null && reviewCount !== "") {
    if (typeof reviewCount === "number" && reviewCount >= 1000) {
      formattedReviews = `${(reviewCount / 1000).toFixed(
        reviewCount >= 10000 ? 0 : 1,
      )}K+`;
    } else {
      formattedReviews = String(reviewCount);
    }
  }

  return (
    <View style={[styles.rating, style]}>
      <RenderIcon icon={icon} size={iconSize} color={iconColor} />

      <Text
        style={[
          styles.ratingValue,
          {
            color: textColor,
            fontSize,
            lineHeight: lineHeight ?? Math.round(fontSize * 1.3),
          },
        ]}
      >
        {rating}
      </Text>

      {showReviewCount && formattedReviews ? (
        <Text
          style={[
            styles.ratingReviews,
            {
              color: reviewColor,

              fontSize: reviewFontSize,

              lineHeight: reviewLineHeight ?? Math.round(reviewFontSize * 1.3),
            },
          ]}
        >
          ({formattedReviews})
        </Text>
      ) : null}
    </View>
  );
});

/* ==========================================================================
 * CUISINE TAGS
 * ========================================================================== */

const CuisineTags = memo(function CuisineTags({
  cuisines = [],

  maxTags = 3,

  backgroundColor = "rgba(255,90,31,0.10)",

  textColor = "#737985",

  fontSize = 14,

  lineHeight,

  borderRadius = 999,

  style,

  textStyle,
}) {
  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    return null;
  }

  const visible = cuisines.slice(0, maxTags);

  const remaining = Math.max(0, cuisines.length - visible.length);

  return (
    <View style={[styles.cuisineContainer, style]}>
      {visible.map((cuisine, index) => (
        <View
          key={`${cuisine}-${index}`}
          style={[
            styles.cuisineTag,
            {
              backgroundColor,
              borderRadius,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.cuisineText,
              {
                color: textColor,

                fontSize,

                lineHeight: lineHeight ?? Math.round(fontSize * 1.35),
              },

              textStyle,
            ]}
          >
            {cuisine}
          </Text>
        </View>
      ))}

      {remaining > 0 ? (
        <View
          style={[
            styles.cuisineTag,
            {
              backgroundColor,
              borderRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.cuisineText,
              {
                color: textColor,

                fontSize,

                lineHeight: lineHeight ?? Math.round(fontSize * 1.35),
              },
            ]}
          >
            +{remaining}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

/* ==========================================================================
 * INFO ITEM
 * ========================================================================== */

const InfoItem = memo(function InfoItem({
  icon,

  iconSize = 24,

  iconColor = "#737985",

  value,

  label,

  valueFontSize = 16,

  valueLineHeight,

  labelFontSize = 13,

  labelLineHeight,

  valueColor = "#171A21",

  labelColor = "#737985",
}) {
  if (!value && !label) {
    return null;
  }

  return (
    <View style={styles.infoItem}>
      <RenderIcon icon={icon} size={iconSize} color={iconColor} />

      <View style={styles.infoText}>
        {value ? (
          <Text
            numberOfLines={1}
            style={[
              styles.infoValue,
              {
                color: valueColor,

                fontSize: valueFontSize,

                lineHeight: valueLineHeight ?? Math.round(valueFontSize * 1.35),
              },
            ]}
          >
            {value}
          </Text>
        ) : null}

        {label ? (
          <Text
            numberOfLines={1}
            style={[
              styles.infoLabel,
              {
                color: labelColor,

                fontSize: labelFontSize,

                lineHeight: labelLineHeight ?? Math.round(labelFontSize * 1.35),
              },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

/* ==========================================================================
 * RESTAURANT CARD
 * ========================================================================== */

export const UIRestaurantCard = memo(function UIRestaurantCard({
  restaurant = {},

  /* ------------------------------------------------------------------ */
  /* CARD                                                               */
  /* ------------------------------------------------------------------ */

  width = SCREEN_WIDTH - 24,

  backgroundColor,

  borderRadius,

  shadow = true,

  style,

  contentStyle,

  /* ------------------------------------------------------------------ */
  /* PRESS                                                              */
  /* ------------------------------------------------------------------ */

  onPress,

  onLongPress,

  disabled = false,

  /* ------------------------------------------------------------------ */
  /* ANIMATION                                                          */
  /* ------------------------------------------------------------------ */

  reanimated = false,

  animationSpring,

  pressedScale = 0.985,

  /* ------------------------------------------------------------------ */
  /* GLOBAL SIZE CONTROLS                                               */
  /* ------------------------------------------------------------------ */

  textScale = 1,

  iconScale = 1,

  /* ------------------------------------------------------------------ */
  /* IMAGE                                                              */
  /* ------------------------------------------------------------------ */

  image,

  images,

  imageHeight = 220,

  imageResizeMode = "cover",

  /* ------------------------------------------------------------------ */
  /* CAROUSEL                                                           */
  /* ------------------------------------------------------------------ */

  autoplay = true,

  autoplayInterval = 3000,

  loop = true,

  pauseOnTouch = true,

  showPagination = true,

  activeDotColor = "#FFFFFF",

  inactiveDotColor = "rgba(255,255,255,0.45)",

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  onImageChange,

  /* ------------------------------------------------------------------ */
  /* TOP RATED                                                          */
  /* ------------------------------------------------------------------ */

  showTopRated = true,

  topRated,

  topRatedText = "Top Rated",

  topRatedIcon = "flame",

  topRatedIconSize = 16,

  topRatedBackgroundColor = "#FF5A5F",

  topRatedColor = "#FFFFFF",

  topRatedFontSize = 13,

  topRatedStyle,

  topRatedTextStyle,

  /* ------------------------------------------------------------------ */
  /* FAVORITE                                                           */
  /* ------------------------------------------------------------------ */

  showFavorite = true,

  favorite = false,

  onFavoritePress,

  favoriteIcon,

  favoriteActiveIcon = "heart",

  favoriteInactiveIcon = "heart-outline",

  favoriteIconSize = 25,

  favoriteColor = "#222222",

  favoriteActiveColor = "#FF4D67",

  favoriteBackgroundColor = "rgba(255,255,255,0.96)",

  favoriteButtonSize = 46,

  favoriteStyle,

  /* ------------------------------------------------------------------ */
  /* DISCOUNT                                                           */
  /* ------------------------------------------------------------------ */

  showDiscount = true,

  discount,

  discountBackgroundColor = "rgba(0,0,0,0.82)",

  discountColor = "#FFFFFF",

  discountFontSize = 16,

  discountLineHeight,

  discountStyle,

  discountTextStyle,

  /* ------------------------------------------------------------------ */
  /* LOGO                                                               */
  /* ------------------------------------------------------------------ */

  showLogo = true,

  logo,

  logoSize = 82,

  logoBorderRadius = 18,

  logoStyle,

  /* ------------------------------------------------------------------ */
  /* NAME                                                               */
  /* ------------------------------------------------------------------ */

  name,

  subtitle,

  nameColor,

  nameFontSize = 25,

  nameLineHeight,

  subtitleColor,

  subtitleFontSize = 15,

  subtitleLineHeight,

  nameStyle,

  subtitleStyle,

  /* ------------------------------------------------------------------ */
  /* RATING                                                             */
  /* ------------------------------------------------------------------ */

  showRating = true,

  rating,

  reviewCount,

  showReviewCount = true,

  ratingIcon = "star",

  ratingIconSize = 19,

  ratingIconColor = "#FFB020",

  ratingFontSize = 18,

  ratingLineHeight,

  reviewCountFontSize = 14,

  reviewCountLineHeight,

  ratingTextColor,

  reviewTextColor,

  ratingStyle,

  /* ------------------------------------------------------------------ */
  /* CUISINE                                                            */
  /* ------------------------------------------------------------------ */

  cuisines,

  maxCuisineTags = 3,

  tagBackgroundColor,

  tagTextColor,

  cuisineFontSize = 14,

  cuisineLineHeight,

  tagBorderRadius,

  tagStyle,

  tagTextStyle,

  /* ------------------------------------------------------------------ */
  /* DELIVERY                                                           */
  /* ------------------------------------------------------------------ */

  deliveryTime,

  deliveryTimeLabel = "Delivery time",

  deliveryIcon = "time-outline",

  deliveryIconSize = 25,

  deliveryTimeFontSize = 16,

  deliveryTimeLineHeight,

  deliveryLabelFontSize = 13,

  deliveryLabelLineHeight,

  /* ------------------------------------------------------------------ */
  /* DISTANCE                                                           */
  /* ------------------------------------------------------------------ */

  distance,

  distanceLabel = "Away",

  distanceIcon = "location-outline",

  distanceIconSize = 25,

  distanceFontSize = 16,

  distanceLineHeight,

  distanceLabelFontSize = 13,

  distanceLabelLineHeight,

  /* ------------------------------------------------------------------ */
  /* FREE DELIVERY                                                      */
  /* ------------------------------------------------------------------ */

  freeDelivery = false,

  freeDeliveryText = "Free Delivery",

  freeDeliverySubtext,

  freeDeliveryIcon = "bicycle-outline",

  freeDeliveryIconSize = 27,

  freeDeliveryFontSize = 16,

  freeDeliveryLineHeight,

  freeDeliverySubtextFontSize = 13,

  freeDeliverySubtextLineHeight,

  freeDeliveryColor,

  freeDeliveryIconColor,

  /* ------------------------------------------------------------------ */
  /* DIVIDER                                                            */
  /* ------------------------------------------------------------------ */

  showDivider = true,

  dividerColor,

  /* ------------------------------------------------------------------ */
  /* CUSTOM RENDERERS                                                   */
  /* ------------------------------------------------------------------ */

  renderImage,

  renderLogo,

  renderTopRated,

  renderFavorite,

  renderDiscount,

  renderRating,

  renderTags,

  renderDelivery,

  renderDistance,

  renderFreeDelivery,

  renderContent,

  renderFooter,

  children,
}) {
  /* ================================================================== */
  /* THEME                                                               */
  /* ================================================================== */

  const { theme } = useUITheme();

  const { colors, spacing, radius, animation } = resolveTheme(theme);

  /* ================================================================== */
  /* SCALED SIZES                                                        */
  /* ================================================================== */

  /*
   * Individual size props are first resolved.
   *
   * Then global textScale/iconScale
   * is applied.
   */

  const sizes = useMemo(() => {
    return {
      nameFontSize: nameFontSize * textScale,

      nameLineHeight: (nameLineHeight ?? nameFontSize * 1.24) * textScale,

      subtitleFontSize: subtitleFontSize * textScale,

      subtitleLineHeight:
        (subtitleLineHeight ?? subtitleFontSize * 1.4) * textScale,

      topRatedFontSize: topRatedFontSize * textScale,

      topRatedIconSize: topRatedIconSize * iconScale,

      favoriteIconSize: favoriteIconSize * iconScale,

      ratingFontSize: ratingFontSize * textScale,

      ratingLineHeight: (ratingLineHeight ?? ratingFontSize * 1.3) * textScale,

      reviewCountFontSize: reviewCountFontSize * textScale,

      reviewCountLineHeight:
        (reviewCountLineHeight ?? reviewCountFontSize * 1.3) * textScale,

      ratingIconSize: ratingIconSize * iconScale,

      cuisineFontSize: cuisineFontSize * textScale,

      cuisineLineHeight:
        (cuisineLineHeight ?? cuisineFontSize * 1.35) * textScale,

      deliveryIconSize: deliveryIconSize * iconScale,

      deliveryTimeFontSize: deliveryTimeFontSize * textScale,

      deliveryTimeLineHeight:
        (deliveryTimeLineHeight ?? deliveryTimeFontSize * 1.35) * textScale,

      deliveryLabelFontSize: deliveryLabelFontSize * textScale,

      deliveryLabelLineHeight:
        (deliveryLabelLineHeight ?? deliveryLabelFontSize * 1.35) * textScale,

      distanceIconSize: distanceIconSize * iconScale,

      distanceFontSize: distanceFontSize * textScale,

      distanceLineHeight:
        (distanceLineHeight ?? distanceFontSize * 1.35) * textScale,

      distanceLabelFontSize: distanceLabelFontSize * textScale,

      distanceLabelLineHeight:
        (distanceLabelLineHeight ?? distanceLabelFontSize * 1.35) * textScale,

      freeDeliveryIconSize: freeDeliveryIconSize * iconScale,

      freeDeliveryFontSize: freeDeliveryFontSize * textScale,

      freeDeliveryLineHeight:
        (freeDeliveryLineHeight ?? freeDeliveryFontSize * 1.35) * textScale,

      freeDeliverySubtextFontSize: freeDeliverySubtextFontSize * textScale,

      freeDeliverySubtextLineHeight:
        (freeDeliverySubtextLineHeight ?? freeDeliverySubtextFontSize * 1.35) *
        textScale,

      discountFontSize: discountFontSize * textScale,

      discountLineHeight:
        (discountLineHeight ?? discountFontSize * 1.3) * textScale,
    };
  }, [
    cuisineFontSize,
    cuisineLineHeight,
    deliveryIconSize,
    deliveryLabelFontSize,
    deliveryLabelLineHeight,
    deliveryTimeFontSize,
    deliveryTimeLineHeight,
    distanceFontSize,
    distanceIconSize,
    distanceLabelFontSize,
    distanceLabelLineHeight,
    distanceLineHeight,
    favoriteIconSize,
    freeDeliveryFontSize,
    freeDeliveryIconSize,
    freeDeliveryLineHeight,
    freeDeliverySubtextFontSize,
    freeDeliverySubtextLineHeight,
    iconScale,
    nameFontSize,
    nameLineHeight,
    ratingFontSize,
    ratingIconSize,
    ratingLineHeight,
    reviewCountFontSize,
    reviewCountLineHeight,
    subtitleFontSize,
    subtitleLineHeight,
    textScale,
    topRatedFontSize,
    topRatedIconSize,
    discountFontSize,
    discountLineHeight,
  ]);

  /* ================================================================== */
  /* SPRING                                                              */
  /* ================================================================== */

  const resolvedSpring = useMemo(
    () => animationSpring ?? animation?.spring ?? DEFAULT_SPRING,
    [animationSpring, animation?.spring],
  );

  /* ================================================================== */
  /* DATA                                                                */
  /* ================================================================== */

  const resolvedName = name ?? restaurant?.name ?? "";

  const resolvedSubtitle = subtitle ?? restaurant?.subtitle ?? "";

  const resolvedRating = rating ?? restaurant?.rating;

  const resolvedReviewCount = reviewCount ?? restaurant?.reviewCount;

  const resolvedCuisines = cuisines ?? restaurant?.cuisines ?? [];

  const resolvedDeliveryTime = deliveryTime ?? restaurant?.deliveryTime ?? "";

  const resolvedDistance = distance ?? restaurant?.distance ?? "";

  const resolvedLogo = logo ?? restaurant?.logo;

  const resolvedTopRated = topRated ?? restaurant?.topRated;

  const resolvedDiscount = discount ?? restaurant?.discount;

  const resolvedImages = useMemo(
    () =>
      resolveRestaurantImages({
        restaurant,
        image,
        images,
      }),
    [restaurant, image, images],
  );

  const resolvedFreeDelivery =
    freeDelivery || restaurant?.freeDelivery === true;

  const resolvedFreeDeliveryText =
    restaurant?.freeDeliveryText ?? freeDeliveryText;

  const resolvedFreeDeliverySubtext =
    freeDeliverySubtext ?? restaurant?.freeDeliverySubtext;

  /* ================================================================== */
  /* COLORS                                                              */
  /* ================================================================== */

  const cardColor =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const cardRadius = borderRadius ?? radius.card ?? 18;

  const resolvedNameColor = nameColor ?? colors.text;

  const resolvedSubtitleColor = subtitleColor ?? colors.textSecondary;

  const resolvedRatingColor = ratingTextColor ?? colors.text;

  const resolvedReviewColor = reviewTextColor ?? colors.textSecondary;

  const resolvedTagBackground =
    tagBackgroundColor ?? colors.primarySoft ?? "rgba(255,90,31,0.10)";

  const resolvedTagColor = tagTextColor ?? colors.textSecondary;

  const resolvedDividerColor = dividerColor ?? colors.border;

  const resolvedFreeColor = freeDeliveryColor ?? colors.success ?? "#20A34A";

  const resolvedFreeIconColor =
    freeDeliveryIconColor ?? colors.primary ?? "#FF5A1F";

  /* ================================================================== */
  /* PRESS ANIMATION                                                     */
  /* ================================================================== */

  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  const handlePressIn = useCallback(() => {
    if (!reanimated || disabled) {
      return;
    }

    scale.value = withSpring(pressedScale, resolvedSpring);
  }, [disabled, pressedScale, reanimated, resolvedSpring, scale]);

  const handlePressOut = useCallback(() => {
    if (!reanimated || disabled) {
      return;
    }

    scale.value = withSpring(1, resolvedSpring);
  }, [disabled, reanimated, resolvedSpring, scale]);

  /* ================================================================== */
  /* PRESS                                                               */
  /* ================================================================== */

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (typeof onPress === "function") {
      onPress(restaurant);
    }
  }, [disabled, onPress, restaurant]);

  const handleLongPress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (typeof onLongPress === "function") {
      onLongPress(restaurant);
    }
  }, [disabled, onLongPress, restaurant]);

  /* ================================================================== */
  /* IMAGE                                                               */
  /* ================================================================== */

  const imageContent =
    typeof renderImage === "function" ? (
      renderImage({
        restaurant,
        images: resolvedImages,
        height: imageHeight,
      })
    ) : (
      <RestaurantImageCarousel
        images={resolvedImages}
        height={imageHeight}
        resizeMode={imageResizeMode}
        autoplay={autoplay}
        autoplayInterval={autoplayInterval}
        loop={loop}
        pauseOnTouch={pauseOnTouch}
        showPagination={showPagination}
        activeDotColor={activeDotColor}
        inactiveDotColor={inactiveDotColor}
        paginationStyle={paginationStyle}
        activeDotStyle={activeDotStyle}
        inactiveDotStyle={inactiveDotStyle}
        onImageChange={onImageChange}
      />
    );

  /* ================================================================== */
  /* TOP RATED                                                           */
  /* ================================================================== */

  const topRatedContent =
    showTopRated && resolvedTopRated !== false ? (
      typeof renderTopRated === "function" ? (
        renderTopRated({
          restaurant,
          topRated: resolvedTopRated,
        })
      ) : (
        <TopRatedBadge
          text={
            typeof resolvedTopRated === "string"
              ? resolvedTopRated
              : topRatedText
          }
          icon={topRatedIcon}
          iconSize={sizes.topRatedIconSize}
          backgroundColor={topRatedBackgroundColor}
          color={topRatedColor}
          fontSize={sizes.topRatedFontSize}
          style={topRatedStyle}
          textStyle={topRatedTextStyle}
        />
      )
    ) : null;

  /* ================================================================== */
  /* FAVORITE                                                            */
  /* ================================================================== */

  const favoriteContent = showFavorite ? (
    typeof renderFavorite === "function" ? (
      renderFavorite({
        restaurant,
        favorite,
      })
    ) : (
      <Pressable
        onPress={() => {
          if (typeof onFavoritePress === "function") {
            onFavoritePress(!favorite, restaurant);
          }
        }}
        style={[
          styles.favoriteButton,

          {
            width: favoriteButtonSize,

            height: favoriteButtonSize,

            borderRadius: favoriteButtonSize / 2,

            backgroundColor: favoriteBackgroundColor,
          },

          favoriteStyle,
        ]}
      >
        <RenderIcon
          icon={
            favoriteIcon ??
            (favorite ? favoriteActiveIcon : favoriteInactiveIcon)
          }
          size={sizes.favoriteIconSize}
          color={favorite ? favoriteActiveColor : favoriteColor}
        />
      </Pressable>
    )
  ) : null;

  /* ================================================================== */
  /* DISCOUNT                                                            */
  /* ================================================================== */

  const discountContent =
    showDiscount && resolvedDiscount ? (
      typeof renderDiscount === "function" ? (
        renderDiscount({
          restaurant,
          discount: resolvedDiscount,
        })
      ) : (
        <View
          style={[
            styles.discountBadge,

            {
              backgroundColor: discountBackgroundColor,
            },

            discountStyle,
          ]}
        >
          <Text
            style={[
              styles.discountText,

              {
                color: discountColor,

                fontSize: sizes.discountFontSize,

                lineHeight: sizes.discountLineHeight,
              },

              discountTextStyle,
            ]}
          >
            {resolvedDiscount}
          </Text>
        </View>
      )
    ) : null;

  /* ================================================================== */
  /* RATING                                                              */
  /* ================================================================== */

  const ratingContent = showRating ? (
    typeof renderRating === "function" ? (
      renderRating({
        restaurant,
        rating: resolvedRating,
        reviewCount: resolvedReviewCount,
      })
    ) : (
      <Rating
        rating={resolvedRating}
        reviewCount={resolvedReviewCount}
        icon={ratingIcon}
        iconSize={sizes.ratingIconSize}
        iconColor={ratingIconColor}
        fontSize={sizes.ratingFontSize}
        lineHeight={sizes.ratingLineHeight}
        reviewFontSize={sizes.reviewCountFontSize}
        reviewLineHeight={sizes.reviewCountLineHeight}
        textColor={resolvedRatingColor}
        reviewColor={resolvedReviewColor}
        showReviewCount={showReviewCount}
        style={ratingStyle}
      />
    )
  ) : null;

  /* ================================================================== */
  /* TAGS                                                                */
  /* ================================================================== */

  const tagsContent =
    typeof renderTags === "function" ? (
      renderTags({
        restaurant,
        cuisines: resolvedCuisines,
      })
    ) : (
      <CuisineTags
        cuisines={resolvedCuisines}
        maxTags={maxCuisineTags}
        backgroundColor={resolvedTagBackground}
        textColor={resolvedTagColor}
        fontSize={sizes.cuisineFontSize}
        lineHeight={sizes.cuisineLineHeight}
        borderRadius={tagBorderRadius ?? radius.pill ?? 999}
        style={tagStyle}
        textStyle={tagTextStyle}
      />
    );

  /* ================================================================== */
  /* DELIVERY                                                             */
  /* ================================================================== */

  const deliveryContent =
    typeof renderDelivery === "function" ? (
      renderDelivery({
        restaurant,
        deliveryTime: resolvedDeliveryTime,
      })
    ) : (
      <InfoItem
        icon={deliveryIcon}
        iconSize={sizes.deliveryIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDeliveryTime}
        label={deliveryTimeLabel}
        valueFontSize={sizes.deliveryTimeFontSize}
        valueLineHeight={sizes.deliveryTimeLineHeight}
        labelFontSize={sizes.deliveryLabelFontSize}
        labelLineHeight={sizes.deliveryLabelLineHeight}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
      />
    );

  /* ================================================================== */
  /* DISTANCE                                                            */
  /* ================================================================== */

  const distanceContent =
    typeof renderDistance === "function" ? (
      renderDistance({
        restaurant,
        distance: resolvedDistance,
      })
    ) : (
      <InfoItem
        icon={distanceIcon}
        iconSize={sizes.distanceIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDistance}
        label={distanceLabel}
        valueFontSize={sizes.distanceFontSize}
        valueLineHeight={sizes.distanceLineHeight}
        labelFontSize={sizes.distanceLabelFontSize}
        labelLineHeight={sizes.distanceLabelLineHeight}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
      />
    );

  /* ================================================================== */
  /* FREE DELIVERY                                                       */
  /* ================================================================== */

  const freeDeliveryContent = resolvedFreeDelivery ? (
    typeof renderFreeDelivery === "function" ? (
      renderFreeDelivery({
        restaurant,
      })
    ) : (
      <View style={styles.freeDelivery}>
        <RenderIcon
          icon={freeDeliveryIcon}
          size={sizes.freeDeliveryIconSize}
          color={resolvedFreeIconColor}
        />

        <View style={styles.freeDeliveryTextContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.freeDeliveryTitle,

              {
                color: resolvedFreeColor,

                fontSize: sizes.freeDeliveryFontSize,

                lineHeight: sizes.freeDeliveryLineHeight,
              },
            ]}
          >
            {resolvedFreeDeliveryText}
          </Text>

          {resolvedFreeDeliverySubtext ? (
            <Text
              numberOfLines={1}
              style={[
                styles.freeDeliverySubtext,

                {
                  color: colors.textSecondary,

                  fontSize: sizes.freeDeliverySubtextFontSize,

                  lineHeight: sizes.freeDeliverySubtextLineHeight,
                },
              ]}
            >
              {resolvedFreeDeliverySubtext}
            </Text>
          ) : null}
        </View>
      </View>
    )
  ) : null;

  /* ================================================================== */
  /* LOGO                                                                */
  /* ================================================================== */

  const logoContent =
    showLogo && resolvedLogo ? (
      typeof renderLogo === "function" ? (
        renderLogo({
          restaurant,
          logo: resolvedLogo,
        })
      ) : (
        <View
          style={[
            styles.logoContainer,

            {
              width: logoSize,

              height: logoSize,

              borderRadius: logoBorderRadius,
            },

            logoStyle,
          ]}
        >
          <Image
            source={normalizeImageSource(resolvedLogo)}
            resizeMode="cover"
            style={{
              width: logoSize,

              height: logoSize,
            }}
          />
        </View>
      )
    ) : null;

  /* ================================================================== */
  /* CONTENT                                                             */
  /* ================================================================== */

  const defaultContent = (
    <View
      style={[
        styles.content,

        {
          paddingHorizontal: spacing.lg ?? 16,
        },

        contentStyle,
      ]}
    >
      {/* NAME + RATING */}

      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.restaurantName,

              {
                color: resolvedNameColor,

                fontSize: sizes.nameFontSize,

                lineHeight: sizes.nameLineHeight,
              },

              nameStyle,
            ]}
          >
            {resolvedName}
          </Text>

          {resolvedSubtitle ? (
            <Text
              numberOfLines={1}
              style={[
                styles.restaurantSubtitle,

                {
                  color: resolvedSubtitleColor,

                  fontSize: sizes.subtitleFontSize,

                  lineHeight: sizes.subtitleLineHeight,
                },

                subtitleStyle,
              ]}
            >
              {resolvedSubtitle}
            </Text>
          ) : null}
        </View>

        {ratingContent}
      </View>

      {/* CUISINES */}

      {tagsContent ? (
        <View style={styles.tagsWrapper}>{tagsContent}</View>
      ) : null}

      {/* DIVIDER */}

      {showDivider ? (
        <View
          style={[
            styles.divider,

            {
              backgroundColor: resolvedDividerColor,
            },
          ]}
        />
      ) : null}

      {/* INFORMATION */}

      <View style={styles.infoRow}>
        {deliveryContent}

        {distanceContent}

        {freeDeliveryContent}
      </View>

      {/* FOOTER */}

      {typeof renderFooter === "function"
        ? renderFooter({
            restaurant,
          })
        : null}

      {children}
    </View>
  );

  const content =
    typeof renderContent === "function"
      ? renderContent({
          restaurant,

          rating: resolvedRating,

          reviewCount: resolvedReviewCount,

          cuisines: resolvedCuisines,

          deliveryTime: resolvedDeliveryTime,

          distance: resolvedDistance,
        })
      : defaultContent;

  /* ================================================================== */
  /* CARD                                                                */
  /* ================================================================== */

  return (
    <Animated.View
      style={[
        styles.card,

        {
          width,

          borderRadius: cardRadius,

          backgroundColor: cardColor,
        },

        shadow ? styles.shadow : null,

        animatedCardStyle,

        style,
      ]}
    >
      <View
        style={[
          styles.cardInner,

          {
            borderRadius: cardRadius,
          },
        ]}
      >
        {/* ============================================================ */}
        {/* IMAGE                                                         */}
        {/* ============================================================ */}

        <View
          style={[
            styles.imageSection,

            {
              height: imageHeight,

              borderTopLeftRadius: cardRadius,

              borderTopRightRadius: cardRadius,
            },
          ]}
        >
          {imageContent}

          {/* ========================================================== */}
          {/* TOP OVERLAY                                                  */}
          {/* ========================================================== */}

          <View pointerEvents="box-none" style={styles.topOverlay}>
            {/* TOP RATED */}

            {topRatedContent ? (
              <View style={styles.topRatedPosition}>{topRatedContent}</View>
            ) : (
              <View />
            )}

            {/* FAVORITE */}

            {favoriteContent ? (
              <View style={styles.favoritePosition}>{favoriteContent}</View>
            ) : null}
          </View>

          {/* DISCOUNT */}

          {discountContent ? (
            <View style={styles.discountPosition}>{discountContent}</View>
          ) : null}
        </View>

        {/* ============================================================ */}
        {/* LOGO                                                          */}
        {/* ============================================================ */}

        {logoContent ? (
          <View
            pointerEvents="none"
            style={[
              styles.logoPosition,

              {
                left: spacing.lg ?? 16,

                top: imageHeight - logoSize / 2,
              },
            ]}
          >
            {logoContent}
          </View>
        ) : null}

        {/* ============================================================ */}
        {/* CONTENT                                                       */}
        {/* ============================================================ */}

        <Pressable
          disabled={disabled}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      </View>
    </Animated.View>
  );
});

/* ==========================================================================
 * STYLES
 * ========================================================================== */

const styles = StyleSheet.create({
  /* ---------------------------------------------------------------------- */
  /* CARD                                                                   */
  /* ---------------------------------------------------------------------- */

  card: {
    overflow: "visible",
  },

  cardInner: {
    width: "100%",

    overflow: "hidden",
  },

  shadow: {
    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.12,

    shadowRadius: 12,

    elevation: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* IMAGE                                                                  */
  /* ---------------------------------------------------------------------- */

  imageSection: {
    width: "100%",

    position: "relative",

    overflow: "hidden",
  },

  carousel: {
    width: "100%",

    position: "relative",

    overflow: "hidden",
  },

  carouselItem: {
    overflow: "hidden",
  },

  restaurantImage: {
    width: "100%",
  },

  imagePlaceholder: {
    width: "100%",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#ECEEF1",
  },

  placeholderText: {
    marginTop: 8,

    fontSize: 13,

    color: "#8B919B",
  },

  /* ---------------------------------------------------------------------- */
  /* TOP OVERLAY                                                            */
  /* ---------------------------------------------------------------------- */

  topOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,

    zIndex: 100,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

    paddingHorizontal: 14,

    paddingTop: 14,
  },

  topRatedPosition: {
    zIndex: 110,
  },

  /* ---------------------------------------------------------------------- */
  /* TOP RATED                                                              */
  /* ---------------------------------------------------------------------- */

  topRatedBadge: {
    minHeight: 34,

    paddingHorizontal: 12,

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    elevation: 4,
  },

  topRatedText: {
    marginLeft: 6,

    fontWeight: "700",
  },

  /* ---------------------------------------------------------------------- */
  /* FAVORITE                                                               */
  /* ---------------------------------------------------------------------- */

  favoritePosition: {
    zIndex: 110,
  },

  favoriteButton: {
    alignItems: "center",

    justifyContent: "center",

    elevation: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* DISCOUNT                                                               */
  /* ---------------------------------------------------------------------- */

  discountPosition: {
    position: "absolute",

    right: 14,

    bottom: 14,

    zIndex: 110,
  },

  discountBadge: {
    minHeight: 42,

    paddingHorizontal: 17,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",
  },

  discountText: {
    fontWeight: "800",
  },

  /* ---------------------------------------------------------------------- */
  /* PAGINATION                                                             */
  /* ---------------------------------------------------------------------- */

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,

    bottom: 12,

    zIndex: 150,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  paginationDot: {
    width: 8,

    height: 8,

    marginHorizontal: 4,

    borderRadius: 999,
  },

  /* ---------------------------------------------------------------------- */
  /* LOGO                                                                   */
  /* ---------------------------------------------------------------------- */

  logoPosition: {
    position: "absolute",

    zIndex: 200,
  },

  logoContainer: {
    overflow: "hidden",

    borderWidth: 3,

    borderColor: "#FFFFFF",

    backgroundColor: "#FFFFFF",

    alignItems: "center",

    justifyContent: "center",

    elevation: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* CONTENT                                                                */
  /* ---------------------------------------------------------------------- */

  content: {
    width: "100%",

    paddingTop: 46,

    paddingBottom: 16,
  },

  titleRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,

    minWidth: 0,

    paddingRight: 10,
  },

  restaurantName: {
    fontWeight: "800",
  },

  restaurantSubtitle: {
    marginTop: 4,

    fontWeight: "400",
  },

  /* ---------------------------------------------------------------------- */
  /* RATING                                                                 */
  /* ---------------------------------------------------------------------- */

  rating: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 31,
  },

  ratingValue: {
    marginLeft: 5,

    fontWeight: "800",
  },

  ratingReviews: {
    marginLeft: 4,

    fontWeight: "400",
  },

  /* ---------------------------------------------------------------------- */
  /* CUISINES                                                               */
  /* ---------------------------------------------------------------------- */

  tagsWrapper: {
    marginTop: 16,
  },

  cuisineContainer: {
    flexDirection: "row",

    alignItems: "center",

    overflow: "hidden",
  },

  cuisineTag: {
    minHeight: 38,

    paddingHorizontal: 15,

    marginRight: 8,

    alignItems: "center",

    justifyContent: "center",

    maxWidth: 160,
  },

  cuisineText: {
    fontWeight: "600",
  },

  /* ---------------------------------------------------------------------- */
  /* DIVIDER                                                                */
  /* ---------------------------------------------------------------------- */

  divider: {
    width: "100%",

    height: StyleSheet.hairlineWidth,

    marginVertical: 16,
  },

  /* ---------------------------------------------------------------------- */
  /* INFO                                                                   */
  /* ---------------------------------------------------------------------- */

  infoRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",
  },

  infoItem: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",

    alignItems: "flex-start",

    paddingRight: 10,
  },

  infoText: {
    flex: 1,

    minWidth: 0,

    marginLeft: 8,
  },

  infoValue: {
    fontWeight: "800",
  },

  infoLabel: {
    marginTop: 2,

    fontWeight: "400",
  },

  /* ---------------------------------------------------------------------- */
  /* FREE DELIVERY                                                          */
  /* ---------------------------------------------------------------------- */

  freeDelivery: {
    flex: 1.25,

    minWidth: 0,

    flexDirection: "row",

    alignItems: "flex-start",
  },

  freeDeliveryTextContainer: {
    flex: 1,

    minWidth: 0,

    marginLeft: 8,
  },

  freeDeliveryTitle: {
    fontWeight: "800",
  },

  freeDeliverySubtext: {
    marginTop: 2,

    fontWeight: "400",
  },
});

/* ==========================================================================
 * EXPORTS
 * ========================================================================== */

export {
  RestaurantImageCarousel,
  TopRatedBadge,
  Rating,
  CuisineTags,
  InfoItem,
};

export default UIRestaurantCard;
