import React from "react";
import { Platform, StyleSheet, StatusBar } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

const WebPreview = () => (
  <iframe
    src="https://www.tinnitushelp.me/blog?isApp=true"
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Posts"
  />
);

export default function PostsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "web" ? (
        <WebPreview />
      ) : (
        <WebView
          source={{ uri: "https://www.tinnitushelp.me/blog?isApp=true" }}
          style={styles.webview}
          injectedJavaScript={`window.isApp = true; true;`}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
