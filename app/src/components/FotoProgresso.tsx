import { useRef, useState } from 'react';
import { IonCard, IonCardContent, IonIcon, IonModal, IonContent, IonAlert } from '@ionic/react';
import { motion } from 'framer-motion';
import { cameraOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useStore } from '../store/store';
import { resizePhoto } from '../lib/image';
import './FotoProgresso.css';

const fmt = (ds: string) => {
  const [, m, d] = ds.split('-');
  return `${d}/${m}`;
};

interface Shot { date: string; photo: string; }

const FotoProgresso: React.FC = () => {
  const arr = useStore((s) => s.measures[s.active]) || [];
  const setProgressPhoto = useStore((s) => s.setProgressPhoto);
  const removeProgressPhoto = useStore((s) => s.removeProgressPhoto);

  const photos: Shot[] = arr
    .filter((m) => typeof m.photo === 'string' && m.photo)
    .map((m) => ({ date: m.date, photo: m.photo as string }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const fileRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<Shot | null>(null);
  const [delDate, setDelDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const url = await resizePhoto(f, 900);
      setProgressPhoto(url);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const first = photos[0];
  const last = photos[photos.length - 1];

  return (
    <IonCard className="prog-card">
      <IonCardContent>
        <h2 className="card-title">Foto de progresso</h2>
        <p className="card-sub">Uma foto por dia. Compare a evolução ao longo do tempo.</p>

        {photos.length >= 2 && (
          <div className="fp-compare">
            <figure>
              <img src={first.photo} alt="" onClick={() => setView(first)} />
              <figcaption>Antes · {fmt(first.date)}</figcaption>
            </figure>
            <figure>
              <img src={last.photo} alt="" onClick={() => setView(last)} />
              <figcaption>Agora · {fmt(last.date)}</figcaption>
            </figure>
          </div>
        )}

        {photos.length > 0 && (
          <div className="fp-strip">
            {photos.map((p) => (
              <button key={p.date} className="fp-thumb" onClick={() => setView(p)}>
                <img src={p.photo} alt="" />
                <span>{fmt(p.date)}</span>
              </button>
            ))}
          </div>
        )}

        {photos.length === 0 && <p className="fp-empty">Ainda sem foto. Bora registrar o ponto de partida! 📸</p>}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="fp-add"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <IonIcon icon={cameraOutline} /> {busy ? 'Processando…' : 'Adicionar foto de hoje'}
        </motion.button>
      </IonCardContent>

      <IonModal isOpen={!!view} onDidDismiss={() => setView(null)} breakpoints={[0, 0.92]} initialBreakpoint={0.92} handle>
        <IonContent className="fpv-content">
          {view && (
            <div className="fpv-wrap">
              <div className="fpv-head">
                <span className="fpv-date">{fmt(view.date)}</span>
                <button className="fpv-close" onClick={() => setView(null)} aria-label="Fechar">
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
              <img className="fpv-img" src={view.photo} alt="" />
              <button className="fpv-del" onClick={() => setDelDate(view.date)}>
                <IonIcon icon={trashOutline} /> Apagar esta foto
              </button>
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={delDate !== null}
        header="Apagar foto?"
        message="A foto desse dia será removida."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Apagar',
            role: 'destructive',
            handler: () => {
              if (delDate) removeProgressPhoto(delDate);
              setView(null);
            },
          },
        ]}
        onDidDismiss={() => setDelDate(null)}
      />
    </IonCard>
  );
};

export default FotoProgresso;
