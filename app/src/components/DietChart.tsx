import { useMemo, useState } from 'react';
import LineChart from './LineChart';
import { useStore } from '../store/store';
import './Graficos.css';

/** Gráfico de evolução da dieta (calorias/proteína/água por dia). Reutilizado na aba
 *  Dieta (com seu próprio período) e nos Gráficos do Progresso (recebe `cutoff` de lá). */
const DietChart: React.FC<{ cutoff?: string }> = ({ cutoff }) => {
  const daily = useStore((s) => s.daily[s.active]) || {};
  const [field, setField] = useState<'kcal' | 'protein' | 'water'>('kcal');
  const [range, setRange] = useState<'semana' | 'mes' | 'ano' | 'tudo'>('mes');

  // período próprio só quando não vem `cutoff` de fora (Graficos manda o dele)
  const ownCutoff = useMemo(() => {
    if (cutoff !== undefined) return cutoff;
    if (range === 'tudo') return '';
    const days = range === 'semana' ? 7 : range === 'mes' ? 31 : 365;
    const d = new Date(); d.setDate(d.getDate() - days + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }, [cutoff, range]);

  const series = useMemo(() => {
    return Object.keys(daily)
      .filter((d) => (!ownCutoff || d >= ownCutoff) && ((daily[d].food || []).length > 0 || (field === 'water' && (daily[d].waterMl || 0) > 0)))
      .sort()
      .map((d) => {
        if (field === 'water') return { x: d, y: Math.round((daily[d].waterMl || 0) / 100) / 10 };
        const food = daily[d].food || [];
        const val = food.reduce((a, it) => a + ((field === 'kcal' ? it.k : it.p) * it.g) / 100, 0);
        return { x: d, y: Math.round(val) };
      });
  }, [daily, field, ownCutoff]);

  return (
    <>
      <div className="gr-chips">
        <button className={'ds-chip' + (field === 'kcal' ? ' on' : '')} onClick={() => setField('kcal')}>Calorias</button>
        <button className={'ds-chip' + (field === 'protein' ? ' on' : '')} onClick={() => setField('protein')}>Proteína</button>
        <button className={'ds-chip' + (field === 'water' ? ' on' : '')} onClick={() => setField('water')}>💧 Água</button>
      </div>
      {/* período próprio (só fora do Graficos) */}
      {cutoff === undefined && (
        <div className="gr-range">
          {([['semana', 'Semana'], ['mes', 'Mês'], ['ano', 'Ano'], ['tudo', 'Tudo']] as const).map(([k, label]) => (
            <button key={k} className={'gr-range-btn' + (range === k ? ' on' : '')} onClick={() => setRange(k)}>{label}</button>
          ))}
        </div>
      )}
      {series.length >= 2
        ? <LineChart series={series} unit={field === 'kcal' ? 'kcal' : field === 'water' ? 'L' : 'g'} />
        : <p className="gr-empty">Registre a dieta em <b>2+ dias</b> pra ver a evolução aqui.</p>}
    </>
  );
};

export default DietChart;
