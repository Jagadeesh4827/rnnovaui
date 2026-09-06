import { flattenStyle } from "./style";

/*
 * Separates transform from a style object.
 */
export function separateTransform(style) {
  const flattenedStyle = flattenStyle(style);

  const { transform = [], ...restStyle } = flattenedStyle;

  return {
    style: restStyle,

    transform: Array.isArray(transform) ? transform : [],
  };
}

/*
 * Combines animation transforms
 * and developer transforms.
 */
export function mergeTransforms(animationTransform = [], customTransform = []) {
  return [
    ...normalizeTransform(animationTransform),

    ...normalizeTransform(customTransform),
  ];
}

/*
 * Ensures transform is always an array.
 */
export function normalizeTransform(transform) {
  if (!transform) {
    return [];
  }

  if (Array.isArray(transform)) {
    return transform.filter(Boolean);
  }

  return [transform];
}

/*
 * Checks whether a transform exists.
 */
export function hasTransform(transform) {
  return normalizeTransform(transform).length > 0;
}
