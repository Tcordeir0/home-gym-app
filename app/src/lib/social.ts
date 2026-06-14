// Cliente do Social (Supabase): contas públicas, amizades, cutucadas e chat.
// O schema vive no Supabase (tabelas social_accounts/friendships/pokes/messages + RLS).
import { supabase } from './supabase';

export interface PublicProfile { id: string; name: string; color?: string; photo?: string; }

/** Miniatura pequena (jpeg) a partir de um dataURL — pra embutir leve no perfil público. */
export function thumbFromDataUrl(dataUrl: string, max = 64): Promise<string | undefined> {
  return new Promise((res) => {
    if (!dataUrl) return res(undefined);
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w >= h && w > max) { h = Math.round((h * max) / w); w = max; }
      else if (h > w && h > max) { w = Math.round((w * max) / h); h = max; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      res(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => res(undefined);
    img.src = dataUrl;
  });
}
export interface SocialAccount { uid: string; email?: string; profiles: PublicProfile[] }
export interface Friendship { id: string; requester: string; addressee: string; status: 'pending' | 'accepted'; created_at: string }
export interface Poke { id: string; from_uid: string; from_label?: string; to_uid: string; to_profile?: string; emoji?: string; created_at: string; seen: boolean }
export interface Message { id: string; from_uid: string; to_uid: string; body: string; from_profile?: string | null; to_profile?: string | null; created_at: string; seen: boolean }
export interface SocialEvent { id: string; uid: string; label?: string; text: string; created_at: string }
export interface Group { id: string; name: string; owner: string; created_at: string }
export interface GroupMember { group_id: string; uid: string; label?: string; role: string; joined_at: string }
export interface GroupMessage { id: string; group_id: string; from_uid: string; from_label?: string; body: string; created_at: string }

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

/** Convida alguém direto pelo uid (da lista de sugestões — sem digitar email). */
export async function inviteByUid(targetUid: string): Promise<{ ok: boolean; msg: string }> {
  const id = await uid();
  if (!id) return { ok: false, msg: 'Entre na conta primeiro.' };
  if (targetUid === id) return { ok: false, msg: 'Esse é você 🙂' };
  const { error } = await supabase.from('friendships').insert({ requester: id, addressee: targetUid });
  if (error) return { ok: false, msg: 'Vocês já têm convite/amizade.' };
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

export async function sendMessage(toUid: string, body: string, opts?: { fromProfile?: string; toProfile?: string }): Promise<void> {
  const id = await uid();
  if (id && body.trim()) await supabase.from('messages').insert({ from_uid: id, to_uid: toUid, body: body.trim(), from_profile: opts?.fromProfile, to_profile: opts?.toProfile });
}
/** Chat entre o MEU perfil ativo e um PERFIL do amigo (isolado por perfil — sem vazar
 *  pros outros perfis da minha conta). fail-closed: só mostra com os dois perfis batendo. */
export async function listMessages(friendUid: string, myProfile?: string, friendProfile?: string): Promise<Message[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase.from('messages')
    .select('*')
    .or(`and(from_uid.eq.${id},to_uid.eq.${friendUid}),and(from_uid.eq.${friendUid},to_uid.eq.${id})`)
    .order('created_at', { ascending: true });
  const all = (data as Message[]) || [];
  if (!myProfile || !friendProfile) return all.filter((m) => !m.from_profile && !m.to_profile); // legado (conta↔conta)
  return all.filter((m) =>
    (m.from_uid === id && m.from_profile === myProfile && m.to_profile === friendProfile) ||
    (m.from_uid === friendUid && m.from_profile === friendProfile && m.to_profile === myProfile));
}
/** Chat entre dois perfis da MESMA conta (equipe). */
export async function listTeamMessages(profileA: string, profileB: string): Promise<Message[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase.from('messages')
    .select('*').eq('from_uid', id).eq('to_uid', id)
    .order('created_at', { ascending: true });
  return ((data as Message[]) || []).filter((m) =>
    (m.from_profile === profileA && m.to_profile === profileB) ||
    (m.from_profile === profileB && m.to_profile === profileA));
}

/** Todas as minhas mensagens (pra preview da última de cada conversa). */
export async function listAllMessages(): Promise<Message[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase.from('messages')
    .select('*').or(`from_uid.eq.${id},to_uid.eq.${id}`)
    .order('created_at', { ascending: false }).limit(500);
  return (data as Message[]) || [];
}

/** Posta um evento (desbloqueio/level-up) — amigos veem no feed. */
export async function postEvent(label: string, text: string): Promise<void> {
  const id = await uid();
  if (id) await supabase.from('social_events').insert({ uid: id, label, text });
}
export async function listEvents(): Promise<SocialEvent[]> {
  const { data } = await supabase.from('social_events').select('*').order('created_at', { ascending: false }).limit(30);
  return (data as SocialEvent[]) || [];
}

// ===== Grupos (estilo WhatsApp) =====
/** Cria um grupo e adiciona os membros escolhidos (eu entro como dono). */
export async function createGroup(name: string, myLabel: string, members: { uid: string; label?: string }[]): Promise<string | null> {
  const id = await uid();
  if (!id || !name.trim()) return null;
  const { data, error } = await supabase.from('groups').insert({ name: name.trim(), owner: id }).select('id').single();
  if (error || !data) return null;
  const gid = (data as { id: string }).id;
  const rows = [
    { group_id: gid, uid: id, label: myLabel, role: 'owner' },
    ...members.filter((m) => m.uid !== id).map((m) => ({ group_id: gid, uid: m.uid, label: m.label, role: 'member' })),
  ];
  await supabase.from('group_members').insert(rows);
  return gid;
}
export async function listMyGroups(): Promise<Group[]> {
  const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
  return (data as Group[]) || [];
}
/** Minhas participações em grupos (group_id → label/perfil) — pra isolar grupos por perfil. */
export async function listMyMemberships(): Promise<{ group_id: string; label?: string }[]> {
  const id = await uid();
  if (!id) return [];
  const { data } = await supabase.from('group_members').select('group_id,label').eq('uid', id);
  return (data as { group_id: string; label?: string }[]) || [];
}
export async function listGroupMembers(gid: string): Promise<GroupMember[]> {
  const { data } = await supabase.from('group_members').select('*').eq('group_id', gid);
  return (data as GroupMember[]) || [];
}
export async function addGroupMember(gid: string, memberUid: string, label?: string): Promise<void> {
  await supabase.from('group_members').insert({ group_id: gid, uid: memberUid, label, role: 'member' });
}
/** Dono remove um membro do grupo (RLS gm_delete_owner_or_self permite ao dono). */
export async function removeGroupMember(gid: string, memberUid: string): Promise<void> {
  await supabase.from('group_members').delete().eq('group_id', gid).eq('uid', memberUid);
}
export async function leaveGroup(gid: string): Promise<void> {
  const id = await uid();
  if (id) await supabase.from('group_members').delete().eq('group_id', gid).eq('uid', id);
}
export async function deleteGroup(gid: string): Promise<void> { await supabase.from('groups').delete().eq('id', gid); }
export async function sendGroupMessage(gid: string, label: string, body: string): Promise<void> {
  const id = await uid();
  if (id && body.trim()) await supabase.from('group_messages').insert({ group_id: gid, from_uid: id, from_label: label, body: body.trim() });
}
export async function listGroupMessages(gid: string): Promise<GroupMessage[]> {
  const { data } = await supabase.from('group_messages').select('*').eq('group_id', gid).order('created_at', { ascending: true });
  return (data as GroupMessage[]) || [];
}
/** Mensagens recentes de TODOS os meus grupos (pra prévia + não-lidas). */
export async function listAllGroupMessages(): Promise<GroupMessage[]> {
  const { data } = await supabase.from('group_messages').select('*').order('created_at', { ascending: false }).limit(500);
  return (data as GroupMessage[]) || [];
}

let chanN = 0;
/** Assina mudanças em tempo real (chat, cutucadas, amizades). Nome ÚNICO por
 *  chamada — dois canais com o mesmo nome conflitam no Supabase Realtime. */
export function subscribeSocial(onChange: () => void): () => void {
  const ch = supabase.channel('social-rt-' + (++chanN))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pokes' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_events' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(ch); };
}
