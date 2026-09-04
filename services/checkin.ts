// Daily tinnitus check-in: local diary of level (1-5), optional factors and a
// short note, stored per calendar day in AsyncStorage. Powers the Check-in tab,
// the streak motivator and the (Pro) home-screen widget.
import AsyncStorage from "@react-native-async-storage/async-storage";

const ENTRIES_KEY = "checkin_entries";

export interface CheckinEntry {
  level: number; // 1 (barely noticeable) … 5 (very loud)
  factors: string[];
  note?: string;
}

export type CheckinMap = Record<string, CheckinEntry>; // key: YYYY-MM-DD

// Mascot art (shared with the website) stands in for the old system emoji.
// Four expressions cover the five levels; the two "loud" levels share the
// worried face, with the colour bar carrying the finer distinction.
export const MASCOTS = {
  happy: require("@/assets/images/mascots/mascot-happy.png"),
  neutral: require("@/assets/images/mascots/mascot-neutral.png"),
  sad: require("@/assets/images/mascots/mascot-sad.png"),
  scared: require("@/assets/images/mascots/mascot-scared.png"),
} as const;

export const LEVELS = [
  { value: 1, emoji: "😌", mascot: MASCOTS.happy, label: "Quiet", color: "#4ade80" },
  { value: 2, emoji: "🙂", mascot: MASCOTS.neutral, label: "Mild", color: "#a3e635" },
  { value: 3, emoji: "😐", mascot: MASCOTS.sad, label: "Moderate", color: "#facc15" },
  { value: 4, emoji: "😣", mascot: MASCOTS.scared, label: "Loud", color: "#fb923c" },
  { value: 5, emoji: "😖", mascot: MASCOTS.scared, label: "Severe", color: "#f87171" },
] as const;

export const FACTORS = [
  "Poor sleep",
  "Stress",
  "Caffeine",
  "Alcohol",
  "Loud noise",
  "Exercise",
  "Headache",
  "Relaxed",
] as const;

export function levelMeta(level: number) {
  return LEVELS[Math.min(Math.max(level, 1), 5) - 1];
}

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function loadEntries(): Promise<CheckinMap> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as CheckinMap) : {};
  } catch {
    return {};
  }
}

export async function saveEntry(
  key: string,
  entry: CheckinEntry
): Promise<CheckinMap> {
  const entries = await loadEntries();
  entries[key] = entry;
  try {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {
    // Storage failure — entry stays in memory for this session.
  }
  return entries;
}

// Consecutive days with an entry, counting back from today (or from yesterday
// when today hasn't been logged yet, so an unfinished day doesn't kill the
// streak before the user checks in).
export function computeStreak(
  entries: CheckinMap,
  today: Date = new Date()
): number {
  let streak = 0;
  const cursor = new Date(today);
  if (!entries[dateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (entries[dateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Levels for the last 7 days (oldest first); 0 = no entry that day.
export function last7Levels(
  entries: CheckinMap,
  today: Date = new Date()
): number[] {
  const out: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(entries[dateKey(d)]?.level ?? 0);
  }
  return out;
}

export function mostCommonFactor(
  entries: CheckinMap,
  days: number = 30,
  today: Date = new Date()
): string | null {
  const counts: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    for (const f of entries[dateKey(d)]?.factors ?? []) {
      counts[f] = (counts[f] ?? 0) + 1;
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [factor, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = factor;
      bestCount = count;
    }
  }
  return best;
}

// Levels for the last N days (oldest first); 0 = no entry that day. Powers
// the Pro Advanced Insights trend chart (last7Levels only covers a week).
export function lastNLevels(
  entries: CheckinMap,
  days: number,
  today: Date = new Date()
): number[] {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(entries[dateKey(d)]?.level ?? 0);
  }
  return out;
}

export interface FactorImpact {
  factor: string;
  count: number;
  avgLevelWith: number;
  avgLevelWithout: number;
  // Percent difference between avgLevelWith and avgLevelWithout.
  deltaPercent: number;
}

/**
 * For each factor logged at least `minCount` times in the window, compares
 * the average level on days it was noted vs days it wasn't - a simple
 * correlation, not causation, but enough to surface "your levels tend to be
 * higher on days you note X".
 */
export function factorImpact(
  entries: CheckinMap,
  days: number = 90,
  today: Date = new Date(),
  minCount: number = 3
): FactorImpact[] {
  const withFactor: Record<string, number[]> = {};
  const withoutFactor: Record<string, number[]> = {};
  const allFactorsSeen = new Set<string>();

  const dayEntries: CheckinEntry[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const entry = entries[dateKey(d)];
    if (entry) dayEntries.push(entry);
  }

  for (const entry of dayEntries) {
    for (const f of entry.factors) allFactorsSeen.add(f);
  }

  for (const factor of allFactorsSeen) {
    withFactor[factor] = [];
    withoutFactor[factor] = [];
    for (const entry of dayEntries) {
      if (entry.factors.includes(factor)) {
        withFactor[factor].push(entry.level);
      } else {
        withoutFactor[factor].push(entry.level);
      }
    }
  }

  const avg = (nums: number[]) =>
    nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

  const results: FactorImpact[] = [];
  for (const factor of allFactorsSeen) {
    const withArr = withFactor[factor];
    const withoutArr = withoutFactor[factor];
    if (withArr.length < minCount || withoutArr.length === 0) continue;

    const avgWith = avg(withArr);
    const avgWithout = avg(withoutArr);
    const deltaPercent =
      avgWithout > 0 ? ((avgWith - avgWithout) / avgWithout) * 100 : 0;

    results.push({
      factor,
      count: withArr.length,
      avgLevelWith: avgWith,
      avgLevelWithout: avgWithout,
      deltaPercent,
    });
  }

  return results.sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent));
}

// Snapshot for the home-screen widgets.
export interface CheckinWidgetData {
  streak: number;
  todayLevel: number; // 0 when not checked in yet
  last7: number[];
}

export async function buildWidgetData(): Promise<CheckinWidgetData> {
  const entries = await loadEntries();
  return {
    streak: computeStreak(entries),
    todayLevel: entries[dateKey()]?.level ?? 0,
    last7: last7Levels(entries),
  };
}
