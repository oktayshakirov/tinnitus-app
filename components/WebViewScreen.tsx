// Shared screen for the WebView-backed tabs (Home, Posts, Sounds). Owns the
// full WebView lifecycle: loader wiring, offline/error fallback, saved-content
// URL tracking, ad hooks and the foreground-refresh policy.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform, Pressable, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useFocusEffect } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useRefresh } from "@/contexts/RefreshContext";
import { Colors } from "@/constants/Colors";
import { useLoader } from "@/contexts/LoaderContext";
import { useGlobalAds } from "@/components/ads/adsManager";
import OfflineScreen from "@/components/OfflineScreen";
import { useSavedContent } from "@/contexts/SavedContentContext";
import { useWebView } from "@/contexts/WebViewContext";

// Reload the page after returning to foreground only when the app spent this
// long in the background; a quick app switch keeps scroll position, playing
// audio and already-loaded content intact.
const STALE_BACKGROUND_MS = 30 * 60 * 1000;

const INJECTED_JAVASCRIPT = `
  localStorage.setItem('isApp', 'true');
  window.addEventListener('click', function() {
    window.ReactNativeWebView.postMessage('ad');
  });
  true;
`;

interface WebViewScreenProps {
  /** Key used for tab refresh events and WebView registration ("home", "posts", "sounds"). */
  tabKey: string;
  defaultUrl: string;
  /** Title for the iframe on web builds. */
  title: string;
  /** When set (e.g. from a widget deep link), loads this URL instead of defaultUrl. */
  overrideUrl?: string;
}

export default function WebViewScreen({
  tabKey,
  defaultUrl,
  title,
  overrideUrl,
}: WebViewScreenProps) {
  const { refreshCount } = useRefresh(tabKey);
  const { showLoader, hideLoader } = useLoader();
  const { setCurrentUrl: setSavedContentUrl, forceRefreshSavedState } =
    useSavedContent();
  const { registerWebView, unregisterWebView } = useWebView();
  const webViewRef = useRef<WebView | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(overrideUrl ?? defaultUrl);

  const { handleGlobalPress } = useGlobalAds();

  // Note: showLoader/hideLoader are recreated on every LoaderProvider render,
  // so they must stay out of effect dependency arrays to avoid reload loops.
  const loadUrl = (url: string) => {
    setCurrentUrl(url);
    setSavedContentUrl(url);
    setWebViewKey((prev) => prev + 1);
    setHasError(false);
    showLoader();
  };

  useEffect(() => {
    loadUrl(defaultUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCount, defaultUrl, setSavedContentUrl]);

  useEffect(() => {
    if (!overrideUrl) return;
    loadUrl(overrideUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideUrl, setSavedContentUrl]);

  useEffect(() => {
    if (webViewRef.current) {
      registerWebView(tabKey, webViewRef);
    }
    return () => unregisterWebView(tabKey);
  }, [tabKey, registerWebView, unregisterWebView]);

  useFocusEffect(
    useCallback(() => {
      forceRefreshSavedState();
    }, [forceRefreshSavedState])
  );

  useEffect(() => {
    if (hasError) {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  // Track when the app leaves the foreground so we can tell a quick app
  // switch apart from a long absence when it comes back.
  const backgroundedAtRef = useRef<number | null>(null);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        if (backgroundedAtRef.current === null) {
          backgroundedAtRef.current = Date.now();
        }
        return;
      }
      if (nextAppState === "active") {
        const backgroundedAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        const wasAwayLong =
          backgroundedAt !== null &&
          Date.now() - backgroundedAt > STALE_BACKGROUND_MS;
        if (wasAwayLong && !hasError) {
          setWebViewKey((prev) => prev + 1);
          showLoader();
        }
      }
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleShouldStartLoadWithRequest = (request: { url: string }) => {
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
          title={title}
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
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "URL_VERIFICATION") {
                  (
                    global as unknown as { webviewCurrentUrl?: string }
                  ).webviewCurrentUrl = data.currentUrl;
                  (
                    global as unknown as { webviewCurrentPath?: string }
                  ).webviewCurrentPath = data.currentPath;
                } else if (data.type === "METADATA_EXTRACTED") {
                  (
                    global as unknown as { extractedMetadata?: unknown }
                  ).extractedMetadata = data.metadata;
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
    // The tab bar is absolutely positioned on iOS (translucent blur) but part
    // of the layout on Android, so the WebView needs opposite bottom offsets
    // to end exactly at the tab bar on both platforms.
    marginBottom: Platform.OS === "android" ? -65 : 65,
  },
});
