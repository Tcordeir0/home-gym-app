// Gera um card de progresso (canvas) pra compartilhar fora do app (estilo Spotify).
// O card reflete o TEMA, a COR, o ARO e o COSMÉTICO do perfil ativo.
import { THEMES } from '../data/themes';
import { FRAMES } from '../data/frames';
import { PIXEL_BY_ID, PALETTE } from '../data/gameicons';
import { APP_VERSION } from './version';

export interface ShareData {
  name: string;
  level: number;
  pts: number;
  pct: number; // % até o próximo nível
  streak: number;
  treinos: number;
  dias: number;
  photo?: string; // dataURL da foto do perfil
  color?: string; // cor do avatar/accent
  rank?: number; // posição na liga da casa (1-based)
  totalProfiles?: number;
  theme?: string; // id do tema ativo
  frame?: string; // id do aro ativo
  hat?: string; // id do cosmético (ícone pixel)
  seriesWk?: number; // séries feitas na semana
  waterAvg?: number; // média de água por dia na semana (ml)
  topMuscle?: string; // músculo mais treinado na semana
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
function isLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

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

// Desenha o aro (frame) ao redor do avatar conforme o cosmético escolhido.
function drawRing(ctx: CanvasRenderingContext2D, cx: number, ay: number, R: number, lw: number, frame: string, accent: string) {
  if (frame === 'pokeball') {
    ctx.lineWidth = lw;
    ctx.strokeStyle = '#e23b3b';
    ctx.beginPath(); ctx.arc(cx, ay, R, Math.PI, Math.PI * 2); ctx.stroke(); // metade de cima (vermelha)
    ctx.strokeStyle = '#f4f6f8';
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI); ctx.stroke(); // metade de baixo (branca)
    ctx.strokeStyle = '#15181d'; ctx.lineWidth = Math.max(5, lw * 0.34);
    ctx.beginPath(); ctx.moveTo(cx - R - lw / 2, ay); ctx.lineTo(cx + R + lw / 2, ay); ctx.stroke();
    return;
  }
  const fr = FRAMES.find((f) => f.id === frame);
  let stroke: string | CanvasGradient = accent;
  const conic = (ctx as CanvasRenderingContext2D & { createConicGradient?: (a: number, x: number, y: number) => CanvasGradient }).createConicGradient;
  if (fr && frame !== 'none' && typeof conic === 'function') {
    const g = conic.call(ctx, -Math.PI / 2, cx, ay);
    g.addColorStop(0, fr.swatch[0]);
    g.addColorStop(0.5, fr.swatch[1]);
    g.addColorStop(1, fr.swatch[0]);
    stroke = g;
  }
  if (frame === 'electric') { ctx.shadowColor = '#8ec8ff'; ctx.shadowBlur = 34; }
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
}

