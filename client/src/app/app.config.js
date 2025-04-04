angular.module('dateNightApp')
  .config(['$routeProvider', '$locationProvider', '$httpProvider', 
    function($routeProvider, $locationProvider, $httpProvider) {
      
      // Disable HTML5 mode to use hashbang URLs
      $locationProvider.html5Mode(false);
      $locationProvider.hashPrefix('!');
      
      // Add request interceptor for API URL
      $httpProvider.interceptors.push(['API_URL', function(API_URL) {
        return {
          request: function(config) {
            if (!config.url.startsWith('http')) {
              config.url = API_URL + config.url;
            }
            return config;
          }
        };
      }]);

      // Shared auth resolve function
      var requireAuth = ['AuthService', '$location', function(AuthService, $location) {
        if (!AuthService.isAuthenticated()) {
          $location.path('/login');
          return false;
        }
        return true;
      }];
      
      // Configure routes
      $routeProvider
        // Public routes
        .when('/', {
          templateUrl: 'app/features/ad-browser/ad-browser.html',
          controller: 'AdBrowserController'
        })
        .when('/ads/:adId', {
          templateUrl: 'app/features/ad-details/ad-details.html',
          controller: 'AdDetailsController'
        })
        .when('/login', {
          templateUrl: 'app/features/auth/login.html',
          controller: 'LoginController'
        })
        .when('/register', {
          templateUrl: 'app/features/auth/register.html',
          controller: 'RegisterController'
        })
        .when('/auth-callback', {
          templateUrl: 'app/features/auth/auth-callback.html',
          controller: 'AuthCallbackController'
        })
        
        // Protected routes
        .when('/my-ads', {
          templateUrl: 'app/features/ad-management/ad-management.html',
          controller: 'AdManagementController',
          resolve: { auth: requireAuth }
        })
        .when('/chat/:userId', {
          templateUrl: 'app/features/chat/chat.html',
          controller: 'ChatController',
          resolve: { auth: requireAuth }
        })
        .when('/profile', {
          templateUrl: 'app/features/profile/profile.html',
          controller: 'ProfileController',
          resolve: { auth: requireAuth }
        })
        
        // New routes for feature prototypes
        .when('/tinder', {
          templateUrl: 'app/features/tinder/tinder.html',
          controller: 'TinderController',
          resolve: {
            ads: ['AdService', function(AdService) {
              return AdService.getSwipeAds();
            }]
          }
        })
        .when('/gallery', {
          templateUrl: 'app/features/gallery/gallery.html',
          controller: 'GalleryController',
          resolve: {
            categories: ['AdService', function(AdService) {
              return AdService.getCategories();
            }]
          }
        })
        .otherwise({
          redirectTo: '/'
        });
      
      // Configure HTTP interceptors for authentication
      $httpProvider.interceptors.push(['$q', '$location', 'AuthService', 
        function($q, $location, AuthService) {
          return {
            responseError: function(rejection) {
              if (rejection.status === 401 || rejection.status === 403) {
                // Clear auth tokens on unauthorized
                if (AuthService.isAuthenticated()) {
                  AuthService.logout();
                  $location.path('/login');
                }
              }
              return $q.reject(rejection);
            }
          };
        }]);
    }
  ])
  .run(['$rootScope', 'AuthService', 'ChatService', '$location', function($rootScope, AuthService, ChatService, $location) {
    // Initialize authentication state
    $rootScope.isAuthenticated = AuthService.isAuthenticated();
    $rootScope.currentUser = AuthService.getCurrentUser();
    
    // Add logout function to rootScope
    $rootScope.logout = function() {
      AuthService.logout()
        .then(function() {
          $location.path('/login');
        })
        .catch(function(error) {
          console.error('Logout error:', error);
        });
    };
    
    // Set up socket authentication if user is logged in
    if ($rootScope.isAuthenticated && $rootScope.currentUser) {
      ChatService.authenticate($rootScope.currentUser._id);
    }
    
    // Listen to route changes
    $rootScope.$on('$routeChangeStart', function() {
      // Update authentication state on each route change
      $rootScope.isAuthenticated = AuthService.isAuthenticated();
      $rootScope.currentUser = AuthService.getCurrentUser();
    });
  }]);
