# Home Gym — PRODUCT.md

## Register
**Product** (app UI). O design serve o produto: um app mobile de treino e dieta. Não é landing/marketing.

## Produto & Propósito
App de **treino em casa + dieta que vira um jogo de saúde diário**, usado pela família: **Talys** (atleta retornando, recompondo), **Andressa** (treino feminino sincronizado ao ciclo) e **Victor**. Mobile-first (iPhone/Android), instalável (PWA), com sync entre aparelhos. Cada perfil tem ficha, dieta, medidas, gamificação próprios; o perfil ativo é por aparelho (privacidade).

O trabalho a fazer pelo usuário: abrir, ver o que fazer hoje (treino, comida, água), registrar rápido, sentir progresso (pontos, nível, conquistas, gráficos) e voltar amanhã.

## Usuários & Contexto
- Em casa ou na praia, no celular, muitas vezes no meio do treino (mão suada, uma mão livre). Toque grande, leitura instantânea, zero fricção.
- Casal/família que compete de leve entre si (motor de engajamento).

## Personalidade da marca (3 palavras)
**Premium, energética, nativa.** Parece um app iOS de primeira (HIG), não uma página web. Game-like sem ser infantil; foco e clareza acima de decoração.

## Anti-referências (o que evitar)
- Cara de **site/web** em mobile (inputs chapados, modais por tudo, header poluído).
- **AI-slop**: cards iguais empilhados, eyebrow uppercase em toda seção, gradient-text, glassmorphism decorativo, side-stripe nos cards, bordas+sombra "ghost".
- O visual atual sobrecarregado (textura forte, header com ficha+banner+cardio+ícones competindo). Menos é mais.

## Princípios de design (estratégicos)
1. **Nativo antes de bonito-web.** Padrões iOS: large titles, tab bar inferior, list rows, sheets que sobem, safe-areas, toque com mola/haptic.
2. **Uma tarefa por tela.** Cada aba é uma página de verdade (sem modal "fora da página"); o header é mínimo e contextual.
3. **Hierarquia por escala/peso e espaço**, não por moldura. Cartão só quando é o melhor affordance; nada de card-dentro-de-card.
4. **Movimento intencional** (mola ease-out, sem bounce), respeitando `prefers-reduced-motion`.
5. **Evoluir o v1 que funciona** — nunca reescrever do zero. Cada mudança mantém tudo funcional.

## Acessibilidade
Contraste ≥4.5:1 no texto; alvos de toque ≥44px; respeitar redução de movimento; legível em 320–430px.
