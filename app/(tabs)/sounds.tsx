import React from "react";
import { useLocalSearchParams } from "expo-router";
import WebViewScreen from "@/components/WebViewScreen";

export default function SoundsScreen() {
  // Two deep links land here:
  //   zen — the "Sound of the Day" widget: tinnitushelp://sounds?zen=<slug>
  //   url — a "New Sound" push notification: see hooks/useNotificationDeepLink.
  // The notification already carries a full, host-checked URL, so it wins.
  const { zen, url } = useLocalSearchParams<{ zen?: string; url?: string }>();

  const overrideUrl =
    url ??
    (zen ? `https://www.tinnitushelp.me/zen/${zen}?isApp=true` : undefined);

  return (
    <WebViewScreen
      tabKey="sounds"
      defaultUrl="https://www.tinnitushelp.me/zen?isApp=true"
      title="TinnitusHelp.me - Sounds"
      overrideUrl={overrideUrl}
    />
  );
}
