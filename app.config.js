// Merge `.env` RevenueCat keys into `extra.revenueCat` (see `.env.example`, crypto-wiki-app).
module.exports = ({ config }) => {
  const fromEnv = {
    apiKey:
      process.env.REVENUECAT_API_KEY ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
      "",
    iosApiKey:
      process.env.REVENUECAT_API_KEY_IOS ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ||
      "",
    androidApiKey:
      process.env.REVENUECAT_API_KEY_ANDROID ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ||
      "",
  };

  return {
    ...config,
    extra: {
      ...config.extra,
      revenueCat: {
        ...config.extra?.revenueCat,
        ...fromEnv,
      },
    },
  };
};
