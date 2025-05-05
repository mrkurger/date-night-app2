/**
 * End-to-end tests for the profile viewing functionality
 *
 * These tests verify that:
 * - Users can view their own profile
 * - Profile information is displayed correctly
 * - Users can navigate to edit profile
 */
describe('Profile Viewing', () => {
  beforeEach(() => {
    // Intercept the auth check API call
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      },
    }).as('authCheck');

    // Intercept the profile API call
    cy.intercept('GET', '**/profile', {
      statusCode: 200,
      body: {
        id: '123',
        username: 'testuser',
        fullName: 'Test User',
        bio: 'This is a test bio',
        location: 'Oslo',
        interests: ['hiking', 'movies', 'cooking'],
        profileImage: 'https://example.com/profile.jpg',
        socialLinks: {
          instagram: 'testuser',
          facebook: 'testuser',
          twitter: 'testuser',
        },
      },
    }).as('profileRequest');

    // Login and visit profile page
    cy.visit('/profile');
    cy.wait('@authCheck');
    cy.wait('@profileRequest');
  });

  it('should display profile information correctly', () => {
    cy.get('[data-cy=profile-username]').should('contain.text', 'testuser');
    cy.get('[data-cy=profile-fullname]').should('contain.text', 'Test User');
    cy.get('[data-cy=profile-bio]').should('contain.text', 'This is a test bio');
    cy.get('[data-cy=profile-location]').should('contain.text', 'Oslo');

    // Check interests
    cy.get('[data-cy=profile-interests]').should('contain.text', 'hiking');
    cy.get('[data-cy=profile-interests]').should('contain.text', 'movies');
    cy.get('[data-cy=profile-interests]').should('contain.text', 'cooking');

    // Check profile image
    cy.get('[data-cy=profile-image]').should('have.attr', 'src', 'https://example.com/profile.jpg');

    // Check social links
    cy.get('[data-cy=social-instagram]')
      .should('have.attr', 'href')
      .and('include', 'instagram.com/testuser');
    cy.get('[data-cy=social-facebook]')
      .should('have.attr', 'href')
      .and('include', 'facebook.com/testuser');
    cy.get('[data-cy=social-twitter]')
      .should('have.attr', 'href')
      .and('include', 'twitter.com/testuser');
  });

  it('should navigate to edit profile page', () => {
    cy.get('[data-cy=edit-profile-button]').click();
    cy.url().should('include', '/profile/edit');
  });

  it('should show profile actions menu', () => {
    cy.get('[data-cy=profile-actions-menu]').click();
    cy.get('[data-cy=share-profile]').should('be.visible');
    cy.get('[data-cy=download-data]').should('be.visible');
    cy.get('[data-cy=delete-account]').should('be.visible');
  });

  it('should handle profile image error gracefully', () => {
    // Force the image to error
    cy.get('[data-cy=profile-image]').then(($img) => {
      // Trigger error event
      $img[0].dispatchEvent(new Event('error'));
    });

    // Should show fallback image
    cy.get('[data-cy=profile-image]')
      .should('have.attr', 'src')
      .and('include', 'assets/images/default-profile.png');
  });
});
