'use strict';

angular.module('famousAngularStarter')
.controller('MainCtrl', function ($scope, $famous) {

  // Scope variables
  $scope.numberOfPictures = 6; // number of pictures
  $scope.offset   = 580; // Y offset from top for where pictures start
  $scope.pictures = []; // array of pictures

  //Physics parameters
  var repulsionStrength    = 300,
      repulsionMinRadius   = 1,
      repulsionMaxRadius   = 250,
      repulsionCap         = 0.5,
      attractionStrength = -300,
      attractionMinRad = 300,
      attractionMaxRad = 500,
      attractionCap = 100,
      dragStrength = 0.00000001,
      forcesID,
      forceArray = [],
      picSize = [200, 300],
      attractorPosX = window.innerWidth/2 - picSize[0]/2,
      attractorPosY = window.innerHeight/2 - picSize[1]/2;



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
  var Drag           = $famous['famous/physics/forces/Drag'];
  var Particle = $famous['famous/physics/bodies/Particle'];

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
        size: picSize,
        position: [250*i + 50, $scope.offset, 1]
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
      pic.sync.on('start', function() { 
        pic.override = true;
      });
      pic.sync.on('end', function() { pic.override = false; });
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
        
        // console.log('attractor is at ', attractorPosX, ' ', attractorPosY);
        // console.log(pic.index, ' is at ', pic._truePosition);

        return pic._truePosition;
      };



      $scope.pictures.push(pic);

    })();
  }

  // Define a repulsion
  var repulsion = new Repulsion({
    strength: repulsionStrength,
    range: [repulsionMinRadius, repulsionMaxRadius],
    cap: repulsionCap,
    cutoff: 1
  });

  var attraction = new Repulsion({
    strength: attractionStrength,
    range: [attractionMinRad, attractionMaxRad],
    cap: attractionCap,
    cutoff: 1
    // decayFunction : Repulsion.DECAY_FUNCTIONS.MORSE
  })

  // Define a spring
  var spring = new Spring({
      period : 1500,
      dampingRatio : 0.01,
      length: 500,
      maxLength: 550
  });

  var gravity = new VectorField({
      strength : 0.0002,
      field : VectorField.FIELDS.CONSTANT,
      direction : [0, 1, 0]
  });

  // var particle = new Particle({position:[window.innerWidth/2, window.innerHeight/2, 0]});
  var greatAttractor = new Repulsion({
    strength : -200,
    range: [1, 100],
    cap: .01,
    cutoff: .01,
    anchor: [attractorPosX, attractorPosY, 0]
  });

  var floor = new Wall({
    normal: [0, -1, 0],
    distance: window.innerHeight / 2 +300,
    restitution: 0,
    drift: 0
  });

  var drag = new Drag({
    strenth: dragStrength
  });

  forcesID = PE.attach([floor, drag, gravity]);


  // Attach a spring and repulsion between each picture and the rest of the pictures
  function chainForces(picArray){
    for(i = 0; i < picArray.length; i++) {
      var rest = picArray.slice();
      rest.splice(i, 1);
      var pic = picArray[i];
      pic.repulsionID = PE.attach(repulsion, rest, pic);
      forceArray.push(pic.repulsionID);
      pic.attractionID = PE.attach(attraction, rest, pic);
      forceArray.push(pic.attractionID);
      pic.attractorID = PE.attach(greatAttractor, pic);
      forceArray.push(pic.attractorID);
    }
  }


  //Remove all forces in forceArray
  function detachForces(){
    for (i = 0; i < forceArray.length; i++){
      PE.detach(forceArray[i]);
    }
  }

  function isolatePicture(picture){
    detachForces();
    chainForces($scope.pictures.slice().splice(picture.index, 1));
  }

  chainForces($scope.pictures);

  // // Create a rectangle that repels pictures
  // $scope.repulsionBar = new Rectangle({
  //   size: [800, 200],
  //   position: [500, 500, 1]
  // });
  // PE.addBody($scope.repulsionBar);
});
