import React from "react";
import WebViewScreen from "@/components/WebViewScreen";

export default function PostsScreen() {
  return (
    <WebViewScreen
      tabKey="posts"
      defaultUrl="https://www.tinnitushelp.me/blog?isApp=true"
      title="TinnitusHelp.me - Posts"
    />
  );
}
