// Sync do estado (hgt_v2) com o Supabase, por usuário (tabela app_state_v2, RLS).
// Estratégia simples last-write-wins por timestamp — bom pra app local-first de
// família (cada conta = 1 linha; pouca concorrência real).
import { supabase } from './supabase';
import { useStore } from '../store/store';

const MOD_KEY = 'hgt_mod';   // timestamp da última mudança local
const UID_KEY = 'hgt_uid';   // dono atual do estado local (detecta troca de conta)
const DEBOUNCE = 2000;

function getMod(): number { return Number(localStorage.getItem(MOD_KEY) || 0); }
function setMod(n: number) { try { localStorage.setItem(MOD_KEY, String(n)); } catch { /* ok */ } }

let pushTimer: ReturnType<typeof setTimeout> | undefined;
let unsub: (() => void) | undefined;
let adopting = false; // evita re-push quando estamos ADOTANDO o estado remoto
let pushing = false;

async function currentUid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Sobe o estado local pro Supabase (debounced chama isso). */
export async function pushNow(): Promise<void> {
  if (pushing) return;
  const uid = await currentUid();
  if (!uid) return;
  pushing = true;
  try {
    const data = JSON.parse(useStore.getState().exportState());
    const ts = Date.now();
    const { error } = await supabase
      .from('app_state_v2')
      .upsert({ user_id: uid, data, updated_at: new Date(ts).toISOString() });
    if (!error) setMod(ts);
  } catch { /* offline: tenta de novo na próxima mudança */ }
  finally { pushing = false; }
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushNow(); }, DEBOUNCE);
}

/** No login: decide entre PUXAR (remoto mais novo) ou EMPURRAR (local mais novo/primeira vez). */
export async function syncOnLogin(): Promise<void> {
  try {
    const uid = await currentUid();
    if (!uid) return;

    // Troca de conta no mesmo aparelho → zera o local pra NÃO vazar dados entre contas.
    // Antes de zerar, guarda um BACKUP do estado atual (rede de segurança — nada se perde).
    const prevUid = localStorage.getItem(UID_KEY);
    if (prevUid && prevUid !== uid) {
      try {
        const cur = useStore.getState().exportState();
        if (cur) localStorage.setItem('hgt_backup', cur);
      } catch { /* ok */ }
      adopting = true;
      useStore.getState().resetState();
      adopting = false;
      setMod(0);
    }
    try { localStorage.setItem(UID_KEY, uid); } catch { /* ok */ }

    const { data, error } = await supabase
      .from('app_state_v2')
      .select('data, updated_at')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) return; // offline: fica com o local; empurra na próxima mudança

    const remote = data?.data as { users?: unknown[] } | undefined;
    const hasRemote = !!remote && Array.isArray(remote.users) && remote.users.length > 0;
    const remoteMod = data ? Date.parse(data.updated_at) : 0;

    if (hasRemote && remoteMod > getMod()) {
      adopting = true;
      const ok = useStore.getState().importState(JSON.stringify(remote));
      adopting = false;
      if (ok) setMod(remoteMod);
      else await pushNow();
    } else {
      await pushNow(); // local é mais novo, ou primeira sincronização da conta
    }
  } catch { /* nunca trava o app por causa do sync */ }
}

/** Começa a observar mudanças do store e empurra (debounced). */
export function startSync(): void {
  if (unsub) return;
  unsub = useStore.subscribe(() => {
    if (adopting) return;
    setMod(Date.now());
    schedulePush();
  });
}

/** Para o sync (logout). */
export function stopSync(): void {
  if (unsub) { unsub(); unsub = undefined; }
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = undefined; }
}
