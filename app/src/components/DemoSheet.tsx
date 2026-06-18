import { useEffect, useState } from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { logoYoutube, closeOutline } from 'ionicons/icons';
import type { Exercise } from '../data/types';
import { DEMOS } from '../data/demos';
import { EXERCISE_LIB } from '../data/exerciseLib';
import './DemoSheet.css';

interface Props {
  ex: Exercise | null;
  onClose: () => void;
}

const DemoSheet: React.FC<Props> = ({ ex, onClose }) => {
  const [frame, setFrame] = useState(0);
  // 1º a demo OFFLINE curada (/demos); senão, as imagens da BIBLIOTECA (Free Exercise DB, CDN).
  const id = ex ? DEMOS[ex.nome] : null;
  const libImgs = !id && ex ? EXERCISE_LIB.find((e) => e.n === ex.nome)?.img || [] : [];
  const imgs: string[] = id ? [`/demos/${id}/0.jpg`, `/demos/${id}/1.jpg`] : libImgs;

  // crossfade entre as 2 fotos (quando há 2)
  useEffect(() => {
    if (imgs.length < 2) { setFrame(0); return; }
    setFrame(0);
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 950);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex?.nome, imgs.length]);

  const yt = ex
    ? 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent(ex.nome + ' execução exercício')
    : '#';

  return (
    <IonModal
      isOpen={!!ex}
      onDidDismiss={onClose}
      breakpoints={[0, 0.85]}
      initialBreakpoint={0.85}
      handle
    >
      <IonContent className="demo-content">
        {ex && (
          <div className="demo-wrap">
            <div className="demo-head">
              <h2 className="demo-title">{ex.nome}</h2>
              <button className="demo-close" onClick={onClose} aria-label="Fechar">
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {imgs.length ? (
              <div className="demo-stage">
                {imgs.length >= 2 ? (
                  <>
                    <img className={'demo-img' + (frame === 0 ? ' on' : '')} src={imgs[0]} alt="" />
                    <img className={'demo-img' + (frame === 1 ? ' on' : '')} src={imgs[1]} alt="" />
                  </>
                ) : (
                  <img className="demo-img on" src={imgs[0]} alt="" />
                )}
              </div>
            ) : (
              <div className="demo-empty">Sem demonstração offline pra este exercício — toque no YouTube abaixo pra ver a execução certa.</div>
            )}

            <p className="demo-tip">{ex.dica}</p>

            <a className="demo-yt" href={yt} target="_blank" rel="noopener noreferrer">
              <IonIcon icon={logoYoutube} /> Ver vídeo no YouTube
            </a>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default DemoSheet;
