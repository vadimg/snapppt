'use strict';

angular.module('frontendApp')
  .controller('DeckCtrl', function($scope, $routeParams, $http) {
    var origin = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

    var deckid = $routeParams.deckid;
    function getSnaps() {
      $http.get('/deck/' + deckid).success(function(data) {
        $scope.snaps = data.snaps;
        $scope.numSnaps = 0;
        for (var snapid in $scope.snaps) {
          $scope.numSnaps++;
          $scope.snaps[snapid].url = origin + '/#/snap/' + snapid;
        }
      });
    }
    getSnaps();

    $scope.newSnap = function() {
      $http.post('/new_snap/' + deckid).success(function(data) {
        getSnaps();
      });
    };
  });
