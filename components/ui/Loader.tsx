import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";

let LottieView: any;

const Loader = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (Platform.OS === "web") {
    if (!isClient) return null;
    LottieView = require("lottie-react").default;
  } else {
    LottieView = require("lottie-react-native").default;
  }

  return (
    <View style={styles.loaderWrapper}>
      {isClient && (
        <LottieView
          source={require("@/assets/loader.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
});

export default Loader;
