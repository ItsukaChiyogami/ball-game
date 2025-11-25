// Variabel Global
// Langkah 1: Variabel Layar
// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen
var gameScreen = 0;

// Langkah 2: Variabel Bola & Gravitasi
var ballx, bally;
var ballSize = 20;
var ballColor;
var gravity = 0.5;
var ballSpeedVert = 0;
var airfriction = 0.0001; //gesekan yang terjadi di udara
var friction = 0.1; //gesekan yang terjadi di permukaan

// Langkah 3: Variabel Raket
var racketColor;
var racketWidth = 100; //atur lebar raket
var racketHeight = 10; //atur tinggi raket
var racketBounceRate = 20; //atur rate pantulan raket

// Langkah 4: Variabel Gerakan Horizontal
var ballSpeedHorizon = 10;

// Langkah 5: Variabel Dinding
var wallSpeed = 5;
var wallInterval = 1000;
var lastAddTime = 0;
var minGapHeight = 200;
var maxGapHeight = 300;
var wallWidth = 30;
var wallColor; // Akan diinisialisasi di setup()
var wallRadius = 10; // Variabel baru untuk radius sudut memutar
// [gapWallX, gapWallY, gapWallWidth, gapWallHeight, wallScored]
var walls = [];

// Langkah 6: Variabel Health dan Score
var maxHealth = 100;
var health = 100;
var healthDecrease = 1;
var healthBarWidth = 60;
var score = 0;

// Fungsi setup() utama
function setup() {
    createCanvas(500, 500); // Diubah dari size()
    
    // Pindahkan deklarasi color() ke dalam setup()
    ballColor = color(0, 255, 255);
    racketColor = color(0, 255, 255);
    wallColor = color(0, 0, 255); // DIUBAH: Biru (0, 0, 255)
    
    // Mengatur posisi awal bola
    ballx = width / 4; //mengatur posisi bola di sumbu x
    bally = height / 5; //mengatur posisi bola di sumbu y
}

// Fungsi draw() utama
function draw() {
    if (gameScreen == 0) {
        initScreen();
    } else if (gameScreen == 1) {
        gamePlayScreen();
    } else if (gameScreen == 2) {
        gameOverScreen();
    }
}

// SCREEN CONTENTS 
function initScreen() {
    background(0);
    textAlign(CENTER);
    fill(255);
    textSize(20);
    text("Klik untuk memulai", width / 2, height / 2);
}

function gamePlayScreen() {
    background(255);
    
    applyGravity();
    keepInScreen();
    drawBall();
    
    drawRacket();
    watchRacketBounce();
    
    applyHorizontalSpeed();
    
    wallAdder();
    wallHandler();
    
    drawHealthBar();
    printScore();
}

function gameOverScreen() {
    background(0);
    textAlign(CENTER);
    fill(255, 0, 0);
    textSize(40);
    text("GAME OVER", width / 2, height / 2 - 20);
    fill(255);
    textSize(20);
    text("Score: " + score, width / 2, height / 2 + 10);
    text("Klik untuk main lagi", width / 2, height / 2 + 50);
}

// METODE BANTUAN (HELPER METHODS)

// --- Langkah 1 ---
function startGame() {
    gameScreen = 1;
    health = maxHealth;
    ballx = width / 4;
    bally = height / 5;
    ballSpeedVert = 0;
    ballSpeedHorizon = 10;
    walls = [];
    score = 0;
}

function gameOver() {
    gameScreen = 2;
}

// --- Langkah 2 ---
function drawBall() {
    fill(ballColor);
    ellipse(ballx, bally, ballSize, ballSize);
}

function applyGravity() {
    ballSpeedVert += gravity;
    bally += ballSpeedVert;
    ballSpeedVert -= (ballSpeedVert * airfriction);
}

function makeBounceBottom(surface) {
    bally = surface - (ballSize / 2);
    ballSpeedVert *= -1;
    ballSpeedVert -= (ballSpeedVert * friction);
}

function makeBounceTop(surface) {
    bally = surface + (ballSize / 2);
    ballSpeedVert *= -1;
    ballSpeedVert -= (ballSpeedVert * friction);
}

function keepInScreen() {
    if (bally + (ballSize / 2) > height) {
        makeBounceBottom(height);
    }
    if (bally - (ballSize / 2) < 0) {
        makeBounceTop(0);
    }
    if (ballx - (ballSize / 2) < 0) {
        makeBounceLeft(0);
    }
    if (ballx + (ballSize / 2) > width) {
        makeBounceRight(width);
    }
}