// PRNG determinístico (sem Math.random p/ o card ser estável e reproduzível).
function seeded(s: number) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function themeSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Fundo procedural por tema — dá identidade aos temas "animados" que não têm wallpaper
// (matrix, cosmos, synth, cyber, arcade, ouro, sunset...). Temas preto/branco ficam limpos.
function drawThemeBackdrop(ctx: CanvasRenderingContext2D, W: number, H: number, id: string, accent: string) {
  if (id === 'dark' || id === 'light') return; // P&B ficam puros
  const [ar, ag, ab] = hexToRgb(accent);
  const acc = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const rnd = seeded(themeSeed(id));
  switch (id) {
    case 'matrix': {
      ctx.font = '28px monospace'; ctx.textAlign = 'center';
      const cols = 26;
      for (let i = 0; i < cols; i++) {
        const x = (i + 0.5) * (W / cols);
        const len = 4 + Math.floor(rnd() * 11);
        const startY = rnd() * H;
        for (let j = 0; j < len; j++) {
          const y = (startY + j * 30) % H;
          ctx.fillStyle = acc(j === len - 1 ? 0.5 : 0.05 + (j / len) * 0.13);
          ctx.fillText(rnd() < 0.5 ? '0' : '1', x, y);
        }
      }
      break;
    }
    case 'cosmos': {
      for (let i = 0; i < 170; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.12 + rnd() * 0.6})`;
        ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 2.3 + 0.4, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 2; i++) {
        const gx = rnd() * W, gy = rnd() * H * 0.7;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 300);
        g.addColorStop(0, acc(0.18)); g.addColorStop(1, acc(0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      break;
    }
    case 'synth': {
      const sun = ctx.createLinearGradient(0, H * 0.16, 0, H * 0.44);
      sun.addColorStop(0, acc(0.85)); sun.addColorStop(1, acc(0.08));
      ctx.fillStyle = sun;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.3, 150, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = acc(0.2); ctx.lineWidth = 2;
      const hz = H * 0.64;
      for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 40, hz); ctx.lineTo(W / 2 + i * 260, H); ctx.stroke(); }
      for (let j = 0; j < 14; j++) { const y = hz + (H - hz) * Math.pow(j / 14, 2); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      break;
    }
    case 'cyber': case 'checker': {
      ctx.strokeStyle = acc(0.11); ctx.lineWidth = 1.5;
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      break;
    }
    case 'arcade': {
      for (let i = 0; i < 64; i++) {
        const s = (2 + Math.floor(rnd() * 3)) * 8;
        ctx.fillStyle = acc(0.07 + rnd() * 0.15);
        ctx.fillRect(Math.floor((rnd() * W) / s) * s, Math.floor((rnd() * H) / s) * s, s, s);
      }
      break;
    }
    case 'ouro': case 'sunset': {
      const g = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 520);
      g.addColorStop(0, acc(id === 'sunset' ? 0.3 : 0.22)); g.addColorStop(1, acc(0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      break;
    }
    default: {
      // brilho sutil + poucos pontos do accent: anima qualquer tema liso (ex.: grafite)
      const g = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 560);
      g.addColorStop(0, acc(0.13)); g.addColorStop(1, acc(0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 56; i++) {
        ctx.fillStyle = acc(0.04 + rnd() * 0.11);
        ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 3 + 1, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}

/** Desenha o card e devolve o dataURL (PNG). */
export async function buildProgressCard(d: ShareData): Promise<string> {
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ok */ }

  const W = 1080, H = 1920, cx = W / 2; // 9:16 — formato story/status
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // ---- cores do tema ativo ----
  const themeObj = THEMES.find((t) => t.id === d.theme) || THEMES[0];
  const bgCol = themeObj.swatch[0];
  const surfCol = themeObj.swatch[1];
  const accent = d.color || themeObj.swatch[2];
  const light = isLight(bgCol);
  const INK = light ? '#0b0c0f' : '#ffffff';
  const MUTED = light ? '#5a6068' : '#9098a4';
  const [br, bg2, bb] = hexToRgb(bgCol);

  // ---- fundo: wallpaper do tema (com véu) ou gradiente ----
  let drewImage = false;
  if (themeObj.image) {
    try {
      const img = await loadImage(themeObj.image);
      const s = Math.max(W / img.width, H / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, cx - dw / 2, 0, dw, dh);
      const veil = ctx.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0, `rgba(${br},${bg2},${bb},0.8)`);
      veil.addColorStop(0.42, `rgba(${br},${bg2},${bb},0.62)`);
      veil.addColorStop(1, `rgba(${br},${bg2},${bb},0.9)`);
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, W, H);
      drewImage = true;
    } catch { /* cai no gradiente */ }
  }
  if (!drewImage) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, surfCol);
    grad.addColorStop(1, bgCol);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // identidade dos temas animados (matrix/cosmos/synth/cyber/arcade/ouro...)
    drawThemeBackdrop(ctx, W, H, themeObj.id, accent);
  }

  // ---- marca (topo, centralizada) ----
  ctx.textBaseline = 'alphabetic';
  ctx.font = '74px Anton, sans-serif';
  const home = 'HOME ', gym = 'GYM';
  const wHome = ctx.measureText(home).width;
  const wGym = ctx.measureText(gym).width;
  const startX = cx - (wHome + wGym) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = INK; ctx.fillText(home, startX, 180);
  ctx.fillStyle = accent; ctx.fillText(gym, startX + wHome, 180);

  // ---- avatar: foto (círculo) OU anel de nível, com o ARO do perfil ----
  const ay = 640;
  const frame = d.frame || 'none';
  // aros-imagem (coroas) são bem maiores que o avatar → reduzir o raio pra coroa
  // caber entre a marca e o nome (não invadir o "TCORDEIRO").
  const R = frame === 'mine' ? 96 : frame === 'cha' ? 110 : 140;
  const ringLw = frame === 'pokeball' ? 22 : 16;
  if (d.photo) {
    try {
      const img = await loadImage(d.photo);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      const s = Math.max((2 * R) / img.width, (2 * R) / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, cx - dw / 2, ay - dh / 2, dw, dh);
      ctx.restore();
    } catch { /* sem foto */ }
    if (frame !== 'mine' && frame !== 'cha') drawRing(ctx, cx, ay, R, ringLw, frame, accent);
  } else {
    // base + número do nível, depois o aro por cima
    ctx.fillStyle = surfCol;
    ctx.beginPath(); ctx.arc(cx, ay, R - 4, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = accent;
    ctx.font = '140px Anton, sans-serif'; ctx.fillText(String(d.level), cx, ay + 46);
    ctx.fillStyle = MUTED; ctx.font = '30px Anton, sans-serif'; ctx.fillText('NÍVEL', cx, ay + 100);
    if (frame !== 'mine' && frame !== 'cha') drawRing(ctx, cx, ay, R, ringLw, frame, accent);
  }

  // ---- aro Tridente: tridente dourado como coroa em cima do aro (pequeno) ----
  if (frame === 'tridente') {
    try {
      const tri = await loadImage('/trident.svg');
      const tw = R * 0.72, th = tw * 0.9;
      ctx.drawImage(tri, cx - tw / 2, (ay - R + 12) - th, tw, th);
    } catch { /* ok */ }
  }
  // ---- aro Minecraft: a COROA de blocos completa envolvendo o avatar ----
  if (frame === 'mine') {
    try {
      const wreath = await loadImage('/mine-ring.png');
      // frações medidas do PNG: buraco centro (0.496, 0.582), raio 0.236 da largura
      const Wimg = R / 0.236;               // largura da coroa p/ o buraco = raio do avatar
      ctx.drawImage(wreath, cx - 0.496 * Wimg, ay - 0.582 * Wimg, Wimg, Wimg);
    } catch { /* ok */ }
  }
  // ---- aro Pecados (Chá): coroa de caveiras dos 7 pecados ----
  if (frame === 'cha') {
    try {
      const wreath = await loadImage('/cha-ring.png');
      const Wimg = R / 0.261;               // buraco centrado (0.5, 0.5), raio 0.261
      ctx.drawImage(wreath, cx - 0.5 * Wimg, ay - 0.5 * Wimg, Wimg, Wimg);
    } catch { /* ok */ }
  }

  // ---- cosmético (ícone pixel) no canto do avatar ----
  if (d.hat && d.hat !== 'none' && PIXEL_BY_ID[d.hat]) {
    const def = PIXEL_BY_ID[d.hat];
    const sz = 104;
    const bx = cx - R + 2, by = ay - R + 2;
    ctx.fillStyle = surfCol;
    roundRect(ctx, bx - 10, by - 10, sz + 20, sz + 20, 22); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${light ? 0.12 : 0.16})`; ctx.lineWidth = 3;
    roundRect(ctx, bx - 10, by - 10, sz + 20, sz + 20, 22); ctx.stroke();
    const cell = sz / 12;
    def.grid.forEach((row, gy) => {
      for (let gx = 0; gx < row.length; gx++) {
        const col = PALETTE[row[gx]];
        if (col) { ctx.fillStyle = col; ctx.fillRect(bx + gx * cell, by + gy * cell, cell + 0.6, cell + 0.6); }
      }
    });
  }

  // ---- nome ----
  ctx.textAlign = 'center';
  ctx.fillStyle = INK; ctx.font = '76px Anton, sans-serif';
  ctx.fillText(d.name.toUpperCase(), cx, ay + 290);

  // ---- rank "Xº da casa" + nível ----
  ctx.fillStyle = MUTED; ctx.font = '42px Anton, sans-serif';
  const rankTxt = d.rank ? `${medal(d.rank)} ${d.rank}º da casa · Nível ${d.level}` : `Nível ${d.level}`;
  ctx.fillText(rankTxt, cx, ay + 356);

  // ---- pontos ----
  ctx.fillStyle = accent; ctx.font = '180px Anton, sans-serif';
  ctx.fillText(String(d.pts), cx, ay + 540);
  ctx.fillStyle = MUTED; ctx.font = '40px Anton, sans-serif';
  ctx.fillText('PONTOS', cx, ay + 600);

  // ---- stats (3 tiles) ----
  const tiles: [string, string][] = [
    [`${d.streak}`, '🔥 SEQUÊNCIA'],
    [`${d.treinos}`, 'TREINOS'],
    [`${d.dias}`, 'DIAS'],
  ];
  const tw = 290, th = 210, gap = 30;
  let tx = (W - (tw * 3 + gap * 2)) / 2;
  const ty = ay + 680;
  const [tar, tag, tab] = hexToRgb(accent);
  tiles.forEach(([v, l]) => {
    // base opaca quando há foto atrás (legibilidade)
    if (drewImage) {
      ctx.fillStyle = light ? 'rgba(255,255,255,0.84)' : 'rgba(12,13,16,0.74)';
      roundRect(ctx, tx, ty, tw, th, 26); ctx.fill();
    }
    // tom do accent: contrasta com o fundo em qualquer tema (inclusive preto/branco)
    ctx.fillStyle = `rgba(${tar},${tag},${tab},${light ? 0.13 : 0.18})`;
    roundRect(ctx, tx, ty, tw, th, 26); ctx.fill();
    ctx.strokeStyle = `rgba(${tar},${tag},${tab},0.55)`; ctx.lineWidth = 3;
    roundRect(ctx, tx, ty, tw, th, 26); ctx.stroke();
    ctx.fillStyle = accent; ctx.font = '90px Anton, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(v, tx + tw / 2, ty + 116);
    ctx.fillStyle = INK; ctx.font = '27px Anton, sans-serif';
    ctx.fillText(l, tx + tw / 2, ty + 168);
    tx += tw + gap;
  });

  // ---- linha extra da SEMANA: séries + hidratação + músculo top ----
  const extras: string[] = [];
  if (d.seriesWk) extras.push(`🏋️ ${d.seriesWk} séries`);
  if (d.waterAvg) extras.push(`💧 ${(d.waterAvg / 1000).toFixed(1)} L/dia`);
  if (d.topMuscle) extras.push(`💪 ${d.topMuscle}`);
  if (extras.length) {
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED; ctx.font = '30px Anton, sans-serif';
    ctx.fillText('NA SEMANA', cx, ty + th + 46);
    ctx.fillStyle = INK; ctx.font = '32px Anton, sans-serif';
    ctx.fillText(extras.join('    '), cx, ty + th + 88);
  }

  // ---- rodapé: só a versão (HOME GYM já está no topo) ----
  ctx.textAlign = 'center'; ctx.font = '36px Anton, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText(`v${APP_VERSION}`, cx, H - 80);

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
