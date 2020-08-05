const game = document.getElementById('minesweeper-game');
const gameboard = document.getElementById('minesweeper-gameboard');
const unflaggedCount = document.getElementById('minesweeper-unflagged');
const flaggedCount = document.getElementById('minesweeper-flagged');
let mineCount = 10;
let xRange = 8;
let yRange = 8;
let gameOver = false;
document.getElementById('minesweeper-smallbutton').addEventListener('click', () => {
    game.classList.remove('gameover', 'win');
    mineCount = 10;
    xRange = 8;
    yRange = 8;
    fillBoard();
});
document.getElementById('minesweeper-mediumbutton').addEventListener('click', () => {
    game.classList.remove('gameover', 'win');
    mineCount = 40;
    xRange = 16;
    yRange = 16;
    fillBoard();
});
document.getElementById('minesweeper-largebutton').addEventListener('click', () => {
    game.classList.remove('gameover', 'win');
    mineCount = 99;
    xRange = 30;
    yRange = 16;
    fillBoard();
});
let squares = [];
function fillBoard() {
    gameboard.innerHTML = '';
    squares = [];
    for (let y = 0; y < yRange; y++) {
        squares.push([]);
        let row = document.createElement('tr');
        gameboard.appendChild(row);
        for (let x = 0; x < xRange; x++) {
            const box = document.createElement('td');
            row.appendChild(box);
            box.classList.add('minesquare');
            box.mineX = x;
            box.mineY = y;
            box.addEventListener('click', clickMineSquare);
            box.addEventListener('contextmenu', rightClickMineSquare);
            squares[y].push({
                box: box,
                hasMine: false,
                minedNeighbors: 0,
                isRevealed: false,
                isFlagged: false,
            });
        }
    }
    for (let i = 0; i < mineCount; i++) {
        let coords = getMinedCoords();
        squares[coords[0]][coords[1]].hasMine = true;
        squares[coords[0]][coords[1]].box.classList.add('mined');
        squares[coords[0]][coords[1]].box.innerText = "💣";
        for (let y = -1; y <= 1; y++) {
            const neighborY = coords[0] + y;
            if (neighborY < 0 || neighborY >= yRange) {
                continue;
            }
            for (let x = -1; x <= 1; x++) {
                const neighborX = coords[1] + x;
                if (neighborX < 0 || neighborX >= xRange) {
                    continue;
                }
                squares[neighborY][neighborX].minedNeighbors++;
            }
        }
    }
    for (let y = 0; y < yRange; y++) {
        for (let x = 0; x < xRange; x++) {
            if (!squares[y][x].hasMine) {
                if (squares[y][x].minedNeighbors > 0) {
                    squares[y][x].box.innerText = squares[y][x].minedNeighbors.toString();
                    squares[y][x].box.classList.add(`mines-${squares[y][x].minedNeighbors}`);
                }
            }
        }
    }
    unflaggedCount.innerText = mineCount.toString().padStart(3, '0');
    ;
    flaggedCount.innerText = "000";
    gameOver = false;
}
function getMinedCoords() {
    var x = Math.floor(Math.random() * xRange);
    var y = Math.floor(Math.random() * yRange);
    if (squares[y][x].hasMine) {
        return getMinedCoords();
    }
    return [y, x];
}
function clickMineSquare(event) {
    if (gameOver) {
        return;
    }
    let element = event.target;
    let square = squares[element.mineY][element.mineX];
    if (square.isRevealed) {
        return;
    }
    if (event.button != 0) {
        square.box.classList.add('flagged');
    }
    else {
        clickMineCoords(element.mineX, element.mineY);
    }
    countRevealed();
    event.preventDefault();
    event.stopPropagation();
    return false;
}
function rightClickMineSquare(event) {
    if (gameOver) {
        return;
    }
    let element = event.target;
    let square = squares[element.mineY][element.mineX];
    if (square.isRevealed) {
        clickMineCoords(element.mineX, element.mineY, true);
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    if (!square.isFlagged) {
        square.isFlagged = true;
        square.box.classList.add('flagged');
        unflaggedCount.innerText = Math.max(0, Number.parseInt(unflaggedCount.innerText) - 1).toString().padStart(3, '0');
        flaggedCount.innerText = (Number.parseInt(flaggedCount.innerText) + 1).toString().padStart(3, '0');
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
}
function clickMineCoords(x, y, forceReveal = false) {
    let square = squares[y][x];
    let reveal = forceReveal;
    let safeReveal = forceReveal;
    if (!square.isRevealed) {
        square.isRevealed = true;
        square.box.classList.add('revealed');
        if (square.isFlagged) {
            square.box.classList.remove('flagged');
            unflaggedCount.innerText = Math.min(mineCount, Number.parseInt(unflaggedCount.innerText) + 1).toString().padStart(3, '0');
            flaggedCount.innerText = Math.max(0, Number.parseInt(flaggedCount.innerText) - 1).toString().padStart(3, '0');
        }
        if (square.hasMine) {
            gameOver = true;
            game.classList.add('gameover');
        }
        reveal = reveal || square.minedNeighbors === 0;
    }
    if (reveal) {
        if (safeReveal) {
            let flaggedNeighbors = 0;
            for (let j = -1; j <= 1; j++) {
                const neighborY = y + j;
                if (neighborY < 0 || neighborY >= yRange) {
                    continue;
                }
                for (let i = -1; i <= 1; i++) {
                    const neighborX = x + i;
                    if (neighborX < 0 || neighborX >= xRange
                        || (neighborX === x && neighborY === y)) {
                        continue;
                    }
                    if (squares[neighborY][neighborX].isFlagged) {
                        flaggedNeighbors++;
                    }
                }
            }
            if (flaggedNeighbors < square.minedNeighbors) {
                return;
            }
        }
        for (let j = -1; j <= 1; j++) {
            const neighborY = y + j;
            if (neighborY < 0 || neighborY >= yRange) {
                continue;
            }
            for (let i = -1; i <= 1; i++) {
                const neighborX = x + i;
                if (neighborX < 0 || neighborX >= xRange) {
                    continue;
                }
                if (!safeReveal || !squares[neighborY][neighborX].hasMine) {
                    clickMineCoords(neighborX, neighborY);
                }
            }
        }
    }
}
function countRevealed() {
    let revealed = 0;
    for (let y = 0; y < yRange; y++) {
        for (let x = 0; x < xRange; x++) {
            if (squares[y][x].isRevealed) {
                revealed++;
            }
        }
    }
    if (revealed >= (xRange * yRange) - mineCount) {
        gameOver = true;
        game.classList.add('win');
    }
}
fillBoard();
