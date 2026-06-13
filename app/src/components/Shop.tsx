import { useState } from 'react';
import { IonIcon, IonModal, IonToast } from '@ionic/react';
import { bagHandleOutline, closeOutline, checkmarkCircle } from 'ionicons/icons';
import { useStore, useActiveProfile } from '../store/store';
import {
  CREATINA, type ShopKind,
  shopThemes, shopFrames, shopDecos,
  priceForTheme, priceForFrame, priceForDeco,
} from '../data/shop';
import PixelIcon from './PixelIcon';
import './Shop.css';

interface Row { kind: ShopKind; id: string; name: string; price: number; owned: boolean; preview: React.ReactNode; }

/** Botão da Lojinha (header de Prêmios) + modal com previews corretos (sem cortar nomes). */
const Shop: React.FC = () => {
  const [open, setOpen] = useState(false);
  const profile = useActiveProfile();
  const creatinasBalance = useStore((s) => s.creatinasBalance);
  const buyCosmetic = useStore((s) => s.buyCosmetic);
  // re-renderiza o saldo quando ganha ponto ou compra
  useStore((s) => s.wallet[s.active]?.spent);
  useStore((s) => s.scores[s.active]);
  const [toast, setToast] = useState('');
  const bal = creatinasBalance();

  const owned = profile.cosmetics;
  const themes: Row[] = shopThemes().map((t) => ({
    kind: 'theme', id: t.id, name: `${t.emoji} ${t.name}`, price: priceForTheme(t), owned: owned.themes.includes(t.id),
    preview: <span className="shop-pv" style={t.image
      ? { backgroundImage: `url(${t.image})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: `inset 0 0 0 2px ${t.swatch[2]}` }
      : { background: `linear-gradient(135deg, ${t.swatch[1]}, ${t.swatch[0]})`, boxShadow: `inset 0 0 0 2px ${t.swatch[2]}` }} />,
  }));
  const frames: Row[] = shopFrames().map((f) => ({
    kind: 'frame', id: f.id, name: f.name, price: priceForFrame(f), owned: (owned.frames || []).includes(f.id),
    preview: <span className="shop-pv ring" style={{ background: `conic-gradient(${f.swatch[0]}, ${f.swatch[1]}, ${f.swatch[0]})` }} />,
  }));
  const decos: Row[] = shopDecos().map((d) => ({
    kind: 'deco', id: d.id, name: d.name, price: priceForDeco(d), owned: owned.hats.includes(d.id),
    preview: <span className="shop-pv deco"><PixelIcon id={d.id} size={26} /></span>,
  }));

  const buy = (r: Row) => {
    const res = buyCosmetic(r.kind, r.id, r.price);
    if (res === 'ok') setToast(`Comprado: ${r.name}! Use no Perfil 🎉`);
    else if (res === 'owned') setToast('Você já tem esse.');
    else setToast(`Faltam ${(r.price - bal).toLocaleString('pt-BR')} ${CREATINA} pra esse.`);
  };

  const section = (title: string, rows: Row[]) => (
    <div className="shop-sec">
      <h3 className="shop-sec-h">{title} <small>({rows.length})</small></h3>
      {rows.map((r) => (
        <div key={r.kind + r.id} className={'shop-row' + (r.owned ? ' owned' : '')}>
          {r.preview}
          <span className="shop-name">{r.name}</span>
          {r.owned ? (
            <span className="shop-have"><IonIcon icon={checkmarkCircle} /> Tido</span>
          ) : (
            <button className={'shop-buy' + (bal < r.price ? ' poor' : '')} onClick={() => buy(r)}>
              {CREATINA}{r.price.toLocaleString('pt-BR')}
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <button className="shop-btn" onClick={() => setOpen(true)} aria-label="Lojinha">
        <IonIcon icon={bagHandleOutline} />
      </button>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)} className="shop-modal">
        <div className="shop-top">
          <h2 className="shop-mtitle"><IonIcon icon={bagHandleOutline} /> Lojinha</h2>
          <span className="shop-bal">{CREATINA}{bal.toLocaleString('pt-BR')}</span>
          <button className="shop-close" onClick={() => setOpen(false)} aria-label="Fechar"><IonIcon icon={closeOutline} /></button>
        </div>
        <div className="shop-body">
          <p className="shop-note">Cada ponto vira <b>1 {CREATINA}</b> (creatina) automaticamente. Os pontos não somem — só as creatinas são gastas.</p>
          {section('Temas', themes)}
          {section('Aros', frames)}
          {section('Decorações', decos)}
        </div>
        <IonToast isOpen={!!toast} message={toast} duration={2200} position="top" onDidDismiss={() => setToast('')} />
      </IonModal>
    </>
  );
};

export default Shop;
