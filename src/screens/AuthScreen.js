import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabase';

export default function AuthScreen({ onSkip }) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    email.includes('@') &&
    password.length >= 6 &&
    (mode === 'login' || name.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      const result =
        mode === 'login'
          ? await signIn(email, password)
          : await signUp(email, password, name.trim());
      if (result.error) setError(result.error);
    } catch (e) {
      setError('Une erreur est survenue. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#0F0F23', '#1A1A35', '#0F0F23']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoRow}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.logoGradient}>
              <Text style={styles.logoEmoji}>✨</Text>
            </LinearGradient>
            <Text style={styles.logoText}>Gleam</Text>
          </View>

          <Text style={styles.title}>
            {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Connectez-vous pour retrouver votre progression'
              : 'Synchronisez vos données sur tous vos appareils'}
          </Text>

          {/* Cloud sync badge */}
          <View style={styles.badge}>
            <Ionicons name="cloud-done-outline" size={16} color={colors.accentGreen} />
            <Text style={styles.badgeText}>Sync cloud sécurisée via Supabase</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <InputField
                icon="person-outline"
                placeholder="Votre prénom"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <InputField
              icon="mail-outline"
              placeholder="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordRow}>
              <InputField
                icon="lock-closed-outline"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                containerStyle={{ flex: 1 }}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              <LinearGradient
                colors={canSubmit ? ['#7C3AED', '#EC4899'] : ['#333', '#444']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Switch mode */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            <Text style={styles.switchText}>
              {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipText}>Continuer sans compte →</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Vos données sont stockées localement. Un compte permet la synchronisation
            entre appareils.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function InputField({ icon, containerStyle, ...props }) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 },
  logoGradient: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 28, fontWeight: '800', color: colors.text },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B98111',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#10B98133',
  },
  badgeText: { fontSize: 13, color: colors.accentGreen, fontWeight: '600' },
  form: { gap: 12, marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: colors.text },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    width: 52,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF444422',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF444444',
  },
  errorText: { fontSize: 13, color: colors.error, flex: 1 },
  submitBtn: { borderRadius: 16, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.6 },
  submitGradient: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  switchRow: { alignItems: 'center', paddingVertical: 12 },
  switchText: { fontSize: 14, color: colors.textSecondary },
  switchLink: { color: colors.primaryLight, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
  },
});
