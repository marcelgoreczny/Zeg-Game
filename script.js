// =========================
// POBRANIE ELEMENTÓW HTML
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const levelText = document.getElementById("level");
const itemsText = document.getElementById("items");
const message = document.getElementById("message");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// =========================
// USTAWIENIA GRY
// =========================

const tileSize = 64;
const rows = 10;
const cols = 10;

// =========================
// GRAFIKI
// =========================

const playerImage = new Image();
player.src = "player.png"; // tekstury jeszcze konczone

const wallImage = new Image();
wallImage.src = "gray brick wall.png";

const floorImage = new Image();
floorImage.src = "floor 4.png";

const enemyImage = new Image();
enemyImage.src = "enemy.png"; // tekstury jeszcze konczone

const itemImage = new Image();
itemImage.src = "item.png"; // tekstury jeszcze konczone

const goalImage = new Image();
goalImage.src = "assets/goal.png"; // tekstury jeszcze konczone

// =========================
// DANE GRACZA
// =========================

const player = {
    x: 1,
    y: 1,
    hp: 100,
    items: 0
};

// =========================
// SYSTEM POZIOMÓW
// =========================

const levels = [

    {
        maze: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,1,0,0,1,0,1],
            [1,1,1,0,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,0,0,0,1,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],

        enemies: [
            { x: 5, y: 5 }
        ],

        items: [
            { x: 3, y: 1, type: "hp" }
        ],

        goal: {
            x: 8,
            y: 8
        }
    },

    {
        maze: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,1,0,1,0,1],
            [1,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],

        enemies: [
            { x: 7, y: 7 },
            { x: 4, y: 5 }
        ],

        items: [
            { x: 2, y: 1, type: "key" }
        ],

        goal: {
            x: 8,
            y: 7
        }
    },

    {
        maze: [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,1,0,1,0,1],
            [1,0,1,1,0,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ],

        enemies: [
            { x: 7, y: 1 },
            { x: 5, y: 7 },
            { x: 2, y: 5 }
        ],

        items: [
            { x: 1, y: 7, type: "hp" }
        ],

        goal: {
            x: 8,
            y: 8
        }
    }
];

let currentLevel = 0;

let maze = [];
let enemies = [];
let items = [];

const goal = {
    x: 0,
    y: 0
};

// =========================
// WCZYTYWANIE POZIOMU
// =========================

function loadLevel(levelIndex) {

    maze = levels[levelIndex].maze;

    enemies = JSON.parse(JSON.stringify(levels[levelIndex].enemies));

    items = JSON.parse(JSON.stringify(levels[levelIndex].items));

    goal.x = levels[levelIndex].goal.x;
    goal.y = levels[levelIndex].goal.y;
}

// =========================
// RYSOWANIE LABIRYNTU
// =========================

function drawMaze() {

    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < cols; col++) {

            if (maze[row][col] === 1) {

                ctx.drawImage(
                    wallImage,
                    col * tileSize,
                    row * tileSize,
                    tileSize,
                    tileSize
                );

            } else {

                ctx.drawImage(
                    floorImage,
                    col * tileSize,
                    row * tileSize,
                    tileSize,
                    tileSize
                );
            }
        }
    }
}

// =========================
// RYSOWANIE GRACZA
// =========================

function drawPlayer() {

    ctx.drawImage(
        playerImage,
        player.x * tileSize,
        player.y * tileSize,
        tileSize,
        tileSize
    );
}

// =========================
// RYSOWANIE PRZEDMIOTÓW
// =========================

function drawItems() {

    items.forEach(function(item) {

        ctx.drawImage(
            itemImage,
            item.x * tileSize,
            item.y * tileSize,
            tileSize,
            tileSize
        );
    });
}

// =========================
// RYSOWANIE PRZECIWNIKÓW
// =========================

function drawEnemies() {

    enemies.forEach(function(enemy) {

        ctx.drawImage(
            enemyImage,
            enemy.x * tileSize,
            enemy.y * tileSize,
            tileSize,
            tileSize
        );
    });
}

// =========================
// RYSOWANIE METY
// =========================

