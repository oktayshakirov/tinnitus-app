import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export default function TabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: Colors.background,
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
