'use strict';

angular.module('frontendApp')
  .controller('SlideshowCtrl', function($scope, $routeParams, $rootScope, $http) {
    // no need to worry about unsetting, since there's no link to another view
    $rootScope.fullScreen = true;

    $scope.KEY = '3';

    // disable pressing a key
    function blur() {
      document.getElementById('slides').style.display='none';
    }
    function unblur() {
      setTimeout(function() {
        document.getElementById('slides').style.display='block';
      }, 0);
    }

    blur();
    $scope.keyHidden = true;

    document.onkeydown = function(event) {
      var code = event.keyCode || event.which;
      if (String.fromCharCode(code) === $scope.KEY) {
        unblur();
        $scope.keyHidden = false;
      } else {
        blur();
        $scope.keyHidden = true;
      }
      $scope.$digest();
      return false;
    };
    document.onkeyup = function() {
      blur();
      $scope.keyHidden = true;
      $scope.$digest();
      return false;
    };
    window.onblur = function() {
      blur();
      $scope.keyHidden = false;
      $scope.focusHidden = true;
      $scope.$digest();
      return false;
    };
    window.onfocus = function() {
      $scope.focusHidden = false;
      $scope.keyHidden = true;
      $scope.$digest();
      return false;
    };

    var snapid = $routeParams.snapid;
    $scope.snapid = snapid;

    $scope.activeSlide = -1;

    $scope.next = function() {
      if ($scope.keyHidden || $scope.focusHidden) {
        // don't go to next slide if they can't see it
        return;
      }
      if ($scope.activeSlide >= $scope.numSlides + 1) {
        // make sure activeSlide doesn't go too far
        return;
      }
      $scope.activeSlide++;
    };

    $http.get('/num_slides/' + snapid).success(function(data) {
      $scope.numSlides = data.numSlides;
      $scope.fakeArray = new Array($scope.numSlides);
    }).error(function() {
      alert('Snapppt not found!');
    });
  });
