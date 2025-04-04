angular.module('dateNightApp')
  .controller('AuthCallbackController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
    $scope.loading = true;
    $scope.error = null;
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (!token) {
      $scope.error = 'No authentication token provided';
      $scope.loading = false;
      return;
    }
    
    localStorage.setItem('auth_token', token);
    AuthService.setAuthHeader();
    
    AuthService.getCurrentUser()
      .then(function(response) {
        localStorage.setItem('current_user', JSON.stringify(response.data));
        $location.path('/');
      })
      .catch(function(error) {
        $scope.error = 'Failed to load user profile';
        console.error('Auth callback error:', error);
      })
      .finally(function() {
        $scope.loading = false;
      });
  }]);
