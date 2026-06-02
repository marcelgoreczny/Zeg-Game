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

let tileSize = 64; // Większy rozmiar dla zbliżenia
let rows = 50;     // Duża mapa
let cols = 50;     // Duża mapa
const totalLevels = 5;
const visionRadius = 5; // Radius światła wokół gracza (w kratkach)

// Canvas - pełny ekran
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
}

resizeCanvas();
window.addEventListener("resize", function() {
    resizeCanvas();
    if (gameActive) drawGame();
});

// =========================
// DANE GRACZA
// =========================

const player = {
    x: 1,
    y: 1,
    hp: 100,
    items: 0,
    direction: "down", // down, up, left, right
    isMoving: false,
    animationFrame: 0,
    isPunching: false,
    punchDirection: null, // "left" lub "right"
    punchStartTime: 0,
    punchDuration: 500 // Czas trwania animacji punchingu w ms
};

// =========================
// TEKSTURY POSTACI - WSZYSTKIE WARIANTY
// =========================

const playerTextures = {
    walk_left: new Image(),
    stand_left: new Image(),
    walk_right: new Image(),
    stand_right: new Image(),
    walk_up: new Image(),
    walk_up_2: new Image(),
    walk_down_1: new Image(),
    walk_down_2: new Image(),
    stand_down: new Image(),
    punch_left: new Image(),
    punch_right: new Image()
};

playerTextures.walk_left.src = "walk_left.png";
playerTextures.stand_left.src = "stand_left.png";
playerTextures.walk_right.src = "walk_right.png";
playerTextures.stand_right.src = "stand_right.png";
playerTextures.walk_up.src = "walk_up.png";
playerTextures.walk_up_2.src = "walk_up_2.png";
playerTextures.walk_down_1.src = "walk_down_1.png";
playerTextures.walk_down_2.src = "walk_down_2.png";
playerTextures.stand_down.src = "walk_down_1.png"; // Fallback do walk_down_1
playerTextures.punch_left.src = "punch_left.png";
playerTextures.punch_right.src = "punch_right.png";

// =========================
// STATUS ZAŁADOWANIA TEKSTUR POSTACI
// =========================

const playerImageStatus = {
    walk_left: false,
    stand_left: false,
    walk_right: false,
    stand_right: false,
    walk_up: false,
    walk_up_2: false,
    walk_down_1: false,
    walk_down_2: false,
    punch_left: false,
    punch_right: false
};

// Event listenery dla załadowania tekstur postaci
Object.keys(playerTextures).forEach(key => {
    playerTextures[key].onload = () => {
        playerImageStatus[key] = true;
        console.log(`✓ ${key}.png załadowany`);
    };
    playerTextures[key].onerror = () => {
        console.warn(`✗ Nie można załadować ${key}.png - użyję fallback`);
    };
});

// =========================
// GRAFIKI - ŁADOWANIE Z FALLBACK
// =========================

const wallImage = new Image();
wallImage.src = "sciana-f-r.png";

const floorImage = new Image();
floorImage.src = "floor 4.png";

const enemyImage = new Image();
enemyImage.src = "stworek.png";

const itemImage = new Image();
itemImage.src = "item.png";

const goalImage = new Image();
goalImage.src = "goal.png";

// =========================
// TRACKER ZAŁADOWANYCH OBRAZÓW
// =========================

const imageStatus = {
    wall: false,
    floor: false,
    enemy: false,
    item: false,
    goal: false
};

// Event listenery dla załadowania
wallImage.onload = () => {
    imageStatus.wall = true;
    console.log("✓ gray brick wall.png załadowany");
};
wallImage.onerror = () => {
    console.warn("✗ Nie można załadować gray brick wall.png - użyję fallback");
};

floorImage.onload = () => {
    imageStatus.floor = true;
    console.log("✓ floor 4.png załadowany");
};
floorImage.onerror = () => {
    console.warn("✗ Nie można załadować floor 4.png - użyję fallback");
};

enemyImage.onload = () => {
    imageStatus.enemy = true;
    console.log("✓ enemy.png załadowany");
};
enemyImage.onerror = () => {
    console.warn("✗ Nie można załadować enemy.png - użyję fallback");
};

itemImage.onload = () => {
    imageStatus.item = true;
    console.log("✓ item.png załadowany");
};
itemImage.onerror = () => {
    console.warn("✗ Nie można załadować item.png - użyję fallback");
};

