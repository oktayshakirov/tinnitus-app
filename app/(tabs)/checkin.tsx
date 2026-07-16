import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useRevenueCat } from "@/contexts/RevenueCatContext";
import { useLoader } from "@/contexts/LoaderContext";
import { syncWidgets } from "@/services/widget/widgetSync";
import {
  CheckinMap,
  FACTORS,
  LEVELS,
  computeStreak,
  dateKey,
  last7Levels,
  levelMeta,
  loadEntries,
  mostCommonFactor,
  saveEntry,
} from "@/services/checkin";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// "2026-07-12" -> "Jul 12"
function friendlyDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function CheckinScreen() {
  const { isPro } = useRevenueCat();
  const { hideLoader } = useLoader();
  const [entries, setEntries] = useState<CheckinMap>({});
  const [level, setLevel] = useState<number | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  // Which day the entry form edits — today by default, or a past day picked
  // from the calendar.
  const [editingDay, setEditingDay] = useState<string>(() => dateKey());
  const scrollRef = useRef<ScrollView>(null);

  const todayKey = dateKey();
  const todayEntry = entries[todayKey];
  const isEditingToday = editingDay === todayKey;
  const streak = useMemo(() => computeStreak(entries), [entries]);

  const refresh = useCallback(async () => {
    const loaded = await loadEntries();
    setEntries(loaded);
    const current = loaded[editingDay];
    if (current) {
      setLevel(current.level);
      setFactors(current.factors);
      setNote(current.note ?? "");
    }
  }, [editingDay]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      // Native screen (no WebView) — make sure a leftover global loader from a
      // WebView tab isn't left spinning when we arrive here (e.g. via widget).
      hideLoader();
      refresh();
    }, [hideLoader, refresh])
  );

  const toggleFactor = (f: string) => {
    setFactors((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  // Point the entry form at a different day and load whatever it holds.
  const startEditingDay = (day: string) => {
    setEditingDay(day);
    const entry = entries[day];
    setLevel(entry?.level ?? null);
    setFactors(entry?.factors ? [...entry.factors] : []);
    setNote(entry?.note ?? "");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSave = async () => {
    if (!level) return;
    Keyboard.dismiss();
    const updated = await saveEntry(editingDay, {
      level,
      factors,
      note: note.trim() || undefined,
    });
    setEntries({ ...updated });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
    // Refresh the (Pro) home-screen widget with the new streak/level.
    syncWidgets(isPro);
  };

  // ----- Calendar helpers -----
  const calendarCells = useMemo(() => {
    const year = month.getFullYear();
    const mon = month.getMonth();
    const firstWeekday = (new Date(year, mon, 1).getDay() + 6) % 7; // Mon = 0
    const daysInMonth = new Date(year, mon + 1, 0).getDate();
    const cells: (string | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(dateKey(new Date(year, mon, d)));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  const changeMonth = (delta: number) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setSelectedDay(null);
  };

  const selectedEntry = selectedDay ? entries[selectedDay] : undefined;
  const last7 = useMemo(() => last7Levels(entries), [entries]);
  const topFactor = useMemo(() => mostCommonFactor(entries), [entries]);
  const hasAnyEntry = Object.keys(entries).length > 0;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={styles.streakTextWrap}>
          {streak > 0 ? (
            <>
              <Text style={styles.streakTitle}>
                {streak}-day streak{streak >= 3 ? " - amazing!" : ""}
              </Text>
              <Text style={styles.streakSubtitle}>
                {todayEntry
                  ? "You've logged today. See you tomorrow!"
                  : "Add today's entry to keep it going."}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.streakTitle}>Start your streak</Text>
              <Text style={styles.streakSubtitle}>
                A quick daily entry helps you spot what affects your tinnitus.
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Check-in entry form (today by default, or a past day from the calendar) */}
      <View style={styles.editorHeader}>
        <Text style={[styles.sectionTitle, styles.editorTitle]}>
          {isEditingToday
            ? "How is your tinnitus today?"
            : `How was your tinnitus on ${friendlyDay(editingDay)}?`}
        </Text>
        {!isEditingToday && (
          <Pressable
            onPress={() => startEditingDay(todayKey)}
            hitSlop={8}
            style={styles.backToToday}
          >
            <Ionicons name="arrow-back" size={13} color={Colors.activeIcon} />
            <Text style={styles.backToTodayText}>Today</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.levelRow}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.value}
            onPress={() => setLevel(l.value)}
            style={[
              styles.levelButton,
              level === l.value && {
                backgroundColor: "rgba(255,255,255,0.18)",
                borderColor: l.color,
              },
            ]}
          >
            <Text style={styles.levelEmoji}>{l.emoji}</Text>
            <Text
              style={[
                styles.levelLabel,
                level === l.value && { color: Colors.text },
              ]}
              numberOfLines={2}
            >
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionSubtitle}>
        Anything that might have played a role? (optional)
      </Text>
      <View style={styles.factorWrap}>
        {FACTORS.map((f) => {
          const active = factors.includes(f);
          return (
            <Pressable
              key={f}
              onPress={() => toggleFactor(f)}
              style={[styles.factorChip, active && styles.factorChipActive]}
            >
              <Text
                style={[
                  styles.factorText,
                  active && styles.factorTextActive,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.noteInput}
        placeholder="Add a short note… (optional)"
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={200}
      />

      <Pressable
        onPress={handleSave}
        disabled={!level}
        style={[styles.saveButton, !level && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveButtonText}>
          {savedFlash
            ? "Saved! 🎉"
            : entries[editingDay]
              ? isEditingToday
                ? "Update today's entry"
                : `Update entry for ${friendlyDay(editingDay)}`
              : isEditingToday
                ? "Save entry"
                : `Save entry for ${friendlyDay(editingDay)}`}
        </Text>
      </Pressable>

      {/* Trends & Insights */}
      <Text style={styles.sectionTitle}>Trends & Insights</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Last 7 days</Text>
        <View style={styles.chartRow}>
          {last7.map((lv, i) => (
            <View key={i} style={styles.chartCol}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: lv > 0 ? 12 + (lv - 1) * 12 : 4,
                    backgroundColor:
                      lv > 0 ? levelMeta(lv).color : "rgba(255,255,255,0.15)",
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={styles.cardHint}>
          {hasAnyEntry && topFactor
            ? `Most noted factor: ${topFactor}`
            : "Log a few days to see your patterns here."}
        </Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarHeader}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.calendarTitle}>{monthLabel(month)}</Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={10}>
          <Ionicons name="chevron-forward" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarCells.map((key, i) => {
          if (!key) return <View key={i} style={styles.dayCell} />;
          const entry = entries[key];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          return (
            <Pressable
              key={i}
              style={[
                styles.dayCell,
                isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => setSelectedDay(key)}
            >
              <Text style={styles.dayText}>{parseInt(key.slice(8), 10)}</Text>
              <View
                style={[
                  styles.dayDot,
                  entry && { backgroundColor: levelMeta(entry.level).color },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {selectedDay && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{selectedDay}</Text>
          {selectedEntry ? (
            <>
              <Text style={styles.selectedLevel}>
                {levelMeta(selectedEntry.level).emoji}{" "}
                {levelMeta(selectedEntry.level).label}
              </Text>
              {selectedEntry.factors.length > 0 && (
                <Text style={styles.cardHint}>
                  Factors: {selectedEntry.factors.join(", ")}
                </Text>
              )}
              {selectedEntry.note ? (
                <Text style={styles.cardHint}>“{selectedEntry.note}”</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.cardHint}>No check-in on this day.</Text>
          )}
          {selectedDay <= todayKey && (
            <Pressable
              onPress={() => startEditingDay(selectedDay)}
              style={styles.editDayButton}
            >
              <Ionicons
                name={selectedEntry ? "pencil" : "add"}
                size={14}
                color="#000"
              />
              <Text style={styles.editDayButtonText}>
                {selectedEntry ? "Edit this entry" : "Add an entry"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const CARD_BG = "rgba(0,0,0,0.2)";
const BORDER = "rgba(255,255,255,0.1)";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,218,185,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,218,185,0.3)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  streakTextWrap: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.highlight,
  },
  streakSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  editorTitle: {
    flex: 1,
  },
  backToToday: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.activeIcon,
  },
  backToTodayText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.activeIcon,
  },
  editDayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.activeIcon,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 12,
  },
  editDayButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  levelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "transparent",
  },
  levelEmoji: {
    fontSize: 22,
  },
  levelLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 4,
  },
  factorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  factorChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  factorChipActive: {
    backgroundColor: Colors.activeIcon,
  },
  factorText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  factorTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  noteInput: {
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    borderRadius: 12,
    color: Colors.text,
    padding: 12,
    minHeight: 48,
    marginBottom: 14,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.activeIcon,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 64,
    marginBottom: 10,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "70%",
    borderRadius: 4,
  },
  cardHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  selectedLevel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 10,
  },
  dayCellToday: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dayCellSelected: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  dayText: {
    fontSize: 13,
    color: Colors.text,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
    backgroundColor: "transparent",
  },
});
