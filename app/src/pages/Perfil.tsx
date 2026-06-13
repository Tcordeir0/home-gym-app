import { useRef, useState, useEffect } from 'react';
import { IonCard, IonCardContent, IonInput, IonIcon, IonAlert, IonToggle, IonToast } from '@ionic/react';
import { motion } from 'framer-motion';
import { addOutline, cameraOutline, trashOutline, lockClosed, checkmark, chevronDown, banOutline, logOutOutline, warningOutline } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import { useStore, useActiveProfile, COLORS } from '../store/store';
import { fxTick, fxBuzzTest } from '../lib/feedback';
import { requestNotifications, vibrationSupported } from '../lib/permissions';
import { pushNow } from '../lib/sync';
import Collapsible from '../components/Collapsible';
import Ferramentas from '../components/Ferramentas';
import ChangelogHistory from '../components/ChangelogHistory';
import EmBreve from '../components/EmBreve';
import { totalPoints, levelInfo } from '../lib/stats';
import { APP_VERSION } from '../lib/version';
import { resizePhoto } from '../lib/image';
import { EQUIPMENT_OPTIONS } from '../data/pool';
import { CARDIO_CATALOG } from '../data/cardios';
import { THEMES, isTester } from '../data/themes';
import { DECOS } from '../data/decos';
import { FRAMES } from '../data/frames';
import { supabase } from '../lib/supabase';
import { PACK_LABELS, type Pack } from '../data/gameicons';
import PixelIcon from '../components/PixelIcon';
import type { Cardio, Feedback } from '../store/types';
import './Perfil.css';

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // domingo → sábado

