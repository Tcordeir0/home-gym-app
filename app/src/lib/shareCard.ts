// Gera um card de progresso (canvas) pra compartilhar fora do app.
export interface ShareData {
  name: string;
  level: number;
  pts: number;
  pct: number; // % até o próximo nível
  streak: number;
  treinos: number;
  dias: number;
}

const LIME = '#c6ff3a';
const INK = '#ffffff';
const MUTED = '#9098a4';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Desenha o card e devolve o dataURL (PNG). */
export async function buildProgressCard(d: ShareData): Promise<string> {
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ok */ }

  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // fundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#15171c');
  bg.addColorStop(1, '#0b0c0f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // marca
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = '96px Anton, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText('HOME ', 90, 180);
  const hw = ctx.measureText('HOME ').width;
  ctx.fillStyle = LIME;
  ctx.fillText('GYM', 90 + hw, 180);

  // anel de nível
  const cx = W / 2, cy = 470, R = 150;
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1c2027';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = LIME;
  ctx.beginPath();
  ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(0.02, d.pct / 100)));
  ctx.stroke();
  // número do nível
  ctx.textAlign = 'center';
  ctx.fillStyle = LIME;
  ctx.font = '150px Anton, sans-serif';
  ctx.fillText(String(d.level), cx, cy + 48);
  ctx.fillStyle = MUTED;
  ctx.font = '34px Anton, sans-serif';
  ctx.fillText('NÍVEL', cx, cy + 110);

  // nome + pontos
  ctx.fillStyle = INK;
  ctx.font = '64px Anton, sans-serif';
  ctx.fillText(d.name, cx, cy + 230);
  ctx.fillStyle = LIME;
  ctx.font = '88px Anton, sans-serif';
  ctx.fillText(`${d.pts} pts`, cx, cy + 330);

  // stats (3 tiles)
  const tiles: [string, string][] = [
    [`${d.streak}`, 'SEQUÊNCIA'],
    [`${d.treinos}`, 'TREINOS'],
    [`${d.dias}`, 'DIAS ATIVOS'],
  ];
  const tw = 290, th = 230, gap = 30;
  const totalW = tw * 3 + gap * 2;
  let tx = (W - totalW) / 2;
  const ty = 980;
  tiles.forEach(([v, l]) => {
    ctx.fillStyle = '#1c2027';
    roundRect(ctx, tx, ty, tw, th, 28);
    ctx.fill();
    ctx.fillStyle = LIME;
    ctx.font = '92px Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v, tx + tw / 2, ty + 120);
    ctx.fillStyle = MUTED;
    ctx.font = '30px Anton, sans-serif';
    ctx.fillText(l, tx + tw / 2, ty + 178);
    tx += tw + gap;
  });

  // rodapé
  ctx.fillStyle = MUTED;
  ctx.font = '36px Anton, sans-serif';
  ctx.fillText('gym.trazzidely.com.br', cx, 1290);

  return c.toDataURL('image/png');
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, b64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(head)?.[1] || 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

/** Compartilha (share nativo) ou baixa o card. */
export async function shareProgress(d: ShareData): Promise<'shared' | 'downloaded'> {
  const dataUrl = await buildProgressCard(d);
  const file = dataUrlToFile(dataUrl, 'home-gym-progresso.png');

  const nav = navigator as Navigator & { canShare?: (data: unknown) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    await nav.share({ files: [file], title: 'Meu progresso — Home Gym', text: `Nível ${d.level} · ${d.pts} pts 💪` });
    return 'shared';
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'home-gym-progresso.png';
  a.click();
  return 'downloaded';
}
