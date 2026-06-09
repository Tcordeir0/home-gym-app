// Gera um card de progresso (canvas) pra compartilhar fora do app (estilo Spotify).
export interface ShareData {
  name: string;
  level: number;
  pts: number;
  pct: number; // % até o próximo nível
  streak: number;
  treinos: number;
  dias: number;
  photo?: string; // dataURL da foto do perfil
  color?: string; // cor do avatar (fallback sem foto)
  rank?: number; // posição na liga da casa (1-based)
  totalProfiles?: number;
  hidratado?: boolean;
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function medal(rank?: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '🏅';
}

/** Desenha o card e devolve o dataURL (PNG). */
export async function buildProgressCard(d: ShareData): Promise<string> {
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ok */ }

  const W = 1080, H = 1350, cx = W / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // fundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#15171c');
  bg.addColorStop(1, '#0b0c0f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // marca (centralizada)
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.font = '74px Anton, sans-serif';
  const home = 'HOME ', gym = 'GYM';
  const wHome = ctx.measureText(home).width;
  const wGym = ctx.measureText(gym).width;
  const startX = cx - (wHome + wGym) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = INK; ctx.fillText(home, startX, 150);
  ctx.fillStyle = LIME; ctx.fillText(gym, startX + wHome, 150);

  // avatar: foto (círculo) OU anel de nível
  const ay = 400, R = 140;
  if (d.photo) {
    try {
      const img = await loadImage(d.photo);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      const s = Math.max((2 * R) / img.width, (2 * R) / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, cx - dw / 2, ay - dh / 2, dw, dh);
      ctx.restore();
      ctx.lineWidth = 12; ctx.strokeStyle = LIME;
      ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();
    } catch { /* sem foto */ }
  } else {
    ctx.lineWidth = 24; ctx.lineCap = 'round';
    ctx.strokeStyle = '#1c2027';
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = LIME;
    ctx.beginPath(); ctx.arc(cx, ay, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, d.pct / 100)); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = LIME;
    ctx.font = '140px Anton, sans-serif'; ctx.fillText(String(d.level), cx, ay + 46);
    ctx.fillStyle = MUTED; ctx.font = '30px Anton, sans-serif'; ctx.fillText('NÍVEL', cx, ay + 100);
  }

  // nome
  ctx.textAlign = 'center';
  ctx.fillStyle = INK; ctx.font = '70px Anton, sans-serif';
  ctx.fillText(d.name.toUpperCase(), cx, ay + 250);

  // rank "Xº da casa" + nível
  ctx.fillStyle = MUTED; ctx.font = '40px Anton, sans-serif';
  const rankTxt = d.rank ? `${medal(d.rank)} ${d.rank}º da casa · Nível ${d.level}` : `Nível ${d.level}`;
  ctx.fillText(rankTxt, cx, ay + 312);

  // pontos
  ctx.fillStyle = LIME; ctx.font = '170px Anton, sans-serif';
  ctx.fillText(String(d.pts), cx, ay + 480);
  ctx.fillStyle = MUTED; ctx.font = '38px Anton, sans-serif';
  ctx.fillText('PONTOS', cx, ay + 532);

  // stats (3 tiles)
  const tiles: [string, string][] = [
    [`${d.streak}`, '🔥 SEQUÊNCIA'],
    [`${d.treinos}`, 'TREINOS'],
    [`${d.dias}`, 'DIAS'],
  ];
  const tw = 290, th = 200, gap = 30;
  let tx = (W - (tw * 3 + gap * 2)) / 2;
  const ty = ay + 560;
  tiles.forEach(([v, l]) => {
    ctx.fillStyle = '#1c2027';
    roundRect(ctx, tx, ty, tw, th, 26); ctx.fill();
    ctx.fillStyle = LIME; ctx.font = '84px Anton, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(v, tx + tw / 2, ty + 108);
    ctx.fillStyle = MUTED; ctx.font = '26px Anton, sans-serif';
    ctx.fillText(l, tx + tw / 2, ty + 158);
    tx += tw + gap;
  });

  // badge Hidratado
  if (d.hidratado) {
    const bw = 320, bh = 66, bx = cx - bw / 2, by = ty + th + 28;
    ctx.fillStyle = 'rgba(95,168,255,0.16)';
    roundRect(ctx, bx, by, bw, bh, 33); ctx.fill();
    ctx.fillStyle = '#5fa8ff'; ctx.font = '34px Anton, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('💧 HIDRATADO', cx, by + 45);
  }

  // rodapé
  ctx.fillStyle = MUTED; ctx.font = '32px Anton, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('gym.trazzidely.com.br', cx, H - 50);

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
    await nav.share({ files: [file], title: 'Meu progresso — Home Gym', text: `${d.pts} pts 💪` });
    return 'shared';
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'home-gym-progresso.png';
  a.click();
  return 'downloaded';
}
