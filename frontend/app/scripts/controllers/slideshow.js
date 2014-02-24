'use strict';

angular.module('frontendApp')
  .controller('SlideshowCtrl', function($scope, $routeParams, $rootScope, $http) {
    // no need to worry about unsetting, since there's no link to another view
    $rootScope.fullScreen = true;

    var snapid = $routeParams.snapid;
    $scope.snapid = snapid;

    $scope.activeSlide = 1;

    $http.get('/num_slides/' + snapid).success(function(data) {
      $scope.numSlides = data.numSlides;
      $scope.fakeArray = new Array($scope.numSlides);
    });
  });
