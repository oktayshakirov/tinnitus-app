import React from "react";
import { View, Button } from "react-native";
import * as Notifications from "expo-notifications";

export default function TestNotification() {
  async function sendLocalNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Local Notification",
        body: "This is a test notification!",
        sound: "default",
      },
      trigger: null,
    });
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Send Test Notification" onPress={sendLocalNotification} />
    </View>
  );
}
