import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import Loader from "@/components/ui/Loader";

const WebPreview = ({
  webViewKey,
  onLoad,
}: {
  webViewKey: number;
  onLoad: () => void;
}) => (
  <iframe
    key={webViewKey}
    src={`https://www.tinnitushelp.me/blog?isApp=true&refresh=${webViewKey}`}
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Posts"
    onLoad={onLoad}
  />
);

export default function PostsScreen() {
  const { refreshCount } = useRefresh("posts");
  const [loading, setLoading] = useState(true);
  const webViewKey = useRef(0);

  useEffect(() => {
    webViewKey.current += 1;
    setLoading(true);
  }, [refreshCount]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <WebPreview
            webViewKey={webViewKey.current}
            onLoad={() => setLoading(false)}
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
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
          />
        )}
        {loading && <Loader />}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
