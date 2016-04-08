# text-rpg
This is a simple rpg I built to play with object oriented programming in javascript

The Game should have at a minimum

Multiple player characters with different stats
A game board you can navigate
Items you can pick up and use
A win and a lose condition

build es5 and es6 versions in different folders



#needed:

###game:
This is an object for encapsulation, but it doesn't use any classes or constructors, its just a literal
This has properties:
-width        -- game width, in units, default 1000
-height       -- board height, in units, default 20
-unitSize     -- size of units on the canvas, default 5px
-running      -- boolean, whether the game is running or not
-speed        -- game loop speed, defaults to 100ms
-difficulty   -- current game difficulty, not implemented
-player       -- this is the instance of the player object
-board        -- the array board to act as a model for the board state
-canvas       -- the canvas element for the board to be drawn onto
-sprites      -- array of sprites that need to be moved each game loop



This has methods:

#####initPage 
This will make it possible to choose 
-your character class
-speed?
-difficulty?
#####backToClassSelect
#####onFormSubmit
#####gameInit
#####onStartPress
#####gameLoop 
This is the method that will execute the game loop, with a timeout set on the game speed
if a player has pressed a move key 
#####buildInitBoard
#####implementInitialGameState
#####

#####drawBoard

#####win

#####lose

#####spawnEnemy

###Creature: (CONSTRUCTOR FUNCTION)
this has properties:
-position   - [x,y] array of current coordinates
-direction  - direction the creature is facing, either left or right
-image      - what will be drawn in for the creature

This has methods:
#####Move (direction)
This lets the player move if their way isn't blocked
#####Jump (strength)
This lets the player jump if their way isn't blocked. If they land on a creature, it dies. 





###player: (CONSTRUCTOR FUNCTION)
This is the constructor function for a player character
Characters have
-class                      - barbarian (more health), wizard (initial power), ranger (jump higher)
-jumps                      - number of jumps a character has taken
-direction                  - which way the character is facing

  
-health                     - amount of health a character has, defaults to 1, to 2 for barbarian
-jumps allowed              - number of jumps a character is allowed to take in a row, defaults to 2, to 3 for ranger class
-hasPower                   - whether a player has a power or not, defaults to false, to true for wizard



#####UsePower (this.power)
This instantiates a power and starts it moving


#####Power (this.position) (CONSTRUCTOR FUNCTION)
This is the constructor function for a new fireball attack


###enemy: (CONSTRUCTOR FUNCTION)
This is the constructor function for an enemy:
-health
-direction
-action to execute

This has methods:
#####defaultBehavior
moves the enemy according to a predetermined set of behavior

###drone    (extends enemy) (CONSTRUCTOR FUNCTION)
moves randomly

###warrior  (extends enemy) (CONSTRUCTOR FUNCTION)
attacks with purpose







a
