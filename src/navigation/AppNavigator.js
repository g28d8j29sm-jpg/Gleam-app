import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import LessonScreen from '../screens/LessonScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoursesList" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

const tabConfig = {
  Accueil: { icon: 'home', label: 'Accueil' },
  Cours: { icon: 'book', label: 'Cours' },
  Pratique: { icon: 'chatbubbles', label: 'Pratiquer' },
  Progrès: { icon: 'bar-chart', label: 'Progrès' },
  Profile: { icon: 'person', label: 'Profil' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primaryLight,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => {
            const cfg = tabConfig[route.name];
            const iconName = focused ? cfg.icon : `${cfg.icon}-outline`;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarLabel: ({ focused, color }) => {
            const cfg = tabConfig[route.name];
            return <Text style={[styles.tabLabel, { color }]}>{cfg.label}</Text>;
          },
          tabBarBackground: () => <View style={styles.tabBackground} />,
        })}
      >
        <Tab.Screen name="Accueil" component={HomeStack} />
        <Tab.Screen name="Cours" component={CoursesStack} />
        <Tab.Screen
          name="Pratique"
          component={PracticeScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <View style={[styles.practiceTabIcon, focused && styles.practiceTabIconActive]}>
                <Ionicons name="chatbubbles" size={22} color={focused ? '#fff' : color} />
              </View>
            ),
          }}
        />
        <Tab.Screen name="Progrès" component={ProgressScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A35',
    borderTopColor: '#2D2D5E',
    borderTopWidth: 1,
    height: 84,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBackground: {
    flex: 1,
    backgroundColor: '#1A1A35',
  },
  practiceTabIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  practiceTabIconActive: {
    backgroundColor: colors.primary,
  },
});
