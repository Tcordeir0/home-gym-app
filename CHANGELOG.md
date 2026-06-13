# Changelog

## [0.8.0](https://github.com/Tcordeir0/home-gym-app/compare/v0.7.0...v0.8.0) (2026-06-13)


### Features

* **app:** 'Backup & dados' (registro retroativo + export/import) movido de Progresso→Perfil como seção expansível + 'Limpar dados do perfil' na Zona de perigo + linha 'Sobre' (versão) ([e3d2bb6](https://github.com/Tcordeir0/home-gym-app/commit/e3d2bb6df012766a4abcfd6fd70020820f86c626))
* **app:** 'Montar treino por equipamento' (gerador) movido pro Perfil › Montar treino (é configuração) + seção consolidada com subtítulos limpos; Treino mostra atalho ([20b839c](https://github.com/Tcordeir0/home-gym-app/commit/20b839ca3b971ebae3a3117a7e0497eb0757909d))
* **app:** +7 conquistas novas + hidratação no gráfico de dieta + tab bar Liquid Glass flutuante (iOS 26: cápsula + blur 22px/saturate 180% + highlight + pill no ativo) em TODOS os temas incl. Preto/Branco ([4ad88fb](https://github.com/Tcordeir0/home-gym-app/commit/4ad88fb21ac00753f4e06f65fe200375769f93e1))
* **app:** aba Carga ganha toggle '1RM estimado' — curva de progressão real por exercício (Epley), com 'Carga máx' como alternativa ([5b6f027](https://github.com/Tcordeir0/home-gym-app/commit/5b6f027fe03bb1af41c04f10270248f5ab5d0719))
* **app:** Anatomia mostra volume da SEMANA por músculo + alvo (10–20 séries/sem) com status abaixo/no alvo/acima ([d178973](https://github.com/Tcordeir0/home-gym-app/commit/d17897341f840d697623326582ed8225ca268acd))
* **app:** badge + notificação de convites/cutucadas no botão Social ([a3de794](https://github.com/Tcordeir0/home-gym-app/commit/a3de79452926301a649e1f5d0fcbbc50afb60a4a))
* **app:** botão Salvar flutuante no Perfil — aparece ao mudar algo e força gravação na nuvem/conta (não fica só no localStorage) com confirmação ([1405b84](https://github.com/Tcordeir0/home-gym-app/commit/1405b84694df421e419b65fe36b8113ecd2b6b72))
* **app:** card congela a animação do tema (mãos da Satella, corações, neve, runas, raios...) e layout mais equilibrado ([7b32756](https://github.com/Tcordeir0/home-gym-app/commit/7b3275629dee0eb13c0019fe8a8595b4d3ecafd1))
* **app:** card de compartilhar repaginado — formato story 9:16, sem frase motivacional, rodapé só com a versão, quadros de stats com bem mais contraste (legíveis no tema claro) e nome afastado do aro ([9512920](https://github.com/Tcordeir0/home-gym-app/commit/95129209821a21291ef2524b5dca3780866013e8))
* **app:** cardio cronometrado salva a DURAÇÃO (início→fim) e mostra os minutos nas sessões e no detalhe do dia ([f2b38ca](https://github.com/Tcordeir0/home-gym-app/commit/f2b38ca732bc9b0f11f3ed6b6c385abbf1e1077c))
* **app:** chat mostra preview da última mensagem (recebida/enviada) na lista de conversas, estilo WhatsApp ([919c9a3](https://github.com/Tcordeir0/home-gym-app/commit/919c9a3e1ffcb3d91c9c70d259d0809a456e978e))
* **app:** Cutucar com frases prontas de zoação por categoria (pontuação, treino, peso, dieta, hidratação, tema) ([04752ae](https://github.com/Tcordeir0/home-gym-app/commit/04752ae3ade6b858f6f2efab96aaaf4cda169102))
* **app:** evento de LEVEL-UP no feed do Social + 'Em breve' movido pro header do Perfil (ao lado do changelog), saiu de Prêmios ([bc37590](https://github.com/Tcordeir0/home-gym-app/commit/bc37590cfe9d0117ab7774eb9fb9b0ef0ea73ac0))
* **app:** fundação do Social — schema Supabase (amizades/cutucadas/chat + RLS + realtime), cliente lib/social.ts e publicação dos perfis no login ([d7bfc23](https://github.com/Tcordeir0/home-gym-app/commit/d7bfc2308255746bd1c95c6c9c10540c0d5b7549))
* **app:** glass sutil nos cards Preto/Branco + 'anterior' pré-preenchido (campos kg×reps mostram a última série como placeholder editável) ([a927ff4](https://github.com/Tcordeir0/home-gym-app/commit/a927ff4f8c7d9d45964781f8116e14cfbaf21d42))
* **app:** glass visível no Preto/Branco (brilho de fundo sutil dá o que o vidro desfocar) + Liquid Glass nos modais e linhas do Social ([8de8883](https://github.com/Tcordeir0/home-gym-app/commit/8de88837837aceb9f1c20759e18bd6b6abb9a1f2))
* **app:** lembrete diário de treino (horário configurável) ([bd4adfb](https://github.com/Tcordeir0/home-gym-app/commit/bd4adfba27bd5840e8bf347dc835b6ced4439adc))
* **app:** mover alimento entre dias — corrige registros que foram pro dia errado ([04ccba9](https://github.com/Tcordeir0/home-gym-app/commit/04ccba999eadacb769d35b1b9dd00f611dc0da8e))
* **app:** Perfil em seções EXPANSÍVEIS — 'Montar treino' (Local+Equipamento juntos), 'Tipos de cardio' e 'Agenda' viram colapsáveis (menos espaço à toa) ([d9a6482](https://github.com/Tcordeir0/home-gym-app/commit/d9a6482da93a207b749eb39bf05af79eced69f02))
* **app:** prévia da última mensagem na lista de grupos + não-lidos + notificação de mensagem nova de grupo ([a570ffc](https://github.com/Tcordeir0/home-gym-app/commit/a570ffc57f503be955f676f2be6192f365781acb))
* **app:** Progresso — calendário INTERATIVO (toca o dia → vê treino/cardio/dieta/água) + Conquistas e Sessões viram expansíveis + foto de progresso movida pra baixo do nível/stats ([96d0cab](https://github.com/Tcordeir0/home-gym-app/commit/96d0cabc2fcd14943dbe987f67e57557c61de29d))
* **app:** séries pré-preenchidas com a última vez + recorde pessoal e 1RM estimado por exercício ([6ac9ea0](https://github.com/Tcordeir0/home-gym-app/commit/6ac9ea00e5d84a564628c063ad14088cb3cfcd56))
* **app:** Sessões separadas em Treinos/Cardios/Alimentação (cada uma colapsável, fechadas) + Perfil consolida Tipos de cardio dentro de 'Montar treino' ([e5da38b](https://github.com/Tcordeir0/home-gym-app/commit/e5da38b77fa971882254cb44eeaf74c5e0df48b5))
* **app:** share card mostra infos da semana — séries feitas, média de hidratação (L/dia) e músculo mais treinado ([17a0b21](https://github.com/Tcordeir0/home-gym-app/commit/17a0b21de361847ac295f1810c64fbea36b0127e))
* **app:** Social — chat com a EQUIPE (perfis da conta) além de amigos + feed de novidades (desbloqueios) + nome de perfil único com sugestões ([6cc4d17](https://github.com/Tcordeir0/home-gym-app/commit/6cc4d17419f27f057974c43e7e0fb5ca23cc8430))
* **app:** Social com Liquid Glass próprio refletindo o tema do perfil + correção de contraste no tema Branco ([4305419](https://github.com/Tcordeir0/home-gym-app/commit/430541934c455c5a4b8127fc549b6323cd1de954))
* **app:** Social v2 — sugestões de contas + Grupos estilo WhatsApp + cor do tema de cada um no chat ([7b75dc2](https://github.com/Tcordeir0/home-gym-app/commit/7b75dc217ca6a987bacf3af5de01d7dd6fadbc4d))
* **app:** tela de membros do grupo + adicionar/remover membros ([8a81037](https://github.com/Tcordeir0/home-gym-app/commit/8a810373b78a0ccf0a4a290e32b50142a0fc1bc2))
* **app:** toasts (notificações) com Liquid Glass + cor do tema (blur/saturate + borda accent + bg translúcido do tema), adaptando ao tema ativo ([b786e79](https://github.com/Tcordeir0/home-gym-app/commit/b786e79285643d27e60f6f25691c25e665a2e5e2))
* **app:** transições suaves com AutoAnimate na lista de exercícios (troca de treino A/B/C) e na lista de alimentos (add/remove) ([85ae0bb](https://github.com/Tcordeir0/home-gym-app/commit/85ae0bb6688c67038b7aaa050ec30c8cc321c944))
* **app:** UI do Social — Amigos (convite por email, aceitar/recusar), Cutucar (equipe + amigos, recebidas), Chat realtime. Plugado no backend Supabase ([8c15b48](https://github.com/Tcordeir0/home-gym-app/commit/8c15b480f29ae32b8abf581d43f25d42598d8358))


### Bug Fixes

* **app:** botão Salvar agora FIXO de verdade (portal pro body) — dentro do ion-content o fixed ancorava num container transformado e flutuava no meio ([16d17fc](https://github.com/Tcordeir0/home-gym-app/commit/16d17fc5e3bd8b3440c1c53f36cb4fbb81e08ac5))
* **app:** botão Salvar só aparece na aba Perfil (estava vazando por cima de Prêmios/Treino) + nome das abas não vaza mais da cápsula ([abfc8f1](https://github.com/Tcordeir0/home-gym-app/commit/abfc8f1d6e0646f3bdf5c849abd1baa3923351cc))
* **app:** chat do Social — canal realtime com nome ÚNICO (conflito impedia mensagens ao vivo) + envio otimista (aparece na hora) + horário em cada mensagem ([85932c1](https://github.com/Tcordeir0/home-gym-app/commit/85932c1b282d9b685801a714dcdc247de35f9245))
* **app:** comida adicionada em dia retroativo agora salva no dia certo ([4fed4cf](https://github.com/Tcordeir0/home-gym-app/commit/4fed4cfb7f448add3fd6a3319561f7efd3c62afe))
* **app:** corrige crash removeChild do botão Salvar (sempre no DOM + animação CSS) + Zona de perigo (sair da conta e excluir perfil com confirmação obrigatória) ([da09038](https://github.com/Tcordeir0/home-gym-app/commit/da09038a2d3e8ab00d2f0a9fa59c2aebf6fd71c2))
* **app:** corrige loop infinito que travava o Social (seletor zustand) + Creator liberado p/ perfil TALYS + roleta dá 70% itens/30% pontos + volume de som por perfil (slider) ([1f7ea2f](https://github.com/Tcordeir0/home-gym-app/commit/1f7ea2ff20b2ebf2df99cc6882e2f3ba5221632e))
* **app:** Error Boundary auto-recuperável p/ crash 'removeChild' (extensões como KeePassXC mexendo no DOM) + autocomplete off no nome do perfil ([cce3ede](https://github.com/Tcordeir0/home-gym-app/commit/cce3ede1297f7490101905b8327122af5f7cd702))
* **app:** gramas do alimento vêm vazias e apagáveis (era 100 travado) + foto de progresso/prato permitem GALERIA (não só câmera) + hidratação retroativa (seletor de data) ([fa26b86](https://github.com/Tcordeir0/home-gym-app/commit/fa26b86c613e393a1ed5d56539445363786ed6cb))
* **app:** perfil ativo respeita o aparelho (não herda o de outro perfil) + anatomia conta treinos padrão (musculo) + 27 exercícios de casa (core/trapézio/halter) + sons mais altos e ricos + changelog cabe no mobile ([b17b963](https://github.com/Tcordeir0/home-gym-app/commit/b17b963ab908ee24166ceb39e393d5ed0fff0f19))

## [0.7.0](https://github.com/Tcordeir0/home-gym-app/compare/v0.6.0...v0.7.0) (2026-06-12)


### Features

* **app:** cor personalizada (RGB) + preview com foto nos temas de wallpaper ([#74](https://github.com/Tcordeir0/home-gym-app/issues/74)) ([7756277](https://github.com/Tcordeir0/home-gym-app/commit/775627782322e22cb49ed2a50c74e2a06c942028))
* **app:** Dieta — retroativo, gráfico/histórico, calendário e conquistas ([#72](https://github.com/Tcordeir0/home-gym-app/issues/72)) ([1dcb757](https://github.com/Tcordeir0/home-gym-app/commit/1dcb757d1704a8cecd6497b2f21581a94628d84f))
* **app:** escolha de perfil por dispositivo (claim) — base anti-trapaça ([#69](https://github.com/Tcordeir0/home-gym-app/issues/69)) ([e97835a](https://github.com/Tcordeir0/home-gym-app/commit/e97835ab0ff7ce6d13a70b1b645318497ab54f12))
* **app:** modo leitura — só edita o SEU perfil, vê os outros sem editar (anti-trapaça) ([#71](https://github.com/Tcordeir0/home-gym-app/issues/71)) ([b58f408](https://github.com/Tcordeir0/home-gym-app/commit/b58f408b3741c4397da3702ffb142b58970b2f60))
* **app:** PWA completo — service worker offline + instalável ([#73](https://github.com/Tcordeir0/home-gym-app/issues/73)) ([b6a75c8](https://github.com/Tcordeir0/home-gym-app/commit/b6a75c8a214120a51bdfce02ff0c3bd8679f9e5b))
* **app:** v0.7.0 — Chá/Creator/Return, anatomia, conquistas-recompensa, permissões, aros+fx no perfil, changelog ([#76](https://github.com/Tcordeir0/home-gym-app/issues/76)) ([5c01070](https://github.com/Tcordeir0/home-gym-app/commit/5c010708f2e475aa45691989fa53a19cdff5bae9))


### Bug Fixes

* **app:** card 'Em breve' só lista o que falta e some quando tudo entrar ([#70](https://github.com/Tcordeir0/home-gym-app/issues/70)) ([b15fb00](https://github.com/Tcordeir0/home-gym-app/commit/b15fb00e3b0f12a0a093e25b38e24120fd9697cb))

## [0.5.0](https://github.com/Tcordeir0/home-gym-tracker/compare/v0.4.0...v0.5.0) (2026-06-08)


### Features

* aba Dieta — calculadora de calorias (Mifflin-St Jeor) + IMC + % gordura ([#10](https://github.com/Tcordeir0/home-gym-tracker/issues/10)) ([dd3cb99](https://github.com/Tcordeir0/home-gym-tracker/commit/dd3cb999d85f9cd128056d6235a6c8dd8d295283))
* barra de navegação inferior estilo iOS + transições de página ([#9](https://github.com/Tcordeir0/home-gym-tracker/issues/9)) ([fe04198](https://github.com/Tcordeir0/home-gym-tracker/commit/fe041986a9ae27bd48030a8d4bf31de8b946d31c))
* Dieta — balança (peso + gráfico), hidratação e conquistas ([#11](https://github.com/Tcordeir0/home-gym-tracker/issues/11)) ([259c949](https://github.com/Tcordeir0/home-gym-tracker/commit/259c94932f92632e23f9b8576c710cae66500ff5))
* Dieta — busca online (Open Food Facts) + código de barras ([#13](https://github.com/Tcordeir0/home-gym-tracker/issues/13)) ([38737a8](https://github.com/Tcordeir0/home-gym-tracker/commit/38737a801191343930ee5b290609b4f5118a0fc3))
* Dieta — diário de alimentos com base curada BR+Portugal (offline) ([#12](https://github.com/Tcordeir0/home-gym-tracker/issues/12)) ([25d898a](https://github.com/Tcordeir0/home-gym-tracker/commit/25d898a54ea82808ee46460344a0980cbac0e991))
* Dieta — foto do prato com validação manual ("O prato contém…?") ([#14](https://github.com/Tcordeir0/home-gym-tracker/issues/14)) ([0a1862d](https://github.com/Tcordeir0/home-gym-tracker/commit/0a1862d66e57e8083485c3e87a9efe0350f00973))
* Dieta — reconhecimento da foto por IA no navegador (sem conta) ([#16](https://github.com/Tcordeir0/home-gym-tracker/issues/16)) ([602c506](https://github.com/Tcordeir0/home-gym-tracker/commit/602c5061068a79fd7845ca1f5a755f2d97deb81b))
* **push:** notificações Web Push reais via Supabase (Edge Function + pg_cron + VAPID) ([d3d93f4](https://github.com/Tcordeir0/home-gym-tracker/commit/d3d93f4d4a5f8aee51e18e6c7a0ad4a4eb2b881d))
* **temas:** tema Matrix (chuva de código em canvas) + temas existentes animados ([#8](https://github.com/Tcordeir0/home-gym-tracker/issues/8)) ([777aa33](https://github.com/Tcordeir0/home-gym-tracker/commit/777aa33796652d7d832b3bd086ebf9a270fd33b6))


### Bug Fixes

* **boot:** corrige TDZ (TESTER_NAME) que impedia o app de carregar ([b1ad16a](https://github.com/Tcordeir0/home-gym-tracker/commit/b1ad16ab34ddd735517805121dd1bdc4dd75b6b1))
* conquistas novas de dieta disparam em perfis existentes + erro HTTP do OFF ([#15](https://github.com/Tcordeir0/home-gym-tracker/issues/15)) ([096bd85](https://github.com/Tcordeir0/home-gym-tracker/commit/096bd856fd3c8172332ccad021d9b3cebaa1152e))
* **mobile:** histórico não corta mais + scroll não vaza atrás dos overlays + CI de runtime ([#6](https://github.com/Tcordeir0/home-gym-tracker/issues/6)) ([6887d87](https://github.com/Tcordeir0/home-gym-tracker/commit/6887d87c7dc9edc280c1ea572c33614501ca7887))
* **perfil:** perfil ativo é escolha local de cada aparelho (não sincroniza) + háptico iOS ([#7](https://github.com/Tcordeir0/home-gym-tracker/issues/7)) ([659d4be](https://github.com/Tcordeir0/home-gym-tracker/commit/659d4bec4af84ef5061b787c68b8dd9892e95444))
* **temas:** tema Noir jogava overlays pra fora da tela (filter no body quebrava position:fixed) ([9eb69ee](https://github.com/Tcordeir0/home-gym-tracker/commit/9eb69eebb592faad53cfa2a1f993f34c2c22e349))
* **ui:** overlay de level-up preso visível bloqueava toda a tela ([f9a8322](https://github.com/Tcordeir0/home-gym-tracker/commit/f9a8322ca7889288ae0f768615c854171e44f162))

## [0.4.0](https://github.com/Tcordeir0/home-gym-tracker/compare/v0.3.1...v0.4.0) (2026-06-07)


### Features

* **agenda:** agenda de treino + lembretes (banner + Notification + NTFY) [PR6 v0.4.0] ([54b7e92](https://github.com/Tcordeir0/home-gym-tracker/commit/54b7e922d539ab31aa513859342229ebae6b5de7))
* **game:** níveis/XP com level-up, quests semanais e streak freeze [PR4 v0.4.0] ([1c6b870](https://github.com/Tcordeir0/home-gym-tracker/commit/1c6b87084c03001eb831b40621623c46aca24921))
* **graficos:** evolução animada de carga e medidas [PR3 v0.4.0] ([099ae52](https://github.com/Tcordeir0/home-gym-tracker/commit/099ae526bf533ba3719e800600387ff02b047cfe))
* **medidas:** registro de medidas corporais + foto de progresso [PR2 v0.4.0] ([14e3d46](https://github.com/Tcordeir0/home-gym-tracker/commit/14e3d4640f265de5cefdf5455ad7a4570375a805))
* **temas:** 5 temas com arte distinta + animações fluidas globais [PR5 v0.4.0] ([88cdabe](https://github.com/Tcordeir0/home-gym-tracker/commit/88cdabebeef37a99634edc35eb79efd800232b6c))
* **temas:** textura pixel art em todos os 8 temas, em todas as telas ([8eb833c](https://github.com/Tcordeir0/home-gym-tracker/commit/8eb833c6e54b417004a8fce948b792a4e3a4c9bc))
* **tema:** textura de bloco de grama (Minecraft) no tema Mundo de Blocos ([7adae35](https://github.com/Tcordeir0/home-gym-tracker/commit/7adae35d326180ea078fc5d834f8220ae89cace0))
* **treino:** carga (kg) + reps por série, histórico de carga e sugestão de progressão [PR1 v0.4.0] ([b61b604](https://github.com/Tcordeir0/home-gym-tracker/commit/b61b604884e01987fb0e6ce9b08f388605d13eb0))


### Bug Fixes

* **registro:** impede treino duplicado no dia, registro retroativo (treino/cardio) + perfil tester TCORDEIRO ([eb0ecd4](https://github.com/Tcordeir0/home-gym-tracker/commit/eb0ecd40de6a2da35f712c124c18c164b47b328d))

## [0.3.1](https://github.com/Tcordeir0/home-gym-tracker/compare/v0.3.0...v0.3.1) (2026-06-06)


### Bug Fixes

* corrige overflow horizontal no mobile (página não arrasta mais pro lado) ([64c01a6](https://github.com/Tcordeir0/home-gym-tracker/commit/64c01a6d9b4d95a0852533b35564c752466c309b))
* **mobile:** respeitar safe-area do topo (notch) + blindar overlays contra overflow ([3cfcd24](https://github.com/Tcordeir0/home-gym-tracker/commit/3cfcd2412fefdad9098ad14d2b15c6b2fe6fde7d))

## [0.3.0](https://github.com/Tcordeir0/home-gym-tracker/compare/v0.2.0...v0.3.0) (2026-06-06)


### Features

* animações e som de conquista (loading no login, chama da sequência, conquista desbloqueada) ([a0ff9b4](https://github.com/Tcordeir0/home-gym-tracker/commit/a0ff9b41e64432514a5a5e944348adf7ea68dc7e))
* botão para zerar pontos do perfil (limpeza de testes) ([8d9fed6](https://github.com/Tcordeir0/home-gym-tracker/commit/8d9fed606fd3e4aaee529bd49e95ba4ca3f3029b))
* card de compartilhar estilo Wrapped (PR7) ([aaa79b2](https://github.com/Tcordeir0/home-gym-tracker/commit/aaa79b2c13d17d17d3c33fc3f8e2d3707caa5421))
* cronometragem de treino e cardio (PR6) ([68a0618](https://github.com/Tcordeir0/home-gym-tracker/commit/68a0618d3c4d044c72ac015b90dbd480493f91b3))
* decorações de avatar estilo Discord (molduras que abraçam a foto) ([0cc0a47](https://github.com/Tcordeir0/home-gym-tracker/commit/0cc0a47ef8807ff551828f1807657e75d800f997))
* demonstração offline para TODOS os exercícios (81/81) ([d02ca17](https://github.com/Tcordeir0/home-gym-tracker/commit/d02ca17ff11ffa7742ee82e7dabe6baa866a372a))
* feed de notificações (sino) — cutucadas, conquistas e recompensas ([d5d0d52](https://github.com/Tcordeir0/home-gym-tracker/commit/d5d0d52f03dc28163816efd60fb72f807e2bdb86))
* horário no cardio 'já fiz' e som no fim do descanso ([4c88603](https://github.com/Tcordeir0/home-gym-tracker/commit/4c88603df903ad42a045134ee252e0bd0a3764a2))
* marca-d'água ilustrada por tema (cara de jogo de verdade) ([d589f0f](https://github.com/Tcordeir0/home-gym-tracker/commit/d589f0f3f11596a2befbe324238d7f3aa3f049b2))
* ranking, foto de perfil e cutucar (PR5) ([8b8a953](https://github.com/Tcordeir0/home-gym-tracker/commit/8b8a95315878e48950ecf738a9d5369f8662ab4c))
* sistema de ícones SVG (Lucide) substituindo emojis na UI ([5e8f0de](https://github.com/Tcordeir0/home-gym-tracker/commit/5e8f0de27a28ce1154ce4067515a837048667cb7))
* sistema de recompensas com 2 roletas (cosméticos + vida), temas e chapéus ([334d5e4](https://github.com/Tcordeir0/home-gym-tracker/commit/334d5e447acb35588a6a069682b60ad9718594a2))
* tela de Configurações com feedback (som/vibração) e modo claro/escuro ([7bd1011](https://github.com/Tcordeir0/home-gym-tracker/commit/7bd101116e84e2c033ca7210d58e2889bb14f59f))
* texturas/padrões por tema (relevo que lembra cada jogo) ([31fdf29](https://github.com/Tcordeir0/home-gym-tracker/commit/31fdf29d3272214eaee4cfbc760d468f56d7bbb1))


### Bug Fixes

* descontar pontos ao apagar sessão e perguntar antes de cronometrar cardio ([6094218](https://github.com/Tcordeir0/home-gym-tracker/commit/6094218992722b3c6c581a2b35a2a857f1b0c087))

## [0.2.0](https://github.com/Tcordeir0/home-gym-tracker/compare/v0.1.0...v0.2.0) (2026-06-05)


### Features

* backup exportar/importar dados em JSON ([84c8df7](https://github.com/Tcordeir0/home-gym-tracker/commit/84c8df7cab5a0bd70c13718a272a8f0278ed09a1))
* **demos:** demonstração offline dos exercícios (PR3) ([1819ebc](https://github.com/Tcordeir0/home-gym-tracker/commit/1819ebc29d0c93e24d988bdf53e41b565cfbd027))
* Ficha C (3º treino) por perfil ([1ea3f5d](https://github.com/Tcordeir0/home-gym-tracker/commit/1ea3f5de2e22194e7bf43cacc5f20eb26a9156a9))
* **gerador:** montar treino A/B/C por equipamento e foco (PR2) ([fe4e73f](https://github.com/Tcordeir0/home-gym-tracker/commit/fe4e73f482019123743364e28dc84866e200c2a7))
* integração de sincronização na nuvem via Supabase (dormente até configurar) ([de9ea32](https://github.com/Tcordeir0/home-gym-tracker/commit/de9ea329945c832eb161a284041eaf58798631f3))
* interactive home gym workout tracker ([8b07c22](https://github.com/Tcordeir0/home-gym-tracker/commit/8b07c225dfe3dddcd6b4debeaa6fc8ff3a29260b))
* liga sincronização Supabase (URL + anon key do projeto) ([5a3fc89](https://github.com/Tcordeir0/home-gym-tracker/commit/5a3fc8995c6b6f73559200b6bc6d563be8c14b51))
* perfis com fichas focadas, persistência e histórico de treinos ([a26ca04](https://github.com/Tcordeir0/home-gym-tracker/commit/a26ca04e8a59de5b3469cafea6cfe8e1f7a893c5))
* **perfis:** perfis dinâmicos com cor, equipamento e cardio configuráveis (PR1) ([637eb30](https://github.com/Tcordeir0/home-gym-tracker/commit/637eb3008973ee6652f1f5dfc2f9257d0c4f2874))
* porta de login obrigatória, diálogos estilizados e versionamento (release-please) ([9f33c54](https://github.com/Tcordeir0/home-gym-tracker/commit/9f33c5493a5ffd777661cce3bb8b35bb5a59c913))
* PWA instalável com ícone de halter, manifest e service worker offline ([4f8f212](https://github.com/Tcordeir0/home-gym-tracker/commit/4f8f212bb401063d146a5e292839744fdc62198f))
* registro de cardio (corrida/natação) e tema por perfil ([5320985](https://github.com/Tcordeir0/home-gym-tracker/commit/5320985b8bba3c46b62739e26bd129e4bbf252e8))
* sistema de pontos, conquistas e som (PR4) ([ba26c60](https://github.com/Tcordeir0/home-gym-tracker/commit/ba26c606e6ccf8eb9b6372d61e9d93e143b3dc18))
