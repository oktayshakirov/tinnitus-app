import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  AppState,
} from "react-native";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/Fontisto";
import { useRefresh } from "@/contexts/RefreshContext";
import { useSavedContent } from "@/contexts/SavedContentContext";
import { useWebView } from "@/contexts/WebViewContext";
import { useSegments, useRouter, useFocusEffect } from "expo-router";
import { RemoveContentDialog } from "@/components/RemoveContentDialog";
import HeaderMenu from "@/components/HeaderMenu";
import { ContentSaver } from "@/utils/ContentSaver";

const ROUTE_REFRESH_MAP: Record<string, string> = {
  index: "home",
  posts: "posts",
  sounds: "sounds",
  checkin: "checkin",
  "saved-posts": "saved-posts",
};

export default function Header() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "index";
  const refreshKey = ROUTE_REFRESH_MAP[currentRoute] || "home";
  const { triggerRefresh } = useRefresh(refreshKey);
  const {
    currentUrl,
    isCurrentPageSaveable,
    isCurrentPageSaved,
    saveCurrentPage,
    removeSavedContent,
    currentPageType,
    currentPageSlug,
    forceRefreshSavedState,
  } = useSavedContent();
  const { getWebViewRef } = useWebView();

  const showBookmark = isCurrentPageSaveable;

  useEffect(() => {
    forceRefreshSavedState();
  }, [forceRefreshSavedState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        forceRefreshSavedState();
      }
    });
    return () => subscription.remove();
  }, [forceRefreshSavedState]);

  useFocusEffect(
    React.useCallback(() => {
      forceRefreshSavedState();
    }, [forceRefreshSavedState])
  );

  const handleSaveContent = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isCurrentPageSaved) {
        if (currentPageType && currentPageSlug) {
          RemoveContentDialog.show({
            contentType: "posts",
            onRemove: async () => {
              return await removeSavedContent(currentPageType, currentPageSlug);
            },
            onSuccess: () => {
              Alert.alert("Success", "Content removed from saved items");
            },
            onError: () => {
              Alert.alert("Error", "Failed to remove content");
            },
          });
        }
      } else {
        Alert.alert(
          "Save Content",
          "This post will be saved for offline reading.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save",
              onPress: async () => {
                if (!currentUrl || !isCurrentPageSaveable) {
                  Alert.alert("Error", "Cannot save this page");
                  return;
                }
                await ContentSaver.saveContent(
                  currentUrl,
                  currentPageType,
                  currentPageSlug,
                  getWebViewRef,
                  saveCurrentPage
                );
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoPress = () => {
    const inSavedFlow = segments.some((s) => s === "saved-content");
    if (inSavedFlow) {
      router.push("/(tabs)");
      return;
    }
    triggerRefresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={handleLogoPress}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/images/favicon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {showBookmark && (
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleSaveContent}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <MaterialIcons
              name={isCurrentPageSaved ? "check" : "download"}
              size={24}
              color={isCurrentPageSaved ? Colors.activeIcon : Colors.text}
            />
          </TouchableOpacity>
        )}

        <HeaderMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
    overflow: "visible",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
});
