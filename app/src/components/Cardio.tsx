import { useState, useEffect, useRef } from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { playOutline, checkmarkOutline, stopOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { useStore, useActiveProfile } from '../store/store';
import type { Cardio as CardioType } from '../store/types';
import './Cardio.css';

const Cardio: React.FC<{ onDone?: (label: string) => void }> = ({ onDone }) => {
  const profile = useActiveProfile();
  const addCardio = useStore((s) => s.addCardio);
  const [open, setOpen] = useState<CardioType | null>(null);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (running) timer.current = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const start = (c: CardioType) => { setOpen(c); setSecs(0); setRunning(false); };
  const close = () => { setRunning(false); setOpen(null); };
  const fmt = (s: number) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const register = () => {
    if (open) { addCardio(open.label, open.emoji); onDone?.(open.label); }
    close();
  };

  return (
    <>
      <div className="cardio-section">
        <span className="cardio-label">Cardio extra</span>
        <div className="cardio-bar">
          {(profile.cardios || []).map((c, i) => (
            <motion.button key={i} whileTap={{ scale: 0.95 }} className="cardio-pill" onClick={() => start(c)}>
              <span className="cardio-emoji">{c.emoji || '🏃'}</span> {c.label}
            </motion.button>
          ))}
        </div>
      </div>

      <IonModal isOpen={!!open} onDidDismiss={close} breakpoints={[0, 0.5]} initialBreakpoint={0.5} handle>
        <IonContent className="cardio-content">
          {open && (
            <div className="cardio-wrap">
              <div className="cardio-title">{open.emoji || '🏃'} {open.label}</div>
              {!running ? (
                <>
                  <button className="cardio-primary" onClick={() => setRunning(true)}>
                    <IonIcon icon={playOutline} /> Começar agora (cronometrar)
                  </button>
                  <button className="cardio-secondary" onClick={register}>
                    <IonIcon icon={checkmarkOutline} /> Já fiz (registrar)
                  </button>
                </>
              ) : (
                <>
                  <div className="cardio-clock">{fmt(secs)}</div>
                  <button className="cardio-primary" onClick={register}>
                    <IonIcon icon={stopOutline} /> Parar e registrar
                  </button>
                </>
              )}
            </div>
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default Cardio;
