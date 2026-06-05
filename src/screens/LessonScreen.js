import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const lessonContent = {
  video: {
    icon: '🎬',
    label: 'Leçon vidéo',
    color: '#06B6D4',
    content: [
      { type: 'intro', text: 'Dans cette leçon, vous allez découvrir des concepts clés à travers une vidéo interactive.' },
      { type: 'key_point', emoji: '💡', title: 'Point clé 1', text: 'La communication non-verbale représente jusqu\'à 93% de l\'impact de votre message selon Albert Mehrabian.' },
      { type: 'key_point', emoji: '🧠', title: 'Point clé 2', text: 'Les expressions faciales universelles (joie, tristesse, colère, peur, surprise, dégoût) sont les mêmes dans toutes les cultures.' },
      { type: 'key_point', emoji: '💪', title: 'Point clé 3', text: 'Une posture ouverte et détendue augmente votre niveau de confiance et influence positivement votre interlocuteur.' },
      { type: 'exercise', title: 'Exercice pratique', text: 'Devant un miroir, entraînez-vous à maintenir un contact visuel pendant 5 secondes, souriez naturellement, et observez votre posture.' },
    ],
  },
  quiz: {
    icon: '❓',
    label: 'Quiz interactif',
    color: '#F59E0B',
    questions: [
      {
        question: 'Selon les recherches, quelle proportion de la communication est non-verbale ?',
        options: ['20%', '55-93%', '10%', '75%'],
        correct: 1,
        explanation: 'Selon Mehrabian, jusqu\'à 93% de l\'impact émotionnel d\'un message passe par le non-verbal (55% visuel, 38% vocal, 7% verbal).',
      },
      {
        question: 'Lequel de ces éléments fait partie du langage non-verbal ?',
        options: ['Le choix des mots', 'Le ton de la voix', 'La grammaire', 'Le vocabulaire'],
        correct: 1,
        explanation: 'Le ton et l\'intonation de la voix (communication paraverbale) font partie intégrante du non-verbal.',
      },
      {
        question: 'Quel geste signifie généralement l\'ouverture et la confiance ?',
        options: ['Bras croisés', 'Mains dans les poches', 'Paumes visibles ouvertes', 'Regard fuyant'],
        correct: 2,
        explanation: 'Les paumes visibles et ouvertes signalent l\'honnêteté, l\'ouverture et la confiance à votre interlocuteur.',
      },
    ],
  },
  practice: {
    icon: '🤖',
    label: 'Pratique avec l\'IA',
    color: '#10B981',
  },
};

