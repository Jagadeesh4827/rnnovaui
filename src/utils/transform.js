import { flattenStyle } from "./style";

export function separateTransform(style) {
  const flattenedStyle = flattenStyle(style);

  const { transform = [], ...restStyle } = flattenedStyle;

  return {
    style: restStyle,
    transform: Array.isArray(transform) ? transform : [],
  };
}

export function mergeTransforms(animationTransform = [], customTransform = []) {
  return [
    ...normalizeTransform(animationTransform),
    ...normalizeTransform(customTransform),
  ];
}

export function normalizeTransform(transform) {
  if (!transform) {
    return [];
  }

  if (Array.isArray(transform)) {
    return transform.filter(Boolean);
  }

  return [transform];
}

export function hasTransform(transform) {
  return normalizeTransform(transform).length > 0;
}
