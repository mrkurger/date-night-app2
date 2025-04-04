angular.module('dateNightApp')
  .controller('ProfileController', ['$scope', 'UserService', 'AuthService', '$location', function($scope, UserService, AuthService, $location) {
    $scope.user = null;
    $scope.loading = true;
    $scope.error = null;
    $scope.editMode = false;
    $scope.travelPlanEdit = false;
    $scope.userData = {};
    $scope.counties = [
      'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
      'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
      'Trøndelag', 'Nordland', 'Troms og Finnmark'
    ];
    $scope.selectedCounty = '';
    
    // Check if authenticated
    if (!AuthService.isAuthenticated()) {
      $location.path('/login');
      return;
    }
    
    // Load user profile
    $scope.loadProfile = function() {
      $scope.loading = true;
      
      UserService.getCurrentUser()
        .then(function(response) {
          $scope.user = response.data;
          $scope.userData = angular.copy($scope.user);
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to load profile';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Update profile
    $scope.toggleEditMode = function() {
      $scope.editMode = !$scope.editMode;
      if ($scope.editMode) {
        $scope.userData = angular.copy($scope.user);
      }
    };
    
    $scope.saveProfile = function() {
      if (!$scope.profileForm.$valid) {
        return;
      }
      
      $scope.loading = true;
      
      UserService.updateUser($scope.userData)
        .then(function(response) {
          $scope.user = response.data;
          $scope.editMode = false;
          $scope.loading = false;
          
          // Update stored user data if username changed
          if ($scope.user.username !== AuthService.getCurrentUser().username) {
            const currentUser = AuthService.getCurrentUser();
            currentUser.username = $scope.user.username;
            localStorage.setItem('current_user', JSON.stringify(currentUser));
          }
        })
        .catch(function(error) {
          $scope.error = 'Failed to update profile';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Travel plan management (for advertisers)
    $scope.toggleTravelPlanEdit = function() {
      $scope.travelPlanEdit = !$scope.travelPlanEdit;
    };
    
    $scope.addCounty = function() {
      if (!$scope.selectedCounty || $scope.user.travelPlan.includes($scope.selectedCounty)) {
        return;
      }
      
      $scope.user.travelPlan.push($scope.selectedCounty);
      $scope.selectedCounty = '';
      
      $scope.updateTravelPlan();
    };
    
    $scope.removeCounty = function(county) {
      const index = $scope.user.travelPlan.indexOf(county);
      if (index !== -1) {
        $scope.user.travelPlan.splice(index, 1);
        $scope.updateTravelPlan();
      }
    };
    
    $scope.updateTravelPlan = function() {
      $scope.loading = true;
      
      UserService.updateTravelPlan($scope.user.travelPlan)
        .then(function(response) {
          $scope.user.travelPlan = response.data.travelPlan;
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to update travel plan';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Logout handler
    $scope.logout = function() {
      AuthService.logout()
        .then(function() {
          $location.path('/login');
        })
        .catch(function(error) {
          console.error('Logout error:', error);
        });
    };
    
    // Initialize
    $scope.loadProfile();
  }]);
