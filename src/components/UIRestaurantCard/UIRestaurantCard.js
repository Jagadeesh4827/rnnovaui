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
import { useUITheme } from "../../UIProvider";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_SPRING = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
};

const DEFAULT_DATA = {
  id: "",
  name: "",
  subtitle: "",
  image: null,
  images: [],
  logo: null,
  rating: null,
  reviewCount: null,
  cuisines: [],
  deliveryTime: "",
  distance: "",
  freeDelivery: false,
  freeDeliveryText: "Free Delivery",
  freeDeliverySubtext: "",
  discount: "",
  badge: "",
};

const DEFAULT_COLORS = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#171A21",
  textSecondary: "#737985",
  textTertiary: "#9AA0AA",
  border: "#E7E8EB",
  primary: "#FF5A1F",
  primaryPressed: "#E84B15",
  success: "#20A34A",
  warning: "#FFB020",
  overlay: "rgba(0,0,0,0.35)",
  white: "#FFFFFF",
  black: "#000000",
};

const DEFAULT_SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  sm2: 10,
  md: 12,
  md2: 14,
  lg: 16,
  lg2: 20,
  xl: 24,
  xxl: 32,
};

const DEFAULT_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  card: 18,
  pill: 999,
  circle: 9999,
};

const DEFAULT_SIZES = {
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
};

const DEFAULT_TYPOGRAPHY = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
    sizes: {
      ...DEFAULT_SIZES,
      ...(theme?.sizes || {}),
    },
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      ...(theme?.typography || {}),
    },
    animation: {
      ...(theme?.animation || {}),
    },
  };
}

function getImageSource(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "number") {
    return image;
  }

  if (typeof image === "string") {
    return { uri: image };
  }

  if (typeof image === "object") {
    if (image.uri) {
      return image;
    }

    return image;
  }

  return null;
}

function normalizeImages(images, fallbackImage) {
  const sourceImages = Array.isArray(images) ? images : [];

  if (sourceImages.length > 0) {
    return sourceImages.filter(Boolean);
  }

  if (fallbackImage) {
    return [fallbackImage];
  }

  return [];
}

