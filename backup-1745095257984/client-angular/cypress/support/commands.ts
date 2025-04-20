// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('not.include', '/auth/login');
});

// -- This is a child command --
Cypress.Commands.add('navigateTo', { prevSubject: 'element' }, (subject, pageName: string) => {
  cy.wrap(subject).click();
  cy.url().should('include', pageName);
});

// -- This is a dual command --
Cypress.Commands.add('checkAndClick', { prevSubject: 'optional' }, (subject, selector: string) => {
  if (subject) {
    cy.wrap(subject).find(selector).click();
  } else {
    cy.get(selector).click();
  }
});

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      navigateTo(pageName: string): Chainable<Element>;
      checkAndClick(selector: string): Chainable<Element>;
    }
  }
}
