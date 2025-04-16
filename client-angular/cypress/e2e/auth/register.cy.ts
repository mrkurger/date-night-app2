/**
 * End-to-end tests for the registration functionality
 *
 * These tests verify that:
 * - Users can register with valid information
 * - Users see appropriate error messages for invalid inputs
 * - Users can navigate to the login page
 * - Form validation works correctly
 */
describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/auth/register');
  });

  it('should display the registration form', () => {
    cy.get('[data-cy=register-form]').should('be.visible');
    cy.get('[data-cy=username-input]').should('be.visible');
    cy.get('[data-cy=email-input]').should('be.visible');
    cy.get('[data-cy=password-input]').should('be.visible');
    cy.get('[data-cy=confirm-password-input]').should('be.visible');
    cy.get('[data-cy=terms-checkbox]').should('be.visible');
    cy.get('[data-cy=register-button]').should('be.visible');
  });

  it('should show error for existing username', () => {
    // Intercept the register API call to simulate existing username error
    cy.intercept('POST', '**/auth/register', {
      statusCode: 409,
      body: {
        message: 'Username already exists',
      },
    }).as('registerRequest');

    cy.get('[data-cy=username-input]').type('existinguser');
    cy.get('[data-cy=email-input]').type('new@example.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=confirm-password-input]').type('Password123!');
    cy.get('[data-cy=terms-checkbox]').check();
    cy.get('[data-cy=register-button]').click();

    // Wait for the register request to complete
    cy.wait('@registerRequest');

    // Check for error message
    cy.get('[data-cy=register-error]').should('be.visible');
    cy.get('[data-cy=register-error]').should('contain.text', 'Username already exists');
  });

  it('should show error for existing email', () => {
    // Intercept the register API call to simulate existing email error
    cy.intercept('POST', '**/auth/register', {
      statusCode: 409,
      body: {
        message: 'Email already in use',
      },
    }).as('registerRequest');

    cy.get('[data-cy=username-input]').type('newuser');
    cy.get('[data-cy=email-input]').type('existing@example.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=confirm-password-input]').type('Password123!');
    cy.get('[data-cy=terms-checkbox]').check();
    cy.get('[data-cy=register-button]').click();

    // Wait for the register request to complete
    cy.wait('@registerRequest');

    // Check for error message
    cy.get('[data-cy=register-error]').should('be.visible');
    cy.get('[data-cy=register-error]').should('contain.text', 'Email already in use');
  });

  it('should navigate to login page', () => {
    cy.get('[data-cy=login-link]').click();
    cy.url().should('include', '/auth/login');
  });

  it('should register with valid information', () => {
    // Intercept the register API call
    cy.intercept('POST', '**/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        user: {
          id: '123',
          username: 'newuser',
          email: 'new@example.com',
          role: 'user',
        },
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        expiresIn: 3600,
      },
    }).as('registerRequest');

    cy.get('[data-cy=username-input]').type('newuser');
    cy.get('[data-cy=email-input]').type('new@example.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=confirm-password-input]').type('Password123!');
    cy.get('[data-cy=terms-checkbox]').check();
    cy.get('[data-cy=register-button]').click();

    // Wait for the register request to complete
    cy.wait('@registerRequest');

    // Should redirect to home page or onboarding
    cy.url().should('not.include', '/auth/register');

    // Should display user info in the header
    cy.get('[data-cy=user-menu]').should('contain.text', 'newuser');
  });

  it('should validate form inputs', () => {
    // Try to submit with empty fields
    cy.get('[data-cy=register-button]').click();
    cy.get('[data-cy=username-error]').should('be.visible');
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
    cy.get('[data-cy=terms-error]').should('be.visible');

    // Try with invalid email format
    cy.get('[data-cy=email-input]').type('invalid-email');
    cy.get('[data-cy=register-button]').click();
    cy.get('[data-cy=email-error]').should('be.visible');

    // Try with short username
    cy.get('[data-cy=username-input]').type('ab');
    cy.get('[data-cy=register-button]').click();
    cy.get('[data-cy=username-error]').should('be.visible');

    // Try with weak password
    cy.get('[data-cy=password-input]').type('weak');
    cy.get('[data-cy=register-button]').click();
    cy.get('[data-cy=password-error]').should('be.visible');

    // Try with mismatched passwords
    cy.get('[data-cy=password-input]').clear().type('Password123!');
    cy.get('[data-cy=confirm-password-input]').type('DifferentPassword123!');
    cy.get('[data-cy=register-button]').click();
    cy.get('[data-cy=confirm-password-error]').should('be.visible');
  });

  it('should show password strength indicator', () => {
    // Test with weak password
    cy.get('[data-cy=password-input]').type('weak');
    cy.get('[data-cy=password-strength]').should('have.class', 'weak');

    // Test with medium password
    cy.get('[data-cy=password-input]').clear().type('Medium123');
    cy.get('[data-cy=password-strength]').should('have.class', 'medium');

    // Test with strong password
    cy.get('[data-cy=password-input]').clear().type('StrongP@ssw0rd123!');
    cy.get('[data-cy=password-strength]').should('have.class', 'strong');
  });

  it('should toggle password visibility', () => {
    // Password should be hidden by default
    cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password');

    // Click toggle button to show password
    cy.get('[data-cy=toggle-password]').click();
    cy.get('[data-cy=password-input]').should('have.attr', 'type', 'text');

    // Click toggle button again to hide password
    cy.get('[data-cy=toggle-password]').click();
    cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password');
  });
});
