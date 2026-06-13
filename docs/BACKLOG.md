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

### 2. 🦾 Anatomia granular + mais exercícios
- Separar músculos: **bíceps, tríceps, antebraço, abdominal, trapézio, panturrilha** (só esq/dir do MESMO músculo se junta).
- **Faltam exercícios**: antebraço (0 hoje), panturrilha (1), e mais variação geral.
- Anatomia mostrar os músculos de verdade (remapear o boneco).

### 3. 🔄 Melhorias no "Trocar" exercício
- Mais variedade: flexão deveria poder virar **supino com halteres/barra** (variações de OUTRO equipamento do mesmo grupo) — hoje filtra só pelo equipamento do perfil; revisar.
- **DEMO de cada alternativa ANTES de selecionar** (ver o gif pra ter certeza).

### 4. 🎞️ Corrigir os GIFs/DEMO
- Tem exercício usando **gif repetido/errado** — a posição muda conforme o nome mesmo sendo variação. Cada exercício (ou variação) precisa do gif certo.

### 5. 🏃 Cardio integrado em A/B/C com início/fim
- Cardio sempre aparece em A/B/C; registrar por **horário de início e fim** (em vez de botão único).

### 6. 📸 Fotos no Social + miniaturas nos grupos
- Avatares (foto do perfil) nas linhas do Social; no grupo, miniaturas de todos os membros.

### 7. 👥 Social v3 — amizade por PERFIL
- Pedir amizade pro email + escolher o perfil; cada perfil aparece individual pra msg/grupo.
- ⚠️ Conversas entre perfis **NÃO** podem vazar pra outro perfil da mesma conta.

### 8. 🔔 Push real de notificações
- Notificação de grupo/PV com app fechado (precisa push server; tabela `push_subs` já existe).
- Hoje só notifica com app aberto. O lembrete/relógio já funciona.
