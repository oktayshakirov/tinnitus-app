import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useRevenueCat } from "@/contexts/RevenueCatContext";

interface PlanModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PlanModal({ visible, onClose }: PlanModalProps) {
  const insets = useSafeAreaInsets();
  const {
    isPro,
    isReady,
    isSupported,
    planLabel,
    showPaywall,
    restoreUserPurchases,
    devProOverride,
    setDevProOverride,
  } = useRevenueCat();
  const [restoring, setRestoring] = useState(false);

  const handleUpgrade = async () => {
    if (!isSupported) {
      Alert.alert(
        "Not Supported",
        "In-app purchases are available only on iOS and Android."
      );
      return;
    }
    if (!isReady) {
      Alert.alert(
        "Please wait",
        "Store is still loading. Try again in a few seconds."
      );
      return;
    }
    await showPaywall();
  };

  const handleRestore = async () => {
    if (!isSupported) {
      Alert.alert(
        "Not Supported",
        "Restoring purchases is available only on iOS and Android."
      );
      return;
    }
    setRestoring(true);
    try {
      const restored = await restoreUserPurchases();
      Alert.alert(
        restored ? "Purchases Restored" : "Nothing to Restore",
        restored
          ? "Your Pro access has been restored. 🎉"
          : "We couldn't find any previous purchases on this account."
      );
    } finally {
      setRestoring(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Plan</Text>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressedOpacity,
              ]}
            >
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.planBadgeRow}>
              <View
                style={[
                  styles.planBadge,
                  {
                    backgroundColor: isPro
                      ? Colors.activeIcon
                      : "rgba(255,255,255,0.15)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.planBadgeText,
                    { color: isPro ? "#000" : Colors.text },
                  ]}
                >
                  {planLabel}
                </Text>
              </View>
              <Text style={styles.planDescription}>
                {isPro
                  ? "You have full access to all features, ad-free."
                  : "Upgrade to remove ads and unlock all Pro features."}
              </Text>
            </View>

            {isPro ? (
              <View style={styles.tipCard}>
                <Ionicons
                  name="heart-outline"
                  size={18}
                  color={Colors.highlight}
                  style={styles.tipIcon}
                />
                <Text style={styles.tipText}>
                  Thank you for your support! 🎉 Your purchase unlocks Pro
                  benefits forever. You'll also receive any future features and
                  improvements we add to the app at no extra cost.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleUpgrade}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressedOpacity,
                ]}
              >
                <Ionicons
                  name="star"
                  size={18}
                  color="#000"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Upgrade to Pro</Text>
              </Pressable>
            )}

            {!isPro && (
              <Pressable
                onPress={handleRestore}
                disabled={restoring}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressedOpacity,
                ]}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <Text style={styles.secondaryButtonText}>
                    Restore Purchases
                  </Text>
                )}
              </Pressable>
            )}

            {__DEV__ && (
              <View style={styles.devCard}>
                <Text style={styles.devLabel}>Pro plan (dev)</Text>
                <View style={styles.devSegment}>
                  <Pressable
                    style={[
                      styles.devOption,
                      devProOverride === true && styles.devOptionActive,
                    ]}
                    onPress={() => setDevProOverride(true)}
                  >
                    <Text
                      style={[
                        styles.devOptionText,
                        devProOverride === true && styles.devOptionTextActive,
                      ]}
                    >
                      On
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.devOption,
                      devProOverride !== true && styles.devOptionActive,
                    ]}
                    onPress={() => setDevProOverride(null)}
                  >
                    <Text
                      style={[
                        styles.devOptionText,
                        devProOverride !== true && styles.devOptionTextActive,
                      ]}
                    >
                      Off
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const ROW_BG = "rgba(0,0,0,0.2)";
const BORDER_COLOR = "rgba(255,255,255,0.1)";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
    margin: -8,
    borderRadius: 8,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  planBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  planBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  planDescription: {
    flex: 1,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.activeIcon,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
    backgroundColor: ROW_BG,
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,218,185,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,218,185,0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 20,
  },
  pressedOpacity: {
    opacity: 0.6,
  },
  devCard: {
    backgroundColor: ROW_BG,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  devLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  devSegment: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    padding: 4,
  },
  devOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  devOptionActive: {
    backgroundColor: Colors.activeIcon,
  },
  devOptionText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  devOptionTextActive: {
    color: "#000",
  },
});
