// Changelog do app — o mais recente fica no TOPO. O modal "Novidades" mostra
// CHANGELOG[0] uma vez por versão (logo após escolher o perfil).
export interface ChangelogEntry {
  version: string;
  date: string; // AAAA-MM-DD
  added?: string[];   // ✨ Novidades
  fixed?: string[];   // 🛠️ Correções
  removed?: string[]; // 🗑️ Removido
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.7.0',
    date: '2026-06-12',
    added: [
      'Anatomia: mapa muscular no Progresso mostrando o que você mais treinou, com foco da semana',
      'Tema Chá (Re:Zero) com as mãos da Satella e o aro dos 7 pecados',
      'Temas Return, Creator e Bloco (Minecraft) com fonte própria e partículas de encantamento',
      'Aros novos: Minecraft (coroa de blocos) e Tridente dourado',
      'Conquistas agora desbloqueiam itens + 6 conquistas novas',
      'Dieta completa: gráfico, histórico, calendário e registro retroativo',
      'App instalável e funciona offline (PWA)',
      'Cor do perfil personalizada (RGB)',
      'A barra de perfis mostra o aro e a animação do tema de cada um',
      'Botão Social no header (em breve: convite, chat, cutucar, conquistas)',
      'Som, vibração e notificações com pedido de permissão',
    ],
    fixed: [
      'Vibração agora funciona no iPhone (Haptics nativo)',
      'Notificações aparecem no topo da tela',
      'Card de compartilhar: aros não invadem mais o nome e ficam legíveis',
      'Identidade do perfil centralizada e mais limpa',
      'Tema Branco corrigido',
    ],
    removed: [
      'Boneco de blocos da anatomia (virou um modelo anatômico de verdade)',
      'Avisos de "Em breve" de coisas que já estão prontas',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-06-10',
    added: [
      'Login e conta na nuvem — seus dados sincronizam entre aparelhos',
      'App reorganizado em 5 abas no estilo iOS',
      'Sistema de temas com papel de parede e efeito "liquid glass"',
      'Cosméticos e aros de avatar',
      'Roleta de prêmios e desafios semanais (quests)',
      'Liga da família com ranking semanal',
    ],
    fixed: [
      'Vários ajustes de layout e desempenho no estilo iOS',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-06-09',
    added: [
      'Reconstrução do app em React/Ionic',
      'Treino completo: A/B/C, séries com kg × reps, gerador de treino e demonstrações',
      'Dieta: calculadora de calorias, balança com gráfico, hidratação e diário de alimentos',
      'Progresso: medidas, fotos, gráficos e conquistas',
    ],
  },
];