goalImage.onload = () => {
    imageStatus.goal = true;
    console.log("✓ goal.png załadowany");
};
goalImage.onerror = () => {
    console.warn("✗ Nie można załadować goal.png - użyję fallback");
};

// =========================
// FUNKCJA POBIERANIA ODPOWIEDNIEJ TEKSTURY POSTACI
// =========================

function getPlayerTexture() {
    // Jeśli postać atakuje, wyświetl animację punchingu
    if (player.isPunching) {
        if (player.punchDirection === "left") {
            return "punch_left";
        } else if (player.punchDirection === "right") {
            return "punch_right";
        }
    }

    let textureName = "";

    if (player.isMoving) {
        // Jeśli postać się porusza, używaj tekstury chodzenia
        if (player.direction === "left") {
            textureName = "walk_left";
        } else if (player.direction === "right") {
            textureName = "walk_right";
        } else if (player.direction === "up") {
            // Animacja dla góry - alternacja między walk_up i walk_up_2
            textureName = player.animationFrame % 2 === 0 ? "walk_up" : "walk_up_2";
        } else if (player.direction === "down") {
            // Animacja dla dołu - alternacja między walk_down_1 i walk_down_2
            textureName = player.animationFrame % 2 === 0 ? "walk_down_1" : "walk_down_2";
        }
    } else {
        // Jeśli postać stoi w miejscu, używaj tekstury stania
        if (player.direction === "left") {
            textureName = "stand_left";
        } else if (player.direction === "right") {
            textureName = "stand_right";
        } else if (player.direction === "up") {
            textureName = "walk_up"; // Brak walk_up stania, używamy walk_up
        } else if (player.direction === "down") {
            textureName = "walk_down_1"; // Domyślnie walk_down_1
        }
    }

    return textureName;
}

// =========================
// FUNKCJA WYKONANIA PUNCHINGU
// =========================

function punch(direction) {
    if (player.isPunching) return; // Jeśli już atakuje, nie pozwól na kolejny atak

    player.isPunching = true;
    player.punchDirection = direction;
    player.punchStartTime = Date.now();

    console.log("⚔️ Punch " + direction + "!");

    // Zadawanie obrażeń wrogom w kierunku uderzenia
    dealPunchDamage(direction);

    drawGame();
}

// =========================
// ZADAWANIE OBRAŻEŃ PODCZAS PUNCHINGU
// =========================

function dealPunchDamage(direction) {
    const punchRange = 1; // Dystans, na który sięga punch
    let targetX = player.x;
    let targetY = player.y;

    // Ustalenie kierunku ataku
    if (direction === "right") {
        targetX = player.x + punchRange;
    } else if (direction === "left") {
        targetX = player.x - punchRange;
    }

    // Sprawdzenie czy wróg jest na tych współrzędnych
    enemies.forEach((enemy, index) => {
        if (enemy.x === targetX && enemy.y === targetY) {
            console.log("💥 Trafienie! Wróg pokonany!");
            enemies.splice(index, 1); // Usunięcie wroga
        }
    });
}

// =========================
// AKTUALIZACJA STANU PUNCHINGU
// =========================

function updatePunchState() {
    if (player.isPunching) {
        const currentTime = Date.now();
        const elapsed = currentTime - player.punchStartTime;

        // Jeśli upłynął czas punchingu, zakończ animację
        if (elapsed >= player.punchDuration) {
            player.isPunching = false;
            player.punchDirection = null;
        }
    }
}

// =========================
// GENEROWANIE LOSOWEGO LABIRYNTU
// =========================

function generateMaze(width, height) {
    // Inicjalizuj labirynt - wszystko ścianami
    let maze = [];
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = 1; // 1 = ściana
        }
    }

    // Recursive backtracking algorithm
    function carvePath(x, y) {
        maze[y][x] = 0; // 0 = podłoga

        // Kierunki: góra, prawo, dół, lewo
        const directions = [
            { x: 0, y: -2 },
            { x: 2, y: 0 },
            { x: 0, y: 2 },
            { x: -2, y: 0 }
        ];

        // Losowo tasuj kierunki
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        // Dla każdego kierunku
        for (let dir of directions) {
            let nx = x + dir.x;
            let ny = y + dir.y;

            // Sprawdzenie granic
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
                // Wydrąż ścianę między obecną a nową pozycją
                maze[y + dir.y / 2][x + dir.x / 2] = 0;
                carvePath(nx, ny);
            }
        }
    }

    // Zacznij od pozycji (1, 1)
    carvePath(1, 1);

    // Upewnij się że start jest zawsze przejezdny
    maze[1][1] = 0;

    return maze;
}

