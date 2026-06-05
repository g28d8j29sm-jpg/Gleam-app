import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { achievements, courses } from '../data/courses';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabase';
import { isAIEnabled } from '../services/claudeAI';
import { storage } from '../services/storage';

const goalLabels = {
  communication: 'Communication',
  emotional: 'Intelligence émotionnelle',
  leadership: 'Leadership',
  networking: 'Réseautage',
  speaking: 'Prise de parole',
  interview: 'Entretiens',
};

export default function ProfileScreen() {
  const {
    user, supabaseUser, xp, streak, level, earnedAchievements,
    settings, updateSettings, signOut,
  } = useApp();
  const name = user?.name || 'Apprenant';
  const goals = user?.goals || [];
  const levelLabel = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[user?.level] || 'Débutant';

  const earnedCount = earnedAchievements.length;
  const completedCourses = courses.filter((c) => c.progress === 100).length;

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Vos données locales seront conservées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Réinitialiser les données',
      'Toute votre progression sera supprimée. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            Alert.alert('Données réinitialisées', 'Redémarrez l\'application.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient colors={['#7C3AED22', '#EC489911', colors.background]} style={styles.hero}>
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.avatar}>
              <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
            </LinearGradient>
            <View style={[styles.levelDot, { backgroundColor: level.color }]}>
              <Text style={styles.levelDotText}>{level.icon}</Text>
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="ribbon-outline" size={14} color={colors.primaryLight} />
            <Text style={styles.levelText}>{level.name} · {levelLabel}</Text>
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
          <StatCard value={`${streak}`} label="Jours d'affilée" emoji="🔥" />
          <StatCard value={xp.toLocaleString('fr-FR')} label="XP total" emoji="⚡" />
          <StatCard value={`${earnedCount}`} label="Succès" emoji="🏆" />
          <StatCard value={`${completedCourses}`} label="Cours finis" emoji="✅" />
        </View>

        {/* Services Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services connectés</Text>
          <View style={styles.servicesCard}>
            <ServiceRow
              icon="🤖"
              name="IA Claude"
              status={isAIEnabled() ? 'Connectée' : 'Non configurée'}
              connected={isAIEnabled()}
              desc={isAIEnabled() ? 'Pratique conversationnelle réelle' : 'Ajoutez EXPO_PUBLIC_CLAUDE_API_KEY'}
            />
            <View style={styles.divider} />
            <ServiceRow
              icon="☁️"
              name="Supabase"
              status={supabaseUser ? `Connecté — ${supabaseUser.email}` : isSupabaseConfigured() ? 'Non connecté' : 'Non configuré'}
              connected={!!supabaseUser}
              desc={supabaseUser ? 'Sync cloud active' : 'Ajoutez EXPO_PUBLIC_SUPABASE_URL'}
            />
          </View>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity style={styles.premiumBanner}>
          <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.premiumGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View>
              <Text style={styles.premiumTitle}>✨ Passer à Gleam Pro</Text>
              <Text style={styles.premiumDesc}>Accès illimité à tous les cours, scénarios IA et coach personnel</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Succès récents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.filter((a) => earnedAchievements.includes(a.id)).map((a) => (
              <View key={a.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{a.icon}</Text>
                <Text style={styles.achievementTitle}>{a.title}</Text>
              </View>
            ))}
            {earnedAchievements.length === 0 && (
              <Text style={styles.noAchievements}>
                Terminez des leçons pour débloquer vos premiers succès !
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rappels quotidiens</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#7C3AED22' }]}>
                <Ionicons name="notifications-outline" size={18} color="#7C3AED" />
              </View>
              <Text style={styles.settingLabel}>Activer les rappels</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {settings.notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <View style={[styles.settingIcon, { backgroundColor: '#F59E0B22' }]}>
                    <Ionicons name="time-outline" size={18} color="#F59E0B" />
                  </View>
                  <Text style={styles.settingLabel}>Heure du rappel</Text>
                  <TouchableOpacity style={styles.timeSelector}>
                    <Text style={styles.timeSelectorText}>
                      {String(settings.reminderHour).padStart(2, '0')}:{String(settings.reminderMinute).padStart(2, '0')}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Account & More */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.settingsCard}>
            {isSupabaseConfigured() && !supabaseUser && (
              <>
                <SettingRow icon="person-add-outline" label="Créer un compte" color="#10B981" />
                <View style={styles.divider} />
                <SettingRow icon="log-in-outline" label="Se connecter" color="#06B6D4" />
                <View style={styles.divider} />
              </>
            )}
            {supabaseUser && (
              <>
                <SettingRow icon="cloud-upload-outline" label="Synchroniser avec le cloud" color="#10B981" />
                <View style={styles.divider} />
              </>
            )}
            <SettingRow icon="shield-checkmark-outline" label="Confidentialité" color="#8B5CF6" />
            <View style={styles.divider} />
            <SettingRow icon="help-circle-outline" label="Aide & Support" color="#EC4899" />
            <View style={styles.divider} />
            <SettingRow icon="information-circle-outline" label="À propos" value="v1.0.0" color={colors.textMuted} />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          {supabaseUser && (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.border, marginTop: 10 }]} onPress={handleResetData}>
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.logoutText, { color: colors.textMuted }]}>Réinitialiser mes données</Text>
          </TouchableOpacity>
        </View>

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

function ServiceRow({ icon, name, status, connected, desc }) {
  return (
    <View style={styles.serviceRow}>
      <Text style={styles.serviceIcon}>{icon}</Text>
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{name}</Text>
          <View style={[styles.serviceBadge, { backgroundColor: connected ? '#10B98122' : '#F59E0B22' }]}>
            <View style={[styles.serviceDot, { backgroundColor: connected ? '#10B981' : '#F59E0B' }]} />
            <Text style={[styles.serviceStatus, { color: connected ? '#10B981' : '#F59E0B' }]}>{status}</Text>
          </View>
        </View>
        <Text style={styles.serviceDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label, value, color }) {
  return (
    <TouchableOpacity style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  levelDot: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  levelDotText: { fontSize: 14 },
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
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
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
  statValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  servicesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  serviceIcon: { fontSize: 24, marginTop: 2 },
  serviceInfo: { flex: 1 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  serviceName: { fontSize: 14, fontWeight: '700', color: colors.text },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  serviceDot: { width: 6, height: 6, borderRadius: 3 },
  serviceStatus: { fontSize: 11, fontWeight: '700' },
  serviceDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
  premiumBanner: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  premiumGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  premiumDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, maxWidth: 240 },
  achievementCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    width: 90,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  achievementIcon: { fontSize: 28, marginBottom: 6 },
  achievementTitle: { fontSize: 11, fontWeight: '700', color: colors.text, textAlign: 'center' },
  noAchievements: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', paddingVertical: 12 },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 13, color: colors.textMuted },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  timeSelectorText: { fontSize: 14, fontWeight: '700', color: colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error + '33',
    gap: 10,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.error },
  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 20 },
});
