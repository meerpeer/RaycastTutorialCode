const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = TILE_SIZE * MAP_NUM_COLS;
const WINDOW_HEIGHT = TILE_SIZE * MAP_NUM_ROWS;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 10; // using this to make the collumns of pixels a bit thicker
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINI_MAP_SCALE_FACTOR = 0.2;

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
				rect(
					MINI_MAP_SCALE_FACTOR * tileX,
					MINI_MAP_SCALE_FACTOR * tileY,
					MINI_MAP_SCALE_FACTOR * TILE_SIZE,
					MINI_MAP_SCALE_FACTOR * TILE_SIZE);
			}
		}
	}
	isWallAt(x, y){
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return true;
		var mapGridX = Math.floor(x / TILE_SIZE);
		var mapGridY = Math.floor(y / TILE_SIZE);
		console.log(grid.grid[mapGridY][mapGridX]);
		return grid.grid[mapGridY][mapGridX] != 0;
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 5;
		this.turnDirection = 0; // -1 left, +1 right
		this.walkDirection = 0; // -1 back, +1 forward
		this.rotationAngle = Math.PI / 2
		this.moveSpeed = 2; // 2 pixels per frame
		this.rotationSpeed = 5 * (Math.PI / 180); //coverted to radians
	}
	render() {
		noStroke();
		fill(("red"));
		circle(
			MINI_MAP_SCALE_FACTOR * this.x,
			MINI_MAP_SCALE_FACTOR * this.y,
			MINI_MAP_SCALE_FACTOR * this.radius);
		//show front and direction
		stroke("red");
		line(
			MINI_MAP_SCALE_FACTOR * this.x,
			MINI_MAP_SCALE_FACTOR * this.y,
			MINI_MAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
			MINI_MAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
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

class Ray {
	constructor(rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle); //making sure it doesn't go behind 2 pi
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;
		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}
	cast() {
		var xintercept, yintercept;
		var xstep, ystep;
		
		/////////////////////////////////////////////
		// HORIZONTAL RAY -GRID INTERSECTION CODE 
		////////////////////////////////////////////
		var foundHorzWallHit = false;
		var horWallHitX = 0;
		var horWallHitY = 0;

		// Finding the first horizontal intersect:
		// Find the y-coordinate of the closest horizontal grid intersection
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

		// Find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + ((yintercept - player.y) / Math.tan(this.rayAngle)); // maybe swap player.y and yintercept;

		// Calculate the increment xstep and ystep
		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1;

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
		xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

		var nextHorzTouchX = xintercept;
		var nextHorzTouchY = yintercept;


		//Increment xstep and ystep until we find a wall
		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH
			&& nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT){
			if (grid.isWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))){
				foundHorzWallHit = true;
				horWallHitX = nextHorzTouchX;
				horWallHitY = nextHorzTouchY;
			//	stroke("red");
			//	line(player.x, player.y, horWallHitX, horWallHitY);
				break ;
			}
			else {
				nextHorzTouchX += xstep;
				nextHorzTouchY += ystep;
			}
		}

		/////////////////////////////////////////////
		// VERTICAL RAY -GRID INTERSECTION CODE 
		////////////////////////////////////////////
		var foundVertWallHit = false;
		var vertWallHitX = 0;
		var vertWallHitY = 0;

		// Finding the first vertical intersect:
		// Find the x-coordinate of the closest vertical grid intersection
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

		// Find the y-coordinate of the closest vertical grid intersection
		yintercept = player.y + ((xintercept - player.x) * Math.tan(this.rayAngle)); // maybe swap player.y and yintercept;

		// Calculate the increment xstep and ystep
		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1;

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
		ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

		var nextVertTouchX = xintercept;
		var nextVertTouchY = yintercept;

		//Increment xstep and ystep until we find a wall
		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH
			&& nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT){
			if (grid.isWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)){
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;
			//	stroke("red");
			//	line(player.x, player.y, vertWallHitX, vertWallHitY);
				break ;
			}
			else {
				nextVertTouchX += xstep;
				nextVertTouchY += ystep;
			}
		}

		// calculate both hor and vert distances and choose the smallest value
		var horzHitDistance = (foundHorzWallHit 
			? distanceBetweenPoints(player.x, player.y, horWallHitX, horWallHitY) 
			: Number.MAX_VALUE);
		var vertHitDistance = (foundVertWallHit 
			? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY) 
			: Number.MAX_VALUE);
		
		// Only store the smallest distances
		if (vertHitDistance < horzHitDistance) {
			this.wallHitX = vertWallHitX;
			this.wallHitY = vertWallHitY;
			this.distance = vertHitDistance;
			this.wasHitVertical = true;
		} else {
			this.wallHitX = horWallHitX;
			this.wallHitY = horWallHitY;
			this.distance = horzHitDistance;
			this.wasHitVertical = false;
		}
	}
	render() {
		stroke("rgba(255,0,0,0.3)");
		line(
			MINI_MAP_SCALE_FACTOR * player.x,
			MINI_MAP_SCALE_FACTOR * player.y,
			MINI_MAP_SCALE_FACTOR * this.wallHitX,
			MINI_MAP_SCALE_FACTOR * this.wallHitY
			);
	}
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed()
{
	if (keyCode == UP_ARROW){
		player.walkDirection = +1;
		console.log(Math.floor(player.y/32));
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

function castAllRays() {
	// start first ray subtracting half of FOV
	var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

	rays = [];
	
	//loop all columns casting the rays
	for (var col = 0; col < NUM_RAYS; col++){
	//for (var i = 0; i< 1; i++){ //only 1 ray for visualisation
		var ray = new Ray(rayAngle);
		ray.cast();
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_RAYS;
	}

}
function normalizeAngle(angle) {
	angle = angle % ( 2 * Math.PI);
	if (angle < 0) {
		angle += (2 * Math.PI);
	}
	return (angle);
}

function render3DProjectedWalls(){
	// loop every ray in the array of rays
	for (var i = 0; i < NUM_RAYS; i++){
		var ray = rays[i];
		var CorrectWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
		
		// calulate the distance to the projection plane
		var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);
		
		// projected Wall height
		var wallStripHeight = (TILE_SIZE / CorrectWallDistance) * distanceProjectionPlane;

		// mist effect: compute transparency based on wall distance
		var alpha =  230 / CorrectWallDistance;

		var colorIntensity = ray.wasHitVertical ? 255 : 180;

		fill("rgba("+ colorIntensity +","+ colorIntensity +","+ colorIntensity +","+ alpha +")");
		noStroke();
		rect(
			i * WALL_STRIP_WIDTH,
			(WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function distanceBetweenPoints(x1, y1, x2, y2){
	return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
	player.update();
	castAllRays();
}

function draw() {
	clear('#212121');
	update();

	render3DProjectedWalls();
	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
