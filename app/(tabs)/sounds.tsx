import React from "react";
import { useLocalSearchParams } from "expo-router";
import WebViewScreen from "@/components/WebViewScreen";

export default function SoundsScreen() {
  // Deep link from the "Sound of the Day" widget: tinnitushelp://sounds?zen=<slug>
  const { zen } = useLocalSearchParams<{ zen?: string }>();

  return (
    <WebViewScreen
      tabKey="sounds"
      defaultUrl="https://www.tinnitushelp.me/zen?isApp=true"
      title="TinnitusHelp.me - Sounds"
      overrideUrl={
        zen ? `https://www.tinnitushelp.me/zen/${zen}?isApp=true` : undefined
      }
    />
  );
}
