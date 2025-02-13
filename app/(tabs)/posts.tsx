import React, { useRef, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import { useLoader } from "@/contexts/LoaderContext";

export default function PostsScreen() {
  const { refreshCount } = useRefresh("posts");
  const { showLoader, hideLoader } = useLoader();
  const webViewKey = useRef(0);

  useEffect(() => {
    webViewKey.current += 1;
    showLoader();
  }, [refreshCount]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {Platform.OS === "web" ? (
        <iframe
          key={webViewKey.current}
          src={`https://www.tinnitushelp.me/blog?isApp=true&refresh=${webViewKey.current}`}
          style={{ width: "100%", height: "100vh", border: "none" }}
          title="TinnitusHelp - Posts"
          onLoad={() => hideLoader()}
        />
      ) : (
        <WebView
          key={webViewKey.current}
          source={{
            uri: `https://www.tinnitushelp.me/blog?isApp=true&refresh=${webViewKey.current}`,
          }}
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
