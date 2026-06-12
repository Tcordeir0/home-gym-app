import { useState } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { people, peopleOutline, chatbubblesOutline, handLeftOutline, trophyOutline } from 'ionicons/icons';
import './Social.css';

/** Botão Social no header do Treino. Por enquanto abre um sheet "Em breve"
 *  teasando o que vem (convite, chat, cutucar, compartilhar conquistas). */
const Social: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="social-btn" onClick={() => setOpen(true)} aria-label="Social">
        <IonIcon icon={people} />
      </button>
      <IonModal
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        initialBreakpoint={0.62}
        breakpoints={[0, 0.62, 0.92]}
        handle
        className="social-modal"
      >
        <div className="social-sheet">
          <div className="social-icon"><IonIcon icon={peopleOutline} /></div>
          <h2 className="social-title">Social</h2>
          <span className="social-soon">⏳ Em breve</span>
          <p className="social-lead">Conecte com a família e amigos pra treinar junto:</p>
          <ul className="social-feats">
            <li><IonIcon icon={peopleOutline} /> Convidar por <b>email</b> ou perfil de outras contas</li>
            <li><IonIcon icon={chatbubblesOutline} /> Conversar no <b>chat</b></li>
            <li><IonIcon icon={handLeftOutline} /> <b>Cutucar</b> quem tá devendo treino (na equipe ou fora)</li>
            <li><IonIcon icon={trophyOutline} /> <b>Compartilhar conquistas</b> com o grupo</li>
          </ul>
          <button className="social-close" onClick={() => setOpen(false)}>Fechar</button>
        </div>
      </IonModal>
    </>
  );
};

export default Social;
