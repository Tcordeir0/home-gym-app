import { IonIcon } from '@ionic/react';
import { flame, checkmarkCircle, barbell } from 'ionicons/icons';
import { useStore, useActiveProfile, todayISO } from '../store/store';
import { weekDates } from '../lib/league';
import './TreinoBanner.css';

/** Banner só na aba Treino: dia de treino / concluído. Em dia de descanso some. */
const TreinoBanner: React.FC = () => {
  const profile = useActiveProfile();
  const history = useStore((s) => s.history[s.active]) || [];
  const today = todayISO();
  const week = weekDates();

  const doneToday = history.some((e) => e.date === today && e.w !== 'cardio');
  const weekTreinos = history.filter((e) => week.includes(e.date) && e.w !== 'cardio').length;

  const days = profile.schedule?.days || [];
  const dow = new Date().getDay();
  // dia de descanso (agendado e hoje não é dia) e ainda não treinou → sem banner
  if (days.length > 0 && !days.includes(dow) && !doneToday) return null;

  const mode = doneToday ? 'done' : 'go';
  const cfg = {
    done: { icon: checkmarkCircle, title: 'Treino de hoje concluído! 🔥' },
    go: { icon: barbell, title: 'Hoje é dia de treino 💪' },
  }[mode];

  return (
    <div className={'tbn ' + mode}>
      <IonIcon className="tbn-ico" icon={cfg.icon} />
      <div className="tbn-txt">
        <span className="tbn-title">{cfg.title}</span>
        <span className="tbn-sub">
          {weekTreinos > 0 ? (
            <>
              <IonIcon icon={flame} /> {weekTreinos} treino{weekTreinos > 1 ? 's' : ''} esta semana
              {mode === 'go' && ' — bora somar mais'}
            </>
          ) : (
            'Comece a semana com tudo!'
          )}
        </span>
      </div>
    </div>
  );
};

export default TreinoBanner;
