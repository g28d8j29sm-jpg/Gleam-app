import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { achievements, weeklyStats, courses } from '../data/courses';

const MAX_MINUTES = 60;

export default function ProgressScreen() {
  const totalMinutes = weeklyStats.reduce((sum, d) => sum + d.minutes, 0);
  const streak = 7;
  const totalLessons = 24;
  const totalCourses = courses.filter((c) => c.progress > 0).length;
  const avgProgress = Math.round(
    courses.filter((c) => c.progress > 0).reduce((s, c) => s + c.progress, 0) /
      Math.max(1, courses.filter((c) => c.progress > 0).length)
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes progrès</Text>
          <Text style={styles.subtitle}>Votre parcours d'apprentissage</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard icon="🔥" value={streak} label="Jours" sub="de suite" color="#F59E0B" />
          <SummaryCard icon="⏱️" value={totalMinutes} label="Minutes" sub="cette semaine" color="#06B6D4" />
          <SummaryCard icon="✅" value={totalLessons} label="Leçons" sub="terminées" color="#10B981" />
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité hebdomadaire</Text>
            <Text style={styles.weekTotal}>{totalMinutes} min cette semaine</Text>
          </View>
          <View style={styles.chart}>
            {weeklyStats.map((day) => {
              const pct = day.minutes / MAX_MINUTES;
              const isToday = day.day === 'Jeu';
              return (
                <View key={day.day} style={styles.bar}>
                  <Text style={styles.barMinutes}>{day.minutes > 0 ? day.minutes : ''}</Text>
                  <View style={styles.barTrack}>
                    {day.minutes > 0 ? (
                      <LinearGradient
                        colors={isToday ? ['#7C3AED', '#EC4899'] : ['#7C3AED99', '#7C3AED55']}
                        style={[styles.barFill, { flex: pct }]}
                      />
                    ) : null}
                  </View>
                  <Text style={[styles.barDay, isToday && styles.barDayActive]}>{day.day}</Text>
                  {isToday && <View style={styles.todayDot} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Courses in progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cours en cours</Text>
          {courses
            .filter((c) => c.progress > 0 && c.progress < 100)
            .map((course) => (
              <View key={course.id} style={styles.courseProgress}>
                <View style={styles.courseProgressLeft}>
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
                </View>
                <Text style={[styles.pctLabel, { color: course.color }]}>{course.progress}%</Text>
              </View>
            ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Succès</Text>
            <Text style={styles.achievedCount}>
              {achievements.filter((a) => a.earned).length}/{achievements.length} obtenus
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
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

        {/* Overall stats */}
        <View style={[styles.section, styles.overallStats]}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.overallGrid}>
            <OverallStat label="Cours actifs" value={totalCourses} icon="📚" />
            <OverallStat label="Progression moy." value={`${avgProgress}%`} icon="📈" />
            <OverallStat label="Quiz réussis" value="8" icon="🎯" />
            <OverallStat label="Pratiques IA" value="5" icon="🤖" />
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

function OverallStat({ label, value, icon }) {
  return (
    <View style={styles.overallStatCard}>
      <Text style={styles.overallStatIcon}>{icon}</Text>
      <Text style={styles.overallStatValue}>{value}</Text>
      <Text style={styles.overallStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryIcon: { fontSize: 22, marginBottom: 6 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 12, color: colors.text, fontWeight: '600', marginTop: 2 },
  summarySub: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  weekTotal: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
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
  courseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseProgressLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  courseEmoji: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  courseProgressInfo: { flex: 1 },
  courseProgressTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 2 },
  courseProgressSub: { fontSize: 11, color: colors.textMuted },
  pctLabel: { fontSize: 16, fontWeight: '800', marginLeft: 12 },
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
  overallStats: { marginBottom: 8 },
  overallGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  overallStatCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallStatIcon: { fontSize: 26, marginBottom: 8 },
  overallStatValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  overallStatLabel: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
