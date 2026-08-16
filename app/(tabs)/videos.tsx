import React from "react";
import { useLocalSearchParams } from "expo-router";
import WebViewScreen from "@/components/WebViewScreen";

export default function VideosScreen() {
  // Same shape as the other tabs: a push notification can hand this one a full,
  // host-checked URL - a /videos/<slug> page rather than the feed.
  const { url } = useLocalSearchParams<{ url?: string }>();

  return (
    <WebViewScreen
      tabKey="videos"
      defaultUrl="https://www.tinnitushelp.me/videos?isApp=true"
      title="TinnitusHelp.me - Videos"
      overrideUrl={url}
    />
  );
}
