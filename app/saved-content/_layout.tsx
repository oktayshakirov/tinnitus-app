import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { useSavedContent } from "@/contexts/SavedContentContext";
import Header from "@/components/Header";

export default function SavedContentLayout() {
  const { setCurrentUrl } = useSavedContent();

  useEffect(() => {
    setCurrentUrl("");
  }, [setCurrentUrl]);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentUrl("");
    }, [setCurrentUrl])
  );

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
