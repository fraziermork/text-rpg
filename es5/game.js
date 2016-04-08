'use strict';
//cache commonly used jquery selectors for later use
let $initSection  = $('#init-section'); 
let $gameSection  = $('#game-section');
let $startForm    = $('#start-form');
//canvas stuff
let canvas        = document.getElementById('canvas');
let ctx           = canvas.getContext('2d');





//________________________________________________________________________________________________________________________________________________________________
//game controllers
//________________________________________________________________________________________________________________________________________________________________
let game = {};
//methods for before the game starts
game.initPage                     = initPage;
game.initialize                   = gameInit;
game.backToClassSelect            = backToClassSelect;
game.onFormSubmit                 = onFormSubmit;

//methods for setting up the game at beginning and end
game.gameInit                     = gameInit;
game.onStartPress                 = onStartPress;
game.buildInitBoard               = buildInitBoard;
game.implementInitialGameState    = implementInitialGameState;
game.attachEventListeners         = attachEventListeners;     //adds listeners for controls
game.attachListenersOnGameEnd     = attachListenersOnGameEnd; //adds listeners for restart or back to class select

//methods for each loop
game.gameLoop                     = gameLoop;
game.reInitForNewRound            = reInitForNewRound;
game.drawBoard                    = drawBoard;
game.doActionForEach              = doActionForEach;
game.drawSquare                   = drawSquare;
game.drawMethods                  = {
  ground: function(xPos, yPos){
    return drawSquare(xPos, yPos, 'green');
  }
};


//methods to end game
game.win                          = win;
game.lose                         = lose;

//properties to manage the game
game.player                       = new Player(); //only way to get it not to complain about all the functions is to do it this way, seems inelegant though because this is just a dummy initial one to prevent it from compaining
game.formClass                    = null;
game.speed                        = 100;
game.running                      = false; //need a separate game.paused?
game.score                        = 0; //TODO: implement
game.Constructors                 = {
  'Barbarian': Barbarian,
  'Wizard': Wizard,
  'Ranger': Ranger
};
game.controls                     = {//keycodes matched with 
  '37': () => {
    game.player.tellToMove('left');
  },
  '65': () => {
    game.player.tellToMove('left');
  }, //left on a or left arrow
  '39': () => {
    game.player.tellToMove('right');
  },
  '68': () => {
    game.player.tellToMove('right');
  }, //right on d or right arrow
  '38': () => {
    game.player.jump(); //not sure why it's not working if I just put in game.player.jump
  },
  '87':() => {
    game.player.jump();
  }, //jump on w, or up arrow
  '32': game.player.usePower, //use power with spacebar 
  '69': game.player.useItem,
  '191': game.player.useItem, //use item on e or /  
  '80': () => { //pause or unpause on p
    if (game.running){
      game.running = false;
    } else {
      game.running = true;
      game.gameLoop();
    }
  }
};

//properties to manage game view
game.gravity                      = -1;
game.width                        = 100;
game.height                       = 20;
game.halfScreenWidth              = 25; 
game.boardXMin                    = 0;
game.unitSize                     = 10;
game.board                        = null;
game.sprites                      = [];
game.level                        = 0;
game.levels                       = []; //each inner array is an array of objects with props x, y, and value, y goes from top to bottom as index increases, x goes from left to right
game.levels[0]                    = [{x:20, y: 18, value: 'ground'}];
// game.difficulty                   = 'easy';


function initPage(){ //shows the class select, attaches event listeners to form submit
  console.log('initPage');
  $initSection.show();
  $startForm.on('submit', game.onFormSubmit);  
  $('#canvas').attr('height', game.height * game.unitSize + 'px').attr('width', game.halfScreenWidth * 2 * game.unitSize + 'px');
}

function backToClassSelect(){ //takes you back to class select form
  console.log('backToClassSelect');
  game.level = 0;
  $gameSection.hide();
  $initSection.show();
}

