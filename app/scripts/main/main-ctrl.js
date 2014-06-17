'use strict';

angular.module('famousAngularStarter')
  .controller('MainCtrl', function ($scope, $famous) {
    var Transitionable = $famous['famous/transitions/Transitionable'];
    var SlideData = require(['../images/SlideData']);
    var Utility = require('famous/utilities/Utility');
    $scope.greeting = 'Hello, Famo.us';
    $scope.number = 5;
    $scope.offset = 50;
    $scope.pictures = [];
    // var utility = new Utility();

    // Utility.loadURL(SlideData.getUrl(), function(data){
    //   $rootScope.data = data;
    // });

    $scope.$watch('number', function(num) {
      var arr = [];
      for(var i = 0; i < $scope.number; i++) {
        var transitionable = new Transitionable([450*i + 50, $scope.offset, 1]);
        arr.push({
          translate: transitionable,
          photo: '../images/yeoman.png',
          index: i
        });
      }
      $scope.pictures = arr;
    });
  });
