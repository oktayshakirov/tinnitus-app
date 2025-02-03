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

const WebPreview = ({ webViewKey }: { webViewKey: number }) => (
  <iframe
    key={webViewKey}
    src={`https://www.tinnitushelp.me/zen?isApp=true&refresh=${webViewKey}`}
    style={{ width: "100%", height: "100vh", border: "none" }}
    title="TinnitusHelp - Sounds"
  />
);

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("sounds");
  const [webViewKey, setWebViewKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    setWebViewKey((prev) => prev + 1);
  }, [refreshCount]);

  const onRefresh = () => {
    setRefreshing(true);
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <WebPreview webViewKey={webViewKey} />
        ) : Platform.OS === "android" ? (
          <WebView
            key={webViewKey}
            ref={webviewRef}
            source={{ uri: "https://www.tinnitushelp.me/zen?isApp=true" }}
            style={styles.webview}
            injectedJavaScript={`window.isApp = true; true;`}
            pullToRefreshEnabled={true}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <WebView
              key={webViewKey}
              ref={webviewRef}
              source={{ uri: "https://www.tinnitushelp.me/zen?isApp=true" }}
              style={styles.webview}
              injectedJavaScript={`window.isApp = true; true;`}
            />
          </ScrollView>
        )}
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
