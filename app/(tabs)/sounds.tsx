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
    src={`https://www.tinnitushelp.me/zen?isApp=true&refresh=${webViewKey}`}
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Sounds"
    onLoad={onLoad}
  />
);

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("sounds");
  const [webViewKey, setWebViewKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    setWebViewKey((prev) => prev + 1);
    setLoading(true);
  }, [refreshCount]);

  const handleLoadEnd = () => {
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const webUri = `https://www.tinnitushelp.me/zen?isApp=true&refresh=${webViewKey}`;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <WebPreview webViewKey={webViewKey} onLoad={handleLoadEnd} />
        ) : (
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              Platform.OS !== "android" ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
          >
            <WebView
              key={webViewKey}
              ref={webviewRef}
              source={{ uri: webUri }}
              style={styles.webview}
              injectedJavaScript={`window.isApp = true; true;`}
              onLoadEnd={handleLoadEnd}
            />
          </ScrollView>
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
