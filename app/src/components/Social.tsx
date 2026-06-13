import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { IonIcon, IonModal, IonToast, IonSpinner } from '@ionic/react';
import { people, peopleOutline, handLeftOutline, chatbubblesOutline, closeOutline, sendOutline, personAddOutline, checkmark, close as closeIcon, arrowBack, peopleCircleOutline, addOutline, exitOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/store';
import * as S from '../lib/social';
import { TAUNTS } from '../data/taunts';
import { notify } from '../lib/permissions';
import { getGroupRead, markGroupRead } from '../lib/groupRead';
import './Social.css';

type Tab = 'amigos' | 'cutucar' | 'chat' | 'grupos';

const SocialPanel: React.FC = () => {
  // ⚠️ selecionar referências ESTÁVEIS do store (mapear aqui dentro do seletor cria
  // um array novo a cada render → loop infinito "getSnapshot should be cached").
  const users = useStore((s) => s.users);
  const activeId = useStore((s) => s.active);
  const myName = useMemo(() => users.find((u) => u.id === activeId)?.name || 'Eu', [users, activeId]);
  const myProfiles = useMemo(() => users.map((u) => ({ id: u.id, name: u.name, color: u.color })), [users]);

  const [tab, setTab] = useState<Tab>('amigos');
  const [uid, setUid] = useState('');
  const [friendships, setFriendships] = useState<S.Friendship[]>([]);
  const [accounts, setAccounts] = useState<S.SocialAccount[]>([]);
  const [pokes, setPokes] = useState<S.Poke[]>([]);
  const [invite, setInvite] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatWith, setChatWith] = useState<{ kind: 'friend' | 'team'; uid: string; name: string; profile?: string } | null>(null);
  const [pokeTarget, setPokeTarget] = useState<{ uid: string; profile?: string; name: string } | null>(null);
  // grupos
  const [groups, setGroups] = useState<S.Group[]>([]);
  const [groupView, setGroupView] = useState<S.Group | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [gMembers, setGMembers] = useState<S.GroupMember[]>([]);
  const [gMsgs, setGMsgs] = useState<S.GroupMessage[]>([]);
  const [allGroupMsgs, setAllGroupMsgs] = useState<S.GroupMessage[]>([]);
  const [gDraft, setGDraft] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [pick, setPick] = useState<Record<string, string>>({}); // uid -> label do membro
  const gEnd = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<S.SocialEvent[]>([]);
  const [allMsgs, setAllMsgs] = useState<S.Message[]>([]);
  const [msgs, setMsgs] = useState<S.Message[]>([]);
  const [draft, setDraft] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  const loadAll = useCallback(async () => {
    const [fs, ac, pk, ev, am, gr, gam] = await Promise.all([S.listFriendships(), S.listAccounts(), S.listPokes(), S.listEvents(), S.listAllMessages(), S.listMyGroups(), S.listAllGroupMessages()]);
    setFriendships(fs); setAccounts(ac); setPokes(pk); setEvents(ev); setAllMsgs(am); setGroups(gr); setAllGroupMsgs(gam); setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id || ''));
    loadAll();
    const unsub = S.subscribeSocial(() => { loadAll(); });
    return unsub;
  }, [loadAll]);

  // chat: carrega + realtime
  const loadChat = useCallback(async (c: { kind: 'friend' | 'team'; uid: string; profile?: string }) => {
    setMsgs(c.kind === 'team' ? await S.listTeamMessages(myName, c.profile || '') : await S.listMessages(c.uid));
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [myName]);
  useEffect(() => {
    if (!chatWith) return;
    loadChat(chatWith);
    const unsub = S.subscribeSocial(() => loadChat(chatWith));
    return unsub;
  }, [chatWith, loadChat]);

  // marca cutucadas como vistas ao abrir a aba
  useEffect(() => { if (tab === 'cutucar') S.markPokesSeen().then(loadAll); }, [tab, loadAll]);

  // grupo aberto: carrega membros + mensagens + realtime
  const loadGroup = useCallback(async (g: S.Group) => {
    const [mm, ms] = await Promise.all([S.listGroupMembers(g.id), S.listGroupMessages(g.id)]);
    setGMembers(mm); setGMsgs(ms);
    markGroupRead(g.id); // está vendo → zera o não-lido
    setTimeout(() => gEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, []);
  useEffect(() => {
    setMembersOpen(false);
    if (!groupView) return;
    loadGroup(groupView);
    const unsub = S.subscribeSocial(() => loadGroup(groupView));
    return unsub;
  }, [groupView, loadGroup]);

  const byUid = new Map(accounts.map((a) => [a.uid, a]));
  const friendUids = new Set(friendships.filter((f) => f.status === 'accepted').map((f) => (f.requester === uid ? f.addressee : f.requester)));
  const incoming = friendships.filter((f) => f.status === 'pending' && f.addressee === uid);
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.requester === uid);
  const friends = [...friendUids].map((u) => byUid.get(u)).filter(Boolean) as S.SocialAccount[];
  const recvPokes = pokes.filter((p) => p.to_uid === uid && p.from_uid !== uid);
  // última mensagem de cada conversa (allMsgs vem ordenado do mais novo → .find pega o último)
  const lastFriendMsg = (fuid: string) => allMsgs.find((m) => !m.to_profile && (m.from_uid === fuid || m.to_uid === fuid));
  const lastTeamMsg = (other: string) => allMsgs.find((m) => m.from_uid === uid && m.to_uid === uid && ((m.from_profile === myName && m.to_profile === other) || (m.from_profile === other && m.to_profile === myName)));

  const doInvite = async () => {
    if (!invite.trim()) return;
    const r = await S.inviteByEmail(invite.trim());
    setToast(r.msg); if (r.ok) { setInvite(''); loadAll(); }
  };
  const doPoke = async (toUid: string, profile: string | undefined, text: string) => {
    await S.poke(toUid, myName, profile, text);
    setPokeTarget(null);
    setToast(`Mandou pra ${profile || 'amigo'}! ${text.split(' ')[0]}`);
  };
  const send = async () => {
    if (!draft.trim() || !chatWith) return;
    const b = draft.trim(); setDraft('');
    // otimista: mostra a mensagem na hora (o realtime/loadChat reconcilia depois)
    const optimistic: S.Message = {
      id: 'tmp' + Date.now(), body: b, created_at: new Date().toISOString(), seen: false,
      from_uid: uid, to_uid: chatWith.kind === 'team' ? uid : chatWith.uid,
      from_profile: chatWith.kind === 'team' ? myName : null,
      to_profile: chatWith.kind === 'team' ? chatWith.profile : null,
    };
    setMsgs((m) => [...m, optimistic]);
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 40);
    if (chatWith.kind === 'team') await S.sendMessage(uid, b, { fromProfile: myName, toProfile: chatWith.profile });
    else await S.sendMessage(chatWith.uid, b);
    loadChat(chatWith);
  };
  const accLabel = (a?: S.SocialAccount) => a?.profiles?.[0]?.name || a?.email || 'Amigo';
  // cor do remetente no grupo = cor do perfil dele (tema de cada um aparece na bolha)
  const senderColor = (fuid: string, label?: string) => {
    const acc = byUid.get(fuid);
    const prof = acc?.profiles?.find((p) => p.name === label) || acc?.profiles?.[0];
    return prof?.color || '#8b8b8b';
  };
  // última mensagem de um grupo (allGroupMsgs vem do mais novo → .find pega o último)
  const lastGroupMsg = (gid: string) => allGroupMsgs.find((m) => m.group_id === gid);
  const groupRead = getGroupRead();
  const groupUnread = (gid: string) => {
    const lm = allGroupMsgs.find((m) => m.group_id === gid);
    return !!lm && lm.from_uid !== uid && lm.created_at > (groupRead[gid] || '');
  };

  // sugestões: contas cadastradas que NÃO sou eu, não são amigos nem têm convite pendente
  const pendingUids = new Set(friendships.filter((f) => f.status === 'pending').map((f) => (f.requester === uid ? f.addressee : f.requester)));
  const suggestions = accounts.filter((a) => a.uid !== uid && !friendUids.has(a.uid) && !pendingUids.has(a.uid));

  const sendGroup = async () => {
    if (!gDraft.trim() || !groupView) return;
    const b = gDraft.trim(); setGDraft('');
    const optimistic: S.GroupMessage = { id: 'tmp' + Date.now(), group_id: groupView.id, from_uid: uid, from_label: myName, body: b, created_at: new Date().toISOString() };
    setGMsgs((m) => [...m, optimistic]);
    setTimeout(() => gEnd.current?.scrollIntoView({ behavior: 'smooth' }), 40);
    await S.sendGroupMessage(groupView.id, myName, b);
    loadGroup(groupView);
  };
  const doCreateGroup = async () => {
    const members = Object.entries(pick).map(([u, label]) => ({ uid: u, label }));
    if (!newName.trim() || members.length === 0) { setToast('Dê um nome e escolha ao menos 1 pessoa.'); return; }
    const gid = await S.createGroup(newName.trim(), myName, members);
    if (gid) { setToast('Grupo criado! 🎉'); setCreateOpen(false); setNewName(''); setPick({}); loadAll(); }
    else setToast('Não consegui criar o grupo.');
  };
  const togglePick = (u: string, label: string) => setPick((p) => { const n = { ...p }; if (n[u]) delete n[u]; else n[u] = label; return n; });

  return (
    <div className="sc-panel">
      <div className="sc-tabs">
        <button className={tab === 'amigos' ? 'on' : ''} onClick={() => setTab('amigos')}><IonIcon icon={peopleOutline} /> Amigos</button>
        <button className={tab === 'cutucar' ? 'on' : ''} onClick={() => setTab('cutucar')}>
          <IonIcon icon={handLeftOutline} /> Cutucar
          {recvPokes.some((p) => !p.seen) && <span className="sc-dot" />}
        </button>
        <button className={tab === 'chat' ? 'on' : ''} onClick={() => { setTab('chat'); setChatWith(null); }}><IonIcon icon={chatbubblesOutline} /> Chat</button>
        <button className={tab === 'grupos' ? 'on' : ''} onClick={() => { setTab('grupos'); setGroupView(null); setCreateOpen(false); }}>
          <IonIcon icon={peopleCircleOutline} /> Grupos
          {groups.some((g) => groupUnread(g.id)) && <span className="sc-dot" />}
        </button>
      </div>

      {loading ? <div className="sc-loading"><IonSpinner /></div> : (
        <div className="sc-body">
          {tab === 'amigos' && (
            <>
              <div className="sc-invite">
                <input type="email" inputMode="email" placeholder="email do amigo" value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doInvite()} />
                <button onClick={doInvite}><IonIcon icon={personAddOutline} /> Convidar</button>
              </div>
              {events.length > 0 && (
                <div className="sc-sec"><h4>📣 Novidades dos amigos</h4>
                  {events.slice(0, 8).map((e) => (
                    <div key={e.id} className="sc-poke"><b>{e.label || 'Amigo'}</b> {e.text}</div>
                  ))}
                </div>
              )}
              {incoming.length > 0 && (
                <div className="sc-sec"><h4>Pedidos recebidos</h4>
                  {incoming.map((f) => (
                    <div key={f.id} className="sc-row">
                      <span className="sc-name">{accLabel(byUid.get(f.requester))}</span>
                      <span className="sc-actions">
                        <button className="ok" onClick={() => S.acceptFriend(f.id).then(loadAll)}><IonIcon icon={checkmark} /></button>
                        <button className="no" onClick={() => S.removeFriend(f.id).then(loadAll)}><IonIcon icon={closeIcon} /></button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="sc-sec"><h4>Amigos ({friends.length})</h4>
                {friends.length === 0 ? <p className="sc-empty">Convide alguém por email pra começar.</p> :
                  friends.map((a) => (
                    <div key={a.uid} className="sc-row">
                      <span className="sc-name">{accLabel(a)} <small>{a.email}</small></span>
                      <button className="sc-mini" onClick={() => { setChatWith({ kind: 'friend', uid: a.uid, name: accLabel(a) }); setTab('chat'); }}><IonIcon icon={chatbubblesOutline} /></button>
                    </div>
                  ))}
              </div>
              {outgoing.length > 0 && (
                <div className="sc-sec"><h4>Convites enviados</h4>
                  {outgoing.map((f) => (
                    <div key={f.id} className="sc-row sc-pending">
                      <span className="sc-name">{accLabel(byUid.get(f.addressee))} <small>pendente…</small></span>
                      <button className="no" onClick={() => S.removeFriend(f.id).then(loadAll)}><IonIcon icon={closeIcon} /></button>
                    </div>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="sc-sec"><h4>Sugestões ({suggestions.length})</h4>
                  {suggestions.map((a) => (
                    <div key={a.uid} className="sc-row">
                      <span className="sc-name">
                        <span className="sc-av" style={{ background: a.profiles?.[0]?.color || '#888' }} />
                        {accLabel(a)} <small>{a.email}</small>
                      </span>
                      <button className="sc-mini poke" onClick={() => S.inviteByUid(a.uid).then((r) => { setToast(r.msg); loadAll(); })}>
                        <IonIcon icon={personAddOutline} /> Convidar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'cutucar' && (
            <>
              {recvPokes.length > 0 && (
                <div className="sc-sec"><h4>Cutucadas recebidas</h4>
                  {recvPokes.slice(0, 12).map((p) => (
                    <div key={p.id} className="sc-poke">
                      <b>{p.from_label || 'Alguém'}</b>{p.to_profile ? ` ➜ ${p.to_profile}` : ''}: <span className="sc-poke-msg">{p.emoji || '👉 te cutucou!'}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="sc-sec"><h4>Sua equipe</h4>
                {myProfiles.filter((p) => p.name !== myName).length === 0 ? <p className="sc-empty">Só você por aqui.</p> :
                  myProfiles.filter((p) => p.name !== myName).map((p) => (
                    <div key={p.id} className="sc-row">
                      <span className="sc-name"><span className="sc-av" style={{ background: p.color }} />{p.name}</span>
                      <button className="sc-mini poke" onClick={() => setPokeTarget({ uid, profile: p.name, name: p.name })}>👉 Cutucar</button>
                    </div>
                  ))}
              </div>
              <div className="sc-sec"><h4>Amigos</h4>
                {friends.length === 0 ? <p className="sc-empty">Adicione amigos na aba Amigos.</p> :
                  friends.flatMap((a) => (a.profiles || []).map((p) => (
                    <div key={a.uid + p.id} className="sc-row">
                      <span className="sc-name"><span className="sc-av" style={{ background: p.color }} />{p.name} <small>{a.email}</small></span>
                      <button className="sc-mini poke" onClick={() => setPokeTarget({ uid: a.uid, profile: p.name, name: p.name })}>👉 Cutucar</button>
                    </div>
                  )))}
              </div>

              {pokeTarget && (
                <div className="sc-poke-picker" onClick={() => setPokeTarget(null)}>
                  <div className="sc-poke-sheet" onClick={(e) => e.stopPropagation()}>
                    <h4>Cutucar <b>{pokeTarget.name}</b> com…</h4>
                    {TAUNTS.map((cat) => (
                      <div key={cat.key} className="sc-poke-cat">
                        <span className="sc-poke-catlabel">{cat.emoji} {cat.label}</span>
                        {cat.phrases.map((ph) => (
                          <button key={ph} className="sc-poke-phrase" onClick={() => doPoke(pokeTarget.uid, pokeTarget.profile, ph)}>{ph}</button>
                        ))}
                      </div>
                    ))}
                    <button className="sc-poke-cancel" onClick={() => setPokeTarget(null)}>Cancelar</button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'chat' && (
            chatWith ? (
              <div className="sc-chat">
                <div className="sc-chat-top"><button onClick={() => setChatWith(null)}><IonIcon icon={arrowBack} /></button><b>{chatWith.name}</b></div>
                <div className="sc-msgs">
                  {msgs.length === 0 ? <p className="sc-empty">Diga oi 👋</p> :
                    msgs.map((m) => {
                      const mine = chatWith?.kind === 'team' ? m.from_profile === myName : m.from_uid === uid;
                      return (
                        <div key={m.id} className={'sc-msg' + (mine ? ' me' : '')}>
                          {m.body}
                          <span className="sc-msg-time">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })}
                  <div ref={chatEnd} />
                </div>
                <div className="sc-send">
                  <input placeholder="mensagem…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                  <button onClick={send}><IonIcon icon={sendOutline} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="sc-sec"><h4>Sua equipe</h4>
                  {myProfiles.filter((p) => p.name !== myName).length === 0 ? <p className="sc-empty">Só você na conta.</p> :
                    myProfiles.filter((p) => p.name !== myName).map((p) => {
                      const lm = lastTeamMsg(p.name);
                      return (
                        <button key={p.id} className="sc-row sc-tap" onClick={() => setChatWith({ kind: 'team', uid, name: p.name, profile: p.name })}>
                          <span className="sc-chatrow">
                            <span className="sc-name"><span className="sc-av" style={{ background: p.color }} /> {p.name}</span>
                            {lm && <span className="sc-preview">{lm.from_profile === myName ? 'Você: ' : ''}{lm.body}</span>}
                          </span>
                        </button>
                      );
                    })}
                </div>
                <div className="sc-sec"><h4>Amigos</h4>
                  {friends.length === 0 ? <p className="sc-empty">Adicione amigos pra conversar.</p> :
                    friends.map((a) => {
                      const lm = lastFriendMsg(a.uid);
                      return (
                        <button key={a.uid} className="sc-row sc-tap" onClick={() => setChatWith({ kind: 'friend', uid: a.uid, name: accLabel(a) })}>
                          <span className="sc-chatrow">
                            <span className="sc-name"><IonIcon icon={chatbubblesOutline} /> {accLabel(a)}</span>
                            {lm && <span className="sc-preview">{lm.from_uid === uid ? 'Você: ' : ''}{lm.body}</span>}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </>
            )
          )}

          {tab === 'grupos' && (
            groupView ? (
              <div className="sc-chat">
                <div className="sc-chat-top">
                  <button onClick={() => (membersOpen ? setMembersOpen(false) : setGroupView(null))}><IonIcon icon={arrowBack} /></button>
                  <b>{groupView.name}</b>
                  <button className={'sc-grp-membtn' + (membersOpen ? ' on' : '')} title="Membros" onClick={() => setMembersOpen((v) => !v)}>
                    <IonIcon icon={peopleOutline} /> {gMembers.length}
                  </button>
                  {groupView.owner === uid
                    ? <button className="sc-grp-x" title="Apagar grupo" onClick={() => { S.deleteGroup(groupView.id).then(() => { setGroupView(null); loadAll(); }); }}><IonIcon icon={trashOutline} /></button>
                    : <button className="sc-grp-x" title="Sair do grupo" onClick={() => { S.leaveGroup(groupView.id).then(() => { setGroupView(null); loadAll(); }); }}><IonIcon icon={exitOutline} /></button>}
                </div>
                {membersOpen ? (
                  <div className="sc-msgs sc-grp-mlist">
                    <div className="sc-sec"><h4>Membros ({gMembers.length})</h4>
                      {gMembers.map((m) => (
                        <div key={m.uid} className="sc-row">
                          <span className="sc-name">
                            <span className="sc-av" style={{ background: senderColor(m.uid, m.label) }} />
                            {m.label || accLabel(byUid.get(m.uid))}{m.uid === uid ? ' (você)' : ''} {m.role === 'owner' && <small>dono</small>}
                          </span>
                          {groupView.owner === uid && m.uid !== uid && (
                            <button className="no" title="Remover" onClick={() => S.removeGroupMember(groupView.id, m.uid).then(() => loadGroup(groupView))}><IonIcon icon={closeIcon} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                    {groupView.owner === uid && (
                      <div className="sc-sec"><h4>Adicionar amigos</h4>
                        {(() => {
                          const addable = friends.filter((a) => !gMembers.some((m) => m.uid === a.uid));
                          return addable.length === 0
                            ? <p className="sc-empty">Todos os seus amigos já estão no grupo.</p>
                            : addable.map((a) => (
                              <div key={a.uid} className="sc-row">
                                <span className="sc-name"><span className="sc-av" style={{ background: a.profiles?.[0]?.color || '#888' }} /> {accLabel(a)}</span>
                                <button className="sc-mini poke" onClick={() => S.addGroupMember(groupView.id, a.uid, accLabel(a)).then(() => loadGroup(groupView))}><IonIcon icon={addOutline} /> Add</button>
                              </div>
                            ));
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="sc-msgs">
                      {gMsgs.length === 0 ? <p className="sc-empty">Comece a conversa 👋</p> :
                        gMsgs.map((m) => {
                          const mine = m.from_uid === uid;
                          return (
                            <div key={m.id} className={'sc-msg' + (mine ? ' me' : '')} style={mine ? undefined : { borderLeft: `3px solid ${senderColor(m.from_uid, m.from_label)}` }}>
                              {!mine && <span className="sc-msg-from" style={{ color: senderColor(m.from_uid, m.from_label) }}>{m.from_label || 'Alguém'}</span>}
                              {m.body}
                              <span className="sc-msg-time">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          );
                        })}
                      <div ref={gEnd} />
                    </div>
                    <div className="sc-send">
                      <input placeholder="mensagem…" value={gDraft} onChange={(e) => setGDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendGroup()} />
                      <button onClick={sendGroup}><IonIcon icon={sendOutline} /></button>
                    </div>
                  </>
                )}
              </div>
            ) : createOpen ? (
              <div className="sc-sec">
                <h4>Novo grupo</h4>
                <div className="sc-invite">
                  <input placeholder="Nome do grupo" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <p className="sc-grp-hint">Escolha quem entra (amigos). Sua equipe da mesma conta já vê o grupo.</p>
                {friends.length === 0 ? <p className="sc-empty">Adicione amigos antes pra montar um grupo.</p> :
                  friends.map((a) => (
                    <button key={a.uid} className={'sc-row sc-tap' + (pick[a.uid] ? ' sc-picked' : '')} onClick={() => togglePick(a.uid, accLabel(a))}>
                      <span className="sc-name"><span className="sc-av" style={{ background: a.profiles?.[0]?.color || '#888' }} /> {accLabel(a)}</span>
                      {pick[a.uid] && <IonIcon icon={checkmark} />}
                    </button>
                  ))}
                <div className="sc-grp-actions">
                  <button className="sc-grp-cancel" onClick={() => { setCreateOpen(false); setNewName(''); setPick({}); }}>Cancelar</button>
                  <button className="sc-grp-create" onClick={doCreateGroup}>Criar grupo</button>
                </div>
              </div>
            ) : (
              <>
                <button className="sc-grp-new" onClick={() => setCreateOpen(true)}><IonIcon icon={addOutline} /> Criar grupo</button>
                <div className="sc-sec"><h4>Seus grupos ({groups.length})</h4>
                  {groups.length === 0 ? <p className="sc-empty">Crie um grupo pra conversar com a galera ao mesmo tempo.</p> :
                    groups.map((g) => {
                      const lm = lastGroupMsg(g.id);
                      const unread = groupUnread(g.id);
                      return (
                        <button key={g.id} className="sc-row sc-tap" onClick={() => setGroupView(g)}>
                          <span className="sc-chatrow">
                            <span className="sc-name"><IonIcon icon={peopleCircleOutline} /> {g.name} {g.owner === uid && <small>dono</small>}</span>
                            {lm && <span className="sc-preview">{lm.from_uid === uid ? 'Você' : (lm.from_label || 'Alguém')}: {lm.body}</span>}
                          </span>
                          {unread && <span className="sc-unread" />}
                        </button>
                      );
                    })}
                </div>
              </>
            )
          )}
        </div>
      )}
      <IonToast isOpen={!!toast} message={toast} duration={2200} position="top" onDidDismiss={() => setToast('')} />
    </div>
  );
};

/** Botão Social no header do Treino + modal com Amigos/Cutucar/Chat. */
const Social: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState(0);
  const notifyOn = useStore((s) => s.notifyOn);
  const prevAlerts = useRef<number | null>(null);

  // badge no botão: convites recebidos + cutucadas não vistas + grupos não-lidos (realtime)
  useEffect(() => {
    const refresh = async () => {
      const { data } = await supabase.auth.getUser();
      const myUid = data.user?.id || '';
      if (!myUid) return;
      const [fs, pk, gr, gam] = await Promise.all([S.listFriendships(), S.listPokes(), S.listMyGroups(), S.listAllGroupMessages()]);
      const incoming = fs.filter((f) => f.status === 'pending' && f.addressee === myUid).length;
      const unseen = pk.filter((p) => p.to_uid === myUid && p.from_uid !== myUid && !p.seen).length;
      const read = getGroupRead();
      const unreadGroups = gr
        .map((g) => ({ g, lm: gam.find((m) => m.group_id === g.id) }))
        .filter((x) => x.lm && x.lm.from_uid !== myUid && x.lm.created_at > (read[x.g.id] || ''));
      const total = incoming + unseen + unreadGroups.length;
      // notifica só quando AUMENTA (chegou coisa nova) e o usuário permitiu
      if (prevAlerts.current !== null && total > prevAlerts.current && notifyOn) {
        if (unreadGroups.length) {
          const freshest = unreadGroups.sort((a, b) => (b.lm!.created_at).localeCompare(a.lm!.created_at))[0];
          notify(`💬 ${freshest.g.name}`, `${freshest.lm!.from_label || 'Alguém'}: ${freshest.lm!.body}`);
        } else {
          notify('Novidade no Social 👥', incoming ? 'Você tem convite de amizade pra responder.' : 'Alguém te cutucou!');
        }
      }
      prevAlerts.current = total;
      setAlerts(total);
    };
    refresh();
    const unsub = S.subscribeSocial(refresh);
    return unsub;
  }, [notifyOn]);

  return (
    <>
      <button className="social-btn" onClick={() => setOpen(true)} aria-label="Social">
        <IonIcon icon={people} />
        {alerts > 0 && <span className="social-badge">{alerts > 9 ? '9+' : alerts}</span>}
      </button>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} className="sc-modal">
        <div className="sc-head">
          <h2 className="sc-title"><IonIcon icon={peopleOutline} /> Social</h2>
          <button className="sc-close" onClick={() => setOpen(false)} aria-label="Fechar"><IonIcon icon={closeOutline} /></button>
        </div>
        {open && <SocialPanel />}
      </IonModal>
    </>
  );
};

export default Social;
