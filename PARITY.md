# PARITY.md — Checklist de paridade com o v1 (+ melhorias)

> Regra: nenhuma feature é "pronta" sem o ✅. O **v1 (home-gym-app, vanilla)** fica vivo em `gym.trazzidely.com.br` até tudo aqui estar ✅. Cada item vira branch → PR → CI → merge. Itens **[MELHORIA]** já nascem corrigidos (não eram assim no v1).

## Fundação
- [x] Shell com **IonTabs nativo** (5 abas: Treino · Dieta · Progresso · Prêmios · Perfil) — páginas reais nativas **[MELHORIA: resolve "modais" do v1]**
- [x] Design system iOS premium (tokens dark, SF Pro, accent limão `#c6ff3a`, Anton display) — herda do DESIGN.md do v1
- [x] Store (estado) — Zustand + immer, persistência localStorage `hgt_v2` + tipos TS
- [x] Perfil ativo **por aparelho** (privacidade) — `hgt_active_device`
- [ ] Gate de login / multi-perfil (Talys, Andressa, Victor + dinâmicos, máx 8)
- [ ] Perfil tester **TCORDEIRO** (tudo liberado)

## Treino
- [x] Fichas A/B/C + Aquecimento por perfil; **segmented control** nas abas de treino **[MELHORIA]**
- [x] Exercícios: nome, foco, dica, séries com **kg × reps** por série, marcar série feita
- [x] Barra de progresso; concluir treino (anti-duplicação 1x/dia por A/B/C)
- [x] Dica de progressão ("última vez Xkg×Y — supera!")
- [x] Cardio (corrida/natação + tipos custom), cronômetro, registro
- [x] Gerador de treino por equipamento+local (pool PT, lê do Perfil)
- [x] Demos offline (free-exercise-db) + vídeo YouTube por exercício (coerente casa/academia)
- [ ] Banner "Hoje é dia de treino" (só na Treino) **[MELHORIA: não polui outras abas]**

## Dieta
- [x] Calculadora Mifflin-St Jeor (meta calorias + déficit/piso, TDEE, proteína)
- [x] IMC + % gordura (Navy)
- [x] Balança: peso + gráfico + delta colorido + "Pesar"
- [x] Hidratação: **seleção copo/garrafa/ml + meta CALCULADA por peso/altura + registrar acima da meta** **[MELHORIA]**
- [x] Diário de alimentos: base `foods.ts` (BR+PT) + soma vs meta + grama editável
- [x] Busca online Open Food Facts (via Edge Function `off-search`) + código de barras
- [x] Foto do prato: "O prato contém…?" + reconhecimento IA no navegador (Transformers.js Food-101)

## Progresso
- [x] Histórico: pontos + nível/XP (anel), stats (treinos/cardios/sequência/dias ativos), calendário com marcações por tipo
- [x] Conquistas (treino + dieta: balança/hidratação) — 13 badges, marcos dourados
- [x] Sessões registradas (expandir detalhe kg×reps, remover com ajuste de pontos)
- [ ] Medidas corporais (peso/braço/peito/cintura) + foto de progresso
- [ ] Gráficos animados (carga por exercício + medidas no tempo)
- [ ] Registro retroativo (treino/cardio outra data)
- [ ] Backup export/import JSON
- [ ] **Compartilhar progresso pra fora do app** (cartão → imagem, Web Share API / share nativo Capacitor) **[MELHORIA: já existe no v1, mas refinar o card e o fluxo]**

## Prêmios
- [ ] Nível/XP + barra; níveis sobem com burst
- [ ] Desafios da semana (quests) + claim; streak freeze (congeladores)
- [ ] Roleta cosmética + roleta da vida
- [ ] Temas com **arte única** (pixel/cel-shade/halftone — componentes e fundos, não só cor) **[MELHORIA]** + animados (Matrix, cyber…)
- [ ] Decorações de avatar

