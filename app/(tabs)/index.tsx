import React, { useRef, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import Loader from "@/components/ui/Loader";

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
    setRefreshing(false);
  };

  const webUri = `https://www.tinnitushelp.me/?isApp=true&refresh=${webViewKey}`;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS === "web" ? (
          <iframe
            key={webViewKey}
            src={webUri}
            style={{ width: "100%", height: "100vh", border: "none" }}
            title="TinnitusHelp - Home"
            onLoad={handleLoadEnd}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
          >
            <WebView
              key={webViewKey}
              ref={webviewRef}
              source={{ uri: webUri }}
              cacheEnabled={true}
              domStorageEnabled={true}
              style={styles.webview}
              injectedJavaScript={`window.isApp = true; true;`}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={handleLoadEnd}
            />
          </ScrollView>
        )}
        {loading && !refreshing && <Loader />}
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
