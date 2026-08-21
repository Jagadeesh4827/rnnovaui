import { Platform } from "react-native";

export const shadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: Platform.OS === "android" ? 2 : 1,
  },

  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: Platform.OS === "android" ? 4 : 2,
  },

  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: Platform.OS === "android" ? 8 : 4,
  },
};
