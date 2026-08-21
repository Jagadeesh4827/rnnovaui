import React, { memo, useCallback } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUITheme } from "../../theme";

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

const DEFAULT_COLORS = {
  buttonPrimaryBackground: "#FF5A1F",

  buttonPrimaryPressed: "#E94D17",

  buttonPrimaryText: "#FFFFFF",

  buttonOutlineBackground: "transparent",

  buttonOutlineBorder: "#FF5A1F",

  buttonOutlineText: "#FF5A1F",

  buttonGhostBackground: "transparent",

  buttonGhostText: "#FF5A1F",

  buttonSoftBackground: "#FFF0EA",

  buttonSoftText: "#FF5A1F",

  buttonDangerBackground: "#DC2626",

  buttonDangerPressed: "#B91C1C",

  buttonDangerText: "#FFFFFF",

  buttonSuccessBackground: "#16A34A",

  buttonSuccessPressed: "#128238",

  buttonSuccessText: "#FFFFFF",

  buttonDisabledBackground: "#E5E5E5",

  buttonDisabledText: "#A3A3A3",

  buttonDisabledBorder: "#E5E5E5",

  buttonRipple: "rgba(255,255,255,0.20)",
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

  activeOpacity = 0.82,

  testID,

  accessibilityLabel,

  accessibilityHint,

  ...props
}) => {
  const { theme } = useUITheme();

  const colors = {
    ...DEFAULT_COLORS,
    ...(theme?.colors || {}),
  };

  const safeVariant = BUTTON_VARIANTS[variant]
    ? variant
    : BUTTON_VARIANTS.solid;

  const safeSize = BUTTON_SIZES[size] ? size : BUTTON_SIZES.md;

  const isDisabled = disabled || loading;

  const variantStyle = getVariantStyle(safeVariant, colors, isDisabled);

  const sizeStyle = getSizeStyle(safeSize, theme);

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

  const hasChildren = children !== undefined && children !== null;

  return (
    <Pressable
      {...props}
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || (typeof title === "string" ? title : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,

        busy: loading,
      }}
      style={({ pressed }) => {
        const backgroundColor = isDisabled
          ? colors.buttonDisabledBackground
          : pressed
            ? variantStyle.pressedBackground
            : variantStyle.backgroundColor;

        const borderColor = isDisabled
          ? colors.buttonDisabledBorder
          : variantStyle.borderColor;

        const textColor = isDisabled
          ? colors.buttonDisabledText
          : variantStyle.textColor;

        return [
          styles.button,

          {
            height: sizeStyle.height,

            minHeight: sizeStyle.height,

            paddingHorizontal: sizeStyle.paddingHorizontal,

            borderRadius: sizeStyle.borderRadius,

            backgroundColor,

            borderColor,

            borderWidth: variantStyle.borderWidth,

            width: fullWidth ? "100%" : undefined,

            opacity: isDisabled ? 0.55 : 1,
          },

          style,
        ];
      }}
    >
      <View
        style={[
          styles.content,

          {
            gap: sizeStyle.gap,
          },

          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.textColor} />
        ) : (
          leftIcon && <View style={styles.icon}>{leftIcon}</View>
        )}

        {hasChildren ? (
          <View style={styles.children}>{children}</View>
        ) : (
          title !== undefined &&
          title !== null && (
            <Text
              numberOfLines={1}
              style={[
                styles.text,

                {
                  color: isDisabled
                    ? colors.buttonDisabledText
                    : variantStyle.textColor,

                  fontSize: sizeStyle.fontSize,

                  lineHeight: sizeStyle.lineHeight,
                },

                textStyle,
              ]}
            >
              {title}
            </Text>
          )
        )}

        {!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
};

