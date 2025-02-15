import React, { useEffect, useRef } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import { useLoader } from "@/contexts/LoaderContext";

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("tags");
  const { showLoader, hideLoader } = useLoader();
  const webViewKey = useRef(0);

  useEffect(() => {
    webViewKey.current += 1;
    showLoader();
  }, [refreshCount]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        webViewKey.current += 1;
        showLoader();
      }
    });
    return () => subscription.remove();
  }, []);

  const webUri = `https://www.tinnitushelp.me/tags?isApp=true&refresh=${webViewKey.current}`;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {Platform.OS === "web" ? (
        <iframe
          key={webViewKey.current}
          src={webUri}
          style={{ width: "100%", height: "100vh", border: "none" }}
          title="TinnitusHelp - Tags"
          onLoad={() => hideLoader()}
        />
      ) : (
        <WebView
          key={webViewKey.current}
          source={{ uri: webUri }}
          cacheEnabled
          domStorageEnabled
          style={styles.webview}
          injectedJavaScript={`window.isApp = true; true;`}
          onLoadStart={showLoader}
          onNavigationStateChange={(navState) => {
            if (!navState.loading) {
              hideLoader();
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
    marginBottom: Platform.OS === "android" ? -70 : 0,
  },
});
