import { useStore, todayISO } from '../store/store';
import { deloadSuggestion } from '../lib/deload';
import './DeloadBanner.css';

/**
 * Sugere uma semana de DELOAD quando o grupo-motor acumulou ~4+ semanas de volume.
 * Base: Renaissance Periodization — fadiga acumula no mesociclo; 1 semana a ~50% de
 * volume dissipa e destrava o crescimento. Derivado do histórico, só leitura.
 */
const DeloadBanner: React.FC = () => {
  const history = useStore((s) => s.history[s.active]) || [];
  if (history.length < 8) return null; // sem mesociclo ainda não faz sentido

  const d = deloadSuggestion(history, todayISO());
  if (!d.suggest) return null;

  return (
    <div className="deload" role="note">
      <span className="deload-emoji">🪫</span>
      <div className="deload-txt">
        <b>Hora de um deload?</b> Você treinou <b>{d.label}</b> pesado por {d.weeks} semanas seguidas.
        Uma semana com volume ~50% recupera a fadiga e destrava o crescimento — depois volta mais forte. 💪
      </div>
    </div>
  );
};

export default DeloadBanner;
