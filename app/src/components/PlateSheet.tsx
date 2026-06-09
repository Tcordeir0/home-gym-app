import { useRef, useState } from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { imageOutline, trashOutline, addOutline, sparklesOutline } from 'ionicons/icons';
import { useStore } from '../store/store';
import { FOODS, type Food } from '../data/foods';
import { resizePhoto } from '../lib/image';
import { recognizePlate, ptLabel, food101Local } from '../lib/foodAI';

const normTxt = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

interface PlateItem { n: string; k: number; p: number; g: number }
interface Chip { term: string; score: number; local: Food | null }

const PlateSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const addFood = useStore((s) => s.addFoodToday);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState('');
  const [msg, setMsg] = useState('');
  const [chips, setChips] = useState<Chip[]>([]);
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [q, setQ] = useState('');

  const reset = () => { setPhoto(''); setMsg(''); setChips([]); setPlate([]); setQ(''); };
  const close = () => { reset(); onClose(); };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await resizePhoto(file, 720);
    setPhoto(url);
    setMsg('Analisando o prato (1ª vez baixa a IA)…');
    try {
      const res = await recognizePlate(url);
      const cands: Chip[] = res.map((r) => {
        const term = ptLabel(r.label);
        return { term, score: r.score, local: food101Local(term) };
      });
      if (cands.length) {
        const top = cands[0];
        if (top.score >= 0.3 && top.local) {
          setPlate((p) => [...p, { n: top.local!.n, k: top.local!.kcal, p: top.local!.p, g: top.local!.porcao || 100 }]);
        }
        setChips(cands.slice(0, 5));
        setMsg('');
      } else setMsg('Não reconheci o prato. Monte na mão abaixo. 👇');
    } catch {
      setMsg(navigator.onLine ? 'Não consegui rodar a IA agora.' : 'Sem internet pra carregar a IA. Monte na mão. 👇');
    }
    e.target.value = '';
  };

  const addLocal = (f: Food) => { setPlate((p) => [...p, { n: f.n, k: f.kcal, p: f.p, g: f.porcao || 100 }]); setQ(''); };
  const addChip = (c: Chip) => { if (c.local) addLocal(c.local); else setQ(c.term); };
  const updGrams = (i: number, g: number) => setPlate((p) => p.map((it, j) => (j === i ? { ...it, g } : it)));
  const removeItem = (i: number) => setPlate((p) => p.filter((_, j) => j !== i));
  const confirm = () => { plate.forEach((it) => addFood(it)); close(); };

  const qn = normTxt(q).trim();
  const hits = qn.length >= 2 ? FOODS.filter((f) => normTxt(f.n).includes(qn) || normTxt(f.tags || '').includes(qn)).slice(0, 8) : [];

  return (
    <IonModal isOpen={open} onDidDismiss={close} breakpoints={[0, 0.92]} initialBreakpoint={0.92} handle>
      <IonContent className="plate-content">
        <div className="plate-wrap">
          <h2 className="plate-title">Foto do prato</h2>
          <button className="plate-photo-btn" onClick={() => fileRef.current?.click()}>
            <IonIcon icon={imageOutline} /> Tirar ou escolher foto
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />
          {photo && <img className="plate-img" src={photo} alt="prato" />}
          {msg && <p className="plate-msg">{msg}</p>}

          {chips.length > 0 && (
            <>
              <p className="plate-ai">
                <IonIcon icon={sparklesOutline} /> Acho que tem <b>{chips[0].term}</b>. Toque pra adicionar ou corrija:
              </p>
              <div className="ai-chips">
                {chips.map((c, i) => (
                  <button className="ai-chip" key={i} onClick={() => addChip(c)}>
                    {c.term} <small>{Math.round(c.score * 100)}%</small>
                  </button>
                ))}
              </div>
            </>
          )}

          <h3 className="plate-h">O prato contém…?</h3>
          {plate.length ? (
            plate.map((it, i) => (
              <div className="food-row" key={i}>
                <div className="food-name">{it.n}</div>
                <input
                  className="food-g"
                  type="number"
                  value={it.g}
                  onChange={(e) => { const g = parseFloat(e.target.value); if (!isNaN(g) && g > 0) updGrams(i, g); }}
                />
                <div className="food-kcal">{Math.round((it.k * it.g) / 100)}<small>kcal</small></div>
                <button className="food-del" onClick={() => removeItem(i)} aria-label="Remover">
                  <IonIcon icon={trashOutline} />
                </button>
              </div>
            ))
          ) : (
            <p className="diary-empty">Adicione os alimentos do prato pela busca. Ajuste as gramas.</p>
          )}

          <input
            className="bal-in diary-search"
            placeholder="Adicionar alimento (busca)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {hits.length > 0 && (
            <div className="food-results">
              {hits.map((f, i) => (
                <button className="food-hit" key={i} onClick={() => addLocal(f)}>
                  <span className="food-hit-n">{f.n}</span>
                  <span className="food-hit-k">{f.kcal} kcal · {f.p}g prot</span>
                  <IonIcon className="food-hit-add" icon={addOutline} />
                </button>
              ))}
            </div>
          )}

          <button className="plate-confirm" onClick={confirm} disabled={!plate.length}>
            Adicionar ao diário {plate.length ? `(${plate.length})` : ''}
          </button>
          <p className="plate-note">A IA roda no seu aparelho (a foto não sai daqui). Pratos bem brasileiros podem não ser reconhecidos — aí você completa na mão.</p>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PlateSheet;
