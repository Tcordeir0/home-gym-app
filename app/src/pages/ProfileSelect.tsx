import { useState } from 'react';
import { IonContent, IonIcon, IonAlert } from '@ionic/react';
import { motion } from 'framer-motion';
import { addOutline, lockClosed, checkmarkCircle } from 'ionicons/icons';
import { useStore } from '../store/store';
import { deviceId } from '../lib/device';
import PixelIcon from '../components/PixelIcon';
import './ProfileSelect.css';

/** Gate de escolha de perfil por aparelho: cada dispositivo reivindica 1 perfil
 *  (que ainda não esteja em uso por outro). Depois disso, abre sempre nele. */
const ProfileSelect: React.FC = () => {
  const users = useStore((s) => s.users);
  const claimProfile = useStore((s) => s.claimProfile);
  const addAndClaim = useStore((s) => s.addAndClaimProfile);
  const [creating, setCreating] = useState(false);
  const dev = deviceId();

  return (
    <IonContent className="psel-content" fullscreen>
      <div className="psel-fx" aria-hidden="true" />
      <div className="psel-wrap">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="psel-card"
        >
          <div className="psel-brand">HOME <span className="brand-hl">GYM</span></div>
          <h1 className="psel-h">Quem é você?</h1>
          <p className="psel-sub">Escolha o seu perfil. Esse aparelho fica nele — você edita só o seu e vê os outros.</p>

          <div className="psel-list">
            {users.map((u) => {
              const taken = !!u.claimedDevice && u.claimedDevice !== dev;
              return (
                <button
                  key={u.id}
                  className={'psel-item' + (taken ? ' taken' : '')}
                  disabled={taken}
                  onClick={() => { if (!taken) claimProfile(u.id); }}
                >
                  <span className="psel-av" style={{ background: u.color }}>
                    {u.photo ? <img src={u.photo} alt="" /> : (u.name.trim()[0] || '?').toUpperCase()}
                    {u.cosmetics?.hat && <span className="psel-deco"><PixelIcon id={u.cosmetics.hat} size={16} /></span>}
                  </span>
                  <span className="psel-name">{u.name}</span>
                  {taken
                    ? <span className="psel-tag"><IonIcon icon={lockClosed} /> em uso</span>
                    : <span className="psel-go"><IonIcon icon={checkmarkCircle} /></span>}
                </button>
              );
            })}

            <button className="psel-item psel-new" onClick={() => setCreating(true)}>
              <span className="psel-av psel-av-new"><IonIcon icon={addOutline} /></span>
              <span className="psel-name">Criar novo perfil</span>
            </button>
          </div>
        </motion.div>
      </div>

      <IonAlert
        isOpen={creating}
        onDidDismiss={() => setCreating(false)}
        header="Novo perfil"
        subHeader="Como te chamam?"
        inputs={[{ name: 'name', type: 'text', placeholder: 'Seu nome' }]}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Criar', handler: (d) => { const n = (d.name || '').trim(); if (n) addAndClaim(n); } },
        ]}
      />
    </IonContent>
  );
};

export default ProfileSelect;
