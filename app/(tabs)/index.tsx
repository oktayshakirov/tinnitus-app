import React, { useState, useRef, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import Loader from "@/components/ui/Loader";

export default function HomeScreen() {
  const { refreshCount } = useRefresh("home");
  const [loading, setLoading] = useState(true);
  const webViewKey = useRef(0);

  useEffect(() => {
    webViewKey.current += 1;
    setLoading(true);
  }, [refreshCount]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {Platform.OS === "web" ? (
        <iframe
          key={webViewKey.current}
          src={`https://www.tinnitushelp.me/?isApp=true&refresh=${webViewKey.current}`}
          style={{ width: "100%", height: "100vh", border: "none" }}
          title="TinnitusHelp - Home"
          onLoad={() => setLoading(false)}
        />
      ) : (
        <WebView
          key={webViewKey.current}
          source={{
            uri: `https://www.tinnitushelp.me/?isApp=true&refresh=${webViewKey.current}`,
          }}
          cacheEnabled
          domStorageEnabled
          style={styles.webview}
          injectedJavaScript={`window.isApp = true; true;`}
          onLoadStart={() => setLoading(true)}
          onNavigationStateChange={(navState) => {
            if (!navState.loading) {
              setLoading(false);
            }
          }}
        />
      )}
      {loading && <Loader />}
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
