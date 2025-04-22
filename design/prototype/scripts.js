// ===================================================
// GLOBAL VARIABLES
// ===================================================
let currentView = 'netflix'; // Default view

// ===================================================
// INITIALIZATION
// ===================================================
document.addEventListener('DOMContentLoaded', function () {
  // Initialize mobile navigation
  initMobileNav();

  // Initialize favorite buttons
  initFavoriteButtons();

  // Initialize view tabs
  initViewTabs();

  // Get current view from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  if (viewParam) {
    currentView = viewParam;
  }
});

// ===================================================
// MOBILE NAVIGATION
// ===================================================
function initMobileNav() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const closeNavButton = document.querySelector('.close-nav');

  if (mobileMenuToggle && mobileNavOverlay && closeNavButton) {
    // Open mobile nav
    mobileMenuToggle.addEventListener('click', function () {
      mobileNavOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close mobile nav
    closeNavButton.addEventListener('click', function () {
      mobileNavOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Enable scrolling
    });

    // Close mobile nav when clicking outside
    mobileNavOverlay.addEventListener('click', function (event) {
      if (event.target === mobileNavOverlay) {
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Enable scrolling
      }
    });
  }
}

// ===================================================
// FAVORITE BUTTONS
// ===================================================
function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');

  favoriteButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      const icon = this.querySelector('i');

      if (icon.classList.contains('far')) {
        // Add to favorites
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('Added to favorites!');
      } else {
        // Remove from favorites
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Removed from favorites!');
      }
    });
  });
}

// ===================================================
// VIEW TABS
// ===================================================
function initViewTabs() {
  const viewTabs = document.querySelectorAll('.view-tabs .tab');

  viewTabs.forEach(tab => {
    tab.addEventListener('click', function (event) {
      event.preventDefault();

      // Remove active class from all tabs
      viewTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      this.classList.add('active');

      // Update current view
      const href = this.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
}

// ===================================================
// TINDER VIEW FUNCTIONS
// ===================================================
function swipeCard(direction) {
  const currentCard = document.querySelector('.tinder-card.current');
  const nextCard = document.querySelector('.tinder-card.next');
  const hiddenCards = document.querySelectorAll('.tinder-card.hidden');

  if (!currentCard || !nextCard) return;

  // Add swipe animation class
  currentCard.classList.add('swipe-' + direction);

  // Update counter
  const currentCounter = document.getElementById('current-card');
  const totalCards = document.getElementById('total-cards');

  if (currentCounter && totalCards) {
    const currentCount = parseInt(currentCounter.textContent);
    const totalCount = parseInt(totalCards.textContent);

    if (currentCount < totalCount) {
      currentCounter.textContent = currentCount + 1;
    } else {
      // Reset to first card if we've gone through all cards
      currentCounter.textContent = 1;
    }
  }

  // After animation completes, reset cards
  setTimeout(() => {
    // Move current card to end of stack
    currentCard.classList.remove('current', 'swipe-' + direction);
    currentCard.classList.add('hidden');

    // Move next card to current
    nextCard.classList.remove('next');
    nextCard.classList.add('current');

    // Move first hidden card to next
    if (hiddenCards.length > 0) {
      hiddenCards[0].classList.remove('hidden');
      hiddenCards[0].classList.add('next');
    } else {
      // If no more hidden cards, reset the first card
      const allCards = document.querySelectorAll('.tinder-card');
      allCards[0].classList.remove('hidden');
      allCards[0].classList.add('next');
    }
  }, 300);
}

function showDetails() {
  const detailsModal = document.getElementById('details-modal');
  if (detailsModal) {
    detailsModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

function hideDetails() {
  const detailsModal = document.getElementById('details-modal');
  if (detailsModal) {
    detailsModal.classList.remove('active');
    document.body.style.overflow = ''; // Enable scrolling
  }
}

function favoriteCard() {
  const favoriteBtn = document.querySelector('.favorite-btn i');
  if (favoriteBtn) {
    favoriteBtn.classList.toggle('far');
    favoriteBtn.classList.toggle('fas');

    // Show notification
    if (favoriteBtn.classList.contains('fas')) {
      showNotification('Added to favorites!');
    } else {
      showNotification('Removed from favorites!');
    }
  }
}

// ===================================================
// AD DETAIL FUNCTIONS
// ===================================================
function changeMainImage(src) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    mainImage.src = src;

    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
      thumb.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
  }
}

// ===================================================
// UTILITY FUNCTIONS
// ===================================================
function showNotification(message) {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    notification.remove();
  });

  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Hide and remove notification after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ===================================================
// URL PARAMETER HELPERS
// ===================================================
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Get the ad ID from URL for ad detail page
const adId = getUrlParameter('id');
if (adId) {
  console.log('Viewing ad with ID:', adId);
  // In a real app, we would fetch the ad data from an API
}

// Get category filter from URL
const categoryFilter = getUrlParameter('category');
if (categoryFilter) {
  console.log('Filtering by category:', categoryFilter);
  // In a real app, we would apply the category filter
}

// ===================================================
// SEARCH FUNCTIONALITY
// ===================================================
const searchInputs = document.querySelectorAll('.search-bar input');
searchInputs.forEach(input => {
  input.addEventListener('input', function () {
    // Debounce search input
    clearTimeout(input.searchTimeout);
    input.searchTimeout = setTimeout(() => {
      console.log('Searching for:', input.value);
      // In a real app, we would perform the search
    }, 500);
  });
});
