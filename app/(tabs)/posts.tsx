import React from "react";
import { Platform, View, StyleSheet, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

const WebPreview = () => (
  <iframe
    src="https://www.tinnitushelp.me/blog"
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp"
  />
);

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {Platform.OS === "web" ? (
        <WebPreview />
      ) : (
        <WebView
          source={{ uri: "https://www.tinnitushelp.me/blog" }}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