function formatReviewCount(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K+`;
    }

    return String(value);
  }

  return String(value);
}

function renderIcon({ icon, size = 20, color = "#000", style }) {
  if (!icon) {
    return null;
  }

  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      size: icon.props?.size ?? size,
      color: icon.props?.color ?? color,
      style: [style, icon.props?.style],
    });
  }

  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  if (typeof icon === "string") {
    return <Ionicons name={icon} size={size} color={color} style={style} />;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Restaurant Image                                                           */
/* -------------------------------------------------------------------------- */

const RestaurantImage = memo(function RestaurantImage({
  source,
  width,
  height,
  borderRadius,
  resizeMode = "cover",
  style,
}) {
  const imageSource = getImageSource(source);

  if (!imageSource) {
    return (
      <View
        style={[
          styles.imagePlaceholder,
          {
            width,
            height,
            borderRadius,
          },
          style,
        ]}
      >
        <Ionicons name="restaurant-outline" size={38} color="#B5BAC3" />
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      resizeMode={resizeMode}
      style={[
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Image Carousel                                                             */
/* -------------------------------------------------------------------------- */

const RestaurantImageCarousel = memo(function RestaurantImageCarousel({
  images,
  width,
  height,
  borderRadius,
  resizeMode,
  showPagination,
  paginationStyle,
  activeDotStyle,
  inactiveDotStyle,
  onImageChange,
}) {
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo(() => images || [], [images]);

  const handleScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;

      const index = Math.round(offsetX / Math.max(width, 1));

      if (index !== activeIndex && index >= 0 && index < data.length) {
        setActiveIndex(index);

        if (typeof onImageChange === "function") {
          onImageChange(index);
        }
      }
    },
    [activeIndex, data.length, onImageChange, width],
  );

  if (data.length === 0) {
    return (
      <RestaurantImage
        source={null}
        width={width}
        height={height}
        borderRadius={borderRadius}
      />
    );
  }

  if (data.length === 1) {
    return (
      <View
        style={{
          width,
          height,
          borderRadius,
          overflow: "hidden",
        }}
      >
        <RestaurantImage
          source={data[0]}
          width={width}
          height={height}
          borderRadius={borderRadius}
          resizeMode={resizeMode}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
      }}
    >
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `restaurant-image-${index}`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <RestaurantImage
            source={item}
            width={width}
            height={height}
            borderRadius={0}
            resizeMode={resizeMode}
          />
        )}
      />

      {showPagination && (
        <View pointerEvents="none" style={[styles.pagination, paginationStyle]}>
          {data.map((_, index) => {
            const active = index === activeIndex;

            return (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,
                  active
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                  active ? activeDotStyle : inactiveDotStyle,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

const RestaurantBadge = memo(function RestaurantBadge({
  text,
  icon,
  backgroundColor,
  color,
  fontSize,
  style,
  textStyle,
}) {
  if (!text) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      {icon &&
        renderIcon({
          icon,
          size: fontSize + 3,
          color,
          style: styles.badgeIcon,
        })}

      <Text
        numberOfLines={1}
        style={[
          styles.badgeText,
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

/* -------------------------------------------------------------------------- */
/* Rating                                                                      */
/* -------------------------------------------------------------------------- */

const RestaurantRating = memo(function RestaurantRating({
  rating,
  reviewCount,
  ratingIcon = "star",
  ratingIconSize = 17,
  ratingIconColor,
  ratingBackgroundColor,
  ratingTextColor,
  reviewTextColor,
  showReviewCount,
  style,
  textStyle,
}) {
  if (rating === null || rating === undefined || rating === "") {
    return null;
  }

  const formattedReviews = formatReviewCount(reviewCount);

  return (
    <View
      style={[
        styles.ratingContainer,
        {
          backgroundColor: ratingBackgroundColor,
        },
        style,
      ]}
    >
      {renderIcon({
        icon: ratingIcon,
        size: ratingIconSize,
        color: ratingIconColor,
      })}

      <Text
        style={[
          styles.ratingText,
          {
            color: ratingTextColor,
          },
          textStyle,
        ]}
      >
        {rating}
      </Text>

      {showReviewCount && formattedReviews && (
        <Text
          style={[
            styles.reviewCount,
            {
              color: reviewTextColor,
            },
          ]}
        >
          ({formattedReviews})
        </Text>
      )}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Cuisine Tags                                                               */
/* -------------------------------------------------------------------------- */

const CuisineTags = memo(function CuisineTags({
  cuisines,
  maxTags,
  tagBackgroundColor,
  tagTextColor,
  tagBorderRadius,
  tagStyle,
  tagTextStyle,
  moreText,
  moreStyle,
  moreTextStyle,
}) {
  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    return null;
  }

  const visibleTags = cuisines.slice(0, Math.max(0, maxTags));

  const hiddenCount = Math.max(0, cuisines.length - visibleTags.length);

  return (
    <View style={styles.tagsContainer}>
      {visibleTags.map((cuisine, index) => (
        <View
          key={`${cuisine}-${index}`}
          style={[
            styles.tag,
            {
              backgroundColor: tagBackgroundColor,
              borderRadius: tagBorderRadius,
            },
            tagStyle,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.tagText,
              {
                color: tagTextColor,
              },
              tagTextStyle,
            ]}
          >
            {cuisine}
          </Text>
        </View>
      ))}

      {hiddenCount > 0 && (
        <View
          style={[
            styles.tag,
            {
              backgroundColor: tagBackgroundColor,
              borderRadius: tagBorderRadius,
            },
            moreStyle,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              {
                color: tagTextColor,
              },
              moreTextStyle,
            ]}
          >
            {moreText || `+${hiddenCount}`}
          </Text>
        </View>
      )}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

const RestaurantInfoItem = memo(function RestaurantInfoItem({
  icon,
  iconSize = 22,
  iconColor,
  value,
  label,
  valueColor,
  labelColor,
  style,
  valueStyle,
  labelStyle,
}) {
  if (!value && !label) {
    return null;
  }

  return (
    <View style={[styles.infoItem, style]}>
      {icon &&
        renderIcon({
          icon,
          size: iconSize,
          color: iconColor,
        })}

      <View style={styles.infoTextContainer}>
        {value ? (
          <Text
            numberOfLines={1}
            style={[
              styles.infoValue,
              {
                color: valueColor,
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
});

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export const UIRestaurantCard = memo(function UIRestaurantCard({
  restaurant = DEFAULT_DATA,

  /* Main interaction */
  onPress,
  onLongPress,
  disabled = false,

  /* Animation */
  reanimated = false,
  animationSpring,

  /* Card */
  width = SCREEN_WIDTH - 24,
  style,
  contentStyle,
  borderRadius,
  backgroundColor,
  shadow = true,

  /* Image */
  image,
  images,
  imageHeight = 190,
  imageResizeMode = "cover",
  imageBorderRadius,

  showPagination = true,
  paginationStyle,
  activeDotStyle,
  inactiveDotStyle,
  onImageChange,

  /* Logo */
  logo,
  showLogo = true,
  logoSize = 82,
  logoBorderRadius = 18,
  logoPosition = "overlap",
  logoStyle,
  logoImageStyle,

  /* Top badge */
  badge,
  badgeIcon = "flame",
  showBadge = true,
  badgeBackgroundColor,
  badgeColor,
  badgeFontSize = 14,
  badgeStyle,
  badgeTextStyle,

  /* Favorite */
  showFavorite = true,
  favorite = false,
  onFavoritePress,
  favoriteIcon,
  favoriteActiveIcon = "heart",
  favoriteInactiveIcon = "heart-outline",
  favoriteSize = 24,
  favoriteColor,
  favoriteActiveColor = "#FF4D67",
  favoriteBackgroundColor = "rgba(255,255,255,0.94)",
  favoriteButtonSize = 46,
  favoriteStyle,

  /* Discount */
  discount,
  showDiscount = true,
  discountBackgroundColor = "rgba(0,0,0,0.72)",
  discountColor = "#FFFFFF",
  discountStyle,
  discountTextStyle,

  /* Restaurant info */
  name,
  subtitle,
  nameStyle,
  subtitleStyle,
  nameColor,
  subtitleColor,

  /* Rating */
  rating,
  reviewCount,
  showRating = true,
  showReviewCount = true,
  ratingIcon = "star",
  ratingIconSize = 17,
  ratingIconColor = "#FFB020",
  ratingBackgroundColor = "transparent",
  ratingTextColor,
  reviewTextColor,
  ratingStyle,
  ratingTextStyle,

  /* Cuisine */
  cuisines,
  maxCuisineTags = 3,
  tagBackgroundColor,
  tagTextColor,
  tagBorderRadius,
  tagStyle,
  tagTextStyle,

  /* Delivery */
  deliveryTime,
  deliveryTimeLabel = "Delivery time",
  deliveryIcon = "time-outline",
  deliveryIconSize = 24,

  /* Distance */
  distance,
  distanceLabel = "Away",
  distanceIcon = "location-outline",
  distanceIconSize = 24,

  /* Free delivery */
  freeDelivery = false,
  freeDeliveryText = "Free Delivery",
  freeDeliverySubtext,
  freeDeliveryIcon = "bicycle-outline",
  freeDeliveryIconSize = 26,
  freeDeliveryColor,
  freeDeliveryIconColor,
  freeDeliveryStyle,
  freeDeliveryTextStyle,
  freeDeliverySubtextStyle,

  /* Layout */
  showDivider = true,
  dividerColor,
  dividerStyle,
  infoStyle,
  tagsStyle,

  /* Custom rendering */
  renderImage,
  renderLogo,
  renderBadge,
  renderFavorite,
  renderDiscount,
  renderRating,
  renderTags,
  renderDelivery,
  renderDistance,
  renderFreeDelivery,
  renderFooter,
  renderContent,

  /* Custom press */
  pressStyle,
  pressedScale = 0.985,

  /* Accessibility */
  accessibilityLabel,
  accessibilityHint,

  /* Extra */
  children,
}) {
  const { theme } = useUITheme();

  const { colors, spacing, radius, typography, animation } =
    resolveTheme(theme);

  const resolvedSpring = useMemo(
    () => animationSpring ?? animation?.spring ?? DEFAULT_SPRING,
    [animationSpring, animation?.spring],
  );

  const resolvedRestaurant = useMemo(
    () => ({
      ...DEFAULT_DATA,
      ...(restaurant || {}),
    }),
    [restaurant],
  );

  const resolvedImages = useMemo(
    () =>
      normalizeImages(
        images ?? resolvedRestaurant.images,
        image ?? resolvedRestaurant.image,
      ),
    [images, image, resolvedRestaurant.images, resolvedRestaurant.image],
  );

  const resolvedName = name ?? resolvedRestaurant.name ?? "";

  const resolvedSubtitle = subtitle ?? resolvedRestaurant.subtitle ?? "";

  const resolvedRating = rating ?? resolvedRestaurant.rating;

  const resolvedReviewCount = reviewCount ?? resolvedRestaurant.reviewCount;

  const resolvedCuisines = cuisines ?? resolvedRestaurant.cuisines ?? [];

  const resolvedDeliveryTime = deliveryTime ?? resolvedRestaurant.deliveryTime;

  const resolvedDistance = distance ?? resolvedRestaurant.distance;

  const resolvedLogo = logo ?? resolvedRestaurant.logo;

  const resolvedBadge = badge ?? resolvedRestaurant.badge;

  const resolvedDiscount = discount ?? resolvedRestaurant.discount;

  const resolvedFreeDelivery =
    freeDelivery || resolvedRestaurant.freeDelivery === true;

  const resolvedFreeDeliveryText =
    resolvedRestaurant.freeDeliveryText ?? freeDeliveryText;

  const resolvedFreeDeliverySubtext =
    freeDeliverySubtext ?? resolvedRestaurant.freeDeliverySubtext;

  const cardRadius = borderRadius ?? radius.card ?? radius.lg ?? 18;

  const resolvedBackground =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedNameColor = nameColor ?? colors.text ?? "#171A21";

  const resolvedSubtitleColor =
    subtitleColor ?? colors.textSecondary ?? "#737985";

  const resolvedRatingTextColor = ratingTextColor ?? colors.text ?? "#171A21";

  const resolvedReviewTextColor =
    reviewTextColor ?? colors.textSecondary ?? "#737985";

  const resolvedTagBackground =
    tagBackgroundColor ?? colors.primarySoft ?? "rgba(255,90,31,0.08)";

  const resolvedTagTextColor =
    tagTextColor ?? colors.textSecondary ?? "#737985";

  const resolvedDividerColor = dividerColor ?? colors.border ?? "#E7E8EB";

  const resolvedBadgeBackground =
    badgeBackgroundColor ?? colors.primary ?? "#FF5A1F";

  const resolvedBadgeColor = badgeColor ?? colors.onPrimary ?? "#FFFFFF";

  const resolvedFreeDeliveryColor =
    freeDeliveryColor ?? colors.success ?? "#20A34A";

  const resolvedFreeDeliveryIconColor =
    freeDeliveryIconColor ?? colors.primary ?? "#FF5A1F";

  /* ---------------------------------------------------------------------- */
  /* Reanimated                                                             */
  /* ---------------------------------------------------------------------- */

  const scale = useSharedValue(reanimated ? 1 : 1);

  const elevationProgress = useSharedValue(reanimated ? 0 : 1);

  useEffect(() => {
    if (!reanimated) {
      scale.value = 1;
      elevationProgress.value = 1;
      return;
    }

    elevationProgress.value = withTiming(1, {
      duration: animation?.normal ?? 200,
      easing: Easing.out(Easing.ease),
    });
  }, [reanimated, animation?.normal, elevationProgress, scale]);

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

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (typeof onPress === "function") {
      onPress(resolvedRestaurant);
    }
  }, [disabled, onPress, resolvedRestaurant]);

  const handleLongPress = useCallback(() => {
    if (disabled) {
      return;
    }

    if (typeof onLongPress === "function") {
      onLongPress(resolvedRestaurant);
    }
  }, [disabled, onLongPress, resolvedRestaurant]);

  /* ---------------------------------------------------------------------- */
  /* Image                                                                    */
  /* ---------------------------------------------------------------------- */

  const imageContent = renderImage ? (
    renderImage({
      restaurant: resolvedRestaurant,
      images: resolvedImages,
      width,
      height: imageHeight,
    })
  ) : (
    <RestaurantImageCarousel
      images={resolvedImages}
      width={width}
      height={imageHeight}
      borderRadius={logoPosition === "overlap" ? cardRadius : cardRadius}
      resizeMode={imageResizeMode}
      showPagination={showPagination}
      paginationStyle={paginationStyle}
      activeDotStyle={activeDotStyle}
      inactiveDotStyle={inactiveDotStyle}
      onImageChange={onImageChange}
    />
  );

  /* ---------------------------------------------------------------------- */
  /* Logo                                                                     */
  /* ---------------------------------------------------------------------- */

  const logoContent =
    showLogo && resolvedLogo ? (
      renderLogo ? (
        renderLogo({
          restaurant: resolvedRestaurant,
          logo: resolvedLogo,
          size: logoSize,
        })
      ) : (
        <View
          style={[
            styles.logoContainer,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoBorderRadius,
              backgroundColor: colors.card || "#FFFFFF",
            },
            logoStyle,
          ]}
        >
          <RestaurantImage
            source={resolvedLogo}
            width={logoSize}
            height={logoSize}
            borderRadius={logoBorderRadius}
            resizeMode="cover"
            style={logoImageStyle}
          />
        </View>
      )
    ) : null;

  /* ---------------------------------------------------------------------- */
  /* Badge                                                                    */
  /* ---------------------------------------------------------------------- */

  const badgeContent =
    showBadge && resolvedBadge ? (
      renderBadge ? (
        renderBadge({
          restaurant: resolvedRestaurant,
          badge: resolvedBadge,
        })
      ) : (
        <RestaurantBadge
          text={resolvedBadge}
          icon={badgeIcon}
          backgroundColor={resolvedBadgeBackground}
          color={resolvedBadgeColor}
          fontSize={badgeFontSize}
          style={badgeStyle}
          textStyle={badgeTextStyle}
        />
      )
    ) : null;

  /* ---------------------------------------------------------------------- */
  /* Favorite                                                                 */
  /* ---------------------------------------------------------------------- */

  const favoriteContent = showFavorite ? (
    renderFavorite ? (
      renderFavorite({
        restaurant: resolvedRestaurant,
        favorite,
        onPress: onFavoritePress,
      })
    ) : (
      <Pressable
        onPress={() => {
          if (typeof onFavoritePress === "function") {
            onFavoritePress(!favorite, resolvedRestaurant);
          }
        }}
        disabled={!onFavoritePress}
        accessibilityRole="button"
        accessibilityLabel={
          favorite ? "Remove from favorites" : "Add to favorites"
        }
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
        {renderIcon({
          icon:
            favoriteIcon ??
            (favorite ? favoriteActiveIcon : favoriteInactiveIcon),
          size: favoriteSize,
          color: favorite
            ? favoriteActiveColor
            : (favoriteColor ?? colors.text ?? "#171A21"),
        })}
      </Pressable>
    )
  ) : null;

  /* ---------------------------------------------------------------------- */
  /* Discount                                                                 */
  /* ---------------------------------------------------------------------- */

  const discountContent =
    showDiscount && resolvedDiscount ? (
      renderDiscount ? (
        renderDiscount({
          restaurant: resolvedRestaurant,
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

  /* ---------------------------------------------------------------------- */
  /* Rating                                                                   */
  /* ---------------------------------------------------------------------- */

  const ratingContent =
    showRating && resolvedRating !== null ? (
      renderRating ? (
        renderRating({
          restaurant: resolvedRestaurant,
          rating: resolvedRating,
          reviewCount: resolvedReviewCount,
        })
      ) : (
        <RestaurantRating
          rating={resolvedRating}
          reviewCount={resolvedReviewCount}
          ratingIcon={ratingIcon}
          ratingIconSize={ratingIconSize}
          ratingIconColor={ratingIconColor}
          ratingBackgroundColor={ratingBackgroundColor}
          ratingTextColor={resolvedRatingTextColor}
          reviewTextColor={resolvedReviewTextColor}
          showReviewCount={showReviewCount}
          style={ratingStyle}
          textStyle={ratingTextStyle}
        />
      )
    ) : null;

  /* ---------------------------------------------------------------------- */
  /* Tags                                                                     */
  /* ---------------------------------------------------------------------- */

  const tagsContent = renderTags ? (
    renderTags({
      restaurant: resolvedRestaurant,
      cuisines: resolvedCuisines,
    })
  ) : (
    <CuisineTags
      cuisines={resolvedCuisines}
      maxTags={maxCuisineTags}
      tagBackgroundColor={resolvedTagBackground}
      tagTextColor={resolvedTagTextColor}
      tagBorderRadius={tagBorderRadius ?? radius.pill ?? 999}
      tagStyle={tagStyle}
      tagTextStyle={tagTextStyle}
    />
  );

  /* ---------------------------------------------------------------------- */
  /* Delivery                                                                  */
  /* ---------------------------------------------------------------------- */

  const deliveryContent = renderDelivery ? (
    renderDelivery({
      restaurant: resolvedRestaurant,
      deliveryTime: resolvedDeliveryTime,
    })
  ) : (
    <RestaurantInfoItem
      icon={deliveryIcon}
      iconSize={deliveryIconSize}
      iconColor={colors.textSecondary ?? "#737985"}
      value={resolvedDeliveryTime}
      label={deliveryTimeLabel}
      valueColor={colors.text}
      labelColor={colors.textSecondary}
      style={infoStyle}
    />
  );

  /* ---------------------------------------------------------------------- */
  /* Distance                                                                  */
  /* ---------------------------------------------------------------------- */

  const distanceContent = renderDistance ? (
    renderDistance({
      restaurant: resolvedRestaurant,
      distance: resolvedDistance,
    })
  ) : (
    <RestaurantInfoItem
      icon={distanceIcon}
      iconSize={distanceIconSize}
      iconColor={colors.textSecondary ?? "#737985"}
      value={resolvedDistance}
      label={distanceLabel}
      valueColor={colors.text}
      labelColor={colors.textSecondary}
      style={infoStyle}
    />
  );

  /* ---------------------------------------------------------------------- */
  /* Free delivery                                                             */
  /* ---------------------------------------------------------------------- */

  const freeDeliveryContent = resolvedFreeDelivery ? (
    renderFreeDelivery ? (
      renderFreeDelivery({
        restaurant: resolvedRestaurant,
        text: resolvedFreeDeliveryText,
        subtext: resolvedFreeDeliverySubtext,
      })
    ) : (
      <View style={[styles.freeDeliveryContainer, freeDeliveryStyle]}>
        {renderIcon({
          icon: freeDeliveryIcon,
          size: freeDeliveryIconSize,
          color: resolvedFreeDeliveryIconColor,
        })}

        <View style={styles.freeDeliveryTextContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.freeDeliveryText,
              {
                color: resolvedFreeDeliveryColor,
              },
              freeDeliveryTextStyle,
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
                freeDeliverySubtextStyle,
              ]}
            >
              {resolvedFreeDeliverySubtext}
            </Text>
          ) : null}
        </View>
      </View>
    )
  ) : null;

  /* ---------------------------------------------------------------------- */
  /* Content                                                                   */
  /* ---------------------------------------------------------------------- */

  const defaultContent = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: spacing.lg ?? 16,
          paddingTop:
            logoPosition === "overlap"
              ? logoContent
                ? logoSize / 2 + 10
                : spacing.lg
              : spacing.lg,
          paddingBottom: spacing.lg ?? 16,
        },
        contentStyle,
      ]}
    >
      <View style={styles.headerInfoRow}>
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
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
                styles.subtitle,
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

      {tagsContent ? (
        <View style={[styles.tagsWrapper, tagsStyle]}>{tagsContent}</View>
      ) : null}

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

      <View style={styles.footerRow}>
        {deliveryContent}

        {distanceContent}

        {freeDeliveryContent}
      </View>

      {renderFooter
        ? renderFooter({
            restaurant: resolvedRestaurant,
          })
        : null}

      {children}
    </View>
  );

  const content = renderContent
    ? renderContent({
        restaurant: resolvedRestaurant,
        rating: resolvedRating,
        reviewCount: resolvedReviewCount,
        cuisines: resolvedCuisines,
        deliveryTime: resolvedDeliveryTime,
        distance: resolvedDistance,
      })
    : defaultContent;

  /* ---------------------------------------------------------------------- */
  /* Card                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <Animated.View
      style={[
        {
          width,
          borderRadius: cardRadius,
          backgroundColor: resolvedBackground,
        },
        shadow ? styles.cardShadow : styles.noShadow,
        animatedCardStyle,
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? resolvedName}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          styles.pressable,
          {
            borderRadius: cardRadius,
          },
          pressed && !reanimated && pressStyle,
        ]}
      >
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

          <View
            pointerEvents="box-none"
            style={[
              styles.imageOverlay,
              {
                borderTopLeftRadius: cardRadius,
                borderTopRightRadius: cardRadius,
              },
            ]}
          >
            {badgeContent && (
              <View style={styles.badgePosition}>{badgeContent}</View>
            )}

            {favoriteContent && (
              <View style={styles.favoritePosition}>{favoriteContent}</View>
            )}

            {discountContent && (
              <View style={styles.discountPosition}>{discountContent}</View>
            )}
          </View>
        </View>

        {logoPosition === "overlap" && logoContent ? (
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

        {logoPosition !== "overlap" && logoContent ? (
          <View
            style={[
              styles.logoInline,
              {
                paddingHorizontal: spacing.lg ?? 16,
                paddingTop: spacing.md ?? 12,
              },
            ]}
          >
            {logoContent}
          </View>
        ) : null}

        {content}
      </Pressable>
    </Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },

  pressable: {
    overflow: "hidden",
  },

  imageSection: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECEEF1",
    overflow: "hidden",
  },

  badgePosition: {
    position: "absolute",
    top: 14,
    left: 14,
  },

  favoritePosition: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  discountPosition: {
    position: "absolute",
    right: 14,
    bottom: 14,
  },

  badge: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeIcon: {
    marginRight: 6,
  },

  badgeText: {
    fontWeight: "700",
  },

  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  discountBadge: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  discountText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  logoPosition: {
    position: "absolute",
    zIndex: 20,
  },

  logoInline: {
    width: "100%",
  },

  logoContainer: {
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    width: "100%",
  },

  headerInfoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  name: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 30,
    paddingLeft: 6,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },

  reviewCount: {
    marginLeft: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },

  tagsWrapper: {
    marginTop: 14,
  },

  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
  },

  tag: {
    minHeight: 34,
    paddingHorizontal: 13,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 145,
  },

  tagText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },

  footerRow: {
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

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  infoValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  infoLabel: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },

  freeDeliveryContainer: {
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

  freeDeliveryText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },

  freeDeliverySubtext: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  },

  pagination: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginHorizontal: 4,
  },

  paginationDotActive: {
    backgroundColor: "#FFFFFF",
  },

  paginationDotInactive: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
});

export default UIRestaurantCard;
