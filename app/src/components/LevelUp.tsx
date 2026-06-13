import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/store';
import { totalPoints, levelFor } from '../lib/stats';
import { fxSuccess } from '../lib/feedback';
import { postEvent } from '../lib/social';
import './LevelUp.css';

const CONFETTI = ['🎉', '✨', '💪', '🔥', '⭐', '🏆', '🎉', '✨'];

/** Celebração ao subir de nível (overlay global, por perfil). */
const LevelUp: React.FC = () => {
  const active = useStore((s) => s.active);
  const scores = useStore((s) => s.scores);
  const name = useStore((s) => s.users.find((u) => u.id === s.active)?.name || 'Alguém');
  const level = levelFor(totalPoints({ scores }, active));

  const seen = useRef<Record<string, number>>({});
  const [show, setShow] = useState<number | null>(null);

  useEffect(() => {
    const prev = seen.current[active];
    seen.current[active] = level;
    if (prev !== undefined && level > prev) {
      setShow(level);
      fxSuccess();
      void postEvent(name, `subiu pro nível ${level} 🎉`); // amigos veem no feed do Social
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, level]);

  useEffect(() => {
    if (show == null) return;
    const t = window.setTimeout(() => setShow(null), 2800);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show != null && (
        <motion.div
          className="lvup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(null)}
        >
          <div className="lvup-rays" />
          <motion.div
            className="lvup-panel"
            initial={{ scale: 0.6, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 17 }}
          >
            <span className="lvup-cap">Subiu de nível!</span>
            <span className="lvup-num">{show}</span>
            <span className="lvup-sub">Nível {show} 🎉</span>
          </motion.div>
          {CONFETTI.map((c, i) => (
            <motion.span
              key={i}
              className="lvup-conf"
              style={{ left: `${8 + i * 11}%` }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: [0, 1, 1, 0], y: -260 - (i % 3) * 40 }}
              transition={{ duration: 1.9, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
            >
              {c}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUp;
