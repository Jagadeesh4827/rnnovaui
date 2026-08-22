import React, { memo, useMemo } from "react";

import { StyleSheet, View } from "react-native";

const BUTTON_GROUP_ORIENTATIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

const BUTTON_GROUP_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const BUTTON_GROUP_VARIANTS = {
  attached: "attached",
  separated: "separated",
};

function UIButtonGroupComponent({
  children,

  orientation = "horizontal",

  size,

  variant = "attached",

  spacing = 8,

  fullWidth = false,

  equalWidth = false,

  disabled = false,

  style,

  contentContainerStyle,

  testID,

  ...props
}) {
  const safeOrientation = BUTTON_GROUP_ORIENTATIONS[orientation]
    ? orientation
    : BUTTON_GROUP_ORIENTATIONS.horizontal;

  const safeVariant = BUTTON_GROUP_VARIANTS[variant]
    ? variant
    : BUTTON_GROUP_VARIANTS.attached;

  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  const count = childrenArray.length;

  const isHorizontal = safeOrientation === BUTTON_GROUP_ORIENTATIONS.horizontal;

  const groupStyle = useMemo(
    () => [
      styles.container,

      isHorizontal ? styles.horizontal : styles.vertical,

      fullWidth ? styles.fullWidth : null,

      safeVariant === BUTTON_GROUP_VARIANTS.separated
        ? {
            gap: spacing,
          }
        : null,

      style,
    ],
    [isHorizontal, fullWidth, safeVariant, spacing, style],
  );

  return (
    <View {...props} testID={testID} style={groupStyle}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const isFirst = index === 0;

        const isLast = index === count - 1;

        const childStyle = getChildStyle({
          isHorizontal,
          safeVariant,
          equalWidth,
          fullWidth,
          isFirst,
          isLast,
          index,
          count,
          spacing,
        });

        const existingStyle = child.props.style;

        return React.cloneElement(child, {
          key: child.key ?? index,

          size: child.props.size ?? size,

          disabled: disabled || child.props.disabled,

          fullWidth: child.props.fullWidth ?? (equalWidth || fullWidth),

          style: [childStyle, existingStyle],
        });
      })}
    </View>
  );
}

function getChildStyle({
  isHorizontal,
  safeVariant,
  equalWidth,
  fullWidth,
  isFirst,
  isLast,
  index,
  count,
  spacing,
}) {
  const stylesArray = [];

  if (equalWidth || fullWidth) {
    stylesArray.push({
      flex: 1,
    });
  }

  if (safeVariant === BUTTON_GROUP_VARIANTS.separated) {
    return stylesArray;
  }

  /*
   * Attached horizontal buttons
   *
   * Example:
   *
   * ┌────────┬────────┬────────┐
   * │  One   │  Two   │ Three  │
   * └────────┴────────┴────────┘
   */

  if (isHorizontal) {
    if (!isFirst) {
      stylesArray.push({
        marginLeft: -1,
      });
    }

    if (isFirst) {
      stylesArray.push({
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      });
    }

    if (isLast) {
      stylesArray.push({
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      });
    }

    if (!isFirst && !isLast) {
      stylesArray.push({
        borderRadius: 0,
      });
    }
  } else {
    /*
     * Attached vertical buttons
     *
     * ┌──────────────┐
     * │     One      │
     * ├──────────────┤
     * │     Two      │
     * ├──────────────┤
     * │    Three     │
     * └──────────────┘
     */

    if (!isFirst) {
      stylesArray.push({
        marginTop: -1,
      });
    }

    if (isFirst) {
      stylesArray.push({
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      });
    }

    if (isLast) {
      stylesArray.push({
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      });
    }

    if (!isFirst && !isLast) {
      stylesArray.push({
        borderRadius: 0,
      });
    }
  }

  return stylesArray;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },

  horizontal: {
    flexDirection: "row",

    alignItems: "stretch",
  },

  vertical: {
    flexDirection: "column",

    alignItems: "stretch",
  },

  fullWidth: {
    width: "100%",
  },
});

export const UIButtonGroup = memo(UIButtonGroupComponent);

UIButtonGroup.displayName = "UIButtonGroup";

export {
  BUTTON_GROUP_ORIENTATIONS as UIButtonGroupOrientations,
  BUTTON_GROUP_SIZES as UIButtonGroupSizes,
  BUTTON_GROUP_VARIANTS as UIButtonGroupVariants,
};

export default UIButtonGroup;
