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

function getRandomResponse(scenario, messageCount) {
  const allResponses = [
    ...Object.values(scenario.responses).flat(),
  ];
  const idx = messageCount % allResponses.length;
  return allResponses[idx] || 'Je vous écoute. Pouvez-vous développer davantage ?';
}

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
          <View style={[styles.difficultyBadge, { backgroundColor: scenario.color + '22' }]}>
            <Text style={[styles.difficultyText, { color: scenario.color }]}>{scenario.difficulty}</Text>
          </View>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.durationText}>{scenario.duration}</Text>
        </View>
      </View>
      <Ionicons name="play-circle" size={32} color={scenario.color} />
    </TouchableOpacity>
  );
}

export default function PracticeScreen() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setMessages([
      {
        id: 1,
        role: 'ai',
        text: scenario.initialMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const aiResponse = getRandomResponse(activeScenario, messages.length);
      const aiMsg = {
        id: messages.length + 2,
        role: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((m) => [...m, aiMsg]);
      setIsTyping(false);
    }, delay);
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

          <View style={styles.aiInfo}>
            <LinearGradient colors={['#10B98133', '#06B6D433']} style={styles.aiInfoGradient}>
              <Text style={styles.aiInfoIcon}>🤖</Text>
              <View style={styles.aiInfoBody}>
                <Text style={styles.aiInfoTitle}>Coaching IA en temps réel</Text>
                <Text style={styles.aiInfoText}>
                  Pratiquez dans des scénarios réalistes et recevez un retour immédiat
                  sur votre style de communication.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisissez un scénario</Text>
            {practiceScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onStart={() => startScenario(scenario)}
              />
            ))}
          </View>

          <View style={styles.tips}>
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
        keyboardVerticalOffset={0}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveScenario(null)} style={styles.chatBackBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.chatAvatar, { backgroundColor: activeScenario.color + '33' }]}>
            <Text style={styles.chatAvatarText}>{activeScenario.icon}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatTitle}>{activeScenario.title}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>IA active</Text>
            </View>
          </View>
          <View style={[styles.difficultyBadgeSm, { backgroundColor: activeScenario.color + '22' }]}>
            <Text style={[styles.difficultyTextSm, { color: activeScenario.color }]}>
              {activeScenario.difficulty}
            </Text>
          </View>
        </View>

        {/* Tips banner */}
        {activeScenario.tips && (
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
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}
            >
              {msg.role === 'ai' && (
                <View style={[styles.msgAvatar, { backgroundColor: activeScenario.color + '33' }]}>
                  <Text style={{ fontSize: 14 }}>{activeScenario.icon}</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.role === 'ai' ? styles.bubbleAi : styles.bubbleUser,
                ]}
              >
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
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Écrivez votre réponse..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
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
  aiInfo: { marginHorizontal: 20, marginVertical: 16, borderRadius: 16, overflow: 'hidden' },
  aiInfoGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  aiInfoIcon: { fontSize: 36 },
  aiInfoBody: { flex: 1 },
  aiInfoTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  aiInfoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
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
  scenarioMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  difficultyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  difficultyText: { fontSize: 11, fontWeight: '700' },
  durationText: { fontSize: 11, color: colors.textMuted },
  tips: {
    marginHorizontal: 20,
    marginTop: 24,
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
  // Chat styles
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
  chatAvatarText: { fontSize: 18 },
  chatHeaderInfo: { flex: 1 },
  chatTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  onlineText: { fontSize: 11, color: colors.success, fontWeight: '600' },
  difficultyBadgeSm: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  difficultyTextSm: { fontSize: 10, fontWeight: '700' },
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
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
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
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
