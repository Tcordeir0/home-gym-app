import { useState, useEffect } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { useStore, useActiveProfile } from '../store/store';
import { EQUIPMENT_OPTIONS, FOCUS_OPTIONS, GROUP_LABEL } from '../data/pool';
import { generateWorkout } from '../lib/generator';
import './GeneratorSheet.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

const GeneratorSheet: React.FC<Props> = ({ open, onClose, onDone }) => {
  const profile = useActiveProfile();
  const updateProfile = useStore((s) => s.updateProfile);
  const [equip, setEquip] = useState<string[]>(profile.equipment || ['bodyweight']);
  const [focus, setFocus] = useState('full');

  useEffect(() => {
    if (open) {
      setEquip(profile.equipment && profile.equipment.length ? profile.equipment : ['bodyweight']);
      setFocus('full');
    }
  }, [open, profile.id]);

  const toggleEq = (k: string) =>
    setEquip((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

  const gen = () => {
    const treinos = generateWorkout(equip, focus);
    const focusLabel = focus === 'full' ? 'Corpo todo' : GROUP_LABEL[focus] || focus;
    updateProfile(profile.id, {
      equipment: equip,
      treinos,
      labels: { A: 'Treino A', B: 'Treino B', C: 'Treino C', warm: 'Aquec.' },
      focus: focusLabel,
    });
    onDone?.();
    onClose();
  };

  return (
    <IonModal isOpen={open} onDidDismiss={onClose} breakpoints={[0, 0.9]} initialBreakpoint={0.9} handle>
      <IonContent className="gen-content">
        <div className="gen-wrap">
          <h2 className="gen-title">Montar treino</h2>
          <p className="gen-sub">
            Gera 3 treinos com base no seu equipamento e foco. Substitui a ficha atual deste perfil.
          </p>

          <h3 className="gen-h">Equipamento disponível</h3>
          <div className="gen-chips">
            {EQUIPMENT_OPTIONS.map((o) => (
              <button
                key={o.key}
                className={'gen-chip' + (equip.includes(o.key) ? ' on' : '')}
                onClick={() => toggleEq(o.key)}
              >
                {o.label}
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

          <motion.button whileTap={{ scale: 0.97 }} className="gen-go" onClick={gen}>
            Gerar treino
          </motion.button>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default GeneratorSheet;
