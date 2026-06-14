# Home Gym — Backlog (pós v0.8.1)

Lista viva do que o Talys pediu. Cada item grande vira um épico próprio, testado no device antes do próximo.

## ✅ Feito na branch `fix/app-v082` (aguardando validação no device → vira v0.8.2)
- Tab bar sem vazio interno + mais baixa; fim de página sem vão gigante.
- Treino A/B/C legíveis (fundo + texto forte no wallpaper).
- Nomes do chat na cor do tema (não mais azul).
- 🔊 Som não morre após travar a tela (resume do AudioContext em toque/visibility).
- 📋 Copiar dieta do dia anterior.
- 🏷️ Versão exibida bumpa sozinha (release-please + version.ts) — não trava em 0.7.0.
- 🔄 Trocar exercício por variação da mesma ênfase (botão "Trocar").
- 🧪 Selo TESTE só no dev.

## 🔜 Fila (épicos) — ordem sugerida
### 1. 🛒 Loja + moeda CREATINA
- Moeda **₡** (C com traço, estilo € mas C). 1 ponto → N creatinas, conversão **automática e balanceada**.
- Pontos NÃO são gastos (só creatinas). Creatinas = `floor(pontos_totais × taxa) − gasto` (pura, sem dupla conversão; byDay é cumulativo).
- Loja **abaixo da roleta** (Prêmios), comprar temas/aros/decos. Bonita em TODOS os temas.
- **CREATOR**: fora da loja E **invisível** pra qualquer perfil que não seja o Talys de `talysmatheus12@gmail.com`.

### 2. 🦾 Anatomia 2.0 — gendered + granular + ênfase ✅ (conferir no device)
- ✅ **Boneco gendered**: masculino = `body-muscles` (vulovix, 85+ regiões com cabeças); feminino = `react-muscle-highlighter`. **Sexo da Calculadora** (`body.sex`) decide — absorve o #9 "sexo define anatomia".
- ✅ **Sub-regiões no masculino**: peito superior/inferior, tríceps longa/lateral, deltoide frontal/lateral/posterior, lats/traps por faixa, gastrocnêmio/sóleo.
- ✅ **Camada de ênfase** (`lib/emphasis.ts`): cada exercício marca a região/cabeça pelo nome → mostra no card e no **Trocar** (escolher a parte do músculo) + acende a sub-região certa no boneco masculino.
- ✅ Exercícios: antebraço 0→5, panturrilha 1→5. Legenda sem quebra de linha. Anatomia virou card próprio no topo do Progresso.
- ⚠️ **CONFERIR NO DEVICE**: render real dos SVGs masc/fem (build ok, mas não validei visualmente o boneco gendered sem logar). Decidir: colorir o masc com o tema? lazy-load das libs (perf)? remover `react-body-highlighter` (sobrou sem uso).
- ⏳ Fase 2 (pintar cada cabeça no FEMININO também): só com SVG custom dual-gênero (pago/comissão) — vulovix é só masc. Decisão futura do Talys.

### 3. 🔄 Melhorias no "Trocar" exercício ✅
- ✅ Inclui variações de OUTRO equipamento (flexão → supino c/ halteres/barra), com as que dá pra fazer já no topo e as demais marcadas pelo equipamento (borda tracejada + tag).
- ✅ **DEMO de cada alternativa ANTES de selecionar** (botão 👁 em cada opção abre a demonstração).

### 4. 🎞️ Corrigir os GIFs/DEMO ✅
- ✅ **143 demos** (era 58): baixados do free-exercise-db (MIT). **TODO exercício tem demo** (0 sem demo).
- ✅ Catálogo expandido **+67 exercícios curados** (98→165), cada um com nome PT-BR + dica + equipamento + ênfase + demo.

### 5. 🏃 Cardio integrado em A/B/C com início/fim ✅
- ✅ Cardio agora aparece **dentro do treino** (depois dos exercícios, em A–E; não no aquecimento).
- ✅ Cronometrado registra **horário de início e fim** reais; Progresso mostra `HH:MM–HH:MM`.

### 🆕 Treino A–E configurável ✅
- ✅ Nº de treinos 3/4/5 (A–C / A–D / A–E) no Perfil › Montar treino; aquecimento opcional (toggle).

### 6. 📸 Fotos no Social + miniaturas nos grupos
- Avatares (foto do perfil) nas linhas do Social; no grupo, miniaturas de todos os membros.

### 7. 👥 Social v3 — amizade por PERFIL
- Pedir amizade pro email + escolher o perfil; cada perfil aparece individual pra msg/grupo.
- ⚠️ Conversas entre perfis **NÃO** podem vazar pra outro perfil da mesma conta.

### 8. 🔔 Push real de notificações
- Notificação de grupo/PV com app fechado (precisa push server; tabela `push_subs` já existe).
- Hoje só notifica com app aberto. O lembrete/relógio já funciona.

## 9. 🧮 Mover a Calculadora pra Perfil + sexo define a anatomia ✅
- ✅ Calculadora migrou da Dieta pro **Perfil** (componente `Calculadora.tsx`, após a identidade).
- ✅ O **sexo** define o boneco da Anatomia (masc/fem).
- ✅ Dieta mostra resumo da meta + botão "Ajustar" → Perfil.
