/*
 * Supabase — Auth & sync cloud
 *
 * Schema SQL à exécuter dans votre projet Supabase :
 *
 * -- Profils utilisateurs
 * create table profiles (
 *   id uuid references auth.users primary key,
 *   name text,
 *   goals text[],
 *   level text,
 *   xp integer default 0,
 *   streak integer default 0,
 *   last_activity date,
 *   created_at timestamptz default now()
 * );
 *
 * -- Progression par cours
 * create table course_progress (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users,
 *   course_id integer,
 *   completed_lessons integer[],
 *   percentage integer default 0,
 *   updated_at timestamptz default now()
 * );
 *
 * -- Succès obtenus
 * create table user_achievements (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users,
 *   achievement_id integer,
 *   earned_at timestamptz default now()
 * );
 *
 * -- RLS policies (sécurité)
 * alter table profiles enable row level security;
 * alter table course_progress enable row level security;
 * alter table user_achievements enable row level security;
 *
 * create policy "Users can manage own data" on profiles
 *   for all using (auth.uid() = id);
 * create policy "Users can manage own progress" on course_progress
 *   for all using (auth.uid() = user_id);
 * create policy "Users can manage own achievements" on user_achievements
 *   for all using (auth.uid() = user_id);
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () =>
  !!supabaseUrl && !!supabaseAnonKey &&
  supabaseUrl !== 'https://xxxxx.supabase.co';

let _client = null;

function getClient() {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

export const supabase = {
  get client() {
    return getClient();
  },

  async signUp(email, password, name) {
    const client = getClient();
    if (!client) return { error: 'Supabase non configuré' };
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await client.from('profiles').insert({
        id: data.user.id,
        name,
        goals: [],
        xp: 0,
        streak: 0,
      });
    }
    return { user: data.user };
  },

  async signIn(email, password) {
    const client = getClient();
    if (!client) return { error: 'Supabase non configuré' };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { user: data.user, session: data.session };
  },

  async signOut() {
    const client = getClient();
    if (!client) return;
    await client.auth.signOut();
  },

  async getSession() {
    const client = getClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async getProfile(userId) {
    const client = getClient();
    if (!client) return null;
    const { data } = await client.from('profiles').select('*').eq('id', userId).single();
    return data;
  },

  async updateProfile(userId, updates) {
    const client = getClient();
    if (!client) return;
    await client.from('profiles').update(updates).eq('id', userId);
  },

  async syncProgress(userId, courseId, completedLessons, percentage) {
    const client = getClient();
    if (!client) return;
    await client.from('course_progress').upsert(
      { user_id: userId, course_id: courseId, completed_lessons: completedLessons, percentage },
      { onConflict: 'user_id,course_id' }
    );
  },

  async loadProgress(userId) {
    const client = getClient();
    if (!client) return [];
    const { data } = await client
      .from('course_progress')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  },
};
