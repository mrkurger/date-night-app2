angular.module('dateNightApp')
  .factory('AuthService', ['$http', '$window', function($http, $window) {
    // Local storage key for token
    const TOKEN_KEY = 'auth_token';
    const USER_KEY = 'current_user';
    
    // Helper functions
    function saveToken(token) {
      $window.localStorage.setItem(TOKEN_KEY, token);
    }
    
    function saveUser(user) {
      $window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    
    function getToken() {
      return $window.localStorage.getItem(TOKEN_KEY);
    }
    
    function getCurrentUser() {
      try {
        return JSON.parse($window.localStorage.getItem(USER_KEY));
      } catch (e) {
        return null;
      }
    }
    
    function clearStorage() {
      $window.localStorage.removeItem(TOKEN_KEY);
      $window.localStorage.removeItem(USER_KEY);
    }
    
    // Set auth header for all requests
    function setAuthHeader() {
      const token = getToken();
      if (token) {
        $http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Initialize auth header
    setAuthHeader();
    
    return {
      register: function(userData) {
        return $http.post('/auth/register', userData)
          .then(function(response) {
            if (response.data.token) {
              saveToken(response.data.token);
              saveUser(response.data.user);
              setAuthHeader();
            }
            return response;
          });
      },
      
      login: function(credentials) {
        return $http.post('/auth/login', credentials)
          .then(function(response) {
            if (response.data.token) {
              saveToken(response.data.token);
              saveUser(response.data.user);
              setAuthHeader();
            }
            return response;
          });
      },
      
      logout: function() {
        return $http.post('/auth/logout')
          .finally(function() {
            clearStorage();
            $http.defaults.headers.common['Authorization'] = undefined;
          });
      },
      
      isAuthenticated: function() {
        return !!getToken();
      },
      
      getToken: getToken,
      getCurrentUser: getCurrentUser,
      setAuthHeader: setAuthHeader,
      
      isAdvertiser: function() {
        const user = getCurrentUser();
        return user && user.role === 'advertiser';
      }
    };
  }]);