// --- Langkah 3 ---
function drawRacket() {
    fill(racketColor);
    rectMode(CENTER);
    rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
    var overhead = mouseY - pmouseY;
    
    if ((ballx + (ballSize / 2) > mouseX - (racketWidth / 2)) && (ballx - (ballSize / 2) < mouseX + (racketWidth / 2))) {
        if (dist(ballx, bally, ballx, mouseY) <= (ballSize / 2) + abs(overhead)) {
            ballSpeedHorizon = (ballx - mouseX) / 5;
            makeBounceBottom(mouseY);
            if (overhead < 0) {
                bally += overhead;
                ballSpeedVert += overhead;
            }
        }
    }
}

// --- Langkah 4 ---
function applyHorizontalSpeed() {
    ballx += ballSpeedHorizon;
    ballSpeedHorizon -= (ballSpeedHorizon * airfriction);
}

function makeBounceLeft(surface) {
    ballx = surface + (ballSize / 2);
    ballSpeedHorizon *= -1;
    ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

function makeBounceRight(surface) {
    ballx = surface - (ballSize / 2);
    ballSpeedHorizon *= -1;
    ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

// --- Langkah 5 ---
function wallAdder() {
    if (millis() - lastAddTime > wallInterval) {
        var randHeight = round(random(minGapHeight, maxGapHeight));
        var randY = round(random(0, height - randHeight));
        
        var randWall = [width, randY, wallWidth, randHeight, 0];
        walls.push(randWall);
        lastAddTime = millis();
    }
}

function wallHandler() {
    for (var i = walls.length - 1; i >= 0; i--) {
        wallMover(i);
        wallDrawer(i);
        watchWallCollision(i);
        wallRemover(i);
    }
}

function wallDrawer(index) { // DIPERBARUI: Menambahkan radius pada rect()
    var wall = walls[index];
    var gapWallX = wall[0];
    var gapWallY = wall[1];
    var gapWallWidth = wall[2];
    var gapWallHeight = wall[3];
    rectMode(CORNER);
    fill(wallColor);
    
    // Dinding Atas: Sudut memutar di bagian bawah (di atas celah)
    // rect(x, y, w, h, tl, tr, br, bl)
    rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, wallRadius, wallRadius);
    
    // Dinding Bawah: Sudut memutar di bagian atas (di bawah celah)
    rect(gapWallX, gapWallY + gapWallHeight, gapWallWidth, height - (gapWallY + gapWallHeight), wallRadius, wallRadius, 0, 0);
}

function wallMover(index) {
    var wall = walls[index];
    wall[0] -= wallSpeed;
}

function wallRemover(index) {
    var wall = walls[index];
    if (wall[0] + wall[2] <= 0) {
        walls.splice(index, 1);
    }
}

function watchWallCollision(index) {
    var wall = walls[index];
    var gapWallX = wall[0];
    var gapWallY = wall[1];
    var gapWallWidth = wall[2];
    var gapWallHeight = wall[3];
    var wallTopX = gapWallX;
    var wallTopY = 0;
    var wallTopWidth = gapWallWidth;
    var wallTopHeight = gapWallY;
    var wallBottomX = gapWallX;
    var wallBottomY = gapWallY + gapWallHeight;
    var wallBottomWidth = gapWallWidth;
    var wallBottomHeight = height - (gapWallY + gapWallHeight);

    // Cek tabrakan dengan dinding atas
    if ((ballx + (ballSize / 2) > wallTopX) && (ballx - (ballSize / 2) < wallTopX + wallTopWidth) && (bally - (ballSize / 2) < wallTopY + wallTopHeight)) {
        decreaseHealth();
    }
    
    // Cek tabrakan dengan dinding bawah
    if ((ballx + (ballSize / 2) > wallBottomX) && (ballx - (ballSize / 2) < wallBottomX + wallBottomWidth) && (bally + (ballSize / 2) > wallBottomY)) {
        decreaseHealth();
    }
    
    var wallScored = wall[4];
    
    if (ballx > gapWallX + (gapWallWidth / 2) && wallScored == 0) {
        wall[4] = 1;
        addScore();
    }
}

// --- Langkah 6 ---
function drawHealthBar() {
    noStroke();
    fill(236, 240, 241);
    rectMode(CORNER);
    rect(ballx - (healthBarWidth / 2), bally - 30, healthBarWidth, 5);
    
    if (health > 60) {
        fill(46, 204, 113);
    } else if (health > 30) {
        fill(230, 126, 34);
    } else {
        fill(231, 76, 60);
    }
    
    rectMode(CORNER);
    rect(ballx - (healthBarWidth / 2), bally - 30, healthBarWidth * (health / maxHealth), 5);
}

function decreaseHealth() {
    health -= healthDecrease;
    if (health <= 0) {
        gameOver();
    }
}

function addScore() {
    score++;
}

function printScore() {
    textAlign(CENTER);
    fill(0);
    textSize(30);
    text(score, width / 2, 40);
}

// INPUTS
function mousePressed() {
    if (gameScreen == 0) {
        startGame();
    } else if (gameScreen == 2) {
        startGame();
    }
}