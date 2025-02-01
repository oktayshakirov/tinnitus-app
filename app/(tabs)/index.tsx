import React from "react";
import { Platform, StyleSheet, StatusBar } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

const WebPreview = () => (
  <iframe
    src="https://www.tinnitushelp.me/?isApp=true"
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Home"
  />
);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "web" ? (
        <WebPreview />
      ) : (
        <WebView
          source={{ uri: "https://www.tinnitushelp.me/?isApp=true" }}
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
