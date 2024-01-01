const MAX_DEPTH = 4; // Độ sâu tối đa của thuật toán Minimax
const boardXSize = 15; // Size Wide of the board
const boardYSize = 19; // Size Height of the board
const click = new Audio();
const win = new Audio();

let board = []; // Initialize game board
let isFree = true;
let isWithAI = false;
let isAIturn = false;
let aiChoose = "X";
let currentPlayer = "X";
let selectedCell = null;
let movesHistory = [];
let showtype = false;

const choose = document.querySelector(".type .choose");
const stateActive = document.querySelector(".active");
const undoButton = document.querySelector(".undo");
const tilte = document.querySelector(`.tilte`);
const namepage = document.querySelector(`.tilte .name`);
const turn = document.querySelector(`.button .turn`);
turn.innerText = `Lượt của: ${currentPlayer}`;

stateActive.addEventListener("click", function () {
    showtype = !showtype;

    if (showtype) {
        const free = document.createElement("span");
        free.classList.add("free");
        free.innerText = `👉 Tự do`;
        free.addEventListener("click", function () {
            stateActive.innerText = `Tự do ▼`;
            refresh();
            remove();
        });

        const withAI = document.createElement("span");
        withAI.classList.add("withAI");
        withAI.innerText = `👉 Chơi với máy`;
        withAI.addEventListener("click", function () {
            const setup = document.createElement("div");
            setup.classList.add("setup");

            const turnX = document.createElement("span");
            const turnO = document.createElement("span");
            turnX.classList.add("turnX");
            turnO.classList.add("turnO");
            turnX.innerText = `Máy - X`;
            turnO.innerText = `Bạn - X`;
            turnX.addEventListener("click", function () {
                setupWith("X");
            });
            turnO.addEventListener("click", function () {
                setupWith("O");
            });

            setup.appendChild(turnX);
            setup.appendChild(turnO);
            withAI.appendChild(setup);
        });
        choose.appendChild(free);
        choose.appendChild(withAI);
    } else {
        remove();
    }

    function setupWith(type) {
        stateActive.innerText = `Mode ▼`;
        isFree = false;
        isWithAI = true;
        initializeBoard();
        renderBoard();
        switch (type) {
            case "X":
                currentPlayer = "X";
                turn.innerText = `Máy - X`;
                aiChoose = "X";
                isAIturn = true;
                remove();
                makeMove(9, 7);
                break;
            case "O":
                currentPlayer = "X";
                turn.innerText = `Bạn - X`;
                aiChoose = "O";
                isAIturn = false;
                remove();
                break;
        }
    }

    function remove() {
        showtype = false;
        choose.innerHTML = "";
    }
});

tilte.addEventListener("click", function () {
    location.reload();
});

const refreshbtn = document.querySelector(`.refresh`);
refreshbtn.addEventListener("click", refresh);

function refresh() {
    board = [];
    isFree = true;
    isWithAI = false;
    isAIturn = false;
    aiChoose = "X";
    currentPlayer = "X";
    selectedCell = null;
    movesHistory = [];
    showtype = false;

    namepage.innerText = "CARO.Z";
    turn.innerText = `Lượt của: ${currentPlayer}`;
    initializeBoard();
    renderBoard();
}

// Render
function initializeBoard() {
    for (let j = 0; j < boardYSize; j++) {
        board[j] = [];
        for (let i = 0; i < boardXSize; i++) {
            board[j][i] = "";
        }
    }

    movesHistory = [];
    undoButton.style.display = "none";
    undoButton.removeEventListener("click", undoMove);
}

