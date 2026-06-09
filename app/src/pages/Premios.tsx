import { useMemo, useState } from 'react';
import { IonCard, IonCardContent, IonToast } from '@ionic/react';
import { motion } from 'framer-motion';
import AppPage from '../components/AppPage';
import { useStore } from '../store/store';
import { familyLeague, weekDates } from '../lib/league';
import { QUESTS } from '../data/quests';
import { type Prize } from '../data/roulette';
import Roleta from '../components/Roleta';
import { waterGoal } from '../lib/diet';
import { fxReward } from '../lib/feedback';
import './Premios.css';

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dd = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MES[m - 1]}`;
};
const MEDALS = ['🥇', '🥈', '🥉'];

const Premios: React.FC = () => {
  const users = useStore((s) => s.users);
  const scores = useStore((s) => s.scores);
  const active = useStore((s) => s.active);
  const history = useStore((s) => s.history);
  const measures = useStore((s) => s.measures);
  const daily = useStore((s) => s.daily);
  const claimQuest = useStore((s) => s.claimQuest);
  const spinRoulette = useStore((s) => s.spinRoulette);
  const [toast, setToast] = useState('');

  const league = useMemo(() => familyLeague({ users, scores }), [users, scores]);
  const wk = weekDates();
  const max = Math.max(1, league[0]?.pts || 0);
  const anyPts = league.some((r) => r.pts > 0);
  const champ = anyPts ? league[0] : null;

  const measureArr = measures[active] || [];
  let lw: number | null = null, lwDate = '';
  measureArr.forEach((m) => { if (typeof m.weight === 'number' && m.date >= lwDate) { lw = m.weight; lwDate = m.date; } });
  const ctx = {
    history: history[active] || [],
    measures: measureArr,
    daily: daily[active] || {},
    weekDays: wk,
    waterGoal: waterGoal(lw),
  };
  const aProfile = users.find((u) => u.id === active);
  const claimed = aProfile?.quests?.week === wk[0] ? aProfile.quests.claimed : {};
  const onClaim = (id: string, reward: number) => {
    claimQuest(id, reward);
    fxReward();
    setToast(`Resgatado +${reward} pts 🎉`);
  };

  const activePts = Object.values(scores[active]?.byDay || {}).reduce((a, b) => a + b, 0);
  const spins = Math.max(0, Math.floor(activePts / 100) - (aProfile?.spinsUsed || 0));
  const onPrize = (prize: Prize) => {
    fxReward();
    setToast(`Você ganhou ${prize.label}! ${prize.emoji}`);
  };

  return (
    <AppPage title="Prêmios">
      <IonCard className="prem-card">
        <IonCardContent>
          <div className="prem-head">
            <h2 className="card-title">Liga da família</h2>
            <span className="prem-week">{dd(wk[0])} – {dd(wk[6])}</span>
          </div>

          {champ ? (
            <div className="champ">
              <span className="champ-crown">👑</span>
              <span><b>{champ.name}</b> é o topo da casa · Nível {champ.level}</span>
            </div>
          ) : (
            <p className="card-sub">Treinem pra subir de nível e disputar o topo 🔥</p>
          )}

          <div className="liga-list">
            {league.map((r, i) => (
              <motion.div
                key={r.id}
                className="liga-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="liga-pos">{i < 3 && r.pts > 0 ? MEDALS[i] : `${i + 1}º`}</span>
                <span className="liga-av" style={{ background: r.color }}>
                  {r.photo ? <img src={r.photo} alt="" /> : (r.name[0] || '?').toUpperCase()}
                </span>
                <div className="liga-main">
                  <div className="liga-top">
                    <span className="liga-name">{r.name}</span>
                    <span className="liga-pts">Nível {r.level}</span>
                  </div>
                  <div className="liga-bar">
                    <span style={{ width: (r.pts / max) * 100 + '%' }} />
                  </div>
                  <span className="liga-week">{r.weekPts > 0 ? `+${r.weekPts} pts esta semana` : 'sem pontos esta semana'} · {r.pts} total</span>
                </div>
              </motion.div>
            ))}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Desafios da semana */}
      <IonCard className="prem-card">
        <IonCardContent>
          <h2 className="card-title">Desafios da semana</h2>
          <p className="card-sub">Reiniciam toda segunda. Complete e resgate os pontos.</p>
          <div className="quest-list">
            {QUESTS.map((q) => {
              const raw = q.progress(ctx);
              const cur = Math.min(q.target, raw);
              const done = raw >= q.target;
              const got = !!claimed[q.id];
              return (
                <div key={q.id} className={'quest' + (got ? ' got' : '')}>
                  <span className="quest-emoji">{q.emoji}</span>
                  <div className="quest-main">
                    <div className="quest-top">
                      <span className="quest-label">{q.label}</span>
                      <span className="quest-rw">+{q.reward}</span>
                    </div>
                    <div className="quest-bar"><span style={{ width: (cur / q.target) * 100 + '%' }} /></div>
                  </div>
                  {got ? (
                    <span className="quest-claimed">✓</span>
                  ) : done ? (
                    <motion.button whileTap={{ scale: 0.94 }} className="quest-go" onClick={() => onClaim(q.id, q.reward)}>
                      Resgatar
                    </motion.button>
                  ) : (
                    <span className="quest-prog">{cur}/{q.target}</span>
                  )}
                </div>
              );
            })}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Roleta de prêmios */}
      <IonCard className="prem-card">
        <IonCardContent>
          <div className="prem-head">
            <h2 className="card-title">Roleta de prêmios</h2>
            <span className="prem-week">{spins} giro{spins !== 1 ? 's' : ''}</span>
          </div>
          <p className="card-sub">1 giro a cada 100 pts. Pontos, congelador, tema ou cosmético.</p>
          <Roleta spins={spins} onSpin={spinRoulette} onResult={onPrize} />
        </IonCardContent>
      </IonCard>

      <IonCard className="prem-card soon">
        <IonCardContent>
          <h2 className="card-title">Em breve 🔜</h2>
          <p className="card-sub">
            Temas com arte única, decorações de avatar, conquistas sociais e a <b>batalha de duplas 2v2</b> entre contas.
          </p>
        </IonCardContent>
      </IonCard>

      <IonToast isOpen={!!toast} message={toast} duration={2000} position="bottom" onDidDismiss={() => setToast('')} />
    </AppPage>
  );
};

export default Premios;