function getVariantStyle(variant, colors, disabled) {
  if (disabled) {
    return {
      backgroundColor: colors.buttonDisabledBackground,

      pressedBackground: colors.buttonDisabledBackground,

      borderColor: colors.buttonDisabledBorder,

      borderWidth: 1,

      textColor: colors.buttonDisabledText,
    };
  }

  switch (variant) {
    case BUTTON_VARIANTS.outline:
      return {
        backgroundColor: colors.buttonOutlineBackground,

        pressedBackground: colors.buttonSoftBackground,

        borderColor: colors.buttonOutlineBorder,

        borderWidth: 1,

        textColor: colors.buttonOutlineText,
      };

    case BUTTON_VARIANTS.ghost:
      return {
        backgroundColor: colors.buttonGhostBackground,

        pressedBackground: colors.buttonSoftBackground,

        borderColor: colors.transparent,

        borderWidth: 0,

        textColor: colors.buttonGhostText,
      };

    case BUTTON_VARIANTS.soft:
      return {
        backgroundColor: colors.buttonSoftBackground,

        pressedBackground: colors.primaryMuted || colors.buttonSoftBackground,

        borderColor: colors.buttonSoftBackground,

        borderWidth: 1,

        textColor: colors.buttonSoftText,
      };

    case BUTTON_VARIANTS.danger:
      return {
        backgroundColor: colors.buttonDangerBackground,

        pressedBackground: colors.buttonDangerPressed,

        borderColor: colors.buttonDangerBackground,

        borderWidth: 1,

        textColor: colors.buttonDangerText,
      };

    case BUTTON_VARIANTS.success:
      return {
        backgroundColor: colors.buttonSuccessBackground,

        pressedBackground: colors.buttonSuccessPressed,

        borderColor: colors.buttonSuccessBackground,

        borderWidth: 1,

        textColor: colors.buttonSuccessText,
      };

    case BUTTON_VARIANTS.solid:
    default:
      return {
        backgroundColor: colors.buttonPrimaryBackground,

        pressedBackground: colors.buttonPrimaryPressed,

        borderColor: colors.buttonPrimaryBackground,

        borderWidth: 1,

        textColor: colors.buttonPrimaryText,
      };
  }
}

function getSizeStyle(size, theme) {
  const buttonSizes = theme?.sizes?.button || {};

  const themeRadius = theme?.radius?.button;

  const buttonRadius = typeof themeRadius === "number" ? themeRadius : 12;

  const spacing = theme?.spacing || {};

  const spacingSM = typeof spacing.sm === "number" ? spacing.sm : 8;

  const spacingMD = typeof spacing.md === "number" ? spacing.md : 16;

  const spacingLG = typeof spacing.lg === "number" ? spacing.lg : 20;

  const spacingXL = typeof spacing.xl === "number" ? spacing.xl : 24;

  switch (size) {
    case BUTTON_SIZES.sm:
      return {
        height: buttonSizes.sm ?? 36,

        paddingHorizontal: spacingMD,

        gap: spacingSM,

        borderRadius: buttonRadius,

        fontSize: 13,

        lineHeight: 18,
      };

    case BUTTON_SIZES.lg:
      return {
        height: buttonSizes.lg ?? 52,

        paddingHorizontal: spacingLG,

        gap: spacingSM,

        borderRadius: buttonRadius,

        fontSize: 16,

        lineHeight: 22,
      };

    case BUTTON_SIZES.xl:
      return {
        height: buttonSizes.xl ?? 60,

        paddingHorizontal: spacingXL,

        gap: spacingSM,

        borderRadius: buttonRadius,

        fontSize: 17,

        lineHeight: 24,
      };

    case BUTTON_SIZES.md:
    default:
      return {
        height: buttonSizes.md ?? 44,

        paddingHorizontal: spacingLG,

        gap: spacingSM,

        borderRadius: buttonRadius,

        fontSize: 14,

        lineHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",
  },

  content: {
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

  icon: {
    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  text: {
    flexShrink: 1,

    fontWeight: "600",

    textAlign: "center",

    includeFontPadding: false,
  },
});

export const UIButton = memo(UIButtonComponent);

UIButton.displayName = "UIButton";

export { BUTTON_VARIANTS as UIButtonVariants, BUTTON_SIZES as UIButtonSizes };