// =========================
// ZNALEZIENIE CELU NA PODŁODZE
// =========================

function findGoalPosition(maze) {
    // Szukaj najdalszego punktu na podłodze od startu
    let farthestDist = 0;
    let goalX = cols - 2;
    let goalY = rows - 2;

    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            if (maze[y][x] === 0) { // Jest to podłoga
                let dist = Math.abs(x - 1) + Math.abs(y - 1);
                if (dist > farthestDist) {
                    farthestDist = dist;
                    goalX = x;
                    goalY = y;
                }
            }
        }
    }

    return { x: goalX, y: goalY };
}

// =========================
// GENEROWANIE PRZECIWNIKÓW
// =========================

function generateEnemies(maze, count, playerX, playerY) {
    let enemies = [];
    let placed = 0;

    while (placed < count && placed < 100) { // Limit 100 prób
        let x = Math.floor(Math.random() * (cols - 2)) + 1;
        let y = Math.floor(Math.random() * (rows - 2)) + 1;

        // Sprawdzenie warunków
        if (maze[y][x] === 0 && 
            !(x === playerX && y === playerY) && 
            (Math.abs(x - playerX) > 5 || Math.abs(y - playerY) > 5) &&
            !enemies.some(e => e.x === x && e.y === y)) {
            enemies.push({ x: x, y: y });
            placed++;
        }
    }

    return enemies;
}

// =========================
// GENEROWANIE PRZEDMIOTÓW
// =========================

function generateItems(maze, count, playerX, playerY, goalX, goalY) {
    let items = [];
    let placed = 0;

    while (placed < count && placed < 100) { // Limit 100 prób
        let x = Math.floor(Math.random() * (cols - 2)) + 1;
        let y = Math.floor(Math.random() * (rows - 2)) + 1;

        // Sprawdzenie warunków
        if (maze[y][x] === 0 && 
            !(x === playerX && y === playerY) && 
            !(x === goalX && y === goalY) &&
            !items.some(i => i.x === x && i.y === y)) {
            items.push({ x: x, y: y, type: "hp" });
            placed++;
        }
    }

    return items;
}

// =========================
// GENEROWANIE LOSOWEGO POZIOMU
// =========================

function generateLevel(levelNumber) {
    const maze = generateMaze(cols, rows);
    const goalPos = findGoalPosition(maze);
    
    // Liczba przeciwników rośnie z poziomem
    const enemyCount = Math.min(2 + levelNumber, 6);
    
    // Liczba przedmiotów rośnie z poziomem
    const itemCount = 1 + Math.floor(levelNumber / 2);

    const enemies = generateEnemies(maze, enemyCount, 1, 1);
    const items = generateItems(maze, itemCount, 1, 1, goalPos.x, goalPos.y);

    return {
        maze: maze,
        enemies: enemies,
        items: items,
        goal: {
            x: goalPos.x,
            y: goalPos.y
        }
    };
}

// =========================
// ZMIENNE POZIOMU
// =========================

let currentLevel = 0;
let maze = [];
let enemies = [];
let items = [];

const goal = {
    x: 0,
    y: 0
};

let gameActive = false;
let enemyInterval = null;

// =========================
// KAMERA - ŚLEDZENIE GRACZA (ZBLIŻENIE)
// =========================

const camera = {
    x: 0,
    y: 0
};

function updateCamera() {
    // Wyśrodkuj kamerę na graczu - gracje zawsze na środku ekranu
    camera.x = player.x * tileSize - canvas.width / 2;
    camera.y = player.y * tileSize - canvas.height / 2;

    // Granice kamery
    camera.x = Math.max(0, Math.min(camera.x, cols * tileSize - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, rows * tileSize - canvas.height));
}

function worldToScreen(worldX, worldY) {
    return {
        screenX: worldX - camera.x,
        screenY: worldY - camera.y
    };
}

// =========================
// SPRAWDZENIE WIDOCZNOŚCI (FOG OF WAR)
// =========================

