'use strict';

angular.module('famousAngularStarter')
  .controller('MainCtrl', function ($scope, $famous) {
    // Scope variables
    $scope.greeting = 'Hello, Famo.us';
    $scope.numberOfPictures = 3; // number of pictures
    $scope.offset   = 500; // Y offset from top for where pictures start
    $scope.pictures = []; // array of pictures

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

    var images = ['../images/yeoman.png',
                  '../images/yeoman.png', 
                  '../images/yeoman.png', 
                  '../images/yeoman.png',
                  '../images/yeoman.png', 
                  '../images/yeoman.png', 
                  '../images/yeoman.png',
                  '../images/yeoman.png', 
                  '../images/yeoman.png', 
                  '../images/yeoman.png'];

    //Physics parameters
    var repulsionStrength    = 15,
        repulsionMinRadius   = 1,
        repulsionMaxRadius   = 5,
        repulsionCap         = 0.5;

    // Instantiate physics engine
    window.PE = new PhysicsEngine();

    //Create repulsion target array
    var rectangles = [];

    // Create a repulsion
    var repulsion = new Repulsion({
      strength: repulsionStrength,
      rMin: repulsionMinRadius,
      rMax: repulsionMaxRadius,
      cap: repulsionCap
    });

    // Create a rectangle that repels pictures
    $scope.repulsionBar = new Rectangle({
      size: [800, 200],
      position: [500, 500, 1]
    });


    for(var i = 0; i < $scope.numberOfPictures; i++) {
      // keep each picture in its own closure scope using immediately invoked function
      (function() {

        var pic = {};
        pic.rect = new Rectangle({
          size: [400, 300],
          position: [450*i + 50, $scope.offset, 1] // starts it, but how to make it continue?
        });
        window.PE.addBody(pic.rect);

        pic.index = i;
        pic.photo = images[i];



        // add the rectangle to the physics engine
        rectangles.push(pic.rect);

        window.PE.attach(repulsion, rectangles, pic.rect);
        // window.PE.attach(repulsion, rectangle, repulsionBar);


        // define the picture to translate with the transitionable

        var spring = new Spring({
            period : 1000,
            dampingRatio : 0.9,
            length: 500,
            maxLength: 700
        });

        window.PE.attach(spring, rectangles, pic.rect);

        ////////////////////////////////////////////////////////////////

        ////// Sync code to listen to mouse/touch events for position


        pic.sync = new GenericSync(['mouse', 'touch']);

        // pipe surface events to event handler
        pic.EH = new EventHandler();
        pic.EH.pipe(pic.sync);


        // on update, set transitionable and also rectangle position
        pic.sync.on('update', function(data){
          // rectangle.setVelocity([0,0,0]);
          var cachedPos = pic.rect.getPosition();
          pic.rect.setPosition([
                cachedPos[0]+data.delta[0],
                cachedPos[1]+data.delta[1]
              ]);
        });

        ///////////////////////////////////////////




        // add picture to scope variable for use in angular
        $scope.pictures.push(pic);

      })();
    }
  });
