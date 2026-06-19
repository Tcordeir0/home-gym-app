import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Diary from './Diary';
import { useStore, todayISO } from '../store/store';
import { deviceId } from '../lib/device';

function seedWithFood() {
  const base = useStore.getState();
  const id = 'test-user';
  useStore.setState({
    ...base,
    users: [{ ...base.users[0], id, name: 'Talys', claimedDevice: deviceId() }],
    active: id,
    daily: {
      [id]: {
        [todayISO()]: {
          food: [
            { n: 'Ovo', k: 155, p: 13, g: 100, meal: 'cafe' },
            { n: 'Arroz', k: 130, p: 3, g: 150, meal: 'almoco' },
            { n: 'Pão', k: 265, p: 9, g: 50 }, // legado sem refeição
          ],
        },
      },
    },
  });
}

beforeEach(() => cleanup());

describe('Diary — agrupamento por refeição', () => {
  it('renderiza os cabeçalhos de refeição e os itens agrupados, sem quebrar', () => {
    seedWithFood();
    render(<Diary />);
    // cabeçalhos das refeições presentes (Café/Almoço aparecem no grupo E no seletor "Adicionar em")
    expect(screen.getAllByText(/Café da manhã/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Almoço/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sem refeição/)).toBeInTheDocument(); // só no grupo (não é refeição selecionável)
    // itens nos grupos
    expect(screen.getByText('Ovo')).toBeInTheDocument();
    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('Pão')).toBeInTheDocument();
    // seletor de "Adicionar em:" aparece
    expect(screen.getByText(/Adicionar em:/)).toBeInTheDocument();
  });
});
