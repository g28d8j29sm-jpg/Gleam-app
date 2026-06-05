import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { courses, categories } from '../data/courses';

export default function CoursesScreen({ navigation, route }) {
  const initialFilter = route?.params?.filter || null;
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  const filtered = courses.filter((c) => {
    const matchCat = !activeFilter || c.categoryId === activeFilter;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Catalogue de cours</Text>
          <Text style={styles.subtitle}>{courses.length} cours disponibles</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un cours..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filters}
        >
          <TouchableOpacity
            style={[styles.filterChip, !activeFilter && styles.filterChipActive]}
            onPress={() => setActiveFilter(null)}
          >
            <Text style={[styles.filterText, !activeFilter && styles.filterTextActive]}>Tous</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                activeFilter === cat.id && [styles.filterChipActive, { backgroundColor: cat.color }],
              ]}
              onPress={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
            >
              <Text style={styles.filterEmoji}>{cat.icon}</Text>
              <Text style={[styles.filterText, activeFilter === cat.id && styles.filterTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <View style={styles.results}>
          <Text style={styles.resultsLabel}>
            {filtered.length} cours{filtered.length !== 1 ? '' : ''}
          </Text>
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => navigation.navigate('CourseDetail', { course })}
            />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Aucun cours trouvé</Text>
              <Text style={styles.emptySubtext}>Essayez d'autres mots-clés</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CourseCard({ course, onPress }) {
  const lessonsCompleted = course.lessons ? course.lessons.filter((l) => l.completed).length : 0;
  const total = course.lessonsCount || (course.lessons ? course.lessons.length : 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header gradient */}
      <LinearGradient
        colors={[course.color + 'DD', course.color + '55']}
        style={styles.cardHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.cardEmoji}>{course.icon}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{course.level}</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{course.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{course.description}</Text>

        {/* Meta */}
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{total} leçons</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{course.students.toLocaleString('fr-FR')}</Text>
          </View>
          <View style={styles.ratingItem}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{course.rating}</Text>
          </View>
        </View>

        {/* Progress */}
        {course.progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${course.progress}%`, backgroundColor: course.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {lessonsCompleted}/{total} leçons · {course.progress}%
            </Text>
          </View>
        )}

        {course.progress === 0 && (
          <View style={[styles.startTag, { backgroundColor: course.color + '22', borderColor: course.color + '55' }]}>
            <Text style={[styles.startTagText, { color: course.color }]}>Commencer le cours →</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
  filtersContainer: { marginBottom: 8 },
  filters: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterEmoji: { fontSize: 14 },
  filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  results: { paddingHorizontal: 20, paddingTop: 8 },
  resultsLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { height: 90, alignItems: 'flex-start', justifyContent: 'space-between', padding: 16, flexDirection: 'row' },
  cardEmoji: { fontSize: 36 },
  levelBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  ratingItem: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  ratingText: { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  progressSection: { gap: 6 },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.textMuted },
  startTag: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  startTagText: { fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.textSecondary },
});
