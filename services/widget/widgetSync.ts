// Pushes the current state (Pro status + tip list) to the home-screen widgets.
//
// Ownership model: JavaScript owns the data. The native widgets are "dumb" —
// they render today's tip and, on tap, open the app to the blog. Pro-gating
// lives here in JS (RevenueCat), so the widget never has to know about billing.
//
// - Android: react-native-android-widget re-renders from a JS task handler,
//   which reads the Pro flag from AsyncStorage and computes the tip itself.
// - iOS: we write the tips list + isPro into the shared App Group; the WidgetKit
//   extension reads them and rotates the tip daily on its own timeline.
//
// Every call is wrapped so a missing native module (e.g. before the packages are
// installed / prebuilt) can never crash the app.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TINNITUS_TIPS } from "@/constants/tinnitusTips";

export const WIDGET_APP_GROUP = "group.com.shadev.tinnitushelpme";
export const WIDGET_IS_PRO_KEY = "widget_isPro";
export const ANDROID_TIP_WIDGET_NAME = "TinnitusTip";
export const ANDROID_SOUND_WIDGET_NAME = "TinnitusSound";
export const ANDROID_CHECKIN_WIDGET_NAME = "TinnitusCheckin";

export async function syncWidgets(isPro: boolean): Promise<void> {
  // Android task handler reads Pro state from AsyncStorage on every render.
  try {
    await AsyncStorage.setItem(WIDGET_IS_PRO_KEY, isPro ? "1" : "0");
  } catch {
    // ignore storage failures
  }

  if (Platform.OS === "android") {
    try {
      const {
        requestWidgetUpdate,
      } = require("react-native-android-widget");
      const { TinnitusTipWidget } = require("@/widgets/TinnitusTipWidget");
      await requestWidgetUpdate({
        widgetName: ANDROID_TIP_WIDGET_NAME,
        renderWidget: (info: { width: number }) =>
          TinnitusTipWidget({ isPro, width: info?.width }),
        widgetNotFound: () => {
          // No widget placed on the home screen yet — nothing to do.
        },
      });

      // Sound widget needs remote data, so fetch it before rendering.
      const { SoundWidget } = require("@/widgets/SoundWidget");
      const { fetchTodaysSound } = require("@/services/widget/dailySound");
      const sound = isPro ? await fetchTodaysSound() : null;
      await requestWidgetUpdate({
        widgetName: ANDROID_SOUND_WIDGET_NAME,
        renderWidget: (info: { width: number }) =>
          SoundWidget({ isPro, sound, width: info?.width }),
        widgetNotFound: () => {},
      });

      const { CheckinWidget } = require("@/widgets/CheckinWidget");
      const { buildWidgetData } = require("@/services/checkin");
      const checkinData = isPro ? await buildWidgetData() : null;
      await requestWidgetUpdate({
        widgetName: ANDROID_CHECKIN_WIDGET_NAME,
        renderWidget: (info: { width: number }) =>
          CheckinWidget({ isPro, data: checkinData, width: info?.width }),
        widgetNotFound: () => {},
      });
    } catch {
      // Package not installed / no build with the widget yet.
    }
    return;
  }

  if (Platform.OS === "ios") {
    try {
      const { ExtensionStorage } = require("@bacons/apple-targets");
      const { buildWidgetData } = require("@/services/checkin");
      const storage = new ExtensionStorage(WIDGET_APP_GROUP);
      storage.set("tips", JSON.stringify(TINNITUS_TIPS));
      // Store as Int (0/1): ExtensionStorage.set only routes numbers/strings to
      // UserDefaults — a raw boolean falls through to setObject (expects a
      // dictionary) and throws, so isPro would never be written. UserDefaults
      // reads an Int back correctly via bool(forKey:) on the Swift side.
      storage.set("isPro", isPro ? 1 : 0);
      const checkin = await buildWidgetData();
      storage.set("checkin", JSON.stringify(checkin));
      ExtensionStorage.reloadWidget();
    } catch {
      // Package not installed / no App Group configured yet.
    }
  }
}
