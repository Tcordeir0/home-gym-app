import { useState } from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { trashOutline, addOutline } from 'ionicons/icons';
import { useStore, useActiveProfile, todayISO } from '../store/store';
import { targetsFor } from '../lib/diet';
import { FOODS } from '../data/foods';

const normTxt = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const Diary: React.FC = () => {
  const profile = useActiveProfile();
  const daily = useStore((s) => s.daily);
  const active = useStore((s) => s.active);
  const latestMeasure = useStore((s) => s.latestMeasure);
  const addFood = useStore((s) => s.addFoodToday);
  const setGrams = useStore((s) => s.setFoodGrams);
  const removeFood = useStore((s) => s.removeFoodToday);
  const [q, setQ] = useState('');

  const weight = latestMeasure('weight');
  const t = targetsFor(profile.body, weight);
  const food = daily?.[active]?.[todayISO()]?.food || [];

  let kcal = 0, prot = 0;
  food.forEach((it) => { kcal += (it.k * it.g) / 100; prot += (it.p * it.g) / 100; });
  kcal = Math.round(kcal); prot = Math.round(prot);
  const pct = t ? Math.min(100, Math.round((kcal / t.target) * 100)) : 0;
  const over = !!t && kcal > t.target;

  const qn = normTxt(q).trim();
  const hits =
    qn.length >= 2
      ? FOODS.filter((f) => normTxt(f.n).includes(qn) || normTxt(f.tags || '').includes(qn)).slice(0, 8)
      : [];

  return (
    <IonCard className="diet-card">
      <IonCardContent>
        <h2 className="card-title">🍽️ Diário de hoje</h2>

        {t ? (
          <>
            <div className="diary-meta">
              <span className="diary-kcal" style={{ color: over ? '#ff6b6b' : 'var(--brand-lime)' }}>
                {kcal}<small> / {t.target} kcal</small>
              </span>
              <span className="diary-prot">prot {prot}/{t.protein}g</span>
            </div>
            <div className="hid-bar">
              <span className="diary-fill" style={{ width: pct + '%', background: over ? '#ff6b6b' : undefined }} />
            </div>
            <div className="diary-rem" style={{ color: over ? '#ff6b6b' : undefined }}>
              {over ? `Passou ${kcal - t.target} kcal da meta` : `Faltam ${t.target - kcal} kcal pra meta`}
            </div>
          </>
        ) : (
          <p className="card-sub">Preencha a calculadora (idade, altura, peso) pra ver sua meta aqui.</p>
        )}

        <div className="diary-list">
          {food.length ? (
            food.map((it, i) => (
              <div className="food-row" key={i}>
                <div className="food-name">{it.n}</div>
                <input
                  className="food-g"
                  type="number"
                  inputMode="numeric"
                  value={it.g}
                  onChange={(e) => { const g = parseFloat(e.target.value); if (!isNaN(g) && g > 0) setGrams(i, g); }}
                />
                <div className="food-kcal">{Math.round((it.k * it.g) / 100)}<small>kcal</small></div>
                <button className="food-del" onClick={() => removeFood(i)} aria-label="Remover">
                  <IonIcon icon={trashOutline} />
                </button>
              </div>
            ))
          ) : (
            <p className="diary-empty">Nenhum alimento hoje. Busque abaixo pra montar seu dia.</p>
          )}
        </div>

        <input
          className="bal-in diary-search"
          placeholder="Buscar alimento (frango, arroz, fiambre)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {hits.length > 0 && (
          <div className="food-results">
            {hits.map((f, i) => (
              <button
                className="food-hit"
                key={i}
                onClick={() => { addFood({ n: f.n, k: f.kcal, p: f.p, g: f.porcao || 100 }); setQ(''); }}
              >
                <span className="food-hit-n">{f.n}</span>
                <span className="food-hit-k">{f.kcal} kcal · {f.p}g prot</span>
                <IonIcon className="food-hit-add" icon={addOutline} />
              </button>
            ))}
          </div>
        )}
        {qn.length >= 2 && !hits.length && (
          <p className="diary-empty">Nada na base local. Busca online (Open Food Facts) chega no próximo PR.</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default Diary;
