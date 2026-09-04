// User-added factor tags for the check-in form, layered on top of the
// built-in FACTORS list in checkin.ts. Kept separate so the built-ins stay a
// fixed, non-removable `as const` list while this one is freely edited.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FACTORS } from "@/services/checkin";

const CUSTOM_FACTORS_KEY = "custom_checkin_factors";
const MAX_CUSTOM_FACTORS = 12;
const MAX_FACTOR_LENGTH = 24;

export async function loadCustomFactors(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_FACTORS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function persist(factors: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_FACTORS_KEY, JSON.stringify(factors));
  } catch {
    // Best effort — kept in memory for this session via the caller's state.
  }
}

export interface AddCustomFactorResult {
  factors: string[];
  error?: "duplicate" | "limit" | "empty";
}

export async function addCustomFactor(
  name: string,
  existingCustom: string[]
): Promise<AddCustomFactorResult> {
  const trimmed = name.trim().slice(0, MAX_FACTOR_LENGTH);
  if (!trimmed) {
    return { factors: existingCustom, error: "empty" };
  }

  const takenLower = new Set(
    [...FACTORS, ...existingCustom].map((f) => f.toLowerCase())
  );
  if (takenLower.has(trimmed.toLowerCase())) {
    return { factors: existingCustom, error: "duplicate" };
  }
  if (existingCustom.length >= MAX_CUSTOM_FACTORS) {
    return { factors: existingCustom, error: "limit" };
  }

  const updated = [...existingCustom, trimmed];
  await persist(updated);
  return { factors: updated };
}

export async function removeCustomFactor(
  name: string,
  existingCustom: string[]
): Promise<string[]> {
  const updated = existingCustom.filter((f) => f !== name);
  await persist(updated);
  return updated;
}
