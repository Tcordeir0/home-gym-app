/// <reference types="cypress" />
// Modo leitura: ao ver outro perfil, só a aba Progresso aparece. Escrita bloqueada.
const EMAIL = Cypress.env('email') as string;
const PASS = Cypress.env('password') as string;

describe('Modo leitura — só Progresso', () => {
  before(function () { if (!EMAIL || !PASS) this.skip(); });
  beforeEach(() => {
    cy.intercept('POST', '**/rest/v1/app_state_v2*', { statusCode: 201, body: [] });
    cy.intercept('POST', '**/rest/v1/social_*', { statusCode: 201, body: [] });
  });

  it('ver outro perfil → só aba Progresso, sem Treino/Dieta/Perfil', () => {
    cy.visit('/');
    cy.get('.auth-card input[type="email"]', { timeout: 20000 }).type(EMAIL, { force: true });
    cy.get('.auth-card input[type="password"]').type(PASS, { force: true });
    cy.get('.auth-go').click();

    cy.contains('Quem é você?', { timeout: 30000 });
    cy.contains('.psel-item', 'Criar novo perfil').click();
    cy.get('ion-alert input', { timeout: 8000 }).type('DonoRO');
    cy.contains('ion-alert button', 'Criar').click();

    cy.get('ion-tab-bar', { timeout: 25000 }).should('be.visible');
    cy.get('.wn-cta', { timeout: 10000 }).click({ force: true });

    // dono: as 5 abas aparecem
    cy.get('ion-tab-button[tab="treino"]').should('exist');
    cy.get('ion-tab-button[tab="perfil"]').should('exist');

    // troca pra VER outro perfil (pill que não é o DonoRO) → modo leitura
    cy.contains('.profile-pill', 'Talys', { timeout: 10000 }).click({ force: true });

    // banner de modo leitura + SÓ a aba Progresso
    cy.contains('modo leitura', { timeout: 10000 }).should('exist');
    cy.get('ion-tab-button[tab="progresso"]').should('exist');
    cy.get('ion-tab-button[tab="treino"]').should('not.exist');
    cy.get('ion-tab-button[tab="dieta"]').should('not.exist');
    cy.get('ion-tab-button[tab="perfil"]').should('not.exist');
    cy.get('ion-tab-button[tab="premios"]').should('not.exist');
    cy.screenshot('RO-01-so-progresso');
  });
});
