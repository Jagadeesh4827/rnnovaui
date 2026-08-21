import React, { memo } from "react";

import { Text } from "react-native";

import { useUITheme } from "../../theme";

const UITextComponent = ({
  children,

  variant = "body",

  color,

  fontSize,

  fontWeight,

  lineHeight,

  letterSpacing,

  align,

  style,

  ...props
}) => {
  const { theme } = useUITheme();

  const typography = theme.typography[variant] || theme.typography.body;

  return (
    <Text
      {...props}
      style={[
        {
          color: color ?? theme.colors.text,

          fontSize: fontSize ?? typography.fontSize,

          lineHeight: lineHeight ?? typography.lineHeight,

          fontWeight: fontWeight ?? typography.fontWeight,

          letterSpacing,

          textAlign: align,
        },

        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const UIText = memo(UITextComponent);

UIText.displayName = "UIText";
