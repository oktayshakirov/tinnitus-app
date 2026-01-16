import React, { useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import { useLoader } from "@/contexts/LoaderContext";
import { useGlobalAds } from "@/components/ads/adsManager";
import { Pressable } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import OfflineScreen from "@/components/OfflineScreen";

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("sounds");
  const { showLoader, hideLoader } = useLoader();
  const webViewRef = useRef<WebView | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const defaultUrl = "https://www.tinnitushelp.me/zen?isApp=true";
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);

  const injectedJavaScript = `
  localStorage.setItem('isApp', 'true');
  window.addEventListener('click', function() {
    window.ReactNativeWebView.postMessage('ad');
  });

  true;
`;

  const { handleGlobalPress } = useGlobalAds();

  useEffect(() => {
    setCurrentUrl(defaultUrl);
    setWebViewKey((prev) => prev + 1);
    setHasError(false);
    showLoader();
  }, [refreshCount]);

  useEffect(() => {
    if (hasError) {
      hideLoader();
    }
  }, [hasError]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !hasError) {
        setWebViewKey((prev) => prev + 1);
        showLoader();
      }
    });
    return () => subscription.remove();
  }, [hasError]);

  const handleNavigationStateChange = (navState: any) => {
    if (!navState.loading) {
      setCurrentUrl(navState.url);
      if (!hasError) {
        hideLoader();
      }
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    if (!url.includes("tinnitushelp.me")) {
      openBrowserAsync(url);
      return false;
    }
    return true;
  };

  const handleError = () => {
    hideLoader();
    setHasError(true);
  };

  const handleLoadEnd = () => {
    if (!hasError) {
      hideLoader();
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setHasError(false);
    setWebViewKey((prev) => prev + 1);
    showLoader();
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

  const renderError = () => {
    return <OfflineScreen onRetry={handleRetry} isRetrying={isRetrying} />;
  };

  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <OfflineScreen onRetry={handleRetry} isRetrying={isRetrying} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {Platform.OS === "web" ? (
        <iframe
          key={webViewKey}
          src={currentUrl}
          style={{ width: "100%", height: "100vh", border: "none" }}
          title="TinnitusHelp.me - Sounds"
          onLoad={hideLoader}
        />
      ) : (
        <>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            source={{ uri: currentUrl }}
            cacheEnabled
            domStorageEnabled
            style={styles.webview}
            injectedJavaScript={injectedJavaScript}
            onMessage={(event) => {
              if (event.nativeEvent.data === "ad") {
                handleGlobalPress();
              }
            }}
            onLoadStart={showLoader}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleError}
            renderError={renderError}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleGlobalPress}
            pointerEvents="box-none"
          />
        </>
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
    marginBottom: Platform.OS === "android" ? -65 : 65,
  },
});