function isInVision(x, y) {
    // Oblicz dystans od gracza
    const dist = Math.sqrt(
        Math.pow(x - player.x, 2) + 
        Math.pow(y - player.y, 2)
    );
    
    // Zwróć true jeśli jest w promieniu widzenia
    return dist <= visionRadius;
}

// =========================
// FALLBACK RYSOWANIE (KSZTAŁTY)
// =========================

function drawTileFallback(x, y, type) {
    const screen = worldToScreen(x * tileSize, y * tileSize);
    const posX = screen.screenX;
    const posY = screen.screenY;

    // Sprawdzenie widoczności - jeśli poza visionem, nie rysuj
    if (!isInVision(x, y)) {
        return;
    }

    // Sprawdzę czy element jest widoczny na ekranie
    if (posX + tileSize < 0 || posX > canvas.width || 
        posY + tileSize < 0 || posY > canvas.height) {
        return; // Nie rysuj jeśli poza ekranem
    }

    if (type === "wall") {
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(posX, posY, tileSize, tileSize);
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, tileSize, tileSize);
    } else if (type === "floor") {
        ctx.fillStyle = "#d4a574";
        ctx.fillRect(posX, posY, tileSize, tileSize);
        ctx.strokeStyle = "#b8956a";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(posX, posY, tileSize, tileSize);
    } else if (type === "player") {
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#00aa00";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (type === "enemy") {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#aa0000";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else if (type === "item") {
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(posX + tileSize / 4, posY + tileSize / 4, tileSize / 2, tileSize / 2);
        ctx.strokeStyle = "#cccc00";
        ctx.lineWidth = 1;
        ctx.strokeRect(posX + tileSize / 4, posY + tileSize / 4, tileSize / 2, tileSize / 2);
    } else if (type === "goal") {
        ctx.fillStyle = "#0000ff";
        ctx.beginPath();
        ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0000aa";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// =========================
// WCZYTYWANIE POZIOMU
// =========================

function loadLevel(levelIndex) {
    const levelData = generateLevel(levelIndex);

    maze = levelData.maze;
    enemies = JSON.parse(JSON.stringify(levelData.enemies));
    items = JSON.parse(JSON.stringify(levelData.items));

    goal.x = levelData.goal.x;
    goal.y = levelData.goal.y;

    console.log("Cel znajduje się na:", goal.x, goal.y, "- Podłoga?", maze[goal.y][goal.x] === 0);
}

// =========================
// RYSOWANIE LABIRYNTU
// =========================

function drawMaze() {
    // Oblicz widoczny obszar
    const startCol = Math.max(0, Math.floor(camera.x / tileSize));
    const startRow = Math.max(0, Math.floor(camera.y / tileSize));
    const endCol = Math.min(cols, Math.ceil((camera.x + canvas.width) / tileSize));
    const endRow = Math.min(rows, Math.ceil((camera.y + canvas.height) / tileSize));

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            // Sprawdzę czy jest w zasięgu widzenia
            if (!isInVision(col, row)) {
                continue;
            }

            if (maze[row][col] === 1) {
                // Rysuj ścianę
                if (imageStatus.wall) {
                    const screen = worldToScreen(col * tileSize, row * tileSize);
                    ctx.drawImage(
                        wallImage,
                        screen.screenX,
                        screen.screenY,
                        tileSize,
                        tileSize
                    );
                } else {
                    drawTileFallback(col, row, "wall");
                }
            } else {
                // Rysuj podłogę
                if (imageStatus.floor) {
                    const screen = worldToScreen(col * tileSize, row * tileSize);
                    ctx.drawImage(
                        floorImage,
                        screen.screenX,
                        screen.screenY,
                        tileSize,
                        tileSize
                    );
                } else {
                    drawTileFallback(col, row, "floor");
                }
            }
        }
    }
}

// =========================
// RYSOWANIE GRACZA
// =========================

