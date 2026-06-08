# Home Gym Tracker

App de treino em casa que virou um **joguinho de saúde**: fichas por perfil, demonstrações offline, pontos, conquistas, ranking entre a família e recompensas (temas e decorações de avatar). Página única em **HTML/CSS/JS vanilla**, sem build, instalável como **PWA** e com **sincronização na nuvem**.

![stack](https://img.shields.io/badge/stack-HTML%20%C2%B7%20CSS%20%C2%B7%20JS%20vanilla-c6ff3a) ![sem build](https://img.shields.io/badge/build-nenhum-15181d) ![PWA](https://img.shields.io/badge/PWA-offline-3ad1ff) ![sync](https://img.shields.io/badge/sync-Supabase-ff5fa8)

**🔗 App:** https://tcordeir0.github.io/home-gym-tracker/

---

## Funcionalidades

### Treino
- **Perfis ilimitados**, cada um com a própria ficha, foco, cor, equipamento e tipos de cardio. Criar/editar/excluir no editor de perfil.
- **Split A / B / C + aquecimento** por perfil, em abas.
- Cada exercício: **grupo muscular**, **séries × reps**, **dica de execução**, **demonstração offline** (👁, animação de 2 quadros) e link de **vídeo** no YouTube.
- **Gerador de treino**: escolhe **equipamento** (peso do corpo, halteres, barra, elástico, kettlebell, barra fixa…) e **foco** (peito, costas, pernas, glúteo, ombro, braços, core, corpo todo) e monta A/B/C a partir de um **pool curado em português** (~60 exercícios).
- **Marcação de séries**, **barra de progresso** e **timer de descanso** (60/90/120s) com som/vibração no fim.
- **Cronometragem**: início/fim e duração de treino e cardio, com horário de cada série.

### Gamificação
- **Pontos** por série (+5), treino concluído (+50) e cardio (+30) — por perfil.
- **Conquistas** com som e aviso ao desbloquear; **sequência (streak)** com chama animada.
- **Ranking da casa**: todos os perfis por pontos, com medalhas e **cutucar** (recado playful entre os perfis).
- **Recompensas** (duas roletas):
  - **Cosmética** (1 giro por conquista): **8 temas** que reskinam o app (com textura) + **8 decorações de avatar** estilo Discord (molduras que abraçam a foto).
  - **Da vida** (conquistas-marco): sorteia mimos (lanche livre, descanso) e desafios saudáveis (+água, +cardio).
- **Card de compartilhar** estilo "Wrapped" (imagem com foto, pontos, posição e stats) para postar no story.
- **Notificações** (sino): cutucadas, conquistas e recompensas.

### Social / nuvem
- **Login obrigatório** (conta compartilhada) — só quem entra vê os perfis. Loga uma vez por aparelho.
- **Sincronização** entre celulares via **Supabase** (Postgres + RLS). Foto de perfil, cosméticos, pontos e histórico sincronizam.

### Ajustes
- **Configurações** (engrenagem): feedback ao tocar (**Som / Vibração / Ambos / Nenhum**) e **tema claro/escuro**.
- **Backup** Exportar/Importar (`.json`) no histórico.
- Visual **mobile-first**, ícones **SVG (Lucide)**, tipografia [Anton](https://fonts.google.com/specimen/Anton) + [Manrope](https://fonts.google.com/specimen/Manrope). Conteúdo em **português**.

---

## Como rodar

Não há instalação nem build:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
# ou servidor local (para acessar de outro device na mesma rede)
python3 -m http.server 8000   # http://localhost:8000
```

Hospedado de graça no **GitHub Pages** (push na `main` → deploy automático).

## Instalar como app (PWA)

Instalável e funciona **offline** após a primeira abertura.
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.
- **Android (Chrome):** menu **⋮** → **Instalar app**.
- **PC (Chrome/Edge):** ícone de instalar na barra de endereço.

> Ao publicar mudanças, incremente a versão do cache (`hgt-vN`) em `sw.js` para forçar a atualização nos aparelhos instalados.

---

## Sincronização (Supabase)

O site continua estático no GitHub Pages; ele conversa com um projeto **Supabase** (gratuito) pela API.

1. Crie um projeto em [supabase.com](https://supabase.com) (região mais próxima).
2. **SQL Editor** → rode o `supabase_setup.sql` deste repositório (cria a tabela `app_state` + RLS).
3. **Authentication → Users → Add user** (email + senha, com *Auto Confirm*) — esse é o login compartilhado.
4. **Settings → API** → copie o **Project URL** e a **anon key** e cole em `SUPABASE_URL` / `SUPABASE_ANON_KEY` no topo do `index.html`.

A `anon key` é pública por design — a segurança vem das regras **RLS** (cada conta só acessa os próprios dados). O plano gratuito pausa após ~1 semana sem uso (basta reativar no painel).

---

## Customização

Toda a lógica está no `index.html`:

| O quê | Onde |
|-------|------|
| Pool de exercícios do gerador | `POOL` |
| Fichas iniciais (Talys/Andressa) | `PLANS` · template de novos perfis em `TEMPLATE_TREINOS` |
| Demonstrações offline | `DEMOS` (imagens em `demos/`, do [free-exercise-db](https://github.com/yuhonas/free-exercise-db)) |
| Conquistas | `ACHIEVEMENTS` |
| Temas / decorações / recompensas da vida | `THEME_CATALOG`, `THEME_TEX`, `HATS_CATALOG`, `LIFE_REWARDS` |
| Ícones (Lucide) | `ICONS` |

---

## Versionamento

Versão semântica automatizada com [release-please](https://github.com/googleapis/release-please-action) (commits no padrão *Conventional Commits*). A versão aparece no rodapé do app e é atualizada sozinha ao mergear o PR de release.

## Créditos de dados

- Imagens de exercício: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (domínio público).
- Ícones: [Lucide](https://lucide.dev) (ISC). Temas e decorações: arte/CSS **originais** (inspirados em vibes de jogos, sem assets de terceiros).

## Licença

[MIT](LICENSE) © 2026 Talys Cordeiro
