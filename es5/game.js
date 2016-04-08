'use strict';
//cache commonly used jquery selectors for later use
let $initSection  = $('#init-section'); 
let $gameSection  = $('#game-section');
let $startForm    = $('#star-form');
//canvas stuff
let canvas        = document.getElementById('canvas');
let context       = canvas.getContext('2d');

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

//methods for each loop
game.gameLoop                     = gameLoop;
game.drawBoard                    = drawBoard;
game.checkEach                    = checkEach;
game.drawMethods                  = {};

//methods to end game
game.win                          = win;
game.lose                         = lose;

//properties to manage the game
game.formResults                  = null;
game.speed                        = null;
game.running                      = false; //need a separate game.paused?
game.controls                     = {};

//properties to manage game view
game.width                        = 1000;
game.height                       = 20;
game.halfScreenWidth              = 25; 
game.boardXCenter                 = game.halfScreenWidth;
game.unitSize                     = 5;
game.board                        = null;
game.sprites                      = [];
game.level                        = 1;
game.levels                       = [[]];//each inner array is an array of objects with props x, y, and value
// game.difficulty                   = 'easy';


function initPage(){ //shows the class select, attaches event listeners to form submit
  console.log('initPage');
  $initSection.show();
  $startForm.on('submit', game.onFormSubmit);  
  $('#canvas').height(game.height * game.unitSize + 'px').width(game.halfScreenWidth * game.unitSize + 'px');
}

function backToClassSelect(){ //takes you back to class select form
  console.log('backToClassSelect');
  game.lose();
  $gameSection.hide();
  $initSection.show();
  
}

function onFormSubmit(e){ //takes you to a spot to start the game
  console.log('onFormSubmit');
  console.log('e is ', e);
  e.preventDefault();
  //look up syntax
  $startForm.find('input[name=class]:checked').val(); 
  $gameSection.show();
  $initSection.hide();
  game.gameInit();
}


function gameInit(){
  console.log('gameInit');
  game.buildInitBoard();
  game.inplementInitialGameState();
  //TODO: attach .once listener for keydowns on space, enter, etc. 
  
  
}

function implementInitialGameState(){
  console.log('inplementInitialGameState');
  
  
  game.drawBoard();
}

function onStartPress(){//runs when they press start
  console.log('onStartPress');
  game.running = true;
  gameLoop();
}
function gameLoop(){
  console.log('gameLoop');
}
function buildInitBoard(){
  console.log('buildInitBoard');
  console.log(this.level);
  game.board = (new Array(game.width)).fill((new Array(game.height)).fill(null)); //this builds a 100 x 100 board for a top-down diablo style rpg or a 1000 x 20 board for a side-scrolling mario-type game
  console.log(game.board);
  game.board = game.board.map((xArray, xIndex) => { //draw flat baseline
    return xArray.map((value, index, yArray) => {
      if(index === yArray.length - 1){
        return 'g';
      } else{
        return value;
      } 
    });
  }); 
  console.log(game.board);  
  game.levels[game.level].forEach((posInfo) => {
    game.board[posInfo.x][posInfo.y] = posInfo.value;
  }); 
}
function checkEach(){
  console.log('checkEach');
  
}

function drawBoard(){
  console.log('drawBoard');
  game.board.slice(game.boardXCenter - game.halfScreenWidth, game.boardXCenter + game.halfScreenWidth)
    .forEach((yArray, xPos) => {
      yArray.forEach((value, yPos) => {
        if(value === null){
          return;
        } else {
          return game.drawMethods[value](xPos, yPos);
        }
      });
    });
}




// function drawChars(){
//   console.log('drawChars');
//   
// }
function win(){
  console.log('win');
  
}
function lose(){
  console.log('lose');
  
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
  
};

//________________________________________________________________________________________________________________________________________________________________
//Player
//________________________________________________________________________________________________________________________________________________________________
function Player(){
  this.nextAction = null;
}
Player.prototype = new Creature();

Player.prototype.action = function(){
  //allows the player to do something
};


//________________________________________________________________________________________________________________________________________________________________
//Enemy
//________________________________________________________________________________________________________________________________________________________________
function Enemy(){
  
}
Enemy.prototype = new Creature();
Enemy.prototype.act = function(){
  //tells the enemy to do something on their turn
};





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
