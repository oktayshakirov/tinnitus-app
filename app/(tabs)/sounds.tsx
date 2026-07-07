import React, { useEffect, useRef, useState } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import { useLoader } from "@/contexts/LoaderContext";
import { useGlobalAds } from "@/components/ads/adsManager";
import { Pressable } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import OfflineScreen from "@/components/OfflineScreen";
import { useSavedContent } from "@/contexts/SavedContentContext";
import { useWebView } from "@/contexts/WebViewContext";

export default function SoundsScreen() {
  const { refreshCount } = useRefresh("sounds");
  const { showLoader, hideLoader } = useLoader();
  const { setCurrentUrl: setSavedContentUrl, forceRefreshSavedState } =
    useSavedContent();
  const { registerWebView, unregisterWebView } = useWebView();
  const webViewRef = useRef<WebView | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const defaultUrl = "https://www.tinnitushelp.me/zen?isApp=true";
  // Deep link from the "Sound of the Day" widget: tinnitushelp://sounds?zen=<slug>
  const { zen } = useLocalSearchParams<{ zen?: string }>();
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
    setSavedContentUrl(defaultUrl);
    setWebViewKey((prev) => prev + 1);
    setHasError(false);
    showLoader();
  }, [refreshCount, setSavedContentUrl]);

  // When opened via the widget deep link, load that specific sound page.
  useEffect(() => {
    if (!zen) return;
    const zenUrl = `https://www.tinnitushelp.me/zen/${zen}?isApp=true`;
    setCurrentUrl(zenUrl);
    setSavedContentUrl(zenUrl);
    setWebViewKey((prev) => prev + 1);
    setHasError(false);
    showLoader();
  }, [zen, setSavedContentUrl]);

  useEffect(() => {
    if (webViewRef.current) {
      registerWebView("sounds", webViewRef);
    }
    return () => unregisterWebView("sounds");
  }, [registerWebView, unregisterWebView]);

  useFocusEffect(
    React.useCallback(() => {
      forceRefreshSavedState();
    }, [forceRefreshSavedState])
  );

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

  const handleNavigationStateChange = (navState: {
    loading?: boolean;
    url?: string;
  }) => {
    if (!navState.loading && navState.url) {
      setCurrentUrl(navState.url);
      setSavedContentUrl(navState.url);
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
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "URL_VERIFICATION") {
                  (global as unknown as { webviewCurrentUrl?: string }).webviewCurrentUrl =
                    data.currentUrl;
                  (global as unknown as { webviewCurrentPath?: string }).webviewCurrentPath =
                    data.currentPath;
                } else if (data.type === "METADATA_EXTRACTED") {
                  (global as unknown as { extractedMetadata?: unknown }).extractedMetadata =
                    data.metadata;
                } else if (event.nativeEvent.data === "ad") {
                  handleGlobalPress();
                }
              } catch {
                if (event.nativeEvent.data === "ad") {
                  handleGlobalPress();
                }
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
