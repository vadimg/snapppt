'use strict';

angular.module('frontendApp')
  .controller('UploadCtrl', function($scope, $upload, $location) {
    $scope.onFileSelect = function($files) {
      $scope.file = $files[0];
      console.log('file', $scope.file);
    };

    $scope.doUpload = function() {
      $scope.upload = $upload.upload({
        url: '/upload',
        method: 'POST',
        file: $scope.file
      }).progress(function(evt) {
        var percent = parseInt(100.0 * evt.loaded / evt.total);
        $scope.progress = percent;
        console.log('percent: ' + percent);
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        $location.path('/deck/' + data.id);
      }).error(function() {
        $scope.upload = undefined;
        alert('Error uploading!');
      });
      //.then(success, error, progress);
    }
  });