const Perfil: React.FC = () => {
  const profile = useActiveProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const deleteProfile = useStore((s) => s.deleteProfile);
  const clearProfileData = useStore((s) => s.clearProfileData);
  const users = useStore((s) => s.users);
  const scores = useStore((s) => s.scores);
  const feedback = useStore((s) => s.feedback);
  const setFeedback = useStore((s) => s.setFeedback);
  const notifyOn = useStore((s) => s.notifyOn);
  const setNotifyOn = useStore((s) => s.setNotifyOn);
  const setTheme = useStore((s) => s.setTheme);
  const setHat = useStore((s) => s.setHat);
  const setFrame = useStore((s) => s.setFrame);
  const setThemePhoto = useStore((s) => s.setThemePhoto);

  const tester = isTester(profile.name);
  const unlockedThemes = profile.cosmetics?.themes || [];
  const unlockedHats = profile.cosmetics?.hats || [];
  const unlockedFrames = profile.cosmetics?.frames || [];
  const curTheme = profile.cosmetics?.theme || 'dark';
  const curThemeHasPhoto = !!THEMES.find((t) => t.id === curTheme)?.image;
  const photoOn = !profile.cosmetics?.photoOff;

  const somOn = feedback === 'both' || feedback === 'sound';
  const vibOn = feedback === 'both' || feedback === 'vibrate';
  const calcFeedback = (som: boolean, vib: boolean): Feedback =>
    som && vib ? 'both' : som ? 'sound' : vib ? 'vibrate' : 'none';

  const [addCardio, setAddCardio] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [persOpen, setPersOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Botão Salvar: aparece quando você muda algo no perfil e força a gravação
  // na NUVEM/conta (não fica só no localStorage). Auto-sync já roda, mas o botão
  // garante e dá confirmação visual.
  const watchKey = useStore((s) => {
    const p = s.users.find((u) => u.id === s.active);
    return JSON.stringify(p) + '|' + s.feedback + '|' + s.notifyOn;
  });
  const firstWatch = useRef(true);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (firstWatch.current) { firstWatch.current = false; return; }
    setDirty(true);
  }, [watchKey]);
  const saveAll = async () => {
    await pushNow();
    setDirty(false);
    setToast('Tudo salvo na sua conta ☁️ ✓');
  };

  // Vibração: pede/testa ao ATIVAR (no iOS web não existe; no app nativo usa Haptics).
  const onVibToggle = (on: boolean) => {
    if (on && !vibrationSupported()) {
      setToast('Vibração não é suportada neste navegador. Instale o app pra sentir o retorno.');
      return;
    }
    setFeedback(calcFeedback(somOn, on));
    if (on) fxBuzzTest();
  };
  // Notificações: pede permissão ao ATIVAR; só liga se concedida.
  const onNotifToggle = async (on: boolean) => {
    if (!on) { setNotifyOn(false); return; }
    const ok = await requestNotifications();
    if (ok) { setNotifyOn(true); setToast('Notificações ativadas 🔔'); }
    else { setNotifyOn(false); setToast('Permissão de notificação negada. Ative nas configurações do sistema.'); }
  };
  const [accountEmail, setAccountEmail] = useState('');
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAccountEmail(data.user?.email || '')); }, []);
  const photoRef = useRef<HTMLInputElement>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await resizePhoto(f, 400);
    updateProfile(profile.id, { photo: url });
    if (photoRef.current) photoRef.current.value = '';
  };

  const lvl = levelInfo(totalPoints({ scores }, profile.id));
  const location = profile.location || 'casa';
  const equip = profile.equipment || [];
  const cardios = profile.cardios || [];

  const toggleEquip = (key: string) => {
    const next = equip.includes(key) ? equip.filter((k) => k !== key) : [...equip, key];
    if (!next.length) return; // mantém ao menos 1 selecionado
    updateProfile(profile.id, { equipment: next });
  };

  const hasCardio = (label: string) => cardios.some((c) => c.label === label);
  const toggleCardio = (c: Cardio) => {
    const next = hasCardio(c.label) ? cardios.filter((x) => x.label !== c.label) : [...cardios, c];
    if (!next.length) return; // mantém ao menos 1
    updateProfile(profile.id, { cardios: next });
  };
  const addCustomCardio = (label: string) => {
    const v = label.trim();
    if (!v || hasCardio(v)) return;
    updateProfile(profile.id, { cardios: [...cardios, { label: v, emoji: '🔥' }] });
  };
  // catálogo + customs do perfil que não estão no catálogo
  const customs = cardios.filter((c) => !CARDIO_CATALOG.some((k) => k.label === c.label));
  const cardioList = [...CARDIO_CATALOG, ...customs];

  const schedule = profile.schedule || { days: [], time: '18:00', ntfy: '' };
  const toggleDay = (i: number) => {
    const days = schedule.days.includes(i)
      ? schedule.days.filter((d) => d !== i)
      : [...schedule.days, i].sort((a, b) => a - b);
    updateProfile(profile.id, { schedule: { ...schedule, days } });
  };

  return (
    <AppPage title="Perfil" accessory={<><EmBreve /><ChangelogHistory /></>}>
      {/* Identidade */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <div className="perfil-head">
            <div className={'perfil-av-wrap av-frame-' + (profile.cosmetics?.frame || 'none')}>
              <button className="perfil-av" style={{ background: profile.color }} onClick={() => photoRef.current?.click()} aria-label="Trocar foto">
                {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name[0] || '?').toUpperCase()}
                <span className="perfil-av-cam"><IonIcon icon={cameraOutline} /></span>
                {profile.cosmetics?.hat && <span className="perfil-av-deco"><PixelIcon id={profile.cosmetics.hat} size={20} /></span>}
              </button>
            </div>
            <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <div className="perfil-id">
              <IonInput
                className="perfil-name"
                value={profile.name}
                aria-label="Nome do perfil"
                autocomplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                onIonChange={(e) => {
                  const v = (e.detail.value || '').trim();
                  if (!v || v === profile.name) return;
                  const taken = users.some((u) => u.id !== profile.id && u.name.toLowerCase() === v.toLowerCase());
                  if (taken) {
                    const sug = [v + '2', v + ' Jr', v + 'X'].filter((s) => !users.some((u) => u.name.toLowerCase() === s.toLowerCase()));
                    setToast(`"${v}" já existe nesta conta. Que tal: ${sug.slice(0, 2).join(' · ')}?`);
                    return;
                  }
                  updateProfile(profile.id, { name: v });
                }}
              />
              <span className="perfil-lvl">Nível {lvl.level} · {lvl.into}/{lvl.span} XP</span>
            </div>
          </div>

          {profile.photo && (
            <div className="perfil-actions">
              <button className="perfil-link" onClick={() => updateProfile(profile.id, { photo: undefined })}>
                Remover foto
              </button>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={delOpen}
        onDidDismiss={() => setDelOpen(false)}
        header={`Excluir ${profile.name}?`}
        message="Todos os dados desse perfil (treinos, dieta, progresso) serão apagados deste aparelho."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Excluir', role: 'destructive', handler: () => deleteProfile(profile.id) },
        ]}
      />
      <IonAlert
        isOpen={logoutOpen}
        onDidDismiss={() => setLogoutOpen(false)}
        header="Sair da conta?"
        message="Você vai voltar pra tela de login. Os dados ficam salvos na nuvem e voltam ao entrar de novo."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Sair', role: 'destructive', handler: () => { void supabase.auth.signOut(); } },
        ]}
      />
      <IonAlert
        isOpen={clearOpen}
        onDidDismiss={() => setClearOpen(false)}
        header={`Limpar dados de ${profile.name}?`}
        message="Apaga treinos, dieta, progresso e pontos deste perfil. O perfil, temas e aros continuam. Não dá pra desfazer."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Limpar', role: 'destructive', handler: () => { clearProfileData(profile.id); setToast('Dados do perfil limpos.'); } },
        ]}
      />

      {/* Personalizar: cor + tema + cosméticos (colapsável) */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <button className="pers-toggle" onClick={() => setPersOpen((o) => !o)}>
            <span className="card-title">🎨 Personalizar</span>
            <IonIcon icon={chevronDown} className={'pers-chev' + (persOpen ? ' open' : '')} />
          </button>
          {!persOpen ? null : (
          <>
          <p className="card-sub">
            A cor pinta o app em qualquer tema. Temas e cosméticos vêm da roleta.
            {tester && ' (Tester: tudo liberado)'}
          </p>

          <h3 className="pers-h">Cor</h3>
          <div className="perfil-colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className={'perfil-color' + (profile.color === c ? ' on' : '')}
                style={{ background: c }}
                onClick={() => updateProfile(profile.id, { color: c })}
                aria-label={'Cor ' + c}
              />
            ))}
            {/* cor personalizada (RGB) — abre o seletor nativo de cores */}
            <label
              className={'perfil-color perfil-color-custom' + (!COLORS.includes(profile.color) ? ' on' : '')}
              style={!COLORS.includes(profile.color) ? { background: profile.color } : undefined}
              aria-label="Cor personalizada"
            >
              <input
                type="color"
                value={profile.color}
                onChange={(e) => updateProfile(profile.id, { color: e.target.value })}
              />
              {COLORS.includes(profile.color) && <span className="pc-plus">+</span>}
            </label>
          </div>

          <h3 className="pers-h">Tema</h3>
          <div className="theme-grid">
            {THEMES.map((th) => {
              const ok = tester || th.free || unlockedThemes.includes(th.id);
              const sel = curTheme === th.id;
              return (
                <button
                  key={th.id}
                  className={'theme-card' + (sel ? ' sel' : '') + (ok ? '' : ' locked')}
                  onClick={() => { if (ok) setTheme(th.id); }}
                >
                  <span
                    className={'theme-prev' + (th.image ? ' has-img' : '')}
                    style={th.image
                      ? { backgroundImage: `url(${th.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: th.swatch[0] }}
                  >
                    {!th.image && <>
                      <i style={{ background: th.swatch[1] }} />
                      <i style={{ background: th.swatch[2] }} />
                    </>}
                    {!ok && <span className="theme-lock"><IonIcon icon={lockClosed} /></span>}
                    {sel && <span className="theme-check"><IonIcon icon={checkmark} /></span>}
                  </span>
                  <span className="theme-name">{th.name}</span>
                </button>
              );
            })}
          </div>

          {curThemeHasPhoto && (
            <div className="ajuste-row">
              <span>🖼️ Foto do tema</span>
              <IonToggle checked={photoOn} onIonChange={(e) => setThemePhoto(e.detail.checked)} aria-label="Foto do tema" />
            </div>
          )}

          <h3 className="pers-h">Cosméticos</h3>
          <div className="deco-grid">
            {DECOS.filter((d) => d.free).map((d) => {
              const sel = (profile.cosmetics?.hat || 'none') === d.id;
              return (
                <button
                  key={d.id}
                  className={'deco-card' + (sel ? ' sel' : '')}
                  onClick={() => setHat(d.id)}
                  aria-label={d.name}
                >
                  <span className="deco-icon"><IonIcon icon={banOutline} /></span>
                  {sel && <span className="deco-check"><IonIcon icon={checkmark} /></span>}
                </button>
              );
            })}
          </div>
          {(['anime', 'poke', 'mario', 'mine'] as Pack[]).map((pk) => (
            <div key={pk}>
              <h4 className="pers-pack">{PACK_LABELS[pk]}</h4>
              <div className="deco-grid">
                {DECOS.filter((d) => d.pack === pk).map((d) => {
                  const ok = tester || unlockedHats.includes(d.id);
                  const sel = profile.cosmetics?.hat === d.id;
                  return (
                    <button
                      key={d.id}
                      className={'deco-card' + (sel ? ' sel' : '') + (ok ? '' : ' locked')}
                      onClick={() => { if (ok) setHat(d.id); }}
                      aria-label={d.name}
                    >
                      <span className="deco-icon"><PixelIcon id={d.id} size={30} /></span>
                      {!ok && <span className="deco-lock"><IonIcon icon={lockClosed} /></span>}
                      {sel && <span className="deco-check"><IonIcon icon={checkmark} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <h3 className="pers-h">Aros do avatar</h3>
          <div className="frame-grid">
            {FRAMES.map((f) => {
              const ok = tester || f.free || unlockedFrames.includes(f.id);
              const sel = (profile.cosmetics?.frame || 'none') === f.id;
              return (
                <button
                  key={f.id}
                  className={'frame-card' + (sel ? ' sel' : '') + (ok ? '' : ' locked')}
                  onClick={() => { if (ok) setFrame(f.id); }}
                  aria-label={f.name}
                >
                  <span className={'frame-prev av-frame-' + f.id}><span className="frame-prev-in" /></span>
                  <span className="frame-name">{f.name}</span>
                  {!ok && <span className="deco-lock"><IonIcon icon={lockClosed} /></span>}
                  {sel && <span className="deco-check"><IonIcon icon={checkmark} /></span>}
                </button>
              );
            })}
          </div>
          </>
          )}
        </IonCardContent>
      </IonCard>

      {/* Montar treino: local + equipamento juntos (expansível) */}
      <Collapsible title="🏋️ Montar treino">
        <p className="card-sub">Define quais exercícios o gerador escolhe pra você.</p>
        <div className="loc-toggle">
          <motion.button whileTap={{ scale: 0.96 }} className={'loc-opt' + (location === 'casa' ? ' on' : '')} onClick={() => updateProfile(profile.id, { location: 'casa' })}>
            <span className="loc-emoji">🏠</span> Casa
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} className={'loc-opt' + (location === 'academia' ? ' on' : '')} onClick={() => updateProfile(profile.id, { location: 'academia' })}>
            <span className="loc-emoji">🏋️</span> Academia
          </motion.button>
        </div>
        <h3 className="perfil-subhead">Equipamento disponível {location === 'casa' ? 'em casa' : 'na academia'}</h3>
        <div className="equip-grid">
          {EQUIPMENT_OPTIONS.map((o) => (
            <motion.button key={o.key} whileTap={{ scale: 0.95 }} className={'equip-chip' + (equip.includes(o.key) ? ' on' : '')} onClick={() => toggleEquip(o.key)}>
              {o.label}
            </motion.button>
          ))}
        </div>
        <p className="perfil-note">Valem só pro perfil <b>{profile.name}</b> e alimentam o “Montar treino” na aba Treino.</p>
      </Collapsible>

      {/* Tipos de cardio (expansível) */}
      <Collapsible title="🏃 Tipos de cardio">
        <p className="card-sub">Só os cardios que {profile.name} consegue fazer aparecem na aba Treino.</p>
        <div className="equip-grid">
          {cardioList.map((c) => (
            <motion.button key={c.label} whileTap={{ scale: 0.95 }} className={'equip-chip cardio-chip' + (hasCardio(c.label) ? ' on' : '')} onClick={() => toggleCardio(c)}>
              <span className="chip-emoji">{c.emoji || '🔥'}</span> {c.label}
            </motion.button>
          ))}
          <button className="equip-chip add-chip" onClick={() => setAddCardio(true)}>
            <IonIcon icon={addOutline} /> Adicionar
          </button>
        </div>
      </Collapsible>

      {/* Agenda de treino (expansível) */}
      <Collapsible title="📅 Agenda de treino">
        <p className="card-sub">Marque os dias que {profile.name} treina. A aba Treino lembra no dia.</p>
        <div className="agenda-days">
          {DOW.map((d, i) => (
            <button key={i} className={'agenda-day' + (schedule.days.includes(i) ? ' on' : '')} onClick={() => toggleDay(i)}>{d}</button>
          ))}
        </div>
        <div className="agenda-time">
          <span>Horário do lembrete</span>
          <input type="time" className="agenda-input" value={schedule.time || '18:00'} onChange={(e) => updateProfile(profile.id, { schedule: { ...schedule, time: e.target.value } })} />
        </div>
      </Collapsible>

      {/* Backup & dados (movido de Ferramentas, expansível) */}
      <Collapsible title="💾 Backup & dados">
        <Ferramentas onToast={setToast} bare />
      </Collapsible>

      {/* Conta & ajustes */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <h2 className="card-title">Conta & ajustes</h2>
          <p className="card-sub">Feedback ao marcar série, concluir treino e ganhar prêmios.</p>
          <div className="ajuste-row">
            <span>🔊 Som</span>
            <IonToggle
              checked={somOn}
              onIonChange={(e) => { const v = e.detail.checked; if (v) fxTick(); setFeedback(calcFeedback(v, vibOn)); }}
              aria-label="Som"
            />
          </div>
          {somOn && (
            <div className="ajuste-row">
              <span>🔉 Volume</span>
              <input
                className="vol-range"
                type="range" min={0} max={100}
                value={Math.round((profile.volume ?? 0.7) * 100)}
                onChange={(e) => updateProfile(profile.id, { volume: Number(e.target.value) / 100 })}
                onPointerUp={() => fxTick()}
                aria-label="Volume do som"
              />
            </div>
          )}
          <div className="ajuste-row">
            <span>📳 Vibração</span>
            <IonToggle
              checked={vibOn}
              onIonChange={(e) => onVibToggle(e.detail.checked)}
              aria-label="Vibração"
            />
          </div>
          <div className="ajuste-row">
            <span>🔔 Notificações</span>
            <IonToggle
              checked={notifyOn}
              onIonChange={(e) => onNotifToggle(e.detail.checked)}
              aria-label="Notificações"
            />
          </div>
          {accountEmail && <p className="perfil-account">Conectado como <b>{accountEmail}</b></p>}
          <p className="perfil-about">🏋️ Home Gym · v{APP_VERSION} · feito por Tcordeiro</p>
        </IonCardContent>
      </IonCard>

      {/* ===== Zona de perigo ===== */}
      <IonCard className="perfil-card danger-card">
        <IonCardContent>
          <h2 className="card-title danger-title"><IonIcon icon={warningOutline} /> Zona de perigo</h2>
          <p className="card-sub">Ações que não dão pra desfazer. Confirmação obrigatória.</p>
          <button className="danger-btn" onClick={() => setLogoutOpen(true)}>
            <IonIcon icon={logOutOutline} /> Sair da conta
          </button>
          <button className="danger-btn" onClick={() => setClearOpen(true)}>
            <IonIcon icon={banOutline} /> Limpar dados deste perfil
          </button>
          {users.length > 1 && (
            <button className="danger-btn del" onClick={() => setDelOpen(true)}>
              <IonIcon icon={trashOutline} /> Excluir este perfil
            </button>
          )}
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={addCardio}
        onDidDismiss={() => setAddCardio(false)}
        header="Novo cardio"
        subHeader="Ex.: Spinning, Trilha, Patins…"
        inputs={[{ name: 'label', type: 'text', placeholder: 'Nome do cardio' }]}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Adicionar', handler: (d) => addCustomCardio(d.label || '') },
        ]}
      />
      <IonToast isOpen={!!toast} message={toast} duration={2600} position="top" onDidDismiss={() => setToast('')} />
      {/* sempre no DOM (evita o crash removeChild do Ionic); some/aparece por CSS */}
      <button className={'perfil-save' + (dirty ? ' show' : '')} onClick={saveAll} aria-hidden={!dirty} tabIndex={dirty ? 0 : -1}>
        <IonIcon icon={checkmark} /> Salvar alterações
      </button>
    </AppPage>
  );
};

export default Perfil;
