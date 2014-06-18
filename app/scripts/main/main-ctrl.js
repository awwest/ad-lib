'use strict';

angular.module('famousAngularStarter')
.controller('MainCtrl', function ($scope, $famous) {

  // Scope variables
  $scope.numberOfPictures = 3; // number of pictures
  $scope.offset   = 500; // Y offset from top for where pictures start
  $scope.pictures = []; // array of pictures

  //Physics parameters
  var repulsionStrength    = 15,
      repulsionMinRadius   = 1,
      repulsionMaxRadius   = 5,
      repulsionCap         = 0.5;

  // Famous dependencies
  var GenericSync    = $famous['famous/inputs/GenericSync'];
  var MouseSync      = $famous['famous/inputs/MouseSync'];
  var TouchSync      = $famous['famous/inputs/TouchSync'];
  var EventHandler   = $famous['famous/core/EventHandler'];
  var PhysicsEngine  = $famous['famous/physics/PhysicsEngine'];
  var Rectangle      = $famous['famous/physics/bodies/Rectangle'];
  var Repulsion      = $famous['famous/physics/forces/Repulsion'];
  var Spring         = $famous['famous/physics/forces/Spring'];
  // var Walls          = $famous['famous/physics/constraints/Walls'];
  // var Drag           = $famous['famous/physics/forces/Drag'];

  // Other dependencies
  // var SlideData      = require(['../images/SlideData']); // not currently being used

  // Set our sync to listen to mouse and touch events
  GenericSync.register({
    'mouse': MouseSync,
    'touch': TouchSync
  });

  var images = [
    '../images/yeoman.png',
    '../images/yeoman.png', 
    '../images/yeoman.png', 
    '../images/yeoman.png',
    '../images/yeoman.png', 
    '../images/yeoman.png', 
    '../images/yeoman.png',
    '../images/yeoman.png', 
    '../images/yeoman.png', 
    '../images/yeoman.png'
  ];

  // Instantiate physics engine
  var PE = new PhysicsEngine();

  for(var i = 0; i < $scope.numberOfPictures; i++) {
    // keep each picture in its own closure scope using immediately invoked function
    (function() {

      var pic = new Rectangle({
        size: [400, 300],
        position: [450*i + 50, $scope.offset, 1] // starts it, but how to make it continue?
      });
      PE.addBody(pic);

      // modify physics rectangle for our needs
      pic.index = i;
      pic.photo = images[i];

      // pipe surface events to event handler 
      pic.sync = new GenericSync(['mouse', 'touch']);
      pic.EH = new EventHandler();
      pic.EH.pipe(pic.sync);

      // on update, set transitionable and also rectangle position
      pic.sync.on('update', function(data){
        var cachedPos = pic.getPosition();
        pic.setPosition([
          cachedPos[0]+data.delta[0],
          cachedPos[1]+data.delta[1]
        ]);
      });

      $scope.pictures.push(pic);

    })();
  }

  // Define a repulsion
  var repulsion = new Repulsion({
    strength: repulsionStrength,
    rMin: repulsionMinRadius,
    rMax: repulsionMaxRadius,
    cap: repulsionCap
  });

  // Define a spring
  var spring = new Spring({
      period : 1000,
      dampingRatio : 0.9,
      length: 500,
      maxLength: 700
  });

  // Attach a spring and repulsion between each picture and the rest of the pictures
  for(i = 0; i < $scope.pictures.length; i++) {
    var rest = $scope.pictures.slice();
    rest.splice(i, 1);
    PE.attach(repulsion, rest, $scope.pictures[i]);
    PE.attach(spring, rest, $scope.pictures[i]);
  }

  // // Create a rectangle that repels pictures
  // $scope.repulsionBar = new Rectangle({
  //   size: [800, 200],
  //   position: [500, 500, 1]
  // });
  // PE.addBody($scope.repulsionBar);
});
