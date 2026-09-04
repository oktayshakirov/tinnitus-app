import React, { useMemo } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  CheckinMap,
  FactorImpact,
  factorImpact,
  lastNLevels,
  levelMeta,
} from "@/services/checkin";

interface InsightsModalProps {
  visible: boolean;
  onClose: () => void;
  entries: CheckinMap;
}

const TREND_DAYS = 30;

function impactLabel(impact: FactorImpact): string {
  const direction = impact.deltaPercent >= 0 ? "higher" : "lower";
  const magnitude = Math.abs(Math.round(impact.deltaPercent));
  if (magnitude < 5) {
    return `No clear effect (${impact.count} logs)`;
  }
  return `${magnitude}% ${direction} on these days (${impact.count} logs)`;
}

export function InsightsModal({ visible, onClose, entries }: InsightsModalProps) {
  const insets = useSafeAreaInsets();

  const trend = useMemo(() => lastNLevels(entries, TREND_DAYS), [entries]);
  const impacts = useMemo(() => factorImpact(entries, 90), [entries]);
  const loggedDaysInTrend = trend.filter((lv) => lv > 0).length;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advanced Insights</Text>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressedOpacity]}
            >
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Last {TREND_DAYS} days</Text>
            {loggedDaysInTrend === 0 ? (
              <Text style={styles.emptyText}>
                Log a few more days to see your 30-day trend here.
              </Text>
            ) : (
              <View style={styles.trendCard}>
                <View style={styles.trendRow}>
                  {trend.map((lv, i) => (
                    <View key={i} style={styles.trendCol}>
                      <View
                        style={[
                          styles.trendBar,
                          {
                            height: lv > 0 ? 6 + (lv - 1) * 9 : 2,
                            backgroundColor:
                              lv > 0 ? levelMeta(lv).color : "rgba(255,255,255,0.12)",
                          },
                        ]}
                      />
                    </View>
                  ))}
                </View>
                <Text style={styles.trendHint}>
                  {loggedDaysInTrend} of {TREND_DAYS} days logged
                </Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, styles.factorSectionLabel]}>
              What affects your tinnitus
            </Text>
            {impacts.length === 0 ? (
              <Text style={styles.emptyText}>
                Keep noting factors on your check-ins - once a factor shows up a
                few times, we'll show whether it tends to line up with higher or
                lower levels for you.
              </Text>
            ) : (
              impacts.map((impact, index) => (
                <View
                  key={impact.factor}
                  style={[styles.factorRow, index > 0 && styles.factorRowBorder]}
                >
                  <View style={styles.factorInfo}>
                    <Text style={styles.factorName}>{impact.factor}</Text>
                    <Text style={styles.factorDetail}>{impactLabel(impact)}</Text>
                  </View>
                  <Ionicons
                    name={impact.deltaPercent > 5 ? "arrow-up" : impact.deltaPercent < -5 ? "arrow-down" : "remove"}
                    size={16}
                    color={
                      impact.deltaPercent > 5
                        ? "#f87171"
                        : impact.deltaPercent < -5
                          ? "#4ade80"
                          : "rgba(255,255,255,0.4)"
                    }
                  />
                </View>
              ))
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
  pressedOpacity: {
    opacity: 0.6,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  factorSectionLabel: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
    marginBottom: 16,
  },
  trendCard: {
    backgroundColor: ROW_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 60,
    marginBottom: 10,
  },
  trendCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  trendBar: {
    width: "100%",
    borderRadius: 2,
  },
  trendHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  factorRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_COLOR,
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  factorDetail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
});
