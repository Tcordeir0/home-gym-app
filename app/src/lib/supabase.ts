// Cliente Supabase (projeto gerenciado "home-gym"). URL + anon key são PÚBLICAS
// (protegidas por RLS) — podem ficar no app. Nada de service_role aqui.
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mtbdbahmwbjmmuljvxfn.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10YmRiYWhtd2JqbW11bGp2eGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODg2MzksImV4cCI6MjA5NjI2NDYzOX0.SJ9Upx2cXeA84LGomHh8nJnIha-s2Rl1Jv0AFM1kiFI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'hgt_auth',
  },
});

/** Traduz os erros comuns do Supabase Auth pra PT-BR. */
export function authErrorPt(message?: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu email antes de entrar.';
  if (m.includes('user already registered')) return 'Esse email já tem conta. Tente entrar.';
  if (m.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('unable to validate email') || m.includes('invalid format')) return 'Email inválido.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Espere um pouco.';
  if (m.includes('network') || m.includes('failed to fetch')) return 'Sem conexão. Verifique a internet.';
  return message || 'Algo deu errado. Tente de novo.';
}
