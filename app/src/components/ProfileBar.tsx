import { motion } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useStore } from '../store/store';
import PixelIcon from './PixelIcon';
import PillFX from './PillFX';
import './ProfileBar.css';

/** Pílulas de perfil (trocáveis) + adicionar. Perfil ativo é por aparelho. */
const ProfileBar: React.FC = () => {
  const users = useStore((s) => s.users);
  const active = useStore((s) => s.active);
  const setActive = useStore((s) => s.setActive);
  const addProfile = useStore((s) => s.addProfile);

  return (
    <div className="profile-bar">
      {users.map((u) => (
        <motion.button
          key={u.id}
          whileTap={{ scale: 0.94 }}
          className={'profile-pill' + (u.id === active ? ' active' : '')}
          onClick={() => setActive(u.id)}
        >
          <PillFX theme={u.cosmetics?.theme} />
          <span className={'profile-av-wrap av-frame-' + (u.cosmetics?.frame || 'none')}>
            {u.photo ? (
              <img className="profile-av" src={u.photo} alt="" />
            ) : (
              <span className="profile-av" style={{ background: u.color }}>
                {(u.name.trim()[0] || '?').toUpperCase()}
              </span>
            )}
            {u.cosmetics?.hat && <span className="av-deco"><PixelIcon id={u.cosmetics.hat} size={14} /></span>}
          </span>
          <span className="profile-name">{u.name}</span>
        </motion.button>
      ))}
      {users.length < 8 && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="profile-add"
          onClick={() => addProfile()}
          aria-label="Adicionar perfil"
        >
          <IonIcon icon={add} />
        </motion.button>
      )}
    </div>
  );
};

export default ProfileBar;
