// Packages required (install before use):
//   npx expo install expo-mail-composer expo-store-review expo-clipboard
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Alert,
  Platform,
  ActionSheetIOS,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as MailComposer from "expo-mail-composer";
import * as StoreReview from "expo-store-review";
import Constants from "expo-constants";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Colors } from "@/constants/Colors";

const APP_STORE_ID = "6741688965";
const ANDROID_PACKAGE = "com.shadev.tinnitushelpme";
const CONTACT_EMAIL = "contact@tinnitushelp.me";
const APP_VERSION = Constants.expoConfig?.version ?? "—";
const RATED_FLAG_KEY = "tinnitushelp_hasRequestedReview";

const TIKTOK_URL = "https://www.tiktok.com/@tinnitushelp.me";
const INSTAGRAM_URL = "https://instagram.com/tinnitushelp.me";
const FACEBOOK_URL = "https://www.facebook.com/TheTinnitusHelp";
const TWITTER_URL = "https://x.com/TinnitusHelp_me";
const TELEGRAM_URL = "https://t.me/tinnitushelpme";

function openStoreListing() {
  const url =
    Platform.OS === "ios"
      ? `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  Linking.openURL(url).catch(() => undefined);
}

interface MailOption {
  name: string;
  open: () => Promise<void>;
}

function openMailto(subject: string, body: string): Promise<void> {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return Linking.openURL(mailto);
}

function showCopyAddressFallback() {
  Alert.alert(
    "No email app found",
    `Copy our address and send your message from any email app:\n\n${CONTACT_EMAIL}`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Copy address",
        onPress: () => {
          Clipboard.setStringAsync(CONTACT_EMAIL).catch(() => undefined);
        },
      },
    ]
  );
}

async function sendMail(subject: string, body: string) {
  if (Platform.OS !== "ios") {
    try {
      await openMailto(subject, body);
    } catch {
      showCopyAddressFallback();
    }
    return;
  }

  const enc = (s: string) => encodeURIComponent(s);
  const options: MailOption[] = [];

  const gmailUrl = `googlegmail:///co?to=${CONTACT_EMAIL}&subject=${enc(subject)}&body=${enc(body)}`;
  try {
    if (await Linking.canOpenURL(gmailUrl)) {
      options.push({ name: "Gmail", open: () => Linking.openURL(gmailUrl) });
    }
  } catch {
    // Detection failure — skip.
  }

  const outlookUrl = `ms-outlook://compose?to=${CONTACT_EMAIL}&subject=${enc(subject)}&body=${enc(body)}`;
  try {
    if (await Linking.canOpenURL(outlookUrl)) {
      options.push({
        name: "Outlook",
        open: () => Linking.openURL(outlookUrl),
      });
    }
  } catch {
    // Detection failure — skip.
  }

  try {
    if (await MailComposer.isAvailableAsync()) {
      options.push({
        name: "Apple Mail",
        open: async () => {
          await MailComposer.composeAsync({
            recipients: [CONTACT_EMAIL],
            subject,
            body,
          });
        },
      });
    }
  } catch {
    // Detection failure — skip.
  }

  if (options.length === 0) {
    try {
      await openMailto(subject, body);
    } catch {
      showCopyAddressFallback();
    }
    return;
  }

  if (options.length === 1) {
    await options[0].open();
    return;
  }

  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: "Send with",
      options: [...options.map((o) => o.name), "Cancel"],
      cancelButtonIndex: options.length,
    },
    (index) => {
      if (index < options.length) {
        options[index].open().catch(() => showCopyAddressFallback());
      }
    }
  );
}

function handleBugReport() {
  const deviceModel = Device.modelName ?? "Unknown device";
  const osVersion =
    `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ""}`.trim();
  sendMail(
    "[Bug Report] TinnitusHelp.me",
    `Describe the bug:\n\n\nSteps to reproduce:\n1.\n2.\n3.\n\n--- App info ---\nVersion: ${APP_VERSION}\nDevice: ${deviceModel}\nOS: ${osVersion}\n`
  );
}

