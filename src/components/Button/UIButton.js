import React, { memo, useCallback } from "react";

import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useUITheme } from "../../theme";

import { UIText } from "../Text";

const BUTTON_VARIANTS = {
  solid: "solid",
  outline: "outline",
  ghost: "ghost",
  soft: "soft",
  danger: "danger",
  success: "success",
};

const BUTTON_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

const UIButtonComponent = ({
  title,

  children,

  variant = "solid",

  size = "md",

  disabled = false,

  loading = false,

  fullWidth = false,

  leftIcon = null,

  rightIcon = null,

  onPress,

  onLongPress,

  onPressIn,

  onPressOut,

  style,

  contentStyle,

  textStyle,

  testID,

  accessibilityLabel,

  accessibilityHint,

  accessibilityRole = "button",

  hitSlop,

  pressRetentionOffset,

  android_ripple = true,

  activeOpacity = 0.82,

  ...props
}) => {
  const { theme } = useUITheme();

  const safeVariant = BUTTON_VARIANTS[variant]
    ? variant
    : BUTTON_VARIANTS.solid;

  const safeSize = BUTTON_SIZES[size] ? size : BUTTON_SIZES.md;

  const isDisabled = Boolean(disabled) || Boolean(loading);

  const colors = getVariantColors(safeVariant, theme.colors);

  const dimensions = getSizeDimensions(safeSize, theme);

  const handlePress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPress === "function") {
        onPress(event);
      }
    },
    [isDisabled, onPress],
  );

  const handleLongPress = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onLongPress === "function") {
        onLongPress(event);
      }
    },
    [isDisabled, onLongPress],
  );

  const handlePressIn = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPressIn === "function") {
        onPressIn(event);
      }
    },
    [isDisabled, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if (typeof onPressOut === "function") {
        onPressOut(event);
      }
    },
    [isDisabled, onPressOut],
  );

  const ripple = android_ripple
    ? {
        color: colors.ripple,
        borderless: false,
      }
    : undefined;

  /*
   * Important:
   *
   * title = text
   *
   * children = arbitrary JSX
   *
   * We NEVER put arbitrary children
   * inside UIText.
   */
  const hasCustomChildren = children !== undefined && children !== null;

  const accessibilityText =
    accessibilityLabel ?? (typeof title === "string" ? title : undefined);

  return (
    <Pressable
      {...props}
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      pressRetentionOffset={pressRetentionOffset}
      android_ripple={ripple}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityText}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: Boolean(loading),
      }}
      style={({ pressed }) => [
        styles.button,

        {
          minHeight: dimensions.height,

          paddingHorizontal: dimensions.paddingHorizontal,

          borderRadius: theme.radius.button,

          backgroundColor: colors.background,

          borderColor: colors.border,

          borderWidth: colors.border ? 1 : 0,

          width: fullWidth ? "100%" : undefined,

          opacity: isDisabled ? 0.55 : pressed ? activeOpacity : 1,
        },

        style,
      ]}
    >
      <View
        style={[
          styles.content,

          {
            minHeight: dimensions.height - 2,

            gap: dimensions.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          leftIcon
        )}

        {hasCustomChildren ? (
          <View style={styles.children}>{children}</View>
        ) : title !== undefined && title !== null ? (
          <UIText
            variant={dimensions.textVariant}
            color={colors.text}
            style={[styles.title, textStyle]}
            numberOfLines={1}
          >
            {title}
          </UIText>
        ) : null}

        {!loading && rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>
    </Pressable>
  );
};

function getVariantColors(variant, colors) {
  switch (variant) {
    case BUTTON_VARIANTS.outline:
      return {
        background: colors.transparent,

        border: colors.primary,

        text: colors.primary,

        ripple: colors.primarySoft,
      };

    case BUTTON_VARIANTS.ghost:
      return {
        background: colors.transparent,

        border: null,

        text: colors.primary,

        ripple: colors.primarySoft,
      };

    case BUTTON_VARIANTS.soft:
      return {
        background: colors.primarySoft,

        border: null,

        text: colors.primary,

        ripple: colors.primary,
      };

    case BUTTON_VARIANTS.danger:
      return {
        background: colors.danger,

        border: colors.danger,

        text: colors.onPrimary,

        ripple: colors.dangerSoft || colors.danger,
      };

    case BUTTON_VARIANTS.success:
      return {
        background: colors.success,

        border: colors.success,

        text: colors.onPrimary,

        ripple: colors.successSoft || colors.success,
      };

    case BUTTON_VARIANTS.solid:
    default:
      return {
        background: colors.primary,

        border: colors.primary,

        text: colors.onPrimary,

        ripple: colors.primaryPressed || colors.primary,
      };
  }
}

function getSizeDimensions(size, theme) {
  switch (size) {
    case BUTTON_SIZES.sm:
      return {
        height: theme.sizes.button.sm,

        paddingHorizontal: theme.spacing.md,

        gap: theme.spacing.xs,

        textVariant: "label",
      };

    case BUTTON_SIZES.lg:
      return {
        height: theme.sizes.button.lg,

        paddingHorizontal: theme.spacing.xl,

        gap: theme.spacing.sm,

        textVariant: "bodyMedium",
      };

    case BUTTON_SIZES.xl:
      return {
        height: theme.sizes.button.xl,

        paddingHorizontal: theme.spacing.xl2,

        gap: theme.spacing.sm,

        textVariant: "bodyMedium",
      };

    case BUTTON_SIZES.md:
    default:
      return {
        height: theme.sizes.button.md,

        paddingHorizontal: theme.spacing.lg,

        gap: theme.spacing.sm,

        textVariant: "label",
      };
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  content: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },

  children: {
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flexShrink: 1,
    textAlign: "center",
  },

  iconRight: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export { BUTTON_VARIANTS as UIButtonVariants, BUTTON_SIZES as UIButtonSizes };
