/**
 * End-to-end tests for the Tinder view functionality
 * 
 * These tests verify that:
 * - Users can view potential matches in Tinder card format
 * - Users can swipe left/right on cards
 * - Users can view detailed profiles
 * - Filters work correctly
 */
describe('Tinder View', () => {
  beforeEach(() => {
    // Intercept the auth check API call
    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user'
      }
    }).as('authCheck');

    // Intercept the matches API call
    cy.intercept('GET', '**/matches*', {
      statusCode: 200,
      body: {
        matches: [
          {
            id: '1',
            username: 'user1',
            fullName: 'User One',
            age: 28,
            location: 'Oslo',
            bio: 'I love hiking and movies',
            interests: ['hiking', 'movies'],
            images: ['https://example.com/user1-1.jpg', 'https://example.com/user1-2.jpg'],
            compatibility: 85
          },
          {
            id: '2',
            username: 'user2',
            fullName: 'User Two',
            age: 32,
            location: 'Bergen',
            bio: 'Coffee enthusiast and book lover',
            interests: ['coffee', 'reading'],
            images: ['https://example.com/user2-1.jpg', 'https://example.com/user2-2.jpg'],
            compatibility: 72
          },
          {
            id: '3',
            username: 'user3',
            fullName: 'User Three',
            age: 25,
            location: 'Trondheim',
            bio: 'Music producer and foodie',
            interests: ['music', 'food'],
            images: ['https://example.com/user3-1.jpg', 'https://example.com/user3-2.jpg'],
            compatibility: 90
          }
        ]
      }
    }).as('matchesRequest');

    // Login and visit tinder view
    cy.visit('/date-night/tinder');
    cy.wait('@authCheck');
    cy.wait('@matchesRequest');
  });

  it('should display tinder cards correctly', () => {
    // First card should be visible
    cy.get('[data-cy=tinder-card]').first().should('be.visible');
    cy.get('[data-cy=card-name]').first().should('contain.text', 'User One');
    cy.get('[data-cy=card-age]').first().should('contain.text', '28');
    cy.get('[data-cy=card-location]').first().should('contain.text', 'Oslo');
    cy.get('[data-cy=card-compatibility]').first().should('contain.text', '85%');
  });

  it('should allow swiping right on a card', () => {
    // Intercept the like API call
    cy.intercept('POST', '**/matches/1/like', {
      statusCode: 200,
      body: { success: true }
    }).as('likeRequest');

    // Click the like button
    cy.get('[data-cy=like-button]').first().click();
    
    // Wait for the API call
    cy.wait('@likeRequest');
    
    // Next card should now be visible
    cy.get('[data-cy=card-name]').first().should('contain.text', 'User Two');
  });

  it('should allow swiping left on a card', () => {
    // Intercept the pass API call
    cy.intercept('POST', '**/matches/1/pass', {
      statusCode: 200,
      body: { success: true }
    }).as('passRequest');

    // Click the pass button
    cy.get('[data-cy=pass-button]').first().click();
    
    // Wait for the API call
    cy.wait('@passRequest');
    
    // Next card should now be visible
    cy.get('[data-cy=card-name]').first().should('contain.text', 'User Two');
  });

  it('should open detailed profile view', () => {
    // Intercept the profile API call
    cy.intercept('GET', '**/profile/user1', {
      statusCode: 200,
      body: {
        id: '1',
        username: 'user1',
        fullName: 'User One',
        age: 28,
        location: 'Oslo',
        bio: 'I love hiking and movies',
        interests: ['hiking', 'movies'],
        images: ['https://example.com/user1-1.jpg', 'https://example.com/user1-2.jpg'],
        compatibility: 85
      }
    }).as('profileRequest');

    // Click on the info button
    cy.get('[data-cy=info-button]').first().click();
    
    // Wait for the profile API call
    cy.wait('@profileRequest');
    
    // Profile modal should be visible
    cy.get('[data-cy=profile-modal]').should('be.visible');
    cy.get('[data-cy=modal-name]').should('contain.text', 'User One');
    cy.get('[data-cy=modal-bio]').should('contain.text', 'I love hiking and movies');
    
    // Close the modal
    cy.get('[data-cy=close-modal]').click();
    cy.get('[data-cy=profile-modal]').should('not.exist');
  });

  it('should apply filters correctly', () => {
    // Intercept the filtered matches API call
    cy.intercept('GET', '**/matches?minAge=25&maxAge=35&location=Oslo', {
      statusCode: 200,
      body: {
        matches: [
          {
            id: '1',
            username: 'user1',
            fullName: 'User One',
            age: 28,
            location: 'Oslo',
            bio: 'I love hiking and movies',
            interests: ['hiking', 'movies'],
            images: ['https://example.com/user1-1.jpg', 'https://example.com/user1-2.jpg'],
            compatibility: 85
          }
        ]
      }
    }).as('filteredMatchesRequest');

    // Open filter modal
    cy.get('[data-cy=filter-button]').click();
    
    // Set age range
    cy.get('[data-cy=min-age-slider]').invoke('val', 25).trigger('change');
    cy.get('[data-cy=max-age-slider]').invoke('val', 35).trigger('change');
    
    // Set location
    cy.get('[data-cy=location-select]').select('Oslo');
    
    // Apply filters
    cy.get('[data-cy=apply-filters]').click();
    
    // Wait for filtered results
    cy.wait('@filteredMatchesRequest');
    
    // Should only show matches from Oslo
    cy.get('[data-cy=card-location]').first().should('contain.text', 'Oslo');
    cy.get('[data-cy=tinder-card]').should('have.length', 1);
  });

  it('should handle empty results gracefully', () => {
    // Intercept with empty results
    cy.intercept('GET', '**/matches?minAge=50&maxAge=60', {
      statusCode: 200,
      body: {
        matches: []
      }
    }).as('emptyMatchesRequest');

    // Open filter modal
    cy.get('[data-cy=filter-button]').click();
    
    // Set age range to get no results
    cy.get('[data-cy=min-age-slider]').invoke('val', 50).trigger('change');
    cy.get('[data-cy=max-age-slider]').invoke('val', 60).trigger('change');
    
    // Apply filters
    cy.get('[data-cy=apply-filters]').click();
    
    // Wait for filtered results
    cy.wait('@emptyMatchesRequest');
    
    // Should show empty state
    cy.get('[data-cy=empty-state]').should('be.visible');
    cy.get('[data-cy=empty-state]').should('contain.text', 'No matches found');
    
    // Should have reset button
    cy.get('[data-cy=reset-filters]').should('be.visible');
  });
});