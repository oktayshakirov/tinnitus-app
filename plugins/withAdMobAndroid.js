// Android-only fix for the AdMob manifest-merger conflict: the
// react-native-google-mobile-ads library declares empty APPLICATION_ID /
// DELAY_APP_MEASUREMENT_INIT meta-data, which collides with our values unless we
// mark them `tools:replace`. We do this with a small withAndroidManifest mod
// (NOT the library's full config plugin, which also runs iOS Xcode mods that
// conflict with @bacons/apple-targets and break the iOS prebuild).
const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");

const META = {
  "com.google.android.gms.ads.APPLICATION_ID":
    "ca-app-pub-5852582960793521~2742534243",
  "com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT": "true",
};

module.exports = function withAdMobAndroid(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults
    );
    app["meta-data"] = app["meta-data"] || [];

    for (const [name, value] of Object.entries(META)) {
      let item = app["meta-data"].find((m) => m.$["android:name"] === name);
      if (!item) {
        item = { $: { "android:name": name } };
        app["meta-data"].push(item);
      }
      item.$["android:value"] = value;
      item.$["tools:replace"] = "android:value";
    }

    return cfg;
  });
};
