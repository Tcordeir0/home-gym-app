# Plano — Anatomia muscular + revamp de exercícios

> Documento de **planejamento** (não é código no app). Proposta pra revisarmos
> antes de implementar. Pedido do Talys: mapa de corpo no Progresso mostrando
> os músculos treinados por % e cor, interativo (clicar pra dar ênfase), com
> dicas semanais, variante M/F, e opção de incluir a anatomia no compartilhar —
> além de revisar/expandir as demonstrações de exercícios.

## 1. Visão
Um **mapa do corpo** (frente + costas) no Progresso que pinta cada músculo
conforme o quanto foi treinado na semana, nas **cores do tema/intensidade**.
No fim da semana mostra **o que faltou** e dá **dicas de foco**. Clicando num
músculo, dá pra pedir **ênfase nele** (hoje o gerador só aceita 1 foco) — esse é
o grande diferencial. Opcional incluir o mapa no **card de compartilhar**.

## 2. Pesquisa (GitHub) — o que já existe
A parte "desenhar o corpo com músculos clicáveis" **já está resolvida** por libs
open-source. Não precisamos desenhar o SVG do zero.

| Lib | Stack | Pontos |
|-----|-------|--------|
| **[react-body-highlighter](https://github.com/giavinh79/react-body-highlighter)** | React (web) | Recebe `data=[{name, muscles:['chest',...]}]`, pinta por **frequência/intensidade**, **frente/costas**, click handler por grupo. Mais direto pro nosso app web. |
| **[body-highlighter](https://github.com/giavinh79/react-body-highlighter)** (fork agnóstico) | Vanilla/React/Vue/Svelte | 1 SVG + utils, nomes de músculo legíveis, footprint mínimo. Ótimo se quisermos controle total. |
| **[react-muscle-highlighter](https://github.com/soroojshehryar/react-muscle-highlighter)** | React | Frente/costas, cores custom, **níveis de intensidade**, acessibilidade (ARIA/teclado). |
| **[react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter)** | React Native | Tem **variante de gênero** (M/F) — referência se formos pro Capacitor nativo. |
| **[adanzan/workout-planner](https://github.com/adanzan/workout-planner)** | — | App de exemplo: planner com **diagrama de anatomia interativo**. Boa referência de UX. |

**Recomendação:** começar com **`react-body-highlighter`** (web, React, intensidade
+ click prontos). Se faltar M/F ou controle fino, migrar pro **`body-highlighter`**
agnóstico. Os grupos das libs (chest, biceps, quadriceps, etc.) viram nosso
vocabulário de músculos.

> Sobre M/F: as libs web são corpo "neutro/masculino". Variante feminina dá pra
> (a) trocar o SVG por um set feminino, ou (b) manter 1 silhueta e só mudar o
> rótulo. Decisão do Talys (ver §6).

## 3. Pré-requisito (a base de tudo): exercício → músculos
Hoje os exercícios (`data/pool.ts`, demos) têm **grupo** (ex.: "peito"), mas não
um mapeamento fino pros músculos da lib. Precisamos de uma tabela:

```
exercício → [{ músculo, peso }]   // peso = primário 1.0, secundário 0.5
// ex.: "Supino" → [{chest:1.0},{triceps:0.5},{front-delts:0.5}]
```

Isso alimenta **tudo**: o mapa (soma os pesos por músculo na semana), as dicas,
e a ênfase no gerador. É a primeira fase e também ajuda a **revisar as demos**
(§7), porque força revisar cada exercício.

## 4. Fases (cada uma é um PR testável)
1. **Dados — exercício→músculos** (`data/muscles.ts`): vocabulário de músculos
   (alinhado à lib) + mapa de cada exercício do pool. Sem UI ainda.
2. **Widget de anatomia (Progresso)**: `react-body-highlighter` pintando o que
   foi treinado **na semana** (intensidade = soma dos pesos), cor = accent do
   tema. Frente/costas. Só leitura.
3. **Balanço semanal + dicas**: no último dia da semana (dom), card "treinou X,
   faltou Y" + dica de foco. % por músculo.
4. **Ênfase interativa**: clicar num músculo → "quero ênfase aqui". Gerador passa
   a aceitar **vários músculos de ênfase** (hoje 1 foco) e distribui melhor.
5. **M/F**: silhueta feminina (vinda da Dieta: sexo do perfil) — ver decisão §6.
6. **Compartilhar com anatomia**: toggle no card pra incluir o mapa do que foi
   treinado, junto do que já aparece.

## 5. Revamp das demonstrações de exercícios (paralelo)
Problema: muitas demos são **de academia/máquina** sem variação caseira, e
algumas estão defasadas (inferiores e superiores).
- **Auditar** o pool atual (exercício a exercício): marcar os que são "só
  máquina" e criar a **variação caseira** equivalente (peso do corpo/halteres/
  elástico) com demo fiel.
- **Expandir** a lista e **diversificar variações** por grupo (ex.: agachamento:
  livre, sumô, búlgaro, isométrico; remada: na mesa, com elástico, unilateral).
- Cada exercício ganha: grupo + **músculos (§3)** + equipamento + demo (gif/foto
  ou YouTube de execução correta) + dica.
- Fonte de demos fiéis (a confirmar): wger / Free Exercise DB (open-source) —
  pesquisar licença antes de usar assets.

## 6. Decisões pra você (Talys)
1. **Lib**: começa com `react-body-highlighter` (rápido) — ok? Ou prefere o
   `body-highlighter` agnóstico (mais controle, um pouco mais de trabalho)?
2. **M/F**: silhueta feminina separada (mais trabalho, mais fiel) ou 1 silhueta
   só mudando rótulos (rápido)?
3. **Ênfase**: quantos músculos de ênfase por treino? (sugiro até 2–3)
4. **Janela**: o mapa mostra a **semana atual** (reseta seg) — concorda? Dá pra
   ter também "últimos 30 dias".
5. **Demos**: posso usar uma base open-source (wger/Free Exercise DB) pras
   imagens, respeitando licença? Ou você manda/aprova as demos?

## 7. Esforço (estimativa)
- Fase 1 (dados): média · Fase 2 (widget): média · Fase 3 (dicas): pequena ·
  Fase 4 (ênfase+gerador): média/grande · Fase 5 (M/F): pequena/média ·
  Fase 6 (share): pequena. Revamp demos: **grande** (conteúdo).

**Total:** é um épico de vários PRs — vale fazer por fases, cada uma deployável.