function drawPlayer() {
    const screen = worldToScreen(player.x * tileSize, player.y * tileSize);
    const textureName = getPlayerTexture();
    const texture = playerTextures[textureName];

    if (playerImageStatus[textureName] && texture) {
        ctx.drawImage(
            texture,
            screen.screenX,
            screen.screenY,
            tileSize,
            tileSize
        );
    } else {
        // Fallback - jeśli tekstura się nie załadowała
        const posX = screen.screenX;
        const posY = screen.screenY;
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(posX + tileSize / 2, posY + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#00aa00";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// =========================
// RYSOWANIE PRZEDMIOTÓW
// =========================

function drawItems() {
    items.forEach(function(item) {
        // Sprawdzę widoczność
        if (!isInVision(item.x, item.y)) {
            return;
        }

        const screen = worldToScreen(item.x * tileSize, item.y * tileSize);
        
        if (imageStatus.item) {
            ctx.drawImage(
                itemImage,
                screen.screenX,
                screen.screenY,
                tileSize,
                tileSize
            );
        } else {
            drawTileFallback(item.x, item.y, "item");
        }
    });
}

// =========================
// RYSOWANIE PRZECIWNIKÓW
// =========================

function drawEnemies() {
    enemies.forEach(function(enemy) {
        // Sprawdzę widoczność
        if (!isInVision(enemy.x, enemy.y)) {
            return;
        }

        const screen = worldToScreen(enemy.x * tileSize, enemy.y * tileSize);
        
        if (imageStatus.enemy) {
            ctx.drawImage(
                enemyImage,
                screen.screenX,
                screen.screenY,
                tileSize,
                tileSize
            );
        } else {
            drawTileFallback(enemy.x, enemy.y, "enemy");
        }
    });
}

// =========================
// RYSOWANIE METY
// =========================

function drawGoal() {
    // Sprawdzę widoczność
    if (!isInVision(goal.x, goal.y)) {
        return;
    }

    const screen = worldToScreen(goal.x * tileSize, goal.y * tileSize);
    
    if (imageStatus.goal) {
        ctx.drawImage(
            goalImage,
            screen.screenX,
            screen.screenY,
            tileSize,
            tileSize
        );
    } else {
        drawTileFallback(goal.x, goal.y, "goal");
    }
}

// =========================
// RYSOWANIE STRZAŁKI WSKAZUJĄCEJ CEL
// =========================

function drawDirectionArrow() {
    const playerScreenX = canvas.width / 2;
    const playerScreenY = canvas.height / 2;
    
    // Oblicz kierunek do celu
    const dx = goal.x - player.x;
    const dy = goal.y - player.y;
    const angle = Math.atan2(dy, dx);
    
    // Odległość strzałki od gracza
    const arrowDistance = visionRadius * tileSize * 0.8;
    
    // Pozycja strzałki na brzegu koła widzenia
    const arrowX = playerScreenX + Math.cos(angle) * arrowDistance;
    const arrowY = playerScreenY + Math.sin(angle) * arrowDistance;
    
    // Rysuj strzałkę
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle);
    
    // Kolory strzałki
    ctx.fillStyle = "#ffff00";
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 3;
    
    // Rysuj trójkąt (strzałka)
    ctx.beginPath();
    ctx.moveTo(15, 0);        // Czubek strzałki
    ctx.lineTo(-10, -10);     // Lewa podstawa
    ctx.lineTo(-5, 0);        // Wewnątrz
    ctx.lineTo(-10, 10);      // Prawa podstawa
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    // Rysuj dystans do celu
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CEL: " + distance + " pól", arrowX, arrowY + 25);
}

// =========================
// RYSOWANIE CIENIA (FOG OF WAR) - PORUSZAJĄCEGO SIĘ Z GRACZEM
// =========================

function drawShadow() {
    // Pozycja gracza na ekranie
    const playerScreenX = canvas.width / 2;
    const playerScreenY = canvas.height / 2;
    const lightRadius = visionRadius * tileSize;

    // Narysuj czarny cień na całym ekranie
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    // Radialne oświetlenie wokół gracza
    const gradient = ctx.createRadialGradient(
        playerScreenX, playerScreenY, lightRadius * 0.5,
        playerScreenX, playerScreenY, lightRadius * 1.2
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");      // Środek transparentny (jasny)
    gradient.addColorStop(1, "rgba(0,0,0,0.8)");    // Krawędź ciemna

    // Użyj trybu kompozycji aby "odkryć" światło
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, lightRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
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
                message.innerText = "Koniec gry - Przegrałeś!";
                gameActive = false;
            }
        }
    });
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

    if (currentLevel >= totalLevels) {
        message.innerText = "Wygrana! Ukończyłeś wszystkie 5 poziomów!";
        gameActive = false;
        return;
    }

    loadLevel(currentLevel);

    player.x = 1;
    player.y = 1;

    updateUI();

    message.innerText = "Poziom " + (currentLevel + 1) + " z " + totalLevels;

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
    // Wyczyść canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zaktualizuj kamerę
    updateCamera();

    drawMaze();
    drawGoal();
    drawItems();
    drawEnemies();
    drawPlayer();

    collectItems();
    checkEnemyCollision();
    checkGoal();

    // Rysuj cień (fog of war) - porusza się z graczem
    drawShadow();
    
    // Rysuj strzałkę wskazującą cel
    drawDirectionArrow();
}

