import { useEffect, useState } from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { logoYoutube, closeOutline } from 'ionicons/icons';
import type { Exercise } from '../data/types';
import { DEMOS } from '../data/demos';
import './DemoSheet.css';

interface Props {
  ex: Exercise | null;
  onClose: () => void;
}

const DemoSheet: React.FC<Props> = ({ ex, onClose }) => {
  const [frame, setFrame] = useState(0);
  const id = ex ? DEMOS[ex.nome] : null;

  // crossfade entre as 2 fotos da demonstração
  useEffect(() => {
    if (!id) return;
    setFrame(0);
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 1100);
    return () => clearInterval(t);
  }, [id]);

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

            {id ? (
              <div className="demo-stage">
                <img className={'demo-img' + (frame === 0 ? ' on' : '')} src={`/demos/${id}/0.jpg`} alt="" />
                <img className={'demo-img' + (frame === 1 ? ' on' : '')} src={`/demos/${id}/1.jpg`} alt="" />
              </div>
            ) : (
              <div className="demo-empty">Sem demonstração offline pra este exercício.</div>
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
