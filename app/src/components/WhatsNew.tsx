import { useState, useEffect } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { sparkles, build, trashOutline } from 'ionicons/icons';
import { CHANGELOG } from '../data/changelog';
import './WhatsNew.css';

const SEEN_KEY = 'hgt_seen_changelog';

/** Mostra "Novidades" UMA vez por versão, após escolher o perfil. */
const WhatsNew: React.FC = () => {
  const latest = CHANGELOG[0];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!latest) return;
    let seen = '';
    try { seen = localStorage.getItem(SEEN_KEY) || ''; } catch { /* ok */ }
    if (seen !== latest.version) {
      // pequeno atraso pra entrar depois que a tela montou
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [latest]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(SEEN_KEY, latest.version); } catch { /* ok */ }
  };

  if (!latest) return null;

  const sections: { icon: string; cls: string; title: string; items?: string[] }[] = [
    { icon: sparkles, cls: 'add', title: 'Novidades', items: latest.added },
    { icon: build, cls: 'fix', title: 'Correções', items: latest.fixed },
    { icon: trashOutline, cls: 'rem', title: 'Removido', items: latest.removed },
  ];

  return (
    <IonModal isOpen={open} onDidDismiss={close} initialBreakpoint={0.85} breakpoints={[0, 0.85, 1]} handle className="wn-modal">
      <div className="wn-sheet">
        <div className="wn-head">
          <span className="wn-badge">v{latest.version}</span>
          <h2 className="wn-title">Novidades</h2>
          <p className="wn-sub">O que mudou nesta atualização</p>
        </div>
        <div className="wn-body">
          {sections.map((s) =>
            s.items && s.items.length ? (
              <div key={s.cls} className={'wn-sec ' + s.cls}>
                <h3><IonIcon icon={s.icon} /> {s.title}</h3>
                <ul>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
              </div>
            ) : null,
          )}
        </div>
        <button className="wn-cta" onClick={close}>Entendi, bora treinar 💪</button>
      </div>
    </IonModal>
  );
};

export default WhatsNew;
