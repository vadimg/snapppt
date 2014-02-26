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