function onFormSubmit(e){ //takes you to a spot to start the game
  console.log('onFormSubmit');
  e.preventDefault();
  game.formClass = $startForm.find('input[name=class]:checked').val(); 
  console.log('Selected class is ', game.formClass);
  $gameSection.show();
  $initSection.hide();
  game.gameInit();
}


function gameInit(){ //implements initial game state and asks user to press start button
  console.log('gameInit');
  game.implementInitialGameState();
  ctx.font = '30px serif';
  ctx.fillText('Press space or enter to play.', 10, 50);
  $(window).on('keydown', game.onStartPress); //attach listener for start button
}


function implementInitialGameState(){  //builds initial board and character
  console.log('inplementInitialGameState');
  game.sprites  = [];
  game.running  = false;
  game.score    = 0;
  game.buildInitBoard();
  game.board[game.halfScreenWidth][game.height - 2] = [game.formClass, game.board[game.halfScreenWidth][game.height - 2]]; //set the initial player in position 
  game.drawBoard();
}

function buildInitBoard(){ //sets up the game.board array
  console.log('buildInitBoard');
  game.board = (new Array(game.width)).fill((new Array(game.height)).fill(null)); //this builds a 100 x 100 board for a top-down diablo style rpg or a 1000 x 20 board for a side-scrolling mario-type game //game.board goes from left to right, top to bottom as index gets larger
  game.board = game.board.map((xArray, xIndex) => { //draw flat baseline
    return xArray.map((value, index, yArray) => {
      if(index === yArray.length - 1){
        return 'ground';
      } else {
        return value;
      } 
    });
  }); 
  console.log(game.board);  
  game.levels[game.level].forEach((posInfo) => {
    game.board[posInfo.x][posInfo.y] = posInfo.value;
  }); 
}

function onStartPress(e){ //runs when they press start to get the game loop going
  console.log('onStartPress');
  if(e.keyCode === 32 || e.keyCode === 32){
    $(window).off('keydown');
    game.running = true;
    game.attachEventListeners();
    game.gameLoop();
  }
}

function attachEventListeners(e){ //attaches the movement controls
  $(window).on('keydown', function(e){
    if(game.controls[e.keyCode]){
      game.controls[e.keyCode]();
    }
  });
}

function gameLoop(){ //executes the mechanics of the game
  // console.log('gameLoop');
  console.log('_________________________________________________________________________________________________________');
  if(!game.running){
    return;
  }
  // game.doActionForEach();
  game.drawBoard();  
  game.reInitForNewRound();
  if(game.running){
    window.setTimeout(gameLoop, game.speed);
  }
}

function reInitForNewRound(){ //runs every round to reinitialize properties that need to be cleared each round
  // console.log('reInitForNewRound'); 
  game.player.moving = false;
  game.player.nextAction = null;
}



function doActionForEach(){ //purpose is to do actions for each object in the sprite list, if they have an action cued
  console.log('doActionForEach');
  
}

function drawBoard(){
  // console.log('drawBoard');
  ctx.clearRect(0, 0, game.width * game.unitSize, game.height * game.unitSize);
  let maxX = game.boardXMin + (2 * game.halfScreenWidth);
  game.board.slice(game.boardXMin, maxX > game.width - 1 ? game.width - 1 : maxX) //dont want to iterate beyond the edge of the array
    .forEach((yArray, xPos) => {
      yArray.forEach((value, yPos) => {
        if(value === null){ //default background is white, don't need to draw anything
          return;
        } else if (typeof(value) === 'string'){ //some background to draw there 
          return game.drawMethods[value](xPos, yPos); 
        } else if (value instanceof Array){ //an object to draw there 
          //array is of form [objectThatsHere/constructorFunctionNameAsString, backgroundString]
          if(value[0] instanceof Object){ 
            // console.log(value[0].name + ' moving is ', value[0].moving);
            // console.log(value[0].name + ' jumping is ', value[0].jumping);
            if (value[0].moving || value[0].jumping){
              return value[0].move(value, xPos, yPos);  
            } else {
              console.log('Drew a ' + value[0].name + ' at ' + xPos + ', ' + yPos);
              return value[0].drawMe();
            }
          } else if (typeof(value[0] === 'string' )){
            let instantiatedObject = new game.Constructors[value[0]]();
            console.log('Instantiated a ' + instantiatedObject.name + ' at ' + xPos + ', ' + yPos);
            instantiatedObject.xPos = xPos;
            instantiatedObject.yPos = yPos;
            game.board[xPos][yPos] = [instantiatedObject, game.board[xPos][yPos][1]];
            return instantiatedObject.drawMe();
          } else {
            console.log('Error rendering at postion ' + xPos + ', ' + yPos);
            console.log('Error value was ', value);
          }
        } else {
          console.log('Error rendering at postion ' + xPos + ', ' + yPos);
          console.log('Error value was ', value);
        }
      });
    });
}

