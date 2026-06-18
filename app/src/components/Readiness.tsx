import { useStore, todayISO } from '../store/store';
import { recoveryByGroup } from '../lib/recovery';
import './Readiness.css';

/** Texto de "há quanto tempo" pro grupo (granularidade de dia — o histórico não guarda hora). */
function whenText(daysSince: number | null): string {
  if (daysSince === null) return 'ainda não treinou';
  if (daysSince === 0) return 'treinado hoje';
  if (daysSince === 1) return 'há 1 dia';
  return `há ${daysSince} dias`;
}

/**
 * "Prontidão de hoje": mostra quais grupos já recuperaram (~48h) e quais ainda
 * descansam. Materializa a regra de recuperação do gerador científico no dia a dia.
 * Só leitura, derivado do histórico — não toca em nada.
 */
const Readiness: React.FC = () => {
  const history = useStore((s) => s.history[s.active]) || [];
  if (!history.length) return null; // sem histórico ainda não faz sentido mostrar

  const groups = recoveryByGroup(history, todayISO());
  // só mostra grupos JÁ treinados alguma vez (daysSince != null) — senão polui com 7 "pronto"
  const seen = groups.filter((g) => g.daysSince !== null);
  if (!seen.length) return null;

  // prontos primeiro (é o que o usuário quer treinar hoje); dentro, os mais descansados antes
  const sorted = [...seen].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ready' ? -1 : 1;
    return (b.daysSince ?? 0) - (a.daysSince ?? 0);
  });
  const readyCount = seen.filter((g) => g.status === 'ready').length;

  return (
    <section className="rdy" aria-label="Prontidão de recuperação">
      <div className="rdy-head">
        <span className="rdy-title">Prontidão de hoje</span>
        <span className="rdy-sub">{readyCount} recuperado{readyCount === 1 ? '' : 's'} (~48h)</span>
      </div>
      <div className="rdy-row">
        {sorted.map((g) => (
          <div key={g.group} className={'rdy-chip ' + g.status}>
            <div className="rdy-chip-top">
              <span className="rdy-dot" />
              <span className="rdy-g">{g.label}</span>
            </div>
            <span className="rdy-when">{g.status === 'ready' ? 'pronto · ' : 'descansa · '}{whenText(g.daysSince)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Readiness;
