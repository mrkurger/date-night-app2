angular.module('dateNightApp')
  .controller('RegisterController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
    $scope.user = {};
    $scope.loading = false;
    $scope.error = null;

    $scope.register = function() {
      if (!$scope.registerForm.$valid) return;
      
      $scope.loading = true;
      AuthService.register($scope.user)
        .then(function() {
          $location.path('/');
        })
        .catch(function(error) {
          $scope.error = error.data.error || 'Registration failed';
        })
        .finally(function() {
          $scope.loading = false;
        });
    };
  }]);
