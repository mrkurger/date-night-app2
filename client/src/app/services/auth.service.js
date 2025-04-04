angular.module('dateNightApp')
  .service('AuthService', ['$http', '$window', function($http, $window) {
    const baseUrl = '/auth';
    
    // Store JWT token
    this.saveToken = function(token) {
      $window.localStorage.setItem('jwtToken', token);
    };
    
    this.getToken = function() {
      return $window.localStorage.getItem('jwtToken');
    };
    
    this.removeToken = function() {
      $window.localStorage.removeItem('jwtToken');
    };
    
    this.isAuthenticated = function() {
      const token = this.getToken();
      if (!token) return false;
      
      // Simple check for token expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      } catch (e) {
        return false;
      }
    };
    
    this.getCurrentUser = function() {
      if (this.isAuthenticated()) {
        const token = this.getToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          _id: payload._id,
          username: payload.username,
          role: payload.role
        };
      }
      return null;
    };
    
    // Authentication methods
    this.register = function(userData) {
      return $http.post(`${baseUrl}/register`, userData)
        .then(response => {
          this.saveToken(response.data.token);
          return response;
        });
    };
    
    this.login = function(credentials) {
      return $http.post(`${baseUrl}/login`, credentials)
        .then(response => {
          this.saveToken(response.data.token);
          return response;
        });
    };
    
    this.logout = function() {
      const token = this.getToken();
      this.removeToken();
      return $http.post(`${baseUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    };
    
    // OAuth login methods
    this.githubLogin = function() {
      $window.location.href = `${baseUrl}/github`;
    };
    
    this.googleLogin = function() {
      $window.location.href = `${baseUrl}/google`;
    };
    
    this.redditLogin = function() {
      $window.location.href = `${baseUrl}/reddit`;
    };
    
    this.appleLogin = function() {
      $window.location.href = `${baseUrl}/apple`;
    };
    
    // Process OAuth callback
    this.handleAuthCallback = function() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        this.saveToken(token);
        return true;
      }
      return false;
    };
  }]);
