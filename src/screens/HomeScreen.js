import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { courses, categories } from '../data/courses';
import { useApp } from '../context/AppContext';
import { LEVELS } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const { user, xp, streak, level, levelProgress } = useApp();
  const userName = user?.name || 'Apprenant';
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const dailyChallenge = courses[4];

  const totalMinutes = 185;

  const greetings = ['Bonjour', 'Bon retour', 'Salut'];
  const greeting = greetings[new Date().getHours() < 12 ? 0 : new Date().getHours() < 18 ? 1 : 2];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName} 👋</Text>
            <Text style={styles.subgreeting}>Prêt(e) à progresser aujourd'hui ?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.avatar}>
              <Text style={styles.avatarText}>{userName[0].toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* XP / Level card */}
        <TouchableOpacity
          style={styles.xpCard}
          onPress={() => navigation.navigate('Progrès')}
        >
          <View style={styles.xpLeft}>
            <Text style={styles.xpLevelIcon}>{level.icon}</Text>
            <View>
              <Text style={styles.xpLevelName}>{level.name}</Text>
              <Text style={styles.xpAmount}>{xp.toLocaleString('fr-FR')} XP</Text>
            </View>
          </View>
          <View style={styles.xpRight}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelProgress}%`, backgroundColor: level.color }]} />
            </View>
            <Text style={styles.xpBarLabel}>{levelProgress}% vers {getNextLevel(level)}</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="🔥" value={`${streak}`} label="Jours d'affilée" color="#F59E0B" />
          <StatCard icon="⏱️" value={`${totalMinutes}'`} label="Ce mois" color="#06B6D4" />
          <StatCard icon="✅" value="24" label="Leçons" color="#10B981" />
        </View>

        {/* Daily Challenge */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CourseDetail', { course: dailyChallenge })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#7C3AED', '#A855F7', '#EC4899']}
            style={styles.dailyChallenge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>⚡ Défi du jour</Text>
            </View>
            <Text style={styles.dailyTitle}>{dailyChallenge.title}</Text>
            <Text style={styles.dailyDesc} numberOfLines={2}>{dailyChallenge.description}</Text>
            <View style={styles.dailyMeta}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.dailyMetaText}>15 min · +50 XP</Text>
              <View style={styles.startBtn}>
                <Text style={styles.startBtnText}>Commencer</Text>
                <Ionicons name="arrow-forward" size={14} color="#7C3AED" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Continuer à apprendre" onPress={() => navigation.navigate('Cours')} />
            {inProgress.slice(0, 3).map((c) => (
              <CourseRow
                key={c.id}
                course={c}
                onPress={() => navigation.navigate('CourseDetail', { course: c })}
              />
            ))}
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Explorez les domaines" onPress={() => navigation.navigate('Cours')} />
          <View style={styles.categoryGrid}>
            {categories.slice(0, 6).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { borderColor: cat.color + '44' }]}
                onPress={() => navigation.navigate('Cours', { filter: cat.id })}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <SectionHeader title="Recommandés pour vous" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
            {courses.filter((c) => c.progress === 0).slice(0, 4).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.recommendCard}
                onPress={() => navigation.navigate('CourseDetail', { course: c })}
              >
                <LinearGradient colors={[c.color + 'CC', c.color + '66']} style={styles.recommendGradient}>
                  <Text style={styles.recommendIcon}>{c.icon}</Text>
                </LinearGradient>
                <Text style={styles.recommendLevel}>{c.level}</Text>
                <Text style={styles.recommendTitle} numberOfLines={2}>{c.title}</Text>
                <View style={styles.recommendMeta}>
                  <Ionicons name="book-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.recommendMetaText}>{c.lessonsCount} leçons</Text>
                  <Ionicons name="star" size={12} color="#F59E0B" style={{ marginLeft: 8 }} />
                  <Text style={styles.recommendMetaText}>{c.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getNextLevel(current) {
  const idx = LEVELS.findIndex((l) => l.name === current.name);
  return LEVELS[idx + 1]?.name || 'Max';
}

function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>Voir tout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CourseRow({ course, onPress }) {
  return (
    <TouchableOpacity style={styles.courseRow} onPress={onPress}>
      <View style={[styles.courseIcon, { backgroundColor: course.color + '22' }]}>
        <Text style={styles.courseIconText}>{course.icon}</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${course.progress}%`, backgroundColor: course.color }]} />
        </View>
        <Text style={styles.progressLabel}>{course.progress}% complété</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  subgreeting: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  xpLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpLevelIcon: { fontSize: 28 },
  xpLevelName: { fontSize: 13, fontWeight: '700', color: colors.text },
  xpAmount: { fontSize: 11, color: colors.primaryLight, fontWeight: '600', marginTop: 2 },
  xpRight: { flex: 1 },
  xpBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: '100%', borderRadius: 3 },
  xpBarLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  dailyChallenge: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 8 },
  dailyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  dailyBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  dailyTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  dailyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 16 },
  dailyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dailyMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  startBtnText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  seeAll: { fontSize: 14, color: colors.primaryLight, fontWeight: '600' },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  courseIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  courseIconText: { fontSize: 22 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  progressBarContainer: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressLabel: { fontSize: 11, color: colors.textMuted },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 4 },
  categoryCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryIcon: { fontSize: 26, marginBottom: 6 },
  categoryName: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  horizontal: { marginTop: 12, marginHorizontal: -20, paddingHorizontal: 20 },
  recommendCard: { width: 180, backgroundColor: colors.surface, borderRadius: 16, marginRight: 12, overflow: 'hidden' },
  recommendGradient: { height: 100, alignItems: 'center', justifyContent: 'center' },
  recommendIcon: { fontSize: 40 },
  recommendLevel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 10,
    marginHorizontal: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  recommendMeta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 14, gap: 4 },
  recommendMetaText: { fontSize: 11, color: colors.textMuted },
});
