import './LineChart.css';

interface Props {
  series: { x: string; y: number }[];
  unit?: string;
}

const fmtDate = (iso: string) => {
  const p = iso.split('-');
  return p[2] + '/' + p[1];
};
const fmtNum = (n: number) => (Math.round(n * 10) / 10).toString();

const LineChart: React.FC<Props> = ({ series, unit = '' }) => {
  if (!series.length)
    return <div className="chart-empty">Sem dados ainda.<br />Registre pra ver a evolução 📈</div>;
  if (series.length === 1)
    return (
      <div className="chart-single">
        <b>{fmtNum(series[0].y)}{unit}</b>
        <br />
        Registre mais de uma vez pra ver a linha
      </div>
    );

  const W = 320, H = 160, pl = 30, pr = 12, ptop = 14, pb = 22;
  const ys = series.map((s) => s.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const n = series.length;
  const X = (i: number) => pl + (W - pl - pr) * (i / (n - 1));
  const Y = (v: number) => ptop + (H - ptop - pb) * (1 - (v - min) / (max - min));

  let line = '', area = '';
  series.forEach((s, i) => {
    const seg = (i ? ' L' : 'M') + X(i).toFixed(1) + ' ' + Y(s.y).toFixed(1);
    line += seg; area += seg;
  });
  area += ` L${X(n - 1).toFixed(1)} ${(H - pb).toFixed(1)} L${X(0).toFixed(1)} ${(H - pb).toFixed(1)} Z`;
  const last = series[n - 1];

  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <text className="ch-lbl" x="4" y={(Y(max) + 3).toFixed(1)}>{fmtNum(max)}</text>
      <text className="ch-lbl" x="4" y={(Y(min) + 3).toFixed(1)}>{fmtNum(min)}</text>
      <path className="ch-area" d={area} />
      <path className="ch-line" d={line} />
      {series.map((s, i) => (
        <circle key={i} className="ch-dot" cx={X(i).toFixed(1)} cy={Y(s.y).toFixed(1)} r="3.1" />
      ))}
      <text className="ch-lbl" x={pl} y={H - 6}>{fmtDate(series[0].x)}</text>
      <text className="ch-lbl" x={W - pr} y={H - 6} textAnchor="end">{fmtDate(last.x)}</text>
      <text className="ch-val" x={W - pr} y={(Y(last.y) - 6).toFixed(1)} textAnchor="end">{fmtNum(last.y)}{unit}</text>
    </svg>
  );
};

export default LineChart;
