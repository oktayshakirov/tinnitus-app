import { Stack } from "expo-router";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import BannerAd from "@/components/ads/BannerAd";
import { Colors } from "@/constants/Colors";
import ConsentDialog from "@/components/ads/ConsentDialog";
import initialize from "react-native-google-mobile-ads";
import { LoaderProvider } from "@/contexts/LoaderContext";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/contexts/OnboardingContext";
import { getOrRegisterPushToken } from "@/utils/pushToken";
import { initializeInterstitial } from "@/components/ads/InterstitialAd";
import { loadAppOpenAd } from "@/components/ads/AppOpenAd";
import { useGlobalAds } from "@/components/ads/adsManager";
import OnboardingWrapper from "@/components/OnboardingWrapper";
import { RevenueCatProvider, useRevenueCat } from "@/contexts/RevenueCatContext";
import { SavedContentProvider } from "@/contexts/SavedContentContext";
import { WebViewProvider } from "@/contexts/WebViewContext";

function AdInitializer() {
  const { isOnboardingActive, isLoading } = useOnboarding();
  const { isPro, isReady } = useRevenueCat();

  useEffect(() => {
    if (isReady && !isOnboardingActive && !isLoading && !isPro) {
      initializeInterstitial().catch(() => {});
      loadAppOpenAd().catch(() => {});
    }
  }, [isOnboardingActive, isLoading, isPro, isReady]);

  return null;
}

function GlobalAdsManager() {
  useGlobalAds();
  return null;
}

export default function RootLayout() {
  const [consentCompleted, setConsentCompleted] = useState(false);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    initialize();

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (consentCompleted) {
      void getOrRegisterPushToken();
    }
  }, [consentCompleted]);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.background,
      card: Colors.background,
      text: Colors.text,
      primary: Colors.activeIcon,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <View style={styles.appContainer}>
          {Platform.OS === "ios" && <View style={styles.statusBarBackground} />}
          <LoaderProvider>
            <RevenueCatProvider>
              <RefreshProvider>
                <SavedContentProvider>
                  <WebViewProvider>
                    <OnboardingProvider>
                      <StatusBar backgroundColor={Colors.background} style="light" />
                      <SafeAreaView
                        style={styles.safeArea}
                        edges={["top", "left", "right"]}
                      >
                        <BannerAd />
                        <ConsentDialog
                          onConsentCompleted={() => setConsentCompleted(true)}
                        />
                        <AdInitializer />
                        <GlobalAdsManager />
                        <OnboardingWrapper>
                          <Stack screenOptions={{ headerShown: false }} />
                        </OnboardingWrapper>
                      </SafeAreaView>
                    </OnboardingProvider>
                  </WebViewProvider>
                </SavedContentProvider>
              </RefreshProvider>
            </RevenueCatProvider>
          </LoaderProvider>
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statusBarBackground: {
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
