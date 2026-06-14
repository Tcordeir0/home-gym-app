# Spec — Sub-foco + Meta de Shape (treino direcionado ao objetivo)

Feature grande, em construção na branch `feat/peito-inferior-exercicios` (**sem merge** até o Talys fechar).

## Decisões travadas (com o Talys)
1. **Sub-foco** no Montar treino: **sugestão + escolha** (o app sugere onde você está fraco/longe da meta E você escolhe na mão).
2. **Meta de shape**: **presets + ajuste fino** (parte de um preset e mexe nas prioridades).
3. Varia por **GÊNERO** e **BIOTIPO** → vários tipos. (sexo já existe na Calculadora; biotipo a adicionar.)
4. Respeita o **nº de treinos A–E** (configurável no Perfil › Montar treino) — não assume A/B/C.

## Peças
### a) Dados — `data/shapeGoals.ts` ✅ feito
- Metas por gênero: masc (Estético/praia, Costas em V, Braços & peito, Força) · fem (Glúteo & pernas, Definição/verão, Cintura & postura, Atlético) · Equilíbrio (ambos).
- Cada meta = **pesos por sub-região** (base vulovix: `chest-lower`, `obliques`, `shoulder-side`...). 0–3.
- **Biotipo** (ecto/meso/endo) dá um *nudge* leve (endo→abdômen/oblíquos/panturrilha; ecto→compostos).
- `weightFor(base, preset, overrides, biotype)` = peso final.

### b) Perfil / Calculadora
- Capturar **biotipo** (`body.biotype`) junto do sexo.
- **Escolher a Meta de shape** (preset filtrado pelo gênero) + **ajuste fino** (chips/sliders de prioridade por sub-região).
- Guardar em `profile.shapeGoal = { preset, overrides? }`.

### c) Anatomia — gap vs meta
- Já mede volume por sub-região (`baseCounts`, 30 dias). Comparar com os pesos da meta → mostrar **o que mais te afasta do shape** ("ombro posterior e peito inferior estão atrás da meta").
- Destacar no painel/legenda.

### d) Montar treino — sub-foco
- Nº de treinos A–E (já existe).
- Ao escolher o Foco (ex.: Peito), aparece **sub-foco**: Equilibrado · Superior · Médio · Inferior (sub-regiões do músculo).
- 💡 **Sugestão** = a sub-região do foco com maior gap vs meta.
- O gerador enche os slots daquele músculo com exercícios cuja **ênfase** bate o sub-foco, distribuído nos A–E.

### e) Atalho Anatomia → A/B…E
- Clicar num exercício listado na parte do músculo → escolher em qual treino (A–E) entra (troca/adiciona).

## Ordem de build sugerida
1. ✅ shapeGoals.ts
2. body.biotype + store.shapeGoal + Calculadora (sexo+biotipo+meta) — base de tudo
3. Anatomia: gap vs meta (usa baseCounts que já existe)
4. Montar treino: sub-foco + sugestão + gerador por ênfase × A–E
5. Ajuste fino (prioridades) + atalho Anatomia→treino

## Já entregue nesta branch (local, sem merge)
- +6 exercícios de peito (foco **inferior**: declinado barra/halteres, pegada aberta, crucifixo declinado, supino reto halteres, pullover barra).
- Ênfase do "mergulho nas paralelas (peito)" corrigida → peito inferior.
