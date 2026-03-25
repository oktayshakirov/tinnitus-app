import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

async function registerPushTokenOnServer(token: string) {
  try {
    await fetch("https://registerpushtoken-culutsb2da-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Registration is best-effort; avoid logging tokens or noise in production.
  }
}

export async function getOrRegisterPushToken(): Promise<string | null> {
  try {
    let storedToken = await AsyncStorage.getItem("pushToken");
    if (storedToken) {
      return storedToken;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const { data: newToken } = await Notifications.getExpoPushTokenAsync();
    if (!newToken) {
      return null;
    }

    await AsyncStorage.setItem("pushToken", newToken);
    await registerPushTokenOnServer(newToken);

    return newToken;
  } catch {
    return null;
  }
}
