import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

import PropTypes from "prop-types";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useUITheme } from "../../theme";

/* =========================================================
   ANIMATED PRESSABLE
========================================================= */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* =========================================================
   SIZE CONFIG
========================================================= */

const SIZE_CONFIG = {
  sm: {
    width: 70,
    height: 90,

    icon: 20,
    image: 36,

    font: 11,
  },

  md: {
    width: 75,
    height: 75,

    icon: 22,
    image: 40,

    font: 12,
  },

  lg: {
    width: 104,
    height: 122,

    icon: 34,
    image: 62,

    font: 14,
  },
};

/* =========================================================
   CATEGORY ITEM
========================================================= */

const UICategoryItem = memo(
  ({
    item,
    index,

    selected = false,

    onPress,

    variant = "soft",

    shape = "rounded",

    size = "md",

    iconPosition = "top",

    titleAlign = "center",

    showBadge = true,

    style,
  }) => {
    const { colors, spacing, radius, typography, shadows } = useUITheme();

    /* =====================================================
       SIZE
    ===================================================== */

    const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    /* =====================================================
       PRESS ANIMATION
    ===================================================== */

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.95, {
        damping: 14,
        stiffness: 220,
      });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {
        damping: 14,
        stiffness: 220,
      });
    }, [scale]);

    /* =====================================================
       FLEX DIRECTION
    ===================================================== */

    const flexDirection = useMemo(() => {
      switch (iconPosition) {
        case "left":
          return "row";

        case "right":
          return "row-reverse";

        case "bottom":
          return "column-reverse";

        case "top":
        default:
          return "column";
      }
    }, [iconPosition]);

    /* =====================================================
       SHAPE
    ===================================================== */

    const itemRadius = useMemo(() => {
      switch (shape) {
        case "square":
          return radius.none || 0;

        case "circle":
          return radius.full;

        case "pill":
          return radius.full;

        case "rounded":
        default:
          return radius.lg || radius.md;
      }
    }, [shape, radius]);

    /* =====================================================
       VARIANT / PALETTE
    ===================================================== */

    const palette = useMemo(() => {
      switch (variant) {
        case "filled":
          return {
            background: selected ? colors.primary : colors.surface.primary,

            border: "transparent",

            title: selected ? colors.button.text : colors.text.primary,

            icon: selected ? colors.button.text : colors.primary,
          };

        case "outline":
          return {
            background: colors.background.secondary,

            border: selected ? colors.primary : colors.border.tertiary,

            title: colors.text.primary,

            icon: selected ? colors.primary : colors.icon.secondary,
          };

        case "minimal":
          return {
            background: colors.transparent,

            border: colors.transparent,

            title: selected ? colors.primary : colors.text.primary,

            icon: selected ? colors.primary : colors.icon.secondary,
          };

        case "soft":
        default:
          return {
            background: selected
              ? colors.category.background
              : colors.surface.primary,

            border: selected ? colors.border.card : colors.border.primary,

            title: colors.text.primary,

            icon: selected ? colors.category.selected : colors.primary,
          };
      }
    }, [variant, selected, colors]);

    /* =====================================================
       CONTAINER STYLE
    ===================================================== */

    const containerStyle = useMemo(
      () => [
        styles.itemContainer,

        {
          width: config.width,

          minHeight: config.height,

          padding: spacing.xs,

          gap: spacing.xs,

          borderRadius: itemRadius,

          flexDirection,

          backgroundColor: palette.background,

          borderColor: palette.border,

          borderWidth:
            variant === "outline" || selected ? 1 : StyleSheet.hairlineWidth,

          alignItems: "center",

          justifyContent: "center",

          ...shadows.sm,
        },

        style,
      ],
      [
        config,
        spacing,
        itemRadius,
        flexDirection,
        palette,
        variant,
        selected,
        shadows,
        style,
      ],
    );

    /* =====================================================
       MEDIA
    ===================================================== */

    const renderMedia = useCallback(() => {
      /* -------------------------------------------------
         CUSTOM REACT ELEMENT
      ------------------------------------------------- */

      if (item?.iconElement) {
        return <View style={styles.mediaContainer}>{item.iconElement}</View>;
      }

      /* -------------------------------------------------
         IMAGE
      ------------------------------------------------- */

      if (item?.image) {
        const imageSource =
          typeof item.image === "string"
            ? {
                uri: item.image,
              }
            : item.image;

        return (
          <Image
            source={imageSource}
            style={[
              styles.image,

              {
                width: item.imageSize ?? config.image,

                height: item.imageSize ?? config.image,

                borderRadius: item.imageBorderRadius ?? radius.full,
              },

              item.imageStyle,
            ]}
            resizeMode={item.contentFit || "contain"}
          />
        );
      }

      /* -------------------------------------------------
         ICON COMPONENT
      ------------------------------------------------- */

      if (item?.icon) {
        const Icon = item.icon;

        if (
          typeof Icon === "function" ||
          (typeof Icon === "object" && Icon !== null)
        ) {
          return (
            <View style={styles.mediaContainer}>
              <Icon
                size={item.iconSize ?? config.icon}
                color={item.iconColor ?? palette.icon}
                strokeWidth={item.iconStrokeWidth ?? 2}
              />
            </View>
          );
        }
      }

      /* -------------------------------------------------
         ICON NAME
      ------------------------------------------------- */

      if (typeof item?.iconName === "string") {
        if (typeof item?.renderIcon === "function") {
          return (
            <View style={styles.mediaContainer}>
              {item.renderIcon({
                item,

                size: item.iconSize ?? config.icon,

                color: item.iconColor ?? palette.icon,
              })}
            </View>
          );
        }
      }

      /* -------------------------------------------------
         SVG COMPONENT
      ------------------------------------------------- */

      if (item?.svg) {
        const SvgIcon = item.svg;

        if (
          typeof SvgIcon === "function" ||
          (typeof SvgIcon === "object" && SvgIcon !== null)
        ) {
          return (
            <View style={styles.mediaContainer}>
              <SvgIcon
                width={item.svgWidth ?? config.icon}
                height={item.svgHeight ?? config.icon}
                color={item.iconColor ?? palette.icon}
              />
            </View>
          );
        }
      }

      /* -------------------------------------------------
         CUSTOM MEDIA
      ------------------------------------------------- */

      if (typeof item?.renderMedia === "function") {
        return item.renderMedia({
          item,
          index,
          selected,

          size: item.imageSize ?? config.image,

          iconSize: item.iconSize ?? config.icon,

          color: item.iconColor ?? palette.icon,
        });
      }

      /* -------------------------------------------------
         EMOJI
      ------------------------------------------------- */

      if (item?.emoji) {
        return (
          <Text
            style={[
              styles.emoji,

              {
                fontSize: item.emojiSize ?? config.icon,
              },

              item.emojiStyle,
            ]}
          >
            {item.emoji}
          </Text>
        );
      }

      return null;
    }, [item, index, selected, config, radius, palette]);

    /* =====================================================
       TITLE
    ===================================================== */

    const renderTitle = useCallback(() => {
      const title = item?.title ?? item?.name ?? item?.label ?? "";

      return (
        <Text
          numberOfLines={item?.titleNumberOfLines ?? 2}
          ellipsizeMode={item?.titleEllipsizeMode ?? "tail"}
          style={[
            styles.title,

            {
              color: item?.titleColor ?? palette.title,

              fontSize:
                item?.fontSize ?? typography.fontSize?.xs ?? config.font,

              fontFamily: item?.fontFamily ?? typography.fontFamily?.medium,

              fontWeight:
                item?.fontWeight ?? typography.fontWeight?.bold ?? "600",

              textAlign: item?.titleAlign ?? titleAlign,
            },

            item?.titleStyle,
          ]}
        >
          {title}
        </Text>
      );
    }, [item, palette, typography, config, titleAlign]);

    /* =====================================================
       BADGE
    ===================================================== */

    const renderBadge = useCallback(() => {
      if (!showBadge || !item?.badge) {
        return null;
      }

      return (
        <View
          style={[
            styles.badge,

            {
              backgroundColor: item.badgeColor || colors.status.error,
            },

            item.badgeStyle,
          ]}
        >
          <Text
            style={[
              styles.badgeText,

              {
                color: item.badgeTextColor || colors.text.inverse,

                fontSize: item.badgeFontSize || typography.fontSize?.xs || 10,
              },

              item.badgeTextStyle,
            ]}
            numberOfLines={1}
          >
            {item.badge}
          </Text>
        </View>
      );
    }, [item, showBadge, colors, typography]);

    /* =====================================================
       ACTIVE INDICATOR
    ===================================================== */

    const renderActiveIndicator = useCallback(() => {
      if (!selected || item?.showActiveIndicator === false) {
        return null;
      }

      return (
        <View
          style={[
            styles.activeIndicator,

            {
              backgroundColor:
                item?.activeIndicatorColor ?? colors.category.selected,
            },

            item?.activeIndicatorStyle,
          ]}
        />
      );
    }, [selected, item, colors]);

    /* =====================================================
       PRESS
    ===================================================== */

    const handlePress = useCallback(() => {
      onPress?.(item, index);
    }, [onPress, item, index]);

    /* =====================================================
       ACCESSIBILITY
    ===================================================== */

    const accessibilityLabel =
      item?.accessibilityLabel ??
      item?.title ??
      item?.name ??
      item?.label ??
      "";

    /* =====================================================
       RENDER
    ===================================================== */

    return (
      <AnimatedPressable
        style={[animatedStyle, item?.pressableStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={item?.disabled ?? false}
        accessibilityRole={item?.accessibilityRole ?? "button"}
        accessibilityState={{
          selected,
          disabled: item?.disabled ?? false,
        }}
        accessibilityLabel={accessibilityLabel}
      >
        <View style={containerStyle}>
          {renderBadge()}

          {renderMedia()}

          {renderTitle()}

          {renderActiveIndicator()}
        </View>
      </AnimatedPressable>
    );
  },
);

