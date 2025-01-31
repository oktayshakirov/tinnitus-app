// import MaterialIcons from "@expo/vector-icons/FontAwesome5";
// import { SymbolWeight } from "expo-symbols";
// import React from "react";
// import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// const MAPPING = {
//   // See MaterialIcons here: https://icons.expo.fyi
//   "house.fill": "home",
//   "newspaper.fill": "book-open",
//   "music.note.list": "music",
// } as Partial<
//   Record<
//     import("expo-symbols").SymbolViewProps["name"],
//     React.ComponentProps<typeof MaterialIcons>["name"]
//   >
// >;

// export type IconSymbolName = keyof typeof MAPPING;

// export function IconSymbol({
//   name,
//   size = 20,
//   color,
//   style,
// }: {
//   name: IconSymbolName;
//   size?: number;
//   color: string | OpaqueColorValue;
//   style?: StyleProp<ViewStyle>;
//   weight?: SymbolWeight;
// }) {
//   return <MaterialIcons color={color} size={size} name={MAPPING[name]} />;
// }
