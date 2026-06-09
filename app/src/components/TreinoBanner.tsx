import { IonIcon } from '@ionic/react';
import { flame, checkmarkCircle, barbell } from 'ionicons/icons';
import { useStore, todayISO } from '../store/store';
import { weekDates } from '../lib/league';
import './TreinoBanner.css';

/** Banner só na aba Treino: lembra de treinar hoje / parabeniza se já treinou. */
const TreinoBanner: React.FC = () => {
  const history = useStore((s) => s.history[s.active]) || [];
  const today = todayISO();
  const week = weekDates();

  const doneToday = history.some((e) => e.date === today && e.w !== 'cardio');
  const weekTreinos = history.filter((e) => week.includes(e.date) && e.w !== 'cardio').length;

  return (
    <div className={'tbn' + (doneToday ? ' done' : '')}>
      <IonIcon className="tbn-ico" icon={doneToday ? checkmarkCircle : barbell} />
      <div className="tbn-txt">
        <span className="tbn-title">
          {doneToday ? 'Treino de hoje concluído! 🔥' : 'Hoje é dia de treino 💪'}
        </span>
        <span className="tbn-sub">
          {weekTreinos > 0 ? (
            <>
              <IonIcon icon={flame} /> {weekTreinos} treino{weekTreinos > 1 ? 's' : ''} esta semana
              {!doneToday && ' — bora somar mais'}
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
