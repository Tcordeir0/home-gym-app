import { useState, useMemo } from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { closeOutline, addOutline, arrowBackOutline } from 'ionicons/icons';
import { EXERCISE_LIB, LIB_MUSCLES, type LibExercise } from '../data/exerciseLib';
import './ExerciseLibrary.css';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Biblioteca de exercícios (Free Exercise DB). Navegar por músculo/busca, ver imagens, e
// (se onAdd) adicionar ao treino. Camada paralela ao POOL — não mexe no gerador.
const ExerciseLibrary: React.FC<{ open: boolean; onClose: () => void; onAdd?: (ex: LibExercise) => void }> = ({ open, onClose, onAdd }) => {
  const [q, setQ] = useState('');
  const [mus, setMus] = useState<string | null>(null);
  const [detail, setDetail] = useState<LibExercise | null>(null);
  const qn = norm(q.trim());

  const list = useMemo(() => {
    if (!qn && !mus) return [];
    return EXERCISE_LIB.filter((e) => (!mus || e.mk === mus) && (!qn || norm(e.n).includes(qn))).slice(0, 80);
  }, [qn, mus]);

  const close = () => { setDetail(null); setQ(''); setMus(null); onClose(); };

  return (
    <IonModal isOpen={open} onDidDismiss={close}>
      <IonContent className="lib-content">
        <div className="lib-wrap">
          {detail ? (
            <div className="lib-detail">
              <button className="lib-back" onClick={() => setDetail(null)}><IonIcon icon={arrowBackOutline} /> Voltar</button>
              <h2 className="lib-d-name">{detail.n}</h2>
              <p className="lib-d-meta">{detail.m} · {detail.eq} · {detail.lv}</p>
              <div className="lib-imgs">
                {detail.img.map((src, i) => <img key={i} src={src} alt={detail.n} loading="lazy" />)}
              </div>
              {onAdd && (
                <button className="ds-btn ds-btn--primary lib-add" onClick={() => { onAdd(detail); close(); }}>
                  <IonIcon icon={addOutline} /> Adicionar ao treino
                </button>
              )}
              <p className="lib-note">Imagens: Free Exercise DB (domínio público). Nome em inglês — o movimento está nas imagens.</p>
            </div>
          ) : (
            <>
              <div className="lib-head">
                <h2 className="lib-title">📚 Biblioteca de exercícios</h2>
                <button className="lib-close" onClick={close} aria-label="Fechar"><IonIcon icon={closeOutline} /></button>
              </div>
              <input
                className="bal-in lib-search"
                placeholder="Buscar exercício (em inglês: bench, squat…)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="lib-chips">
                {LIB_MUSCLES.map((m) => (
                  <button key={m.k} className={'ds-chip' + (mus === m.k ? ' on' : '')} onClick={() => setMus(mus === m.k ? null : m.k)}>
                    {m.l}
                  </button>
                ))}
              </div>
              {!qn && !mus ? (
                <p className="lib-empty">Escolha um músculo ou busque pra ver os {EXERCISE_LIB.length} exercícios.</p>
              ) : list.length === 0 ? (
                <p className="lib-empty">Nada encontrado.</p>
              ) : (
                <>
                  <div className="lib-grid">
                    {list.map((e, i) => (
                      <button key={i} className="lib-card" onClick={() => setDetail(e)}>
                        <img className="lib-card-img" src={e.img[0]} alt={e.n} loading="lazy" />
                        <span className="lib-card-n">{e.n}</span>
                        <span className="lib-card-m">{e.m} · {e.eq}</span>
                      </button>
                    ))}
                  </div>
                  {list.length === 80 && <p className="lib-empty">Mostrando 80 — refine a busca.</p>}
                </>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ExerciseLibrary;
