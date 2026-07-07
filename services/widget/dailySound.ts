// Fetches the "Sound of the Day" from the blog's widget endpoint. The list is
// remote so newly-added sounds show up automatically; the daily pick is
// deterministic by date (offset from the tip so they don't feel synced).
import { getDayOfYear } from "@/constants/tinnitusTips";

export const WIDGET_SOUNDS_URL = "https://www.tinnitushelp.me/api/widget-sounds";

export interface SoundItem {
  slug: string;
  title: string;
  thumbnail: string;
}

export async function fetchTodaysSound(
  date: Date = new Date()
): Promise<SoundItem | null> {
  try {
    const res = await fetch(WIDGET_SOUNDS_URL);
    if (!res.ok) return null;
    const json = (await res.json()) as { sounds?: SoundItem[] };
    const sounds = json?.sounds ?? [];
    if (sounds.length === 0) return null;
    const index = (getDayOfYear(date) + 3) % sounds.length;
    return sounds[index];
  } catch {
    return null;
  }
}

export function soundDeepLink(slug: string): string {
  return `tinnitushelp://sounds?zen=${encodeURIComponent(slug)}`;
}
