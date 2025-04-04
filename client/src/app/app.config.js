angular.module('dateNightApp')
  .config(['$routeProvider', '$locationProvider', '$httpProvider', 
    function($routeProvider, $locationProvider, $httpProvider) {
      
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
          resolve: {
            auth: ['AuthService', '$location', function(AuthService, $location) {
              if (!AuthService.isAuthenticated()) {
                $location.path('/login');
                return false;
              }
              return true;
            }]
          }
        })
        .when('/chat/:userId', {
          templateUrl: 'app/features/chat/chat.html',
          controller: 'ChatController',
          resolve: {
            auth: ['AuthService', '$location', function(AuthService, $location) {
              if (!AuthService.isAuthenticated()) {
                $location.path('/login');
                return false;
              }
              return true;
            }]
          }
        })
        .when('/profile', {
          templateUrl: 'app/features/profile/profile.html',
          controller: 'ProfileController',
          resolve: {
            auth: ['AuthService', '$location', function(AuthService, $location) {
              if (!AuthService.isAuthenticated()) {
                $location.path('/login');
                return false;
              }
              return true;
            }]
          }
        })
        .otherwise({
          redirectTo: '/'
        });
      
      // Use HTML5 History API if available
      $locationProvider.hashPrefix('!');
      
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
  .run(['$rootScope', 'AuthService', 'ChatService', function($rootScope, AuthService, ChatService) {
    // Initialize authentication state
    $rootScope.isAuthenticated = AuthService.isAuthenticated();
    $rootScope.currentUser = AuthService.getCurrentUser();
    
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
