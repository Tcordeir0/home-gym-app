import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';
import { deviceId } from '../lib/device';

// perfil de teste reivindicado por ESTE aparelho (senão os guards anti-trapaça bloqueiam)
function seed() {
  const base = useStore.getState();
  useStore.setState({
    ...base,
    users: [{ ...base.users[0], id: 'test-user', name: 'Talys', claimedDevice: deviceId(), equipment: ['bodyweight', 'dumbbell'] }],
    active: 'test-user',
    setlog: {}, history: {}, scores: {},
  });
}

/** marca a série 0 de um exercício como feita (kg×reps) no setlog. */
function markSet(treino: string, exIdx: number, kg: string, reps: string) {
  const s = useStore.getState();
  s.setSetField(treino, exIdx, 0, 'kg', kg, 3);
  s.setSetField(treino, exIdx, 0, 'reps', reps, 3);
  s.toggleSetDone(treino, exIdx, 0, 3);
}

describe('completeWorkout — re-concluir mescla (bug do exercício esquecido)', () => {
  beforeEach(seed);

  it('1ª conclusão retorna "ok" e grava o treino', () => {
    markSet('A', 0, '20', '10');
    const r = useStore.getState().completeWorkout('A', [{ nome: 'Supino' }]);
    expect(r).toBe('ok');
    const hist = useStore.getState().history['test-user'];
    expect(hist).toHaveLength(1);
    expect(hist[0].exercises!.map((e) => e.nome)).toEqual(['Supino']);
  });

  it('RE-concluir com um exercício esquecido retorna "updated" e MESCLA (não duplica o dia)', () => {
    // 1ª: conclui o Supino
    markSet('A', 0, '20', '10');
    expect(useStore.getState().completeWorkout('A', [{ nome: 'Supino' }])).toBe('ok');

    // esqueceu o Tríceps: marca SÓ ele (índice 1) e conclui de novo
    markSet('A', 1, '15', '12');
    const r = useStore.getState().completeWorkout('A', [{ nome: 'Supino' }, { nome: 'Tríceps testa' }]);

    expect(r).toBe('updated'); // não barra mais com "já registrou"
    const hist = useStore.getState().history['test-user'];
    expect(hist).toHaveLength(1); // continua UM registro no dia (mesclou)
    expect(hist[0].exercises!.map((e) => e.nome).sort()).toEqual(['Supino', 'Tríceps testa']); // o esquecido entrou
  });

  it('"updated" credita as séries novas mas NÃO repete o bônus de treino', () => {
    markSet('A', 0, '20', '10');
    useStore.getState().completeWorkout('A', [{ nome: 'Supino' }]);
    const after1 = useStore.getState().scores['test-user'].byDay;
    const day = Object.keys(after1)[0];
    const pts1 = after1[day]; // PTS_TREINO(50) + PTS_SET(5)

    markSet('A', 1, '15', '12');
    useStore.getState().completeWorkout('A', [{ nome: 'Supino' }, { nome: 'Tríceps testa' }]);
    const pts2 = useStore.getState().scores['test-user'].byDay[day];

    expect(pts2 - pts1).toBe(5); // só +1 série (5 pts), sem 2º bônus de 50
  });

  it('concluir sem nenhuma série feita retorna "empty"', () => {
    expect(useStore.getState().completeWorkout('A', [{ nome: 'Supino' }])).toBe('empty');
  });
});
