export function isAnimationEnabled({
  animated = false,
  animationStyle = "none",
}) {
  return animated === true && animationStyle !== "none";
}

export function normalizeAnimationStyle(animationStyle) {
  if (!animationStyle || typeof animationStyle !== "string") {
    return "none";
  }

  return animationStyle;
}
