import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useUITheme } from "../../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

/* ============================================================================
 * HELPERS
 * ========================================================================== */

function normalizeImageSource(source) {
  if (!source) return null;

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return { uri: source };
  }

  if (typeof source === "object") {
    if (source.uri) {
      return source;
    }

    if (source.url) {
      return {
        uri: source.url,
      };
    }
  }

  return null;
}

function resolveRestaurantImages(restaurant) {
  if (!restaurant) return [];

  const possibleImages = [
    restaurant.images,
    restaurant.imageUrls,
    restaurant.photos,
  ];

  for (const value of possibleImages) {
    if (Array.isArray(value) && value.length > 0) {
      return value.map(normalizeImageSource).filter(Boolean);
    }
  }

  const singleImage =
    restaurant.image ||
    restaurant.imageUrl ||
    restaurant.coverImage ||
    restaurant.bannerImage;

  const normalized = normalizeImageSource(singleImage);

  return normalized ? [normalized] : [];
}

function RenderIcon({ icon, size = 20, color = "#000", style }) {
  if (!icon) return null;

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size,
      color,
      style: [icon.props?.style, style],
    });
  }

  if (typeof icon === "string") {
    return <Ionicons name={icon} size={size} color={color} style={style} />;
  }

  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  return null;
}

/* ============================================================================
 * RESTAURANT IMAGE CAROUSEL
 * ========================================================================== */

