# Changelog

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