## Perfil
- [x] Local de treino (casa/academia) + equipamento disponível — **por perfil**, alimenta o gerador
- [x] Nome editável + badge de nível bonito no header (Treino) **[MELHORIA]**
- [ ] Editor: foto, cor, tipos de cardio
- [ ] "Conta e ajustes" interno: sincronização, notificações, configurações, histórico **[MELHORIA: já vem aqui]**
- [ ] Excluir/zerar perfil; agenda e lembretes

## Backend / cross-cutting
- [ ] Sync Supabase (login email/senha, RLS, app_state) — mesmo projeto `mtbdbahmwbjmmuljvxfn`
- [ ] **Push real no celular** (Web Push + Capacitor Push nas lojas) **[MELHORIA: chega de banner que não sai]**
- [ ] PWA instalável + **apps de loja via Capacitor** (App Store/Play) **[MELHORIA]**
- [ ] **Ícone do app** (PWA manifest + ícones Capacitor iOS/Android) — herda do v1, refinar pra todos os tamanhos
- [ ] Som + vibração (feedback), reduced-motion
- [ ] Deploy Coolify (gym.trazzidely.com.br) quando atingir paridade → cutover

## Família & Social (escolhido com Talys 09/06)
### Família — local (dá pra fazer já, multi-perfil no aparelho)
- [ ] **Liga da família** — ranking semanal por pontos + pódio + "campeão da semana" (estreia a página Prêmios)
- [ ] **Meta de casal / desafio compartilhado** — barra conjunta (ex.: "20 treinos juntos no mês")
- [ ] **Cutucar + Mural da família** — empurrãozinho entre perfis (`pokes`) + feed de conquistas + reações (🔥👏💪)
- [ ] **Treino em dupla** (flexível: QUALQUER 2 perfis) — marcar "treinamos juntos" → bônus + conquista de dupla
### Amigos / cross-conta — precisa Supabase
- [ ] **Amigo por código/link** — ver pontos/sequência da semana do amigo
- [ ] **Grupos / liga de amigos** — ranking semanal + desafio de grupo
- [ ] **Batalha de DUPLAS 2v2 (ideia do Talys)** — sua dupla (ex.: Talys+Andressa) vs dupla de outra conta (irmão+namorada). Placar da dupla = soma dos pontos dos 2 na janela (semana). Liga, revanche, histórico de confrontos. Dupla = qualquer 2 perfis/contas. Unifica dupla+grupo+duelo num só sistema de "times".
- [ ] **Desafio direto (duelo 1v1)** — 7 dias de sequência, vencedor leva o selo
- [ ] Postar conquista (card de compartilhar) no feed dos amigos
### Bônus de engajamento
- [ ] Conquistas sociais ("família completa treinou hoje", "treinou no mesmo dia que X") · "Não quebre a corrente" (alerta de sequência em risco)
- [ ] **Porta de entrada do social no header do Treino** (espaço vazio ao lado do HOME GYM) — atalho pra liga/amigos/duplas

> ⚠️ Ordem (decidido com Talys 09/06): terminar o CORE/paridade que falta ANTES dos duelos ativos/2v2/amigos cross-conta. A Liga da família (ranking passivo local) já entra; os DUELOS ativos esperam o Supabase.

## Mecânicas novas (pós-paridade)
- [ ] Anel/score de saúde diário · Treino inteligente + ciclo Andressa · Onboarding

## Dieta — Sugestões de refeição (FUTURO, pós-core — ideia do Talys 09/06)
- Com base na meta calculada (kcal/proteína), sugerir **pratos que ajudam** + macros + **receita/vídeo de preparo**, num cartão/sheet discreto (não poluir a página).
- APIs grátis avaliadas: **Spoonacular** (busca por nutrientes/macros + instruções, free tier, precisa chave→proxy Edge Function), **TheMealDB** (grátis, receita+vídeo YouTube, sem filtro de macro), **Edamam** (filtro por calorias/proteína, free tier). Recomendado: Spoonacular pelo "por macros" (ou TheMealDB pra simplicidade+vídeo).
