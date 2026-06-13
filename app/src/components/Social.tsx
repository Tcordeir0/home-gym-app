import { useState, useEffect, useCallback, useRef } from 'react';
import { IonIcon, IonModal, IonToast, IonSpinner } from '@ionic/react';
import { people, peopleOutline, handLeftOutline, chatbubblesOutline, closeOutline, sendOutline, personAddOutline, checkmark, close as closeIcon, arrowBack } from 'ionicons/icons';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/store';
import * as S from '../lib/social';
import './Social.css';

type Tab = 'amigos' | 'cutucar' | 'chat';

const SocialPanel: React.FC = () => {
  const myName = useStore((s) => s.users.find((u) => u.id === s.active)?.name || 'Eu');
  const myProfiles = useStore((s) => s.users.map((u) => ({ id: u.id, name: u.name, color: u.color })));

  const [tab, setTab] = useState<Tab>('amigos');
  const [uid, setUid] = useState('');
  const [friendships, setFriendships] = useState<S.Friendship[]>([]);
  const [accounts, setAccounts] = useState<S.SocialAccount[]>([]);
  const [pokes, setPokes] = useState<S.Poke[]>([]);
  const [invite, setInvite] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatWith, setChatWith] = useState<{ uid: string; name: string } | null>(null);
  const [msgs, setMsgs] = useState<S.Message[]>([]);
  const [draft, setDraft] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  const loadAll = useCallback(async () => {
    const [fs, ac, pk] = await Promise.all([S.listFriendships(), S.listAccounts(), S.listPokes()]);
    setFriendships(fs); setAccounts(ac); setPokes(pk); setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id || ''));
    loadAll();
    const unsub = S.subscribeSocial(() => { loadAll(); });
    return unsub;
  }, [loadAll]);

  // chat: carrega + realtime
  const loadChat = useCallback(async (fuid: string) => {
    setMsgs(await S.listMessages(fuid));
    setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, []);
  useEffect(() => {
    if (!chatWith) return;
    loadChat(chatWith.uid);
    const unsub = S.subscribeSocial(() => loadChat(chatWith.uid));
    return unsub;
  }, [chatWith, loadChat]);

  // marca cutucadas como vistas ao abrir a aba
  useEffect(() => { if (tab === 'cutucar') S.markPokesSeen().then(loadAll); }, [tab, loadAll]);

  const byUid = new Map(accounts.map((a) => [a.uid, a]));
  const friendUids = new Set(friendships.filter((f) => f.status === 'accepted').map((f) => (f.requester === uid ? f.addressee : f.requester)));
  const incoming = friendships.filter((f) => f.status === 'pending' && f.addressee === uid);
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.requester === uid);
  const friends = [...friendUids].map((u) => byUid.get(u)).filter(Boolean) as S.SocialAccount[];
  const recvPokes = pokes.filter((p) => p.to_uid === uid && p.from_uid !== uid);

  const doInvite = async () => {
    if (!invite.trim()) return;
    const r = await S.inviteByEmail(invite.trim());
    setToast(r.msg); if (r.ok) { setInvite(''); loadAll(); }
  };
  const doPoke = async (toUid: string, profile?: string) => {
    await S.poke(toUid, myName, profile);
    setToast(`Cutucou ${profile || ''}! 👉`);
  };
  const send = async () => {
    if (!draft.trim() || !chatWith) return;
    const b = draft.trim(); setDraft('');
    await S.sendMessage(chatWith.uid, b);
    loadChat(chatWith.uid);
  };
  const accLabel = (a?: S.SocialAccount) => a?.profiles?.[0]?.name || a?.email || 'Amigo';

  return (
    <div className="sc-panel">
      <div className="sc-tabs">
        <button className={tab === 'amigos' ? 'on' : ''} onClick={() => setTab('amigos')}><IonIcon icon={peopleOutline} /> Amigos</button>
        <button className={tab === 'cutucar' ? 'on' : ''} onClick={() => setTab('cutucar')}>
          <IonIcon icon={handLeftOutline} /> Cutucar
          {recvPokes.some((p) => !p.seen) && <span className="sc-dot" />}
        </button>
        <button className={tab === 'chat' ? 'on' : ''} onClick={() => { setTab('chat'); setChatWith(null); }}><IonIcon icon={chatbubblesOutline} /> Chat</button>
      </div>

      {loading ? <div className="sc-loading"><IonSpinner /></div> : (
        <div className="sc-body">
          {tab === 'amigos' && (
            <>
              <div className="sc-invite">
                <input type="email" inputMode="email" placeholder="email do amigo" value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doInvite()} />
                <button onClick={doInvite}><IonIcon icon={personAddOutline} /> Convidar</button>
              </div>
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
                      <button className="sc-mini" onClick={() => { setChatWith({ uid: a.uid, name: accLabel(a) }); setTab('chat'); }}><IonIcon icon={chatbubblesOutline} /></button>
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
            </>
          )}

          {tab === 'cutucar' && (
            <>
              {recvPokes.length > 0 && (
                <div className="sc-sec"><h4>Cutucadas recebidas</h4>
                  {recvPokes.slice(0, 12).map((p) => (
                    <div key={p.id} className="sc-poke"><span>{p.emoji || '👉'}</span> <b>{p.from_label || 'Alguém'}</b> te cutucou{p.to_profile ? ` (${p.to_profile})` : ''}!</div>
                  ))}
                </div>
              )}
              <div className="sc-sec"><h4>Sua equipe</h4>
                {myProfiles.filter((p) => p.name !== myName).length === 0 ? <p className="sc-empty">Só você por aqui.</p> :
                  myProfiles.filter((p) => p.name !== myName).map((p) => (
                    <div key={p.id} className="sc-row">
                      <span className="sc-name"><span className="sc-av" style={{ background: p.color }} />{p.name}</span>
                      <button className="sc-mini poke" onClick={() => doPoke(uid, p.name)}>👉 Cutucar</button>
                    </div>
                  ))}
              </div>
              <div className="sc-sec"><h4>Amigos</h4>
                {friends.length === 0 ? <p className="sc-empty">Adicione amigos na aba Amigos.</p> :
                  friends.flatMap((a) => (a.profiles || []).map((p) => (
                    <div key={a.uid + p.id} className="sc-row">
                      <span className="sc-name"><span className="sc-av" style={{ background: p.color }} />{p.name} <small>{a.email}</small></span>
                      <button className="sc-mini poke" onClick={() => doPoke(a.uid, p.name)}>👉 Cutucar</button>
                    </div>
                  )))}
              </div>
            </>
          )}

          {tab === 'chat' && (
            chatWith ? (
              <div className="sc-chat">
                <div className="sc-chat-top"><button onClick={() => setChatWith(null)}><IonIcon icon={arrowBack} /></button><b>{chatWith.name}</b></div>
                <div className="sc-msgs">
                  {msgs.length === 0 ? <p className="sc-empty">Diga oi 👋</p> :
                    msgs.map((m) => <div key={m.id} className={'sc-msg' + (m.from_uid === uid ? ' me' : '')}>{m.body}</div>)}
                  <div ref={chatEnd} />
                </div>
                <div className="sc-send">
                  <input placeholder="mensagem…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                  <button onClick={send}><IonIcon icon={sendOutline} /></button>
                </div>
              </div>
            ) : (
              <div className="sc-sec"><h4>Conversar com</h4>
                {friends.length === 0 ? <p className="sc-empty">Adicione amigos pra conversar.</p> :
                  friends.map((a) => (
                    <button key={a.uid} className="sc-row sc-tap" onClick={() => setChatWith({ uid: a.uid, name: accLabel(a) })}>
                      <span className="sc-name"><IonIcon icon={chatbubblesOutline} /> {accLabel(a)}</span>
                    </button>
                  ))}
              </div>
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
  return (
    <>
      <button className="social-btn" onClick={() => setOpen(true)} aria-label="Social">
        <IonIcon icon={people} />
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
