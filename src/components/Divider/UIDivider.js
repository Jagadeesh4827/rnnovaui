import React, { memo, useMemo } from "react";

import { StyleSheet, Text, View } from "react-native";

import { useUITheme } from "../../theme";

const DIVIDER_ORIENTATIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

const DIVIDER_VARIANTS = {
  solid: "solid",
  dashed: "dashed",
};

const DIVIDER_TEXT_POSITIONS = {
  left: "left",
  center: "center",
  right: "right",
};

const DIVIDER_ENDS = {
  rounded: "rounded",
  sharp: "sharp",
  leftSharp: "leftSharp",
  rightSharp: "rightSharp",
};

function UIDividerComponent({
  orientation = "horizontal",

  variant = "solid",

  thickness = 1,

  color,

  length,

  spacing = 0,

  text = null,

  textPosition = "center",

  textStyle,

  textContainerStyle,

  lineStyle,

  gap = 12,

  ends = "rounded",

  style,

  testID,

  ...props
}) {
  const { theme } = useUITheme();

  const colors = theme?.colors || {};

  const safeOrientation = DIVIDER_ORIENTATIONS[orientation]
    ? orientation
    : DIVIDER_ORIENTATIONS.horizontal;

  const safeVariant = DIVIDER_VARIANTS[variant]
    ? variant
    : DIVIDER_VARIANTS.solid;

  const safeTextPosition = DIVIDER_TEXT_POSITIONS[textPosition]
    ? textPosition
    : DIVIDER_TEXT_POSITIONS.center;

  const safeEnds = DIVIDER_ENDS[ends] ? ends : DIVIDER_ENDS.rounded;

  const resolvedColor = color || colors.divider || colors.border || "#E5E5E5";

  const resolvedTextColor =
    colors.textSecondary || colors.textMuted || "#737373";

  const isHorizontal = safeOrientation === DIVIDER_ORIENTATIONS.horizontal;

  const hasText = isHorizontal && text !== null && text !== undefined;

  const lineBaseStyle = useMemo(
    () => ({
      backgroundColor:
        safeVariant === DIVIDER_VARIANTS.solid ? resolvedColor : "transparent",

      borderColor: resolvedColor,

      borderStyle: safeVariant === DIVIDER_VARIANTS.dashed ? "dashed" : "solid",

      borderWidth: safeVariant === DIVIDER_VARIANTS.dashed ? thickness : 0,

      borderRadius: getEndRadius(safeEnds, thickness),
    }),
    [safeVariant, resolvedColor, thickness, safeEnds],
  );

  /*
   * ------------------------------------------
   * VERTICAL DIVIDER
   * ------------------------------------------
   */

  if (!isHorizontal) {
    return (
      <View
        {...props}
        testID={testID}
        pointerEvents="none"
        style={[
          styles.vertical,

          {
            width: thickness,

            height: length || "100%",

            marginHorizontal: spacing,

            backgroundColor:
              safeVariant === DIVIDER_VARIANTS.solid
                ? resolvedColor
                : "transparent",

            borderColor: resolvedColor,

            borderStyle:
              safeVariant === DIVIDER_VARIANTS.dashed ? "dashed" : "solid",

            borderWidth:
              safeVariant === DIVIDER_VARIANTS.dashed ? thickness : 0,

            borderRadius: getEndRadius(safeEnds, thickness),
          },

          style,
        ]}
      />
    );
  }

  /*
   * ------------------------------------------
   * HORIZONTAL WITHOUT TEXT
   * ------------------------------------------
   */

  if (!hasText) {
    return (
      <View
        {...props}
        testID={testID}
        pointerEvents="none"
        style={[
          styles.horizontal,

          {
            width: length || "100%",

            height: thickness,

            marginVertical: spacing,
          },

          lineBaseStyle,

          lineStyle,

          style,
        ]}
      />
    );
  }

  /*
   * ------------------------------------------
   * HORIZONTAL WITH TEXT
   * ------------------------------------------
   */

  return (
    <View
      {...props}
      testID={testID}
      pointerEvents="none"
      style={[
        styles.textDivider,

        {
          width: length || "100%",

          marginVertical: spacing,
        },

        style,
      ]}
    >
      {safeTextPosition === DIVIDER_TEXT_POSITIONS.left ? (
        <>
          <View style={[styles.line, lineBaseStyle, lineStyle]} />

          <View
            style={[
              styles.textContainer,

              {
                marginLeft: gap,
              },

              textContainerStyle,
            ]}
          >
            <Text
              style={[
                styles.text,

                {
                  color: resolvedTextColor,
                },

                textStyle,
              ]}
            >
              {text}
            </Text>
          </View>
        </>
      ) : null}

      {safeTextPosition === DIVIDER_TEXT_POSITIONS.center ? (
        <>
          <View style={[styles.line, lineBaseStyle, lineStyle]} />

          <View
            style={[
              styles.textContainer,

              {
                marginHorizontal: gap,
              },

              textContainerStyle,
            ]}
          >
            <Text
              style={[
                styles.text,

                {
                  color: resolvedTextColor,
                },

                textStyle,
              ]}
            >
              {text}
            </Text>
          </View>

          <View style={[styles.line, lineBaseStyle, lineStyle]} />
        </>
      ) : null}

      {safeTextPosition === DIVIDER_TEXT_POSITIONS.right ? (
        <>
          <View
            style={[
              styles.textContainer,

              {
                marginRight: gap,
              },

              textContainerStyle,
            ]}
          >
            <Text
              style={[
                styles.text,

                {
                  color: resolvedTextColor,
                },

                textStyle,
              ]}
            >
              {text}
            </Text>
          </View>

          <View style={[styles.line, lineBaseStyle, lineStyle]} />
        </>
      ) : null}
    </View>
  );
}

/*
 * ------------------------------------------
 * END RADIUS
 * ------------------------------------------
 */

function getEndRadius(ends, thickness) {
  switch (ends) {
    case DIVIDER_ENDS.sharp:
      return 0;

    case DIVIDER_ENDS.leftSharp:
      return {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,

        borderTopRightRadius: thickness,

        borderBottomRightRadius: thickness,
      };

    case DIVIDER_ENDS.rightSharp:
      return {
        borderTopLeftRadius: thickness,

        borderBottomLeftRadius: thickness,

        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };

    case DIVIDER_ENDS.rounded:
    default:
      return thickness / 2;
  }
}

const styles = StyleSheet.create({
  horizontal: {
    flexShrink: 0,
  },

  vertical: {
    flexShrink: 0,
  },

  textDivider: {
    flexDirection: "row",

    alignItems: "center",

    flexShrink: 0,
  },

  line: {
    flex: 1,

    minWidth: 0,

    height: 1,
  },

  textContainer: {
    flexShrink: 0,

    alignItems: "center",

    justifyContent: "center",
  },

  text: {
    fontSize: 13,

    lineHeight: 18,

    fontWeight: "500",

    includeFontPadding: false,

    textAlign: "center",
  },
});

export const UIDivider = memo(UIDividerComponent);

UIDivider.displayName = "UIDivider";

export {
  DIVIDER_ORIENTATIONS as UIDividerOrientations,
  DIVIDER_VARIANTS as UIDividerVariants,
  DIVIDER_TEXT_POSITIONS as UIDividerTextPositions,
  DIVIDER_ENDS as UIDividerEnds,
};

export default UIDivider;
