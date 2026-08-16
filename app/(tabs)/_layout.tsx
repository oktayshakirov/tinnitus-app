import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/Fontisto";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import Header from "@/components/Header";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.activeIcon,
          tabBarInactiveTintColor: Colors.icon,
          headerShown: false,
          tabBarLabelPosition: "below-icon",
          tabBarBackground: TabBarBackground,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarStyle: Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={23} color={color} />
            ),
            tabBarButton: (props) => <HapticTab {...props} refreshKey="home" />,
          }}
        />

        <Tabs.Screen
          name="posts"
          options={{
            title: "Posts",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="quote-a-left" size={23} color={color} />
            ),
            tabBarButton: (props) => (
              <HapticTab {...props} refreshKey="posts" />
            ),
          }}
        />

        <Tabs.Screen
          name="sounds"
          options={{
            title: "Sounds",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="music-note" size={23} color={color} />
            ),
            tabBarButton: (props) => (
              <HapticTab {...props} refreshKey="sounds" />
            ),
          }}
        />

        <Tabs.Screen
          name="videos"
          options={{
            title: "Videos",
            // 20, not the 23 the other tabs use. This glyph is the YouTube
            // logo, so it is 1.42em wide where the rest are 1em or less
            // (advance 1456 against unitsPerEm 1024), and React Navigation
            // gives every tab icon a fixed 31pt-wide slot. At 23 it wants
            // 32.7pt and gets clipped on both sides; 20 renders 28.4pt wide and
            // fits. A wide mark also reads as large as a square one at less
            // height, so it stays balanced next to its neighbours.
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="youtube-play" size={20} color={color} />
            ),
            tabBarButton: (props) => (
              <HapticTab {...props} refreshKey="videos" />
            ),
          }}
        />

        <Tabs.Screen
          name="checkin"
          options={{
            title: "Journal",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="calendar" size={23} color={color} />
            ),
            tabBarButton: (props) => (
              <HapticTab {...props} refreshKey="checkin" />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
