import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/Fontisto";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarLabelPosition: "below-icon",
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 15,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={25} color={color} />
          ),
        }}
      />

      {/* Posts Tab */}
      <Tabs.Screen
        name="posts"
        options={{
          title: "Posts",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="hashtag" size={25} color={color} />
          ),
        }}
      />

      {/* Sounds Tab */}
      <Tabs.Screen
        name="sounds"
        options={{
          title: "Sounds",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="music-note" size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
