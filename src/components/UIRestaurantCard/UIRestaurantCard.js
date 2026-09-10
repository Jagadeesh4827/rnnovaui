import React, {
  memo,
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
    return {
      uri: source,
    };
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
  if (!restaurant) {
    return [];
  }

  const imageArrays = [
    restaurant.images,
    restaurant.imageUrls,
    restaurant.photos,
  ];

  for (const value of imageArrays) {
    if (
      Array.isArray(value) &&
      value.length > 0
    ) {
      return value
        .map(normalizeImageSource)
        .filter(Boolean);
    }
  }

  const singleImage =
    restaurant.image ||
    restaurant.imageUrl ||
    restaurant.coverImage ||
    restaurant.bannerImage;

  const normalized =
    normalizeImageSource(singleImage);

  return normalized
    ? [normalized]
    : [];
}

/* ============================================================================
 * ICON RENDERER
 * ========================================================================== */

function RenderIcon({
  icon,
  size = 20,
  color = "#000",
  style,
}) {
  if (!icon) {
    return null;
  }

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size,
      color,
      style: [
        icon.props?.style,
        style,
      ],
    });
  }

  if (typeof icon === "string") {
    return (
      <Ionicons
        name={icon}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (
    typeof icon === "function" ||
    (
      typeof icon === "object" &&
      icon !== null
    )
  ) {
    const IconComponent = icon;

    return (
      <IconComponent
        size={size}
        color={color}
        style={style}
      />
    );
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

  imageResizeMode = "cover",
  imageStyle,

  pagination = true,
  paginationPosition = "bottom",

  paginationDotSize = 6,
  paginationDotGap = 5,

  paginationActiveStyle,
  paginationInactiveStyle,

  onImageChange,

  style,
}) {
  const listRef = useRef(null);

  const [containerWidth, setContainerWidth] =
    useState(width || SCREEN_WIDTH);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isTouching, setIsTouching] =
    useState(false);

  const resolvedWidth =
    width ||
    containerWidth ||
    SCREEN_WIDTH;

  const hasMultipleImages =
    images.length > 1;

  /* --------------------------------------------------------------------------
   * AUTOPLAY
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !autoplay ||
      !hasMultipleImages ||
      (pauseOnTouch && isTouching)
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        let nextIndex =
          current + 1;

        if (
          nextIndex >= images.length
        ) {
          if (loop) {
            nextIndex = 0;
          } else {
            return current;
          }
        }

        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset(
            {
              offset:
                nextIndex *
                resolvedWidth,
              animated: true,
            },
          );
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

  /* --------------------------------------------------------------------------
   * SCROLL
   * ------------------------------------------------------------------------ */

  const handleScroll = (event) => {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / resolvedWidth,
    );

    if (
      index !== activeIndex &&
      index >= 0 &&
      index < images.length
    ) {
      setActiveIndex(index);

      if (
        typeof onImageChange ===
        "function"
      ) {
        onImageChange(index);
      }
    }
  };

  /* --------------------------------------------------------------------------
   * EMPTY
   * ------------------------------------------------------------------------ */

  if (!images.length) {
    return (
      <View
        style={[
          styles.imageContainer,
          {
            width: "100%",
            height,
            borderRadius,
          },
          style,
        ]}
      />
    );
  }

  /* --------------------------------------------------------------------------
   * SINGLE IMAGE
   * ------------------------------------------------------------------------ */

  if (images.length === 1) {
    return (
      <View
        onLayout={(event) => {
          if (!width) {
            setContainerWidth(
              event.nativeEvent.layout.width,
            );
          }
        }}
        style={[
          styles.imageContainer,
          {
            width: "100%",
            height,
            borderRadius,
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
              width: "100%",
              height: "100%",
              borderRadius,
            },
            imageStyle,
          ]}
        />
      </View>
    );
  }

  /* --------------------------------------------------------------------------
   * MULTIPLE IMAGES
   * ------------------------------------------------------------------------ */

  return (
    <View
      onLayout={(event) => {
        if (!width) {
          setContainerWidth(
            event.nativeEvent.layout.width,
          );
        }
      }}
      style={[
        styles.imageContainer,
        {
          width: "100%",
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <FlatList
        ref={listRef}
        data={images}
        keyExtractor={(_, index) =>
          `restaurant-image-${index}`
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
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
                borderRadius,
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
            paginationPosition === "top" &&
              styles.paginationTop,
          ]}
        >
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                {
                  width:
                    paginationDotSize,
                  height:
                    paginationDotSize,
                  borderRadius:
                    paginationDotSize / 2,
                  marginHorizontal:
                    paginationDotGap / 2,
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

  backgroundColor =
    "rgba(255,255,255,0.95)",

  color = "#222",

  paddingHorizontal = 10,
  paddingVertical = 7,

  borderRadius = 8,

  style,
  textStyle,
}) {
  return (
    <View
      style={[
        styles.topRatedBadge,
        {
          backgroundColor,
          paddingHorizontal,
          paddingVertical,
          borderRadius,
        },
        style,
      ]}
    >
      <RenderIcon
        icon={icon}
        size={iconSize}
        color={color}
      />

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
  lineHeight,

  reviewFontSize = 13,
  reviewLineHeight,

  color = "#222",
  reviewColor = "#666",

  gap = 4,

  style,
  ratingTextStyle,
  reviewTextStyle,
}) {
  if (
    rating === undefined ||
    rating === null
  ) {
    return null;
  }

  return (
    <View
      style={[
        styles.ratingContainer,
        {
          gap,
        },
        style,
      ]}
    >
      <RenderIcon
        icon={icon}
        size={iconSize}
        color="#F5B400"
      />

      <Text
        style={[
          styles.ratingText,
          {
            color,
            fontSize,
            lineHeight,
          },
          ratingTextStyle,
        ]}
      >
        {rating}
      </Text>

      {reviewCount !== undefined &&
      reviewCount !== null ? (
        <Text
          style={[
            styles.reviewCount,
            {
              color: reviewColor,
              fontSize: reviewFontSize,
              lineHeight:
                reviewLineHeight,
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

  paddingHorizontal = 9,
  paddingVertical = 5,

  gap = 6,

  style,
  tagStyle,
  textStyle,
}) {
  if (!tags?.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.cuisineContainer,
        {
          gap,
        },
        style,
      ]}
    >
      {tags.map((tag, index) => (
        <View
          key={`cuisine-${index}`}
          style={[
            styles.cuisineTag,
            {
              backgroundColor,
              borderRadius,
              paddingHorizontal,
              paddingVertical,
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
            {typeof tag === "string"
              ? tag
              : tag?.name ||
                tag?.title ||
                ""}
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

  iconTextGap = 6,

  style,
  iconStyle,
  valueStyle,
  labelStyle,
}) {
  return (
    <View
      style={[
        styles.infoItem,
        style,
      ]}
    >
      <RenderIcon
        icon={icon}
        size={iconSize}
        color={iconColor}
        style={iconStyle}
      />

      <View
        style={[
          styles.infoTextContainer,
          {
            marginLeft: iconTextGap,
          },
        ]}
      >
        {value !== undefined &&
        value !== null ? (
          <Text
            numberOfLines={1}
            style={[
              styles.infoValue,
              {
                color: valueColor,
                fontSize: valueFontSize,
                lineHeight:
                  valueLineHeight,
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
                lineHeight:
                  labelLineHeight,
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
 * MAIN UI RESTAURANT CARD
 * ========================================================================== */

function UIRestaurantCard({
  restaurant = {},

  /* ==========================================================================
   * CARD
   * ======================================================================== */

  width,

  style,

  backgroundColor,

  borderRadius = 18,

  padding = 0,
  paddingHorizontal = 0,
  paddingVertical = 0,

  margin = 0,
  marginHorizontal = 0,
  marginVertical = 0,

  cardShadow = false,

  onPress,

  /* ==========================================================================
   * IMAGE
   * ======================================================================== */

  images,

  imageHeight = 240,

  imageWidth = "100%",

  imageResizeMode = "cover",

  imageBorderRadius = 18,

  imageMargin = 0,
  imageMarginTop = 0,
  imageMarginBottom = 0,
  imageMarginHorizontal = 0,
  imageMarginLeft = 0,
  imageMarginRight = 0,

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

  /* ==========================================================================
   * LOGO
   * ======================================================================== */

  logo,

  logoSize = 72,

  logoBorderRadius = 16,

  logoBackgroundColor = "#FFFFFF",

  logoBorderWidth = 1,
  logoBorderColor = "#E5E5E5",

  logoPadding = 5,

  logoShadow = true,

  logoOffsetX = 0,
  logoOffsetY = 0,

  logoMargin = 0,

  logoStyle,
  logoImageStyle,

  /* ==========================================================================
   * CONTENT
   * ======================================================================== */

  contentPadding = 16,

  contentPaddingTop,
  contentPaddingBottom,
  contentPaddingHorizontal,
  contentPaddingLeft,
  contentPaddingRight,

  contentMargin = 0,
  contentMarginTop = 0,
  contentMarginBottom = 0,
  contentMarginHorizontal = 0,
  contentMarginLeft = 0,
  contentMarginRight = 0,

  contentStyle,

  /* ==========================================================================
   * NAME + LOGO LAYOUT
   * ======================================================================== */

  nameLogoGap = 12,

  nameRatingGap = 8,

  nameSectionMarginTop = 0,
  nameSectionMarginBottom = 0,

  nameSectionStyle,

  /* ==========================================================================
   * TOP RATED
   * ======================================================================== */

  showTopRated = true,

  topRated,

  topRatedLabel = "Top Rated",

  topRatedIcon = "star",

  topRatedIconSize = 16,

  topRatedFontSize = 13,

  topRatedBackgroundColor =
    "rgba(255,255,255,0.95)",

  topRatedColor = "#222",

  topRatedPaddingHorizontal = 10,
  topRatedPaddingVertical = 7,

  topRatedBorderRadius = 8,

  topRatedTop = 14,
  topRatedLeft = 14,

  topRatedStyle,
  topRatedTextStyle,

  /* ==========================================================================
   * FAVORITE
   * ======================================================================== */

  favorite,

  onFavoritePress,

  favoriteIcon,

  favoriteActiveIcon = "heart",

  favoriteInactiveIcon =
    "heart-outline",

  favoriteIconSize = 27,

  favoriteIconColor = "#222",

  favoriteActiveColor = "#E53935",

  favoriteBackgroundColor =
    "rgba(255,255,255,0.95)",

  favoriteButtonSize = 48,

  favoriteTop = 14,
  favoriteRight = 14,

  favoriteButtonStyle,

  /* ==========================================================================
   * DISCOUNT
   * ======================================================================== */

  showDiscount = true,

  discount,

  discountIcon = "pricetag",

  discountFontSize = 16,

  discountLineHeight,

  discountIconSize = 17,

  discountColor = "#FFFFFF",

  discountBackgroundColor = "#E53935",

  discountPaddingHorizontal = 12,
  discountPaddingVertical = 9,

  discountBorderRadius = 10,

  discountBottom = 14,
  discountRight = 14,

  discountStyle,

  discountTextStyle,

  /* ==========================================================================
   * RESTAURANT NAME
   * ======================================================================== */

  name,

  nameFontSize = 24,

  nameLineHeight = 30,

  nameColor,

  nameFontWeight = "800",

  nameStyle,

  /* ==========================================================================
   * SUBTITLE
   * ======================================================================== */

  subtitle,

  subtitleFontSize = 15,

  subtitleLineHeight = 21,

  subtitleColor,

  subtitleMarginTop = 5,

  subtitleMarginBottom = 0,

  subtitleStyle,

  /* ==========================================================================
   * RATING
   * ======================================================================== */

  rating,

  reviewCount,

  ratingFontSize = 16,

  ratingLineHeight,

  reviewCountFontSize = 14,

  reviewCountLineHeight,

  ratingIcon = "star",

  ratingIconSize = 19,

  ratingColor,

  reviewCountColor,

  ratingGap = 4,

  ratingStyle,

  ratingTextStyle,

  reviewCountStyle,

  /* ==========================================================================
   * CUISINES
   * ======================================================================== */

  cuisines,

  tags,

  cuisineFontSize = 15,

  cuisineLineHeight,

  cuisineColor,

  cuisineBackgroundColor,

  cuisineBorderRadius = 10,

  cuisinePaddingHorizontal = 11,

  cuisinePaddingVertical = 7,

  cuisineGap = 7,

  cuisineMarginTop = 14,

  cuisineMarginBottom = 0,

  cuisineStyle,

  cuisineTagStyle,

  cuisineTextStyle,

  /* ==========================================================================
   * DIVIDER
   * ======================================================================== */

  showDivider = true,

  dividerColor,

  dividerHeight = StyleSheet.hairlineWidth,

  dividerMarginTop = 14,

  dividerMarginBottom = 13,

  dividerStyle,

  /* ==========================================================================
   * DELIVERY
   * ======================================================================== */

  deliveryTime,

  deliveryLabel = "Delivery",

  deliveryIcon = "time-outline",

  deliveryIconSize = 23,

  deliveryIconColor,

  deliveryTimeFontSize = 16,

  deliveryTimeLineHeight,

  deliveryLabelFontSize = 14,

  deliveryLabelLineHeight,

  deliveryTimeColor,

  deliveryLabelColor,

  deliveryIconTextGap = 7,

  deliveryStyle,

  deliveryValueStyle,

  deliveryLabelStyle,

  /* ==========================================================================
   * DISTANCE
   * ======================================================================== */

  distance,

  distanceLabel = "Distance",

  distanceIcon = "location-outline",

  distanceIconSize = 23,

  distanceIconColor,

  distanceFontSize = 16,

  distanceLineHeight,

  distanceLabelFontSize = 14,

  distanceLabelLineHeight,

  distanceColor,

  distanceLabelColor,

  distanceIconTextGap = 7,

  distanceStyle,

  distanceValueStyle,

  distanceLabelStyle,

  /* ==========================================================================
   * FREE DELIVERY
   * ======================================================================== */

  freeDelivery = false,

  freeDeliveryText = "Free Delivery",

  freeDeliverySubtext,

  freeDeliveryIcon = "bicycle-outline",

  freeDeliveryIconSize = 23,

  freeDeliveryIconColor,

  freeDeliveryFontSize = 16,

  freeDeliveryLineHeight,

  freeDeliverySubtextFontSize = 13,

  freeDeliverySubtextLineHeight,

  freeDeliveryColor,

  freeDeliverySubtextColor,

  freeDeliveryIconTextGap = 7,

  freeDeliveryStyle,

  /* ==========================================================================
   * GLOBAL SCALE
   * ======================================================================== */

  textScale = 1,

  iconScale = 1,

  /* ==========================================================================
   * ANIMATION
   * ======================================================================== */

  reanimated = false,

  animationSpring,

  /* ==========================================================================
   * CUSTOM RENDERERS
   * ======================================================================== */

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

  const colors =
    theme?.colors || {};

  const spacing =
    theme?.spacing || {};

  const animation =
    theme?.animation || {};

  /* ==========================================================================
   * RESOLVE DATA
   * ======================================================================== */

  const resolvedImages = useMemo(() => {
    if (Array.isArray(images)) {
      return images
        .map(normalizeImageSource)
        .filter(Boolean);
    }

    return resolveRestaurantImages(
      restaurant,
    );
  }, [images, restaurant]);

  const resolvedLogo =
    normalizeImageSource(
      logo ||
        restaurant.logo ||
        restaurant.logoUrl ||
        restaurant.restaurantLogo,
    );

  const resolvedName =
    name ??
    restaurant.name ??
    restaurant.restaurantName ??
    "";

  const resolvedSubtitle =
    subtitle ??
    restaurant.subtitle ??
    restaurant.description ??
    "";

  const resolvedRating =
    rating ??
    restaurant.rating ??
    restaurant.averageRating;

  const resolvedReviewCount =
    reviewCount ??
    restaurant.reviewCount ??
    restaurant.reviewsCount;

  const resolvedCuisines =
    cuisines ??
    tags ??
    restaurant.cuisines ??
    restaurant.tags ??
    [];

  const resolvedDeliveryTime =
    deliveryTime ??
    restaurant.deliveryTime ??
    restaurant.deliveryTimeText;

  const resolvedDistance =
    distance ??
    restaurant.distance ??
    restaurant.distanceText;

  const resolvedFreeDelivery =
    freeDelivery ??
    restaurant.freeDelivery ??
    false;

  const resolvedDiscount =
    discount ??
    restaurant.discount ??
    restaurant.discountText;

  const resolvedFavorite =
    favorite ??
    restaurant.favorite ??
    restaurant.isFavorite ??
    false;

  const resolvedTopRated =
    topRated ??
    restaurant.topRated;

  /* ==========================================================================
   * SIZES
   * ======================================================================== */

  const sizes = useMemo(
    () => ({
      nameFontSize:
        nameFontSize * textScale,

      nameLineHeight:
        nameLineHeight
          ? nameLineHeight *
            textScale
          : undefined,

      subtitleFontSize:
        subtitleFontSize * textScale,

      subtitleLineHeight:
        subtitleLineHeight
          ? subtitleLineHeight *
            textScale
          : undefined,

      topRatedFontSize:
        topRatedFontSize * textScale,

      topRatedIconSize:
        topRatedIconSize * iconScale,

      favoriteIconSize:
        favoriteIconSize * iconScale,

      discountFontSize:
        discountFontSize * textScale,

      discountLineHeight:
        discountLineHeight
          ? discountLineHeight *
            textScale
          : undefined,

      discountIconSize:
        discountIconSize * iconScale,

      ratingFontSize:
        ratingFontSize * textScale,

      ratingLineHeight:
        ratingLineHeight
          ? ratingLineHeight *
            textScale
          : undefined,

      reviewCountFontSize:
        reviewCountFontSize *
        textScale,

      reviewCountLineHeight:
        reviewCountLineHeight
          ? reviewCountLineHeight *
            textScale
          : undefined,

      ratingIconSize:
        ratingIconSize * iconScale,

      cuisineFontSize:
        cuisineFontSize * textScale,

      cuisineLineHeight:
        cuisineLineHeight
          ? cuisineLineHeight *
            textScale
          : undefined,

      deliveryTimeFontSize:
        deliveryTimeFontSize *
        textScale,

      deliveryTimeLineHeight:
        deliveryTimeLineHeight
          ? deliveryTimeLineHeight *
            textScale
          : undefined,

      deliveryLabelFontSize:
        deliveryLabelFontSize *
        textScale,

      deliveryLabelLineHeight:
        deliveryLabelLineHeight
          ? deliveryLabelLineHeight *
            textScale
          : undefined,

      deliveryIconSize:
        deliveryIconSize * iconScale,

      distanceFontSize:
        distanceFontSize * textScale,

      distanceLineHeight:
        distanceLineHeight
          ? distanceLineHeight *
            textScale
          : undefined,

      distanceLabelFontSize:
        distanceLabelFontSize *
        textScale,

      distanceLabelLineHeight:
        distanceLabelLineHeight
          ? distanceLabelLineHeight *
            textScale
          : undefined,

      distanceIconSize:
        distanceIconSize * iconScale,

      freeDeliveryFontSize:
        freeDeliveryFontSize *
        textScale,

      freeDeliveryLineHeight:
        freeDeliveryLineHeight
          ? freeDeliveryLineHeight *
            textScale
          : undefined,

      freeDeliverySubtextFontSize:
        freeDeliverySubtextFontSize *
        textScale,

      freeDeliverySubtextLineHeight:
        freeDeliverySubtextLineHeight
          ? freeDeliverySubtextLineHeight *
            textScale
          : undefined,

      freeDeliveryIconSize:
        freeDeliveryIconSize *
        iconScale,
    }),
    [
      nameFontSize,
      nameLineHeight,
      subtitleFontSize,
      subtitleLineHeight,

      topRatedFontSize,
      topRatedIconSize,

      favoriteIconSize,

      discountFontSize,
      discountLineHeight,
      discountIconSize,

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
    ],
  );

  /* ==========================================================================
   * COLORS
   * ======================================================================== */

  const resolvedBackgroundColor =
    backgroundColor ??
    colors.card ??
    colors.surface ??
    "#FFFFFF";

  const resolvedNameColor =
    nameColor ??
    colors.text ??
    "#222222";

  const resolvedSubtitleColor =
    subtitleColor ??
    colors.textSecondary ??
    "#666666";

  const resolvedRatingColor =
    ratingColor ??
    colors.text ??
    "#222222";

  const resolvedCuisineColor =
    cuisineColor ??
    colors.textSecondary ??
    "#555555";

  const resolvedCuisineBackground =
    cuisineBackgroundColor ??
    colors.surfaceSecondary ??
    "#F3F3F3";

  const resolvedDeliveryColor =
    deliveryTimeColor ??
    colors.text ??
    "#222222";

  const resolvedDeliveryLabelColor =
    deliveryLabelColor ??
    colors.textSecondary ??
    "#777777";

  const resolvedDistanceColor =
    distanceColor ??
    colors.text ??
    "#222222";

  const resolvedDistanceLabelColor =
    distanceLabelColor ??
    colors.textSecondary ??
    "#777777";

  const resolvedFreeDeliveryColor =
    freeDeliveryColor ??
    colors.success ??
    "#159447";

  const resolvedFreeDeliverySubtextColor =
    freeDeliverySubtextColor ??
    colors.textSecondary ??
    "#777777";

  const resolvedDividerColor =
    dividerColor ??
    colors.border ??
    "#EEEEEE";

  /* ==========================================================================
   * PRESS ANIMATION
   * ======================================================================== */

  const pressScale =
    useSharedValue(1);

  const animatedCardStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: pressScale.value,
        },
      ],
    }));

  const handlePressIn = () => {
    if (!reanimated) {
      return;
    }

    pressScale.value =
      withSpring(
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
    if (!reanimated) {
      return;
    }

    pressScale.value =
      withSpring(
        1,
        animationSpring ||
          animation.spring || {
            damping: 18,
            stiffness: 180,
            mass: 0.8,
          },
      );
  };

  /* ==========================================================================
   * TOP RATED
   * ======================================================================== */

  const topRatedContent =
    showTopRated &&
    resolvedTopRated !== false
      ? typeof renderTopRated ===
        "function"
        ? renderTopRated({
            restaurant,
          })
        : (
          <TopRatedBadge
            label={
              topRatedLabel
            }
            icon={
              topRatedIcon
            }
            iconSize={
              sizes.topRatedIconSize
            }
            fontSize={
              sizes.topRatedFontSize
            }
            backgroundColor={
              topRatedBackgroundColor
            }
            color={
              topRatedColor
            }
            paddingHorizontal={
              topRatedPaddingHorizontal
            }
            paddingVertical={
              topRatedPaddingVertical
            }
            borderRadius={
              topRatedBorderRadius
            }
            style={
              topRatedStyle
            }
            textStyle={
              topRatedTextStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * FAVORITE
   * ======================================================================== */

  const favoriteContent = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        resolvedFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      onPress={
        onFavoritePress
      }
      style={[
        styles.favoriteButton,
        {
          width:
            favoriteButtonSize,
          height:
            favoriteButtonSize,
          borderRadius:
            favoriteButtonSize /
            2,
          backgroundColor:
            favoriteBackgroundColor,
        },
        favoriteButtonStyle,
      ]}
    >
      <RenderIcon
        icon={
          resolvedFavorite
            ? favoriteActiveIcon
            : favoriteInactiveIcon
        }
        size={
          sizes.favoriteIconSize
        }
        color={
          resolvedFavorite
            ? favoriteActiveColor
            : favoriteIconColor
        }
        style={favoriteIcon}
      />
    </Pressable>
  );

  /* ==========================================================================
   * DISCOUNT
   * ======================================================================== */

  const discountContent =
    showDiscount &&
    resolvedDiscount
      ? typeof renderDiscount ===
        "function"
        ? renderDiscount({
            restaurant,
          })
        : (
          <View
            style={[
              styles.discountBadge,
              {
                backgroundColor:
                  discountBackgroundColor,

                paddingHorizontal:
                  discountPaddingHorizontal,

                paddingVertical:
                  discountPaddingVertical,

                borderRadius:
                  discountBorderRadius,
              },
              discountStyle,
            ]}
          >
            <RenderIcon
              icon={
                discountIcon
              }
              size={
                sizes.discountIconSize
              }
              color={
                discountColor
              }
            />

            <Text
              style={[
                styles.discountText,
                {
                  color:
                    discountColor,

                  fontSize:
                    sizes.discountFontSize,

                  lineHeight:
                    sizes.discountLineHeight,
                },
                discountTextStyle,
              ]}
            >
              {resolvedDiscount}
            </Text>
          </View>
        )
      : null;

  /* ==========================================================================
   * LOGO
   * ======================================================================== */

  const logoContent =
    resolvedLogo
      ? typeof renderLogo ===
        "function"
        ? renderLogo({
            restaurant,
            logo:
              resolvedLogo,
          })
        : (
          <View
            style={[
              styles.logoWrapper,
              {
                width:
                  logoSize,

                height:
                  logoSize,

                borderRadius:
                  logoBorderRadius,

                backgroundColor:
                  logoBackgroundColor,

                borderWidth:
                  logoBorderWidth,

                borderColor:
                  logoBorderColor,

                padding:
                  logoPadding,

                margin:
                  logoMargin,

                ...(logoShadow
                  ? {
                      shadowColor:
                        "#000000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity:
                        0.14,
                      shadowRadius:
                        6,
                      elevation: 5,
                    }
                  : {
                      shadowOpacity:
                        0,
                      elevation: 0,
                    }),
              },
              logoStyle,
            ]}
          >
            <Image
              source={
                resolvedLogo
              }
              resizeMode="contain"
              style={[
                styles.logoImage,
                {
                  width:
                    "100%",
                  height:
                    "100%",
                  borderRadius:
                    logoBorderRadius,
                },
                logoImageStyle,
              ]}
            />
          </View>
        )
      : null;

  /* ==========================================================================
   * RATING
   * ======================================================================== */

  const ratingContent =
    resolvedRating !==
      undefined &&
    resolvedRating !== null
      ? typeof renderRating ===
        "function"
        ? renderRating({
            restaurant,
            rating:
              resolvedRating,
            reviewCount:
              resolvedReviewCount,
          })
        : (
          <Rating
            rating={
              resolvedRating
            }
            reviewCount={
              resolvedReviewCount
            }
            icon={
              ratingIcon
            }
            iconSize={
              sizes.ratingIconSize
            }
            fontSize={
              sizes.ratingFontSize
            }
            lineHeight={
              sizes.ratingLineHeight
            }
            reviewFontSize={
              sizes.reviewCountFontSize
            }
            reviewLineHeight={
              sizes.reviewCountLineHeight
            }
            color={
              resolvedRatingColor
            }
            reviewColor={
              reviewCountColor ??
              colors.textSecondary ??
              "#666666"
            }
            gap={
              ratingGap
            }
            style={
              ratingStyle
            }
            ratingTextStyle={
              ratingTextStyle
            }
            reviewTextStyle={
              reviewCountStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * CUISINES
   * ======================================================================== */

  const tagsContent =
    resolvedCuisines?.length
      ? typeof renderCuisines ===
        "function"
        ? renderCuisines({
            restaurant,
            cuisines:
              resolvedCuisines,
          })
        : (
          <CuisineTags
            tags={
              resolvedCuisines
            }
            fontSize={
              sizes.cuisineFontSize
            }
            lineHeight={
              sizes.cuisineLineHeight
            }
            color={
              resolvedCuisineColor
            }
            backgroundColor={
              resolvedCuisineBackground
            }
            borderRadius={
              cuisineBorderRadius
            }
            paddingHorizontal={
              cuisinePaddingHorizontal
            }
            paddingVertical={
              cuisinePaddingVertical
            }
            gap={
              cuisineGap
            }
            style={
              cuisineStyle
            }
            tagStyle={
              cuisineTagStyle
            }
            textStyle={
              cuisineTextStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * DELIVERY
   * ======================================================================== */

  const deliveryContent =
    resolvedDeliveryTime
      ? typeof renderDelivery ===
        "function"
        ? renderDelivery({
            restaurant,
          })
        : (
          <InfoItem
            icon={
              deliveryIcon
            }
            iconSize={
              sizes.deliveryIconSize
            }
            iconColor={
              deliveryIconColor ??
              colors.textSecondary ??
              "#555555"
            }
            value={
              resolvedDeliveryTime
            }
            label={
              deliveryLabel
            }
            valueFontSize={
              sizes.deliveryTimeFontSize
            }
            valueLineHeight={
              sizes.deliveryTimeLineHeight
            }
            labelFontSize={
              sizes.deliveryLabelFontSize
            }
            labelLineHeight={
              sizes.deliveryLabelLineHeight
            }
            valueColor={
              resolvedDeliveryColor
            }
            labelColor={
              resolvedDeliveryLabelColor
            }
            iconTextGap={
              deliveryIconTextGap
            }
            style={
              deliveryStyle
            }
            valueStyle={
              deliveryValueStyle
            }
            labelStyle={
              deliveryLabelStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * DISTANCE
   * ======================================================================== */

  const distanceContent =
    resolvedDistance !==
      undefined &&
    resolvedDistance !== null
      ? typeof renderDistance ===
        "function"
        ? renderDistance({
            restaurant,
          })
        : (
          <InfoItem
            icon={
              distanceIcon
            }
            iconSize={
              sizes.distanceIconSize
            }
            iconColor={
              distanceIconColor ??
              colors.textSecondary ??
              "#555555"
            }
            value={
              resolvedDistance
            }
            label={
              distanceLabel
            }
            valueFontSize={
              sizes.distanceFontSize
            }
            valueLineHeight={
              sizes.distanceLineHeight
            }
            labelFontSize={
              sizes.distanceLabelFontSize
            }
            labelLineHeight={
              sizes.distanceLabelLineHeight
            }
            valueColor={
              resolvedDistanceColor
            }
            labelColor={
              resolvedDistanceLabelColor
            }
            iconTextGap={
              distanceIconTextGap
            }
            style={
              distanceStyle
            }
            valueStyle={
              distanceValueStyle
            }
            labelStyle={
              distanceLabelStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * FREE DELIVERY
   * ======================================================================== */

  const freeDeliveryContent =
    resolvedFreeDelivery
      ? typeof renderFreeDelivery ===
        "function"
        ? renderFreeDelivery({
            restaurant,
          })
        : (
          <InfoItem
            icon={
              freeDeliveryIcon
            }
            iconSize={
              sizes.freeDeliveryIconSize
            }
            iconColor={
              freeDeliveryIconColor ??
              resolvedFreeDeliveryColor
            }
            value={
              freeDeliveryText
            }
            label={
              freeDeliverySubtext
            }
            valueFontSize={
              sizes.freeDeliveryFontSize
            }
            valueLineHeight={
              sizes.freeDeliveryLineHeight
            }
            labelFontSize={
              sizes.freeDeliverySubtextFontSize
            }
            labelLineHeight={
              sizes.freeDeliverySubtextLineHeight
            }
            valueColor={
              resolvedFreeDeliveryColor
            }
            labelColor={
              resolvedFreeDeliverySubtextColor
            }
            iconTextGap={
              freeDeliveryIconTextGap
            }
            style={
              freeDeliveryStyle
            }
          />
        )
      : null;

  /* ==========================================================================
   * CONTENT PADDING
   * ======================================================================== */

  const finalContentPaddingLeft =
    contentPaddingLeft ??
    contentPaddingHorizontal ??
    contentPadding;

  const finalContentPaddingRight =
    contentPaddingRight ??
    contentPaddingHorizontal ??
    contentPadding;

  const finalContentPaddingTop =
    contentPaddingTop ??
    contentPadding;

  const finalContentPaddingBottom =
    contentPaddingBottom ??
    contentPadding;

  /* ==========================================================================
   * CARD
   * ======================================================================== */

  return (
    <Animated.View
      style={[
        {
          width:
            width || "100%",

          margin,

          marginHorizontal,

          marginVertical,
        },

        reanimated
          ? animatedCardStyle
          : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={
          handlePressIn
        }
        onPressOut={
          handlePressOut
        }
        style={[
          styles.card,

          {
            backgroundColor:
              resolvedBackgroundColor,

            borderRadius,

            padding,

            paddingHorizontal,

            paddingVertical,
          },

          cardShadow
            ? styles.cardShadow
            : null,

          style,
        ]}
      >
        {/* ====================================================================
         * IMAGE SECTION
         * ================================================================== */}

        <View
          style={[
            styles.imageSection,

            {
              width:
                imageWidth,

              height:
                imageHeight,

              margin:
                imageMargin,

              marginTop:
                imageMarginTop,

              marginBottom:
                imageMarginBottom,

              marginHorizontal:
                imageMarginHorizontal,

              marginLeft:
                imageMarginLeft,

              marginRight:
                imageMarginRight,

              borderRadius:
                imageBorderRadius,
            },
          ]}
        >
          <RestaurantImageCarousel
            images={
              resolvedImages
            }
            height={
              imageHeight
            }
            autoplay={
              autoplay
            }
            autoplayInterval={
              autoplayInterval
            }
            loop={loop}
            pauseOnTouch={
              pauseOnTouch
            }
            borderRadius={
              imageBorderRadius
            }
            pagination={
              pagination
            }
            paginationPosition={
              paginationPosition
            }
            paginationDotSize={
              paginationDotSize
            }
            paginationDotGap={
              paginationDotGap
            }
            paginationActiveStyle={
              paginationActiveStyle
            }
            paginationInactiveStyle={
              paginationInactiveStyle
            }
            onImageChange={
              onImageChange
            }
            imageResizeMode={
              imageResizeMode
            }
            imageStyle={
              imageStyle
          />
        </View>

        {/* ====================================================================
         * TOP RATED
         * ================================================================== */}

        {topRatedContent ? (
          <View
            pointerEvents="box-none"
            style={[
              styles.topRatedPosition,
              {
                top:
                  imageMarginTop +
                  topRatedTop,

                left:
                  imageMarginHorizontal +
                  topRatedLeft,
              },
            ]}
          >
            {topRatedContent}
          </View>
        ) : null}

        {/* ====================================================================
         * FAVORITE
         * ================================================================== */}

        <View
          style={[
            styles.favoritePosition,
            {
              top:
                imageMarginTop +
                favoriteTop,

              right:
                imageMarginHorizontal +
                favoriteRight,
            },
          ]}
        >
          {favoriteContent}
        </View>

        {/* ====================================================================
         * DISCOUNT
         * ================================================================== */}

        {discountContent ? (
          <View
            style={[
              styles.discountPosition,
              {
                bottom:
                  imageMarginBottom +
                  discountBottom,

                right:
                  imageMarginHorizontal +
                  discountRight,
              },
            ]}
          >
            {discountContent}
          </View>
        ) : null}

        {/* ====================================================================
         * LOGO
         *
         * The logo is positioned at the image/content boundary.
         * ================================================================== */}

        {logoContent ? (
          <View
            pointerEvents="none"
            style={[
              styles.logoPosition,
              {
                left:
                  finalContentPaddingLeft +
                  logoOffsetX,

                bottom:
                  -(
                    logoSize / 2
                  ) +
                  logoOffsetY,
              },
            ]}
          >
            {logoContent}
          </View>
        ) : null}

        {/* ====================================================================
         * CONTENT
         * ================================================================== */}

        <View
          style={[
            styles.content,

            {
              paddingTop:
                finalContentPaddingTop +
                (
                  logoContent
                    ? logoSize / 2
                    : 0
                ),

              paddingBottom:
                finalContentPaddingBottom,

              paddingLeft:
                finalContentPaddingLeft,

              paddingRight:
                finalContentPaddingRight,

              margin:
                contentMargin,

              marginTop:
                contentMarginTop,

              marginBottom:
                contentMarginBottom,

              marginHorizontal:
                contentMarginHorizontal,

              marginLeft:
                contentMarginLeft,

              marginRight:
                contentMarginRight,
            },

            contentStyle,
          ]}
        >
          {/* ================================================================
           * NAME + RATING
           *
           * LOGO       Biryani House       ⭐ 4.8
           * ============================================================ */}

          <View
            style={[
              styles.nameRatingRow,
              {
                marginTop:
                  nameSectionMarginTop,

                marginBottom:
                  nameSectionMarginBottom,
              },
              nameSectionStyle,
            ]}
          >
            <View
              style={[
                styles.nameSection,
                {
                  marginLeft:
                    logoContent
                      ? logoSize +
                        nameLogoGap
                      : 0,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.restaurantName,
                  {
                    color:
                      resolvedNameColor,

                    fontSize:
                      sizes.nameFontSize,

                    lineHeight:
                      sizes.nameLineHeight,

                    fontWeight:
                      nameFontWeight,
                  },
                  nameStyle,
                ]}
              >
                {resolvedName}
              </Text>
            </View>

            {ratingContent ? (
              <View
                style={[
                  styles.ratingPosition,
                  {
                    marginLeft:
                      nameRatingGap,
                  },
                ]}
              >
                {ratingContent}
              </View>
            ) : null}
          </View>

          {/* ================================================================
           * SUBTITLE
           * ============================================================ */}

          {resolvedSubtitle ? (
            <Text
              numberOfLines={2}
              style={[
                styles.restaurantSubtitle,
                {
                  color:
                    resolvedSubtitleColor,

                  fontSize:
                    sizes.subtitleFontSize,

                  lineHeight:
                    sizes.subtitleLineHeight,

                  marginTop:
                    subtitleMarginTop,

                  marginBottom:
                    subtitleMarginBottom,
                },
                subtitleStyle,
              ]}
            >
              {resolvedSubtitle}
            </Text>
          ) : null}

          {/* ================================================================
           * CUISINES
           * ============================================================ */}

          {tagsContent ? (
            <View
              style={[
                styles.tagsWrapper,
                {
                  marginTop:
                    cuisineMarginTop,

                  marginBottom:
                    cuisineMarginBottom,
                },
              ]}
            >
              {tagsContent}
            </View>
          ) : null}

          {/* ================================================================
           * DIVIDER
           * ============================================================ */}

          {showDivider ? (
            <View
              style={[
                styles.divider,
                {
                  height:
                    dividerHeight,

                  backgroundColor:
                    resolvedDividerColor,

                  marginTop:
                    dividerMarginTop,

                  marginBottom:
                    dividerMarginBottom,
                },
                dividerStyle,
              ]}
            />
          ) : null}

          {/* ================================================================
           * INFO ROW
           * ============================================================ */}

          <View
            style={styles.infoRow}
          >
            {deliveryContent}

            {distanceContent}

            {freeDeliveryContent}
          </View>

          {/* ================================================================
           * FOOTER
           * ============================================================ */}

          {typeof renderFooter ===
          "function"
            ? renderFooter({
                restaurant,
              })
            : null}

          {children}
        </View>
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
    overflow: "visible",
  },

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  /* ==========================================================================
   * IMAGE
   * ======================================================================== */

  imageSection: {
    position: "relative",
    overflow: "hidden",
  },

  imageContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },

  restaurantImage: {
    width: "100%",
    height: "100%",
  },

  /* ==========================================================================
   * TOP RATED
   * ======================================================================== */

  topRatedPosition: {
    position: "absolute",
    zIndex: 50,
  },

  topRatedBadge: {
    minHeight: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,
  },

  topRatedText: {
    fontWeight: "700",
    includeFontPadding: false,
  },

  /* ==========================================================================
   * FAVORITE
   * ======================================================================== */

  favoritePosition: {
    position: "absolute",
    zIndex: 50,
  },

  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  /* ==========================================================================
   * DISCOUNT
   * ======================================================================== */

  discountPosition: {
    position: "absolute",
    zIndex: 50,
  },

  discountBadge: {
    minHeight: 34,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,
  },

  discountText: {
    fontWeight: "800",
    includeFontPadding: false,
  },

  /* ==========================================================================
   * LOGO
   * ======================================================================== */

  logoPosition: {
    position: "absolute",
    zIndex: 100,
  },

  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  logoImage: {
    resizeMode: "contain",
  },

  /* ==========================================================================
   * CONTENT
   * ======================================================================== */

  content: {
    width: "100%",
  },

  /* ==========================================================================
   * NAME + RATING
   * ======================================================================== */

  nameRatingRow: {
    width: "100%",

    minHeight: 32,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",
  },

  nameSection: {
    flex: 1,
    minWidth: 0,

    justifyContent:
      "center",
  },

  restaurantName: {
    includeFontPadding: false,
  },

  ratingPosition: {
    flexShrink: 0,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    fontWeight: "700",
    includeFontPadding: false,
  },

  reviewCount: {
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* ==========================================================================
   * SUBTITLE
   * ======================================================================== */

  restaurantSubtitle: {
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* ==========================================================================
   * CUISINES
   * ======================================================================== */

  tagsWrapper: {
    width: "100%",
  },

  cuisineContainer: {
    width: "100%",

    flexDirection: "row",
    flexWrap: "wrap",

    alignItems: "center",
  },

  cuisineTag: {
    justifyContent: "center",
  },

  cuisineText: {
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* ==========================================================================
   * DIVIDER
   * ======================================================================== */

  divider: {
    width: "100%",
  },

  /* ==========================================================================
   * INFO
   * ======================================================================== */

  infoRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: 10,
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

  /* ==========================================================================
   * PAGINATION
   * ======================================================================== */

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,

    bottom: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "center",
  },

  paginationTop: {
    top: 10,
    bottom: undefined,
  },

  paginationDot: {
    opacity: 0.95,
  },

  paginationActive: {
    backgroundColor:
      "#FFFFFF",
  },

  paginationInactive: {
    backgroundColor:
      "rgba(255,255,255,0.55)",
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

export default memo(
  UIRestaurantCard,
);