# PARITY.md — Checklist de paridade com o v1 (+ melhorias)

> Regra: nenhuma feature é "pronta" sem o ✅. O **v1 (home-gym-app, vanilla)** fica vivo em `gym.trazzidely.com.br` até tudo aqui estar ✅. Cada item vira branch → PR → CI → merge. Itens **[MELHORIA]** já nascem corrigidos (não eram assim no v1).

## Fundação
- [ ] Shell com **IonTabs nativo** (5 abas: Treino · Dieta · Progresso · Prêmios · Perfil) — páginas reais nativas **[MELHORIA: resolve "modais" do v1]**
- [ ] Design system iOS premium (tokens dark, SF Pro, accent limão `#c6ff3a`, Anton display) — herda do DESIGN.md do v1
- [ ] Store (estado) — Zustand ou Context, com persistência localStorage + tipos TS
- [ ] Perfil ativo **por aparelho** (privacidade) — `hgt_active_device`
- [ ] Gate de login / multi-perfil (Talys, Andressa, Victor + dinâmicos, máx 8)
- [ ] Perfil tester **TCORDEIRO** (tudo liberado)

## Treino
- [ ] Fichas A/B/C + Aquecimento por perfil; **segmented control** nas abas de treino **[MELHORIA]**
- [ ] Exercícios: nome, foco, dica, séries com **kg × reps** por série, marcar série feita
- [ ] Barra de progresso; concluir treino (anti-duplicação 1x/dia por A/B/C)
- [ ] Dica de progressão ("última vez Xkg×Y — supera!")
- [ ] Cardio (corrida/natação + tipos custom), cronômetro, registro
- [ ] Gerador de treino por equipamento (pool PT)
- [ ] Demos offline (free-exercise-db) + vídeo YouTube por exercício
- [ ] Banner "Hoje é dia de treino" (só na Treino) **[MELHORIA: não polui outras abas]**

## Dieta
- [ ] Calculadora Mifflin-St Jeor (meta calorias + déficit/piso, TDEE, proteína)
- [ ] IMC + % gordura (Navy)
- [ ] Balança: peso + gráfico + delta colorido + "Pesar"
- [ ] Hidratação: **seleção copo/garrafa/ml + meta CALCULADA por peso/altura + registrar acima da meta** **[MELHORIA]**
- [ ] Diário de alimentos: base `foods.json` (BR+PT) + soma vs meta + grama editável
- [ ] Busca online Open Food Facts (via Edge Function `off-search`) + código de barras
- [ ] Foto do prato: "O prato contém…?" + reconhecimento IA no navegador (Transformers.js Food-101)

## Progresso
- [ ] Histórico: pontos, stats (total/mês/7dias/sequência), calendário com marcações
- [ ] Conquistas (treino + dieta: balança/hidratação)
- [ ] Sessões registradas (expandir detalhe, remover)
- [ ] Medidas corporais (peso/braço/peito/cintura) + foto de progresso
- [ ] Gráficos animados (carga por exercício + medidas no tempo)
- [ ] Registro retroativo (treino/cardio outra data)
- [ ] Backup export/import JSON

## Prêmios
- [ ] Nível/XP + barra; níveis sobem com burst
- [ ] Desafios da semana (quests) + claim; streak freeze (congeladores)
- [ ] Roleta cosmética + roleta da vida
- [ ] Temas com **arte única** (pixel/cel-shade/halftone — componentes e fundos, não só cor) **[MELHORIA]** + animados (Matrix, cyber…)
- [ ] Decorações de avatar

## Perfil
- [ ] Editor: nome, foto, cor, equipamento, tipos de cardio
- [ ] "Conta e ajustes" interno: sincronização, notificações, configurações, histórico **[MELHORIA: já vem aqui]**
- [ ] Badge de nível bonito no topo (header) **[MELHORIA]**
- [ ] Excluir/zerar perfil; agenda e lembretes

## Backend / cross-cutting
- [ ] Sync Supabase (login email/senha, RLS, app_state) — mesmo projeto `mtbdbahmwbjmmuljvxfn`
- [ ] **Push real no celular** (Web Push + Capacitor Push nas lojas) **[MELHORIA: chega de banner que não sai]**
- [ ] PWA instalável + **apps de loja via Capacitor** (App Store/Play) **[MELHORIA]**
- [ ] Som + vibração (feedback), reduced-motion
- [ ] Deploy Coolify (gym.trazzidely.com.br) quando atingir paridade → cutover

## Mecânicas novas (pós-paridade)
- [ ] Anel/score de saúde diário · Duelo da família (liga) · Treino inteligente + ciclo Andressa · Onboarding

## Dieta — Sugestões de refeição (FUTURO, pós-core — ideia do Talys 09/06)
- Com base na meta calculada (kcal/proteína), sugerir **pratos que ajudam** + macros + **receita/vídeo de preparo**, num cartão/sheet discreto (não poluir a página).
- APIs grátis avaliadas: **Spoonacular** (busca por nutrientes/macros + instruções, free tier, precisa chave→proxy Edge Function), **TheMealDB** (grátis, receita+vídeo YouTube, sem filtro de macro), **Edamam** (filtro por calorias/proteína, free tier). Recomendado: Spoonacular pelo "por macros" (ou TheMealDB pra simplicidade+vídeo).
