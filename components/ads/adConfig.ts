import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

export const USE_TEST_ADS = false;

export const adUnitIDs = {
  banner: Platform.select({
    ios: "ca-app-pub-5852582960793521/1981176406",
    android: "ca-app-pub-5852582960793521/7251752754",
  }),
  interstitial: Platform.select({
    ios: "ca-app-pub-5852582960793521/8874721303",
    android: "ca-app-pub-5852582960793521/9422172754",
  }),
  appOpen: Platform.select({
    ios: "ca-app-pub-5852582960793521/5402380152",
    android: "ca-app-pub-5852582960793521/8787747938",
  }),
};

export const testAdUnitIDs = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  appOpen: TestIds.APP_OPEN,
};

type AdType = "banner" | "interstitial" | "appOpen";

export function getAdUnitId(type: AdType): string | undefined {
  return USE_TEST_ADS ? testAdUnitIDs[type] : adUnitIDs[type];
}
