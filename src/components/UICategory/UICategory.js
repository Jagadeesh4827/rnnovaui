import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_ITEM_WIDTH = 96;
const DEFAULT_IMAGE_SIZE = 82;
const DEFAULT_IMAGE_BORDER_RADIUS = 22;

const DEFAULT_ACTIVE_COLOR = "#FF4B00";
const DEFAULT_TEXT_COLOR = "#222222";
const DEFAULT_INACTIVE_TEXT_COLOR = "#222222";

const DEFAULT_GAP = 16;
const DEFAULT_HORIZONTAL_PADDING = 16;

const CATEGORY_ANIMATIONS = [
  "none",

  "fade",
  "fadeUp",
  "fadeDown",
  "fadeLeft",
  "fadeRight",

  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",

  "scale",
  "scaleUp",
  "scaleDown",

  "zoomIn",
  "zoomOut",

  "bounce",
  "elastic",

  "rotate",
  "flip",
];

const ACTIVE_ANIMATIONS = [
  "none",
  "scale",
  "bounce",
  "pulse",
  "elastic",
  "lift",
  "rotate",
];

const PRESS_ANIMATIONS = ["none", "scale", "shrink", "bounce"];

/* =========================================================
   CATEGORY ITEM ANIMATION
========================================================= */

const useCategoryAnimation = ({
  animation = "none",
  duration = 600,
  delay = 0,
  reanimated = true,
}) => {
  const progress = useSharedValue(animation === "none" ? 1 : 0);

  useEffect(() => {
    if (!reanimated || !animation || animation === "none") {
      progress.value = 1;
      return;
    }

    progress.value = 0;

    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [animation, duration, delay, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || !animation || animation === "none") {
      return {};
    }

    const opacity = interpolate(progress.value, [0, 1], [0, 1]);

    switch (animation) {
      case "fade":
        return {
          opacity,
        };

      case "fadeUp":
      case "slideUp":
        return {
          opacity,
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [35, 0]),
            },
          ],
        };

      case "fadeDown":
      case "slideDown":
        return {
          opacity,
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [-35, 0]),
            },
          ],
        };

      case "fadeLeft":
      case "slideLeft":
        return {
          opacity,
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [40, 0]),
            },
          ],
        };

      case "fadeRight":
      case "slideRight":
        return {
          opacity,
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-40, 0]),
            },
          ],
        };

      case "scale":
      case "scaleUp":
      case "zoomIn":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.7, 1]),
            },
          ],
        };

      case "scaleDown":
      case "zoomOut":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1.3, 1]),
            },
          ],
        };

      case "bounce":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(
                progress.value,
                [0, 0.65, 0.82, 1],
                [0.7, 1.12, 0.96, 1],
              ),
            },
          ],
        };

      case "elastic":
        return {
          opacity,
          transform: [
            {
              scale: interpolate(
                progress.value,
                [0, 0.45, 0.7, 1],
                [0.65, 1.15, 0.95, 1],
              ),
            },
          ],
        };

      case "rotate":
        return {
          opacity,
          transform: [
            {
              rotate: `${interpolate(progress.value, [0, 1], [-25, 0])}deg`,
            },
          ],
        };

      case "flip":
        return {
          opacity,
          transform: [
            {
              rotateY: `${interpolate(progress.value, [0, 1], [90, 0])}deg`,
            },
          ],
        };

      default:
        return {
          opacity,
        };
    }
  });

  return animatedStyle;
};

/* =========================================================
   ACTIVE ANIMATION
========================================================= */

const useActiveAnimation = ({
  active,
  animation = "none",
  duration = 500,
  reanimated = true,
}) => {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (!reanimated || !active || !animation || animation === "none") {
      progress.value = active ? 1 : 0;
      return;
    }

    progress.value = 0;

    if (animation === "bounce" || animation === "elastic") {
      progress.value = withSequence(
        withSpring(1.08, {
          damping: animation === "elastic" ? 5 : 10,
          stiffness: 180,
        }),
        withSpring(1),
      );
    } else {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [active, animation, duration, reanimated, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || !active || !animation || animation === "none") {
      return {};
    }

    switch (animation) {
      case "scale":
      case "bounce":
      case "elastic":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.08]),
            },
          ],
        };

      case "pulse":
        return {
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.06]),
            },
          ],
        };

      case "lift":
        return {
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [0, -5]),
            },
            {
              scale: interpolate(progress.value, [0, 1], [1, 1.04]),
            },
          ],
        };

      case "rotate":
        return {
          transform: [
            {
              rotate: `${interpolate(progress.value, [0, 1], [0, 8])}deg`,
            },
          ],
        };

      default:
        return {};
    }
  });

  return animatedStyle;
};