function handleFeatureRequest() {
  sendMail(
    "[Feature Request] TinnitusHelp.me",
    `What feature would you like to see?\n\n\nWhy would this be useful?\n\n`
  );
}

function handlePartnership() {
  sendMail(
    "[Partnership] TinnitusHelp.me",
    `Hi TinnitusHelp.me team,\n\nI'd like to explore a partnership opportunity.\n\nCompany / Name:\nWebsite:\nProposal:\n\n`
  );
}

async function handleRateApp() {
  let alreadyRequested = false;
  try {
    alreadyRequested = (await AsyncStorage.getItem(RATED_FLAG_KEY)) === "1";
  } catch {
    // Treat storage failure as not yet requested.
  }

  const canPrompt =
    !alreadyRequested && (await StoreReview.isAvailableAsync());

  if (canPrompt) {
    try {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(RATED_FLAG_KEY, "1");
    } catch {
      openStoreListing();
    }
    return;
  }

  Alert.alert(
    "Thanks for your support!",
    "If you've already rated TinnitusHelp.me, you're awesome. Want to update your review or leave one now?",
    [
      { text: "Not now", style: "cancel" },
      { text: "Open store", onPress: openStoreListing },
    ]
  );
}

interface ConnectModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ConnectModal({ visible, onClose }: ConnectModalProps) {
  const insets = useSafeAreaInsets();

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
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Connect with Us</Text>
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
              {/* FEEDBACK */}
              <Text style={styles.sectionLabel}>FEEDBACK</Text>
              <View style={styles.section}>
                <Pressable
                  onPress={handleBugReport}
                  style={({ pressed }) => [
                    styles.row,
                    styles.rowFirst,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="bug-outline" size={20} color="#f87171" />
                    <Text style={styles.rowLabel}>Report a Bug</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={handleFeatureRequest}
                  style={({ pressed }) => [
                    styles.row,
                    styles.rowLast,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="bulb-outline" size={20} color="#facc15" />
                    <Text style={styles.rowLabel}>Suggest a Feature</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>
              </View>

              {/* COMMUNITY */}
              <Text style={styles.sectionLabel}>COMMUNITY</Text>
              <View style={styles.section}>
                <Pressable
                  onPress={handleRateApp}
                  style={({ pressed }) => [
                    styles.row,
                    styles.rowFirst,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="star-outline" size={20} color="#fb923c" />
                    <Text style={styles.rowLabel}>Rate TinnitusHelp.me</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL(TIKTOK_URL)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="logo-tiktok" size={20} color={Colors.text} />
                    <Text style={styles.rowLabel}>Follow on TikTok</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL(INSTAGRAM_URL)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="logo-instagram"
                      size={20}
                      color="#e1306c"
                    />
                    <Text style={styles.rowLabel}>Follow on Instagram</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL(FACEBOOK_URL)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="logo-facebook"
                      size={20}
                      color="#1877f2"
                    />
                    <Text style={styles.rowLabel}>Follow on Facebook</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL(TWITTER_URL)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="logo-twitter"
                      size={20}
                      color="#1da1f2"
                    />
                    <Text style={styles.rowLabel}>Follow on Twitter / X</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>

                <Pressable
                  onPress={() => Linking.openURL(TELEGRAM_URL)}
                  style={({ pressed }) => [
                    styles.row,
                    styles.rowLast,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="paper-plane-outline"
                      size={20}
                      color="#2aabee"
                    />
                    <Text style={styles.rowLabel}>Join on Telegram</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>
              </View>

              {/* BUSINESS */}
              <Text style={styles.sectionLabel}>BUSINESS</Text>
              <View style={[styles.section, styles.sectionLast]}>
                <Pressable
                  onPress={handlePartnership}
                  style={({ pressed }) => [
                    styles.row,
                    styles.rowFirst,
                    styles.rowLast,
                    pressed && styles.pressedOpacity,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name="rocket-outline" size={20} color="#818cf8" />
                    <Text style={styles.rowLabel}>Work with Us</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </Pressable>
              </View>
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: ROW_BG,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
  sectionLast: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_COLOR,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  pressedOpacity: {
    opacity: 0.6,
  },
});
