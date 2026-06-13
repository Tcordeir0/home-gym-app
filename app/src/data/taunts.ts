// Frases prontas pra "cutucar" (zoação leve de família/amigos), por categoria.
// O texto inteiro (emoji + frase) viaja no campo da cutucada.

export interface TauntCat {
  key: string;
  label: string;
  emoji: string;
  phrases: string[];
}

export const TAUNTS: TauntCat[] = [
  {
    key: 'ranking', label: 'Pontuação', emoji: '🏆',
    phrases: [
      '😏 Tô passando a perna em você no ranking.',
      '📉 Teus pontos tão de férias? Bora subir.',
      '👑 Eu no topo da casa, você... aí embaixo.',
      '🐢 Tá devagar nesse ranking, hein.',
    ],
  },
  {
    key: 'treino', label: 'Treino', emoji: '🏋️',
    phrases: [
      '😴 Faltou treino hoje, dorminhoco?',
      '🛏️➡️🏋️ Sai da cama e vem treinar.',
      '💪 Tô te esperando pra puxar ferro.',
      '🔥 Bora que a sequência não se mantém sozinha.',
    ],
  },
  {
    key: 'peso', label: 'Peso', emoji: '⚖️',
    phrases: [
      '⚖️ A balança tá rindo de você, hein.',
      '🍔➡️💪 Bora secar essa marmita.',
      '📸 Cadê a foto de progresso? Tô esperando.',
    ],
  },
  {
    key: 'dieta', label: 'Dieta', emoji: '🍗',
    phrases: [
      '👀🍕 Vi você olhando pra pizza.',
      '🍗 Bateu a proteína hoje ou foi só desculpa?',
      '🍫 Esse docinho tava na dieta mesmo?',
    ],
  },
  {
    key: 'agua', label: 'Hidratação', emoji: '💧',
    phrases: [
      '💧 Bebe água, criatura!',
      '🚱 Teu corpo tá pedindo água, não café.',
      '🥤 Meta de água hoje: zero? Capricha.',
    ],
  },
  {
    key: 'tema', label: 'Tema', emoji: '🎨',
    phrases: [
      '🎨 Teu app tá sem estilo, troca esse tema.',
      '😎 Já viu meu tema novo? Inveja, né.',
      '🌈 Desbloqueia um tema aí, tá sem graça.',
    ],
  },
];
