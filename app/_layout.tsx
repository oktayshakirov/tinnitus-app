import { Slot } from "expo-router";
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
import OnboardingWrapper from "@/components/OnboardingWrapper";

function AdInitializer() {
  const { isOnboardingActive, isLoading } = useOnboarding();

  useEffect(() => {
    if (!isOnboardingActive && !isLoading) {
      initializeInterstitial();
      loadAppOpenAd();
    }
  }, [isOnboardingActive, isLoading]);

  return null;
}

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
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
      getOrRegisterPushToken()
        .then((token) => {
          if (token) {
            setExpoPushToken(token);
            console.log("Expo Push Token:", token);
          } else {
            console.warn("No Expo push token returned.");
          }
        })
        .catch((error) => {
          console.error("Error during push registration:", error);
        });
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
            <RefreshProvider>
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
                  <OnboardingWrapper>
                    <Slot />
                  </OnboardingWrapper>
                </SafeAreaView>
              </OnboardingProvider>
            </RefreshProvider>
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
