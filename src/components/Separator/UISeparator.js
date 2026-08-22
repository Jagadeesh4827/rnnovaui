import React, { memo, useMemo } from "react";

import { StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const SEPARATOR_VARIANTS = {
  solid: "solid",
  dashed: "dashed",
};

const SEPARATOR_POSITIONS = {
  left: "left",
  center: "center",
  right: "right",
};

const SEPARATOR_ENDS = {
  rounded: "rounded",
  sharp: "sharp",
  leftSharp: "leftSharp",
  rightSharp: "rightSharp",
};

const SEPARATOR_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

function UISeparatorComponent({
  children,

  text,

  icon,

  position = "center",

  variant = "solid",

  size = "md",

  color,

  textColor,

  thickness,

  gap,

  ends = "rounded",

  textStyle,

  lineStyle,

  style,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeVariant = SEPARATOR_VARIANTS[variant]
    ? variant
    : SEPARATOR_VARIANTS.solid;

  const safePosition = SEPARATOR_POSITIONS[position]
    ? position
    : SEPARATOR_POSITIONS.center;

  const safeSize = SEPARATOR_SIZES[size] ? size : SEPARATOR_SIZES.md;

  const dimensions = useMemo(() => getDimensions(safeSize), [safeSize]);

  const resolvedColor = color || colors.divider || colors.border || "#E5E5E5";

  const resolvedTextColor =
    textColor || colors.textSecondary || colors.textMuted || "#737373";

  const resolvedThickness = thickness ?? dimensions.thickness;

  const resolvedGap = gap ?? dimensions.gap;

  const content = children ?? text;

  const hasContent = content !== undefined && content !== null;

  const radius = getRadius(ends, resolvedThickness);

  const lineStyleObject = useMemo(
    () => ({
      height: resolvedThickness,

      backgroundColor:
        safeVariant === SEPARATOR_VARIANTS.solid
          ? resolvedColor
          : "transparent",

      borderColor: resolvedColor,

      borderStyle:
        safeVariant === SEPARATOR_VARIANTS.dashed ? "dashed" : "solid",

      borderWidth:
        safeVariant === SEPARATOR_VARIANTS.dashed ? resolvedThickness : 0,

      borderRadius: radius,
    }),
    [resolvedThickness, resolvedColor, safeVariant, radius],
  );

  /*
   * ------------------------------------------
   * NO CONTENT
   * ------------------------------------------
   */

  if (!hasContent) {
    return (
      <View
        {...props}
        testID={testID}
        pointerEvents="none"
        style={[styles.container, style]}
      >
        <View style={[styles.line, lineStyleObject, lineStyle]} />
      </View>
    );
  }

  /*
   * ------------------------------------------
   * LEFT
   * ------------------------------------------
   */

  if (safePosition === SEPARATOR_POSITIONS.left) {
    return (
      <View
        {...props}
        testID={testID}
        pointerEvents="none"
        style={[styles.container, style]}
      >
        <View style={[styles.line, lineStyleObject, lineStyle]} />

        <View
          style={{
            marginLeft: resolvedGap,

            flexShrink: 0,
          }}
        >
          {icon}

          {text !== undefined && !icon ? (
            <Text
              style={[
                styles.text,

                {
                  color: resolvedTextColor,

                  fontSize: dimensions.fontSize,

                  lineHeight: dimensions.lineHeight,
                },

                textStyle,
              ]}
            >
              {text}
            </Text>
          ) : null}

          {children && !text ? children : null}
        </View>
      </View>
    );
  }

  /*
   * ------------------------------------------
   * RIGHT
   * ------------------------------------------
   */

  if (safePosition === SEPARATOR_POSITIONS.right) {
    return (
      <View
        {...props}
        testID={testID}
        pointerEvents="none"
        style={[styles.container, style]}
      >
        <View
          style={{
            marginRight: resolvedGap,

            flexShrink: 0,
          }}
        >
          {icon}

          {text !== undefined && !icon ? (
            <Text
              style={[
                styles.text,

                {
                  color: resolvedTextColor,

                  fontSize: dimensions.fontSize,

                  lineHeight: dimensions.lineHeight,
                },

                textStyle,
              ]}
            >
              {text}
            </Text>
          ) : null}

          {children && !text ? children : null}
        </View>

        <View style={[styles.line, lineStyleObject, lineStyle]} />
      </View>
    );
  }

  /*
   * ------------------------------------------
   * CENTER
   * ------------------------------------------
   */

  return (
    <View
      {...props}
      testID={testID}
      pointerEvents="none"
      style={[styles.container, style]}
    >
      <View style={[styles.line, lineStyleObject, lineStyle]} />

      <View
        style={{
          marginHorizontal: resolvedGap,

          flexShrink: 0,

          alignItems: "center",

          justifyContent: "center",

          flexDirection: "row",
        }}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}

        {text !== undefined ? (
          <Text
            style={[
              styles.text,

              {
                color: resolvedTextColor,

                fontSize: dimensions.fontSize,

                lineHeight: dimensions.lineHeight,
              },

              textStyle,
            ]}
          >
            {text}
          </Text>
        ) : null}

        {children && !text ? children : null}
      </View>

      <View style={[styles.line, lineStyleObject, lineStyle]} />
    </View>
  );
}

function getDimensions(size) {
  switch (size) {
    case SEPARATOR_SIZES.sm:
      return {
        thickness: 1,
        gap: 8,
        fontSize: 11,
        lineHeight: 15,
      };

    case SEPARATOR_SIZES.lg:
      return {
        thickness: 2,
        gap: 16,
        fontSize: 15,
        lineHeight: 20,
      };

    case SEPARATOR_SIZES.md:
    default:
      return {
        thickness: 1,
        gap: 12,
        fontSize: 13,
        lineHeight: 18,
      };
  }
}

function getRadius(ends, thickness) {
  switch (ends) {
    case SEPARATOR_ENDS.sharp:
      return 0;

    case SEPARATOR_ENDS.leftSharp:
      return {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,

        borderTopRightRadius: thickness,

        borderBottomRightRadius: thickness,
      };

    case SEPARATOR_ENDS.rightSharp:
      return {
        borderTopLeftRadius: thickness,

        borderBottomLeftRadius: thickness,

        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };

    case SEPARATOR_ENDS.rounded:
    default:
      return thickness / 2;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    flexShrink: 0,
  },

  line: {
    flex: 1,

    minWidth: 0,
  },

  text: {
    fontWeight: "500",

    includeFontPadding: false,

    textAlign: "center",
  },

  icon: {
    marginRight: 5,

    alignItems: "center",

    justifyContent: "center",
  },
});

export const UISeparator = memo(UISeparatorComponent);

UISeparator.displayName = "UISeparator";

export {
  SEPARATOR_VARIANTS as UISeparatorVariants,
  SEPARATOR_POSITIONS as UISeparatorPositions,
  SEPARATOR_ENDS as UISeparatorEnds,
  SEPARATOR_SIZES as UISeparatorSizes,
};

export default UISeparator;
