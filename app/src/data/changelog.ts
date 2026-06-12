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
];
