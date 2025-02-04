import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";

const Loader = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <View style={styles.loaderWrapper}>
      <Video
        source={require("@/assets/animations/loader.webm")}
        shouldPlay
        isLooping
        style={styles.video}
        isMuted
      />
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
  video: {
    width: 200,
    height: 200,
  },
});

export default Loader;
