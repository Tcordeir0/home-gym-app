/// <reference types="cypress" />

// E2E clique-completo na conta real, MAS com TODA escrita na nuvem bloqueada
// (intercepta o upsert em app_state_v2). A leitura passa real; nada é gravado.
// Cria um perfil novo "CypressTest" na seleção pra não tocar perfis existentes.

// Credenciais NUNCA ficam no código — passe em runtime:
//   npx cypress run --env email=...,password=...   (ou via cypress.env.json, gitignored)
const EMAIL = Cypress.env('email') as string;
const PASS = Cypress.env('password') as string;

describe('Home Gym — clique-completo (escrita na nuvem bloqueada)', () => {
  let writes = 0;

  before(function () {
    // sem credenciais (CI/local sem env) → pula o teste em vez de falhar
    if (!EMAIL || !PASS) this.skip();
  });

  beforeEach(() => {
    writes = 0;
    // BLOQUEIA qualquer escrita do estado (upsert = POST). Leitura (GET) passa real.
    cy.intercept('POST', '**/rest/v1/app_state_v2*', (req) => {
      writes++;
      req.reply({ statusCode: 201, body: [] });
    }).as('blockedWrite');
    // social/outras escritas também stubadas por garantia
    cy.intercept('POST', '**/rest/v1/social_*', { statusCode: 201, body: [] });
  });

  it('login → cria perfil → gera treino foco Peito 5 dias → A–E + peso do corpo → Dieta IMC', () => {
    // pré-marca o changelog "Novidades" como visto → o modal WhatsNew não abre e não bloqueia
    cy.visit('/', { onBeforeLoad(win) { win.localStorage.setItem('hgt_seen_changelog', '99.99.99'); } });

    // ---- login ----
    cy.contains('.auth-card', 'HOME', { timeout: 20000 }).should('be.visible');
    cy.get('.auth-card input[type="email"]', { timeout: 10000 }).type(EMAIL, { force: true });
    cy.get('.auth-card input[type="password"]').type(PASS, { force: true });
    cy.get('.auth-go').click();
    cy.screenshot('01-login-enviado');

    // ---- seleção de perfil: cria um NOVO (não toca os existentes) ----
    cy.contains('Quem é você?', { timeout: 30000 }).should('be.visible');
    cy.screenshot('02-profile-select');
    cy.contains('.psel-item', 'Criar novo perfil').click();
    cy.get('ion-alert input', { timeout: 8000 }).type('CypressTest');
    cy.contains('ion-alert button', 'Criar').click();

    // ---- app carregado ----
    cy.get('ion-tab-bar', { timeout: 25000 }).should('be.visible');
    // fecha o "Novidades" (WhatsNew) que abre sozinho na 1ª vez da versão
    cy.get('.wn-cta', { timeout: 10000 }).click({ force: true });
    cy.get('.wn-cta').should('not.exist');
    // vai pro Perfil
    cy.get('ion-tab-button[tab="perfil"]').click({ force: true });

    // preenche o corpo (idade/altura/peso) → Dieta mostra IMC/gordura + auto-peso usa 80kg
    cy.get('ion-input[label="Idade"] input', { timeout: 10000 }).type('30', { force: true }).should('have.value', '30');
    cy.get('ion-input[label="Altura (cm)"] input').type('175', { force: true });
    cy.get('ion-input[label="Peso atual (kg)"] input').type('80', { force: true }).blur();

    // ---- Montar treino → gerar (mira o botão-toggle do Collapsible direto) ----
    cy.contains('.pers-toggle', 'Montar treino', { timeout: 10000 }).scrollIntoView().click({ force: true });
    cy.contains('.perfil-gen-btn', 'Gerar treino', { timeout: 8000 }).click({ force: true });

    // sheet do gerador
    cy.contains('.gen-chip', 'Peito', { timeout: 8000 }).click();
    cy.contains('.gen-chip', '5 dias').click();
    cy.screenshot('03-gerador-foco-peito-5dias');
    cy.contains('.gen-go', 'Gerar treino').click({ force: true });

    // ---- Treino: deve ter A–E + tag "peso do corpo" ----
    cy.get('ion-tab-button[tab="treino"]').click({ force: true });
    cy.contains('.treino-seg', 'Treino D', { timeout: 15000 }).should('exist');
    cy.contains('.treino-seg', 'Treino E').should('exist');
    cy.screenshot('04-treino-segmentos-ate-E');
    // pelo menos um exercício corporal com a tag (acessório de gap / secundário)
    cy.get('body').contains('peso do corpo', { timeout: 10000 }).should('exist');
    cy.screenshot('05-treino-peso-do-corpo');

    // ---- Dieta: IMC + gordura no card de metas ----
    cy.get('ion-tab-button[tab="dieta"]').click({ force: true });
    cy.contains('IMC', { timeout: 12000 }).should('exist');
    cy.screenshot('06-dieta-metas');

    // ---- Progresso renderiza ----
    cy.get('ion-tab-button[tab="progresso"]').click({ force: true });
    cy.contains('Anatomia', { timeout: 12000 }).should('exist');
    cy.screenshot('07-progresso');

    // confirma que houve tentativa de escrita (gerar) mas foi TODA bloqueada
    cy.then(() => {
      cy.log(`Escritas interceptadas/bloqueadas: ${writes}`);
      expect(writes, 'escritas na nuvem foram bloqueadas (nada gravado)').to.be.greaterThan(0);
    });
  });
});
