import { useMemo, useState } from 'react';
import { IonCard, IonCardContent, IonIcon, IonAlert, IonToast } from '@ionic/react';
import { flame, barbell, heart, calendarOutline, lockClosed, chevronDown, trashOutline, shareOutline } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import Calendar from '../components/Calendar';
import Medidas from '../components/Medidas';
import Graficos from '../components/Graficos';
import FotoProgresso from '../components/FotoProgresso';
import Ferramentas from '../components/Ferramentas';
import { useStore } from '../store/store';
import { statsFor, levelInfo, type StatsInput } from '../lib/stats';
import { ACHIEVEMENTS } from '../data/achievements';
import { shareProgress } from '../lib/shareCard';
import { familyLeague } from '../lib/league';
import type { HistoryEntry } from '../store/types';
import './Progresso.css';

const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const W_LABEL: Record<HistoryEntry['w'], string> = { A: 'Treino A', B: 'Treino B', C: 'Treino C', cardio: 'Cardio' };

function fmtDate(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]}, ${d} ${MES[m - 1]}`;
}
function todayISO(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const R = 46;
const CIRC = 2 * Math.PI * R;

const Progresso: React.FC = () => {
  const active = useStore((s) => s.active);
  const users = useStore((s) => s.users);
  const history = useStore((s) => s.history);
  const scores = useStore((s) => s.scores);
  const measures = useStore((s) => s.measures);
  const daily = useStore((s) => s.daily);
  const removeHistoryEntry = useStore((s) => s.removeHistoryEntry);

  const [expanded, setExpanded] = useState<number | null>(null);
  const [delIdx, setDelIdx] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const name = users.find((u) => u.id === active)?.name || '';
  const today = todayISO();

  const stats = useMemo(() => {
    const input: StatsInput = { users, history, scores, measures, daily };
    return statsFor(input, active);
  }, [users, history, scores, measures, daily, active]);

  const lvl = levelInfo(stats.pts);

  // marcações do calendário
  const marks = useMemo(() => {
    const out: Record<string, 'treino' | 'cardio' | 'both' | 'dieta'> = {};
    (history[active] || []).forEach((e) => {
      const kind: 'treino' | 'cardio' = e.w === 'cardio' ? 'cardio' : 'treino';
      const prev = out[e.date];
      out[e.date] = !prev ? kind : prev === kind || prev === 'both' ? prev : 'both';
    });
    // dieta: marca dias com alimento registrado (treino tem prioridade no ponto)
    const dd = daily[active] || {};
    Object.keys(dd).forEach((date) => {
      if ((dd[date].food || []).length && !out[date]) out[date] = 'dieta';
    });
    return out;
  }, [history, active, daily]);

  // sessões mais recentes primeiro, guardando o índice original
  const sessions = useMemo(() => {
    return (history[active] || [])
      .map((e, idx) => ({ e, idx }))
      .sort((a, b) => (a.e.date < b.e.date ? 1 : a.e.date > b.e.date ? -1 : b.idx - a.idx));
  }, [history, active]);

  const unlocked = ACHIEVEMENTS.filter((a) => a.test(stats)).length;

  const onShare = async () => {
    try {
      const aProfile = users.find((u) => u.id === active);
      const league = familyLeague({ users, scores });
      const rank = league.findIndex((r) => r.id === active) + 1;
      const res = await shareProgress({
        name, level: lvl.level, pts: stats.pts, pct: lvl.pct,
        streak: stats.streak, treinos: stats.treinos, dias: stats.activeDays,
        photo: aProfile?.photo, color: aProfile?.color,
        rank: rank > 0 ? rank : undefined, totalProfiles: users.length,
        theme: aProfile?.cosmetics?.theme || 'dark',
        frame: aProfile?.cosmetics?.frame || 'none',
        hat: aProfile?.cosmetics?.hat || undefined,
      });
      setToast(res === 'shared' ? 'Compartilhado! 💪' : 'Card salvo (galeria/Downloads) 📲');
    } catch {
      setToast('Não consegui gerar o card agora');
    }
  };

  return (
    <AppPage title="Progresso">
      {/* Nível + pontos */}
      <IonCard className="prog-card lvl-card">
        <IonCardContent>
          <button className="lvl-share" onClick={onShare} aria-label="Compartilhar progresso">
            <IonIcon icon={shareOutline} />
          </button>
          <div className="lvl-wrap">
            <div className="lvl-ring">
              <svg viewBox="0 0 110 110" width="110" height="110">
                <circle cx="55" cy="55" r={R} className="ring-bg" />
                <circle
                  cx="55" cy="55" r={R} className="ring-fg"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - lvl.pct / 100)}
                  transform="rotate(-90 55 55)"
                />
              </svg>
              <div className="lvl-center">
                <span className="lvl-num">{lvl.level}</span>
                <span className="lvl-cap">nível</span>
              </div>
            </div>
            <div className="lvl-info">
              <span className="lvl-pts">{stats.pts}<small> pts</small></span>
              <span className="lvl-name">{name}</span>
              <div className="lvl-bar"><span style={{ width: lvl.pct + '%' }} /></div>
              <span className="lvl-next">
                {lvl.span - lvl.into} pts até o nível {lvl.level + 1}
              </span>
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Estatísticas */}
      <div className="prog-stats">
        <div className="pstat">
          <IonIcon icon={barbell} />
          <span className="pstat-v">{stats.treinos}</span>
          <span className="pstat-l">Treinos</span>
        </div>
        <div className="pstat">
          <IonIcon icon={heart} />
          <span className="pstat-v">{stats.cardios}</span>
          <span className="pstat-l">Cardios</span>
        </div>
        <div className={'pstat' + (stats.streak >= 3 ? ' hot' : '')}>
          <IonIcon icon={flame} />
          <span className="pstat-v">{stats.streak}</span>
          <span className="pstat-l">Sequência</span>
        </div>
        <div className="pstat">
          <IonIcon icon={calendarOutline} />
          <span className="pstat-v">{stats.activeDays}</span>
          <span className="pstat-l">Dias ativos</span>
        </div>
      </div>

      {/* Calendário */}
      <IonCard className="prog-card">
        <IonCardContent>
          <h2 className="card-title">Calendário</h2>
          <Calendar marks={marks} today={today} />
        </IonCardContent>
      </IonCard>

      {/* Conquistas */}
      <IonCard className="prog-card">
        <IonCardContent>
          <div className="ach-head">
            <h2 className="card-title">Conquistas</h2>
            <span className="ach-count">{unlocked}/{ACHIEVEMENTS.length}</span>
          </div>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a, i) => {
              const got = a.test(stats);
              return (
                <div key={i} className={'ach' + (got ? ' got' : '') + (got && a.milestone ? ' gold' : '')}>
                  <IonIcon icon={got ? a.icon : lockClosed} />
                  <span className="ach-l">{a.label}</span>
                  <span className="ach-d">{a.desc}</span>
                </div>
              );
            })}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Sessões */}
      <IonCard className="prog-card">
        <IonCardContent>
          <h2 className="card-title">Sessões</h2>
          {sessions.length === 0 ? (
            <p className="prog-empty">Nenhuma sessão ainda. Conclua um treino na aba <b>Treino</b>.</p>
          ) : (
            <div className="sess-list">
              {sessions.map(({ e, idx }) => {
                const open = expanded === idx;
                const setCount = (e.exercises || []).reduce((a, x) => a + x.sets.length, 0);
                return (
                  <div key={idx} className={'sess' + (open ? ' open' : '')}>
                    <button className="sess-head" onClick={() => setExpanded(open ? null : idx)}>
                      <span className={'sess-tag ' + (e.w === 'cardio' ? 'cardio' : 'treino')}>
                        {e.w === 'cardio' ? (e.emoji || '🔥') : e.w}
                      </span>
                      <span className="sess-main">
                        <span className="sess-title">{e.w === 'cardio' ? (e.t || 'Cardio') : W_LABEL[e.w]}</span>
                        <span className="sess-sub">
                          {fmtDate(e.date)}
                          {e.w !== 'cardio' && setCount > 0 && ` · ${setCount} série${setCount > 1 ? 's' : ''}`}
                        </span>
                      </span>
                      {e.w !== 'cardio' && <IonIcon className="sess-chev" icon={chevronDown} />}
                    </button>
                    {open && e.w !== 'cardio' && (
                      <div className="sess-body">
                        {(e.exercises || []).map((x, j) => (
                          <div key={j} className="sess-ex">
                            <span className="sess-ex-n">{x.nome}</span>
                            <span className="sess-ex-s">
                              {x.sets.length
                                ? x.sets.map((st) => `${st.kg ?? '–'}kg×${st.reps ?? '–'}`).join('  ')
                                : '—'}
                            </span>
                          </div>
                        ))}
                        <button className="sess-del" onClick={() => setDelIdx(idx)}>
                          <IonIcon icon={trashOutline} /> Apagar sessão
                        </button>
                      </div>
                    )}
                    {e.w === 'cardio' && (
                      <button className="sess-del cardio-del" onClick={() => setDelIdx(idx)} aria-label="Apagar">
                        <IonIcon icon={trashOutline} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Medidas + gráficos + foto de progresso */}
      <Medidas />
      <Graficos />
      <FotoProgresso />
      <Ferramentas onToast={setToast} />

      <IonAlert
        isOpen={delIdx !== null}
        header="Apagar sessão?"
        message="Os pontos dessa sessão serão removidos."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Apagar', role: 'destructive',
            handler: () => { if (delIdx !== null) removeHistoryEntry(delIdx); setExpanded(null); },
          },
        ]}
        onDidDismiss={() => setDelIdx(null)}
      />

      <IonToast
        isOpen={!!toast}
        message={toast}
        duration={2200}
        position="bottom"
        onDidDismiss={() => setToast('')}
      />
    </AppPage>
  );
};

export default Progresso;
