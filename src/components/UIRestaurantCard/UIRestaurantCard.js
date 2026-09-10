import React, { memo, useCallback, useMemo, useState } from "react";

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

import { useUITheme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ========================================================================== */
/* DEFAULTS                                                                  */
/* ========================================================================== */

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

  onPrimary: "#FFFFFF",
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

/* ========================================================================== */
/* THEME                                                                      */
/* ========================================================================== */

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
    shadows: theme?.shadows || {},
  };
}

/* ========================================================================== */
/* IMAGE SOURCE                                                              */
/* ========================================================================== */

function normalizeImageSource(source) {
  if (!source) {
    return null;
  }

  /*
   * require("./image.png")
   *
   * React Native:
   * number
   */
  if (typeof source === "number") {
    return source;
  }

  /*
   * "https://..."
   */
  if (typeof source === "string") {
    return {
      uri: source,
    };
  }

  /*
   * { uri: "https://..." }
   */
  if (typeof source === "object" && source !== null) {
    if (source.uri) {
      return source;
    }

    /*
     * Support:
     *
     * { source: require(...) }
     */
    if (source.source) {
      return normalizeImageSource(source.source);
    }

    return source;
  }

  return null;
}

/* ========================================================================== */
/* IMAGE ARRAY                                                               */
/* ========================================================================== */

function resolveRestaurantImages({ restaurant, image, images }) {
  let result = [];

  /*
   * 1. Explicit images prop
   */
  if (Array.isArray(images) && images.length > 0) {
    result = images;
  } else if (
    /*
     * 2. restaurant.images
     */
    Array.isArray(restaurant?.images) &&
    restaurant.images.length > 0
  ) {
    result = restaurant.images;
  } else if (image) {
    /*
     * 3. Explicit image prop
     */
    result = [image];
  } else if (restaurant?.image) {
    /*
     * 4. restaurant.image
     */
    result = [restaurant.image];
  }

  return result.map(normalizeImageSource).filter(Boolean);
}

/* ========================================================================== */
/* ICON                                                                       */
/* ========================================================================== */

function RenderIcon({ icon, size = 20, color = "#000000", style }) {
  if (!icon) {
    return null;
  }

  /*
   * Already-rendered React element.
   *
   * <Ionicons name="heart" />
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
   *
   * icon={MyIcon}
   */
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  /*
   * Icon name:
   *
   * icon="star"
   */
  if (typeof icon === "string") {
    return <Ionicons name={icon} size={size} color={color} style={style} />;
  }

  return null;
}

/* ========================================================================== */
/* RESTAURANT IMAGE CAROUSEL                                                 */
/* ========================================================================== */

