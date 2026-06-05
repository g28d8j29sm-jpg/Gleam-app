const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

function buildSystemPrompt(scenario) {
  return `Tu joues le rôle dans ce scénario de pratique en communication interpersonnelle.

Scénario : ${scenario.title}
Description : ${scenario.description}

Règles :
- Réponds UNIQUEMENT en français
- Reste dans le personnage tout au long de la conversation
- Sois naturel(le), réaliste et légèrement challengeant(e)
- Tes réponses doivent être courtes : 2-3 phrases maximum
- Adapte ton niveau d'exigence selon la qualité des réponses de l'utilisateur
- Si l'utilisateur répond bien, avance le scénario positivement
- Si la réponse est maladroite, pose des questions pour l'aider à reformuler
- Ne brise jamais le personnage pour donner des conseils directs — reste dans la simulation`;
}

function getFallbackResponse(scenario, messageCount) {
  const all = Object.values(scenario.responses || {}).flat();
  return all[messageCount % all.length] || 'Je vous écoute. Pouvez-vous développer davantage ?';
}

export async function getAIResponse(scenario, conversationHistory) {
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

  if (!apiKey || apiKey === 'sk-ant-...') {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));
    return getFallbackResponse(scenario, conversationHistory.length);
  }

  try {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text,
    }));

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: buildSystemPrompt(scenario),
        messages,
      }),
    });

    if (!response.ok) {
      console.warn('Claude API error:', response.status);
      return getFallbackResponse(scenario, conversationHistory.length);
    }

    const data = await response.json();
    return data.content?.[0]?.text || getFallbackResponse(scenario, conversationHistory.length);
  } catch (error) {
    console.warn('Claude API fetch error:', error);
    return getFallbackResponse(scenario, conversationHistory.length);
  }
}

export function isAIEnabled() {
  const key = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  return !!key && key !== 'sk-ant-...';
}
