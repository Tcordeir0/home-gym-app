// Sync do estado (hgt_v2) com o Supabase, por usuário (tabela app_state_v2, RLS).
// Estratégia simples last-write-wins por timestamp — bom pra app local-first de
// família (cada conta = 1 linha; pouca concorrência real).
import { supabase } from './supabase';
import { useStore } from '../store/store';
import { deviceId } from './device';
import { syncSocialAccount } from './social';

const MOD_KEY = 'hgt_mod';     // timestamp da última mudança local
const UID_KEY = 'hgt_uid';     // dono atual do estado local (detecta troca de conta)
const FRESH_KEY = 'hgt_fresh'; // marcado no registro: conta recém-criada (começa com 1 perfil)
const DEBOUNCE = 2000;

/** Marca que a conta acabou de ser CRIADA (registro) — começa do zero com 1 perfil. */
export function markFreshAccount(uid: string) {
  try { localStorage.setItem(FRESH_KEY, uid); } catch { /* ok */ }
}

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

/** No login: decide entre PUXAR (remoto) ou EMPURRAR (local), isolando por conta. */
export async function syncOnLogin(): Promise<void> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    const uid = user?.id;
    if (!uid) return;
    const name = (user?.user_metadata?.name as string) || '';

    const prevUid = localStorage.getItem(UID_KEY);
    const fresh = localStorage.getItem(FRESH_KEY) === uid; // conta recém-registrada
    const switched = !!prevUid && prevUid !== uid;         // trocou de conta nesse aparelho

    const { data, error } = await supabase
      .from('app_state_v2')
      .select('data, updated_at')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) return; // offline: fica com o local; empurra na próxima mudança

    const remote = data?.data as { users?: unknown[] } | undefined;
    const hasRemote = !!remote && Array.isArray(remote.users) && remote.users.length > 0;
    const remoteMod = data ? Date.parse(data.updated_at) : 0;

    // Se trocou de conta, faz backup do que tá no local antes de qualquer coisa.
    if (switched || fresh) {
      try { const cur = useStore.getState().exportState(); if (cur) localStorage.setItem('hgt_backup', cur); } catch { /* ok */ }
    }

    if (hasRemote && (switched || fresh || remoteMod > getMod())) {
      // Remoto é a fonte da verdade (mais novo, ou é outra conta) → adota.
      adopting = true;
      const ok = useStore.getState().importState(JSON.stringify(remote));
      adopting = false;
      if (ok) setMod(remoteMod);
      else await pushNow();
    } else if (hasRemote) {
      // Mesma conta, local mais novo → empurra.
      await pushNow();
    } else {
      // SEM estado remoto pra essa conta.
      if (fresh || switched) {
        // Conta nova (ou troca pra conta sem dados) → 1 perfil com o nome do cadastro,
        // já reivindicado por este aparelho (não precisa escolher).
        adopting = true;
        useStore.getState().initForUser(name);
        const only = useStore.getState().users[0];
        if (only) useStore.getState().claimProfile(only.id);
        adopting = false;
        setMod(0);
      }
      // senão: primeira sync de conta EXISTENTE com dados locais → preserva o local.
      await pushNow();
    }

    // libera temas vinculados à conta (ex: 'Chá' p/ todos os perfis do Talys)
    if (user?.email) useStore.getState().grantAccountThemes(user.email);

    // publica a projeção pública dos perfis (pro Social: amigos verem/cutucarem)
    if (user?.email) {
      const profs = useStore.getState().users.map((u) => ({ id: u.id, name: u.name, color: u.color }));
      void syncSocialAccount(user.email, profs);
    }

    // ⚠️ reforça o perfil DESTE aparelho como ativo: ao puxar o estado da conta,
    // o 'active' vem de quem mexeu por último (outro perfil) — não herdar isso,
    // abrir sempre no perfil reivindicado por este device.
    const dev = deviceId();
    const mine = useStore.getState().users.find((u) => u.claimedDevice === dev);
    if (mine && useStore.getState().active !== mine.id) useStore.getState().setActive(mine.id);

    try { localStorage.setItem(UID_KEY, uid); localStorage.removeItem(FRESH_KEY); } catch { /* ok */ }
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
