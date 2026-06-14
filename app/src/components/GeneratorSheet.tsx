import { useState, useEffect } from 'react';
import { IonModal, IonContent, IonIcon, useIonRouter } from '@ionic/react';
import { motion } from 'framer-motion';
import { createOutline } from 'ionicons/icons';
import { useStore, useActiveProfile } from '../store/store';
import { FOCUS_OPTIONS, GROUP_LABEL, EQUIPMENT_OPTIONS } from '../data/pool';
import { generateWorkout, defaultLabels } from '../lib/generator';
import './GeneratorSheet.css';

const EQ_LABEL: Record<string, string> = Object.fromEntries(EQUIPMENT_OPTIONS.map((o) => [o.key, o.label]));

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

const GeneratorSheet: React.FC<Props> = ({ open, onClose, onDone }) => {
  const profile = useActiveProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const router = useIonRouter();
  const [focus, setFocus] = useState('full');
  const [days, setDays] = useState(3);
  const [warm, setWarm] = useState(true);

  useEffect(() => {
    if (open) {
      setFocus('full');
      setDays(profile.workoutDays || 3);
      setWarm(profile.warmupOn !== false);
    }
  }, [open, profile.id, profile.workoutDays, profile.warmupOn]);

  const equip = profile.equipment && profile.equipment.length ? profile.equipment : ['bodyweight'];
  const location = profile.location || 'casa';
  const equipNames = equip.map((k) => EQ_LABEL[k] || k).join(', ');

  const gen = () => {
    const treinos = generateWorkout(equip, focus, 6, days);
    const focusLabel = focus === 'full' ? 'Corpo todo' : GROUP_LABEL[focus] || focus;
    updateProfile(profile.id, {
      treinos,
      labels: defaultLabels(days),
      focus: focusLabel,
      workoutDays: days,
      warmupOn: warm,
    });
    onDone?.();
    onClose();
  };

  const editPerfil = () => {
    onClose();
    router.push('/perfil', 'forward');
  };

  return (
    <IonModal isOpen={open} onDidDismiss={onClose} breakpoints={[0, 0.8]} initialBreakpoint={0.8} handle>
      <IonContent className="gen-content">
        <div className="gen-wrap">
          <h2 className="gen-title">Montar treino</h2>
          <p className="gen-sub">
            Gera os treinos com o equipamento e o local que você definiu no Perfil. Substitui a ficha atual deste perfil.
          </p>

          <button className="gen-ctx" onClick={editPerfil}>
            <span className="gen-ctx-main">
              <span className="gen-ctx-loc">{location === 'casa' ? '🏠 Casa' : '🏋️ Academia'}</span>
              <span className="gen-ctx-eq">{equipNames}</span>
            </span>
            <span className="gen-ctx-edit">
              <IonIcon icon={createOutline} /> Ajustar
            </span>
          </button>

          <h3 className="gen-h">Nº de treinos por semana</h3>
          <div className="gen-chips">
            {[{ d: 3, l: 'A–C · 3 dias' }, { d: 4, l: 'A–D · 4 dias' }, { d: 5, l: 'A–E · 5 dias' }].map((o) => (
              <button key={o.d} className={'gen-chip' + (days === o.d ? ' on' : '')} onClick={() => setDays(o.d)}>
                {o.l}
              </button>
            ))}
          </div>

          <h3 className="gen-h">Foco</h3>
          <div className="gen-chips">
            {FOCUS_OPTIONS.map((o) => (
              <button
                key={o.key}
                className={'gen-chip' + (focus === o.key ? ' on' : '')}
                onClick={() => setFocus(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <button className={'gen-warm' + (warm ? ' on' : '')} onClick={() => setWarm((w) => !w)}>
            <span>🔥 Incluir aquecimento</span>
            <span className="gen-warm-state">{warm ? 'Sim' : 'Não'}</span>
          </button>

          <motion.button whileTap={{ scale: 0.97 }} className="gen-go" onClick={gen}>
            Gerar treino
          </motion.button>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default GeneratorSheet;