const RestaurantImageCarousel = memo(function RestaurantImageCarousel({
  images,
  height = 210,

  resizeMode = "cover",

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

  const data = Array.isArray(images) ? images : [];

  /*
   * Get actual width.
   */
  const handleLayout = useCallback(
    (event) => {
      const measuredWidth = event.nativeEvent.layout.width;

      if (measuredWidth > 0 && measuredWidth !== containerWidth) {
        setContainerWidth(measuredWidth);
      }
    },
    [containerWidth],
  );

  /*
   * Calculate current page.
   */
  const handleScroll = useCallback(
    (event) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;

      const pageWidth = layoutMeasurement?.width || containerWidth;

      if (!pageWidth) {
        return;
      }

      const nextIndex = Math.round(contentOffset.x / pageWidth);

      if (nextIndex < 0 || nextIndex >= data.length) {
        return;
      }

      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);

        if (typeof onImageChange === "function") {
          onImageChange(nextIndex);
        }
      }
    },
    [activeIndex, containerWidth, data.length, onImageChange],
  );

  /*
   * Empty image state.
   */
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

  /*
   * Single image.
   */
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

  /*
   * Multiple images.
   */
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
        data={data}
        horizontal
        /*
         * IMPORTANT
         *
         * This enables one full image
         * per swipe.
         */
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
        directionalLockEnabled
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScroll={handleScroll}
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

      {/* PAGINATION */}

      {showPagination ? (
        <View pointerEvents="none" style={[styles.pagination, paginationStyle]}>
          {data.map((_, index) => {
            const isActive = index === activeIndex;

            return (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,

                  {
                    backgroundColor: isActive
                      ? activeDotColor
                      : inactiveDotColor,
                  },

                  isActive
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,

                  isActive ? activeDotStyle : inactiveDotStyle,
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

/* ========================================================================== */
/* TOP RATED BADGE                                                           */
/* ========================================================================== */

const TopRatedBadge = memo(function TopRatedBadge({
  text = "Top Rated",

  icon = "flame",

  backgroundColor,

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
      {icon ? <RenderIcon icon={icon} size={16} color={color} /> : null}

      <Text
        numberOfLines={1}
        style={[
          styles.topRatedText,
          {
            color,
            fontSize,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
});

/* ========================================================================== */
/* RATING                                                                    */
/* ========================================================================== */

const Rating = memo(function Rating({
  rating,

  reviewCount,

  icon = "star",

  iconSize = 19,

  iconColor = "#FFB020",

  textColor,

  reviewColor,

  showReviewCount = true,

  style,
}) {
  if (rating === undefined || rating === null || rating === "") {
    return null;
  }

  let formattedReviews = "";

  if (reviewCount !== undefined && reviewCount !== null) {
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
            },
          ]}
        >
          ({formattedReviews})
        </Text>
      ) : null}
    </View>
  );
});

/* ========================================================================== */
/* CUISINE TAGS                                                              */
/* ========================================================================== */

const CuisineTags = memo(function CuisineTags({
  cuisines = [],

  maxTags = 3,

  backgroundColor,

  textColor,

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

/* ========================================================================== */
/* INFO ITEM                                                                 */
/* ========================================================================== */

const InfoItem = memo(function InfoItem({
  icon,

  iconSize = 23,

  iconColor,

  value,

  label,

  valueColor,

  labelColor,
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

/* ========================================================================== */
/* RESTAURANT CARD                                                           */
/* ========================================================================== */

export const UIRestaurantCard = memo(function UIRestaurantCard({
  restaurant = {},

  /* -------------------------------------------------------------------- */
  /* Interaction                                                          */
  /* -------------------------------------------------------------------- */

  onPress,

  onLongPress,

  disabled = false,

  /* -------------------------------------------------------------------- */
  /* Animation                                                            */
  /* -------------------------------------------------------------------- */

  reanimated = false,

  animationSpring,

  pressedScale = 0.985,

  /* -------------------------------------------------------------------- */
  /* Card                                                                 */
  /* -------------------------------------------------------------------- */

  width = SCREEN_WIDTH - 24,

  backgroundColor,

  borderRadius,

  shadow = true,

  style,

  contentStyle,

  /* -------------------------------------------------------------------- */
  /* Images                                                               */
  /* -------------------------------------------------------------------- */

  image,

  images,

  imageHeight = 220,

  imageResizeMode = "cover",

  showPagination = true,

  activeDotColor = "#FFFFFF",

  inactiveDotColor = "rgba(255,255,255,0.45)",

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  onImageChange,

  /* -------------------------------------------------------------------- */
  /* Top Rated                                                            */
  /* -------------------------------------------------------------------- */

  showTopRated = true,

  topRated,

  topRatedText = "Top Rated",

  topRatedIcon = "flame",

  topRatedBackgroundColor = "#FF5A5F",

  topRatedColor = "#FFFFFF",

  topRatedFontSize = 13,

  topRatedStyle,

  topRatedTextStyle,

  /* -------------------------------------------------------------------- */
  /* Favorite                                                             */
  /* -------------------------------------------------------------------- */

  showFavorite = true,

  favorite = false,

  onFavoritePress,

  favoriteIcon,

  favoriteActiveIcon = "heart",

  favoriteInactiveIcon = "heart-outline",

  favoriteSize = 25,

  favoriteColor = "#222222",

  favoriteActiveColor = "#FF4D67",

  favoriteBackgroundColor = "rgba(255,255,255,0.96)",

  favoriteButtonSize = 46,

  favoriteStyle,

  /* -------------------------------------------------------------------- */
  /* Discount                                                             */
  /* -------------------------------------------------------------------- */

  showDiscount = true,

  discount,

  discountBackgroundColor = "rgba(0,0,0,0.82)",

  discountColor = "#FFFFFF",

  discountStyle,

  discountTextStyle,

  /* -------------------------------------------------------------------- */
  /* Logo                                                                 */
  /* -------------------------------------------------------------------- */

  showLogo = true,

  logo,

  logoSize = 82,

  logoBorderRadius = 18,

  logoStyle,

  /* -------------------------------------------------------------------- */
  /* Restaurant Info                                                      */
  /* -------------------------------------------------------------------- */

  name,

  subtitle,

  nameColor,

  subtitleColor,

  nameStyle,

  subtitleStyle,

  /* -------------------------------------------------------------------- */
  /* Rating                                                               */
  /* -------------------------------------------------------------------- */

  showRating = true,

  rating,

  reviewCount,

  showReviewCount = true,

  ratingIcon = "star",

  ratingIconSize = 19,

  ratingIconColor = "#FFB020",

  ratingTextColor,

  reviewTextColor,

  ratingStyle,

  /* -------------------------------------------------------------------- */
  /* Cuisine                                                              */
  /* -------------------------------------------------------------------- */

  cuisines,

  maxCuisineTags = 3,

  tagBackgroundColor,

  tagTextColor,

  tagBorderRadius,

  tagStyle,

  tagTextStyle,

  /* -------------------------------------------------------------------- */
  /* Delivery                                                             */
  /* -------------------------------------------------------------------- */

  deliveryTime,

  deliveryTimeLabel = "Delivery time",

  deliveryIcon = "time-outline",

  deliveryIconSize = 25,

  /* -------------------------------------------------------------------- */
  /* Distance                                                             */
  /* -------------------------------------------------------------------- */

  distance,

  distanceLabel = "Away",

  distanceIcon = "location-outline",

  distanceIconSize = 25,

  /* -------------------------------------------------------------------- */
  /* Free Delivery                                                        */
  /* -------------------------------------------------------------------- */

  freeDelivery = false,

  freeDeliveryText = "Free Delivery",

  freeDeliverySubtext,

  freeDeliveryIcon = "bicycle-outline",

  freeDeliveryIconSize = 27,

  freeDeliveryColor,

  freeDeliveryIconColor,

  /* -------------------------------------------------------------------- */
  /* Divider                                                              */
  /* -------------------------------------------------------------------- */

  showDivider = true,

  dividerColor,

  /* -------------------------------------------------------------------- */
  /* Custom rendering                                                     */
  /* -------------------------------------------------------------------- */

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
  /* ==================================================================== */
  /* THEME                                                                 */
  /* ==================================================================== */

  const { theme } = useUITheme();

  const { colors, spacing, radius, animation } = resolveTheme(theme);

  /* ==================================================================== */
  /* SPRING                                                                */
  /* ==================================================================== */

  const resolvedSpring = useMemo(
    () => animationSpring ?? animation?.spring ?? DEFAULT_SPRING,
    [animationSpring, animation?.spring],
  );

  /* ==================================================================== */
  /* DATA                                                                  */
  /* ==================================================================== */

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

  /* ==================================================================== */
  /* COLORS                                                                */
  /* ==================================================================== */

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

  /* ==================================================================== */
  /* CARD PRESS ANIMATION                                                  */
  /* ==================================================================== */

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
    if (disabled || !reanimated) {
      return;
    }

    scale.value = withSpring(pressedScale, resolvedSpring);
  }, [disabled, reanimated, pressedScale, resolvedSpring, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled || !reanimated) {
      return;
    }

    scale.value = withSpring(1, resolvedSpring);
  }, [disabled, reanimated, resolvedSpring, scale]);

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

  /* ==================================================================== */
  /* IMAGE                                                                 */
  /* ==================================================================== */

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
        showPagination={showPagination}
        activeDotColor={activeDotColor}
        inactiveDotColor={inactiveDotColor}
        paginationStyle={paginationStyle}
        activeDotStyle={activeDotStyle}
        inactiveDotStyle={inactiveDotStyle}
        onImageChange={onImageChange}
      />
    );

  /* ==================================================================== */
  /* TOP RATED                                                             */
  /* ==================================================================== */

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
          backgroundColor={topRatedBackgroundColor}
          color={topRatedColor}
          fontSize={topRatedFontSize}
          style={topRatedStyle}
          textStyle={topRatedTextStyle}
        />
      )
    ) : null;

  /* ==================================================================== */
  /* FAVORITE                                                              */
  /* ==================================================================== */

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
        accessibilityRole="button"
        accessibilityLabel={
          favorite ? "Remove from favorites" : "Add to favorites"
        }
      >
        <RenderIcon
          icon={
            favoriteIcon ??
            (favorite ? favoriteActiveIcon : favoriteInactiveIcon)
          }
          size={favoriteSize}
          color={favorite ? favoriteActiveColor : favoriteColor}
        />
      </Pressable>
    )
  ) : null;

  /* ==================================================================== */
  /* DISCOUNT                                                              */
  /* ==================================================================== */

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
              },
              discountTextStyle,
            ]}
          >
            {resolvedDiscount}
          </Text>
        </View>
      )
    ) : null;

  /* ==================================================================== */
  /* RATING                                                                */
  /* ==================================================================== */

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
        iconSize={ratingIconSize}
        iconColor={ratingIconColor}
        textColor={resolvedRatingColor}
        reviewColor={resolvedReviewColor}
        showReviewCount={showReviewCount}
        style={ratingStyle}
      />
    )
  ) : null;

  /* ==================================================================== */
  /* TAGS                                                                  */
  /* ==================================================================== */

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
        borderRadius={tagBorderRadius ?? radius.pill ?? 999}
        style={tagStyle}
        textStyle={tagTextStyle}
      />
    );

  /* ==================================================================== */
  /* DELIVERY                                                              */
  /* ==================================================================== */

  const deliveryContent =
    typeof renderDelivery === "function" ? (
      renderDelivery({
        restaurant,
        deliveryTime: resolvedDeliveryTime,
      })
    ) : (
      <InfoItem
        icon={deliveryIcon}
        iconSize={deliveryIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDeliveryTime}
        label={deliveryTimeLabel}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
      />
    );

  /* ==================================================================== */
  /* DISTANCE                                                              */
  /* ==================================================================== */

  const distanceContent =
    typeof renderDistance === "function" ? (
      renderDistance({
        restaurant,
        distance: resolvedDistance,
      })
    ) : (
      <InfoItem
        icon={distanceIcon}
        iconSize={distanceIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDistance}
        label={distanceLabel}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
      />
    );

  /* ==================================================================== */
  /* FREE DELIVERY                                                         */
  /* ==================================================================== */

  const freeDeliveryContent = resolvedFreeDelivery ? (
    typeof renderFreeDelivery === "function" ? (
      renderFreeDelivery({
        restaurant,
      })
    ) : (
      <View style={styles.freeDelivery}>
        <RenderIcon
          icon={freeDeliveryIcon}
          size={freeDeliveryIconSize}
          color={resolvedFreeIconColor}
        />

        <View style={styles.freeDeliveryTextContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.freeDeliveryTitle,
              {
                color: resolvedFreeColor,
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

  /* ==================================================================== */
  /* LOGO                                                                  */
  /* ==================================================================== */

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

  /* ==================================================================== */
  /* DEFAULT CONTENT                                                       */
  /* ==================================================================== */

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
      {/* --------------------------------------------------------------- */}
      {/* NAME + RATING                                                   */}
      {/* --------------------------------------------------------------- */}

      <View style={styles.titleRow}>
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.restaurantName,
              {
                color: resolvedNameColor,
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

      {/* --------------------------------------------------------------- */}
      {/* CUISINES                                                         */}
      {/* --------------------------------------------------------------- */}

      {tagsContent ? (
        <View style={styles.tagsWrapper}>{tagsContent}</View>
      ) : null}

      {/* --------------------------------------------------------------- */}
      {/* DIVIDER                                                          */}
      {/* --------------------------------------------------------------- */}

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

      {/* --------------------------------------------------------------- */}
      {/* DELIVERY INFO                                                    */}
      {/* --------------------------------------------------------------- */}

      <View style={styles.infoRow}>
        {deliveryContent}

        {distanceContent}

        {freeDeliveryContent}
      </View>

      {/* --------------------------------------------------------------- */}
      {/* CUSTOM FOOTER                                                    */}
      {/* --------------------------------------------------------------- */}

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

  /* ==================================================================== */
  /* CARD                                                                  */
  /* ==================================================================== */

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
        {/* ============================================================= */}
        {/* IMAGE SECTION                                                  */}
        {/* ============================================================= */}

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
          {/* IMAGE CAROUSEL */}

          {imageContent}

          {/* =========================================================== */}
          {/* TOP OVERLAY                                                  */}
          {/* =========================================================== */}

          <View style={styles.topOverlay} pointerEvents="box-none">
            {/* TOP RATED */}

            {topRatedContent ? (
              <View style={styles.topRatedPosition} pointerEvents="auto">
                {topRatedContent}
              </View>
            ) : null}

            {/* FAVORITE */}

            {favoriteContent ? (
              <View style={styles.favoritePosition} pointerEvents="auto">
                {favoriteContent}
              </View>
            ) : null}
          </View>

          {/* =========================================================== */}
          {/* DISCOUNT                                                    */}
          {/* =========================================================== */}

          {discountContent ? (
            <View style={styles.discountPosition}>{discountContent}</View>
          ) : null}
        </View>

        {/* ============================================================= */}
        {/* LOGO                                                           */}
        {/* ============================================================= */}

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

        {/* ============================================================= */}
        {/* CONTENT                                                        */}
        {/* ============================================================= */}

        <Pressable
          disabled={disabled}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            pressed && !reanimated
              ? {
                  opacity: 0.96,
                }
              : null,
          ]}
        >
          {content}
        </Pressable>
      </View>
    </Animated.View>
  );
});

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

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

  /* ---------------------------------------------------------------------- */
  /* TOP RATED                                                              */
  /* ---------------------------------------------------------------------- */

  topRatedPosition: {
    zIndex: 110,
  },

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
    fontSize: 16,

    lineHeight: 21,

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

  paginationDotActive: {
    transform: [
      {
        scale: 1.15,
      },
    ],
  },

  paginationDotInactive: {
    transform: [
      {
        scale: 1,
      },
    ],
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
    fontSize: 25,

    lineHeight: 31,

    fontWeight: "800",
  },

  restaurantSubtitle: {
    marginTop: 4,

    fontSize: 15,

    lineHeight: 21,

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

    fontSize: 18,

    lineHeight: 24,

    fontWeight: "800",
  },

  ratingReviews: {
    marginLeft: 4,

    fontSize: 14,

    lineHeight: 20,

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
    fontSize: 14,

    lineHeight: 19,

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
    fontSize: 16,

    lineHeight: 22,

    fontWeight: "800",
  },

  infoLabel: {
    marginTop: 2,

    fontSize: 13,

    lineHeight: 18,

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
    fontSize: 16,

    lineHeight: 22,

    fontWeight: "800",
  },

  freeDeliverySubtext: {
    marginTop: 2,

    fontSize: 12,

    lineHeight: 17,

    fontWeight: "400",
  },
});

export default UIRestaurantCard;
