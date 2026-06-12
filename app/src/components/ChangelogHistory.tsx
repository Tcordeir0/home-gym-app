import { useState } from 'react';
import { IonModal, IonIcon } from '@ionic/react';
import { sparkles, build, trashOutline, closeOutline } from 'ionicons/icons';
import { CHANGELOG, type ChangelogEntry } from '../data/changelog';
import './WhatsNew.css';
import './ChangelogHistory.css';

const SECS = [
  { icon: sparkles, cls: 'add', title: 'Novidades', key: 'added' },
  { icon: build, cls: 'fix', title: 'Correções', key: 'fixed' },
  { icon: trashOutline, cls: 'rem', title: 'Removido', key: 'removed' },
] as const;

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmtDate(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number);
  return `${d} ${MES[(m || 1) - 1]} ${y}`;
}

/** Botão no header do Perfil que abre o histórico completo de changelogs. */
const ChangelogHistory: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="clh-btn" onClick={() => setOpen(true)} aria-label="Novidades e histórico">
        <IonIcon icon={sparkles} />
      </button>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} className="clh-modal">
        <div className="clh-top">
          <h2 className="clh-title">Novidades & histórico</h2>
          <button className="clh-close" onClick={() => setOpen(false)} aria-label="Fechar"><IonIcon icon={closeOutline} /></button>
        </div>
        <div className="clh-body">
          {CHANGELOG.map((e) => (
            <div key={e.version} className="clh-entry">
              <div className="clh-ver">
                <span className="wn-badge">v{e.version}</span>
                <span className="clh-date">{fmtDate(e.date)}</span>
              </div>
              {SECS.map((s) => {
                const items = e[s.key as keyof ChangelogEntry] as string[] | undefined;
                return items && items.length ? (
                  <div key={s.cls} className={'wn-sec ' + s.cls}>
                    <h3><IonIcon icon={s.icon} /> {s.title}</h3>
                    <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </div>
                ) : null;
              })}
            </div>
          ))}
        </div>
      </IonModal>
    </>
  );
};

export default ChangelogHistory;