function renderBoard() {
    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = "";

    click.src = "./sounds/click.mp3";
    win.src = "./sounds/win.mp3";

    for (let j = 0; j < boardYSize; j++) {
        for (let i = 0; i < boardXSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = j;
            cell.dataset.col = i;

            cell.innerText = board[j][i];

            cell.addEventListener("click", function () {
                click.play();
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
            undoButton.removeEventListener("click", undoMove);
            undoButton.addEventListener("click", undoMove);
            undoButton.style.display = "block";
        }
    }
}

// Handle choose
function makeMove(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (isValidMove(row, col)) {
        const move = { row, col, player: currentPlayer }; // Save board state
        movesHistory.push(move); // Save the move to history

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
            win.play();
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        if (!isWithAI) {
            // Chơi tự do
            turn.innerText = `Lượt của: ${currentPlayer}`;
        } else {
            // Chơi với máy -> Chưa hoàn thiện
            if (isAIturn) {
                isAIturn = false;
            } else {
                isAIturn = true;
                console.log(row, col);
                const bestMove = getBestMove(row, col);
                makeMove(bestMove.row, bestMove.col);
            }
        }
    }
}

function undoMove() {
    const lastMove = movesHistory.pop();

    if (movesHistory.length === 0) {
        undoButton.style.display = "none";
        undoButton.removeEventListener("click", undoMove);
    }

    board[lastMove.row][lastMove.col] = ""; // Đặt lại giá trị của ô trên bàn cờ

    const cell = document.querySelector(`.cell[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
    cell.innerHTML = ""; // Xóa hiển thị của ô trên giao diện

    currentPlayer = lastMove.player; // Cập nhật lại currentPlayer với người chơi trước đó

    // Xóa class "moved" khỏi ô undo
    const movedCell = document.querySelector(".cell.moved");
    movedCell.classList.remove("moved");

    currentPlayer = lastMove.player;
    turn.innerText = `Lượt của: ${currentPlayer}`;

    // Thêm class "moved" vào ô trước ô undo
    const movedPrevCell =
        document.querySelector(
            `.cell[data-row="${movesHistory[movesHistory.length - 1]?.row}"][data-col="${movesHistory[movesHistory.length - 1]?.col}"]`
        ) ?? null;
    movedPrevCell && movedPrevCell.classList.add("moved");
}

// Handle wins
function announceWinner(player, row, col, direction) {
    const message = player + " - wins!";
    namepage.innerText = message;

    const overlay = document.createElement("div");
    const box = document.createElement("div");
    overlay.classList.add("overlay");
    box.classList.add("box");
    box.classList.add(`box-${player}`);
    box.innerHTML = `
        <span class="box__title">Trận đấu đã kết thúc</span>
        <div class="box__button">
            <span onclick="endtostart()" >▶ CARO.Z ◀</span>
            <!-- <span>Tiếp trận nữa!</span> -->
        </div>`;
    document.body.appendChild(overlay);
    document.body.appendChild(box);

    highlightWinningLine(player, row, col, direction);
}

function highlightWinningLine(player, row, col, direction) {
    const cellsToHighlight = []; // Mảng lưu trữ các ô trên đường chiến thắng
    cellsToHighlight.push(document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`));

    // Logic để xác định các ô trên đường chiến thắng dựa vào hướng và tọa độ xuất phát
    if (direction === "horizontal") {
        const right = col + 1;
        for (let i = right; i < boardXSize; i++) {
            if (board[row][i] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${row}"][data-col="${i}"]`));
            } else {
                break;
            }
        }
        const left = col - 1;
        for (let i = 0; i <= left; i++) {
            if (board[row][left - i] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${row}"][data-col="${left - i}"]`));
            } else {
                break;
            }
        }
    } else if (direction === "vertical") {
        const down = row + 1;
        for (let i = down; i < boardYSize; i++) {
            if (board[i][col] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${i}"][data-col="${col}"]`));
            } else {
                break;
            }
        }
        const up = row - 1;
        for (let i = 0; i <= up; i++) {
            if (board[up - i][col] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${up - i}"][data-col="${col}"]`));
            } else {
                break;
            }
        }
    } else if (direction === "rightDiagonal") {
        let i = row + 1;
        let j = col + 1;
        while (i < boardYSize && j < boardXSize) {
            if (board[i][j] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`));
            } else {
                break;
            }
            i++;
            j++;
        }
        i = row - 1;
        j = col - 1;
        while (i >= 0 && j >= 0) {
            if (board[i][j] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`));
            } else {
                break;
            }
            i--;
            j--;
        }
    } else if (direction === "leftDiagonal") {
        let i = row + 1;
        let j = col - 1;
        while (i < boardYSize && j >= 0) {
            if (board[i][j] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`));
            } else {
                break;
            }
            i++;
            j--;
        }
        i = row - 1;
        j = col + 1;
        while (i >= 0 && j < boardXSize) {
            if (board[i][j] === player) {
                cellsToHighlight.push(document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`));
            } else {
                break;
            }
            i--;
            j++;
        }
    }

    // Gán class 'winning-cell' cho các ô trên đường chiến thắng
    cellsToHighlight.forEach((cell) => {
        cell.classList.add(`winning-cell-${player}`);
    });
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

    const isHorizontalWin = horizontal >= 5;
    const isVerticalWin = vertical >= 5;
    const isRightDiagonalWin = rightDiagonal >= 5;
    const isLeftDiagonalWin = leftDiagonal >= 5;

    if (isHorizontalWin || isVerticalWin || isRightDiagonalWin || isLeftDiagonalWin) {
        // Xác định hướng chiến thắng từ các biến boolean
        if (isHorizontalWin) {
            announceWinner(player, row, col, "horizontal");
        } else if (isVerticalWin) {
            announceWinner(player, row, col, "vertical");
        } else if (isRightDiagonalWin) {
            announceWinner(player, row, col, "rightDiagonal");
        } else if (isLeftDiagonalWin) {
            announceWinner(player, row, col, "leftDiagonal");
        }
        return true; // Có người chiến thắng
    }

    return false;
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
