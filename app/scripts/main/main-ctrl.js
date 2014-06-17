'use strict';

angular.module('famousAngularStarter')
  .controller('MainCtrl', function ($scope, $famous) {
    var Transitionable = $famous['famous/transitions/Transitionable'];
    $scope.greeting = 'Hello, Famo.us';
    $scope.number = 5;
    $scope.offset = 50;
    $scope.pictures = [];

    $scope.$watch('number', function(num) {
      var arr = [];
      for(var i = 0; i < $scope.number; i++) {
        var transitionable = new Transitionable([450*i + 50, $scope.offset, 1]);
        arr.push({
          translate: transitionable,
          index: i
        });
      }
      $scope.pictures = arr;
    });
  });
