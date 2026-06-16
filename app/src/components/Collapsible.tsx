import { useState, type ReactNode } from 'react';
import { IonCard, IonCardContent, IonIcon, useIonViewWillLeave } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';

/** Card de seção retrátil (estilo "Personalizar") — evita ocupar espaço à toa. */
const Collapsible: React.FC<{ title: ReactNode; defaultOpen?: boolean; danger?: boolean; children: ReactNode }> = ({ title, defaultOpen, danger, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  // ao SAIR da página, volta ao padrão (não fica tudo aberto quando você volta) — só UI, não toca dados
  useIonViewWillLeave(() => setOpen(!!defaultOpen));
  return (
    <IonCard className={'perfil-card' + (danger ? ' danger-card' : '')}>
      <IonCardContent>
        <button className="pers-toggle" onClick={() => setOpen((o) => !o)}>
          <span className={'card-title' + (danger ? ' danger-title' : '')}>{title}</span>
          <IonIcon icon={chevronDown} className={'pers-chev' + (open ? ' open' : '')} />
        </button>
        {open && <div className="collap-body">{children}</div>}
      </IonCardContent>
    </IonCard>
  );
};

export default Collapsible;