function drawGoal() {

    ctx.drawImage(
        goalImage,
        goal.x * tileSize,
        goal.y * tileSize,
        tileSize,
        tileSize
    );
}

// =========================
// ZBIERANIE PRZEDMIOTÓW
// =========================

function collectItems() {

    items.forEach(function(item, index) {

        if (player.x === item.x && player.y === item.y) {

            if (item.type === "hp") {
                player.hp += 20;
            }

            player.items++;

            items.splice(index, 1);

            updateUI();
        }
    });
}

// =========================
// RUCH PRZECIWNIKÓW
// =========================

function moveEnemies() {

    enemies.forEach(function(enemy) {

        if (enemy.x < player.x) {

            if (maze[enemy.y][enemy.x + 1] === 0) {
                enemy.x++;
            }
        }

        else if (enemy.x > player.x) {

            if (maze[enemy.y][enemy.x - 1] === 0) {
                enemy.x--;
            }
        }

        if (enemy.y < player.y) {

            if (maze[enemy.y + 1][enemy.x] === 0) {
                enemy.y++;
            }
        }

        else if (enemy.y > player.y) {

            if (maze[enemy.y - 1][enemy.x] === 0) {
                enemy.y--;
            }
        }
    });
}

// =========================
// KOLIZJA Z PRZECIWNIKAMI
// =========================

function checkEnemyCollision() {

    enemies.forEach(function(enemy) {

        if (player.x === enemy.x && player.y === enemy.y) {

            player.hp -= 5;

            updateUI();

            if (player.hp <= 0) {

                message.innerText = "Koniec gry";
            }
        }
    });
}

// =========================
// ZAGADKA
// =========================

function showPuzzle() {

    const answer = prompt("Ile jest 2 + 2?");

    if (answer === "4") {
        message.innerText = "Poprawna odpowiedź";
    }

    else {
        message.innerText = "Błędna odpowiedź";
    }
}

// =========================
// SPRAWDZENIE METY
// =========================

function checkGoal() {

    if (player.x === goal.x && player.y === goal.y) {

        nextLevel();
    }
}

// =========================
// NASTĘPNY POZIOM
// =========================

function nextLevel() {

    currentLevel++;

    if (currentLevel >= levels.length) {

        message.innerText = "Wygrana";
        return;
    }

    loadLevel(currentLevel);

    player.x = 1;
    player.y = 1;

    updateUI();

    drawGame();
}

// =========================
// AKTUALIZACJA UI
// =========================

function updateUI() {

    hpText.innerText = player.hp;

    levelText.innerText = currentLevel + 1;

    itemsText.innerText = player.items;
}

// =========================
// GŁÓWNA FUNKCJA GRY
// =========================

function drawGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();

    drawGoal();

    drawItems();

    drawEnemies();

    drawPlayer();

    collectItems();

    checkEnemyCollision();

    checkGoal();
}

// =========================
// STEROWANIE GRACZEM
// =========================

window.addEventListener("keydown", function(event) {

    let newX = player.x;
    let newY = player.y;

    if (event.key === "ArrowLeft" || event.key === "a") {
        newX--;
    }

    if (event.key === "ArrowRight" || event.key === "d") {
        newX++;
    }

    if (event.key === "ArrowUp" || event.key === "w") {
        newY--;
    }

    if (event.key === "ArrowDown" || event.key === "s") {
        newY++;
    }

    if (maze[newY][newX] === 0) {

        player.x = newX;
        player.y = newY;
    }

    drawGame();
});

// =========================
// RUCH PRZECIWNIKÓW CO 1 SEKUNDĘ
// =========================

setInterval(function() {

    moveEnemies();

    drawGame();

}, 1000);

// =========================
// START GRY
// =========================

startButton.addEventListener("click", function() {

    document.getElementById("startScreen").style.display = "none";

    loadLevel(currentLevel);

    updateUI();

    drawGame();
});

// =========================
// RESTART GRY
// =========================

restartButton.addEventListener("click", function() {

    currentLevel = 0;

    player.x = 1;
    player.y = 1;

    player.hp = 100;

    player.items = 0;

    message.innerText = "";

    loadLevel(currentLevel);

    updateUI();

    drawGame();
});
