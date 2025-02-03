import React, { useRef, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefresh } from "@/contexts/RefreshContext";

export default function HomeScreen() {
  const { refreshCount } = useRefresh("home");
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <iframe
            key={webViewKey}
            src={`https://www.tinnitushelp.me/?isApp=true&refresh=${webViewKey}`}
            style={{ width: "100%", height: "100vh", border: "none" }}
            title="TinnitusHelp - Home"
          />
        ) : Platform.OS === "android" ? (
          <WebView
            key={webViewKey}
            ref={webviewRef}
            source={{ uri: "https://www.tinnitushelp.me/?isApp=true" }}
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
              source={{ uri: "https://www.tinnitushelp.me/?isApp=true" }}
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
