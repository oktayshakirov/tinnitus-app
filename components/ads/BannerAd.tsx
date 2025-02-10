import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USE_TEST_ADS = true;

const productionAdUnitIDs = Platform.select({
  ios: "ca-app-pub-5852582960793521/1981176406",
  android: "ca-app-pub-5852582960793521/7251752754",
})!;

const testAdUnitID = TestIds.BANNER;
const adUnitID: string = USE_TEST_ADS ? testAdUnitID : productionAdUnitIDs;

const BannerAdComponent = () => {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("trackingConsent").then((storedConsent) => {
      setConsent(storedConsent);
    });
  }, []);

  const requestNonPersonalizedAdsOnly = consent === "granted" ? false : true;

  return (
    <BannerAd
      unitId={adUnitID}
      size={BannerAdSize.FULL_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: requestNonPersonalizedAdsOnly,
      }}
      onAdLoaded={() => console.log("Ad loaded!")}
      onAdFailedToLoad={(error) => console.error("Ad failed to load:", error)}
    />
  );
};

export default BannerAdComponent;