// =========================
// STEROWANIE GRACZEM - RUCH I ATAK
// =========================

window.addEventListener("keydown", function(event) {
    if (!gameActive) return;

    // Obsługa punchingu
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
        punch("right"); // E = punch w prawo
        return;
    }

    if (event.key === "q" || event.key === "Q") {
        event.preventDefault();
        punch("left"); // Q = punch w lewo
        return;
    }

    let newX = player.x;
    let newY = player.y;
    let moved = false;

    if (event.key === "ArrowLeft" || event.key === "a") {
        newX--;
        player.direction = "left";
        moved = true;
    }

    if (event.key === "ArrowRight" || event.key === "d") {
        newX++;
        player.direction = "right";
        moved = true;
    }

    if (event.key === "ArrowUp" || event.key === "w") {
        newY--;
        player.direction = "up";
        moved = true;
    }

    if (event.key === "ArrowDown" || event.key === "s") {
        newY++;
        player.direction = "down";
        moved = true;
    }

    // Sprawdzenie granic i kolizji
    if (newY >= 0 && newY < rows && newX >= 0 && newX < cols) {
        if (maze[newY][newX] === 0) {
            player.x = newX;
            player.y = newY;
            player.isMoving = true;
            player.animationFrame++;
        }
    }

    // Jeśli próbujemy się poruszyć, ale nie możemy (ściana), ustawiamy tylko kierunek
    if (moved && (newY < 0 || newY >= rows || newX < 0 || newX >= cols || maze[newY][newX] !== 0)) {
        player.isMoving = false;
    }

    drawGame();
});

// =========================
// OBSŁUGA KEYUP - KONIEC RUCHU
// =========================

window.addEventListener("keyup", function(event) {
    if (!gameActive) return;

    // Jeśli zwolnili klawisz, postać przestaje się poruszać
    if (event.key === "ArrowLeft" || event.key === "a" ||
        event.key === "ArrowRight" || event.key === "d" ||
        event.key === "ArrowUp" || event.key === "w" ||
        event.key === "ArrowDown" || event.key === "s") {
        player.isMoving = false;
        player.animationFrame = 0;
    }

    drawGame();
});

// =========================
// RUCH PRZECIWNIKÓW CO 1 SEKUNDĘ
// =========================

function startEnemyMovement() {
    if (enemyInterval) clearInterval(enemyInterval);
    enemyInterval = setInterval(function() {
        if (gameActive) {
            moveEnemies();
            updatePunchState();
            drawGame();
        }
    }, 1000);
}

// =========================
// START GRY
// =========================

startButton.addEventListener("click", function() {
    document.getElementById("startScreen").style.display = "none";

    message.innerText = "Poziom 1 z " + totalLevels;

    gameActive = true;
    currentLevel = 0;
    player.x = 1;
    player.y = 1;
    player.hp = 100;
    player.items = 0;
    player.direction = "down";
    player.isMoving = false;
    player.animationFrame = 0;
    player.isPunching = false;
    player.punchDirection = null;

    loadLevel(currentLevel);
    updateUI();
    drawGame();
    startEnemyMovement();

    console.log("=== GRA URUCHOMIONA ===");
    console.log("Rozmiar labiryntu:", cols + "x" + rows);
    console.log("Rozmiar płytki:", tileSize);
    console.log("Radius widzenia:", visionRadius, "kratek");
    console.log("Sterowanie: Strzałki/WASD - ruch, Q - punch lewo, E - punch prawo");
});

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
    player.direction = "down";
    player.isMoving = false;
    player.animationFrame = 0;
    player.isPunching = false;
    player.punchDirection = null;

    message.innerText = "";
    gameActive = true;

    loadLevel(currentLevel);
    updateUI();
    drawGame();
    startEnemyMovement();

    console.log("=== GRA ZRESTARTOWANA ===");
});
