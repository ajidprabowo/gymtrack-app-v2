'use client';
import { WorkoutSession, MealEntry, UserProfile, FoodItem } from '@/types';
import { defaultFoods } from '@/data/foods';
import { seedSessions } from '@/data/seeds';

const KEYS = {
  sessions: 'gtp_sessions',
  meals: 'gtp_meals',
  profile: 'gtp_profile',
  foods: 'gtp_foods',
  seeded: 'gtp_seeded',
};

export const defaultProfile: UserProfile = {
  name: 'Athlete',
  weightKg: 50,
  heightCm: 170,
  targetCalories: 2700,
  targetProtein: 100,
  gymDaysPerWeek: 3,
  goal: 'Bulking',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const storage = {
  getSessions(): WorkoutSession[] {
    const seeded = safeGet<boolean>(KEYS.seeded, false);
    if (!seeded) {
      safeSet(KEYS.sessions, seedSessions);
      safeSet(KEYS.seeded, true);
      return seedSessions;
    }
    return safeGet<WorkoutSession[]>(KEYS.sessions, []);
  },
  saveSessions(s: WorkoutSession[]) { safeSet(KEYS.sessions, s); },

  getMeals(): MealEntry[] { return safeGet<MealEntry[]>(KEYS.meals, []); },
  saveMeals(m: MealEntry[]) { safeSet(KEYS.meals, m); },

  getProfile(): UserProfile { return safeGet<UserProfile>(KEYS.profile, defaultProfile); },
  saveProfile(p: UserProfile) { safeSet(KEYS.profile, p); },

  getFoods(): FoodItem[] {
    const stored = safeGet<FoodItem[]>(KEYS.foods, []);
    if (!stored.length) return defaultFoods;

    // Remove old default IDs that no longer exist in defaultFoods
    const validDefaultIds = new Set(defaultFoods.map(f => f.id));
    const cleaned = stored.filter(f => {
      // Keep if it's a current default food OR a custom (non-default-id) food
      const isOldDefault = /^f\d+$/.test(f.id) && !validDefaultIds.has(f.id);
      return !isOldDefault;
    });

    // Merge: ensure all current defaults are present (in case new ones were added)
    const storedIds = new Set(cleaned.map(f => f.id));
    const merged = [
      ...defaultFoods.filter(f => !storedIds.has(f.id)),
      ...cleaned,
    ];

    if (merged.length !== stored.length) {
      safeSet(KEYS.foods, merged);
    }
    return merged;
  },
  saveFoods(f: FoodItem[]) { safeSet(KEYS.foods, f); },

  getActiveWorkout(): any { return safeGet<any>('gtp_active_workout', null); },
  saveActiveWorkout(w: any) { safeSet('gtp_active_workout', w); },
  clearActiveWorkout() { localStorage.removeItem('gtp_active_workout'); },

  getTimerState(): any { return safeGet<any>('gtp_timer_state', null); },
  saveTimerState(t: any) { safeSet('gtp_timer_state', t); },
  clearTimerState() { localStorage.removeItem('gtp_timer_state'); },
};
