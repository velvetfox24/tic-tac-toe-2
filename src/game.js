// State Definitions
let currentPlayer = 'X';                 // Current active player: 'X' or 'O'
let activeBoardIndex = null;            // Index (0-8) of forced board, or null for Free Choice
let globalGrid = Array(9).fill(null)    // 9x9 matrix tracking all 81 cell states
    .map(() => Array(9).fill(null)); 
let localWinners = Array(9).fill(null); // Tracks winners of boards 0-8 ('X', 'O', 'DRAW', or null)
let gameOver = false;                   // Global game completion flag

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8], // Rows
  [0,3,6], [1,4,7], [2,5,8], // Columns
  [0,4,8], [2,4,6]          // Diagonals
];

// Human-readable names for grid indexes (0-8)
const positionNames = [
  "Top-Left", "Top-Center", "Top-Right",
  "Middle-Left", "Center", "Middle-Right",
  "Bottom-Left", "Bottom-Center", "Bottom-Right"
];

// DOM Cache
let globalBoardEl;
let playerBadgeEl;
let instructionTextEl;
let globalOverlayEl;
let globalWinnerTextEl;
let globalWinnerSubEl;
let rulesModalEl;
let rulesBtnEl;
let resetBtnEl;
let modalCloseBtnEl;

// Document Ready Setup
document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  globalBoardEl = document.getElementById("global-board");
  playerBadgeEl = document.getElementById("player-badge");
  instructionTextEl = document.getElementById("instruction-text");
  globalOverlayEl = document.getElementById("global-overlay");
  globalWinnerTextEl = document.getElementById("global-winner-text");
  globalWinnerSubEl = document.getElementById("global-winner-sub");
  
  rulesModalEl = document.getElementById("rules-modal");
  rulesBtnEl = document.getElementById("rules-btn");
  resetBtnEl = document.getElementById("reset-btn");
  modalCloseBtnEl = document.getElementById("modal-close-btn");

  // Setup event listeners
  if (rulesBtnEl) rulesBtnEl.addEventListener("click", openRules);
  if (resetBtnEl) resetBtnEl.addEventListener("click", initGame);
  if (modalCloseBtnEl) modalCloseBtnEl.addEventListener("click", closeRules);
  if (rulesModalEl) {
    rulesModalEl.addEventListener("click", (e) => {
      if (e.target === rulesModalEl) closeRules();
    });
  }

  // Initialize Game
  initGame();
});

// Modal Logic
function openRules() {
  rulesModalEl.classList.add("show");
}

function closeRules() {
  rulesModalEl.classList.remove("show");
}

// 1. initGame(): Resets board state, active indices, UI status, and grid.
function initGame() {
  currentPlayer = 'X';
  activeBoardIndex = null;
  globalGrid = Array(9).fill(null).map(() => Array(9).fill(null));
  localWinners = Array(9).fill(null);
  gameOver = false;

  // Clear global overlay
  if (globalOverlayEl) {
    globalOverlayEl.classList.remove("show");
    globalOverlayEl.className = "global-overlay"; // Reset classes
  }

  // Generate Board DOM
  if (globalBoardEl) {
    globalBoardEl.innerHTML = "";
    
    for (let b = 0; b < 9; b++) {
      // Create local board container
      const boardDiv = document.createElement("div");
      boardDiv.className = "local-board";
      boardDiv.setAttribute("data-board-index", b);
      
      // Create 9 cells inside the local board
      for (let c = 0; c < 9; c++) {
        const cellDiv = document.createElement("button");
        cellDiv.className = "cell";
        cellDiv.setAttribute("data-cell-index", c);
        cellDiv.setAttribute("aria-label", `Board ${positionNames[b]}, Cell ${positionNames[c]}`);
        cellDiv.addEventListener("click", () => handleCellClick(b, c));
        boardDiv.appendChild(cellDiv);
      }

      // Create Local Board Overlay (hidden by default)
      const overlayDiv = document.createElement("div");
      overlayDiv.className = "board-overlay";
      
      const markDiv = document.createElement("div");
      markDiv.className = "board-overlay-mark";
      
      const labelDiv = document.createElement("div");
      labelDiv.className = "board-overlay-label";
      
      overlayDiv.appendChild(markDiv);
      overlayDiv.appendChild(labelDiv);
      boardDiv.appendChild(overlayDiv);

      globalBoardEl.appendChild(boardDiv);
    }
  }

  renderBoard();
}

// 2. checkLineWin(board): Checks any 9-element array against winPatterns for 'X', 'O', or 'DRAW'.
function checkLineWin(board) {
  // Check for win patterns
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Returns 'X' or 'O'
    }
  }
  
  // Check for draw (if no empty/null elements remain)
  if (board.every(cell => cell !== null)) {
    return 'DRAW';
  }
  
  return null; // Not won yet, still playable
}

