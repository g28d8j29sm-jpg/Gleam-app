import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { courses, achievements } from '../data/courses';
import { useApp } from '../context/AppContext';

const goalLabels = {
  communication: 'Communication',
  emotional: 'Intelligence émotionnelle',
  leadership: 'Leadership',
  networking: 'Réseautage',
  speaking: 'Prise de parole',
  interview: 'Entretiens',
};

export default function ProfileScreen() {
  const { user } = useApp();
  const name = user?.name || 'Apprenant';
  const goals = user?.goals || [];
  const level = user?.level || 'beginner';

  const levelLabel = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[level] || 'Débutant';

  const totalMinutes = 185;
  const streak = 7;
  const earnedAchievements = achievements.filter((a) => a.earned).length;
  const completedCourses = courses.filter((c) => c.progress === 100).length;

  const menuItems = [
    {
      section: 'Apprentissage',
      items: [
        { icon: 'notifications-outline', label: 'Rappels quotidiens', value: 'Activés', color: '#7C3AED' },
        { icon: 'moon-outline', label: 'Mode sombre', value: 'Activé', color: '#8B5CF6' },
        { icon: 'language-outline', label: 'Langue', value: 'Français', color: '#06B6D4' },
      ],
    },
    {
      section: 'Compte',
      items: [
        { icon: 'card-outline', label: 'Abonnement', value: 'Gratuit', color: '#F59E0B' },
        { icon: 'shield-checkmark-outline', label: 'Confidentialité', color: '#10B981' },
        { icon: 'help-circle-outline', label: 'Aide & Support', color: '#EC4899' },
        { icon: 'information-circle-outline', label: 'À propos', value: 'v1.0.0', color: '#9CA3AF' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient
          colors={['#7C3AED22', '#EC4899011', colors.background]}
          style={styles.hero}
        >
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.avatar}>
              <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="ribbon-outline" size={14} color={colors.primaryLight} />
            <Text style={styles.levelText}>{levelLabel}</Text>
          </View>

          {goals.length > 0 && (
            <View style={styles.goalsRow}>
              {goals.slice(0, 3).map((g) => (
                <View key={g} style={styles.goalTag}>
                  <Text style={styles.goalTagText}>{goalLabels[g] || g}</Text>
                </View>
              ))}
              {goals.length > 3 && (
                <View style={styles.goalTag}>
                  <Text style={styles.goalTagText}>+{goals.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={`${streak}`} label="Jours de suite" emoji="🔥" />
          <StatCard value={`${totalMinutes}'`} label="Minutes d'étude" emoji="⏱️" />
          <StatCard value={`${earnedAchievements}`} label="Succès" emoji="🏆" />
          <StatCard value={`${completedCourses}`} label="Cours finis" emoji="✅" />
        </View>

        {/* Premium Banner */}
        <TouchableOpacity style={styles.premiumBanner}>
          <LinearGradient
            colors={['#F59E0B', '#F97316']}
            style={styles.premiumGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View>
              <Text style={styles.premiumTitle}>✨ Passer à Gleam Pro</Text>
              <Text style={styles.premiumDesc}>
                Accès illimité à tous les cours, scénarios IA et coach personnel
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Succès récents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.filter((a) => a.earned).map((a) => (
              <View key={a.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{a.icon}</Text>
                <Text style={styles.achievementTitle}>{a.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu */}
        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.menuSectionLabel}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                >
                  <View style={[styles.menuItemIcon, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <View style={styles.menuItemRight}>
                    {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Gleam Intelligence Sociale · v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, emoji }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 24, paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary + '22',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  levelText: { fontSize: 13, fontWeight: '700', color: colors.primaryLight },
  goalsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  goalTag: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalTagText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  premiumBanner: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  premiumDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, maxWidth: 240 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 14 },
  achievementsScroll: { marginHorizontal: -20 },
  achievementCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 0,
    width: 90,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  achievementIcon: { fontSize: 28, marginBottom: 6 },
  achievementTitle: { fontSize: 11, fontWeight: '700', color: colors.text, textAlign: 'center' },
  menuSection: { paddingHorizontal: 20, paddingTop: 20 },
  menuSectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuItemLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuItemValue: { fontSize: 13, color: colors.textMuted },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    gap: 10,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error + '33',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.error },
  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 16 },
});
