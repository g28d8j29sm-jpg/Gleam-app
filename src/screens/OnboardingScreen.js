import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const goals = [
  { id: 'communication', label: 'Mieux communiquer', icon: '💬' },
  { id: 'emotional', label: 'Gérer mes émotions', icon: '❤️' },
  { id: 'leadership', label: 'Développer mon leadership', icon: '👑' },
  { id: 'networking', label: 'Élargir mon réseau', icon: '🤝' },
  { id: 'speaking', label: 'Parler en public', icon: '🎤' },
  { id: 'interview', label: 'Réussir mes entretiens', icon: '💼' },
];

const levels = [
  { id: 'beginner', label: 'Débutant', desc: 'Je commence tout juste', icon: '🌱' },
  { id: 'intermediate', label: 'Intermédiaire', desc: 'J\'ai quelques bases', icon: '🌿' },
  { id: 'advanced', label: 'Avancé', desc: 'Je veux perfectionner', icon: '🌳' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalSteps = 4;

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 150);
  };

  const nextStep = () => {
    if (step < totalSteps - 1) animateTransition(() => setStep((s) => s + 1));
  };

  const prevStep = () => {
    if (step > 0) animateTransition(() => setStep((s) => s - 1));
  };

  const toggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Apprenant',
      goals: selectedGoals,
      level: selectedLevel,
      streak: 0,
      totalMinutes: 0,
      coursesCompleted: 0,
    });
  };

  const canProceed = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return selectedLevel !== null;
    if (step === 3) return name.trim().length > 0;
    return true;
  };

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A35', '#0F0F23']} style={styles.container}>
      {/* Progress dots */}
      {step > 0 && (
        <View style={styles.progressRow}>
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.dots}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
            ))}
          </View>
        </View>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && <WelcomeStep onNext={nextStep} />}
        {step === 1 && (
          <GoalStep
            goals={goals}
            selected={selectedGoals}
            onToggle={toggleGoal}
            onNext={nextStep}
            canProceed={canProceed()}
          />
        )}
        {step === 2 && (
          <LevelStep
            levels={levels}
            selected={selectedLevel}
            onSelect={setSelectedLevel}
            onNext={nextStep}
            canProceed={canProceed()}
          />
        )}
        {step === 3 && (
          <NameStep name={name} onChange={setName} onFinish={finish} canProceed={canProceed()} />
        )}
      </Animated.View>
    </LinearGradient>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.logoContainer}>
        <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.logoGradient}>
          <Text style={styles.logoEmoji}>✨</Text>
        </LinearGradient>
        <Text style={styles.logoText}>Gleam</Text>
        <Text style={styles.logoSubtitle}>Intelligence Sociale</Text>
      </View>

      <Text style={styles.welcomeTitle}>
        Développez votre{'\n'}
        <Text style={styles.highlight}>intelligence sociale</Text>
      </Text>

      <Text style={styles.welcomeDesc}>
        Des leçons interactives, des simulations par IA et des exercices pratiques
        conçus par des experts en communication et psychologie.
      </Text>

      <View style={styles.featureList}>
        {[
          { icon: '🧠', text: 'Cours basés sur la science' },
          { icon: '🤖', text: 'Pratique avec l\'IA' },
          { icon: '📈', text: 'Suivi de vos progrès' },
        ].map((f) => (
          <View key={f.text} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onNext} style={styles.primaryBtn}>
        <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.primaryBtnText}>Commencer gratuitement</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function GoalStep({ goals, selected, onToggle, onNext, canProceed }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Que voulez-vous améliorer ?</Text>
      <Text style={styles.stepSubtitle}>Sélectionnez un ou plusieurs objectifs</Text>

      <View style={styles.goalGrid}>
        {goals.map((g) => {
          const active = selected.includes(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalCard, active && styles.goalCardActive]}
              onPress={() => onToggle(g.id)}
            >
              {active && (
                <View style={styles.checkMark}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              <Text style={styles.goalIcon}>{g.icon}</Text>
              <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>{g.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
        disabled={!canProceed}
      >
        <LinearGradient
          colors={canProceed ? ['#7C3AED', '#EC4899'] : ['#333', '#444']}
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryBtnText}>Continuer</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function LevelStep({ levels, selected, onSelect, onNext, canProceed }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quel est votre niveau ?</Text>
      <Text style={styles.stepSubtitle}>Nous adapterons votre parcours</Text>

      <View style={styles.levelList}>
        {levels.map((l) => {
          const active = selected === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              style={[styles.levelCard, active && styles.levelCardActive]}
              onPress={() => onSelect(l.id)}
            >
              <Text style={styles.levelIcon}>{l.icon}</Text>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelLabel, active && styles.levelLabelActive]}>{l.label}</Text>
                <Text style={styles.levelDesc}>{l.desc}</Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
        disabled={!canProceed}
      >
        <LinearGradient
          colors={canProceed ? ['#7C3AED', '#EC4899'] : ['#333', '#444']}
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryBtnText}>Continuer</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function NameStep({ name, onChange, onFinish, canProceed }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Comment vous appelez-vous ?</Text>
      <Text style={styles.stepSubtitle}>Nous personnaliserons votre expérience</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Votre prénom"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={onChange}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={canProceed ? onFinish : undefined}
        />
      </View>

      <TouchableOpacity
        onPress={onFinish}
        style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
        disabled={!canProceed}
      >
        <LinearGradient
          colors={canProceed ? ['#7C3AED', '#EC4899'] : ['#333', '#444']}
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryBtnText}>C'est parti ! 🚀</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  dots: { flexDirection: 'row', gap: 8, marginLeft: 'auto', marginRight: 'auto' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  content: { flex: 1 },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  logoText: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  logoSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
  },
  highlight: { color: colors.primaryLight },
  welcomeDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: { gap: 12, marginBottom: 40 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 22 },
  featureText: { fontSize: 15, color: colors.textSecondary },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  stepSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 32 },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  goalCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  goalCardActive: { borderColor: colors.primary, backgroundColor: '#1E1040' },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: { fontSize: 32, marginBottom: 10 },
  goalLabel: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  goalLabelActive: { color: colors.text },
  levelList: { gap: 14, marginBottom: 32 },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 16,
  },
  levelCardActive: { borderColor: colors.primary, backgroundColor: '#1E1040' },
  levelIcon: { fontSize: 28 },
  levelInfo: { flex: 1 },
  levelLabel: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  levelLabelActive: { color: colors.text },
  levelDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: colors.text,
  },
  primaryBtn: { borderRadius: 16, overflow: 'hidden' },
  primaryBtnDisabled: { opacity: 0.5 },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
