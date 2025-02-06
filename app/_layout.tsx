import { Slot } from "expo-router";
import { RefreshProvider } from "@/contexts/RefreshContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/scripts/Notifications";
import { EventSubscription } from "expo-modules-core";

// Prevent the splash screen from auto-hiding until we're ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    // Hide the splash screen immediately since we removed asset checks.
    SplashScreen.hideAsync();

    // Register for push notifications.
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

    // Listen for incoming notifications.
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
      });

    // Listen for notification interactions.
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
      });

    // Clean up the subscriptions on unmount.
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
      <RefreshProvider>
        <ThemeProvider value={DefaultTheme}>
          <Slot />
          <StatusBar style="auto" />
        </ThemeProvider>
      </RefreshProvider>
    </SafeAreaProvider>
  );
}
