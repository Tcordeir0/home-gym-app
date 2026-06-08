# Home Gym — DESIGN.md

Visual: **dark premium, nativo iOS (HIG)**. Identidade preservada do v1 — o **verde-limão** é a marca. Evoluímos o look, não a identidade.

## Tema
Dark sempre (padrão). Cena: alguém no meio do treino em casa, luz variável, uma mão livre — precisa de contraste alto, alvos grandes, superfície calma. Os "temas" cosméticos (pixel, neon, etc.) são skins por cima desta base; o **padrão é limpo** (sem textura pesada competindo com o conteúdo).

## Cor (tokens, dark)
- `--bg` #0B0C0F (preto premium, levemente mais fundo que o v1)
- `--surface` #15181D · `--surface-2` #1C2027 · `--elevated` #232831 (elevação iOS em degraus)
- `--line` rgba(255,255,255,.08) (separador hairline, estilo iOS) · `--line-strong` #2A3039
- `--text` #F2F5F8 · `--muted` #9098A4 (≥4.5:1 no corpo) · `--faint` #6B7280
- `--accent` #C6FF3A (marca) · `--accent-press` #AEE82E · `--on-accent` #0B0C0F
- Cores de contexto preservadas: A limão, B #3AD1FF, C #A78BFA, aquec #FF8A3A
- Estados: `--good` #34D399 · `--warn` #FBBF24 · `--bad` #FF6B6B

## Tipografia
- **UI / corpo:** `-apple-system, system-ui, "SF Pro Text"` → no iPhone vira **SF Pro** = cara nativa. (Substitui Manrope no chrome.)
- **Display / marca / números grandes:** **Anton** (energia, identidade) — só em títulos curtos e métricas, nunca em corpo.
- Escala com contraste de peso (≥1.25). Large title 28–34px/800, título de seção 17px/700 SF, corpo 15–16px, legenda 13px, label 11–12px.
- Tracking: SF default no corpo; display Anton com tracking ≥ -0.02em (nunca apertado demais).

## Profundidade & forma
- Raio: cards 16px, controles 12–14px, pills 999px. Nada de 24px+ em card.
- Elevação por **degrau de superfície + sombra discreta** (≤8px blur), nunca borda 1px + sombra larga juntas.
- Separadores hairline (1px translúcido) em listas, estilo iOS.

## Componentes nativos
- **Tab bar inferior:** blur (já existe), 5 abas, ativo em accent com leve glow, safe-area, toque com mola + haptic.
- **Header contextual mínimo:** marca + perfis + badge de nível. Utilitários (sync/sino/config) migram pra dentro do Perfil.
- **List rows** (estilo iOS): ícone à esquerda, título, valor/seta à direita, separador hairline, toque com realce.
- **Sheets** sobem de baixo (já há overlay .sheet) — evoluir pra grabber + cantos 20px.
- **Botões:** primário accent (texto on-accent), secundário superfície com borda hairline; toque escala 0.96.
- **Segmented control:** as abas de treino A/B/C/aquec viram um segmented control estilo iOS.

## Movimento
Mola ease-out (sem bounce). Troca de página (View Transitions, já existe) + micro-interações (press, count-up em números, confete em conquista). Sempre com `prefers-reduced-motion`.

## Bans (anti-slop)
Sem: textura pesada no padrão, side-stripe em card, gradient-text, glassmorphism decorativo, card-dentro-de-card, eyebrow uppercase em toda seção, borda 1px + sombra larga juntas.
