import { useState } from 'react';
import { IonCard, IonCardContent, IonInput, IonIcon, IonAlert } from '@ionic/react';
import { motion } from 'framer-motion';
import { addOutline } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import { useStore, useActiveProfile } from '../store/store';
import { totalPoints, levelInfo } from '../lib/stats';
import { EQUIPMENT_OPTIONS } from '../data/pool';
import { CARDIO_CATALOG } from '../data/cardios';
import type { Cardio } from '../store/types';
import './Perfil.css';

const Perfil: React.FC = () => {
  const profile = useActiveProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const scores = useStore((s) => s.scores);

  const [addCardio, setAddCardio] = useState(false);

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

  return (
    <AppPage title="Perfil">
      {/* Identidade */}
      <IonCard className="perfil-card">
        <IonCardContent>
          <div className="perfil-head">
            <span className="perfil-av" style={{ background: profile.color }}>
              {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name[0] || '?').toUpperCase()}
            </span>
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
        </IonCardContent>
      </IonCard>

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
