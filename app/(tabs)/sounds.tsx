import React from "react";
import { Platform, View, StyleSheet, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

const WebPreview = () => (
  <iframe
    src="https://www.tinnitushelp.me/zen"
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Sounds"
  />
);

export default function SoundsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {Platform.OS === "web" ? (
        <WebPreview />
      ) : (
        <WebView
          source={{ uri: "https://www.tinnitushelp.me/zen" }}
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
