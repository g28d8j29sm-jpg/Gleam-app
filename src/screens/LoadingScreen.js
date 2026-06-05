import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function LoadingScreen() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A35', '#0F0F23']} style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.logo}>
          <Text style={styles.logoEmoji}>✨</Text>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.name}>Gleam</Text>
      <Text style={styles.tagline}>Intelligence Sociale</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: { fontSize: 46 },
  name: { fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
});
