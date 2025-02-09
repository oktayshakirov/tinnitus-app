import React from "react";
import { Platform, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

const USE_TEST_ADS = true;

const productionAdUnitIDs = Platform.select({
  ios: "ca-app-pub-5852582960793521/1981176406",
  android: "ca-app-pub-5852582960793521/7251752754",
})!;

const testAdUnitID = TestIds.BANNER;
const adUnitID: string = USE_TEST_ADS ? testAdUnitID : productionAdUnitIDs;

const BannerAdComponent = () => (
  <View>
    <BannerAd
      unitId={adUnitID}
      size={BannerAdSize.FULL_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: false,
      }}
      onAdLoaded={() => console.log("Ad loaded!")}
      onAdFailedToLoad={(error) => console.error("Ad failed to load:", error)}
    />
  </View>
);

export default BannerAdComponent;
