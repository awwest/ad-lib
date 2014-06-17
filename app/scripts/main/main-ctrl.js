'use strict';

angular.module('famousAngularStarter')
  .controller('MainCtrl', function ($scope, $famous) {
    var Transitionable = $famous['famous/transitions/Transitionable'];
    var Easing         = $famous['famous/transitions/Easing'];
    var GenericSync    = $famous['famous/inputs/GenericSync'];
    var MouseSync      = $famous['famous/inputs/MouseSync'];
    var TouchSync      = $famous['famous/inputs/TouchSync'];
    var EventHandler   = $famous['famous/core/EventHandler'];
    // var PhysicsEngine  = require('famous/physics/PhysicsEngine'); // not currently being used
    // var SlideData      = require(['../images/SlideData']); // not currently being used

    // Set our sync to listen to mouse and touch events
    GenericSync.register({
      // 'mouse': MouseSync,
      'touch': TouchSync
    });

    $scope.greeting = 'Hello, Famo.us';
    $scope.numberOfPictures   = 3; // number of pictures
    $scope.offset   = 50; // Y offset from top for where pictures start
    $scope.pictures = []; // array of pictures

    // var PE = new PhysicsEngine();

    for(var i = 0; i < $scope.numberOfPictures; i++) {
      // keep each picture in its own closure scope using immediately invoked function
      (function() {
        var position = new Transitionable([450*i + 50, $scope.offset, 1]); // initial place

        var pic = {
          translate: position,
          photo: '../images/yeoman.png',
          index: i
        };
        pic.sync = new GenericSync(['mouse', 'touch'], function() { return position.get(); });

        pic.EH = new EventHandler();
        pic.EH.pipe(pic.sync);

        pic.sync.on('update', function(data){
          position.set([
            position.get()[0]+data.delta[0],
            position.get()[1]+data.delta[1]
          ]);
        });

        pic.sync.on('end', function(data){
          console.log(data);
          //TODO: this is where we put in physics!
          position.set([
            position.get()[0]+(data.velocity[0]*200),
            position.get()[1]+(data.velocity[1]*200)
          ], {
            curve: Easing.outBack,
            duration: 200
          }, function() {
            console.log('done');
          });
        });

        $scope.pictures.push(pic);

      })();
    }
  });
