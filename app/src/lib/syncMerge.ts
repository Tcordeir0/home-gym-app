// Merge defensivo de dois estados (hgt_v2) pra reduzir PERDA DE DADO no sync.
//
// O sync é last-write-wins por timestamp: se 2 aparelhos escrevem no mesmo dia, o
// último a subir apagava o do outro — MESMO editando seções diferentes (um o treino,
// outro a água). Aqui unimos as coleções ADITIVAS (histórico, dieta/água, medidas,
// scores) por chave estável; em conflito, fica a versão MAIS RICA. As configs (perfis,
// tema, ajustes) seguem o lado "autoridade" (last-write-wins) — pra isso é aceitável.
//
// Função PURA e tolerante a campos faltando — fácil de testar e nunca derruba o app.

interface SetEntry { kg?: number | null; reps?: number | null; rir?: number }
interface HistoryEntry {
  date: string;
  w: string;
  t?: string;
  start?: string;
  exercises?: { nome: string; sets: SetEntry[] }[];
  [k: string]: unknown;
}
interface DailyEntry {
  water?: number;
  waterMl?: number;
  food?: unknown[];
  [k: string]: unknown;
}
interface Score { byDay?: Record<string, number> }

export interface MergeableState {
  history?: Record<string, HistoryEntry[]>;
  daily?: Record<string, Record<string, DailyEntry>>;
  measures?: Record<string, { date: string; [k: string]: unknown }[]>;
  scores?: Record<string, Score>;
  [k: string]: unknown;
}

/** Chave estável de um treino do histórico (1 por data+letra; cardio separa por horário). */
function histKey(e: HistoryEntry): string {
  return `${e.date}|${e.w}|${e.t || ''}|${e.start || ''}`;
}

/** "Riqueza" de um treino: quantas séries registradas tem (mais = mais completo). */
function histRichness(e: HistoryEntry): number {
  if (!Array.isArray(e.exercises)) return 0;
  return e.exercises.reduce((n, ex) => n + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);
}

/** Une duas listas de histórico de um perfil: por chave; em colisão, a mais rica vence. */
function mergeHistory(a: HistoryEntry[] = [], b: HistoryEntry[] = []): HistoryEntry[] {
  const by = new Map<string, HistoryEntry>();
  for (const e of [...a, ...b]) {
    if (!e || !e.date) continue;
    const k = histKey(e);
    const prev = by.get(k);
    if (!prev || histRichness(e) > histRichness(prev)) by.set(k, e);
  }
  return [...by.values()].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
}

/** Une o registro diário (água/comida) de um dia: água = máx; comida = lista mais completa. */
function mergeDailyEntry(a: DailyEntry = {}, b: DailyEntry = {}): DailyEntry {
  const out: DailyEntry = { ...a, ...b };
  const aw = Math.max(a.waterMl || 0, b.waterMl || 0);
  if (aw > 0) out.waterMl = aw;
  const cups = Math.max(a.water || 0, b.water || 0);
  if (cups > 0) out.water = cups;
  // comida: dois aparelhos no mesmo dia → fica a lista maior (provável superset),
  // evita duplicar itens iguais que não dá pra distinguir com segurança.
  const af = Array.isArray(a.food) ? a.food : [];
  const bf = Array.isArray(b.food) ? b.food : [];
  if (af.length || bf.length) out.food = bf.length >= af.length ? bf : af;
  return out;
}

/** Une o `daily` de um perfil (por data). */
function mergeDailyByDate(a: Record<string, DailyEntry> = {}, b: Record<string, DailyEntry> = {}): Record<string, DailyEntry> {
  const out: Record<string, DailyEntry> = { ...a };
  for (const [date, entry] of Object.entries(b)) {
    out[date] = out[date] ? mergeDailyEntry(out[date], entry) : entry;
  }
  return out;
}

/** Une medidas de um perfil por data (1 por dia; a mais "preenchida" vence). */
function mergeMeasures(a: { date: string; [k: string]: unknown }[] = [], b: { date: string; [k: string]: unknown }[] = []) {
  const by = new Map<string, { date: string; [k: string]: unknown }>();
  const fill = (m: { date: string; [k: string]: unknown }) => Object.values(m).filter((v) => v != null && v !== '').length;
  for (const m of [...a, ...b]) {
    if (!m || !m.date) continue;
    const prev = by.get(m.date);
    if (!prev || fill(m) > fill(prev)) by.set(m.date, m);
  }
  return [...by.values()].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
}

/** Une scores (pontos por dia) de um perfil: máx por dia. */
function mergeScore(a: Score = {}, b: Score = {}): Score {
  const byDay: Record<string, number> = { ...(a.byDay || {}) };
  for (const [d, v] of Object.entries(b.byDay || {})) {
    byDay[d] = Math.max(byDay[d] || 0, v || 0);
  }
  return { byDay };
}

/** Une um Record<uid, T> aplicando `fn` por chave (uids presentes em qualquer lado). */
function mergeByUid<T>(a: Record<string, T> = {}, b: Record<string, T> = {}, fn: (x?: T, y?: T) => T): Record<string, T> {
  const out: Record<string, T> = {};
  for (const uid of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[uid] = fn(a[uid], b[uid]);
  }
  return out;
}

/**
 * Mescla `other` dentro de `authority`, preservando dados ADITIVOS dos dois lados.
 * `authority` manda nas configs (perfis, tema, ajustes); as coleções de dados são unidas.
 * Use com o lado "mais novo/confiável" como `authority` (ex.: remoto recém-puxado).
 *
 * ⚠️ Só faz sentido pra MESMA conta. Não chame ao trocar de conta (mistura dados de gente diferente).
 */
export function mergeAppState<A extends MergeableState>(authority: A, other?: MergeableState | null): A {
  if (!other || typeof other !== 'object') return authority;
  return {
    ...authority,
    history: mergeByUid(authority.history, other.history, (x, y) => mergeHistory(x, y)),
    daily: mergeByUid(authority.daily, other.daily, (x, y) => mergeDailyByDate(x, y)),
    measures: mergeByUid(authority.measures, other.measures, (x, y) => mergeMeasures(x, y)),
    scores: mergeByUid(authority.scores, other.scores, (x, y) => mergeScore(x, y)),
  };
}
