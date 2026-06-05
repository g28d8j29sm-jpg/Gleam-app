import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const typeConfig = {
  video: { icon: 'play-circle-outline', label: 'Vidéo', color: '#06B6D4' },
  quiz: { icon: 'help-circle-outline', label: 'Quiz', color: '#F59E0B' },
  practice: { icon: 'chatbubbles-outline', label: 'Pratique IA', color: '#10B981' },
};

export default function CourseDetailScreen({ route, navigation }) {
  const { course } = route.params;
  const [expanded, setExpanded] = useState(true);

  const lessons = course.lessons || [];
  const completed = lessons.filter((l) => l.completed).length;
  const total = lessons.length;
  const nextLesson = lessons.find((l) => !l.completed);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[course.color + 'FF', course.color + '66', colors.background]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{course.icon}</Text>
          <Text style={styles.heroLevel}>{course.level}</Text>
          <Text style={styles.heroTitle}>{course.title}</Text>

          <View style={styles.heroMeta}>
            <MetaChip icon="book-outline" text={`${total} leçons`} />
            <MetaChip icon="time-outline" text={course.duration} />
            <MetaChip icon="star" text={`${course.rating}`} />
          </View>
        </LinearGradient>

        {/* Progress */}
        {pct > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Votre progression</Text>
              <Text style={[styles.progressPct, { color: course.color }]}>{pct}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: course.color }]} />
            </View>
            <Text style={styles.progressSub}>
              {completed} sur {total} leçons terminées
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Lesson', { lesson: nextLesson || lessons[0], course })}
        >
          <LinearGradient
            colors={[course.color, course.color + 'AA']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play-circle" size={22} color="#fff" />
            <Text style={styles.ctaText}>
              {pct === 0 ? 'Commencer le cours' : pct === 100 ? 'Revoir le cours' : 'Continuer'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{course.description}</Text>
          <View style={styles.statsRow}>
            <StatItem label="Apprenants" value={course.students.toLocaleString('fr-FR')} icon="👥" />
            <StatItem label="Durée" value={course.duration} icon="⏱️" />
            <StatItem label="Niveau" value={course.level} icon="📊" />
          </View>
        </View>

        {/* Lessons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.lessonHeader}
            onPress={() => setExpanded((e) => !e)}
          >
            <Text style={styles.sectionTitle}>Programme ({total} leçons)</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {expanded &&
            lessons.map((lesson, idx) => (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonItem, lesson.completed && styles.lessonItemDone]}
                onPress={() => navigation.navigate('Lesson', { lesson, course })}
              >
                <View style={styles.lessonNumber}>
                  {lesson.completed ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : (
                    <View style={styles.lessonNumCircle}>
                      <Text style={styles.lessonNumText}>{idx + 1}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, lesson.completed && styles.lessonTitleDone]}>
                    {lesson.title}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <Ionicons
                      name={typeConfig[lesson.type]?.icon || 'document-outline'}
                      size={12}
                      color={typeConfig[lesson.type]?.color || colors.textMuted}
                    />
                    <Text style={[styles.lessonType, { color: typeConfig[lesson.type]?.color }]}>
                      {typeConfig[lesson.type]?.label}
                    </Text>
                    <Text style={styles.lessonDuration}>· {lesson.duration}</Text>
                  </View>
                </View>
                {lesson.type === 'practice' && (
                  <View style={styles.aiTag}>
                    <Text style={styles.aiTagText}>IA</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaChip({ icon, text }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.7)" />
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 30 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 30, marginBottom: 16 },
  heroMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaChipText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  progressPct: { fontSize: 14, fontWeight: '800' },
  progressBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressSub: { fontSize: 12, color: colors.textMuted },
  ctaBtn: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonItemDone: { opacity: 0.7 },
  lessonNumber: { width: 24, alignItems: 'center' },
  lessonNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  lessonTitleDone: { color: colors.textMuted },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lessonType: { fontSize: 11, fontWeight: '600' },
  lessonDuration: { fontSize: 11, color: colors.textMuted },
  aiTag: {
    backgroundColor: '#10B98122',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#10B98155',
  },
  aiTagText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
});
