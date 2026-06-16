import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import ExerciseCard from './ExerciseCard';
import { useStore } from '../store/store';
import { deviceId } from '../lib/device';
import type { Exercise } from '../data/types';

// perfil de teste reivindicado por ESTE aparelho (senão os guards anti-trapaça bloqueiam o setlog)
function seed(measures: { date: string; weight?: number }[] = []) {
  const id = 'test-user';
  const base = useStore.getState();
  useStore.setState({
    ...base,
    users: [{
      ...base.users[0], id, name: 'Talys', claimedDevice: deviceId(),
      equipment: ['bodyweight', 'dumbbell'],
    }],
    active: id,
    setlog: {}, history: {}, measures: { [id]: measures },
  });
}

const abdominal: Exercise = { nome: 'Abdominal', musculo: 'Core', series: 3, reps: '20', dica: '' };
const rosca: Exercise = { nome: 'Rosca direta com halteres', musculo: 'Braços', series: 3, reps: '12', dica: '' };

beforeEach(() => cleanup());

describe('ExerciseCard — auto-peso corporal', () => {
  it('exercício corporal mostra a tag "peso do corpo"', () => {
    seed([{ date: '2026-06-15', weight: 72 }]);
    render(<ExerciseCard ex={abdominal} treino="A" exIdx={0} onDemo={() => {}} />);
    expect(screen.getByText(/peso do corpo/i)).toBeInTheDocument();
  });

  it('auto-preenche o kg com o peso do perfil (72) num exercício corporal', async () => {
    seed([{ date: '2026-06-15', weight: 72 }]);
    render(<ExerciseCard ex={abdominal} treino="A" exIdx={0} onDemo={() => {}} />);
    await waitFor(() => {
      const kgInput = screen.getAllByPlaceholderText(/kg|72/i)[0] as HTMLInputElement;
      expect(kgInput.value).toBe('72');
    });
  });

  it('exercício COM carga (halteres) NÃO mostra "peso do corpo" nem auto-preenche', async () => {
    seed([{ date: '2026-06-15', weight: 72 }]);
    render(<ExerciseCard ex={rosca} treino="A" exIdx={0} onDemo={() => {}} />);
    expect(screen.queryByText(/peso do corpo/i)).not.toBeInTheDocument();
    // dá um tempo pro efeito rodar e confirma que o kg seguiu vazio
    await new Promise((r) => setTimeout(r, 50));
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('');
  });

  it('sem peso no perfil, exercício corporal não inventa kg', () => {
    seed([]); // sem medidas
    render(<ExerciseCard ex={abdominal} treino="A" exIdx={0} onDemo={() => {}} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('');
  });
});
