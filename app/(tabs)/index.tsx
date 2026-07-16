import React from "react";
import WebViewScreen from "@/components/WebViewScreen";

export default function HomeScreen() {
  return (
    <WebViewScreen
      tabKey="home"
      defaultUrl="https://www.tinnitushelp.me/?isApp=true"
      title="TinnitusHelp.me - Home"
    />
  );
}
