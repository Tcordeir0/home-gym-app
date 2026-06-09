import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import './ProfileBar.css';

/** Pílulas de perfil (trocáveis). Perfil ativo é por aparelho. */
const ProfileBar: React.FC = () => {
  const users = useStore((s) => s.users);
  const active = useStore((s) => s.active);
  const setActive = useStore((s) => s.setActive);

  return (
    <div className="profile-bar">
      {users.map((u) => (
        <motion.button
          key={u.id}
          whileTap={{ scale: 0.94 }}
          className={'profile-pill' + (u.id === active ? ' active' : '')}
          onClick={() => setActive(u.id)}
        >
          {u.photo ? (
            <img className="profile-av" src={u.photo} alt="" />
          ) : (
            <span className="profile-av" style={{ background: u.color }}>
              {(u.name.trim()[0] || '?').toUpperCase()}
            </span>
          )}
          <span className="profile-name">{u.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default ProfileBar;
