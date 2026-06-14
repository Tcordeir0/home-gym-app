import { useEffect, useRef } from 'react';
import { BodyChart, ViewSide, type BodyState } from 'body-muscles';

/** Wrapper React pra lib imperativa `body-muscles` (vulovix) — modelo MASCULINO detalhado
 *  (85+ regiões com cabeças: peito sup/inf, tríceps longa/lateral, deltoide f/l/posterior...). */
const MaleBody: React.FC<{
  view: 'front' | 'back';
  bodyState: BodyState;
  onMuscle: (id: string) => void;
}> = ({ view, bodyState, onMuscle }) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<BodyChart | null>(null);
  // callback sempre atual sem recriar o chart
  const cb = useRef(onMuscle);
  cb.current = onMuscle;

  // cria uma vez
  useEffect(() => {
    if (!ref.current) return;
    chart.current = new BodyChart(ref.current, {
      view: view === 'back' ? ViewSide.BACK : ViewSide.FRONT,
      bodyState,
      onMuscleClick: (id) => cb.current(id),
    });
    return () => { chart.current?.destroy(); chart.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // atualiza vista + estado quando mudam
  useEffect(() => {
    chart.current?.update({ view: view === 'back' ? ViewSide.BACK : ViewSide.FRONT, bodyState });
  }, [view, bodyState]);

  return <div ref={ref} className="bm-male" />;
};

export default MaleBody;
