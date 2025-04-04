angular.module('dateNightApp')
  .controller('AuthCallbackController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
    $scope.loading = true;
    $scope.error = null;
    
    // Process OAuth callback
    const init = function() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        $scope.error = 'No authentication token provided';
        $scope.loading = false;
        return;
      }
      
      // Save token
      localStorage.setItem('auth_token', token);
      
      // Set auth header for future requests
      AuthService.setAuthHeader();
      
      // Fetch user info
      AuthService.getCurrentUser()
        .then(function(response) {
          localStorage.setItem('current_user', JSON.stringify(response.data));
          
          // Redirect to home
          $location.path('/');
        })
        .catch(function(error) {
          $scope.error = 'Authentication successful but failed to load user profile';
          console.error('Auth callback error:', error);
          $scope.loading = false;
        });
    };
    
    // Initialize
    init();
  }]);
