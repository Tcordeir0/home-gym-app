// Renderiza um ícone pixel-art (grade 12×12) como SVG de <rect>s.
import { PIXEL_BY_ID, PALETTE } from '../data/gameicons';

interface Props {
  id?: string | null;
  size?: number;
}

export default function PixelIcon({ id, size = 24 }: Props) {
  if (!id || id === 'none') return null;
  const def = PIXEL_BY_ID[id];
  if (!def) return null;
  const rows = def.grid;
  const h = rows.length;
  const w = rows[0]?.length || 12;
  const cells: { x: number; y: number; c: string }[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = PALETTE[row[x]];
      if (c) cells.push({ x, y, c });
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {cells.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1.02} height={1.02} fill={p.c} />
      ))}
    </svg>
  );
}
