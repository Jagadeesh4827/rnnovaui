import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
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

    image: 36,
    icon: 20,

    font: 11,

    padding: 4,

    gap: 4,
  },

  md: {
    width: 75,
    height: 75,

    image: 40,
    icon: 22,

    font: 12,

    padding: 4,

    gap: 4,
  },

  lg: {
    width: 104,
    height: 122,

    image: 62,
    icon: 34,

    font: 14,

    padding: 8,

    gap: 6,
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

    labelColor,

    activeLabelColor,

    labelFontSize,

    labelFontWeight,

    activeLabelFontWeight,

    imageSize,

    imageBorderRadius,

    style,

    reanimated = true,
  }) => {
    const { colors, spacing, radius, typography, sizes, shadows, animation } =
      useUITheme();

    /* =====================================================
       SIZE
    ===================================================== */

    const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    /* =====================================================
       PRESS SCALE
    ===================================================== */

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      if (!reanimated) {
        return {};
      }

      return {
        transform: [
          {
            scale: scale.value,
          },
        ],
      };
    }, [reanimated]);

    /* =====================================================
       PRESS IN
    ===================================================== */

    const handlePressIn = useCallback(() => {
      if (!reanimated) {
        return;
      }

      scale.value = withSpring(0.95, animation.spring);
    }, [reanimated, scale, animation]);

    /* =====================================================
       PRESS OUT
    ===================================================== */

    const handlePressOut = useCallback(() => {
      if (!reanimated) {
        return;
      }

      scale.value = withSpring(1, animation.spring);
    }, [reanimated, scale, animation]);

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
          return radius.none;

        case "circle":
          return radius.circle;

        case "pill":
          return radius.pill;

        case "rounded":
        default:
          return radius.lg;
      }
    }, [shape, radius]);

    /* =====================================================
       PALETTE
    ===================================================== */

    const palette = useMemo(() => {
      switch (variant) {
        /* -------------------------------------------------
           FILLED
        ------------------------------------------------- */

        case "filled":
          return {
            background: selected ? colors.primary : colors.surface,

            borderColor: colors.transparent,

            icon: selected ? colors.onPrimary : colors.primary,

            label: selected ? colors.onPrimary : colors.text,
          };

        /* -------------------------------------------------
           OUTLINE
        ------------------------------------------------- */

        case "outline":
          return {
            background: colors.background,

            borderColor: selected ? colors.primary : colors.border,

            icon: selected ? colors.primary : colors.textSecondary,

            label: colors.text,
          };

        /* -------------------------------------------------
           MINIMAL
        ------------------------------------------------- */

        case "minimal":
          return {
            background: colors.transparent,

            borderColor: colors.transparent,

            icon: selected ? colors.primary : colors.textSecondary,

            label: selected ? colors.primary : colors.text,
          };

        /* -------------------------------------------------
           SOFT
        ------------------------------------------------- */

        case "soft":
        default:
          return {
            background: selected ? colors.primarySoft : colors.card,

            borderColor: selected ? colors.primaryMuted : colors.borderSubtle,

            icon: selected ? colors.primary : colors.textSecondary,

            label: colors.text,
          };
      }
    }, [variant, selected, colors]);

    /* =====================================================
       ITEM CONTAINER
    ===================================================== */

    const containerStyle = useMemo(
      () => [
        styles.itemContainer,

        {
          width: config.width,

          minHeight: config.height,

          padding: item?.padding ?? config.padding,

          gap: item?.gap ?? config.gap,

          borderRadius: item?.borderRadius ?? itemRadius,

          flexDirection,

          backgroundColor: item?.backgroundColor ?? palette.background,

          borderColor: item?.borderColor ?? palette.borderColor,

          borderWidth:
            item?.borderWidth ??
            (variant === "outline" || selected ? 1 : StyleSheet.hairlineWidth),

          alignItems: item?.alignItems ?? "center",

          justifyContent: item?.justifyContent ?? "center",
        },

        variant !== "minimal" && item?.disableShadow !== true
          ? shadows.sm
          : null,

        item?.containerStyle,

        style,
      ],
      [
        item,
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
        return (
          <View style={[styles.mediaContainer, item.mediaContainerStyle]}>
            {item.iconElement}
          </View>
        );
      }

      /* -------------------------------------------------
           IMAGE
        ------------------------------------------------- */

      if (item?.image) {
        const source =
          typeof item.image === "string"
            ? {
                uri: item.image,
              }
            : item.image;

        const finalImageSize = item.imageSize ?? imageSize ?? config.image;

        return (
          <View style={[styles.mediaContainer, item.mediaContainerStyle]}>
            <Image
              source={source}
              resizeMode={item.resizeMode ?? "contain"}
              style={[
                styles.image,

                {
                  width: finalImageSize,

                  height: finalImageSize,

                  borderRadius:
                    item.imageBorderRadius ??
                    imageBorderRadius ??
                    radius.circle,
                },

                item.imageStyle,
              ]}
            />
          </View>
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
            <View style={[styles.mediaContainer, item.mediaContainerStyle]}>
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
           ICON NAME + CUSTOM RENDER
        ------------------------------------------------- */

      if (
        typeof item?.iconName === "string" &&
        typeof item?.renderIcon === "function"
      ) {
        return (
          <View style={[styles.mediaContainer, item.mediaContainerStyle]}>
            {item.renderIcon({
              item,

              size: item.iconSize ?? config.icon,

              color: item.iconColor ?? palette.icon,
            })}
          </View>
        );
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
            <View style={[styles.mediaContainer, item.mediaContainerStyle]}>
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

          size: item.imageSize ?? imageSize ?? config.image,

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
    }, [
      item,
      index,
      selected,
      config,
      radius,
      palette,
      imageSize,
      imageBorderRadius,
    ]);

    /* =====================================================
       TITLE
    ===================================================== */

    const renderTitle = useCallback(() => {
      const title = item?.title ?? item?.name ?? item?.label ?? "";

      const finalLabelColor = selected
        ? (item?.activeLabelColor ??
          activeLabelColor ??
          item?.titleColor ??
          palette.label)
        : (item?.labelColor ?? labelColor ?? item?.titleColor ?? palette.label);

      const finalFontSize =
        item?.fontSize ??
        labelFontSize ??
        typography.fontSize?.sm ??
        config.font;

      const finalFontWeight = selected
        ? (item?.activeLabelFontWeight ??
          activeLabelFontWeight ??
          item?.fontWeight ??
          typography.fontWeights?.semibold ??
          "600")
        : (item?.labelFontWeight ??
          labelFontWeight ??
          item?.fontWeight ??
          typography.fontWeights?.medium ??
          "500");

      return (
        <Text
          numberOfLines={item?.titleNumberOfLines ?? 2}
          ellipsizeMode={item?.titleEllipsizeMode ?? "tail"}
          style={[
            styles.title,

            {
              color: finalLabelColor,

              fontSize: finalFontSize,

              fontFamily: item?.fontFamily ?? undefined,

              fontWeight: finalFontWeight,

              textAlign: item?.titleAlign ?? titleAlign,
            },

            item?.titleStyle,
          ]}
        >
          {title}
        </Text>
      );
    }, [
      item,
      selected,
      activeLabelColor,
      labelColor,
      labelFontSize,
      labelFontWeight,
      activeLabelFontWeight,
      palette,
      typography,
      config,
      titleAlign,
    ]);

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
              backgroundColor: item.badgeColor ?? colors.danger,
            },

            item.badgeStyle,
          ]}
        >
          <Text
            style={[
              styles.badgeText,

              {
                color: item.badgeTextColor ?? colors.onDanger,

                fontSize: item.badgeFontSize ?? typography.fontSizes?.xs ?? 10,
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
              backgroundColor: item?.activeIndicatorColor ?? colors.primary,

              width: item?.activeIndicatorWidth ?? 32,

              height: item?.activeIndicatorHeight ?? 2,
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
      if (item?.disabled) {
        return;
      }

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
       PRESSABLE
    ===================================================== */

    const PressableComponent = reanimated ? AnimatedPressable : Pressable;

    /* =====================================================
       RENDER
    ===================================================== */

    return (
      <PressableComponent
        style={[reanimated ? animatedStyle : null, item?.pressableStyle]}
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
      </PressableComponent>
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

  /* Selection */
  selectedId,

  onPress,

  /* Layout */
  layout = "horizontal",

  columns = 4,

  /* Appearance */
  variant = "soft",

  shape = "rounded",

  size = "md",

  iconPosition = "top",

  titleAlign = "center",

  /* Label */
  labelColor,

  activeLabelColor,

  labelFontSize,

  labelFontWeight,

  activeLabelFontWeight,

  /* Image */
  imageSize,

  imageBorderRadius,

  /* Badge */
  showBadge = true,

  /* Scrolling */
  scrollEnabled = true,

  showsHorizontalScrollIndicator = false,

  showsVerticalScrollIndicator = false,

  /* Container */
  contentContainerStyle,

  itemStyle,

  style,

  /* Selection scrolling */
  initialScrollIndex = 0,

  scrollToSelected = true,

  /* List components */
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

  /* FlatList */
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

  /* Animation */
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
     FLATLIST REF
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
      onPress?.(item, index);
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
         * FlatList may not be
         * measured yet.
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
     GET ITEM LAYOUT
  ======================================================= */

  const getItemLayout = useCallback(
    (_, index) => {
      const item = listData[index];

      const itemSize =
        item?.size === "sm"
          ? SIZE_CONFIG.sm.width
          : item?.size === "lg"
            ? SIZE_CONFIG.lg.width
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
     SCROLL FAILURE
  ======================================================= */

  const handleScrollToIndexFailed = useCallback((info) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset?.({
        offset: info.averageItemLength * info.index,

        animated: true,
      });
    });
  }, []);

  /* =======================================================
     RENDER ITEM
  ======================================================= */

  const finalRenderItem = useCallback(
    ({ item, index }) => {
      /* -----------------------------------------------
           CUSTOM ITEM
        ------------------------------------------------ */

      if (typeof renderItem === "function") {
        return renderItem({
          item,

          index,

          selected: String(item?.id) === String(selectedId),
        });
      }

      /* -----------------------------------------------
           DEFAULT ITEM
        ------------------------------------------------ */

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
          labelColor={item?.labelColor ?? labelColor}
          activeLabelColor={item?.activeLabelColor ?? activeLabelColor}
          labelFontSize={item?.labelFontSize ?? labelFontSize}
          labelFontWeight={item?.labelFontWeight ?? labelFontWeight}
          activeLabelFontWeight={
            item?.activeLabelFontWeight ?? activeLabelFontWeight
          }
          imageSize={item?.imageSize ?? imageSize}
          imageBorderRadius={item?.imageBorderRadius ?? imageBorderRadius}
          showBadge={item?.showBadge ?? showBadge}
          style={[itemStyle, item?.itemStyle]}
          reanimated={reanimated}
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
      labelColor,
      activeLabelColor,
      labelFontSize,
      labelFontWeight,
      activeLabelFontWeight,
      imageSize,
      imageBorderRadius,
      showBadge,
      itemStyle,
      reanimated,
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
     EMPTY
  ======================================================= */

  if (listData.length === 0) {
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
        {typeof renderEmpty === "function" ? renderEmpty() : null}
      </View>
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

  labelColor: PropTypes.string,

  activeLabelColor: PropTypes.string,

  labelFontSize: PropTypes.number,

  labelFontWeight: PropTypes.string,

  activeLabelFontWeight: PropTypes.string,

  imageSize: PropTypes.number,

  imageBorderRadius: PropTypes.number,

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

  labelColor: PropTypes.string,

  activeLabelColor: PropTypes.string,

  labelFontSize: PropTypes.number,

  labelFontWeight: PropTypes.string,

  activeLabelFontWeight: PropTypes.string,

  imageSize: PropTypes.number,

  imageBorderRadius: PropTypes.number,

  showBadge: PropTypes.bool,

  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  reanimated: PropTypes.bool,
};

/* =========================================================
   EXPORTS
========================================================= */

export { UICategory, UICategoryItem, SIZE_CONFIG as UICategorySizeConfig };

export default memo(UICategory);
