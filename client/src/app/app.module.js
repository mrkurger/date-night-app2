var app = angular.module('classifiedsApp', ['ngSanitize']);

app.controller('AdsController', function($scope, $http, $interval, icons) {
  $scope.ads = [];
  $scope.newAd = {};
  $scope.view = 'tinder'; // update options to include 'proximity'
  $scope.currentTinderIndex = 0;
  $scope.registerData = {};
  $scope.loginData = {};
  $scope.user = null;
  $scope.userLocation = null;
  $scope.filteredAds = [];
  $scope.selectedCounty = "";
  $scope.travelPlan = [];

  // Define counties (15 counties)
  $scope.counties = [
    "Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder",
    "Rogaland", "Vestland", "Møre og Romsdal", "Trøndelag", "Nordland",
    "Troms og Finnmark", "Sogn og Fjordane", "Telemark", "Hordaland", "Buskerud"
  ];

  // Add icons to scope
  $scope.icons = icons;

  // Check for existing token
  const token = localStorage.getItem('token');
  if (token) {
    $scope.user = JSON.parse(localStorage.getItem('userData'));
  }

  function setAuthHeader() {
    return {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
  }

  // Add animation states
  $scope.cardAnimation = '';

  // Loading state
  $scope.isLoading = false;

  // Add modal flags and functions
  $scope.showLoginModal = false;
  $scope.showRegisterModal = false;
  
  $scope.openLoginModal = function() {
    $scope.showLoginModal = true;
  };
  $scope.closeLoginModal = function() {
    $scope.showLoginModal = false;
  };
  
  $scope.openRegisterModal = function() {
    $scope.showRegisterModal = true;
  };
  $scope.closeRegisterModal = function() {
    $scope.showRegisterModal = false;
  };

  // Enhanced fetch ads with error handling
  $scope.fetchAds = function() {
    $scope.isLoading = true;
    console.log('Fetching ads...');
    $http.get('http://localhost:3000/ads')
      .then(function(response) {
        console.log('Ads fetched:', response.data);
        $scope.ads = response.data;
        $scope.filteredAds = $scope.selectedCounty ?
          $scope.ads.filter(ad => ad.county === $scope.selectedCounty) :
          $scope.ads;
        $scope.currentTinderIndex = 0;  // Reset index on reload
      })
      .catch(function(error) {
        console.error('Error fetching ads:', error);
        alert('Error loading ads. Please check console for details.');
      })
      .finally(function() {
        $scope.isLoading = false;
      });
  };

  $scope.filterByCounty = function() {
    $scope.filteredAds = $scope.selectedCounty ?
      $scope.ads.filter(ad => ad.county === $scope.selectedCounty) :
      $scope.ads;
    $scope.currentTinderIndex = 0;
  };

  $scope.resetCountyFilter = function() {
    $scope.selectedCounty = "";
    $scope.filteredAds = $scope.ads;
    $scope.currentTinderIndex = 0;
  };

  // Save Travel Plan for Advertisers
  $scope.saveTravelPlan = function() {
    $http.post('http://localhost:3000/users/travelPlan', { travelPlan: $scope.travelPlan }, setAuthHeader())
      .then(function(response) {
        alert('Travel plan saved successfully!');
      })
      .catch(function(error) {
        alert('Error saving travel plan: ' + error.data.error);
      });
  };

  // Get current location for new ad
  $scope.getCurrentLocation = function() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.$apply(() => {
          $scope.newAd.coordinates = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
        });
      });
    }
  };

  // Add new ad with coordinates
  $scope.addAd = function() {
    if (!$scope.newAd.coordinates) {
      alert('Please set a location for your ad');
      return;
    }

    $http.post('http://localhost:3000/ads', {
      ...$scope.newAd,
      advertiser: $scope.user.id
    }, setAuthHeader())
      .then(function(response) {
        $scope.ads.push(response.data);
        $scope.newAd = {};
      })
      .catch(function(error) {
        alert('Error: ' + error.data.error);
      });
  };

  // Registration function for users and advertisers
  $scope.register = function() {
    if ($scope.registerData.password !== $scope.registerData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    $http.post('http://localhost:3000/register', $scope.registerData)
      .then(function(response) {
        alert("Registration successful! Please login.");
        $scope.registerData = {};
        $scope.closeRegisterModal();
      })
      .catch(function(error) {
        alert("Registration failed: " + error.data.error);
      });
  };

  // Enhanced login with better feedback
  $scope.login = function() {
    console.log('Attempting login...');
    $http.post('http://localhost:3000/login', $scope.loginData)
      .then(function(response) {
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          username: response.data.username,
          role: response.data.role
        }));
        $scope.user = {
          username: response.data.username,
          role: response.data.role
        };
        $scope.loginData = {};
        $scope.closeLoginModal();
      })
      .catch(function(error) {
        console.error('Login error:', error);
        alert("Login failed: " + (error.data?.error || 'Unknown error'));
      });
  };

  // Add social login function
  $scope.socialLogin = function(provider) {
    window.location.href = `http://localhost:3000/auth/${provider}`;
  };

  // Handle OAuth callback
  const params = new URLSearchParams(window.location.search);
  const tokenFromParams = params.get('token');
  if (tokenFromParams) {
    localStorage.setItem('token', tokenFromParams);
    const userData = JSON.parse(atob(tokenFromParams.split('.')[1]));
    localStorage.setItem('userData', JSON.stringify({
      username: userData.username,
      role: userData.role
    }));
    window.location.href = '/';
  }

  // Logout function
  $scope.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    $scope.user = null;
  };

  // Navigate to next ad in Tinder view
  $scope.nextAd = function() {
    if ($scope.filteredAds.length) {
      $scope.cardAnimation = 'slideOutLeft';
      setTimeout(() => {
        $scope.$apply(() => {
          $scope.currentTinderIndex = ($scope.currentTinderIndex + 1) % $scope.filteredAds.length;
          $scope.cardAnimation = 'slideInRight';
        });
      }, 200);
    }
  };

  // Navigate to previous ad in Tinder view
  $scope.prevAd = function() {
    if ($scope.filteredAds.length) {
      $scope.cardAnimation = 'slideOutRight';
      setTimeout(() => {
        $scope.$apply(() => {
          $scope.currentTinderIndex = ($scope.currentTinderIndex - 1 + $scope.filteredAds.length) % $scope.filteredAds.length;
          $scope.cardAnimation = 'slideInLeft';
        });
      }, 200);
    }
  };

  // Get user's location
  $scope.getUserLocation = function() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        $scope.fetchNearbyAds();
      });
    }
  };

  // Fetch nearby ads
  $scope.fetchNearbyAds = function() {
    if (!$scope.userLocation) return;
    
    $http.get(`http://localhost:3000/ads/nearby`, {
      params: $scope.userLocation
    }).then(function(response) {
      $scope.nearbyAds = response.data.map(ad => ({
        ...ad,
        distance: (ad.distance / 1000).toFixed(1) // Convert to km
      }));
    });
  };

  // Sorting functions for proximity view
  $scope.sortByDistance = function() {
    $scope.nearbyAds.sort((a, b) => a.distance - b.distance);
  };

  $scope.sortByOnlineStatus = function() {
    $scope.nearbyAds.sort((a, b) => {
      if (a.advertiserOnline === b.advertiserOnline) {
        return a.distance - b.distance;
      }
      return b.advertiserOnline ? 1 : -1;
    });
  };

  // Update online status
  function updateOnlineStatus() {
    if ($scope.user) {
      $http.post('http://localhost:3000/users/status', 
        { online: true }, 
        setAuthHeader()
      );
    }
  }

  // Set interval to update online status
  setInterval(updateOnlineStatus, 60000); // Every minute
  
  // Update status on view changes
  $scope.$watch('view', function(newView) {
    if (newView === 'proximity') {
      $scope.getUserLocation();
    }
  });

  // Chat functionality
  $scope.activeChat = null;
  $scope.chatMessages = [];
  $scope.chatMinimized = false;
  $scope.newMessage = '';
  $scope.unreadCount = 0;
  $scope.chatPreviews = [];

  function updateUnreadCount() {
    if (!$scope.user) return;
    
    $http.get('http://localhost:3000/chat/unread', setAuthHeader())
      .then(function(response) {
        $scope.unreadCount = response.data.count;
      });
  }

  function loadChatPreviews() {
    if (!$scope.user) return;

    $http.get('http://localhost:3000/chat/previews', setAuthHeader())
      .then(function(response) {
        $scope.chatPreviews = response.data;
      });
  }

  $scope.startChat = function(advertiserId) {
    $http.post(`http://localhost:3000/chat/${advertiserId}/read`, {}, setAuthHeader());
    $http.get(`http://localhost:3000/users/${advertiserId}`)
      .then(function(response) {
        $scope.activeChatUser = response.data;
        $scope.activeChat = advertiserId;
        $scope.loadChatMessages();
      });
  };

  $scope.loadChatMessages = function() {
    if (!$scope.activeChat) return;
    
    $http.get(`http://localhost:3000/chat/${$scope.activeChat}`, setAuthHeader())
      .then(function(response) {
        $scope.chatMessages = response.data;
      });
  };

  $scope.sendMessage = function() {
    if (!$scope.newMessage.trim()) return;

    $http.post(`http://localhost:3000/chat/${$scope.activeChat}`, {
      message: $scope.newMessage
    }, setAuthHeader())
      .then(function(response) {
        $scope.chatMessages.push(response.data);
        $scope.newMessage = '';
      });
  };

  $scope.toggleChat = function() {
    $scope.chatMinimized = !$scope.chatMinimized;
  };

  // Add phone call handler
  $scope.callAdvertiser = function(contact) {
    // Remove any non-numeric characters
    const phoneNumber = contact.replace(/\D/g, '');
    window.location.href = `tel:${phoneNumber}`;
  };

  // Add image hover handlers
  $scope.changeImage = function(ad) {
    if (ad.album && ad.album.length) {
      // Store original image if not already stored
      if (!ad.originalImage) {
        ad.originalImage = ad.profileImage;
        ad.currentImageIndex = 0;
      }
      // Move to next image
      ad.currentImageIndex = (ad.currentImageIndex + 1) % ad.album.length;
      ad.profileImage = ad.album[ad.currentImageIndex];
    }
  };

  $scope.restoreImage = function(ad) {
    if (ad.originalImage) {
      ad.profileImage = ad.originalImage;
      ad.currentImageIndex = 0;
    }
  };

  // Poll for updates
  $interval(function() {
    updateUnreadCount();
    loadChatPreviews();
    if ($scope.activeChat && !$scope.chatMinimized) {
      $scope.loadChatMessages();
    }
  }, 5000);

  // Initialize
  updateUnreadCount();
  loadChatPreviews();

  // Poll for new messages every 5 seconds
  $interval(function() {
    if ($scope.activeChat && !$scope.chatMinimized) {
      $scope.loadChatMessages();
    }
  }, 5000);

  // Initial load of ads
  $scope.fetchAds();
});