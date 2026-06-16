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

// Borboleta de 4 asas (o chamador define fillStyle/shadow). Usada por Hollow e Bruxa.
function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath(); ctx.ellipse(x - s * 0.45, y - s * 0.1, s * 0.5, s * 0.7, -0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + s * 0.45, y - s * 0.1, s * 0.5, s * 0.7, 0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - s * 0.38, y + s * 0.5, s * 0.34, s * 0.46, -0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + s * 0.38, y + s * 0.5, s * 0.34, s * 0.46, 0.5, 0, 7); ctx.fill();
}

// Aro-imagem (PNG com furo central) ao redor do avatar. Espelha os av-frame-* do Perfil:
// fx/fy = fração do centro do furo no PNG; fr = fração do raio do furo. half = corta na metade
// (Hollow) com degradê discreto; glow = brilho temático.
async function drawImageRing(
  ctx: CanvasRenderingContext2D, cx: number, ay: number, R: number,
  src: string, fx: number, fy: number, fr: number,
  opts?: { half?: boolean; glow?: string },
) {
  let img: HTMLImageElement;
  try { img = await loadImage(src); } catch { return; }
  const Wimg = R / fr;
  const dx = cx - fx * Wimg;
  const dy = ay - fy * Wimg;
  if (opts?.glow) { ctx.save(); ctx.shadowColor = opts.glow; ctx.shadowBlur = 28; }
  if (opts?.half) {
    const sz = Math.ceil(Wimg);
    const off = document.createElement('canvas'); off.width = sz; off.height = sz;
    const o = off.getContext('2d')!;
    o.drawImage(img, 0, 0, Wimg, Wimg);
    o.globalCompositeOperation = 'destination-in';
    const mg = o.createLinearGradient(0, 0, 0, Wimg);
    mg.addColorStop(0, '#000'); mg.addColorStop(0.46, '#000');
    mg.addColorStop(0.53, 'rgba(0,0,0,0.55)'); mg.addColorStop(0.60, 'rgba(0,0,0,0)');
    o.fillStyle = mg; o.fillRect(0, 0, Wimg, Wimg);
    ctx.drawImage(off, dx, dy, Wimg, Wimg);
  } else {
    ctx.drawImage(img, dx, dy, Wimg, Wimg);
  }
  if (opts?.glow) ctx.restore();
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

// Versão CONGELADA das partículas dos temas animados (bubbles/hearts/hands/...).
// Espelha o ThemeFX em telão, mas estático — pra "fotografar" o tema no card.
async function drawThemeFx(ctx: CanvasRenderingContext2D, W: number, H: number, fx: string, accent: string) {
  const [ar, ag, ab] = hexToRgb(accent);
  const acc = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const rnd = seeded(themeSeed('fx-' + fx));
  ctx.save();
  ctx.textAlign = 'center';
  switch (fx) {
    case 'snow': {
      for (let i = 0; i < 48; i++) {
        ctx.globalAlpha = 0.35 + rnd() * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 4 + 1.4, 0, 7); ctx.fill();
      }
      break;
    }
    case 'bubbles': {
      for (let i = 0; i < 24; i++) {
        const r = rnd() * 22 + 6, x = rnd() * W, y = H - rnd() * H * 0.92;
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + rnd() * 0.22})`; ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
      }
      break;
    }
    case 'fireflies': {
      ctx.shadowColor = acc(0.9); ctx.shadowBlur = 18; ctx.fillStyle = acc(0.85);
      for (let i = 0; i < 22; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 3 + 2, 0, 7); ctx.fill(); }
      ctx.shadowBlur = 0;
      break;
    }
    case 'hearts': {
      ctx.fillStyle = acc(1);
      for (let i = 0; i < 16; i++) { ctx.globalAlpha = 0.22 + rnd() * 0.4; ctx.font = `${18 + rnd() * 30}px serif`; ctx.fillText('♥', rnd() * W, rnd() * H); }
      break;
    }
    case 'math': {
      const MS = ['+', '−', '×', '÷', '=', 'π', '√', '∞', '%', '∑', '∫', 'θ', 'φ'];
      ctx.fillStyle = acc(1);
      for (let i = 0; i < 22; i++) { ctx.globalAlpha = 0.18 + rnd() * 0.34; ctx.font = `${22 + rnd() * 28}px monospace`; ctx.fillText(MS[Math.floor(rnd() * MS.length)], rnd() * W, rnd() * H); }
      break;
    }
    case 'enchant': {
      const RU = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');
      ctx.fillStyle = acc(1);
      for (let i = 0; i < 26; i++) { ctx.globalAlpha = 0.22 + rnd() * 0.5; ctx.font = `${20 + rnd() * 26}px serif`; ctx.fillText(RU[Math.floor(rnd() * RU.length)], rnd() * W, rnd() * H); }
      break;
    }
    case 'miasma': {
      const g = ctx.createRadialGradient(W / 2, H * 0.2, 0, W / 2, H * 0.2, 460);
      g.addColorStop(0, 'rgba(220,40,40,0.26)'); g.addColorStop(1, 'rgba(220,40,40,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 16; i++) { ctx.fillStyle = `rgba(40,8,12,${0.1 + rnd() * 0.18})`; ctx.beginPath(); ctx.arc(rnd() * W, H - rnd() * H * 0.7, rnd() * 40 + 16, 0, 7); ctx.fill(); }
      break;
    }
    case 'electric': {
      ctx.strokeStyle = 'rgba(142,200,255,0.45)'; ctx.shadowColor = '#8ec8ff'; ctx.shadowBlur = 18; ctx.lineWidth = 4;
      for (let b = 0; b < 4; b++) {
        const x = 90 + rnd() * (W - 180); let y = 0;
        ctx.beginPath(); ctx.moveTo(x, y);
        while (y < H) { y += 70 + rnd() * 80; ctx.lineTo(x + (rnd() * 60 - 30), y); }
        ctx.stroke();
      }
      ctx.shadowBlur = 0; ctx.fillStyle = acc(0.8);
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 2 + 1, 0, 7); ctx.fill(); }
      break;
    }
    case 'creator': {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, acc(0)); g.addColorStop(0.5, acc(0.16)); g.addColorStop(1, acc(0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = acc(0.8);
      for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 3 + 1.5, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,210,80,0.85)';
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, rnd() * 2 + 1, 0, 7); ctx.fill(); }
      break;
    }
    case 'butterflies': {
      // Hollow — enxame de borboletas azuis brilhando
      ctx.shadowColor = 'rgba(95,209,255,0.9)'; ctx.shadowBlur = 16;
      for (let i = 0; i < 20; i++) {
        ctx.globalAlpha = 0.5 + rnd() * 0.45;
        const s = 16 + rnd() * 26;
        ctx.fillStyle = `rgb(${100 + Math.floor(rnd() * 70)},${195 + Math.floor(rnd() * 45)},255)`;
        drawButterfly(ctx, rnd() * W, rnd() * H, s);
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      break;
    }
    case 'witch': {
      // Bruxa — fantasma (Echidna) ao fundo + borboletas verde-lima
      try {
        const gh = await loadImage('/themes/bruxa-ghost.png');
        const gw = W * 0.66, ghh = gw * (gh.height / gh.width);
        ctx.globalAlpha = 0.14;
        ctx.drawImage(gh, W / 2 - gw / 2, H * 0.16, gw, ghh);
        ctx.globalAlpha = 1;
      } catch { /* sem fantasma */ }
      ctx.shadowColor = 'rgba(150,255,120,0.9)'; ctx.shadowBlur = 16;
      for (let i = 0; i < 18; i++) {
        ctx.globalAlpha = 0.5 + rnd() * 0.45;
        const s = 16 + rnd() * 24;
        ctx.fillStyle = rnd() < 0.5 ? '#eafff0' : `rgb(${110 + Math.floor(rnd() * 50)},255,${120 + Math.floor(rnd() * 60)})`;
        drawButterfly(ctx, rnd() * W, rnd() * H, s);
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      break;
    }
    case 'glitch': {
      // Code — scanlines verdes + fatias RGB deslocadas
      ctx.fillStyle = 'rgba(57,255,136,0.05)';
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
      for (let i = 0; i < 16; i++) {
        const y = rnd() * H, h = 6 + rnd() * 26, off = 12 + rnd() * 44;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(255,40,90,0.5)'; ctx.fillRect(-off, y, W, h);
        ctx.fillStyle = 'rgba(60,150,255,0.5)'; ctx.fillRect(off, y + 2, W, h);
        ctx.fillStyle = 'rgba(57,255,136,0.45)'; ctx.fillRect(0, y, W, h);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'blood': {
      // Sete (The Boys) — vinheta escura + sangue escorrendo do topo + respingos
      const vg = ctx.createRadialGradient(W / 2, H * 0.4, 200, W / 2, H * 0.4, 900);
      vg.addColorStop(0, 'rgba(90,0,0,0)'); vg.addColorStop(1, 'rgba(70,0,0,0.5)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 22; i++) {
        const x = rnd() * W, w = 4 + rnd() * 11, len = 80 + rnd() * 440;
        const g = ctx.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, 'rgba(180,12,12,0.85)'); g.addColorStop(1, 'rgba(90,0,0,0.18)');
        ctx.fillStyle = g; ctx.fillRect(x, 0, w, len);
        ctx.beginPath(); ctx.arc(x + w / 2, len, w * 0.9, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(140,0,0,0.5)';
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, 10 + rnd() * 30, 0, 7); ctx.fill(); }
      break;
    }
    case 'hands': {
      // poça escura no rodapé (de onde as mãos emergem)
      const pool = ctx.createLinearGradient(0, H, 0, H * 0.66);
      pool.addColorStop(0, 'rgba(10,4,14,0.55)'); pool.addColorStop(1, 'rgba(10,4,14,0)');
      ctx.fillStyle = pool; ctx.fillRect(0, H * 0.66, W, H * 0.34);
      try {
        const hand = await loadImage('/satella-hand.svg');
        const aspect = hand.height / hand.width;
        const drawHand = (x: number, y: number, w: number, rot: number, a: number) => {
          ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
          const h = w * aspect; ctx.drawImage(hand, -w / 2, -h, w, h); ctx.restore();
        };
        for (let i = 0; i < 9; i++) drawHand((i + 0.5) * (W / 9) + (rnd() * 36 - 18), H + 12, 90 + rnd() * 64, rnd() * 0.34 - 0.17, 0.55 + rnd() * 0.35); // baixo
        for (let i = 0; i < 3; i++) { drawHand(-12, H * 0.4 + i * 150, 92, Math.PI * 0.42, 0.42); drawHand(W + 12, H * 0.46 + i * 150, 92, -Math.PI * 0.42, 0.42); } // laterais
      } catch { /* sem svg */ }
      // 愛している sussurrado no céu
      ctx.fillStyle = 'rgba(255,170,205,0.24)'; ctx.font = '34px serif';
      ctx.fillText('愛している', W * 0.5, H * 0.14);
      break;
    }
  }
  ctx.restore();
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
  // partículas congeladas do tema (mãos, corações, neve, runas...) por cima do fundo
  if (themeObj.fx) await drawThemeFx(ctx, W, H, themeObj.fx, accent);

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
  const ay = 570;
  const frame = d.frame || 'none';
  // aros-imagem (coroas) são bem maiores que o avatar → reduzir o raio pra coroa
  // caber entre a marca e o nome (não invadir o "TCORDEIRO").
  const R = frame === 'mine' ? 96 : frame === 'cha' ? 110 : frame === 'code' ? 96 : frame === 'hollow' ? 130 : 140;
  const ringLw = frame === 'pokeball' ? 22 : 16;
  // aros desenhados como IMAGEM (não anel conic): pulam o drawRing padrão
  const imgFrame = frame === 'mine' || frame === 'cha' || frame === 'hollow' || frame === 'code';
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
    if (!imgFrame) drawRing(ctx, cx, ay, R, ringLw, frame, accent);
  } else {
    // base + número do nível, depois o aro por cima
    ctx.fillStyle = surfCol;
    ctx.beginPath(); ctx.arc(cx, ay, R - 4, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = accent;
    ctx.font = '140px Anton, sans-serif'; ctx.fillText(String(d.level), cx, ay + 46);
    ctx.fillStyle = MUTED; ctx.font = '30px Anton, sans-serif'; ctx.fillText('NÍVEL', cx, ay + 100);
    if (!imgFrame) drawRing(ctx, cx, ay, R, ringLw, frame, accent);
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

  // ---- aro Hollow: moldura do Cavaleiro (arte do Talys), cortada na metade + brilho azul ----
  if (frame === 'hollow') {
    await drawImageRing(ctx, cx, ay, R, '/hollow-ring.png', 0.500, 0.474, 0.228, { half: true, glow: 'rgba(95,209,255,0.6)' });
  }
  // ---- aro Code: moldura hacker (arte do Talys), anel completo + brilho verde ----
  if (frame === 'code') {
    await drawImageRing(ctx, cx, ay, R, '/code-ring.png', 0.499, 0.458, 0.203, { glow: 'rgba(57,255,136,0.55)' });
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
  ctx.fillText(d.name.toUpperCase(), cx, ay + 300);

  // ---- rank "Xº da casa" + nível ----
  ctx.fillStyle = MUTED; ctx.font = '42px Anton, sans-serif';
  const rankTxt = d.rank ? `${medal(d.rank)} ${d.rank}º da casa · Nível ${d.level}` : `Nível ${d.level}`;
  ctx.fillText(rankTxt, cx, ay + 368);

  // ---- pontos ----
  ctx.fillStyle = accent; ctx.font = '180px Anton, sans-serif';
  ctx.fillText(String(d.pts), cx, ay + 566);
  ctx.fillStyle = MUTED; ctx.font = '40px Anton, sans-serif';
  ctx.fillText('PONTOS', cx, ay + 630);

  // ---- stats (3 tiles) ----
  const tiles: [string, string][] = [
    [`${d.streak}`, '🔥 SEQUÊNCIA'],
    [`${d.treinos}`, 'TREINOS'],
    [`${d.dias}`, 'DIAS'],
  ];
  const tw = 290, th = 210, gap = 30;
  let tx = (W - (tw * 3 + gap * 2)) / 2;
  const ty = ay + 730;
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

  // ---- linha extra da SEMANA: séries + hidratação (pills alinhados como os tiles) ----
  const extras: string[] = [];
  if (d.seriesWk) extras.push(`🏋️ ${d.seriesWk} séries`);
  if (d.waterAvg) extras.push(`💧 ${(d.waterAvg / 1000).toFixed(1)} L/dia`);
  if (extras.length) {
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED; ctx.font = '30px Anton, sans-serif';
    ctx.fillText('NA SEMANA', cx, ty + th + 56);
    // chips com a MESMA linguagem dos tiles (tint do accent + borda), centrados em grupo
    const chipH = 72, padX = 36, gapC = 24;
    ctx.font = '34px Anton, sans-serif';
    // Emoji (🏋️/💧) é sub-medido pelo measureText — o glifo colorido do SO renderiza
    // mais largo que o advance, então o texto vazava a pill. Folga extra só quando há
    // emoji (Extended_Pictographic não pega dígitos, ao contrário de \p{Emoji}).
    const chips = extras.map((label) => ({
      label,
      w: ctx.measureText(label).width + padX * 2 + (/\p{Extended_Pictographic}/u.test(label) ? 34 : 0),
    }));
    const totalW = chips.reduce((a, c) => a + c.w, 0) + gapC * (chips.length - 1);
    let chx = cx - totalW / 2;
    const chy = ty + th + 80;
    chips.forEach((c) => {
      if (drewImage) {
        ctx.fillStyle = light ? 'rgba(255,255,255,0.84)' : 'rgba(12,13,16,0.74)';
        roundRect(ctx, chx, chy, c.w, chipH, chipH / 2); ctx.fill();
      }
      ctx.fillStyle = `rgba(${tar},${tag},${tab},${light ? 0.13 : 0.18})`;
      roundRect(ctx, chx, chy, c.w, chipH, chipH / 2); ctx.fill();
      ctx.strokeStyle = `rgba(${tar},${tag},${tab},0.55)`; ctx.lineWidth = 3;
      roundRect(ctx, chx, chy, c.w, chipH, chipH / 2); ctx.stroke();
      ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(c.label, chx + c.w / 2, chy + chipH / 2 + 2);
      ctx.textBaseline = 'alphabetic';
      chx += c.w + gapC;
    });
  }

  // ---- rodapé: só a versão (HOME GYM já está no topo) ----
  ctx.textAlign = 'center'; ctx.font = '36px Anton, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText(`v${APP_VERSION}`, cx, H - 80);

  return c.toDataURL('image/png');
}

// ===================== Card da ANATOMIA (músculos treinados) =====================

export interface AnatomyShareData {
  name: string;
  periodLabel: string;            // ex.: "Semana 2 · Jun 2026", "Junho 2026", "2026"
  frontImg: string;               // dataURL do SVG da frente (heatmap no tom do tema)
  backImg: string;                // dataURL do SVG do verso
  muscles: { label: string; pct: number }[]; // fatia % por músculo (desc)
  theme?: string;                 // id do tema (fundo + fx herdam dele)
  color?: string;                 // accent do perfil
}

/** Desenha o card da Anatomia (frente+verso + fatia % por músculo) e devolve o dataURL. */
export async function buildAnatomyCard(d: AnatomyShareData): Promise<string> {
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ok */ }

  const W = 1080, H = 1920, cx = W / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  const themeObj = THEMES.find((t) => t.id === d.theme) || THEMES[0];
  const bgCol = themeObj.swatch[0];
  const surfCol = themeObj.swatch[1];
  const accent = d.color || themeObj.swatch[2];
  const light = isLight(bgCol);
  const INK = light ? '#0b0c0f' : '#ffffff';
  const MUTED = light ? '#5a6068' : '#9098a4';
  const [tar, tag, tab] = hexToRgb(accent);

  // ---- fundo: wallpaper do tema (com véu) ou gradiente + identidade procedural ----
  let drewImage = false;
  if (themeObj.image) {
    try {
      const img = await loadImage(themeObj.image);
      const s = Math.max(W / img.width, H / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, cx - dw / 2, 0, dw, dh);
      const [br, bg2, bb] = hexToRgb(bgCol);
      const veil = ctx.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0, `rgba(${br},${bg2},${bb},0.82)`);
      veil.addColorStop(0.42, `rgba(${br},${bg2},${bb},0.7)`);
      veil.addColorStop(1, `rgba(${br},${bg2},${bb},0.92)`);
      ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
      drewImage = true;
    } catch { /* cai no gradiente */ }
  }
  if (!drewImage) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, surfCol); grad.addColorStop(1, bgCol);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    drawThemeBackdrop(ctx, W, H, themeObj.id, accent);
  }
  if (themeObj.fx) await drawThemeFx(ctx, W, H, themeObj.fx, accent);

  // ---- marca + título ----
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '52px Anton, sans-serif';
  ctx.fillStyle = INK; ctx.fillText('HOME ', cx - ctx.measureText('GYM').width / 2, 120);
  // (marca simples centralizada; o foco é a anatomia)
  ctx.fillStyle = INK; ctx.font = '64px Anton, sans-serif';
  ctx.fillText('MÚSCULOS TREINADOS', cx, 210);
  ctx.fillStyle = accent; ctx.font = '42px Anton, sans-serif';
  ctx.fillText(d.periodLabel.toUpperCase(), cx, 270);

  // ---- bonecos frente + verso lado a lado ----
  const boxW = 430, boxH = 760, gap = 40;
  const x0 = cx - (boxW * 2 + gap) / 2;
  const bodyY = 320;
  const drawBody = async (src: string, bx: number, label: string) => {
    if (drewImage) {
      ctx.fillStyle = light ? 'rgba(255,255,255,0.42)' : 'rgba(12,13,16,0.4)';
      roundRect(ctx, bx, bodyY, boxW, boxH, 28); ctx.fill();
    }
    try {
      const img = await loadImage(src);
      const s = Math.min(boxW / img.width, boxH / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, bx + (boxW - dw) / 2, bodyY + (boxH - dh) / 2, dw, dh);
    } catch { /* sem boneco */ }
    ctx.fillStyle = MUTED; ctx.font = '34px Anton, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, bx + boxW / 2, bodyY + boxH + 46);
  };
  await drawBody(d.frontImg, x0, 'FRENTE');
  await drawBody(d.backImg, x0 + boxW + gap, 'VERSO');

  // ---- fatia % por músculo (barras) ----
  const listY = bodyY + boxH + 110;
  ctx.textAlign = 'left'; ctx.fillStyle = MUTED; ctx.font = '32px Anton, sans-serif';
  ctx.fillText('FATIA POR MÚSCULO', x0, listY);
  const rows = d.muscles.filter((m) => m.pct > 0).slice(0, 8);
  const maxPct = Math.max(1, ...rows.map((m) => m.pct));
  const rowH = 64, barX = x0 + 280, barW = W - barX - x0;
  rows.forEach((m, i) => {
    const ry = listY + 40 + i * rowH;
    ctx.fillStyle = INK; ctx.font = '34px Anton, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(m.label, x0, ry + 30);
    // trilho + preenchimento no tom do accent
    ctx.fillStyle = `rgba(${tar},${tag},${tab},0.16)`;
    roundRect(ctx, barX, ry + 8, barW, 30, 15); ctx.fill();
    const fw = Math.max(30, (m.pct / maxPct) * barW);
    ctx.fillStyle = accent;
    roundRect(ctx, barX, ry + 8, fw, 30, 15); ctx.fill();
    ctx.fillStyle = INK; ctx.font = '30px Anton, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${m.pct}%`, W - x0, ry + 32);
  });

  // ---- rodapé ----
  ctx.textAlign = 'center'; ctx.font = '34px Anton, sans-serif'; ctx.fillStyle = MUTED;
  ctx.fillText(`${d.name.toUpperCase()} · HOME GYM v${APP_VERSION}`, cx, H - 70);

  return c.toDataURL('image/png');
}

/** Compartilha (share nativo) ou baixa o card da Anatomia. */
export async function shareAnatomy(d: AnatomyShareData): Promise<'shared' | 'downloaded'> {
  const dataUrl = await buildAnatomyCard(d);
  const file = dataUrlToFile(dataUrl, 'home-gym-anatomia.png');
  const nav = navigator as Navigator & { canShare?: (data: unknown) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    await nav.share({ files: [file], title: 'Músculos treinados — Home Gym', text: d.periodLabel });
    return 'shared';
  }
  const a = document.createElement('a');
  a.href = dataUrl; a.download = 'home-gym-anatomia.png'; a.click();
  return 'downloaded';
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
