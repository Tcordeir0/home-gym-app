import { useMemo, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './Calendar.css';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function iso(y: number, m: number, d: number) {
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

interface Props {
  /** AAAA-MM-DD → tipo de marcação ('treino' | 'cardio' | 'both' | 'dieta') */
  marks: Record<string, 'treino' | 'cardio' | 'both' | 'dieta'>;
  today: string;
  onDay?: (ds: string) => void; // toca num dia
  selected?: string; // dia destacado
}

/** Calendário mensal com pontos nos dias treinados. */
const Calendar: React.FC<Props> = ({ marks, today, onDay, selected }) => {
  const [ty, tm] = today.split('-').map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay();
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const out: ({ d: number; ds: string } | null)[] = [];
    for (let i = 0; i < first; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push({ d, ds: iso(view.y, view.m, d) });
    return out;
  }, [view]);

  const move = (delta: number) => {
    let m = view.m + delta, y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  };

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="cal-nav" onClick={() => move(-1)} aria-label="Mês anterior">
          <IonIcon icon={chevronBack} />
        </button>
        <span className="cal-title">{MESES[view.m]} {view.y}</span>
        <button className="cal-nav" onClick={() => move(1)} aria-label="Próximo mês">
          <IonIcon icon={chevronForward} />
        </button>
      </div>
      <div className="cal-dow">
        {DOW.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((c, i) =>
          c === null ? (
            <span key={i} className="cal-cell empty" />
          ) : (
            <button
              key={i}
              type="button"
              className={'cal-cell' + (c.ds === today ? ' is-today' : '') + (c.ds === selected ? ' sel' : '') + (marks[c.ds] ? ' done ' + marks[c.ds] : '')}
              onClick={() => onDay?.(c.ds)}
            >
              {c.d}
              {marks[c.ds] && <i className="cal-dot" />}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Calendar;