/* =========================================================
   PRESS ANIMATION
========================================================= */

const usePressAnimation = ({ animation = "scale", reanimated = true }) => {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    if (!reanimated || animation === "none") {
      return;
    }

    pressed.value = withTiming(1, {
      duration: 100,
    });
  };

  const handlePressOut = () => {
    if (!reanimated || animation === "none") {
      return;
    }

    pressed.value = withTiming(0, {
      duration: 180,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimated || animation === "none") {
      return {};
    }

    switch (animation) {
      case "scale":
      case "shrink":
        return {
          transform: [
            {
              scale: interpolate(pressed.value, [0, 1], [1, 0.94]),
            },
          ],
        };

      case "bounce":
        return {
          transform: [
            {
              scale: interpolate(pressed.value, [0, 1], [1, 0.92]),
            },
          ],
        };

      default:
        return {};
    }
  });

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};

/* =========================================================
   CATEGORY ITEM
========================================================= */

const UICategoryItem = memo(
  ({
    item,
    index,

    selected,
    onPress,

    itemWidth,
    imageSize,
    imageBorderRadius,

    gap,

    activeColor,
    textColor,
    inactiveTextColor,

    imageBackgroundColor,
    activeImageBackgroundColor,

    imageResizeMode,

    labelFontSize,
    labelFontWeight,
    activeLabelFontWeight,

    imageStyle,
    activeImageStyle,

    imageContainerStyle,
    activeImageContainerStyle,

    labelStyle,
    activeLabelStyle,

    itemStyle,
    activeItemStyle,

    showActiveIndicator,
    activeIndicatorStyle,

    renderItem,
    renderImage,

    iconName,
    iconSize,
    iconColor,

    reanimated,

    animation,
    animationDuration,
    animationDelay,

    activeAnimation,
    activeAnimationDuration,

    pressAnimation,

    onItemPress,
  }) => {
    /*
     * -------------------------------------------------------
     * Custom renderer
     * -------------------------------------------------------
     */

    if (renderItem) {
      return renderItem({
        item,
        index,
        selected,
        onPress: () => onPress?.(item, index),
      });
    }

    /*
     * -------------------------------------------------------
     * Primitive animation configuration
     * -------------------------------------------------------
     */

    const itemAnimation = item?.animation ?? animation ?? "none";

    const itemAnimationDuration =
      item?.animationDuration ?? animationDuration ?? 600;

    const itemAnimationDelay =
      item?.animationDelay ?? animationDelay ?? index * 70;

    const itemActiveAnimation =
      item?.activeAnimation ?? activeAnimation ?? "none";

    const itemActiveAnimationDuration =
      item?.activeAnimationDuration ?? activeAnimationDuration ?? 450;

    const itemPressAnimation =
      item?.pressAnimation ?? pressAnimation ?? "scale";

    /*
     * -------------------------------------------------------
     * Hooks
     * -------------------------------------------------------
     */

    const entranceStyle = useCategoryAnimation({
      animation: itemAnimation,
      duration: itemAnimationDuration,
      delay: itemAnimationDelay,
      reanimated,
    });

    const activeStyle = useActiveAnimation({
      active: selected,
      animation: itemActiveAnimation,
      duration: itemActiveAnimationDuration,
      reanimated,
    });

    const {
      animatedStyle: pressStyle,
      handlePressIn,
      handlePressOut,
    } = usePressAnimation({
      animation: itemPressAnimation,
      reanimated,
    });

    /*
     * -------------------------------------------------------
     * Data
     * -------------------------------------------------------
     */

    const itemLabel = item?.label ?? item?.name ?? "";

    const itemImage = item?.image ?? item?.iconImage ?? item?.source;

    const itemIcon = item?.icon ?? item?.iconName ?? iconName;

    const finalIconColor =
      item?.iconColor ?? iconColor ?? (selected ? activeColor : "#555555");

    const finalIconSize = item?.iconSize ?? iconSize ?? 34;

    const finalImageSize = item?.imageSize ?? imageSize;

    const finalImageRadius = item?.imageBorderRadius ?? imageBorderRadius;

    const finalBackgroundColor = selected
      ? (item?.activeImageBackgroundColor ?? activeImageBackgroundColor)
      : (item?.imageBackgroundColor ?? imageBackgroundColor);

    const finalTextColor = selected
      ? (item?.activeTextColor ?? activeColor)
      : (item?.textColor ?? inactiveTextColor ?? textColor);

    const finalResizeMode = item?.resizeMode ?? imageResizeMode;

    /*
     * -------------------------------------------------------
     * Press handler
     * -------------------------------------------------------
     */

    const handlePress = () => {
      onPress?.(item, index);
      onItemPress?.(item, index);
    };

    /*
     * -------------------------------------------------------
     * Render
     * -------------------------------------------------------
     */

    return (
      <Animated.View
        style={[
          {
            width: itemWidth,
            marginRight: index === 0 ? 0 : gap,
          },
          entranceStyle,
          activeStyle,
          pressStyle,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.item, itemStyle, selected && activeItemStyle]}
        >
          {/* =================================================
              IMAGE / ICON
          ================================================= */}

          <View
            style={[
              styles.imageContainer,
              {
                width: finalImageSize,
                height: finalImageSize,
                borderRadius: finalImageRadius,
                backgroundColor: finalBackgroundColor,
              },
              imageContainerStyle,
              selected && activeImageContainerStyle,
            ]}
          >
            {item?.renderImage ? (
              item.renderImage({
                item,
                index,
                selected,
                size: finalImageSize,
              })
            ) : itemImage ? (
              <Image
                source={itemImage}
                resizeMode={finalResizeMode}
                style={[
                  styles.image,
                  {
                    width: finalImageSize,
                    height: finalImageSize,
                    borderRadius: finalImageRadius,
                  },
                  imageStyle,
                  selected && activeImageStyle,
                ]}
              />
            ) : itemIcon ? (
              typeof itemIcon === "string" ? (
                <Ionicons
                  name={itemIcon}
                  size={finalIconSize}
                  color={finalIconColor}
                />
              ) : (
                itemIcon
              )
            ) : null}
          </View>

          {/* =================================================
              LABEL
          ================================================= */}

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.label,
              {
                color: finalTextColor,

                fontSize: item?.labelFontSize ?? labelFontSize,

                fontWeight: selected
                  ? (item?.activeLabelFontWeight ?? activeLabelFontWeight)
                  : (item?.labelFontWeight ?? labelFontWeight),
              },
              labelStyle,
              selected && activeLabelStyle,
            ]}
          >
            {itemLabel}
          </Text>

          {/* =================================================
              ACTIVE INDICATOR
          ================================================= */}

          {showActiveIndicator && selected ? (
            <View
              style={[
                styles.activeIndicator,
                {
                  backgroundColor: activeColor,
                },
                activeIndicatorStyle,
              ]}
            />
          ) : null}
        </Pressable>
      </Animated.View>
    );
  },
);

