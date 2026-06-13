import { useState } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { hourglassOutline, ellipse } from 'ionicons/icons';
import './EmBreve.css';

// Recursos por vir (roadmap atual). À medida que entram no app, removo daqui.
const UPCOMING = [
  'Lojinha pra comprar temas e aros com suas creatinas (₡)',
  'Mais exercícios + anatomia detalhada por músculo',
  'Cardio com cronômetro de início e fim',
  'Fotos dos perfis no Social e miniaturas nos grupos',
  'Notificação de mensagem com o app fechado',
  'Unidade de peso kg/lb',
  'Metas de casal',
];

/** Botão "Em breve" no header (ao lado do changelog). */
const EmBreve: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="eb-btn" onClick={() => setOpen(true)} aria-label="Em breve">
        <IonIcon icon={hourglassOutline} />
      </button>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6, 0.9]} handle className="eb-modal">
        <div className="eb-sheet">
          <h2 className="eb-title">🔜 Em breve</h2>
          <p className="eb-sub">O que vem por aí no Home Gym</p>
          <ul className="eb-list">
            {UPCOMING.map((t, i) => <li key={i}><IonIcon icon={ellipse} /> {t}</li>)}
          </ul>
          <button className="eb-close" onClick={() => setOpen(false)}>Fechar</button>
        </div>
      </IonModal>
    </>
  );
};

export default EmBreve;
