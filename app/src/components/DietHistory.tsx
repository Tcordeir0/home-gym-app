import { IonCard, IonCardContent } from '@ionic/react';
import { useStore } from '../store/store';
import LineChart from './LineChart';

/** Histórico da dieta: calorias registradas por dia (reativo ao perfil ativo). */
const DietHistory: React.FC = () => {
  const dayMap = useStore((s) => s.daily[s.active]) || {};
  const series = Object.keys(dayMap)
    .filter((d) => (dayMap[d].food || []).length > 0)
    .sort()
    .map((d) => ({
      x: d,
      y: Math.round((dayMap[d].food || []).reduce((a, it) => a + (it.k * it.g) / 100, 0)),
    }));

  if (series.length < 2) return null; // precisa de pelo menos 2 dias pra desenhar

  return (
    <IonCard className="diet-card">
      <IonCardContent>
        <h2 className="card-title">📈 Histórico da dieta</h2>
        <p className="card-sub">Calorias registradas por dia.</p>
        <LineChart series={series} unit="kcal" />
      </IonCardContent>
    </IonCard>
  );
};

export default DietHistory;
