'use strict';

angular.module('frontendApp', [
  'ngRoute',
  'angularFileUpload'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/deck/:deckid', {
        templateUrl: 'views/deck.html',
        controller: 'DeckCtrl'
      })
      .when('/snap/:snapid', {
        templateUrl: 'views/slideshow.html',
        controller: 'SlideshowCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
