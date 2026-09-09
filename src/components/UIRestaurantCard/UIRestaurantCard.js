import React, { memo, useCallback, useMemo, useRef, useState } from "react";

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

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_SPRING = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
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

  white: "#FFFFFF",
  black: "#000000",

  onPrimary: "#FFFFFF",

  primarySoft: "rgba(255,90,31,0.08)",
};

const DEFAULT_SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  sm2: 10,
  md: 12,
  md2: 14,
  lg: 16,
  lg2: 20,
  xl: 24,
  xl2: 28,
  xxl: 32,
};

const DEFAULT_RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  card: 18,
  input: 12,
  button: 12,
  pill: 999,
  circle: 9999,
};

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
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

    sizes: theme?.sizes || {},

    typography: theme?.typography || {},

    shadows: theme?.shadows || {},

    animation: theme?.animation || {},
  };
}

/* -------------------------------------------------------------------------- */
/* Image Helpers                                                              */
/* -------------------------------------------------------------------------- */

function getImageSource(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "number") {
    return image;
  }

  if (typeof image === "string") {
    return {
      uri: image,
    };
  }

  if (typeof image === "object") {
    return image;
  }

  return null;
}

function normalizeImages(images, fallbackImage) {
  if (Array.isArray(images) && images.length > 0) {
    return images.filter(Boolean);
  }

  if (fallbackImage) {
    return [fallbackImage];
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/* Icon Renderer                                                              */
/* -------------------------------------------------------------------------- */

function renderIcon({ icon, size = 20, color = "#000000", style }) {
  if (!icon) {
    return null;
  }

  /*
   * Already rendered icon:
   *
   * <Ionicons name="star" />
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
   * icon: Ionicons
   *
   * or
   *
   * icon: SomeCustomIcon
   */
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null)
  ) {
    const IconComponent = icon;

    return <IconComponent size={size} color={color} style={style} />;
  }

  /*
   * String:
   *
   * icon="star"
   */
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
  resizeMode = "cover",
  showPagination = true,
  paginationStyle,
  activeDotStyle,
  inactiveDotStyle,
  onImageChange,
}) {
  const listRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const data = Array.isArray(images) ? images : [];

  const handleScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;

      const index = Math.round(offsetX / Math.max(width, 1));

      if (index < 0 || index >= data.length) {
        return;
      }

      if (index !== activeIndex) {
        setActiveIndex(index);

        if (typeof onImageChange === "function") {
          onImageChange(index);
        }
      }
    },
    [activeIndex, data.length, onImageChange, width],
  );

  if (data.length === 0) {
    return <RestaurantImage source={null} width={width} height={height} />;
  }

  if (data.length === 1) {
    return (
      <RestaurantImage
        source={data[0]}
        width={width}
        height={height}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <View
      style={[
        styles.carouselContainer,
        {
          width,
          height,
        },
      ]}
    >
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyExtractor={(_, index) => `restaurant-image-${index}`}
        renderItem={({ item }) => (
          <RestaurantImage
            source={item}
            width={width}
            height={height}
            resizeMode={resizeMode}
          />
        )}
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

                  active
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,

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

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

const RestaurantBadge = memo(function RestaurantBadge({
  text,
  icon,
  backgroundColor,
  color,
  fontSize = 14,
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
      {icon
        ? renderIcon({
            icon,
            size: fontSize + 3,
            color,
            style: styles.badgeIcon,
          })
        : null}

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
/* Rating                                                                     */
/* -------------------------------------------------------------------------- */

const RestaurantRating = memo(function RestaurantRating({
  rating,
  reviewCount,
  ratingIcon = "star",
  ratingIconSize = 17,
  ratingIconColor = "#FFB020",
  ratingTextColor,
  reviewTextColor,
  showReviewCount = true,
  style,
  textStyle,
}) {
  if (rating === null || rating === undefined || rating === "") {
    return null;
  }

  let reviews = "";

  if (reviewCount !== null && reviewCount !== undefined && reviewCount !== "") {
    if (typeof reviewCount === "number" && reviewCount >= 1000) {
      reviews = `${(reviewCount / 1000).toFixed(
        reviewCount >= 10000 ? 0 : 1,
      )}K+`;
    } else {
      reviews = String(reviewCount);
    }
  }

  return (
    <View style={[styles.ratingContainer, style]}>
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

      {showReviewCount && reviews ? (
        <Text
          style={[
            styles.reviewCount,
            {
              color: reviewTextColor,
            },
          ]}
        >
          ({reviews})
        </Text>
      ) : null}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Cuisine Tags                                                               */
/* -------------------------------------------------------------------------- */

const CuisineTags = memo(function CuisineTags({
  cuisines,
  maxTags = 3,
  backgroundColor,
  textColor,
  borderRadius = 999,
  style,
  textStyle,
  moreStyle,
  moreTextStyle,
}) {
  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    return null;
  }

  const visibleTags = cuisines.slice(0, maxTags);

  const hiddenCount = Math.max(0, cuisines.length - visibleTags.length);

  return (
    <View style={[styles.tagsContainer, style]}>
      {visibleTags.map((cuisine, index) => (
        <View
          key={`${cuisine}-${index}`}
          style={[
            styles.tag,
            {
              backgroundColor,
              borderRadius,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.tagText,
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

      {hiddenCount > 0 ? (
        <View
          style={[
            styles.tag,
            {
              backgroundColor,
              borderRadius,
            },
            moreStyle,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              {
                color: textColor,
              },
              moreTextStyle,
            ]}
          >
            +{hiddenCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

const RestaurantInfoItem = memo(function RestaurantInfoItem({
  icon,
  iconSize = 23,
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
      {renderIcon({
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
/* Main Restaurant Card                                                       */
/* -------------------------------------------------------------------------- */

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

  style,

  contentStyle,

  borderRadius,

  backgroundColor,

  shadow = true,

  /* -------------------------------------------------------------------- */
  /* Images                                                               */
  /* -------------------------------------------------------------------- */

  image,

  images,

  imageHeight = 190,

  imageResizeMode = "cover",

  showPagination = true,

  paginationStyle,

  activeDotStyle,

  inactiveDotStyle,

  onImageChange,

  /* -------------------------------------------------------------------- */
  /* Logo                                                                 */
  /* -------------------------------------------------------------------- */

  logo,

  showLogo = true,

  logoSize = 82,

  logoBorderRadius = 18,

  logoPosition = "overlap",

  logoStyle,

  logoImageStyle,

  /* -------------------------------------------------------------------- */
  /* Badge                                                                */
  /* -------------------------------------------------------------------- */

  badge,

  showBadge = true,

  badgeIcon = "flame",

  badgeBackgroundColor,

  badgeColor,

  badgeFontSize = 14,

  badgeStyle,

  badgeTextStyle,

  /* -------------------------------------------------------------------- */
  /* Favorite                                                             */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Discount                                                             */
  /* -------------------------------------------------------------------- */

  discount,

  showDiscount = true,

  discountBackgroundColor = "rgba(0,0,0,0.72)",

  discountColor = "#FFFFFF",

  discountStyle,

  discountTextStyle,

  /* -------------------------------------------------------------------- */
  /* Restaurant Name                                                      */
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

  rating,

  reviewCount,

  showRating = true,

  showReviewCount = true,

  ratingIcon = "star",

  ratingIconSize = 17,

  ratingIconColor = "#FFB020",

  ratingTextColor,

  reviewTextColor,

  ratingStyle,

  ratingTextStyle,

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

  deliveryIconSize = 24,

  deliveryValueStyle,

  deliveryLabelStyle,

  /* -------------------------------------------------------------------- */
  /* Distance                                                             */
  /* -------------------------------------------------------------------- */

  distance,

  distanceLabel = "Away",

  distanceIcon = "location-outline",

  distanceIconSize = 24,

  distanceValueStyle,

  distanceLabelStyle,

  /* -------------------------------------------------------------------- */
  /* Free Delivery                                                        */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Divider                                                              */
  /* -------------------------------------------------------------------- */

  showDivider = true,

  dividerColor,

  dividerStyle,

  /* -------------------------------------------------------------------- */
  /* Layout                                                               */
  /* -------------------------------------------------------------------- */

  infoStyle,

  tagsStyle,

  /* -------------------------------------------------------------------- */
  /* Custom render                                                        */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Press                                                                */
  /* -------------------------------------------------------------------- */

  pressStyle,

  accessibilityLabel,

  accessibilityHint,

  children,
}) {
  /* -------------------------------------------------------------------- */
  /* Theme                                                                */
  /* -------------------------------------------------------------------- */

  const { theme } = useUITheme();

  const { colors, spacing, radius, animation } = resolveTheme(theme);

  /* -------------------------------------------------------------------- */
  /* Spring                                                               */
  /* -------------------------------------------------------------------- */

  const resolvedSpring = useMemo(
    () => animationSpring ?? animation?.spring ?? DEFAULT_SPRING,
    [animationSpring, animation?.spring],
  );

  /* -------------------------------------------------------------------- */
  /* Restaurant                                                            */
  /* -------------------------------------------------------------------- */

  const resolvedName = name ?? restaurant?.name ?? "";

  const resolvedSubtitle = subtitle ?? restaurant?.subtitle ?? "";

  const resolvedRating = rating ?? restaurant?.rating;

  const resolvedReviewCount = reviewCount ?? restaurant?.reviewCount;

  const resolvedCuisines = cuisines ?? restaurant?.cuisines ?? [];

  const resolvedDeliveryTime = deliveryTime ?? restaurant?.deliveryTime ?? "";

  const resolvedDistance = distance ?? restaurant?.distance ?? "";

  const resolvedLogo = logo ?? restaurant?.logo;

  const resolvedBadge = badge ?? restaurant?.badge;

  const resolvedDiscount = discount ?? restaurant?.discount;

  const resolvedImages = useMemo(
    () =>
      normalizeImages(images ?? restaurant?.images, image ?? restaurant?.image),
    [images, image, restaurant?.images, restaurant?.image],
  );

  const resolvedFreeDelivery =
    freeDelivery || restaurant?.freeDelivery === true;

  const resolvedFreeDeliveryText =
    restaurant?.freeDeliveryText ?? freeDeliveryText;

  const resolvedFreeDeliverySubtext =
    freeDeliverySubtext ?? restaurant?.freeDeliverySubtext;

  /* -------------------------------------------------------------------- */
  /* Resolved theme values                                                */
  /* -------------------------------------------------------------------- */

  const cardRadius = borderRadius ?? radius.card ?? 18;

  const cardBackground =
    backgroundColor ?? colors.card ?? colors.surface ?? "#FFFFFF";

  const resolvedNameColor = nameColor ?? colors.text;

  const resolvedSubtitleColor = subtitleColor ?? colors.textSecondary;

  const resolvedRatingTextColor = ratingTextColor ?? colors.text;

  const resolvedReviewTextColor = reviewTextColor ?? colors.textSecondary;

  const resolvedTagBackgroundColor =
    tagBackgroundColor ?? colors.primarySoft ?? "rgba(255,90,31,0.08)";

  const resolvedTagTextColor = tagTextColor ?? colors.textSecondary;

  const resolvedDividerColor = dividerColor ?? colors.border;

  const resolvedBadgeBackground = badgeBackgroundColor ?? colors.primary;

  const resolvedBadgeColor = badgeColor ?? colors.onPrimary ?? "#FFFFFF";

  const resolvedFreeDeliveryColor = freeDeliveryColor ?? colors.success;

  const resolvedFreeDeliveryIconColor = freeDeliveryIconColor ?? colors.primary;

  /* -------------------------------------------------------------------- */
  /* Reanimated                                                           */
  /* -------------------------------------------------------------------- */

  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

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

  /* -------------------------------------------------------------------- */
  /* Press                                                                */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Image                                                                */
  /* -------------------------------------------------------------------- */

  const imageContent =
    typeof renderImage === "function" ? (
      renderImage({
        restaurant,
        images: resolvedImages,
        width,
        height: imageHeight,
      })
    ) : (
      <RestaurantImageCarousel
        images={resolvedImages}
        width={width}
        height={imageHeight}
        resizeMode={imageResizeMode}
        showPagination={showPagination}
        paginationStyle={paginationStyle}
        activeDotStyle={activeDotStyle}
        inactiveDotStyle={inactiveDotStyle}
        onImageChange={onImageChange}
      />
    );

  /* -------------------------------------------------------------------- */
  /* Logo                                                                 */
  /* -------------------------------------------------------------------- */

  const logoContent =
    showLogo && resolvedLogo ? (
      typeof renderLogo === "function" ? (
        renderLogo({
          restaurant,
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
              backgroundColor: colors.card,
            },
            logoStyle,
          ]}
        >
          <RestaurantImage
            source={resolvedLogo}
            width={logoSize}
            height={logoSize}
            resizeMode="cover"
            style={logoImageStyle}
          />
        </View>
      )
    ) : null;

  /* -------------------------------------------------------------------- */
  /* Badge                                                                */
  /* -------------------------------------------------------------------- */

  const badgeContent =
    showBadge && resolvedBadge ? (
      typeof renderBadge === "function" ? (
        renderBadge({
          restaurant,
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

  /* -------------------------------------------------------------------- */
  /* Favorite                                                             */
  /* -------------------------------------------------------------------- */

  const favoriteContent = showFavorite ? (
    typeof renderFavorite === "function" ? (
      renderFavorite({
        restaurant,
        favorite,
        onPress: onFavoritePress,
      })
    ) : (
      <Pressable
        disabled={!onFavoritePress}
        onPress={() => {
          if (typeof onFavoritePress === "function") {
            onFavoritePress(!favorite, restaurant);
          }
        }}
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
            : (favoriteColor ?? colors.text),
        })}
      </Pressable>
    )
  ) : null;

  /* -------------------------------------------------------------------- */
  /* Discount                                                             */
  /* -------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------- */
  /* Rating                                                               */
  /* -------------------------------------------------------------------- */

  const ratingContent =
    showRating && resolvedRating !== null && resolvedRating !== undefined ? (
      typeof renderRating === "function" ? (
        renderRating({
          restaurant,
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
          ratingTextColor={resolvedRatingTextColor}
          reviewTextColor={resolvedReviewTextColor}
          showReviewCount={showReviewCount}
          style={ratingStyle}
          textStyle={ratingTextStyle}
        />
      )
    ) : null;

  /* -------------------------------------------------------------------- */
  /* Tags                                                                 */
  /* -------------------------------------------------------------------- */

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
        backgroundColor={resolvedTagBackgroundColor}
        textColor={resolvedTagTextColor}
        borderRadius={tagBorderRadius ?? radius.pill ?? 999}
        style={tagStyle}
        textStyle={tagTextStyle}
      />
    );

  /* -------------------------------------------------------------------- */
  /* Delivery                                                             */
  /* -------------------------------------------------------------------- */

  const deliveryContent =
    typeof renderDelivery === "function" ? (
      renderDelivery({
        restaurant,
        deliveryTime: resolvedDeliveryTime,
      })
    ) : (
      <RestaurantInfoItem
        icon={deliveryIcon}
        iconSize={deliveryIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDeliveryTime}
        label={deliveryTimeLabel}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
        style={infoStyle}
        valueStyle={deliveryValueStyle}
        labelStyle={deliveryLabelStyle}
      />
    );

  /* -------------------------------------------------------------------- */
  /* Distance                                                             */
  /* -------------------------------------------------------------------- */

  const distanceContent =
    typeof renderDistance === "function" ? (
      renderDistance({
        restaurant,
        distance: resolvedDistance,
      })
    ) : (
      <RestaurantInfoItem
        icon={distanceIcon}
        iconSize={distanceIconSize}
        iconColor={colors.textSecondary}
        value={resolvedDistance}
        label={distanceLabel}
        valueColor={colors.text}
        labelColor={colors.textSecondary}
        style={infoStyle}
        valueStyle={distanceValueStyle}
        labelStyle={distanceLabelStyle}
      />
    );

  /* -------------------------------------------------------------------- */
  /* Free Delivery                                                        */
  /* -------------------------------------------------------------------- */

  const freeDeliveryContent = resolvedFreeDelivery ? (
    typeof renderFreeDelivery === "function" ? (
      renderFreeDelivery({
        restaurant,
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

  /* -------------------------------------------------------------------- */
  /* Default Content                                                      */
  /* -------------------------------------------------------------------- */

  const defaultContent = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: spacing.lg ?? 16,

          paddingTop:
            logoPosition === "overlap" && logoContent
              ? logoSize / 2 + 10
              : (spacing.lg ?? 16),

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

      {typeof renderFooter === "function"
        ? renderFooter({
            restaurant,
          })
        : null}

      {children}
    </View>
  );

  const finalContent =
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

  /* -------------------------------------------------------------------- */
  /* Final Card                                                            */
  /* -------------------------------------------------------------------- */

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width,
          borderRadius: cardRadius,
          backgroundColor: cardBackground,
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

          pressed && !reanimated ? pressStyle : null,
        ]}
      >
        {/* -------------------------------------------------------------- */}
        {/* Image                                                          */}
        {/* -------------------------------------------------------------- */}

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
            {/* Badge */}
            {badgeContent ? (
              <View style={styles.badgePosition}>{badgeContent}</View>
            ) : null}

            {/* Favorite */}
            {favoriteContent ? (
              <View style={styles.favoritePosition}>{favoriteContent}</View>
            ) : null}

            {/* Discount */}
            {discountContent ? (
              <View style={styles.discountPosition}>{discountContent}</View>
            ) : null}
          </View>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* Logo                                                           */}
        {/* -------------------------------------------------------------- */}

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

        {/* -------------------------------------------------------------- */}
        {/* Content                                                        */}
        {/* -------------------------------------------------------------- */}

        {finalContent}
      </Pressable>
    </Animated.View>
  );
});

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  card: {
    overflow: "visible",
  },

  cardShadow: {
    shadowColor: "#000000",

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

  /* ---------------------------------------------------------------------- */
  /* Image                                                                  */
  /* ---------------------------------------------------------------------- */

  imageSection: {
    width: "100%",
    position: "relative",
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
  },

  carouselContainer: {
    overflow: "hidden",
  },

  /* ---------------------------------------------------------------------- */
  /* Badge                                                                  */
  /* ---------------------------------------------------------------------- */

  badgePosition: {
    position: "absolute",
    left: 14,
    top: 14,
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

  /* ---------------------------------------------------------------------- */
  /* Favorite                                                               */
  /* ---------------------------------------------------------------------- */

  favoritePosition: {
    position: "absolute",
    right: 12,
    top: 12,
  },

  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------------------------------------------------------------- */
  /* Discount                                                               */
  /* ---------------------------------------------------------------------- */

  discountPosition: {
    position: "absolute",
    right: 14,
    bottom: 14,
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

  /* ---------------------------------------------------------------------- */
  /* Logo                                                                   */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Content                                                                */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Rating                                                                 */
  /* ---------------------------------------------------------------------- */

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 30,
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

  /* ---------------------------------------------------------------------- */
  /* Tags                                                                   */
  /* ---------------------------------------------------------------------- */

  tagsWrapper: {
    marginTop: 14,
  },

  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  tag: {
    minHeight: 34,

    paddingHorizontal: 13,

    marginRight: 8,

    maxWidth: 145,

    alignItems: "center",

    justifyContent: "center",
  },

  tagText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
  },

  /* ---------------------------------------------------------------------- */
  /* Divider                                                                */
  /* ---------------------------------------------------------------------- */

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },

  /* ---------------------------------------------------------------------- */
  /* Footer                                                                 */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Free Delivery                                                          */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Pagination                                                             */
  /* ---------------------------------------------------------------------- */

  pagination: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 12,

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
