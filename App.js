import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import AuthScreen from './src/screens/AuthScreen';
import { isSupabaseConfigured } from './src/services/supabase';

function RootNavigator() {
  const { loading, hasOnboarded, supabaseUser } = useApp();
  const [skippedAuth, setSkippedAuth] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!hasOnboarded) return <OnboardingScreen />;

  // Show auth only if Supabase is configured AND user is not logged in AND hasn't skipped
  if (isSupabaseConfigured() && !supabaseUser && !skippedAuth) {
    return <AuthScreen onSkip={() => setSkippedAuth(true)} />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
