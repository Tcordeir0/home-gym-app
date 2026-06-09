import { useRef, useState } from 'react';
import {
  IonCard, IonCardContent, IonIcon, IonModal, IonContent, IonDatetime, IonSelect, IonSelectOption,
} from '@ionic/react';
import { motion } from 'framer-motion';
import { calendarOutline, downloadOutline, cloudUploadOutline } from 'ionicons/icons';
import { useStore, useActiveProfile } from '../store/store';
import './Ferramentas.css';

const todayISO = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

type Tp = 'A' | 'B' | 'C' | 'cardio';

const Ferramentas: React.FC<{ onToast: (m: string) => void }> = ({ onToast }) => {
  const profile = useActiveProfile();
  const addBackdated = useStore((s) => s.addBackdated);
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<Tp>('A');
  const [cardioLabel, setCardioLabel] = useState(profile.cardios?.[0]?.label || 'Corrida');
  const fileRef = useRef<HTMLInputElement>(null);

  const register = () => {
    const cardio = type === 'cardio'
      ? (profile.cardios || []).find((c) => c.label === cardioLabel) || { label: cardioLabel }
      : undefined;
    const r = addBackdated(type, date, cardio);
    onToast(r === 'dup' ? 'Já existe esse treino nessa data' : 'Registrado! 💪');
    if (r === 'ok') setOpen(false);
  };

  const doExport = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'home-gym-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Backup exportado 📁');
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    onToast(importState(txt) ? 'Backup importado ✅' : 'Arquivo inválido');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <IonCard className="prog-card">
      <IonCardContent>
        <h2 className="card-title">Ferramentas</h2>
        <button className="ferr-row" onClick={() => { setType('A'); setDate(todayISO()); setOpen(true); }}>
          <IonIcon icon={calendarOutline} /> <span>Registrar treino/cardio em outra data</span>
        </button>
        <button className="ferr-row" onClick={doExport}>
          <IonIcon icon={downloadOutline} /> <span>Exportar backup (JSON)</span>
        </button>
        <button className="ferr-row" onClick={() => fileRef.current?.click()}>
          <IonIcon icon={cloudUploadOutline} /> <span>Importar backup</span>
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      </IonCardContent>

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} breakpoints={[0, 0.92]} initialBreakpoint={0.92} handle>
        <IonContent className="ferr-content">
          <div className="ferr-wrap">
            <h2 className="ferr-title">Registrar em outra data</h2>
            <div className="ferr-types">
              {(['A', 'B', 'C', 'cardio'] as Tp[]).map((t) => (
                <button key={t} className={'ferr-type' + (type === t ? ' on' : '')} onClick={() => setType(t)}>
                  {t === 'cardio' ? 'Cardio' : 'Treino ' + t}
                </button>
              ))}
            </div>
            {type === 'cardio' && (
              <IonSelect
                className="ferr-select"
                value={cardioLabel}
                interface="action-sheet"
                aria-label="Tipo de cardio"
                onIonChange={(e) => setCardioLabel(e.detail.value)}
              >
                {(profile.cardios || []).map((c) => (
                  <IonSelectOption key={c.label} value={c.label}>{(c.emoji || '') + ' ' + c.label}</IonSelectOption>
                ))}
              </IonSelect>
            )}
            <IonDatetime
              className="ferr-date"
              presentation="date"
              locale="pt-BR"
              max={todayISO()}
              value={date}
              onIonChange={(e) => {
                const v = e.detail.value;
                if (typeof v === 'string') setDate(v.split('T')[0]);
              }}
            />
            <motion.button whileTap={{ scale: 0.97 }} className="ferr-go" onClick={register}>
              Registrar +{type === 'cardio' ? 30 : 50} pts
            </motion.button>
          </div>
        </IonContent>
      </IonModal>
    </IonCard>
  );
};

export default Ferramentas;
