export const RNNovaAnimationPresets = {
  none: {},

  fadeIn: {
    type: "timing",
  },

  fadeOut: {
    type: "timing",
  },

  bounce: {
    type: "spring",
  },

  elastic: {
    type: "spring",
  },

  spring: {
    type: "spring",
  },

  pulse: {
    type: "loop",
  },

  shake: {
    type: "loop",
  },

  zoomIn: {
    type: "timing",
  },

  zoomOut: {
    type: "timing",
  },

  slideIn: {
    type: "timing",
  },

  slideOut: {
    type: "timing",
  },

  pop: {
    type: "spring",
  },
};

export function getRNNovaAnimationStyle(animationStyle) {
  return RNNovaAnimationPresets[animationStyle] || RNNovaAnimationPresets.none;
}
