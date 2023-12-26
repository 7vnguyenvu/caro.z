const boardXSize = 15; // Size Wide of the board
const boardYSize = 19; // Size Height of the board
let board = []; // Initialize game board
let currentPlayer = "X"; // Starting player
let selectedCell = null;

const tilte = document.querySelector(`.tilte`);
const namepage = document.querySelector(`.tilte .name`);
const turn = document.querySelector(`.button .turn`);
turn.innerText = `Lượt của: ${currentPlayer}`;

tilte.addEventListener("click", function () {
    location.reload();
});

function refresh() {
    currentPlayer = "X";
    namepage.innerText = "CARO.Z";
    turn.innerText = `Lượt của: ${currentPlayer}`;
    initializeBoard();
    renderBoard();
}

const refreshbtn = document.querySelector(`.refresh`);
refreshbtn.addEventListener("click", refresh);

// Render
function initializeBoard() {
    for (let j = 0; j < boardYSize; j++) {
        board[j] = [];
        for (let i = 0; i < boardXSize; i++) {
            board[j][i] = "";
        }
    }
}

function renderBoard() {
    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = "";

    const audio = new Audio();
    audio.src = "./sounds/click.mp3";

    for (let j = 0; j < boardYSize; j++) {
        for (let i = 0; i < boardXSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = j;
            cell.dataset.col = i;

            cell.innerText = board[j][i];

            cell.addEventListener("click", function () {
                audio.play();
                handleCellClick(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
            });

            gameBoard.appendChild(cell);
        }
    }
}

function isValidMove(row, col) {
    return board[row][col] === "";
}
function handleCellClick(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (selectedCell === null) {
        selectedCell = cell;
        cell.classList.add("seeing");
    } else {
        selectedCell.classList.remove("seeing");
        if (selectedCell !== cell) {
            selectedCell = cell;
            cell.classList.add("seeing");
        } else {
            makeMove(row, col);
            selectedCell = null;
            cell.classList.remove("seeing");
        }
    }
}

// Handle choose
function makeMove(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (isValidMove(row, col)) {
        // Xóa class "moved" khỏi ô hiện tại nếu có
        const movedCells = document.querySelectorAll(".cell.moved");
        movedCells.forEach((movedCell) => {
            movedCell.classList.remove("moved");
        });

        board[row][col] = currentPlayer;

        cell.innerHTML =
            currentPlayer === "X" ? '<img src="./images/black.svg" width="22px" alt="X" />' : '<img src="./images/white.svg" width="24px" alt="O" />';

        // Thêm class cho ô vừa được chọn sau khi makeMove
        cell.classList.add("moved");

        if (checkWinner(row, col, currentPlayer)) {
            // initializeBoard();
            // renderBoard();
            // alert(currentPlayer + " wins!");
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        turn.innerText = `Lượt của: ${currentPlayer}`;
    }
}

// Handle wins
function announceWinner(player) {
    const message = player + " - wins!";
    namepage.innerText = message;

    const overlay = document.createElement("div");
    const box = document.createElement("div");
    overlay.classList.add("overlay");
    box.classList.add("box");
    box.innerHTML = `
        <span class="box__title">Trận đấu đã kết thúc</span>
        <div class="box__button">
            <span onclick="endtostart()" >▶ CARO.Z ◀</span>
            <!-- <span>Tiếp trận nữa!</span> -->
        </div>`;
    document.body.appendChild(overlay);
    document.body.appendChild(box);
}

function endtostart() {
    const overlay = document.querySelector(".overlay");
    const box = document.querySelector(".box");
    if (overlay && box) {
        overlay.remove();
        box.remove();
    }
    refresh();
}

function checkWinner(row, col, player) {
    const horizontal = getHorizontal(row, col, player);
    const vertical = getVertical(row, col, player);
    const rightDiagonal = getRightDiagonal(row, col, player);
    const leftDiagonal = getLeftDiagonal(row, col, player);

    const isWinner = horizontal >= 5 || vertical >= 5 || rightDiagonal >= 5 || leftDiagonal >= 5;

    if (isWinner) {
        // gắn cờ cho các đường win để hiện lên theo màu win của player
        announceWinner(player);
    }

    return isWinner;
}

function getHorizontal(y, x, player) {
    let count = 1;

    const right = x + 1;
    for (let i = right; i < boardXSize; i++) {
        if (board[y][i] === "") {
            break;
        } else if (board[y][i] === player) {
            count++;
        } else {
            break;
        }
    }

    const left = x - 1;
    for (let i = 0; i <= left; i++) {
        if (board[y][left - i] === player) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

function getVertical(y, x, player) {
    let count = 1;

    // Check downwards
    const down = y + 1;
    for (let i = down; i < boardYSize; i++) {
        if (board[i][x] === "") {
            break;
        } else if (board[i][x] === player) {
            count++;
        } else {
            break;
        }
    }

    // Check upwards
    const up = y - 1;
    for (let i = 0; i <= up; i++) {
        if (board[up - i][x] === player) {
            count++;
        } else {
            break;
        }
    }

    return count;
}

function getRightDiagonal(y, x, player) {
    let count = 1;

    // Check bottom-right diagonal
    let i = y + 1;
    let j = x + 1;
    while (i < boardYSize && j < boardXSize) {
        if (board[i][j] === "") {
            break;
        } else if (board[i][j] === player) {
            count++;
        } else {
            break;
        }
        i++;
        j++;
    }

    // Check top-left diagonal
    i = y - 1;
    j = x - 1;
    while (i >= 0 && j >= 0) {
        if (board[i][j] === "") {
            break;
        } else if (board[i][j] === player) {
            count++;
        } else {
            break;
        }
        i--;
        j--;
    }

    return count;
}

function getLeftDiagonal(y, x, player) {
    let count = 1;

    // Check bottom-left diagonal
    let i = y + 1;
    let j = x - 1;
    while (i < boardYSize && j >= 0) {
        if (board[i][j] === "") {
            break;
        } else if (board[i][j] === player) {
            count++;
        } else {
            break;
        }
        i++;
        j--;
    }

    // Check top-right diagonal
    i = y - 1;
    j = x + 1;
    while (i >= 0 && j < boardXSize) {
        if (board[i][j] === "") {
            break;
        } else if (board[i][j] === player) {
            count++;
        } else {
            break;
        }
        i--;
        j++;
    }

    return count;
}

initializeBoard();
renderBoard();
