'use strict';

angular.module('frontendApp')
  .controller('SlideshowCtrl', function($scope, $routeParams, $rootScope, $http) {
    // no need to worry about unsetting, since there's no link to another view
    $rootScope.fullScreen = true;

    var snapid = $routeParams.snapid;
    $scope.snapid = snapid;

    $scope.activeSlide = 1;

    // make sure activeSlide stays sane
    $scope.$watch('activeSlide', function(val) {
      val = (val - 0) || 1;
      var numSlides = $scope.numSlides || 1;
      $scope.activeSlide = Math.min(numSlides, Math.max(val, 1));
    });

    $http.get('/num_slides/' + snapid).success(function(data) {
      $scope.numSlides = data.numSlides;
      $scope.fakeArray = new Array($scope.numSlides);
    }).error(function() {
      alert('Snapppt not found!');
    });

    // shortcuts
    key('space, right', function() {
      $scope.activeSlide++;
      $scope.$digest();
    });
    key('left', function() {
      $scope.activeSlide--;
      $scope.$digest();
    });
  });
