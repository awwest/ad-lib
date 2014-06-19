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
  var VectorField = $famous['famous/physics/forces/VectorField'];
  var Wall          = $famous['famous/physics/constraints/Wall'];
  // var Drag           = $famous['famous/physics/forces/Drag'];

  // Other dependencies
  // var SlideData      = require(['../images/SlideData']); // not currently being used

  // Set our sync to listen to mouse and touch events
  GenericSync.register({
    'mouse': MouseSync,
    // 'touch': TouchSync
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
        size: [200, 300],
        position: [450*i + 50, $scope.offset, 1] // starts it, but how to make it continue?
      });
      PE.addBody(pic);

      // modify physics rectangle for our needs
      pic.index = i;
      pic.photo = images[i];
      pic._truePosition = pic.getPosition(); // initialize true position

      // pipe surface events to event handler 
      pic.sync = new GenericSync(['mouse', 'touch', 'scroll']);
      pic.EH = new EventHandler();
      pic.EH.pipe(pic.sync);

      // overriding physics with sync
      pic.override = false;
      pic.sync.on('start', function() { pic.override = true; });
      pic.sync.on('end', function(data) {
        // console.log(data);
        pic.setVelocity([
          data.velocity[0],
          data.velocity[1]
        ]);
        pic.override = false;
      });
      pic.sync.on('update', function(data){
        pic.setTruePosition([
          pic._truePosition[0] + data.delta[0],
          pic._truePosition[1] + data.delta[1]
        ]);
      });

      pic.setTruePosition = function(position) {
        pic._truePosition = position;
      };

      pic.getTruePosition = function(data) {
        // if in override, sync determines where the item is
        if(pic.override) {
          pic.setPosition(pic._truePosition);
        } else {
          // otherwise physics engine does
          pic.setTruePosition(pic.getPosition());
        }
        return pic._truePosition;
      };



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

  var gravity = new VectorField({
      strength : .001,
      field : VectorField.FIELDS.CONSTANT,
      direction : [0, 1, 0]
  });

  var floor = new Wall({
    normal: [0, -1, 0],
    distance: window.innerHeight / 2,
    restitution: 0,
    drift: 0
  });

  PE.attach(floor);
  PE.attach(gravity);

  // Attach a spring and repulsion between each picture and the rest of the pictures
  for(i = 0; i < $scope.pictures.length; i++) {
    var rest = $scope.pictures.slice();
    rest.splice(i, 1);
    // PE.attach(repulsion, rest, $scope.pictures[i]);
    // PE.attach(spring, rest, $scope.pictures[i]);
    // PE.attach(floor, [$scope.pictures[i]]);

  }

  // // Create a rectangle that repels pictures
  // $scope.repulsionBar = new Rectangle({
  //   size: [800, 200],
  //   position: [500, 500, 1]
  // });
  // PE.addBody($scope.repulsionBar);
});
