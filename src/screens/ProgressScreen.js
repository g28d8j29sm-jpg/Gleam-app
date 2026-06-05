import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { achievements as allAchievements, weeklyStats, courses } from '../data/courses';
import { useApp } from '../context/AppContext';
import { LEVELS, getLevelProgress } from '../services/storage';

const MAX_MINUTES = 60;

export default function ProgressScreen() {
  const { xp, streak, level, levelProgress, earnedAchievements } = useApp();

  const totalMinutes = weeklyStats.reduce((sum, d) => sum + d.minutes, 0);
  const inProgressCourses = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const avgProgress = inProgressCourses.length
    ? Math.round(inProgressCourses.reduce((s, c) => s + c.progress, 0) / inProgressCourses.length)
    : 0;

  const nextLevel = LEVELS[LEVELS.findIndex((l) => l.name === level.name) + 1];
  const xpToNext = nextLevel ? nextLevel.min - xp : 0;

  const mergedAchievements = allAchievements.map((a) => ({
    ...a,
    earned: earnedAchievements.includes(a.id),
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes progrès</Text>
          <Text style={styles.subtitle}>Votre parcours d'apprentissage</Text>
        </View>

        {/* Level Card */}
        <LinearGradient
          colors={[level.color + 'CC', level.color + '44']}
          style={styles.levelCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelLeft}>
            <Text style={styles.levelEmoji}>{level.icon}</Text>
            <View>
              <Text style={styles.levelLabel}>Niveau actuel</Text>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.levelXp}>{xp.toLocaleString('fr-FR')} XP total</Text>
            </View>
          </View>
          {nextLevel && (
            <View style={styles.levelRight}>
              <Text style={styles.nextLevelLabel}>Prochain niveau</Text>
              <Text style={styles.nextLevelName}>{nextLevel.name} {nextLevel.icon}</Text>
              <Text style={styles.xpToNext}>encore {xpToNext} XP</Text>
            </View>
          )}
        </LinearGradient>

        {/* XP Progress Bar */}
        <View style={styles.xpBar}>
          <View style={styles.xpBarHeader}>
            <Text style={styles.xpBarCurrent}>{level.name}</Text>
            <Text style={styles.xpBarPct}>{levelProgress}%</Text>
            {nextLevel && <Text style={styles.xpBarNext}>{nextLevel.name}</Text>}
          </View>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={[level.color, nextLevel?.color || level.color]}
              style={[styles.xpBarFill, { width: `${levelProgress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard icon="🔥" value={streak} label="Jours" sub="de suite" color="#F59E0B" />
          <SummaryCard icon="⏱️" value={totalMinutes} label="Minutes" sub="cette semaine" color="#06B6D4" />
          <SummaryCard icon="✅" value="24" label="Leçons" sub="terminées" color="#10B981" />
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité hebdomadaire</Text>
            <Text style={styles.weekTotal}>{totalMinutes} min</Text>
          </View>
          <View style={styles.chart}>
            {weeklyStats.map((day) => {
              const pct = day.minutes / MAX_MINUTES;
              const isToday = day.day === 'Jeu';
              return (
                <View key={day.day} style={styles.bar}>
                  <Text style={styles.barMinutes}>{day.minutes > 0 ? day.minutes : ''}</Text>
                  <View style={styles.barTrack}>
                    {day.minutes > 0 && (
                      <LinearGradient
                        colors={isToday ? ['#7C3AED', '#EC4899'] : ['#7C3AED99', '#7C3AED55']}
                        style={[styles.barFill, { flex: pct }]}
                      />
                    )}
                  </View>
                  <Text style={[styles.barDay, isToday && styles.barDayActive]}>{day.day}</Text>
                  {isToday && <View style={styles.todayDot} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* XP breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment gagner des XP</Text>
          <View style={styles.xpGrid}>
            {[
              { label: 'Leçon vidéo', xp: 50, icon: '🎬' },
              { label: 'Quiz réussi', xp: 100, icon: '❓' },
              { label: 'Pratique IA', xp: 75, icon: '🤖' },
              { label: 'Cours complet', xp: 500, icon: '🏆' },
            ].map((item) => (
              <View key={item.label} style={styles.xpGridItem}>
                <Text style={styles.xpGridIcon}>{item.icon}</Text>
                <Text style={styles.xpGridLabel}>{item.label}</Text>
                <Text style={styles.xpGridValue}>+{item.xp} XP</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Courses in progress */}
        {inProgressCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cours en cours</Text>
            {inProgressCourses.map((course) => (
              <View key={course.id} style={styles.courseProgress}>
                <View style={[styles.courseEmoji, { backgroundColor: course.color + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{course.icon}</Text>
                </View>
                <View style={styles.courseProgressInfo}>
                  <Text style={styles.courseProgressTitle} numberOfLines={1}>{course.title}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${course.progress}%`, backgroundColor: course.color }]} />
                  </View>
                  <Text style={styles.courseProgressSub}>
                    {course.progress}% · {course.lessons.filter((l) => l.completed).length}/{course.lessons.length} leçons
                  </Text>
                </View>
                <Text style={[styles.pctLabel, { color: course.color }]}>{course.progress}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Succès</Text>
            <Text style={styles.achievedCount}>
              {mergedAchievements.filter((a) => a.earned).length}/{mergedAchievements.length} obtenus
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {mergedAchievements.map((a) => (
              <View
                key={a.id}
                style={[styles.achievementCard, !a.earned && styles.achievementCardLocked]}
              >
                <Text style={[styles.achievementIcon, !a.earned && styles.achievementIconLocked]}>
                  {a.earned ? a.icon : '🔒'}
                </Text>
                <Text style={[styles.achievementTitle, !a.earned && styles.achievementTitleLocked]}>
                  {a.title}
                </Text>
                <Text style={styles.achievementDesc} numberOfLines={2}>{a.description}</Text>
                {a.earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, value, label, sub, color }) {
  return (
    <View style={[styles.summaryCard, { borderColor: color + '44' }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summarySub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  levelCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelEmoji: { fontSize: 40 },
  levelLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 2 },
  levelName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  levelXp: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  levelRight: { alignItems: 'flex-end' },
  nextLevelLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  nextLevelName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  xpToNext: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  xpBar: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpBarHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  xpBarCurrent: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, flex: 1 },
  xpBarPct: { fontSize: 13, fontWeight: '800', color: colors.text },
  xpBarNext: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, flex: 1, textAlign: 'right' },
  xpBarBg: { height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 5 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryIcon: { fontSize: 20, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: colors.text, fontWeight: '600', marginTop: 2 },
  summarySub: { fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 1 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  weekTotal: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bar: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barMinutes: { fontSize: 9, color: colors.textMuted, marginBottom: 4 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontWeight: '600' },
  barDayActive: { color: colors.primaryLight },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.primary, marginTop: 2 },
  xpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  xpGridItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpGridIcon: { fontSize: 26, marginBottom: 6 },
  xpGridLabel: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  xpGridValue: { fontSize: 15, fontWeight: '800', color: colors.primaryLight },
  courseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  courseEmoji: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  courseProgressInfo: { flex: 1 },
  courseProgressTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 2 },
  courseProgressSub: { fontSize: 11, color: colors.textMuted },
  pctLabel: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  achievedCount: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '44',
    position: 'relative',
  },
  achievementCardLocked: { borderColor: colors.border, opacity: 0.5 },
  achievementIcon: { fontSize: 28, marginBottom: 6 },
  achievementIconLocked: { opacity: 0.4 },
  achievementTitle: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 4 },
  achievementTitleLocked: { color: colors.textMuted },
  achievementDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 15 },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
