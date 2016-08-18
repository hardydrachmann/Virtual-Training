angular.module('kosmoramaApp').controller('LoginController', function($scope, $state, $timeout, popupService, dataService, loadingService) {

  $scope.userScreenNumber = '';

  $(document).ready(function() {
    var encryptedId = window.localStorage.getItem('kosmoramaId');
    var key = window.localStorage.getItem('kosmoramaKey');
    if (encryptedId && key) {
      var decryptedId = sjcl.decrypt(key, encryptedId);
      $scope.userScreenNumber = decryptedId;
      $state.go('home');
    }
  });

  $scope.setUserScreenNumber = function() {
    var inputValue = $('#setUserScreenNumber').val();
    if (inputValue) {
      $scope.userScreenNumber = inputValue;
    }
  };

  $scope.login = function() {
    console.log('bef', $scope.userScreenNumber );
    if ($scope.userScreenNumber) {
      loadingService.loaderShow();
      dataService.getUser($scope.userScreenNumber, function(result) {
        if (result) {
          var key = $scope.getRandomKey();
          var id = sjcl.encrypt(key, $scope.userScreenNumber);
          window.localStorage.setItem('kosmoramaId', id);
          window.localStorage.setItem('kosmoramaKey', key);
          $('#setUserScreenNumber').val('');
          $scope.setTabs();
          loadingService.loaderHide(1000);
          $state.go('home');
        } else {
          loadingService.loaderHide(1000);
          $('#setUserScreenNumber').val('');
          popupService.AlertPopup($scope.getText('loginFail'));
        }
      });
    } else {
      popupService.AlertPopup($scope.getText('loginHelp'));
    }
  };

  $scope.logout = function() {
    popupService.confirmPopup($scope.getText('logoutText') + '?', '', function() {
      window.localStorage.removeItem('kosmoramaId');
      window.localStorage.removeItem('kosmoramaKey');
      $scope.userScreenNumber = '';
      $state.go('login');
      $scope.setTabs();
    });
  };

  var minASCII = 33;
  var maxASCII = 126;
  $scope.getRandomKey = function() {
    var key = "";
    for (var i = 0; i < 10; i++) {
      var random = minASCII + (Math.random() * (maxASCII - minASCII));
      key += String.fromCharCode(Math.ceil(random));
    }
    return key;
  };

});
