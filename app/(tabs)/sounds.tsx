import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefresh } from "@/contexts/RefreshContext";

const WebPreview = ({ webViewKey }: { webViewKey: number }) => (
  <iframe
    key={webViewKey}
    src={`https://www.tinnitushelp.me/zen?isApp=true&refresh=${webViewKey}`}
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Sounds"
  />
);

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("sounds");
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    setWebViewKey((prev) => prev + 1);
  }, [refreshCount]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <WebPreview webViewKey={webViewKey} />
        ) : (
          <WebView
            key={webViewKey}
            source={{ uri: "https://www.tinnitushelp.me/zen?isApp=true" }}
            style={styles.webview}
            injectedJavaScript={`window.isApp = true; true;`}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#291b36",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