/* =========================================================
   MAIN UICATEGORY
========================================================= */

const UICategory = ({
  data = [],

  /* Alias */
  categories,

  selectedId,

  onPress,

  layout = "horizontal",

  columns = 4,

  variant = "soft",

  shape = "rounded",

  size = "md",

  iconPosition = "top",

  titleAlign = "center",

  showBadge = true,

  scrollEnabled = true,

  showsHorizontalScrollIndicator = false,

  showsVerticalScrollIndicator = false,

  contentContainerStyle,

  itemStyle,

  style,

  /* Scroll */
  initialScrollIndex = 0,

  scrollToSelected = true,

  /* List */
  ListHeaderComponent,

  ListFooterComponent,

  /* Events */
  onScroll,

  onScrollBeginDrag,

  onScrollEndDrag,

  onMomentumScrollBegin,

  onMomentumScrollEnd,

  onContentSizeChange,

  onLayout,

  /* FlatList performance */
  initialNumToRender = 8,

  maxToRenderPerBatch = 8,

  updateCellsBatchingPeriod = 50,

  windowSize = 7,

  removeClippedSubviews = true,

  /* Custom render */
  renderItem,

  keyExtractor,

  /* Empty */
  renderEmpty,

  /*
   * Kept for API compatibility.
   * Item animation still uses Reanimated.
   */
  reanimated = true,

  /* Remaining FlatList props */
  ...listProps
}) => {
  const { spacing } = useUITheme();

  /* =======================================================
     DATA
  ======================================================= */

  const listData = useMemo(() => {
    const source = categories ?? data;

    if (!Array.isArray(source)) {
      return [];
    }

    return source;
  }, [data, categories]);

  /* =======================================================
     LIST REF
  ======================================================= */

  const flatListRef = useRef(null);

  /* =======================================================
     LAYOUT
  ======================================================= */

  const horizontal = layout === "horizontal";

  const isGrid = layout === "grid";

  const numColumns = isGrid ? columns : 1;

  /* =======================================================
     SELECTED INDEX
  ======================================================= */

  const selectedIndex = useMemo(() => {
    if (selectedId === undefined || selectedId === null) {
      return -1;
    }

    return listData.findIndex(
      (item) => String(item?.id) === String(selectedId),
    );
  }, [listData, selectedId]);

  /* =======================================================
     KEY EXTRACTOR
  ======================================================= */

  const finalKeyExtractor = useCallback(
    (item, index) => {
      if (typeof keyExtractor === "function") {
        return String(keyExtractor(item, index));
      }

      return String(item?.id ?? item?.key ?? item?.value ?? index);
    },
    [keyExtractor],
  );

  /* =======================================================
     PRESS
  ======================================================= */

  const handlePress = useCallback(
    (item, index) => {
      if (typeof onPress === "function") {
        onPress(item, index);
      }
    },
    [onPress],
  );

  /* =======================================================
     SCROLL TO SELECTED
  ======================================================= */

  useEffect(() => {
    if (!scrollToSelected || selectedIndex < 0 || isGrid) {
      return;
    }

    const ref = flatListRef.current;

    if (!ref?.scrollToIndex) {
      return;
    }

    requestAnimationFrame(() => {
      try {
        ref.scrollToIndex({
          index: selectedIndex,

          animated: true,

          viewPosition: 0.5,
        });
      } catch {
        /*
         * Ignore until FlatList
         * has been measured.
         */
      }
    });
  }, [selectedIndex, isGrid, scrollToSelected]);

  /* =======================================================
     INITIAL SCROLL
  ======================================================= */

  useEffect(() => {
    if (initialScrollIndex <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex?.({
        index: initialScrollIndex,

        animated: false,
      });
    });
  }, [initialScrollIndex]);

  /* =======================================================
     RENDER ITEM
  ======================================================= */

  const finalRenderItem = useCallback(
    ({ item, index }) => {
      /*
       * Custom rendering
       */

      if (typeof renderItem === "function") {
        return renderItem({
          item,
          index,

          selected: String(item?.id) === String(selectedId),
        });
      }

      /*
       * Default category item
       */

      return (
        <UICategoryItem
          item={item}
          index={index}
          selected={String(item?.id) === String(selectedId)}
          onPress={handlePress}
          variant={item?.variant ?? variant}
          shape={item?.shape ?? shape}
          size={item?.size ?? size}
          iconPosition={item?.iconPosition ?? iconPosition}
          titleAlign={item?.titleAlign ?? titleAlign}
          showBadge={item?.showBadge ?? showBadge}
          style={[itemStyle, item?.itemStyle]}
        />
      );
    },
    [
      renderItem,
      selectedId,
      handlePress,
      variant,
      shape,
      size,
      iconPosition,
      titleAlign,
      showBadge,
      itemStyle,
    ],
  );

  /* =======================================================
     CONTENT CONTAINER
  ======================================================= */

  const finalContentContainerStyle = useMemo(
    () => [
      {
        paddingHorizontal: horizontal ? spacing.xxs : 0,

        paddingVertical: spacing.sm,

        rowGap: spacing.md,

        columnGap: spacing.md,
      },

      contentContainerStyle,
    ],
    [horizontal, spacing, contentContainerStyle],
  );

  /* =======================================================
     GET ITEM LAYOUT
  ======================================================= */

  const getItemLayout = useCallback(
    (_, index) => {
      const item = listData[index];

      const itemSize =
        item?.size === "sm"
          ? 70
          : item?.size === "lg"
            ? 104
            : SIZE_CONFIG.md.width;

      return {
        length: itemSize,

        offset: itemSize * index,

        index,
      };
    },
    [listData],
  );

  /* =======================================================
     SCROLL ERROR
  ======================================================= */

  const handleScrollToIndexFailed = useCallback((info) => {
    requestAnimationFrame(() => {
      const ref = flatListRef.current;

      if (!ref) {
        return;
      }

      ref.scrollToOffset?.({
        offset: info.averageItemLength * info.index,

        animated: true,
      });
    });
  }, []);

  /* =======================================================
     EMPTY
  ======================================================= */

  if (listData.length === 0) {
    if (typeof renderEmpty === "function") {
      return (
        <View
          style={[
            styles.emptyContainer,

            {
              padding: spacing.lg,
            },

            style,
          ]}
        >
          {renderEmpty()}
        </View>
      );
    }

    return (
      <View
        style={[
          styles.emptyContainer,

          {
            padding: spacing.lg,
          },

          style,
        ]}
      />
    );
  }

  /* =======================================================
     FLATLIST
  ======================================================= */

  return (
    <FlatList
      ref={flatListRef}
      data={listData}
      renderItem={finalRenderItem}
      keyExtractor={finalKeyExtractor}
      horizontal={horizontal}
      numColumns={numColumns}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={finalContentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      initialScrollIndex={initialScrollIndex}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      style={style}
      {...listProps}
    />
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  itemContainer: {
    position: "relative",

    alignItems: "center",

    justifyContent: "center",
  },

  mediaContainer: {
    alignItems: "center",

    justifyContent: "center",
  },

  image: {
    alignItems: "center",

    justifyContent: "center",
  },

  emoji: {
    textAlign: "center",
  },

  title: {
    width: "100%",
  },

  badge: {
    position: "absolute",

    top: -4,

    right: -4,

    minWidth: 20,

    height: 20,

    paddingHorizontal: 6,

    justifyContent: "center",

    alignItems: "center",

    borderRadius: 999,

    zIndex: 10,
  },

  badgeText: {
    fontWeight: "700",
  },

  activeIndicator: {
    position: "absolute",

    bottom: -8,

    width: 32,

    height: 1,

    borderRadius: 999,
  },

  emptyContainer: {
    width: "100%",

    alignItems: "center",

    justifyContent: "center",
  },
});

