import { useRef, useState } from 'react';
import { IonCard, IonCardContent, IonInput, IonIcon, IonAlert, IonToggle } from '@ionic/react';
import { motion } from 'framer-motion';
import { addOutline, cameraOutline, trashOutline } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import { useStore, useActiveProfile, COLORS } from '../store/store';
import { fxTick } from '../lib/feedback';
import { totalPoints, levelInfo } from '../lib/stats';
import { resizePhoto } from '../lib/image';
import { EQUIPMENT_OPTIONS } from '../data/pool';
import { CARDIO_CATALOG } from '../data/cardios';
import type { Cardio, Feedback } from '../store/types';
import './Perfil.css';

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // domingo → sábado

const Perfil: React.FC = () => {
  const profile = useActiveProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const deleteProfile = useStore((s) => s.deleteProfile);
  const users = useStore((s) => s.users);
  const scores = useStore((s) => s.scores);
  const feedback = useStore((s) => s.feedback);
  const setFeedback = useStore((s) => s.setFeedback);

  const somOn = feedback === 'both' || feedback === 'sound';
  const vibOn = feedback === 'both' || feedback === 'vibrate';
  const calcFeedback = (som: boolean, vib: boolean): Feedback =>
    som && vib ? 'both' : som ? 'sound' : vib ? 'vibrate' : 'none';

  const [addCardio, setAddCardio] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
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
    <AppPage title="Perfil">
      {/* Identidade */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <div className="perfil-head">
            <button className="perfil-av" style={{ background: profile.color }} onClick={() => photoRef.current?.click()} aria-label="Trocar foto">
              {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name[0] || '?').toUpperCase()}
              <span className="perfil-av-cam"><IonIcon icon={cameraOutline} /></span>
            </button>
            <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            <div className="perfil-id">
              <IonInput
                className="perfil-name"
                value={profile.name}
                aria-label="Nome do perfil"
                onIonChange={(e) => {
                  const v = (e.detail.value || '').trim();
                  if (v && v !== profile.name) updateProfile(profile.id, { name: v });
                }}
              />
              <span className="perfil-lvl">Nível {lvl.level} · {lvl.into}/{lvl.span} XP</span>
            </div>
          </div>

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
          </div>

          {profile.photo && (
            <button className="perfil-link" onClick={() => updateProfile(profile.id, { photo: undefined })}>
              Remover foto
            </button>
          )}
          {users.length > 1 && (
            <button className="perfil-del" onClick={() => setDelOpen(true)}>
              <IonIcon icon={trashOutline} /> Excluir perfil
            </button>
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

      {/* Local de treino */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <h2 className="card-title">Local de treino</h2>
          <p className="card-sub">Define quais exercícios o gerador escolhe pra você.</p>
          <div className="loc-toggle">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={'loc-opt' + (location === 'casa' ? ' on' : '')}
              onClick={() => updateProfile(profile.id, { location: 'casa' })}
            >
              <span className="loc-emoji">🏠</span> Casa
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={'loc-opt' + (location === 'academia' ? ' on' : '')}
              onClick={() => updateProfile(profile.id, { location: 'academia' })}
            >
              <span className="loc-emoji">🏋️</span> Academia
            </motion.button>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Equipamento disponível */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <h2 className="card-title">Equipamento disponível</h2>
          <p className="card-sub">O que você tem pra treinar {location === 'casa' ? 'em casa' : 'na academia'}.</p>
          <div className="equip-grid">
            {EQUIPMENT_OPTIONS.map((o) => (
              <motion.button
                key={o.key}
                whileTap={{ scale: 0.95 }}
                className={'equip-chip' + (equip.includes(o.key) ? ' on' : '')}
                onClick={() => toggleEquip(o.key)}
              >
                {o.label}
              </motion.button>
            ))}
          </div>
          <p className="perfil-note">
            Esses ajustes valem só para o perfil <b>{profile.name}</b> e alimentam o “Montar treino” na aba Treino.
          </p>
        </IonCardContent>
      </IonCard>

      {/* Tipos de cardio */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <h2 className="card-title">Tipos de cardio</h2>
          <p className="card-sub">Só os cardios que {profile.name} consegue fazer aparecem na aba Treino.</p>
          <div className="equip-grid">
            {cardioList.map((c) => (
              <motion.button
                key={c.label}
                whileTap={{ scale: 0.95 }}
                className={'equip-chip cardio-chip' + (hasCardio(c.label) ? ' on' : '')}
                onClick={() => toggleCardio(c)}
              >
                <span className="chip-emoji">{c.emoji || '🔥'}</span> {c.label}
              </motion.button>
            ))}
            <button className="equip-chip add-chip" onClick={() => setAddCardio(true)}>
              <IonIcon icon={addOutline} /> Adicionar
            </button>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Agenda de treino */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <h2 className="card-title">Agenda de treino</h2>
          <p className="card-sub">Marque os dias que {profile.name} treina. A aba Treino lembra no dia.</p>
          <div className="agenda-days">
            {DOW.map((d, i) => (
              <button
                key={i}
                className={'agenda-day' + (schedule.days.includes(i) ? ' on' : '')}
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="agenda-time">
            <span>Horário do lembrete</span>
            <input
              type="time"
              className="agenda-input"
              value={schedule.time || '18:00'}
              onChange={(e) => updateProfile(profile.id, { schedule: { ...schedule, time: e.target.value } })}
            />
          </div>
        </IonCardContent>
      </IonCard>

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
          <div className="ajuste-row">
            <span>📳 Vibração</span>
            <IonToggle
              checked={vibOn}
              onIonChange={(e) => setFeedback(calcFeedback(somOn, e.detail.checked))}
              aria-label="Vibração"
            />
          </div>
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
    </AppPage>
  );
};

export default Perfil;
