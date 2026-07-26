import React from "react";
import { useLocalSearchParams } from "expo-router";
import WebViewScreen from "@/components/WebViewScreen";

export default function PostsScreen() {
  // Deep link from a "New Post" push notification: see hooks/useNotificationDeepLink.
  const { url } = useLocalSearchParams<{ url?: string }>();

  return (
    <WebViewScreen
      tabKey="posts"
      defaultUrl="https://www.tinnitushelp.me/blog?isApp=true"
      title="TinnitusHelp.me - Posts"
      overrideUrl={url}
    />
  );
}
