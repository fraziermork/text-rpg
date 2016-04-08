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

//methods for setting up the game
game.gameInit                     = gameInit;
game.onStartPress                 = onStartPress;
game.buildInitBoard               = buildInitBoard;
game.implementInitialGameState    = implementInitialGameState;
game.attachEventListeners         = attachEventListeners;

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
game.speed                        = null;
game.running                      = false; //need a separate game.paused?
game.score                        = 0;
game.constructors                 = {};
game.controls                     = {//keycodes matched with 
  '37': () => {
    game.player.move('left');
  },
  '65': () => {
    game.player.move('left');
  }, //left on a or left arrow
  '39': () => {
    game.player.move('right');
  },
  '68': () => {
    game.player.move('right');
  }, //right on d or right arrow
  '38': game.player.jump,
  '87': game.player.jump, //jump on w, or up arrow
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
game.width                        = 100;
game.height                       = 20;
game.halfScreenWidth              = 25; 
game.boardXMin                    = 0;
game.unitSize                     = 10;
game.board                        = null;
game.sprites                      = [];
game.level                        = 0;
game.levels                       = [[]];//each inner array is an array of objects with props x, y, and value, y goes from top to bottom as index increases, x goes from left to right
// game.difficulty                   = 'easy';


function initPage(){ //shows the class select, attaches event listeners to form submit
  console.log('initPage');
  $initSection.show();
  $startForm.on('submit', game.onFormSubmit);  
  $('#canvas').attr('height', game.height * game.unitSize + 'px').attr('width', game.halfScreenWidth * 2 * game.unitSize + 'px');
}

function backToClassSelect(){ //takes you back to class select form
  console.log('backToClassSelect');
  game.lose();
  
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


function gameInit(){
  console.log('gameInit');
  
  game.implementInitialGameState();
  //TODO: attach .once listener for keydowns on space, enter, etc. to play
  
  
}



function implementInitialGameState(){
  console.log('inplementInitialGameState');
  game.buildInitBoard();
  game.board[game.halfScreenWidth][game.height - 2] = game.formClass; //set the initial thing to be built //as is, the initial character square can never have a background
  game.drawBoard();
}

function buildInitBoard(){
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

function onStartPress(e){//runs when they press start
  console.log('onStartPress');
  game.running = true;
  game.attachEventListeners();
  gameLoop();
}

function attachEventListeners(e){
  $(window).on('keydown', function(e){
    if(game.controls[e.keyCode]){
      game.controls[e.keyCode]();
    }
  });
}

function gameLoop(){ //executes the mechanics of the game
  console.log('gameLoop');
  if(!game.running){
    return;
  }
  game.reInitForNewRound();
  game.doActionForEach();
  game.drawBoard();  
  if(game.running){
    window.setTimeOut(gameLoop, game.speed);
  }
}

function reInitForNewRound(){ //runs every round to reinitialize properties 
  game.player.moving = false;
}



function doActionForEach(){
  console.log('doActionForEach');
  
}

function drawBoard(){
  console.log('drawBoard');
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
          console.log('Drew a character at ' + xPos + ', ' + yPos);
          if(value[0] instanceof Object){
            return value[0].drawMe(xPos, yPos);
          } else if (typeof(value[0] === 'string' )){
            console.log('Instantiated a character at ' + xPos + ', ' + yPos);
            let instantiatedObject = new game.Constructors[value]();
            game.board[xPos][yPos] = instantiatedObject;
            return instantiatedObject.drawMe(xPos, yPos);
          } else {
            console.log('Error rendering at postion ' + xPos + ', ' + yPos);
          }
        } else {
          console.log('Error rendering at postion ' + xPos + ', ' + yPos);
        }
      });
    });
}

function drawSquare(xPos, yPos, color){ //draws a box at the specified coordinate, starting at the top left corner of the box
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect((xPos - game.boardXMin) * game.unitSize, yPos * game.unitSize, game.unitSize, game.unitSize);
  ctx.restore();
}

function win(){
  console.log('win');
  $(window).off('keydown');
  game.running = false;
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, game.width * game.unitSize, game.height * game.unitSize);
  ctx.restore();
  //TODO: implement play again and back to class select listeners
}
function lose(){
  console.log('lose');
  $(window).off('keydown');
  game.running = false;
  ctx.save();
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, game.width * game.unitSize, game.height * game.unitSize);
  ctx.restore();
  //TODO: implement play again and back to class select listeners
}
























//________________________________________________________________________________________________________________________________________________________________
//Creature
//________________________________________________________________________________________________________________________________________________________________
function Creature(options = {}){
  this.directions = {
    'l': '>',
    'r': '<'
  };
  this.direction    = 'r';
  this.xyPosition   = options.position || [Math.floor(Math.random() * game.width), Math.floor(Math.random() * game.width)];
}
Creature.prototype.move = function(){
  console.log('move');
};
Creature.prototype.drawMe = function(){
  
};
















//________________________________________________________________________________________________________________________________________________________________
//Player
//________________________________________________________________________________________________________________________________________________________________
function Player(){
  // this.nextAction   = null; //deprecated?
  this.color        = 'black';
  this.health       = 1;
  this.hasPower     = false;
  this.jumpsAllowed = 2;
  this.moving       = false;
}

Player.prototype = new Creature();

Player.prototype.drawMe = function(xPos, yPos){
  game.drawSquare(xPos, yPos, this.color);
};

Player.prototype.jump = function(){
  
};

Player.prototype.usePower = function(){
  //allows the player to do something
  
};

Player.prototype.power = function(){
  //constructor for basic powers
  
};

Player.prototype.useObject = function(){
  //allows player to use objects they find
  
};




















//________________________________________________________________________________________________________________________________________________________________
//Enemy
//________________________________________________________________________________________________________________________________________________________________
function Enemy(){
  this.disabled = true;
  this.alive    = true;
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
