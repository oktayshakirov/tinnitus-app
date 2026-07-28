import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/Fontisto";

/**
 * "offline" is a transport failure - the device could not reach the site at
 * all. "notFound" is the server answering with an error for this page, which
 * is a different problem and must not be reported as a connection issue: a
 * post announced by a push notification can briefly 404 while the deploy that
 * contains it is still being promoted.
 */
export type OfflineScreenVariant = "offline" | "notFound";

const VARIANTS: Record<
  OfflineScreenVariant,
  { icon: "wifi" | "question"; title: string; message: string }
> = {
  offline: {
    icon: "wifi",
    title: "Oops! No Internet Connection",
    message:
      "It looks like you're offline. Please check your internet connection and try again.",
  },
  notFound: {
    icon: "question",
    title: "This Page Isn't Available Yet",
    message:
      "We couldn't load this page. If you just tapped a notification, the post may still be going live - try again in a moment.",
  },
};

interface OfflineScreenProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  variant?: OfflineScreenVariant;
}

export default function OfflineScreen({
  onRetry,
  isRetrying,
  variant = "offline",
}: OfflineScreenProps) {
  const { icon, title, message } = VARIANTS[variant];

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={80} color={Colors.icon} />
        </View>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.7}
          disabled={isRetrying}
        >
          <MaterialIcons
            name="check"
            size={20}
            color={isRetrying ? Colors.highlight : Colors.text}
          />
          <Text
            style={[styles.retryButtonText, isRetrying && styles.retryingText]}
          >
            {isRetrying ? "Checking..." : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 400,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignSelf: "center",
    width: "100%",
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  message: {
    fontSize: 16,
    color: Colors.icon,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.text,
    minWidth: 200,
  },
  retryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  retryingText: {
    color: Colors.highlight,
    opacity: 0.8,
  },
});
