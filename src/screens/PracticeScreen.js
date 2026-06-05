import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { practiceScenarios } from '../data/courses';
import { getAIResponse, isAIEnabled } from '../services/claudeAI';
import { useApp } from '../context/AppContext';
import { XP_REWARDS } from '../services/storage';

function ScenarioCard({ scenario, onStart }) {
  return (
    <TouchableOpacity style={styles.scenarioCard} onPress={onStart} activeOpacity={0.85}>
      <View style={[styles.scenarioIconBg, { backgroundColor: scenario.color + '22' }]}>
        <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
      </View>
      <View style={styles.scenarioInfo}>
        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
        <Text style={styles.scenarioDesc} numberOfLines={2}>{scenario.description}</Text>
        <View style={styles.scenarioMeta}>
          <View style={[styles.diffBadge, { backgroundColor: scenario.color + '22' }]}>
            <Text style={[styles.diffText, { color: scenario.color }]}>{scenario.difficulty}</Text>
          </View>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.durationText}>{scenario.duration}</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{XP_REWARDS.LESSON_PRACTICE} XP</Text>
          </View>
        </View>
      </View>
      <Ionicons name="play-circle" size={32} color={scenario.color} />
    </TouchableOpacity>
  );
}

export default function PracticeScreen() {
  const { addXP } = useApp();
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(false);
  const scrollRef = useRef(null);

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setSessionDone(false);
    setXpEarned(false);
    setMessages([
      {
        id: 1,
        role: 'ai',
        text: scenario.initialMessage,
        time: now(),
      },
    ]);
  };

  const now = () =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg = { id: messages.length + 1, role: 'user', text: userText, time: now() };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const aiText = await getAIResponse(activeScenario, updatedMessages);
      const aiMsg = { id: updatedMessages.length + 1, role: 'ai', text: aiText, time: now() };
      setMessages((m) => [...m, aiMsg]);

      // Award XP after 5+ messages
      if (updatedMessages.length >= 5 && !xpEarned) {
        setXpEarned(true);
        await addXP(XP_REWARDS.LESSON_PRACTICE, 'pratique IA');
      }

      // End session after 10 exchanges
      if (updatedMessages.filter((m) => m.role === 'user').length >= 6) {
        setSessionDone(true);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { id: m.length + 1, role: 'ai', text: 'Désolé, une erreur est survenue.', time: now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  if (!activeScenario) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Pratiquer</Text>
            <Text style={styles.subtitle}>Simulez des situations réelles avec l'IA</Text>
          </View>

          {/* AI Status Banner */}
          <View style={[styles.aiBanner, { borderColor: isAIEnabled() ? '#10B98133' : '#F59E0B33' }]}>
            <View style={[styles.aiDot, { backgroundColor: isAIEnabled() ? '#10B981' : '#F59E0B' }]} />
            <View style={styles.aiBannerBody}>
              <Text style={styles.aiBannerTitle}>
                {isAIEnabled() ? '🤖 IA Claude connectée' : '⚡ Mode simulation activé'}
              </Text>
              <Text style={styles.aiBannerText}>
                {isAIEnabled()
                  ? 'Conversations authentiques avec Claude Haiku'
                  : 'Ajoutez EXPO_PUBLIC_CLAUDE_API_KEY pour activer l\'IA réelle'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisissez un scénario</Text>
            {practiceScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} onStart={() => startScenario(scenario)} />
            ))}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Conseils pour progresser</Text>
            {[
              'Soyez aussi naturel(le) que possible — c\'est un espace sûr',
              'Relisez les points clés de vos cours avant de pratiquer',
              'Essayez plusieurs approches pour une même situation',
              'Concentrez-vous sur l\'empathie et l\'écoute active',
            ].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveScenario(null)} style={styles.chatBackBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.chatAvatar, { backgroundColor: activeScenario.color + '33' }]}>
            <Text style={{ fontSize: 18 }}>{activeScenario.icon}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatTitle}>{activeScenario.title}</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: isAIEnabled() ? '#10B981' : '#F59E0B' }]} />
              <Text style={[styles.onlineText, { color: isAIEnabled() ? '#10B981' : '#F59E0B' }]}>
                {isAIEnabled() ? 'Claude IA' : 'Simulation'}
              </Text>
            </View>
          </View>
          {xpEarned && (
            <View style={styles.xpEarnedBadge}>
              <Text style={styles.xpEarnedText}>+{XP_REWARDS.LESSON_PRACTICE} XP ✓</Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tipsBanner}
          contentContainerStyle={styles.tipsBannerContent}
        >
          {activeScenario.tips.map((tip, i) => (
            <View key={i} style={styles.tipChip}>
              <Text style={styles.tipChipText}>💡 {tip}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'ai' && (
                <View style={[styles.msgAvatar, { backgroundColor: activeScenario.color + '33' }]}>
                  <Text style={{ fontSize: 14 }}>{activeScenario.icon}</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'ai' ? styles.bubbleAi : styles.bubbleUser]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
                <Text style={[styles.bubbleTime, msg.role === 'user' && styles.bubbleTimeUser]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={styles.msgRow}>
              <View style={[styles.msgAvatar, { backgroundColor: activeScenario.color + '33' }]}>
                <Text style={{ fontSize: 14 }}>{activeScenario.icon}</Text>
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>En train d'écrire...</Text>
              </View>
            </View>
          )}

          {/* Session end */}
          {sessionDone && (
            <View style={styles.sessionEnd}>
              <Text style={styles.sessionEndEmoji}>🎉</Text>
              <Text style={styles.sessionEndTitle}>Session terminée !</Text>
              <Text style={styles.sessionEndText}>
                Excellente pratique. Vous avez gagné {XP_REWARDS.LESSON_PRACTICE} XP.
              </Text>
              <TouchableOpacity
                style={styles.sessionEndBtn}
                onPress={() => setActiveScenario(null)}
              >
                <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.sessionEndGradient}>
                  <Text style={styles.sessionEndBtnText}>Choisir un nouveau scénario</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        {!sessionDone && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Écrivez votre réponse..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() ? activeScenario.color : colors.border },
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || isTyping}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  aiDot: { width: 10, height: 10, borderRadius: 5 },
  aiBannerBody: { flex: 1 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  aiBannerText: { fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 14 },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  scenarioIconBg: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  scenarioIcon: { fontSize: 26 },
  scenarioInfo: { flex: 1 },
  scenarioTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  scenarioDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  scenarioMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  diffBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  diffText: { fontSize: 11, fontWeight: '700' },
  durationText: { fontSize: 11, color: colors.textMuted },
  xpBadge: {
    backgroundColor: '#7C3AED22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#7C3AED44',
  },
  xpText: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  tipsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 },
  tipText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 19 },
  // Chat
  chatContainer: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  chatBackBtn: { padding: 4 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatHeaderInfo: { flex: 1 },
  chatTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 11, fontWeight: '600' },
  xpEarnedBadge: {
    backgroundColor: '#7C3AED22',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#7C3AED44',
  },
  xpEarnedText: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  tipsBanner: { maxHeight: 46, borderBottomWidth: 1, borderBottomColor: colors.border },
  tipsBannerContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tipChip: {
    backgroundColor: '#7C3AED22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#7C3AED44',
  },
  tipChipText: { fontSize: 11, color: colors.primaryLight, fontWeight: '500' },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAi: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)' },
  typingBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingText: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  sessionEnd: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionEndEmoji: { fontSize: 48, marginBottom: 12 },
  sessionEndTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  sessionEndText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  sessionEndBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  sessionEndGradient: { paddingVertical: 14, alignItems: 'center' },
  sessionEndBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