function drawSquare(xPos, yPos, color){ //draws a box at the specified coordinate, starting at the top left corner of the box
  // console.log('drawSquare ' + xPos + ', ' + yPos + ', for color ' + color);
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect((xPos - game.boardXMin) * game.unitSize, yPos * game.unitSize, game.unitSize, game.unitSize);
  ctx.restore();
}



function win(){ //runs when player gets to end of course
  console.log('win');
  $(window).off('keydown');
  game.running = false;
  // game.level++;
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, game.width * game.unitSize, game.height * game.unitSize);
  ctx.restore();
  ctx.font = '30px serif';
  ctx.fillText('You are victorious.', 10, 50);
  ctx.font = '15px serif';
  ctx.fillText('Enter to play again, space to reselect class.', 10, 80);
  game.attachListenersOnGameEnd();
}
function lose(){ //runs when player loses
  console.log('lose');
  $(window).off('keydown');
  game.running = false;
  ctx.save();
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, game.width * game.unitSize, game.height * game.unitSize);
  ctx.restore();
  ctx.font = '30px serif';
  ctx.fillText('Sucks to suck.', 10, 50);
  ctx.font = '15px serif';
  ctx.fillText('Enter to play again, space to reselect class.', 10, 80);
  game.attachListenersOnGameEnd();
}

function attachListenersOnGameEnd (){
  console.log('attachListenersOnGameEnd');
  $(window).on('keydown', (e) => {
    if(e.keyCode === 32){ //space
      $(window).off('keydown');
      game.gameInit();
    } else if (e.keyCode === 13){ //enter
      $(window).off('keydown');
      game.backToClassSelect();
    }
  });
}






















//________________________________________________________________________________________________________________________________________________________________
//Creature
//________________________________________________________________________________________________________________________________________________________________
function Creature(options = {}){
  this.directions = {
    'left': -1,
    'right': 1
  };
  this.direction    = 'right'; //initialized with a value in case drawing character eventually requires a check of direction
  this.xPos         = null; //correspond to coordinates in game.board
  this.yPos         = null; //correspond to coordinates in game.board
  // this.xyPosition   = options.position || [Math.floor(Math.random() * game.width), Math.floor(Math.random() * game.width)];
}

Creature.prototype.tellToMove = function(direction){
  // console.log(this.name + ' tellToMove ' + direction);
  this.moving = true;
  this.direction = direction;
};



Creature.prototype.move = function(arrayInGameBoard, xPos, yPos){
  // console.log('move');
  let creature = arrayInGameBoard[0];
  let backgroundString = arrayInGameBoard[1];
  if(!creature.moving && !creature.jumping){ //get out if it's not supposed to move
    return;
  }
  let newXPos = xPos + creature.directions[creature.direction];
  let newYPos = yPos;
  let squareToCheck = game.board[newXPos][yPos];
  if(squareToCheck){ //it's trying to move into a square with something in it //need to figure out how to deal with it if its both moving and jumping
    return creature.tryToMoveMeTo(newXPos, newYPos, xPos, yPos, squareToCheck, backgroundString);
  } else { //it's trying to move into a square with nothing in it
    game.board[xPos][yPos] = backgroundString;
    console.log('game.board at old creature position ' + xPos + ', ' + yPos + ' is now ', game.board[xPos][yPos]);
    this.xPos = newXPos;
    this.yPos = newYPos;
    this.moving = false;
    game.board[newXPos][newYPos] = [this, game.board[newXPos][newYPos]];
    console.log('game.board at new position ' + newXPos + ', ' + newYPos + ' is ', game.board[newXPos][newYPos]);
    creature.drawMe();
  }
};


