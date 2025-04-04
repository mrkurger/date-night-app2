/**
 * @typedef {Object} GalleryView
 * @property {Ad[]} ads
 * @property {string} selectedCategory
 * @property {string[]} counties
 */

angular.module('dateNightApp.gallery', ['dateNightApp.core', 'dateNightApp.ads'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/gallery', {
        templateUrl: 'app/features/gallery/gallery.html',
        controller: 'GalleryController'
      });
  }])
  .service('GalleryLayoutService', [function() {
    return {
      calculateLayout: function(items, containerWidth) {
        // Implement Netflix-style row calculations
        return items.reduce((rows, item) => {
          // Layout calculation logic
          return rows;
        }, []);
      }
    };
  }]);