export default function LessonScreen({ route, navigation }) {
  const { lesson, course } = route.params;
  const config = lessonContent[lesson.type] || lessonContent.video;
  const [quizState, setQuizState] = useState({ step: 0, selected: null, showResult: false, score: 0 });

  if (lesson.type === 'practice') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.lessonType}>Pratique IA</Text>
            <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
          </View>
        </View>
        <View style={styles.redirectContainer}>
          <Text style={styles.redirectEmoji}>🤖</Text>
          <Text style={styles.redirectTitle}>Session de pratique interactive</Text>
          <Text style={styles.redirectDesc}>
            Entraînez-vous dans des simulations réalistes guidées par l'IA pour ancrer vos apprentissages.
          </Text>
          <TouchableOpacity
            style={styles.redirectBtn}
            onPress={() => navigation.navigate('Pratique')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.redirectGradient}>
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
              <Text style={styles.redirectBtnText}>Aller à la pratique</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.redirectBack}>
            <Text style={styles.redirectBackText}>Retour au cours</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (lesson.type === 'quiz' && config.questions) {
    const q = config.questions[quizState.step];
    const done = quizState.step >= config.questions.length;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.lessonType}>Quiz</Text>
            <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
          </View>
          {!done && (
            <Text style={styles.quizCounter}>
              {quizState.step + 1}/{config.questions.length}
            </Text>
          )}
        </View>

        <ScrollView style={styles.content}>
          {done ? (
            <View style={styles.quizResult}>
              <Text style={styles.quizResultEmoji}>
                {quizState.score === config.questions.length ? '🏆' : quizState.score >= config.questions.length / 2 ? '👍' : '💪'}
              </Text>
              <Text style={styles.quizResultTitle}>
                {quizState.score === config.questions.length ? 'Parfait !' : 'Bien joué !'}
              </Text>
              <Text style={styles.quizResultScore}>
                {quizState.score}/{config.questions.length} bonnes réponses
              </Text>
              <Text style={styles.quizResultDesc}>
                {quizState.score === config.questions.length
                  ? 'Excellent travail ! Vous maîtrisez parfaitement ce sujet.'
                  : 'Continuez à pratiquer pour améliorer vos résultats.'}
              </Text>
              <TouchableOpacity
                style={styles.quizDoneBtn}
                onPress={() => navigation.goBack()}
              >
                <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.quizDoneGradient}>
                  <Text style={styles.quizDoneText}>Retour au cours</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.quizQuestion}>
              <View style={styles.quizProgressBar}>
                <View
                  style={[
                    styles.quizProgressFill,
                    { width: `${((quizState.step) / config.questions.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.questionText}>{q.question}</Text>
              <View style={styles.options}>
                {q.options.map((opt, idx) => {
                  const isSelected = quizState.selected === idx;
                  const isCorrect = idx === q.correct;
                  const showAnswer = quizState.showResult;

                  let bgColor = colors.surface;
                  let borderColor = colors.border;
                  if (showAnswer && isCorrect) { bgColor = '#10B98122'; borderColor = '#10B981'; }
                  if (showAnswer && isSelected && !isCorrect) { bgColor = '#EF444422'; borderColor = '#EF4444'; }
                  if (!showAnswer && isSelected) { bgColor = '#7C3AED22'; borderColor = colors.primary; }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                      onPress={() => {
                        if (!quizState.showResult) {
                          setQuizState((s) => ({ ...s, selected: idx, showResult: true }));
                        }
                      }}
                      disabled={quizState.showResult}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                      {showAnswer && isCorrect && (
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {quizState.showResult && (
                <View style={styles.explanation}>
                  <Text style={styles.explanationTitle}>💡 Explication</Text>
                  <Text style={styles.explanationText}>{q.explanation}</Text>
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={() => {
                      const isCorrect = quizState.selected === q.correct;
                      setQuizState((s) => ({
                        step: s.step + 1,
                        selected: null,
                        showResult: false,
                        score: s.score + (isCorrect ? 1 : 0),
                      }));
                    }}
                  >
                    <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.nextGradient}>
                      <Text style={styles.nextText}>
                        {quizState.step < config.questions.length - 1 ? 'Question suivante →' : 'Voir les résultats'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Video lesson
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.lessonType, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <Text style={styles.duration}>{lesson.duration}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video placeholder */}
        <View style={[styles.videoPlaceholder, { backgroundColor: config.color + '22' }]}>
          <View style={[styles.playBtn, { backgroundColor: config.color }]}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
          <Text style={styles.videoTitle}>{lesson.title}</Text>
          <Text style={[styles.videoDuration, { color: config.color }]}>{lesson.duration}</Text>
        </View>

        {/* Content */}
        <View style={styles.lessonContent}>
          {config.content?.map((block, idx) => {
            if (block.type === 'intro') {
              return (
                <Text key={idx} style={styles.introText}>{block.text}</Text>
              );
            }
            if (block.type === 'key_point') {
              return (
                <View key={idx} style={styles.keyPoint}>
                  <Text style={styles.keyPointEmoji}>{block.emoji}</Text>
                  <View style={styles.keyPointBody}>
                    <Text style={styles.keyPointTitle}>{block.title}</Text>
                    <Text style={styles.keyPointText}>{block.text}</Text>
                  </View>
                </View>
              );
            }
            if (block.type === 'exercise') {
              return (
                <View key={idx} style={styles.exerciseCard}>
                  <Text style={styles.exerciseTitle}>✍️ {block.title}</Text>
                  <Text style={styles.exerciseText}>{block.text}</Text>
                </View>
              );
            }
            return null;
          })}
        </View>

        <TouchableOpacity style={styles.completeBtn} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={[config.color, config.color + 'AA']}
            style={styles.completeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.completeText}>Marquer comme terminé</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  lessonType: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  duration: { fontSize: 12, color: colors.textMuted },
  quizCounter: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  content: { flex: 1 },
  videoPlaceholder: {
    height: 200,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  videoDuration: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  lessonContent: { paddingHorizontal: 20, paddingTop: 24 },
  introText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 24 },
  keyPoint: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyPointEmoji: { fontSize: 24 },
  keyPointBody: { flex: 1 },
  keyPointTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  keyPointText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  exerciseCard: {
    backgroundColor: '#7C3AED11',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7C3AED33',
  },
  exerciseTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryLight, marginBottom: 8 },
  exerciseText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  completeBtn: { marginHorizontal: 20, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  completeText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Quiz styles
  quizProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 28,
    marginHorizontal: 20,
    marginTop: 20,
  },
  quizProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  quizQuestion: { paddingBottom: 20 },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  options: { paddingHorizontal: 20, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
  },
  optionText: { fontSize: 15, color: colors.text, flex: 1 },
  explanation: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explanationTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  explanationText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 16 },
  nextBtn: { borderRadius: 12, overflow: 'hidden' },
  nextGradient: { paddingVertical: 14, alignItems: 'center' },
  nextText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  quizResult: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  quizResultEmoji: { fontSize: 72, marginBottom: 16 },
  quizResultTitle: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 },
  quizResultScore: { fontSize: 20, fontWeight: '700', color: colors.primaryLight, marginBottom: 16 },
  quizResultDesc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  quizDoneBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  quizDoneGradient: { paddingVertical: 16, alignItems: 'center' },
  quizDoneText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Redirect styles
  redirectContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  redirectEmoji: { fontSize: 72, marginBottom: 20 },
  redirectTitle: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 },
  redirectDesc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  redirectBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  redirectGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  redirectBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  redirectBack: { paddingVertical: 12 },
  redirectBackText: { fontSize: 14, color: colors.textSecondary },
});
