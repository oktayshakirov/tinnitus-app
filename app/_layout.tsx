import { Slot } from "expo-router";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/scripts/Notifications";
import { EventSubscription } from "expo-modules-core";
import BannerAd from "@/components/ads/BannerAd";
import { Colors } from "@/constants/Colors";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
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

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        {Platform.OS === "ios" && <View style={styles.statusBarBackground} />}
        <RefreshProvider>
          <ThemeProvider value={DefaultTheme}>
            <StatusBar
              backgroundColor={Colors.background}
              translucent={true}
              style="auto"
            />
            <SafeAreaView
              style={styles.safeArea}
              edges={["top", "left", "right"]}
            >
              <BannerAd />
              <Slot />
            </SafeAreaView>
          </ThemeProvider>
        </RefreshProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