/* =========================================================
   MAIN UICATEGORY
========================================================= */

const UICategory = ({
  categories = [],

  selectedCategory,
  defaultSelectedCategory,

  onCategoryPress,
  onChange,

  horizontal = true,
  showsHorizontalScrollIndicator = false,

  itemWidth = DEFAULT_ITEM_WIDTH,

  imageSize = DEFAULT_IMAGE_SIZE,

  imageBorderRadius = DEFAULT_IMAGE_BORDER_RADIUS,

  gap = DEFAULT_GAP,

  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,

  activeColor = DEFAULT_ACTIVE_COLOR,

  textColor = DEFAULT_TEXT_COLOR,

  inactiveTextColor = DEFAULT_INACTIVE_TEXT_COLOR,

  imageBackgroundColor = "#FFF7F2",

  activeImageBackgroundColor = "#FFF0E8",

  imageResizeMode = "contain",

  labelFontSize = 15,

  labelFontWeight = "500",

  activeLabelFontWeight = "600",

  imageStyle,
  activeImageStyle,

  imageContainerStyle,
  activeImageContainerStyle,

  labelStyle,
  activeLabelStyle,

  itemStyle,
  activeItemStyle,

  showActiveIndicator = false,

  activeIndicatorStyle,

  pressableStyle,

  contentContainerStyle,

  style,

  initialScrollIndex = 0,

  scrollToSelected = true,

  ListHeaderComponent,
  ListFooterComponent,

  renderItem,

  renderImage,

  iconName,
  iconSize = 34,
  iconColor = "#555555",

  keyExtractor,

  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,

  testID,

  /* =======================================================
     ANIMATION PROPS
  ======================================================= */

  reanimated = true,

  animation = "fadeUp",

  animationDuration = 600,

  animationDelay = 70,

  animationStagger = 70,

  activeAnimation = "bounce",

  activeAnimationDuration = 500,

  pressAnimation = "scale",

  onItemPress,

  ...flatListProps
}) => {
  const listRef = useRef(null);

  const [internalSelected, setInternalSelected] = useState(
    defaultSelectedCategory ?? categories?.[0]?.id ?? categories?.[0]?.key ?? 0,
  );

  /*
   * Controlled selection
   */

  const isControlled = selectedCategory !== undefined;

  const activeCategory = isControlled ? selectedCategory : internalSelected;

  /* =======================================================
     KEY
  ======================================================= */

  const getCategoryKey = useCallback(
    (item, index) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }

      return String(item?.id ?? item?.key ?? item?.value ?? index);
    },
    [keyExtractor],
  );

  /* =======================================================
     PRESS
  ======================================================= */

  const handleCategoryPress = useCallback(
    (item, index) => {
      const categoryKey = getCategoryKey(item, index);

      if (!isControlled) {
        setInternalSelected(categoryKey);
      }

      onCategoryPress?.(item, index);

      onChange?.(item, index);
    },
    [getCategoryKey, isControlled, onCategoryPress, onChange],
  );

  /* =======================================================
     SELECTED
  ======================================================= */

  const isItemSelected = useCallback(
    (item, index) => {
      const key = getCategoryKey(item, index);

      return String(key) === String(activeCategory);
    },
    [getCategoryKey, activeCategory],
  );

  /* =======================================================
     SCROLL TO SELECTED
  ======================================================= */

  useEffect(() => {
    if (
      !scrollToSelected ||
      !categories?.length ||
      activeCategory === undefined ||
      activeCategory === null
    ) {
      return;
    }

    const selectedIndex = categories.findIndex(
      (item, index) =>
        String(getCategoryKey(item, index)) === String(activeCategory),
    );

    if (selectedIndex < 0 || !listRef.current) {
      return;
    }

    const offset = selectedIndex * (itemWidth + gap);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: Math.max(0, offset - horizontalPadding),
        animated: true,
      });
    });
  }, [
    activeCategory,
    categories,
    gap,
    getCategoryKey,
    horizontalPadding,
    itemWidth,
    scrollToSelected,
  ]);

  /* =======================================================
     INITIAL SCROLL
  ======================================================= */

  useEffect(() => {
    if (initialScrollIndex <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: initialScrollIndex * (itemWidth + gap),
        animated: false,
      });
    });
  }, [initialScrollIndex, itemWidth, gap]);

  /* =======================================================
     RENDER ITEM
  ======================================================= */

  const renderCategoryItem = useCallback(
    ({ item, index }) => {
      const selected = isItemSelected(item, index);

      /*
       * Individual category delay:
       *
       * global animationDelay
       * +
       * index * animationStagger
       *
       * This creates:
       *
       * All      → first
       * Pizza    → next
       * Biryani  → next
       * Burgers  → next
       */

      const itemDelay =
        item?.animationDelay ?? animationDelay + index * animationStagger;

      return (
        <UICategoryItem
          item={item}
          index={index}
          selected={selected}
          onPress={handleCategoryPress}
          itemWidth={itemWidth}
          imageSize={imageSize}
          imageBorderRadius={imageBorderRadius}
          gap={gap}
          activeColor={activeColor}
          textColor={textColor}
          inactiveTextColor={inactiveTextColor}
          imageBackgroundColor={imageBackgroundColor}
          activeImageBackgroundColor={activeImageBackgroundColor}
          imageResizeMode={imageResizeMode}
          labelFontSize={labelFontSize}
          labelFontWeight={labelFontWeight}
          activeLabelFontWeight={activeLabelFontWeight}
          imageStyle={imageStyle}
          activeImageStyle={activeImageStyle}
          imageContainerStyle={imageContainerStyle}
          activeImageContainerStyle={activeImageContainerStyle}
          labelStyle={labelStyle}
          activeLabelStyle={activeLabelStyle}
          itemStyle={itemStyle}
          activeItemStyle={activeItemStyle}
          showActiveIndicator={showActiveIndicator}
          activeIndicatorStyle={activeIndicatorStyle}
          pressableStyle={pressableStyle}
          renderItem={renderItem}
          renderImage={renderImage}
          iconName={iconName}
          iconSize={iconSize}
          iconColor={iconColor}
          reanimated={reanimated}
          animation={item?.animation ?? animation}
          animationDuration={item?.animationDuration ?? animationDuration}
          animationDelay={itemDelay}
          activeAnimation={item?.activeAnimation ?? activeAnimation}
          activeAnimationDuration={
            item?.activeAnimationDuration ?? activeAnimationDuration
          }
          pressAnimation={item?.pressAnimation ?? pressAnimation}
          onItemPress={onItemPress}
        />
      );
    },
    [
      isItemSelected,
      handleCategoryPress,

      itemWidth,
      imageSize,
      imageBorderRadius,

      gap,

      activeColor,
      textColor,
      inactiveTextColor,

      imageBackgroundColor,
      activeImageBackgroundColor,

      imageResizeMode,

      labelFontSize,
      labelFontWeight,
      activeLabelFontWeight,

      imageStyle,
      activeImageStyle,

      imageContainerStyle,
      activeImageContainerStyle,

      labelStyle,
      activeLabelStyle,

      itemStyle,
      activeItemStyle,

      showActiveIndicator,
      activeIndicatorStyle,

      pressableStyle,

      renderItem,
      renderImage,

      iconName,
      iconSize,
      iconColor,

      reanimated,

      animation,
      animationDuration,
      animationDelay,
      animationStagger,

      activeAnimation,
      activeAnimationDuration,

      pressAnimation,
      onItemPress,
    ],
  );

  /* =======================================================
     KEY EXTRACTOR
  ======================================================= */

  const finalKeyExtractor = useCallback(
    (item, index) => getCategoryKey(item, index),
    [getCategoryKey],
  );

  /* =======================================================
     FLATLIST
  ======================================================= */

  return (
    <View style={[styles.container, style]} testID={testID}>
      <FlatList
        ref={listRef}
        data={categories}
        horizontal={horizontal}
        keyExtractor={finalKeyExtractor}
        renderItem={renderCategoryItem}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        contentContainerStyle={[
          {
            paddingLeft: horizontalPadding,

            paddingRight: horizontalPadding,
          },
          contentContainerStyle,
        ]}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        removeClippedSubviews={false}
        {...flatListProps}
      />
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  item: {
    width: "100%",

    alignItems: "center",
    justifyContent: "flex-start",
  },

  imageContainer: {
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    marginBottom: 9,
  },

  image: {
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    width: "100%",

    textAlign: "center",

    includeFontPadding: false,
  },

  activeIndicator: {
    width: 24,
    height: 3,

    borderRadius: 2,

    marginTop: 6,
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export default UICategory;

export {
  UICategory,
  UICategoryItem,
  CATEGORY_ANIMATIONS as UICategoryAnimations,
  ACTIVE_ANIMATIONS as UICategoryActiveAnimations,
  PRESS_ANIMATIONS as UICategoryPressAnimations,
};
