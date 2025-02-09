import React from "react";
import { Platform, View } from "react-native";
import { AdMobBanner } from "expo-ads-admob";

const adUnitID = Platform.select({
  ios: "ca-app-pub-5852582960793521/1981176406",
  android: "ca-app-pub-5852582960793521/7251752754",
});

const BannerAdComponent = () => (
  <View>
    <AdMobBanner
      bannerSize="fullBanner"
      adUnitID={adUnitID}
      servePersonalizedAds={true}
      onDidFailToReceiveAdWithError={(error) => console.log("Ad error:", error)}
    />
  </View>
);

export default BannerAdComponent;
