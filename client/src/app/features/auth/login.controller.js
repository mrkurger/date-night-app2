angular.module('dateNightApp')
  .controller('LoginController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
    $scope.credentials = {};
    $scope.loading = false;
    $scope.error = null;

    $scope.login = function() {
      if (!$scope.loginForm.$valid) return;
      
      $scope.loading = true;
      AuthService.login($scope.credentials)
        .then(function() {
          $location.path('/');
        })
        .catch(function(error) {
          $scope.error = error.data.error || 'Login failed';
        })
        .finally(function() {
          $scope.loading = false;
        });
    };
  }]);
