import { StyleSheet } from "react-native";

export function flattenStyle(style) {
  return StyleSheet.flatten(style) || {};
}

export function removeUndefined(style = {}) {
  return Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined),
  );
}

export function mergeStyles(...styles) {
  return StyleSheet.flatten(styles.filter(Boolean)) || {};
}

export function isStyleObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
