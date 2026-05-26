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
// DANE GRACZA
// =========================

const player = {
    x: 1,
    y: 1,
    hp: 100,
    items: 0
};

// =========================
// GRAFIKI
// =========================

const playerImage = new Image();
playerImage.src = "player.png";

const wallImage = new Image();
wallImage.src = "gray brick wall.png";

const floorImage = new Image();
floorImage.src = "floor 4.png";

const enemyImage = new Image();
enemyImage.src = "enemy.png";

const itemImage = new Image();
itemImage.src = "item.png";

const goalImage = new Image();
goalImage.src = "goal.png";

// =========================
// LICZNIK ZAŁADOWANYCH OBRAZÓW
// =========================

let imagesLoaded = 0;
const totalImages = 6;

function checkIfAllImagesLoaded() {
    return imagesLoaded === totalImages;
}

// Dodaj event listeners dla każdego obrazu
playerImage.onload = () => { imagesLoaded++; };
wallImage.onload = () => { imagesLoaded++; };
floorImage.onload = () => { imagesLoaded++; };
enemyImage.onload = () => { imagesLoaded++; };
itemImage.onload = () => { imagesLoaded++; };
goalImage.onload = () => { imagesLoaded++; };

playerImage.onerror = () => { console.error("Błąd: nie można załadować player.png"); imagesLoaded++; };
wallImage.onerror = () => { console.error("Błąd: nie można załadować gray brick wall.png"); imagesLoaded++; };
floorImage.onerror = () => { console.error("Błąd: nie można załadować floor 4.png"); imagesLoaded++; };
enemyImage.onerror = () => { console.error("Błąd: nie można załadować enemy.png"); imagesLoaded++; };
itemImage.onerror = () => { console.error("Błąd: nie można załadować item.png"); imagesLoaded++; };
goalImage.onerror = () => { console.error("Błąd: nie można załadować goal.png"); imagesLoaded++; };

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

let gameActive = false;

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
                gameActive = false;
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
        gameActive = false;
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

    if (!gameActive) return;

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

let enemyInterval = null;

function startEnemyMovement() {
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(function() {
        if (gameActive) {
            moveEnemies();
            drawGame();
        }
    }, 1000);
}

// =========================
// START GRY
// =========================

startButton.addEventListener("click", function() {

    if (!checkIfAllImagesLoaded()) {
        message.innerText = "Czekanie na załadowanie obrazów...";
        
        // Spróbuj załadować co 100ms
        const loadCheckInterval = setInterval(function() {
            if (checkIfAllImagesLoaded()) {
                clearInterval(loadCheckInterval);
                startGame();
            }
        }, 100);
        
        // Timeout po 5 sekundach
        setTimeout(function() {
            if (!checkIfAllImagesLoaded()) {
                clearInterval(loadCheckInterval);
                console.warn("Niektóre obrazy się nie załadowały, ale gra i tak się uruchomi");
                startGame();
            }
        }, 5000);
        
    } else {
        startGame();
    }
});

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    message.innerText = "";
    gameActive = true;

    currentLevel = 0;
    player.x = 1;
    player.y = 1;
    player.hp = 100;
    player.items = 0;

    loadLevel(currentLevel);
    updateUI();
    drawGame();
    startEnemyMovement();
}

// =========================
// RESTART GRY
// =========================

restartButton.addEventListener("click", function() {

    if (enemyInterval) clearInterval(enemyInterval);

    currentLevel = 0;

    player.x = 1;
    player.y = 1;

    player.hp = 100;

    player.items = 0;

    message.innerText = "";
    gameActive = true;

    loadLevel(currentLevel);

    updateUI();

    drawGame();

    startEnemyMovement();
});
