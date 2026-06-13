// Cliente do Social (Supabase): contas públicas, amizades, cutucadas e chat.
// O schema vive no Supabase (tabelas social_accounts/friendships/pokes/messages + RLS).
import { supabase } from './supabase';

export interface PublicProfile { id: string; name: string; color?: string; }
export interface SocialAccount { uid: string; email?: string; profiles: PublicProfile[] }
export interface Friendship { id: string; requester: string; addressee: string; status: 'pending' | 'accepted'; created_at: string }
export interface Poke { id: string; from_uid: string; from_label?: string; to_uid: string; to_profile?: string; emoji?: string; created_at: string; seen: boolean }
export interface Message { id: string; from_uid: string; to_uid: string; body: string; created_at: string; seen: boolean }

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Publica a projeção pública desta conta (pra amigos encontrarem/cutucarem). */
export async function syncSocialAccount(email: string, profiles: PublicProfile[]): Promise<void> {
  const id = await uid();
  if (!id) return;
  try {
    await supabase.from('social_accounts').upsert({ uid: id, email, profiles, updated_at: new Date().toISOString() });
  } catch { /* offline */ }
}

/** Convida alguém por email (cria pedido de amizade). */
export async function inviteByEmail(email: string): Promise<{ ok: boolean; msg: string }> {
  const id = await uid();
  if (!id) return { ok: false, msg: 'Entre na conta primeiro.' };
  const { data: target, error } = await supabase.rpc('find_account_by_email', { p_email: email });
  if (error) return { ok: false, msg: 'Erro ao buscar. Tente de novo.' };
  if (!target) return { ok: false, msg: 'Nenhuma conta com esse email (ainda). Chame pra criar conta!' };
  if (target === id) return { ok: false, msg: 'Esse email é o seu 🙂' };
  const { error: e2 } = await supabase.from('friendships').insert({ requester: id, addressee: target });
  if (e2) return { ok: false, msg: 'Vocês já têm convite/amizade.' };
  return { ok: true, msg: 'Convite enviado! 🎉' };
}

export async function listFriendships(): Promise<Friendship[]> {
  const { data } = await supabase.from('friendships').select('*');
  return (data as Friendship[]) || [];
}
export async function acceptFriend(id: string): Promise<void> { await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id); }
export async function removeFriend(id: string): Promise<void> { await supabase.from('friendships').delete().eq('id', id); }

/** Contas (perfis) visíveis: a sua + as dos amigos aceitos (via RLS). */
export async function listAccounts(): Promise<SocialAccount[]> {
  const { data } = await supabase.from('social_accounts').select('uid,email,profiles');
  return (data as SocialAccount[]) || [];
}

export async function poke(toUid: string, fromLabel: string, toProfile?: string, emoji = '👉'): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('pokes').insert({ from_uid: id, from_label: fromLabel, to_uid: toUid, to_profile: toProfile, emoji });
}
export async function listPokes(): Promise<Poke[]> {
  const { data } = await supabase.from('pokes').select('*').order('created_at', { ascending: false }).limit(50);
  return (data as Poke[]) || [];
}
export async function markPokesSeen(): Promise<void> {
  const id = await uid();
  if (id) await supabase.from('pokes').update({ seen: true }).eq('to_uid', id).eq('seen', false);
}

export async function sendMessage(toUid: string, body: string): Promise<void> {
  const id = await uid();
  if (id && body.trim()) await supabase.from('messages').insert({ from_uid: id, to_uid: toUid, body: body.trim() });
}
export async function listMessages(friendUid: string): Promise<Message[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase.from('messages')
    .select('*')
    .or(`and(from_uid.eq.${id},to_uid.eq.${friendUid}),and(from_uid.eq.${friendUid},to_uid.eq.${id})`)
    .order('created_at', { ascending: true });
  return (data as Message[]) || [];
}

/** Assina mudanças em tempo real (chat, cutucadas, amizades). */
export function subscribeSocial(onChange: () => void): () => void {
  const ch = supabase.channel('social-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pokes' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(ch); };
}
