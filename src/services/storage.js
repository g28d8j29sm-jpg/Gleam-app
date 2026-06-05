import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@gleam:user',
  ONBOARDED: '@gleam:onboarded',
  PROGRESS: '@gleam:progress',
  XP: '@gleam:xp',
  STREAK: '@gleam:streak',
  LAST_ACTIVITY: '@gleam:last_activity',
  ACHIEVEMENTS: '@gleam:achievements',
  SETTINGS: '@gleam:settings',
};

async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

async function load(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Storage load error:', e);
    return fallback;
  }
}

export const storage = {
  // User & onboarding
  saveUser: (user) => save(KEYS.USER, user),
  loadUser: () => load(KEYS.USER),
  saveOnboarded: (val) => save(KEYS.ONBOARDED, val),
  loadOnboarded: () => load(KEYS.ONBOARDED, false),

  // Course progress: { courseId: { lessonsCompleted: Set, pct: number } }
  saveProgress: (progress) => save(KEYS.PROGRESS, progress),
  loadProgress: () => load(KEYS.PROGRESS, {}),

  // XP & level
  saveXP: (xp) => save(KEYS.XP, xp),
  loadXP: () => load(KEYS.XP, 0),

  // Streak
  saveStreak: (streak) => save(KEYS.STREAK, streak),
  loadStreak: () => load(KEYS.STREAK, 0),
  saveLastActivity: (date) => save(KEYS.LAST_ACTIVITY, date),
  loadLastActivity: () => load(KEYS.LAST_ACTIVITY, null),

  // Achievements: Set of earned IDs
  saveAchievements: (ids) => save(KEYS.ACHIEVEMENTS, ids),
  loadAchievements: () => load(KEYS.ACHIEVEMENTS, []),

  // Settings
  saveSettings: (settings) => save(KEYS.SETTINGS, settings),
  loadSettings: () =>
    load(KEYS.SETTINGS, {
      notificationsEnabled: true,
      reminderHour: 9,
      reminderMinute: 0,
      darkMode: true,
    }),

  async loadAll() {
    const [user, onboarded, progress, xp, streak, lastActivity, achievements, settings] =
      await Promise.all([
        this.loadUser(),
        this.loadOnboarded(),
        this.loadProgress(),
        this.loadXP(),
        this.loadStreak(),
        this.loadLastActivity(),
        this.loadAchievements(),
        this.loadSettings(),
      ]);
    return { user, onboarded, progress, xp, streak, lastActivity, achievements, settings };
  },

  async clearAll() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};

export function computeStreak(lastActivity, currentStreak) {
  if (!lastActivity) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastActivity);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - last) / 86400000);
  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 0;
}

export const XP_REWARDS = {
  LESSON_VIDEO: 50,
  LESSON_QUIZ: 100,
  LESSON_PRACTICE: 75,
  COURSE_COMPLETE: 500,
  STREAK_BONUS: 25,
};

export const LEVELS = [
  { name: 'Novice', min: 0, max: 500, icon: '🌱', color: '#10B981' },
  { name: 'Apprenti', min: 500, max: 1500, icon: '📖', color: '#06B6D4' },
  { name: 'Confirmé', min: 1500, max: 3000, icon: '💡', color: '#7C3AED' },
  { name: 'Expert', min: 3000, max: 6000, icon: '🏆', color: '#F59E0B' },
  { name: 'Maître', min: 6000, max: Infinity, icon: '⭐', color: '#EC4899' },
];

export function getLevel(xp) {
  return LEVELS.findLast((l) => xp >= l.min) || LEVELS[0];
}

export function getLevelProgress(xp) {
  const level = getLevel(xp);
  if (level.max === Infinity) return 100;
  const range = level.max - level.min;
  const earned = xp - level.min;
  return Math.min(100, Math.round((earned / range) * 100));
}
