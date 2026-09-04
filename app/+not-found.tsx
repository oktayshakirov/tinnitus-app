import React from "react";
import { Link, Stack } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { MASCOTS } from "@/services/checkin";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Image
          source={MASCOTS.neutral}
          style={styles.mascot}
          resizeMode="contain"
        />
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href={"/" as any} style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  mascot: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
  },
});
