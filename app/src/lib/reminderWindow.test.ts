import { describe, it, expect } from 'vitest';
import { inReminderWindow } from './reminderWindow';

describe('inReminderWindow (espelha o inTick da edge send-reminders)', () => {
  it('dispara no horário exato e dentro da janela de 15 min', () => {
    expect(inReminderWindow('08:00', 8, 0)).toBe(true);
    expect(inReminderWindow('08:00', 8, 14)).toBe(true);
    expect(inReminderWindow('08:00', 8, 15)).toBe(false); // 15 já fora
  });

  it('não dispara antes do horário', () => {
    expect(inReminderWindow('08:00', 7, 59)).toBe(false);
  });

  it('horários :45+ funcionam (bug do v3 corrigido — não estoura passando do minuto 59)', () => {
    expect(inReminderWindow('08:50', 8, 55)).toBe(true); // diff 5
    expect(inReminderWindow('08:50', 9, 4)).toBe(true);  // diff 14 (virou a hora)
    expect(inReminderWindow('08:50', 9, 5)).toBe(false); // diff 15
  });

  it('vira a meia-noite (módulo 1440)', () => {
    expect(inReminderWindow('23:55', 0, 5)).toBe(true);  // diff 10
    expect(inReminderWindow('23:55', 0, 10)).toBe(false); // diff 15
  });
});
