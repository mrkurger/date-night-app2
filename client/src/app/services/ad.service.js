angular.module('dateNightApp')
  .factory('AdService', ['$http', '$q', function($http, $q) {
    const baseUrl = '/api/ads';
    
    function getSwipeAds() {
      return $http.get('/ads/swipe');
    }

    function getCategories() {
      return $http.get('/ads/categories');
    }

    function getAdsByCategory(category) {
      return $http.get(`/ads/category/${category}`);
    }

    function getAds() {
      // For development, return mock data
      return $q.resolve({
        data: [
          {
            _id: '1',
            title: 'Sample Ad',
            description: 'This is a sample ad',
            image: 'https://via.placeholder.com/300'
          }
        ]
      });
    }

    return {
      getAllAds: function() {
        return getAds();
      },
      
      getAdById: function(id) {
        return $http.get(`${baseUrl}/${id}`);
      },
      
      createAd: function(adData) {
        return $http.post(baseUrl, adData);
      },
      
      updateAd: function(id, adData) {
        return $http.put(`${baseUrl}/${id}`, adData);
      },
      
      deleteAd: function(id) {
        return $http.delete(`${baseUrl}/${id}`);
      },
      
      searchNearby: function(lon, lat, maxDistance) {
        return $http.get(`${baseUrl}/search/nearby`, {
          params: { longitude: lon, latitude: lat, maxDistance: maxDistance }
        });
      },
      
      filterByCounty: function(county) {
        return $http.get(`${baseUrl}/filter/county/${county}`);
      },

      getSwipeAds: getSwipeAds,
      getCategories: getCategories,
      getAdsByCategory: getAdsByCategory
    };
  }]);
