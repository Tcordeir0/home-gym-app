import { describe, it, expect } from 'vitest';
import { emphasisOf } from './emphasis';

describe('emphasisOf — atribuição de sub-região', () => {
  it('Coice de glúteo (kickback) conta como GLÚTEO, não tríceps (bug corrigido)', () => {
    const e = emphasisOf('Coice de glúteo (kickback)');
    expect(e?.bases).toContain('gluteus-maximus');
    expect(e?.bases).not.toContain('triceps-lateral');
  });
  it('Tríceps coice com halteres continua tríceps', () => {
    expect(emphasisOf('Tríceps coice com halteres')?.bases).toContain('triceps-lateral');
  });
  it('Mergulho nas paralelas (peito) é peito inferior, não tríceps', () => {
    expect(emphasisOf('Mergulho nas paralelas (peito)')?.bases).toContain('chest-lower');
  });
  it('Crucifixo invertido (rear delt) segue deltoide posterior', () => {
    expect(emphasisOf('Crucifixo invertido com halteres (rear delt)')?.bases).toContain('deltoid-rear');
  });
});
