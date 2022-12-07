const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = TILE_SIZE * MAP_NUM_COLS;
const WINDOW_HEIGHT = TILE_SIZE * MAP_NUM_ROWS;

class	Map {
	constructor(){
		this.grid =  [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	render(){
		for (var i = 0; i < MAP_NUM_ROWS; i++){
			for (var j = 0; j < MAP_NUM_COLS; j++){
				var tileX = j * TILE_SIZE;
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
			}
		}
	}
	isWallAt(x, y){
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return true;
		var mapGridX = Math.floor(x / TILE_SIZE);
		var mapGridY = Math.floor(y / TILE_SIZE);
		return grid.grid[mapGridY][mapGridX] != 0;
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3;
		this.turnDirection = 0; // -1 left, +1 right
		this.walkDirection = 0; // -1 back, +1 forward
		this.rotationAngle = Math.PI / 2
		this.moveSpeed = 2; // 2 pixels per frame
		this.rotationSpeed = 2 * (Math.PI / 180); //coverted to radians
	}
	render() {
		noStroke();
		fill(("red"));
		circle(this.x, this.y, this.radius);
		stroke("red");
		line(
			this.x,
			this.y,
			this.x + Math.cos(this.rotationAngle) * 30,
			this.y + Math.sin(this.rotationAngle) * 30
			);
	}
	update(){
		this.rotationAngle += this.turnDirection * this.rotationSpeed;
		
		var moveStep = this.walkDirection * this.moveSpeed;
		var new_x = this.x + moveStep * Math.cos(this.rotationAngle);
		var new_y = this.y + moveStep * Math.sin(this.rotationAngle);
		if (!grid.isWallAt(new_x, new_y)){
			this.x = new_x;
			this.y = new_y;
		}
	}
}

var grid = new Map();
var player = new Player();

function keyPressed()
{
	if (keyCode == UP_ARROW){
		player.walkDirection = +1;
	} else if( (keyCode == DOWN_ARROW)){
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW){
		player.turnDirection = +1;
	} else if (keyCode == LEFT_ARROW){
		player.turnDirection = -1;
	}
}

function keyReleased(){
	if (keyCode == UP_ARROW){
		player.walkDirection = 0;
	} else if( (keyCode == DOWN_ARROW)){
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW){
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW){
		player.turnDirection = 0;
	}
}
function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
	player.update();
}

function draw() {
	update();
	grid.render();
	player.render();
}
