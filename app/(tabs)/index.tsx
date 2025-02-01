import React from "react";
import { Platform, StyleSheet, StatusBar, View } from "react-native";
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
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