function RestaurantImageCarousel({
  images = [],
  width,
  height = 220,

  autoplay = false,
  autoplayInterval = 3000,
  loop = true,
  pauseOnTouch = true,

  borderRadius = 18,

  onImageChange,

  imageResizeMode = "cover",
  imageStyle,

  pagination = true,
  paginationPosition = "bottom",

  paginationDotSize = 6,
  paginationDotGap = 5,

  paginationActiveStyle,
  paginationInactiveStyle,

  style,
}) {
  const listRef = useRef(null);

  const [containerWidth, setContainerWidth] = useState(width || SCREEN_WIDTH);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isTouching, setIsTouching] = useState(false);

  const resolvedWidth = width || containerWidth || SCREEN_WIDTH;

  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) {
      setActiveIndex(0);
    }
  }, [hasMultipleImages]);

  useEffect(() => {
    if (!autoplay || !hasMultipleImages || (pauseOnTouch && isTouching)) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        let nextIndex = current + 1;

        if (nextIndex >= images.length) {
          if (loop) {
            nextIndex = 0;
          } else {
            return current;
          }
        }

        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({
            offset: nextIndex * resolvedWidth,
            animated: true,
          });
        });

        return nextIndex;
      });
    }, autoplayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [
    autoplay,
    autoplayInterval,
    hasMultipleImages,
    images.length,
    isTouching,
    loop,
    pauseOnTouch,
    resolvedWidth,
  ]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / resolvedWidth);

    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);

      if (typeof onImageChange === "function") {
        onImageChange(index);
      }
    }
  };

  if (!images.length) {
    return (
      <View
        style={[
          styles.imageContainer,
          {
            width: resolvedWidth,
            height,
            borderRadius,
          },
          style,
        ]}
      />
    );
  }

  if (images.length === 1) {
    return (
      <View
        onLayout={(event) => {
          if (!width) {
            setContainerWidth(event.nativeEvent.layout.width);
          }
        }}
        style={[
          styles.imageContainer,
          {
            width: "100%",
            height,
            // borderRadius,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
          },
          style,
        ]}
      >
        <Image
          source={images[0]}
          resizeMode={imageResizeMode}
          style={[
            styles.restaurantImage,
            {
              //   borderRadius,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            },
            imageStyle,
          ]}
        />
      </View>
    );
  }

  return (
    <View
      onLayout={(event) => {
        if (!width) {
          setContainerWidth(event.nativeEvent.layout.width);
        }
      }}
      style={[
        styles.imageContainer,
        {
          width: "100%",
          height,
          //   borderRadius,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
        },
        style,
      ]}
    >
      <FlatList
        ref={listRef}
        data={images}
        keyExtractor={(_, index) => `restaurant-image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          if (pauseOnTouch) {
            setIsTouching(true);
          }
        }}
        onScrollEndDrag={() => {
          if (pauseOnTouch) {
            setIsTouching(false);
          }
        }}
        onMomentumScrollEnd={() => {
          if (pauseOnTouch) {
            setIsTouching(false);
          }
        }}
        renderItem={({ item }) => (
          <Image
            source={item}
            resizeMode={imageResizeMode}
            style={[
              styles.restaurantImage,
              {
                width: resolvedWidth,
                height,
                // borderRadius,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              },
              imageStyle,
            ]}
          />
        )}
      />

      {pagination ? (
        <View
          pointerEvents="none"
          style={[
            styles.pagination,
            paginationPosition === "top" && styles.paginationTop,
          ]}
        >
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                {
                  width: paginationDotSize,
                  height: paginationDotSize,
                  borderRadius: paginationDotSize / 2,
                  marginHorizontal: paginationDotGap / 2,
                },
                index === activeIndex
                  ? styles.paginationActive
                  : styles.paginationInactive,
                index === activeIndex
                  ? paginationActiveStyle
                  : paginationInactiveStyle,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================================
 * TOP RATED
 * ========================================================================== */

function TopRatedBadge({
  label = "Top Rated",
  icon = "star",
  iconSize = 16,
  fontSize = 12,

  backgroundColor = "rgba(255,255,255,0.95)",
  color = "#222",

  style,
  textStyle,
}) {
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
      <RenderIcon icon={icon} size={iconSize} color={color} />

      <Text
        style={[
          styles.topRatedText,
          {
            color,
            fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* ============================================================================
 * RATING
 * ========================================================================== */

function Rating({
  rating,
  reviewCount,

  icon = "star",
  iconSize = 18,
  fontSize = 14,
  reviewFontSize = 13,

  color = "#222",
  reviewColor = "#666",

  style,
  ratingTextStyle,
  reviewTextStyle,
}) {
  if (rating === undefined || rating === null) {
    return null;
  }

  return (
    <View style={[styles.ratingContainer, style]}>
      <RenderIcon icon={icon} size={iconSize} color="#F5B400" />

      <Text
        style={[
          styles.ratingText,
          {
            color,
            fontSize,
          },
          ratingTextStyle,
        ]}
      >
        {rating}
      </Text>

      {reviewCount !== undefined && reviewCount !== null ? (
        <Text
          style={[
            styles.reviewCount,
            {
              color: reviewColor,
              fontSize: reviewFontSize,
            },
            reviewTextStyle,
          ]}
        >
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
}

/* ============================================================================
 * CUISINE TAGS
 * ========================================================================== */

function CuisineTags({
  tags = [],

  fontSize = 13,
  lineHeight,

  color = "#555",
  backgroundColor = "#F3F3F3",

  borderRadius = 8,

  style,
  tagStyle,
  textStyle,
}) {
  if (!tags?.length) return null;

  return (
    <View style={[styles.cuisineContainer, style]}>
      {tags.map((tag, index) => (
        <View
          key={`cuisine-${index}`}
          style={[
            styles.cuisineTag,
            {
              backgroundColor,
              borderRadius,
            },
            tagStyle,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.cuisineText,
              {
                color,
                fontSize,
                lineHeight,
              },
              textStyle,
            ]}
          >
            {typeof tag === "string" ? tag : tag?.name || tag?.title || ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ============================================================================
 * INFO ITEM
 * ========================================================================== */

function InfoItem({
  icon,
  iconSize = 20,
  iconColor = "#555",

  value,
  label,

  valueFontSize = 14,
  valueLineHeight,

  labelFontSize = 12,
  labelLineHeight,

  valueColor = "#222",
  labelColor = "#777",

  style,
  iconStyle,
  valueStyle,
  labelStyle,
}) {
  return (
    <View style={[styles.infoItem, style]}>
      <RenderIcon
        icon={icon}
        size={iconSize}
        color={iconColor}
        style={iconStyle}
      />

      <View style={styles.infoTextContainer}>
        {value !== undefined && value !== null ? (
          <Text
            numberOfLines={1}
            style={[
              styles.infoValue,
              {
                color: valueColor,
                fontSize: valueFontSize,
                lineHeight: valueLineHeight,
              },
              valueStyle,
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
                lineHeight: labelLineHeight,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================================
 * MAIN COMPONENT
 * ========================================================================== */

function UIRestaurantCard({
  restaurant = {},

  /* ------------------------------------------------------------------------
   * CARD
   * ---------------------------------------------------------------------- */

  width,
  style,
  contentStyle,

  borderRadius = 18,
  backgroundColor,

  onPress,

  /* ------------------------------------------------------------------------
   * IMAGE
   * ---------------------------------------------------------------------- */

  images,

  imageHeight = 220,
  imageResizeMode = "cover",
  imageStyle,

  autoplay = false,
  autoplayInterval = 3000,
  loop = true,
  pauseOnTouch = true,

  pagination = true,
  paginationPosition = "bottom",

  paginationDotSize = 6,
  paginationDotGap = 5,

  paginationActiveStyle,
  paginationInactiveStyle,

  onImageChange,

  /* ------------------------------------------------------------------------
   * LOGO
   * ---------------------------------------------------------------------- */

  logo,

  logoSize = 64,
  logoBorderRadius = 14,

  logoBackgroundColor,

  logoBorderWidth = 1,
  logoBorderColor = "#EEEEEE",

  logoStyle,
  logoImageStyle,

  /* ------------------------------------------------------------------------
   * TOP RATED
   * ---------------------------------------------------------------------- */

  showTopRated = true,
  topRated,

  topRatedLabel = "Top Rated",
  topRatedIcon = "star",
  topRatedIconSize = 16,
  topRatedFontSize = 12,

  topRatedBackgroundColor = "rgba(255,255,255,0.95)",
  topRatedColor = "#222",

  topRatedStyle,
  topRatedTextStyle,

  /* ------------------------------------------------------------------------
   * FAVORITE
   * ---------------------------------------------------------------------- */

  favorite,
  onFavoritePress,

  favoriteIcon,
  favoriteActiveIcon = "heart",
  favoriteInactiveIcon = "heart-outline",

  favoriteIconSize = 24,
  favoriteIconColor = "#222",
  favoriteActiveColor = "#E53935",

  favoriteBackgroundColor = "rgba(255,255,255,0.95)",

  favoriteButtonSize = 40,
  favoriteButtonStyle,

  /* ------------------------------------------------------------------------
   * DISCOUNT
   * ---------------------------------------------------------------------- */

  showDiscount = true,
  discount,

  discountIcon = "pricetag",
  discountFontSize = 14,
  discountLineHeight,
  discountIconSize = 14,
  discountColor = "#FFFFFF",
  discountBackgroundColor = "#E53935",

  discountStyle,
  discountTextStyle,

  /* ------------------------------------------------------------------------
   * NAME
   * ---------------------------------------------------------------------- */

  name,
  nameFontSize = 18,
  nameLineHeight = 24,

  nameColor,
  nameStyle,

  /* ------------------------------------------------------------------------
   * SUBTITLE
   * ---------------------------------------------------------------------- */

  subtitle,
  subtitleFontSize = 13,
  subtitleLineHeight = 18,

  subtitleColor,
  subtitleStyle,

  /* ------------------------------------------------------------------------
   * RATING
   * ---------------------------------------------------------------------- */

  rating,
  reviewCount,

  ratingFontSize = 14,
  ratingLineHeight,

  reviewCountFontSize = 13,
  reviewCountLineHeight,

  ratingIcon = "star",
  ratingIconSize = 18,

  ratingColor,
  reviewCountColor,

  ratingStyle,
  ratingTextStyle,
  reviewCountStyle,

  /* ------------------------------------------------------------------------
   * CUISINES
   * ---------------------------------------------------------------------- */

  cuisines,
  tags,

  cuisineFontSize = 13,
  cuisineLineHeight,

  cuisineColor,
  cuisineBackgroundColor,

  cuisineBorderRadius = 8,

  cuisineStyle,
  cuisineTagStyle,
  cuisineTextStyle,

  /* ------------------------------------------------------------------------
   * DELIVERY
   * ---------------------------------------------------------------------- */

  deliveryTime,
  deliveryLabel = "Delivery",

  deliveryIcon = "time-outline",
  deliveryIconSize = 20,

  deliveryTimeFontSize = 14,
  deliveryTimeLineHeight,

  deliveryLabelFontSize = 12,
  deliveryLabelLineHeight,

  deliveryTimeColor,
  deliveryLabelColor,

  deliveryStyle,

  /* ------------------------------------------------------------------------
   * DISTANCE
   * ---------------------------------------------------------------------- */

  distance,
  distanceLabel = "Distance",

  distanceIcon = "location-outline",
  distanceIconSize = 20,

  distanceFontSize = 14,
  distanceLineHeight,

  distanceLabelFontSize = 12,
  distanceLabelLineHeight,

  distanceColor,
  distanceLabelColor,

  distanceStyle,

  /* ------------------------------------------------------------------------
   * FREE DELIVERY
   * ---------------------------------------------------------------------- */

  freeDelivery = false,
  freeDeliveryText = "Free Delivery",
  freeDeliverySubtext,

  freeDeliveryIcon = "bicycle-outline",
  freeDeliveryIconSize = 21,

  freeDeliveryFontSize = 14,
  freeDeliveryLineHeight,

  freeDeliverySubtextFontSize = 12,
  freeDeliverySubtextLineHeight,

  freeDeliveryColor,
  freeDeliverySubtextColor,

  freeDeliveryStyle,

  /* ------------------------------------------------------------------------
   * DIVIDER
   * ---------------------------------------------------------------------- */

  showDivider = true,
  dividerColor,
  dividerStyle,

  /* ------------------------------------------------------------------------
   * GLOBAL SCALE
   * ---------------------------------------------------------------------- */

  textScale = 1,
  iconScale = 1,

  /* ------------------------------------------------------------------------
   * ANIMATION
   * ---------------------------------------------------------------------- */

  reanimated = false,

  animationSpring,

  /* ------------------------------------------------------------------------
   * CUSTOM
   * ---------------------------------------------------------------------- */

  renderTopRated,
  renderFavorite,
  renderLogo,
  renderDiscount,
  renderRating,
  renderCuisines,
  renderDelivery,
  renderDistance,
  renderFreeDelivery,
  renderFooter,

  children,
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};
  const spacing = theme?.spacing || {};
  const radius = theme?.radius || {};
  const animation = theme?.animation || {};

  const resolvedImages = useMemo(() => {
    if (Array.isArray(images)) {
      return images.map(normalizeImageSource).filter(Boolean);
    }

    return resolveRestaurantImages(restaurant);
  }, [images, restaurant]);

  const resolvedLogo = normalizeImageSource(
    logo || restaurant.logo || restaurant.logoUrl || restaurant.restaurantLogo,
  );

  const resolvedName =
    name ?? restaurant.name ?? restaurant.restaurantName ?? "";

  const resolvedSubtitle =
    subtitle ?? restaurant.subtitle ?? restaurant.description ?? "";

  const resolvedRating =
    rating ?? restaurant.rating ?? restaurant.averageRating;

  const resolvedReviewCount =
    reviewCount ?? restaurant.reviewCount ?? restaurant.reviewsCount;

  const resolvedCuisines =
    cuisines ?? tags ?? restaurant.cuisines ?? restaurant.tags ?? [];

  const resolvedDeliveryTime =
    deliveryTime ?? restaurant.deliveryTime ?? restaurant.deliveryTimeText;

  const resolvedDistance =
    distance ?? restaurant.distance ?? restaurant.distanceText;

  const resolvedFreeDelivery = freeDelivery ?? restaurant.freeDelivery ?? false;

  const resolvedDiscount =
    discount ?? restaurant.discount ?? restaurant.discountText;

  const resolvedFavorite =
    favorite ?? restaurant.favorite ?? restaurant.isFavorite ?? false;

  const resolvedTopRated = topRated ?? restaurant.topRated;

  const sizes = useMemo(() => {
    return {
      nameFontSize: nameFontSize * textScale,
      nameLineHeight: nameLineHeight ? nameLineHeight * textScale : undefined,

      subtitleFontSize: subtitleFontSize * textScale,
      subtitleLineHeight: subtitleLineHeight
        ? subtitleLineHeight * textScale
        : undefined,

      topRatedFontSize: topRatedFontSize * textScale,
      topRatedIconSize: topRatedIconSize * iconScale,

      favoriteIconSize: favoriteIconSize * iconScale,

      discountFontSize: discountFontSize * textScale,
      discountLineHeight: discountLineHeight
        ? discountLineHeight * textScale
        : undefined,

      ratingFontSize: ratingFontSize * textScale,
      ratingLineHeight: ratingLineHeight
        ? ratingLineHeight * textScale
        : undefined,

      reviewCountFontSize: reviewCountFontSize * textScale,
      reviewCountLineHeight: reviewCountLineHeight
        ? reviewCountLineHeight * textScale
        : undefined,

      ratingIconSize: ratingIconSize * iconScale,

      cuisineFontSize: cuisineFontSize * textScale,
      cuisineLineHeight: cuisineLineHeight
        ? cuisineLineHeight * textScale
        : undefined,

      deliveryTimeFontSize: deliveryTimeFontSize * textScale,
      deliveryTimeLineHeight: deliveryTimeLineHeight
        ? deliveryTimeLineHeight * textScale
        : undefined,

      deliveryLabelFontSize: deliveryLabelFontSize * textScale,
      deliveryLabelLineHeight: deliveryLabelLineHeight
        ? deliveryLabelLineHeight * textScale
        : undefined,

      deliveryIconSize: deliveryIconSize * iconScale,

      distanceFontSize: distanceFontSize * textScale,
      distanceLineHeight: distanceLineHeight
        ? distanceLineHeight * textScale
        : undefined,

      distanceLabelFontSize: distanceLabelFontSize * textScale,
      distanceLabelLineHeight: distanceLabelLineHeight
        ? distanceLabelLineHeight * textScale
        : undefined,

      distanceIconSize: distanceIconSize * iconScale,

      freeDeliveryFontSize: freeDeliveryFontSize * textScale,
      freeDeliveryLineHeight: freeDeliveryLineHeight
        ? freeDeliveryLineHeight * textScale
        : undefined,

      freeDeliverySubtextFontSize: freeDeliverySubtextFontSize * textScale,

      freeDeliverySubtextLineHeight: freeDeliverySubtextLineHeight
        ? freeDeliverySubtextLineHeight * textScale
        : undefined,

      freeDeliveryIconSize: freeDeliveryIconSize * iconScale,
    };
  }, [
    nameFontSize,
    nameLineHeight,
    subtitleFontSize,
    subtitleLineHeight,
    topRatedFontSize,
    topRatedIconSize,
    favoriteIconSize,
    discountFontSize,
    discountLineHeight,
    ratingFontSize,
    ratingLineHeight,
    reviewCountFontSize,
    reviewCountLineHeight,
    ratingIconSize,
    cuisineFontSize,
    cuisineLineHeight,
    deliveryTimeFontSize,
    deliveryTimeLineHeight,
    deliveryLabelFontSize,
    deliveryLabelLineHeight,
    deliveryIconSize,
    distanceFontSize,
    distanceLineHeight,
    distanceLabelFontSize,
    distanceLabelLineHeight,
    distanceIconSize,
    freeDeliveryFontSize,
    freeDeliveryLineHeight,
    freeDeliverySubtextFontSize,
    freeDeliverySubtextLineHeight,
    freeDeliveryIconSize,
    textScale,
    iconScale,
  ]);

  const resolvedBackgroundColor =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedNameColor = nameColor ?? colors.text ?? "#222222";

  const resolvedSubtitleColor =
    subtitleColor ?? colors.textSecondary ?? "#666666";

  const resolvedRatingColor = ratingColor ?? colors.text ?? "#222222";

  const resolvedCuisineColor =
    cuisineColor ?? colors.textSecondary ?? "#555555";

  const resolvedCuisineBackground =
    cuisineBackgroundColor ?? colors.surfaceSecondary ?? "#F3F3F3";

  const resolvedDeliveryColor = deliveryTimeColor ?? colors.text ?? "#222222";

  const resolvedDeliveryLabelColor =
    deliveryLabelColor ?? colors.textSecondary ?? "#777777";

  const resolvedDistanceColor = distanceColor ?? colors.text ?? "#222222";

  const resolvedDistanceLabelColor =
    distanceLabelColor ?? colors.textSecondary ?? "#777777";

  const resolvedFreeDeliveryColor =
    freeDeliveryColor ?? colors.success ?? "#159447";

  const resolvedFreeDeliverySubtextColor =
    freeDeliverySubtextColor ?? colors.textSecondary ?? "#777777";

  const resolvedDividerColor = dividerColor ?? colors.border ?? "#EEEEEE";

  /* --------------------------------------------------------------------------
   * PRESS ANIMATION
   * ------------------------------------------------------------------------ */

  const pressScale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pressScale.value,
      },
    ],
  }));

  const handlePressIn = () => {
    if (!reanimated) return;

    pressScale.value = withSpring(
      0.985,
      animationSpring ||
        animation.spring || {
          damping: 18,
          stiffness: 180,
          mass: 0.8,
        },
    );
  };

  const handlePressOut = () => {
    if (!reanimated) return;

    pressScale.value = withSpring(
      1,
      animationSpring ||
        animation.spring || {
          damping: 18,
          stiffness: 180,
          mass: 0.8,
        },
    );
  };

  /* --------------------------------------------------------------------------
   * TOP RATED
   * ------------------------------------------------------------------------ */

  const topRatedContent =
    showTopRated && resolvedTopRated !== false ? (
      typeof renderTopRated === "function" ? (
        renderTopRated({
          restaurant,
        })
      ) : (
        <TopRatedBadge
          label={topRatedLabel}
          icon={topRatedIcon}
          iconSize={sizes.topRatedIconSize}
          fontSize={sizes.topRatedFontSize}
          backgroundColor={topRatedBackgroundColor}
          color={topRatedColor}
          style={topRatedStyle}
          textStyle={topRatedTextStyle}
        />
      )
    ) : null;

  /* --------------------------------------------------------------------------
   * FAVORITE
   * ------------------------------------------------------------------------ */

  const favoriteContent = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        resolvedFavorite ? "Remove from favorites" : "Add to favorites"
      }
      onPress={onFavoritePress}
      style={[
        styles.favoriteButton,
        {
          width: favoriteButtonSize,
          height: favoriteButtonSize,
          borderRadius: favoriteButtonSize / 2,
          backgroundColor: favoriteBackgroundColor,
        },
        favoriteButtonStyle,
      ]}
    >
      <RenderIcon
        icon={favorite ? favoriteActiveIcon : favoriteInactiveIcon}
        size={sizes.favoriteIconSize}
        color={favorite ? favoriteActiveColor : favoriteIconColor}
      />
    </Pressable>
  );

  /* --------------------------------------------------------------------------
   * DISCOUNT
   * ------------------------------------------------------------------------ */

  const discountContent =
    showDiscount && resolvedDiscount ? (
      typeof renderDiscount === "function" ? (
        renderDiscount({
          restaurant,
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
          <RenderIcon
            icon={discountIcon}
            size={discountIconSize}
            color={discountColor}
          />

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

  /* --------------------------------------------------------------------------
   * LOGO
   * ------------------------------------------------------------------------ */

  const logoContent = resolvedLogo ? (
    typeof renderLogo === "function" ? (
      renderLogo({
        restaurant,
        logo: resolvedLogo,
      })
    ) : (
      <View
        style={[
          styles.logoWrapper,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: logoBorderRadius,
            backgroundColor: resolvedCuisineBackground,
            borderWidth: logoBorderWidth,
            borderColor: logoBorderColor,
          },
          logoStyle,
        ]}
      >
        <Image
          source={resolvedLogo}
          resizeMode="contain"
          style={[
            styles.logoImage,
            {
              width: logoSize - logoBorderWidth * 2,
              height: logoSize - logoBorderWidth * 2,
              borderRadius: logoBorderRadius,
            },
            logoImageStyle,
          ]}
        />
      </View>
    )
  ) : null;

  /* --------------------------------------------------------------------------
   * RATING
   * ------------------------------------------------------------------------ */

  const ratingContent =
    resolvedRating !== undefined && resolvedRating !== null ? (
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
          fontSize={sizes.ratingFontSize}
          reviewFontSize={sizes.reviewCountFontSize}
          color={resolvedRatingColor}
          reviewColor={reviewCountColor ?? colors.textSecondary ?? "#666"}
          style={ratingStyle}
          ratingTextStyle={ratingTextStyle}
          reviewTextStyle={reviewCountStyle}
        />
      )
    ) : null;

  /* --------------------------------------------------------------------------
   * CUISINES
   * ------------------------------------------------------------------------ */

  const tagsContent = resolvedCuisines?.length ? (
    typeof renderCuisines === "function" ? (
      renderCuisines({
        restaurant,
        cuisines: resolvedCuisines,
      })
    ) : (
      <CuisineTags
        tags={resolvedCuisines}
        fontSize={sizes.cuisineFontSize}
        lineHeight={sizes.cuisineLineHeight}
        color={resolvedCuisineColor}
        backgroundColor={resolvedCuisineBackground}
        borderRadius={cuisineBorderRadius}
        style={cuisineStyle}
        tagStyle={cuisineTagStyle}
        textStyle={cuisineTextStyle}
      />
    )
  ) : null;

  /* --------------------------------------------------------------------------
   * DELIVERY
   * ------------------------------------------------------------------------ */

  const deliveryContent = resolvedDeliveryTime ? (
    typeof renderDelivery === "function" ? (
      renderDelivery({
        restaurant,
      })
    ) : (
      <InfoItem
        icon={deliveryIcon}
        iconSize={sizes.deliveryIconSize}
        value={resolvedDeliveryTime}
        label={deliveryLabel}
        valueFontSize={sizes.deliveryTimeFontSize}
        valueLineHeight={sizes.deliveryTimeLineHeight}
        labelFontSize={sizes.deliveryLabelFontSize}
        labelLineHeight={sizes.deliveryLabelLineHeight}
        valueColor={resolvedDeliveryColor}
        labelColor={resolvedDeliveryLabelColor}
        style={deliveryStyle}
      />
    )
  ) : null;

  /* --------------------------------------------------------------------------
   * DISTANCE
   * ------------------------------------------------------------------------ */

  const distanceContent =
    resolvedDistance !== undefined && resolvedDistance !== null ? (
      typeof renderDistance === "function" ? (
        renderDistance({
          restaurant,
        })
      ) : (
        <InfoItem
          icon={distanceIcon}
          iconSize={sizes.distanceIconSize}
          value={resolvedDistance}
          label={distanceLabel}
          valueFontSize={sizes.distanceFontSize}
          valueLineHeight={sizes.distanceLineHeight}
          labelFontSize={sizes.distanceLabelFontSize}
          labelLineHeight={sizes.distanceLabelLineHeight}
          valueColor={resolvedDistanceColor}
          labelColor={resolvedDistanceLabelColor}
          style={distanceStyle}
        />
      )
    ) : null;

  /* --------------------------------------------------------------------------
   * FREE DELIVERY
   * ------------------------------------------------------------------------ */

  const freeDeliveryContent = resolvedFreeDelivery ? (
    typeof renderFreeDelivery === "function" ? (
      renderFreeDelivery({
        restaurant,
      })
    ) : (
      <InfoItem
        icon={freeDeliveryIcon}
        iconSize={sizes.freeDeliveryIconSize}
        value={freeDeliveryText}
        label={freeDeliverySubtext}
        valueFontSize={sizes.freeDeliveryFontSize}
        valueLineHeight={sizes.freeDeliveryLineHeight}
        labelFontSize={sizes.freeDeliverySubtextFontSize}
        labelLineHeight={sizes.freeDeliverySubtextLineHeight}
        valueColor={resolvedFreeDeliveryColor}
        labelColor={resolvedFreeDeliverySubtextColor}
        style={freeDeliveryStyle}
      />
    )
  ) : null;

  /* ==========================================================================
   * CARD CONTENT
   * ======================================================================== */

  const cardContent = (
    <>
      {/* ======================================================================
       * IMAGE
       * ==================================================================== */}

      <View
        style={[
          styles.imageSection,
          {
            height: imageHeight,
          },
        ]}
      >
        <RestaurantImageCarousel
          images={resolvedImages}
          height={imageHeight}
          autoplay={autoplay}
          autoplayInterval={autoplayInterval}
          loop={loop}
          pauseOnTouch={pauseOnTouch}
          borderRadius={borderRadius}
          pagination={pagination}
          paginationPosition={paginationPosition}
          paginationDotSize={paginationDotSize}
          paginationDotGap={paginationDotGap}
          paginationActiveStyle={paginationActiveStyle}
          paginationInactiveStyle={paginationInactiveStyle}
          onImageChange={onImageChange}
          imageResizeMode={imageResizeMode}
          imageStyle={imageStyle}
        />

        {/* ================================================================
         * TOP RATED
         * ============================================================ */}

        {topRatedContent ? (
          <View style={styles.topRatedPosition}>{topRatedContent}</View>
        ) : null}

        {/* ================================================================
         * FAVORITE
         * ============================================================ */}

        <View style={styles.favoritePosition}>{favoriteContent}</View>

        {/* ================================================================
         * DISCOUNT
         * ============================================================ */}

        {discountContent ? (
          <View style={styles.discountPosition}>{discountContent}</View>
        ) : null}

        {/* ================================================================
         * LOGO
         *
         * Logo overlaps the bottom of image.
         * ============================================================ */}

        {logoContent ? (
          <View
            pointerEvents="none"
            style={[
              styles.logoPosition,
              {
                left: spacing.lg ?? 16,
                bottom: -(logoSize / 2),
              },
            ]}
          >
            {logoContent}
          </View>
        ) : null}
      </View>

      {/* ======================================================================
       * CONTENT
       * ==================================================================== */}

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: spacing.lg ?? 16,

            /*
             * Space for the logo that overlaps
             * the image.
             */
            paddingTop: logoContent
              ? logoSize / 2 + (spacing.sm ?? 8)
              : (spacing.md ?? 12),
          },
          contentStyle,
        ]}
      >
        {/* ====================================================================
         * NAME + RATING
         *
         * IMPORTANT:
         * Name is now positioned to the RIGHT of the logo.
         * ================================================================== */}

        <View style={styles.nameRatingRow}>
          <View
            style={[
              styles.nameSection,
              logoContent
                ? {
                    paddingLeft: logoSize + (spacing.sm ?? 8),
                  }
                : null,
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
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
          </View>

          {ratingContent ? (
            <View style={styles.ratingPosition}>{ratingContent}</View>
          ) : null}
        </View>

        {/* ====================================================================
         * SUBTITLE
         *
         * Subtitle is underneath the name/logo row.
         * ================================================================== */}

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

        {/* ====================================================================
         * CUISINES
         * ================================================================== */}

        {tagsContent ? (
          <View style={styles.tagsWrapper}>{tagsContent}</View>
        ) : null}

        {/* ====================================================================
         * DIVIDER
         * ================================================================== */}

        {showDivider ? (
          <View
            style={[
              styles.divider,
              {
                backgroundColor: resolvedDividerColor,
              },
              dividerStyle,
            ]}
          />
        ) : null}

        {/* ====================================================================
         * INFO ROW
         * ================================================================== */}

        <View style={styles.infoRow}>
          {deliveryContent}
          {distanceContent}
          {freeDeliveryContent}
        </View>

        {/* ====================================================================
         * FOOTER
         * ================================================================== */}

        {typeof renderFooter === "function"
          ? renderFooter({
              restaurant,
            })
          : null}

        {children}
      </View>
    </>
  );

  /* ==========================================================================
   * PRESSABLE CARD
   * ======================================================================== */

  return (
    <Animated.View
      style={[
        {
          width: width || "100%",
        },
        reanimated ? animatedCardStyle : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: resolvedBackgroundColor,
            borderRadius,
          },
          style,
        ]}
      >
        {cardContent}
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================================
 * STYLES
 * ========================================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
  },

  /* --------------------------------------------------------------------------
   * IMAGE
   * ------------------------------------------------------------------------ */

  imageSection: {
    width: "100%",
    position: "relative",
  },

  imageContainer: {
    overflow: "hidden",
    position: "relative",
  },

  restaurantImage: {
    width: "100%",
    height: "100%",
  },

  /* --------------------------------------------------------------------------
   * TOP RATED
   * ------------------------------------------------------------------------ */

  topRatedPosition: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 30,
  },

  topRatedBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 8,
  },

  topRatedText: {
    fontWeight: "700",
  },

  /* --------------------------------------------------------------------------
   * FAVORITE
   * ------------------------------------------------------------------------ */

  favoritePosition: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 30,
  },

  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  /* --------------------------------------------------------------------------
   * DISCOUNT
   * ------------------------------------------------------------------------ */

  discountPosition: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 30,
  },

  discountBadge: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  discountText: {
    fontWeight: "800",
  },

  /* --------------------------------------------------------------------------
   * LOGO
   * ------------------------------------------------------------------------ */

  logoPosition: {
    position: "absolute",
    zIndex: 40,
  },

  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,

    elevation: 5,
  },

  logoImage: {
    resizeMode: "contain",
  },

  /* --------------------------------------------------------------------------
   * CONTENT
   * ------------------------------------------------------------------------ */

  content: {
    width: "100%",
    paddingBottom: 16,
  },

  /* --------------------------------------------------------------------------
   * NAME + RATING
   * ------------------------------------------------------------------------ */

  nameRatingRow: {
    width: "100%",
    minHeight: 28,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",
  },

  nameSection: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  restaurantName: {
    fontWeight: "800",
    includeFontPadding: false,
  },

  ratingPosition: {
    marginLeft: 10,
    flexShrink: 0,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    fontWeight: "700",
    includeFontPadding: false,
  },

  reviewCount: {
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* --------------------------------------------------------------------------
   * SUBTITLE
   * ------------------------------------------------------------------------ */

  restaurantSubtitle: {
    marginTop: 3,
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* --------------------------------------------------------------------------
   * CUISINES
   * ------------------------------------------------------------------------ */

  tagsWrapper: {
    marginTop: 10,
  },

  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },

  cuisineTag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  cuisineText: {
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* --------------------------------------------------------------------------
   * DIVIDER
   * ------------------------------------------------------------------------ */

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
  },

  /* --------------------------------------------------------------------------
   * INFO
   * ------------------------------------------------------------------------ */

  infoRow: {
    width: "100%",
    marginTop: 11,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",

    gap: 8,
  },

  infoItem: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  infoValue: {
    fontWeight: "700",
    includeFontPadding: false,
  },

  infoLabel: {
    marginTop: 1,
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* --------------------------------------------------------------------------
   * PAGINATION
   * ------------------------------------------------------------------------ */

  pagination: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  paginationTop: {
    top: 10,
    bottom: undefined,
  },

  paginationDot: {
    opacity: 0.95,
  },

  paginationActive: {
    backgroundColor: "#FFFFFF",
  },

  paginationInactive: {
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});

/* ============================================================================
 * EXPORTS
 * ========================================================================== */

export {
  RestaurantImageCarousel,
  TopRatedBadge,
  Rating,
  CuisineTags,
  InfoItem,
};

export default memo(UIRestaurantCard);
