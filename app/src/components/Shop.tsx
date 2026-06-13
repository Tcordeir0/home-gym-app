import { useState } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { lockOpenOutline, checkmarkCircle } from 'ionicons/icons';
import { useStore, useActiveProfile } from '../store/store';
import {
  CREATINA, type ShopKind,
  shopThemes, shopFrames, shopDecos,
  priceForTheme, priceForFrame, priceForDeco,
} from '../data/shop';
import PixelIcon from './PixelIcon';
import './Shop.css';

interface Row { kind: ShopKind; id: string; name: string; price: number; owned: boolean; preview: React.ReactNode; }

/** Lojinha de cosméticos — abaixo da roleta. Gasta CREATINAS (₡), nunca pontos. */
const Shop: React.FC = () => {
  const profile = useActiveProfile();
  const creatinasBalance = useStore((s) => s.creatinasBalance);
  const buyCosmetic = useStore((s) => s.buyCosmetic);
  // assina o wallet/scores pra o saldo re-renderizar após compra/ganho de pontos
  useStore((s) => s.wallet[s.active]?.spent);
  useStore((s) => s.scores[s.active]);
  const [toast, setToast] = useState('');
  const bal = creatinasBalance();

  const owned = profile.cosmetics;
  const themes: Row[] = shopThemes().map((t) => ({
    kind: 'theme', id: t.id, name: `${t.emoji} ${t.name}`, price: priceForTheme(t), owned: owned.themes.includes(t.id),
    preview: <span className="shop-sw" style={{ background: `linear-gradient(135deg, ${t.swatch[1]}, ${t.swatch[0]})`, boxShadow: `inset 0 0 0 2px ${t.swatch[2]}` }} />,
  }));
  const frames: Row[] = shopFrames().map((f) => ({
    kind: 'frame', id: f.id, name: f.name, price: priceForFrame(f), owned: (owned.frames || []).includes(f.id),
    preview: <span className="shop-ring" style={{ background: `conic-gradient(${f.swatch[0]}, ${f.swatch[1]}, ${f.swatch[0]})` }} />,
  }));
  const decos: Row[] = shopDecos().map((d) => ({
    kind: 'deco', id: d.id, name: d.name, price: priceForDeco(d), owned: owned.hats.includes(d.id),
    preview: <span className="shop-deco"><PixelIcon id={d.id} size={22} /></span>,
  }));

  const buy = (r: Row) => {
    const res = buyCosmetic(r.kind, r.id, r.price);
    if (res === 'ok') setToast(`Comprado: ${r.name}! Use no Perfil 🎉`);
    else if (res === 'owned') setToast('Você já tem esse.');
    else setToast(`Faltam ${r.price - bal} ${CREATINA} pra esse.`);
  };

  const section = (title: string, rows: Row[]) => (
    <div className="shop-sec">
      <h3 className="shop-sec-h">{title}</h3>
      <div className="shop-grid">
        {rows.map((r) => (
          <div key={r.kind + r.id} className={'shop-item' + (r.owned ? ' owned' : '')}>
            {r.preview}
            <span className="shop-name">{r.name}</span>
            {r.owned ? (
              <span className="shop-have"><IonIcon icon={checkmarkCircle} /> Tido</span>
            ) : (
              <button className={'shop-buy' + (bal < r.price ? ' poor' : '')} onClick={() => buy(r)}>
                {CREATINA}{r.price}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="shop">
      <div className="shop-head">
        <h2 className="card-title"><IonIcon icon={lockOpenOutline} /> Lojinha</h2>
        <span className="shop-bal">{CREATINA}{bal.toLocaleString('pt-BR')}</span>
      </div>
      <p className="card-sub">Cada ponto vira <b>1 {CREATINA}</b> (creatina) automaticamente. Os pontos não são gastos — só as creatinas.</p>
      {section('Temas', themes)}
      {section('Aros', frames)}
      {section('Decorações', decos)}
      <IonToast isOpen={!!toast} message={toast} duration={2200} position="top" onDidDismiss={() => setToast('')} />
    </div>
  );
};

export default Shop;