/* =========================================================
   PROP TYPES
========================================================= */

UICategory.propTypes = {
  data: PropTypes.array,

  categories: PropTypes.array,

  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  onPress: PropTypes.func,

  layout: PropTypes.oneOf(["horizontal", "vertical", "grid"]),

  columns: PropTypes.number,

  variant: PropTypes.oneOf(["soft", "filled", "outline", "minimal"]),

  shape: PropTypes.oneOf(["rounded", "square", "circle", "pill"]),

  size: PropTypes.oneOf(["sm", "md", "lg"]),

  iconPosition: PropTypes.oneOf(["top", "bottom", "left", "right"]),

  titleAlign: PropTypes.oneOf(["left", "center", "right"]),

  showBadge: PropTypes.bool,

  scrollEnabled: PropTypes.bool,

  showsHorizontalScrollIndicator: PropTypes.bool,

  showsVerticalScrollIndicator: PropTypes.bool,

  contentContainerStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),

  itemStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  initialScrollIndex: PropTypes.number,

  scrollToSelected: PropTypes.bool,

  ListHeaderComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

  ListFooterComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

  onScroll: PropTypes.func,

  onScrollBeginDrag: PropTypes.func,

  onScrollEndDrag: PropTypes.func,

  onMomentumScrollBegin: PropTypes.func,

  onMomentumScrollEnd: PropTypes.func,

  onContentSizeChange: PropTypes.func,

  onLayout: PropTypes.func,

  initialNumToRender: PropTypes.number,

  maxToRenderPerBatch: PropTypes.number,

  updateCellsBatchingPeriod: PropTypes.number,

  windowSize: PropTypes.number,

  removeClippedSubviews: PropTypes.bool,

  renderItem: PropTypes.func,

  keyExtractor: PropTypes.func,

  renderEmpty: PropTypes.func,

  reanimated: PropTypes.bool,
};

/* =========================================================
   ITEM PROP TYPES
========================================================= */

UICategoryItem.propTypes = {
  item: PropTypes.object.isRequired,

  index: PropTypes.number,

  selected: PropTypes.bool,

  onPress: PropTypes.func,

  variant: PropTypes.oneOf(["soft", "filled", "outline", "minimal"]),

  shape: PropTypes.oneOf(["rounded", "square", "circle", "pill"]),

  size: PropTypes.oneOf(["sm", "md", "lg"]),

  iconPosition: PropTypes.oneOf(["top", "bottom", "left", "right"]),

  titleAlign: PropTypes.oneOf(["left", "center", "right"]),

  showBadge: PropTypes.bool,

  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

/* =========================================================
   EXPORTS
========================================================= */

export { UICategory, UICategoryItem, SIZE_CONFIG as UICategorySizeConfig };

export default memo(UICategory);
