import { useEffect, useRef } from 'react';
import { BodyChart, ViewSide, INTENSITY_COLORS, type BodyState } from 'body-muscles';

// A lib pinta os músculos pelo array global INTENSITY_COLORS (intensity 0-10). Pra o heatmap
// sair no TOM DO TEMA (e não no vermelho fixo), sobrescrevemos os índices 1..10 com a rampa do tema.
function applyThemeColors(cols?: string[]) {
  if (!cols) return;
  for (let i = 1; i <= 10; i++) if (cols[i]) INTENSITY_COLORS[i] = cols[i];
}

/** Wrapper React pra lib imperativa `body-muscles` (vulovix) — modelo MASCULINO detalhado
 *  (85+ regiões com cabeças: peito sup/inf, tríceps longa/lateral, deltoide f/l/posterior...). */
const MaleBody: React.FC<{
  view: 'front' | 'back';
  bodyState: BodyState;
  onMuscle: (id: string) => void;
  colors?: string[]; // rampa de 11 tons (intensity 0-10) no tom do tema
}> = ({ view, bodyState, onMuscle, colors }) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<BodyChart | null>(null);
  // callback sempre atual sem recriar o chart
  const cb = useRef(onMuscle);
  cb.current = onMuscle;

  // cria uma vez. try/catch evita que um erro da lib derrube a árvore React e entre
  // em loop de "ocorreu um problema repetidamente" (crash do WebView no iOS).
  useEffect(() => {
    if (!ref.current) return;
    try {
      applyThemeColors(colors);
      chart.current = new BodyChart(ref.current, {
        view: view === 'back' ? ViewSide.BACK : ViewSide.FRONT,
        bodyState,
        onMuscleClick: (id) => cb.current(id),
        enableTransitions: false, // transição em SVG grande crasha no iOS
      });
    } catch { /* sem boneco, mas app vivo */ }
    return () => { try { chart.current?.destroy(); } catch { /* ok */ } chart.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // atualiza cores do tema + vista + estado quando mudam (repinta)
  useEffect(() => {
    try {
      applyThemeColors(colors);
      chart.current?.update({ view: view === 'back' ? ViewSide.BACK : ViewSide.FRONT, bodyState });
    } catch { /* ignora erro de repaint da lib */ }
  }, [view, bodyState, colors]);

  return <div ref={ref} className="bm-male" />;
};

export default MaleBody;
