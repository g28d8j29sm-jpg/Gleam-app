export default {
  expo: {
    name: 'Gleam — Intelligence Sociale',
    slug: 'gleam-intelligence-sociale',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      backgroundColor: '#0F0F23',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.gleamlabs.intelligence-sociale',
      buildNumber: '1',
      infoPlist: {
        NSUserNotificationUsageDescription:
          'Gleam vous envoie des rappels quotidiens pour maintenir votre progression.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0F0F23',
      },
      package: 'com.gleamlabs.intelligence_sociale',
      versionCode: 1,
      permissions: ['RECEIVE_BOOT_COMPLETED', 'VIBRATE'],
    },
    web: {
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#7C3AED',
          sounds: [],
        },
      ],
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      claudeApiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
      eas: {
        projectId: 'gleam-intelligence-sociale',
      },
    },
  },
};
