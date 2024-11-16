const ROWS = 7; // Alterado para 7 linhas
const COLS = 8; // Mantido 8 colunas
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer = "red";
let ply = 4; // Profundidade inicial
let useAlphaBeta = true; // Algoritmo padrão é Minimax com poda alfa-beta

function createBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", handleMove);
            boardElement.appendChild(cell);
        }
    }
}
function checkWin(player) {
    const directions = [
        { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }
    ];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === player) {
                for (const { x, y } of directions) {
                    if (checkDirection(row, col, x, y, player)) return true;
                }
            }
        }
    }
    return false;
}
function handleMove(e) {
    const col = e.target.dataset.col;
    if (addPiece(col)) {
        if (checkWin(currentPlayer)) {
            console.log(`${currentPlayer} venceu!`);
            resetGame();
        } else {
            currentPlayer = currentPlayer === "red" ? "yellow" : "red";
            if (currentPlayer === "yellow") aiMove();
        }
    }
}

function addPiece(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            board[row][col] = currentPlayer;
            updateBoard();
            return true;
        }
    }
    return false;
}

function aiMove() {
    const startTime = performance.now(); // Medir o tempo inicial

    const bestMove = useAlphaBeta
        ? minimax(board, ply, true, -Infinity, Infinity)
        : minimax(board, ply, true);

    const endTime = performance.now(); // Medir o tempo final
    console.log(`Tempo de execução (${useAlphaBeta ? "Poda Alfa-Beta" : "Minimax"}): ${(endTime - startTime).toFixed(2)} ms`);

    addPiece(bestMove.col);
    if (checkWin("yellow")) {
        console.log("AI venceu!");
        resetGame();
    }
    currentPlayer = "red";
}

function checkDirection(row, col, dx, dy, player) {
    for (let i = 0; i < 4; i++) {
        const r = row + i * dx;
        const c = col + i * dy;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) {
            return false;
        }
    }
    return true;
}

function minimax(board, depth, isMaximizingPlayer, alpha = -Infinity, beta = Infinity) {
    if (depth === 0 || checkWin("yellow") || checkWin("red")) return evaluateBoard(board);
    let bestMove = null;

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let col = 0; col < COLS; col++) {
            const row = getAvailableRow(board, col);
            if (row !== -1) {
                board[row][col] = "yellow";
                const eval = minimax(board, depth - 1, false, alpha, beta);
                board[row][col] = null;
                if (eval > maxEval) {
                    maxEval = eval;
                    bestMove = { row, col };
                }
                if (useAlphaBeta) {
                    alpha = Math.max(alpha, eval);
                    if (beta <= alpha) break;
                }
            }
        }
        return depth === ply ? bestMove : maxEval;
    } else {
        let minEval = Infinity;
        for (let col = 0; col < COLS; col++) {
            const row = getAvailableRow(board, col);
            if (row !== -1) {
                board[row][col] = "red";
                const eval = minimax(board, depth - 1, true, alpha, beta);
                board[row][col] = null;
                if (eval < minEval) {
                    minEval = eval;
                    bestMove = { row, col };
                }
                if (useAlphaBeta) {
                    beta = Math.min(beta, eval);
                    if (beta <= alpha) break;
                }
            }
        }
        return depth === ply ? bestMove : minEval;
    }
}

function getAvailableRow(board, col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) return row;
    }
    return -1;
}

function evaluateBoard(board) {
    let score = 0;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === "yellow") {
                score += getScoreForPosition(row, col, "yellow");
            } else if (board[row][col] === "red") {
                score -= getScoreForPosition(row, col, "red");
            }
        }
    }
    return score;
}

function getScoreForPosition(row, col, player) {
    let score = 0;
    const directions = [
        { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }
    ];
    for (const { x, y } of directions) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
            const r = row + i * x;
            const c = col + i * y;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                count++;
            }
        }
        score += count === 2 ? 10 : count === 3 ? 100 : count === 4 ? 1000 : 0;
    }
    return score;
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    currentPlayer = "red";
    createBoard();
}

function updateBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.className = "cell";
            if (board[row][col]) cell.classList.add(board[row][col]);
        }
    }
}

document.getElementById("reset").addEventListener("click", resetGame);
document.getElementById("ply-input").addEventListener("change", (e) => {
    ply = parseInt(e.target.value);
});

//document.getElementById("algorithm").addEventListener("change", (e) => {
    //useAlphaBeta = e.target.value === "alphabeta";
//});

document.getElementById("algorithm").addEventListener("change", (e) => {
    const selectedValue = e.target.value;
    useAlphaBeta = selectedValue === "alphabeta";
    console.log(`Algoritmo selecionado: ${selectedValue} (${useAlphaBeta ? "Poda Alfa-Beta" : "Minimax"})`);
});


createBoard();