// 3. handleCellClick(boardIdx, cellIdx): Validates move, updates state, checks local/global wins, updates forced board index, and triggers re-render.
function handleCellClick(boardIdx, cellIdx) {
  if (gameOver) return;

  // Validation:
  // 1. Is this board active (forced)?
  if (activeBoardIndex !== null && activeBoardIndex !== boardIdx) {
    return; // Player did not play on the forced board
  }

  // 2. Is this local board already won or drawn?
  if (localWinners[boardIdx] !== null) {
    return; 
  }

  // 3. Is the cell already occupied?
  if (globalGrid[boardIdx][cellIdx] !== null) {
    return;
  }

  // Execute Move
  globalGrid[boardIdx][cellIdx] = currentPlayer;

  // Check Local Board Status
  const localResult = checkLineWin(globalGrid[boardIdx]);
  if (localResult) {
    localWinners[boardIdx] = localResult;
    
    // Check Global Win Status (based on local board winners)
    const globalResult = checkLineWin(localWinners);
    if (globalResult) {
      gameOver = true;
      triggerGameOver(globalResult);
      renderBoard();
      return;
    }
  }

  // Calculate Next Active Board (Constraint Rule)
  // The next forced board index is the cell index just played.
  // Exception: If that local board is already won or full (draw), the player gets a Free Choice wildcard (null).
  if (localWinners[cellIdx] !== null) {
    activeBoardIndex = null;
  } else {
    activeBoardIndex = cellIdx;
  }

  // Switch Player
  currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';

  // Render updated board
  renderBoard();
}

// Handle Global Game Over UI
function triggerGameOver(winner) {
  if (!globalOverlayEl) return;

  if (winner === 'X') {
    globalWinnerTextEl.textContent = "Player X Wins!";
    globalWinnerSubEl.textContent = "The global grid has been conquered by Player X.";
    globalOverlayEl.classList.add("won-x");
  } else if (winner === 'O') {
    globalWinnerTextEl.textContent = "Player O Wins!";
    globalWinnerSubEl.textContent = "The global grid has been conquered by Player O.";
    globalOverlayEl.classList.add("won-o");
  } else {
    globalWinnerTextEl.textContent = "It's a Draw!";
    globalWinnerSubEl.textContent = "All local boards have been exhausted with no global alignment.";
    globalOverlayEl.classList.add("draw");
  }
  
  globalOverlayEl.classList.add("show");
}

// 4. renderBoard(): Generates dynamic DOM grid, highlights forced/active boards, applies overlay markers to won local boards, and updates turn indicators.
function renderBoard() {
  if (!globalBoardEl) return;

  const boards = globalBoardEl.getElementsByClassName("local-board");

  for (let b = 0; b < 9; b++) {
    const boardEl = boards[b];
    const cells = boardEl.getElementsByClassName("cell");
    const overlayEl = boardEl.querySelector(".board-overlay");
    const markEl = overlayEl.querySelector(".board-overlay-mark");
    const labelEl = overlayEl.querySelector(".board-overlay-label");

    // A. Sync cell states
    for (let c = 0; c < 9; c++) {
      const cellEl = cells[c];
      const state = globalGrid[b][c];
      
      // Update cell text
      cellEl.textContent = state || "";
      
      // Update cell classes
      cellEl.classList.remove("cell-x", "cell-o");
      if (state === 'X') cellEl.classList.add("cell-x");
      if (state === 'O') cellEl.classList.add("cell-o");

      // Update accessibility attributes
      if (state) {
        cellEl.setAttribute("aria-disabled", "true");
        cellEl.setAttribute("tabindex", "-1");
      } else {
        cellEl.removeAttribute("aria-disabled");
        cellEl.setAttribute("tabindex", "0");
      }
    }

    // B. Handle Local Overlay for Won/Drawn Boards
    const winner = localWinners[b];
    overlayEl.className = "board-overlay"; // Reset overlay classes
    
    if (winner !== null) {
      overlayEl.classList.add("show");
      if (winner === 'X') {
        overlayEl.classList.add("won-x");
        markEl.textContent = "X";
        labelEl.textContent = "Board Won";
      } else if (winner === 'O') {
        overlayEl.classList.add("won-o");
        markEl.textContent = "O";
        labelEl.textContent = "Board Won";
      } else {
        overlayEl.classList.add("draw");
        markEl.textContent = "=";
        labelEl.textContent = "Board Draw";
      }
      boardEl.classList.add("inactive");
      boardEl.classList.remove("active-x", "active-o", "active-wildcard");
    } else {
      // Board is not won/drawn. Check active indicators if game is still running
      overlayEl.classList.remove("show");
      boardEl.classList.remove("inactive", "active-x", "active-o", "active-wildcard");

      if (gameOver) {
        boardEl.classList.add("inactive");
      } else {
        // Highlight logic
        if (activeBoardIndex === null) {
          // Wildcard: All non-won/drawn boards are active!
          boardEl.classList.add("active-wildcard");
        } else if (activeBoardIndex === b) {
          // Forced board
          boardEl.classList.add(currentPlayer === 'X' ? 'active-x' : 'active-o');
        } else {
          // Inactive board
          boardEl.classList.add("inactive");
        }
      }
    }
  }

  // C. Update Top Status Panel
  if (playerBadgeEl) {
    playerBadgeEl.textContent = `Player ${currentPlayer}`;
    playerBadgeEl.className = `player-badge player-${currentPlayer.toLowerCase()}`;
  }

  if (instructionTextEl) {
    if (gameOver) {
      instructionTextEl.innerHTML = "<span>Game Over!</span>";
    } else if (activeBoardIndex === null) {
      instructionTextEl.innerHTML = `Wildcard! Player <span class="highlight-${currentPlayer.toLowerCase()}">${currentPlayer}</span> can play on <span>ANY</span> active board.`;
    } else {
      const positionName = positionNames[activeBoardIndex];
      instructionTextEl.innerHTML = `Player <span class="highlight-${currentPlayer.toLowerCase()}">${currentPlayer}</span> is forced to play in the <span>${positionName}</span> board.`;
    }
  }
}
