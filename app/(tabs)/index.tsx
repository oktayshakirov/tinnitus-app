import React, { useRef, useEffect, useState } from "react";
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
import Loader from "@/components/ui/Loader"; // Loader with its own styling

export default function HomeScreen() {
  const { refreshCount } = useRefresh("home");
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
  };

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
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
          <>
            <iframe
              key={webViewKey}
              src={`https://www.tinnitushelp.me/?isApp=true&refresh=${webViewKey}`}
              style={{ width: "100%", height: "100vh", border: "none" }}
              title="TinnitusHelp - Home"
              onLoad={handleLoadEnd}
            />
            {loading && <Loader />}
          </>
        ) : Platform.OS === "android" ? (
          <>
            <WebView
              key={webViewKey}
              ref={webviewRef}
              source={{ uri: "https://www.tinnitushelp.me/?isApp=true" }}
              style={styles.webview}
              injectedJavaScript={`window.isApp = true; true;`}
              pullToRefreshEnabled={true}
              onLoadEnd={handleLoadEnd}
            />
            {loading && <Loader />}
          </>
        ) : (
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <>
              <WebView
                key={webViewKey}
                ref={webviewRef}
                source={{ uri: "https://www.tinnitushelp.me/?isApp=true" }}
                style={styles.webview}
                injectedJavaScript={`window.isApp = true; true;`}
                onLoadEnd={handleLoadEnd}
              />
              {loading && <Loader />}
            </>
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
