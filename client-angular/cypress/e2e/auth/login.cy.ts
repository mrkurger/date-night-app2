/**
 * End-to-end tests for the login functionality
 * 
 * These tests verify that:
 * - Users can log in with valid credentials
 * - Users see appropriate error messages for invalid credentials
 * - Users can navigate to the registration page
 * - Users can reset their password
 */
describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display the login form', () => {
    cy.get('[data-cy=login-form]').should('be.visible');
    cy.get('[data-cy=email-input]').should('be.visible');
    cy.get('[data-cy=password-input]').should('be.visible');
    cy.get('[data-cy=login-button]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-cy=email-input]').type('invalid@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    // Check for error message
    cy.get('[data-cy=login-error]').should('be.visible');
    cy.get('[data-cy=login-error]').should('contain.text', 'Invalid email or password');
  });

  it('should navigate to registration page', () => {
    cy.get('[data-cy=register-link]').click();
    cy.url().should('include', '/auth/register');
  });

  it('should navigate to forgot password page', () => {
    cy.get('[data-cy=forgot-password-link]').click();
    cy.url().should('include', '/auth/forgot-password');
  });

  it('should log in with valid credentials', () => {
    // Intercept the login API call
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user'
        },
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');

    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    // Wait for the login request to complete
    cy.wait('@loginRequest');
    
    // Should redirect to home page
    cy.url().should('not.include', '/auth/login');
    
    // Should display user info in the header
    cy.get('[data-cy=user-menu]').should('contain.text', 'testuser');
  });

  it('should validate form inputs', () => {
    // Try to submit with empty fields
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
    
    // Try with invalid email format
    cy.get('[data-cy=email-input]').type('invalid-email');
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=email-error]').should('be.visible');
    
    // Try with valid email but short password
    cy.get('[data-cy=email-input]').clear().type('valid@example.com');
    cy.get('[data-cy=password-input]').type('short');
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=password-error]').should('be.visible');
  });
});