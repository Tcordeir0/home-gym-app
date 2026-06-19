import { useState, useEffect, lazy, Suspense } from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { trashOutline, addOutline, calendarOutline, copyOutline } from 'ionicons/icons';
import { cloudOutline, cameraOutline, barcodeOutline } from 'ionicons/icons';

// scanner pesado (@zxing) só carrega quando o usuário abre — fora do bundle inicial
const BarcodeScanner = lazy(() => import('./BarcodeScanner'));
import PlateSheet from './PlateSheet';
import { useStore, useActiveProfile, todayISO } from '../store/store';
import { targetsFor, isBeverage } from '../lib/diet';
import { FOODS } from '../data/foods';
import { offSearch, offBarcode, type OffHit } from '../lib/off';

const normTxt = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Aproximação: 1 colher de sopa cheia ≈ 15g (referência de cozinha).
const GRAMS_PER_SPOON = 15;
const spoons = (g: number) => Math.max(1, Math.round(g / GRAMS_PER_SPOON));

const Diary: React.FC = () => {
  const profile = useActiveProfile();
  const daily = useStore((s) => s.daily);
  const active = useStore((s) => s.active);
  const latestMeasure = useStore((s) => s.latestMeasure);
  const addFoodOn = useStore((s) => s.addFoodOn);
  const setGramsOn = useStore((s) => s.setFoodGramsOn);
  const removeFoodOn = useStore((s) => s.removeFoodOn);
  const copyFoodOn = useStore((s) => s.copyFoodOn);
  const copyDietFromPrev = useStore((s) => s.copyDietFromPrev);
  const [moveIdx, setMoveIdx] = useState<number | null>(null);
  const [moveDate, setMoveDate] = useState(''); // destino do "copiar p/ outro dia" (não dispara no onChange — iOS dispara hoje sozinho)
  const [copyMsg, setCopyMsg] = useState('');
  // dia em foco (permite registrar em dias retroativos)
  const [date, setDate] = useState(todayISO());
  useEffect(() => { setMoveIdx(null); setCopyMsg(''); setMoveDate(''); }, [date]);
  const today = todayISO();
  const isToday = date === today;
  const stepDay = (n: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + n);
    const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (ds <= today) setDate(ds); // não deixa ir pro futuro
  };
  const dateLabel = (() => {
    if (isToday) return 'Hoje';
    const d = new Date(date + 'T12:00:00');
    const y = new Date(today + 'T12:00:00'); y.setDate(y.getDate() - 1);
    const yIso = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    if (date === yIso) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  })();
  const [q, setQ] = useState('');
  const [bc, setBc] = useState('');
  const [online, setOnline] = useState<OffHit[]>([]);
  const [onlineMsg, setOnlineMsg] = useState('');
  const [plateOpen, setPlateOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const doOnline = async () => {
    setOnline([]);
    setOnlineMsg('Buscando online…');
    try {
      const hits = q.trim() ? await offSearch(q.trim()) : [];
      setOnline(hits);
      setOnlineMsg(hits.length ? '' : 'Nada encontrado online pra isso.');
    } catch {
      setOnlineMsg('Sem conexão pra buscar online agora.');
    }
  };
  const doBarcode = async (raw?: string) => {
    const code = (raw ?? bc).replace(/\D/g, '');
    if (code.length < 6) return;
    setOnline([]);
    setOnlineMsg('Buscando código…');
    try {
      const hit = await offBarcode(code);
      if (hit) { setOnline([hit]); setOnlineMsg(''); }
      else setOnlineMsg('Produto não encontrado nesse código.');
    } catch {
      setOnlineMsg('Sem conexão pra buscar o código agora.');
    }
  };
  const pick = (it: { n: string; k: number; p: number; tags?: string }) => {
    addFoodOn(date, { n: it.n, k: it.k, p: it.p, g: 0, liq: isBeverage(it.n, it.tags) });
    setQ(''); setBc(''); setOnline([]); setOnlineMsg('');
  };

  const weight = latestMeasure('weight');
  const t = targetsFor(profile.body, weight);
  const food = daily?.[active]?.[date]?.food || [];

  let kcal = 0, prot = 0, carb = 0, fatg = 0;
  food.forEach((it) => {
    kcal += (it.k * it.g) / 100; prot += (it.p * it.g) / 100;
    carb += ((it.c || 0) * it.g) / 100; fatg += ((it.f || 0) * it.g) / 100;
  });
  kcal = Math.round(kcal); prot = Math.round(prot); carb = Math.round(carb); fatg = Math.round(fatg);
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
        <div className="diary-head">
          <h2 className="card-title">🍽️ Diário</h2>
          <div className="diary-date">
            <button className="dd-arrow" onClick={() => stepDay(-1)} aria-label="Dia anterior">‹</button>
            <button className={'dd-day' + (isToday ? '' : ' past')} onClick={() => setDate(today)}>{dateLabel}</button>
            <button className="dd-arrow" onClick={() => stepDay(1)} disabled={isToday} aria-label="Próximo dia">›</button>
          </div>
        </div>
        {!isToday && <p className="diary-retro">Registrando em <b>{dateLabel.toLowerCase()}</b> · toque na data pra voltar pra hoje.</p>}

        {t ? (
          <>
            <div className="diary-meta">
              <span className="diary-kcal" style={{ color: over ? '#ff6b6b' : 'var(--brand-lime)' }}>
                {kcal}<small> / {t.target} kcal</small>
              </span>
            </div>
            <div className="hid-bar">
              <span className="diary-fill" style={{ width: pct + '%', background: over ? '#ff6b6b' : undefined }} />
            </div>
            <div className="diary-rem" style={{ color: over ? '#ff6b6b' : undefined }}>
              {over ? `Passou ${kcal - t.target} kcal da meta` : `Faltam ${t.target - kcal} kcal pra meta`}
            </div>
            <div className="diary-macros">
              {([['Proteína', prot, t.protein], ['Carbo', carb, t.carbs], ['Gordura', fatg, t.fat]] as const).map(([l, v, tgt]) => (
                <div className="dmacro" key={l}>
                  <div className="dmacro-top"><span>{l}</span><span><b>{v}</b>/{tgt}g</span></div>
                  <div className="dmacro-track"><span style={{ width: Math.min(100, tgt ? Math.round((v / tgt) * 100) : 0) + '%' }} /></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="card-sub">Preencha a calculadora (idade, altura, peso) pra ver sua meta aqui.</p>
        )}

        <div className="diary-list">
          {food.length ? (
            food.map((it, i) => (
              <div className="food-item" key={i}>
                <div className="food-row">
                  <div className="food-main">
                    <div className="food-name">{it.n}</div>
                    <div className="food-spoons">
                      {it.liq
                        ? (it.g >= 1000 ? `≈ ${(it.g / 1000).toFixed(it.g % 1000 === 0 ? 0 : 1)} L` : `${it.g} ml`)
                        : `≈ ${spoons(it.g)} ${spoons(it.g) === 1 ? 'colher' : 'colheres'} de sopa`}
                    </div>
                  </div>
                  <div className="food-g-wrap">
                    <input
                      className="food-g"
                      type="number"
                      inputMode="numeric"
                      aria-label={it.liq ? 'Mililitros' : 'Gramas'}
                      placeholder={it.liq ? 'ml' : 'g'}
                      value={it.g || ''}
                      onChange={(e) => { const g = parseFloat(e.target.value); setGramsOn(date, i, isNaN(g) || g < 0 ? 0 : g); }}
                    />
                    <span className="food-g-unit">{it.liq ? 'ml' : 'g'}</span>
                  </div>
                  <div className="food-kcal">{Math.round((it.k * it.g) / 100)}<small>kcal</small></div>
                  <button className={'food-move' + (moveIdx === i ? ' on' : '')} onClick={() => setMoveIdx(moveIdx === i ? null : i)} aria-label="Copiar para outro dia">
                    <IonIcon icon={calendarOutline} />
                  </button>
                  <button className="food-del" onClick={() => removeFoodOn(date, i)} aria-label="Remover">
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
                {moveIdx === i && (
                  <div className="food-movebar">
                    <span>Copiar <b>{it.n}</b> de <b>{dateLabel.toLowerCase()}</b> para outro dia (mantém aqui):</span>
                    <div className="food-movebar-row">
                      {/* o copiar só dispara no botão — no iOS o onChange do date dispara "hoje" sozinho ao abrir */}
                      <input
                        type="date"
                        max={today}
                        value={moveDate}
                        onChange={(e) => setMoveDate(e.target.value)}
                        aria-label="Dia de destino"
                      />
                      <button
                        className="food-move-go"
                        disabled={!moveDate || moveDate === date}
                        onClick={() => { copyFoodOn(date, i, moveDate); setMoveIdx(null); setMoveDate(''); }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="diary-empty">Nenhum alimento {isToday ? 'hoje' : 'neste dia'}. Busque abaixo ou copie o dia anterior.</p>
          )}
        </div>
        {/* repetir o dia anterior: empilha as refeições (some no dia vazio = "copiar",
            com comida já lançada = "repetir" e adiciona por cima) */}
        <button
          className={'diary-copy' + (food.length ? ' diary-copy--add' : '')}
          onClick={() => { setCopyMsg(copyDietFromPrev(date) ? '' : 'Nenhum dia anterior com comida pra repetir.'); }}
        >
          <IonIcon icon={copyOutline} /> {food.length ? 'Repetir dia anterior' : 'Copiar dia anterior'}
        </button>
        {copyMsg && <p className="diary-copymsg">{copyMsg}</p>}

        <button className="food-online-go diary-photo" onClick={() => setPlateOpen(true)}>
          <IonIcon icon={cameraOutline} /> Foto do prato
        </button>
        <input
          className="bal-in diary-search"
          placeholder="Buscar alimento (frango, arroz, fiambre)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {hits.length > 0 && (
          <div className="food-results">
            {hits.map((f, i) => (
              <button className="food-hit" key={i} onClick={() => pick({ n: f.n, k: f.kcal, p: f.p, tags: f.tags })}>
                <span className="food-hit-n">{f.n}</span>
                <span className="food-hit-k">{f.kcal} kcal · {f.p}g prot</span>
                <IonIcon className="food-hit-add" icon={addOutline} />
              </button>
            ))}
          </div>
        )}
        {qn.length >= 2 && (
          <button className="food-online-go" onClick={doOnline}>
            <IonIcon icon={cloudOutline} /> Buscar "{q.trim()}" online
          </button>
        )}

        <div className="bc-row">
          <input
            className="bal-in bc-in"
            inputMode="numeric"
            placeholder="Código de barras"
            value={bc}
            onChange={(e) => setBc(e.target.value)}
          />
          <button className="bc-scan" onClick={() => setScanOpen(true)} aria-label="Escanear código">
            <IonIcon icon={barcodeOutline} />
          </button>
          <button className="bc-go" onClick={() => doBarcode()}>Buscar</button>
        </div>

        {onlineMsg && <p className="diary-empty">{onlineMsg}</p>}
        {online.length > 0 && (
          <div className="food-results">
            {online.map((h, i) => (
              <button className="food-hit" key={i} onClick={() => pick(h)}>
                <span className="food-hit-n">{h.n}</span>
                <span className="food-hit-k">{Math.round(h.k)} kcal · {h.p}g prot</span>
                <IonIcon className="food-hit-add" icon={addOutline} />
              </button>
            ))}
          </div>
        )}

        <PlateSheet open={plateOpen} date={date} onClose={() => setPlateOpen(false)} />
        {scanOpen && (
          <Suspense fallback={null}>
            <BarcodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onCode={(code) => { setBc(code); void doBarcode(code); }} />
          </Suspense>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default Diary;
