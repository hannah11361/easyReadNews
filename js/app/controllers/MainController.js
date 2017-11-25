function MainController($scope) {
  $scope.name = 'me';
}

angular.module('app', []).controller('MainController', MainController);
