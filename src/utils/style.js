import { StyleSheet } from "react-native";

/*
 * Converts StyleSheet arrays and objects
 * into one clean object.
 */
export function flattenStyle(style) {
  return StyleSheet.flatten(style) || {};
}

/*
 * Removes undefined values.
 */
export function removeUndefined(style = {}) {
  return Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined),
  );
}

/*
 * Merges multiple styles safely.
 */
export function mergeStyles(...styles) {
  return StyleSheet.flatten(styles.filter(Boolean)) || {};
}

/*
 * Checks whether a value is a style object.
 */
export function isStyleObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