Creature.prototype.CheckFuturePath = function(){
  console.log('CheckFuturePath');
  
  
};

Creature.prototype.drawMe = function(){
  console.log('drawMe');
  game.drawSquare(this.xPos, this.yPos, this.color);

};
















//________________________________________________________________________________________________________________________________________________________________
//Player
//________________________________________________________________________________________________________________________________________________________________
function Player(){
  this.color        = 'black';
  this.health       = 1;
  this.hasPower     = false;
  this.jumpsAllowed = 2;
  this.jumping      = false;
  this.jumpStrength = 6;
  this.vertSpeed    = 0;
  this.moving       = false;
  this.nextAction   = null;
}

Player.prototype = new Creature();

Player.prototype.tryToMoveMeTo = function(newXPos, newYPos, curXPos, curYPos, squareToCheck, currentBackgroundString){
  console.log(this.name + ' tryToMoveMeTo ' + newXPos + ', ' + newYPos);
  console.log(squareToCheck + ' is there right now');
  if(typeof(squareToCheck) === 'string'){ //if you're trying to run into the background
    console.log('Ran into background, going to draw ' + this.name + 'where it is.');
    return this.drawMe();
  } 
  // else if (squareToCheck instanceof Array){ //TODO: implement functionality to deal with players running into monsters, monsters running into players, monsters running into eachother
  //   
  // }
};

Player.prototype.jump = function(){
  console.log('jump');
  this.jumping = true;
  
};
Player.prototype.useObject = function(){
  console.log('useObject');
  
  
};
Player.prototype.usePower = function(){
  console.log('usePower');
  
  
};
Player.prototype.power = Power;
function Power(){
  console.log('power');
  
  
}
Power.prototype.moveMe = function(){
  console.log('moveMe on Power');
};






function Barbarian(){
  this.name = 'Barbarian';
  this.health = 3;
  game.player = this;
  game.sprites.push(this);
}
Barbarian.prototype = new Player();


function Wizard(){
  this.name = 'Wizard';
  this.hasPower = true;
  game.player = this;
  game.sprites.push(this);
}
Wizard.prototype = new Player();


function Ranger(){
  this.name = 'Ranger';
  this.jumpsAllowed = 3;
  game.player = this;
  game.sprites.push(this);
}
Wizard.prototype = new Player();












//________________________________________________________________________________________________________________________________________________________________
//Enemy
//________________________________________________________________________________________________________________________________________________________________
function Enemy(){
  this.name     = 'Enemy';
  this.color    = 'red';
  this.disabled = true;
  this.alive    = true;
  this.xPos     = null;
  this.yPos     = null;
  game.sprites.push(this);
}
Enemy.prototype = new Creature();
Enemy.prototype.act = function(){
  //tells the enemy to do something on their turn, this function defines the default behavior for all enemy instances
  
};


// function Drone(){
//   
// }
// Drone.prototype = new Enemy();
// 
// 
// 
// function Warrior(){
//   
// }
// Warrior.prototype = new Enemy();
// Warrior.prototype.act = function(){
//   
// };





























//________________________________________________________________________________________________________________________________________________________________
//Run functions on page load
//________________________________________________________________________________________________________________________________________________________________
$(document).ready(function(){
  console.log('document is ready');
  game.initPage();
});












//________________________________________________________________________________________________________________________________________________________________
// SANDBOX
//________________________________________________________________________________________________________________________________________________________________
// function testParent(){
//   this.name = 'frank';
// }
// function testChild(){
//   this.stuff = 'stuff';
// }
// testChild.prototype = new testParent()
// testChild.prototype.sayName = function(){
// console.log(this.name);
// }
// var test = new testChild();
// test.sayName();
