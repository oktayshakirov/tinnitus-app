// Custom entry point: boots Expo Router, then registers the Android home-screen
// widget task handler. Kept minimal so it stays close to the default entry.
import "expo-router/entry";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  const {
    registerWidgetTaskHandler,
  } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./widgets/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}
