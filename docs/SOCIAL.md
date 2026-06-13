# Social — arquitetura (v0.8.0)

Backend no Supabase (projeto `home-gym`), cliente em `app/src/lib/social.ts`.

## Tabelas (já aplicadas via migration `social_v1_schema`)

| Tabela | Pra quê |
|---|---|
| `social_accounts` | Projeção PÚBLICA de cada conta: `{uid, email, profiles: [{id,name,color}]}`. Amigos enxergam os perfis pra cutucar. |
| `friendships` | Amizade conta↔conta: `requester`, `addressee`, `status` (pending/accepted). |
| `pokes` | Cutucadas: `from_uid`, `from_label`, `to_uid`, `to_profile`, `emoji`, `seen`. |
| `messages` | Chat conta↔conta: `from_uid`, `to_uid`, `body`, `seen`. |

**Funções:** `are_friends(a,b)` (são amigos aceitos?) · `find_account_by_email(email)` → uid (pra convidar sem expor dados de todos).

**RLS:** cada um vê só o próprio + dos amigos aceitos. Cutucar/mensagem só entre amigos. **Realtime** ligado em `messages`, `pokes`, `friendships`.

## Cliente (`lib/social.ts`)
`syncSocialAccount` (publica perfis no login — já ligado no `sync.ts`) · `inviteByEmail` · `listFriendships` / `acceptFriend` / `removeFriend` · `listAccounts` (perfis dos amigos) · `poke` / `listPokes` / `markPokesSeen` · `sendMessage` / `listMessages` · `subscribeSocial` (realtime).

## v0.8.0 — implementado
- UI completa: **Amigos** (convite por email, aceitar/recusar), **Cutucar** (equipe + amigos), **Chat** (equipe via `from_profile/to_profile` na mesma conta + amigos cross-conta, realtime), **Feed** de novidades dos amigos.
- `social_events` (migration v3): desbloqueios postados via `postEvent` (ligado na roleta em `Premios.tsx`); amigos veem no feed.
- `messages.from_profile/to_profile` (migration v4) → chat entre perfis da mesma conta (equipe).
- Migrations: `social_v1_schema`, `social_v2_team_pokes`, `social_v3_events`, `social_v4_team_chat`.

## Falta — próximo passo
- Página/sheet Social no botão do header do Treino (hoje é "Em breve"):
  - Aba **Amigos**: convidar por email, lista de amigos, aceitar/recusar pedidos.
  - Aba **Cutucar**: lista de perfis dos amigos (e da própria equipe) com botão cutucar; recebidas com badge.
  - Aba **Chat**: conversa por amigo (realtime via `subscribeSocial`).
- **Notificações** a amigos+grupo em desbloqueio/level-up (insert em `pokes`/canal próprio, ou tabela `events`).
- **Nome de perfil único + sugestões** (validar contra `social_accounts.profiles` e sugerir disponíveis).
