import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  storage,
  computeStreak,
  XP_REWARDS,
  getLevel,
  getLevelProgress,
} from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { scheduleDailyReminder, cancelDailyReminder } from '../services/notifications';
import { achievements as defaultAchievements } from '../data/courses';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState({});
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    reminderHour: 9,
    reminderMinute: 0,
  });

  // Load all persisted data on startup
  useEffect(() => {
    (async () => {
      try {
        const data = await storage.loadAll();
        if (data.onboarded) setHasOnboarded(true);
        if (data.user) setUser(data.user);
        setXp(data.xp || 0);
        setProgress(data.progress || {});
        setEarnedAchievements(data.achievements || []);
        if (data.settings) setSettings(data.settings);

        // Compute streak based on last activity
        const freshStreak = computeStreak(data.lastActivity, data.streak || 0);
        setStreak(freshStreak);

        // Check Supabase session if configured
        if (isSupabaseConfigured()) {
          const session = await supabase.getSession();
          if (session?.user) setSupabaseUser(session.user);
        }
      } catch (e) {
        console.warn('AppContext load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = useCallback(async (userData) => {
    setUser(userData);
    setHasOnboarded(true);
    await storage.saveUser(userData);
    await storage.saveOnboarded(true);
    await storage.saveLastActivity(new Date().toISOString());
    setStreak(1);
    await storage.saveStreak(1);

    if (userData.notificationsEnabled !== false) {
      await scheduleDailyReminder(9, 0);
    }
  }, []);

  const addXP = useCallback(async (amount, reason) => {
    setXp((prev) => {
      const next = prev + amount;
      storage.saveXP(next);
      return next;
    });
    await recordActivity();
  }, []);

  const recordActivity = useCallback(async () => {
    const today = new Date().toISOString();
    const last = await storage.loadLastActivity();
    const fresh = computeStreak(last, streak);
    if (fresh !== streak) {
      setStreak(fresh);
      await storage.saveStreak(fresh);
    }
    await storage.saveLastActivity(today);
  }, [streak]);

  const completeLesson = useCallback(
    async (courseId, lessonId, lessonType) => {
      const xpReward =
        lessonType === 'quiz'
          ? XP_REWARDS.LESSON_QUIZ
          : lessonType === 'practice'
          ? XP_REWARDS.LESSON_PRACTICE
          : XP_REWARDS.LESSON_VIDEO;

      setProgress((prev) => {
        const courseProgress = prev[courseId] || { completed: [], pct: 0 };
        if (courseProgress.completed.includes(lessonId)) return prev;
        const updated = {
          ...prev,
          [courseId]: {
            ...courseProgress,
            completed: [...courseProgress.completed, lessonId],
          },
        };
        storage.saveProgress(updated);
        return updated;
      });

      await addXP(xpReward, `Leçon ${lessonType}`);
      await checkAchievements();

      if (supabaseUser && isSupabaseConfigured()) {
        const courseProgress = progress[courseId] || { completed: [] };
        supabase.syncProgress(supabaseUser.id, courseId, courseProgress.completed, 0);
      }
    },
    [addXP, progress, supabaseUser]
  );

  const checkAchievements = useCallback(async () => {
    const newlyEarned = [];
    const totalLessons = Object.values(progress).reduce(
      (sum, c) => sum + (c.completed?.length || 0),
      0
    );

    if (totalLessons >= 1 && !earnedAchievements.includes(1)) newlyEarned.push(1);
    if (streak >= 7 && !earnedAchievements.includes(7)) newlyEarned.push(7);
    if (xp >= 500 && !earnedAchievements.includes(8)) newlyEarned.push(8);

    if (newlyEarned.length > 0) {
      const updated = [...new Set([...earnedAchievements, ...newlyEarned])];
      setEarnedAchievements(updated);
      await storage.saveAchievements(updated);
    }
  }, [progress, streak, xp, earnedAchievements]);

  const updateSettings = useCallback(async (updates) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await storage.saveSettings(next);

    if ('notificationsEnabled' in updates || 'reminderHour' in updates || 'reminderMinute' in updates) {
      if (next.notificationsEnabled) {
        await scheduleDailyReminder(next.reminderHour, next.reminderMinute);
      } else {
        await cancelDailyReminder();
      }
    }
  }, [settings]);

  // Supabase auth helpers
  const signIn = useCallback(async (email, password) => {
    const result = await supabase.signIn(email, password);
    if (result.user) {
      setSupabaseUser(result.user);
      const profile = await supabase.getProfile(result.user.id);
      if (profile) {
        setUser({ ...user, name: profile.name });
        setXp(profile.xp || 0);
        setStreak(profile.streak || 0);
      }
    }
    return result;
  }, [user]);

  const signUp = useCallback(async (email, password, name) => {
    const result = await supabase.signUp(email, password, name);
    if (result.user) setSupabaseUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.signOut();
    setSupabaseUser(null);
  }, []);

  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);

  return (
    <AppContext.Provider
      value={{
        loading,
        hasOnboarded,
        user,
        supabaseUser,
        xp,
        streak,
        progress,
        earnedAchievements,
        settings,
        level,
        levelProgress,
        completeOnboarding,
        completeLesson,
        addXP,
        updateSettings,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
