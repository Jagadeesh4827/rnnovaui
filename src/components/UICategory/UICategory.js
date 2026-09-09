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
   SAFE THEME RESOLVER
========================================================= */

function resolveTheme(theme) {
  return {
    colors: theme?.colors ?? {},

    spacing: theme?.spacing ?? {},

    radius: theme?.radius ?? {},

    typography: theme?.typography ?? {},

    sizes: theme?.sizes ?? {},

    shadows: theme?.shadows ?? {},

    animation: theme?.animation ?? {},
  };
}

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
    /* =====================================================
       THEME
    ===================================================== */

    const { theme } = useUITheme();

    const { colors, spacing, radius, typography, shadows, animation } =
      resolveTheme(theme);

    /* =====================================================
       SAFE THEME VALUES
    ===================================================== */

    const safeColors = {
      transparent: colors.transparent ?? "transparent",

      primary: colors.primary ?? "#FF5A1F",

      primarySoft: colors.primarySoft ?? "#FFF0EA",

      primaryMuted: colors.primaryMuted ?? "#FFE1D5",

      onPrimary: colors.onPrimary ?? "#FFFFFF",

      background: colors.background ?? "#FFFFFF",

      surface: colors.surface ?? "#F8F8F8",

      card: colors.card ?? "#FFFFFF",

      text: colors.text ?? "#111111",

      textSecondary: colors.textSecondary ?? "#525252",

      textMuted: colors.textMuted ?? "#737373",

      textInverse: colors.textInverse ?? "#FFFFFF",

      border: colors.border ?? "#E5E5E5",

      borderSubtle: colors.borderSubtle ?? "#F0F0F0",

      danger: colors.danger ?? "#DC2626",

      onDanger: colors.onDanger ?? "#FFFFFF",
    };

    const safeSpacing = {
      xxs: spacing.xxs ?? 2,

      xs: spacing.xs ?? 4,

      sm: spacing.sm ?? 8,

      md: spacing.md ?? 12,
    };

    const safeRadius = {
      none: radius.none ?? 0,

      lg: radius.lg ?? 14,

      pill: radius.pill ?? 999,

      circle: radius.circle ?? 9999,
    };

    const safeShadows = {
      sm: shadows.sm ?? {},
    };

    const safeAnimation = {
      spring: animation.spring ?? {
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      },
    };

    /* =====================================================
       SIZE
    ===================================================== */

    const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

    /* =====================================================
       PRESS ANIMATION
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

      scale.value = withSpring(0.95, safeAnimation.spring);
    }, [reanimated, scale, safeAnimation.spring]);

    /* =====================================================
       PRESS OUT
    ===================================================== */

    const handlePressOut = useCallback(() => {
      if (!reanimated) {
        return;
      }

      scale.value = withSpring(1, safeAnimation.spring);
    }, [reanimated, scale, safeAnimation.spring]);

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
          return safeRadius.none;

        case "circle":
          return safeRadius.circle;

        case "pill":
          return safeRadius.pill;

        case "rounded":
        default:
          return safeRadius.lg;
      }
    }, [
      shape,
      safeRadius.none,
      safeRadius.circle,
      safeRadius.pill,
      safeRadius.lg,
    ]);

    /* =====================================================
       PALETTE
    ===================================================== */

    const palette = useMemo(() => {
      switch (variant) {
        case "filled":
          return {
            background: selected ? safeColors.primary : safeColors.surface,

            borderColor: safeColors.transparent,

            icon: selected ? safeColors.onPrimary : safeColors.primary,

            label: selected ? safeColors.onPrimary : safeColors.text,
          };

        case "outline":
          return {
            background: safeColors.background,

            borderColor: selected ? safeColors.primary : safeColors.border,

            icon: selected ? safeColors.primary : safeColors.textSecondary,

            label: safeColors.text,
          };

        case "minimal":
          return {
            background: safeColors.transparent,

            borderColor: safeColors.transparent,

            icon: selected ? safeColors.primary : safeColors.textSecondary,

            label: selected ? safeColors.primary : safeColors.text,
          };

        case "soft":
        default:
          return {
            background: selected ? safeColors.primarySoft : safeColors.card,

            borderColor: selected
              ? safeColors.primaryMuted
              : safeColors.borderSubtle,

            icon: selected ? safeColors.primary : safeColors.textSecondary,

            label: safeColors.text,
          };
      }
    }, [
      variant,
      selected,
      safeColors.primary,
      safeColors.primarySoft,
      safeColors.primaryMuted,
      safeColors.onPrimary,
      safeColors.surface,
      safeColors.card,
      safeColors.background,
      safeColors.text,
      safeColors.textSecondary,
      safeColors.border,
      safeColors.borderSubtle,
      safeColors.transparent,
    ]);

    /* =====================================================
       CONTAINER STYLE
    ===================================================== */

    const containerStyle = useMemo(
      () => [
        styles.itemContainer,

        {
          width: item?.width ?? config.width,

          minHeight: item?.height ?? config.height,

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
          ? safeShadows.sm
          : null,

        item?.containerStyle,

        style,
      ],
      [
        item,
        config,
        itemRadius,
        flexDirection,
        palette,
        variant,
        selected,
        safeShadows.sm,
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
                    safeRadius.circle,
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
           ICON NAME
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
           SVG
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
      safeRadius.circle,
      palette,
      imageSize,
      imageBorderRadius,
    ]);

    /* =====================================================
       TITLE
    ===================================================== */

    const renderTitle = useCallback(() => {
      const title = item?.title ?? item?.name ?? item?.label ?? "";

      const caption = typography.caption ?? {};

      const label = typography.label ?? {};

      const finalLabelColor = selected
        ? (item?.activeLabelColor ??
          activeLabelColor ??
          item?.titleColor ??
          palette.label)
        : (item?.labelColor ?? labelColor ?? item?.titleColor ?? palette.label);

      const finalFontSize =
        item?.fontSize ??
        item?.labelFontSize ??
        labelFontSize ??
        caption.fontSize ??
        config.font;

      const finalFontWeight = selected
        ? (item?.activeLabelFontWeight ??
          activeLabelFontWeight ??
          item?.fontWeight ??
          label.fontWeight ??
          "600")
        : (item?.labelFontWeight ??
          labelFontWeight ??
          item?.fontWeight ??
          caption.fontWeight ??
          "400");

      return (
        <Text
          numberOfLines={item?.titleNumberOfLines ?? 2}
          ellipsizeMode={item?.titleEllipsizeMode ?? "tail"}
          style={[
            styles.title,

            {
              color: finalLabelColor,

              fontSize: finalFontSize,

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

      const overline = typography.overline ?? {};

      return (
        <View
          style={[
            styles.badge,

            {
              backgroundColor: item.badgeColor ?? safeColors.danger,
            },

            item.badgeStyle,
          ]}
        >
          <Text
            style={[
              styles.badgeText,

              {
                color: item.badgeTextColor ?? safeColors.onDanger,

                fontSize: item.badgeFontSize ?? overline.fontSize ?? 10,

                fontWeight: overline.fontWeight ?? "700",
              },

              item.badgeTextStyle,
            ]}
            numberOfLines={1}
          >
            {item.badge}
          </Text>
        </View>
      );
    }, [item, showBadge, typography, safeColors.danger, safeColors.onDanger]);

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
              backgroundColor: item?.activeIndicatorColor ?? safeColors.primary,

              width: item?.activeIndicatorWidth ?? 32,

              height: item?.activeIndicatorHeight ?? 2,
            },

            item?.activeIndicatorStyle,
          ]}
        />
      );
    }, [selected, item, safeColors.primary]);

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
       PRESSABLE COMPONENT
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

  labelColor,

  activeLabelColor,

  labelFontSize,

  labelFontWeight,

  activeLabelFontWeight,

  imageSize,

  imageBorderRadius,

  showBadge = true,

  scrollEnabled = true,

  showsHorizontalScrollIndicator = false,

  showsVerticalScrollIndicator = false,

  contentContainerStyle,

  itemStyle,

  style,

  initialScrollIndex = 0,

  scrollToSelected = true,

  ListHeaderComponent,

  ListFooterComponent,

  onScroll,

  onScrollBeginDrag,

  onScrollEndDrag,

  onMomentumScrollBegin,

  onMomentumScrollEnd,

  onContentSizeChange,

  onLayout,

  initialNumToRender = 8,

  maxToRenderPerBatch = 8,

  updateCellsBatchingPeriod = 50,

  windowSize = 7,

  removeClippedSubviews = true,

  renderItem,

  keyExtractor,

  renderEmpty,

  reanimated = true,

  ...listProps
}) => {
  /* =======================================================
     THEME
  ======================================================= */

  const { theme } = useUITheme();

  const { spacing } = resolveTheme(theme);

  /* =======================================================
     SAFE SPACING
  ======================================================= */

  const safeSpacing = {
    xxs: spacing.xxs ?? 2,

    xs: spacing.xs ?? 4,

    sm: spacing.sm ?? 8,

    md: spacing.md ?? 12,

    lg: spacing.lg ?? 16,
  };

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

  const numColumns = isGrid ? Math.max(1, columns) : 1;

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
        // FlatList may not be measured yet.
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

      const config = SIZE_CONFIG[item?.size ?? size] ?? SIZE_CONFIG.md;

      return {
        length: config.width,

        offset: config.width * index,

        index,
      };
    },
    [listData, size],
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
      const selected = String(item?.id) === String(selectedId);

      /* -----------------------------------------------
           CUSTOM RENDER
        ------------------------------------------------ */

      if (typeof renderItem === "function") {
        return renderItem({
          item,

          index,

          selected,
        });
      }

      /* -----------------------------------------------
           DEFAULT ITEM
        ------------------------------------------------ */

      return (
        <UICategoryItem
          item={item}
          index={index}
          selected={selected}
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
        paddingHorizontal: horizontal ? safeSpacing.xxs : 0,

        paddingVertical: safeSpacing.sm,

        rowGap: safeSpacing.md,

        columnGap: safeSpacing.md,
      },

      contentContainerStyle,
    ],
    [
      horizontal,
      safeSpacing.xxs,
      safeSpacing.sm,
      safeSpacing.md,
      contentContainerStyle,
    ],
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
            padding: safeSpacing.lg,
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
