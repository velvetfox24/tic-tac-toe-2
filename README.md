# Ultimate Tic-Tac-Toe (Tic-Tac-Toe Lvl 2)

A clean, modern, and highly responsive web implementation of **Ultimate Tic-Tac-Toe** (also known as Tic-Tac-Toe Lvl 2). It features beautiful glassmorphism-inspired dark-mode styling, glowing active board indicators, local/global grid win overlays, and keyboard accessibility.

---

## 🎮 Play Online & Live Demo
This project is configured with GitHub Actions to automatically deploy to GitHub Pages. Once pushed to your GitHub repository, the game will be available at:
`https://<your-username>.github.io/<your-repo-name>/`

---

## 📖 Game Rules

Ultimate Tic-Tac-Toe elevates the classic 3x3 game by nesting it inside itself.

### A. The Grid Hierarchy
* **Global Grid:** A $3 \times 3$ grid composed of 9 local boards ($B_0$ through $B_8$).
* **Local Boards:** Each local board consists of a $3 \times 3$ grid of individual cells ($C_0$ through $C_8$), giving 81 total playable positions.

### B. The Move Link Rule
* Wherever a player places their mark within a local board, the **relative position** of that cell dictates which local board the next player is forced to play in.
* *Example:* If Player X places a mark in the **Top-Right** cell of any local board, Player O is forced to make their next move inside the **Top-Right** local board on the global grid.

### C. Wildcard State (Free Choice)
* If a move directs a player to a local board that is already won or completely filled (a draw), the targeting constraint is cleared.
* The player receives a **Free Choice** wildcard and can play in any open cell on any active board on the global grid.

### D. Win Conditions
* **Local Win:** A local board is won by securing 3 cells in a row (horizontal, vertical, or diagonal). Once won, it displays a large, stylized overlay of the winning player's symbol ('X' or 'O').
* **Global Win:** A player wins the overall game by securing 3 local boards in a row on the global grid.

---

## 🛠️ Project Structure

```
ultimate-tic-tac-toe/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated deployment workflow
├── src/
│   ├── index.html              # Main HTML markup entry point
│   ├── styles.css              # Custom styling, dark mode rules, responsive layouts
│   └── game.js                 # State engine, win checks, and DOM rendering logic
├── .gitignore                  # Git ignore patterns for modern web developments
├── LICENSE                     # MIT License
└── README.md                   # Complete game documentation & guide (this file)
```

---

## ⚙️ Architecture & Logic

The application follows a clean, single-page state pattern without complex external dependencies:

1. **State Tracking (`game.js`):**
   * `currentPlayer`: Tracks turns (`'X'` or `'O'`).
   * `activeBoardIndex`: Integer index (`0-8`) identifying the forced local board, or `null` for Free Choice.
   * `globalGrid`: A 2D array of size $9 \times 9$ representing all 81 individual cells.
   * `localWinners`: Array of size 9 tracking the winner state of each board (`'X'`, `'O'`, `'DRAW'`, or `null`).
   * `gameOver`: Boolean flag indicating if the global game has finished.
2. **Move Validation:**
   Click events are validated against the forced `activeBoardIndex`, the local board completion status, and cell vacancy before applying the move.
3. **Win Pattern Check:**
   A standard linear pattern matcher compares local arrays and the global board states against 8 predefined win combinations (3 rows, 3 columns, 2 diagonals).
4. **DOM Synchronization:**
   The `renderBoard()` function updates DOM elements dynamically, applying glow animations to active targets, dimming inactive sections, and overlaying completed grids.

---

## 🚀 Local Preview Instructions

Since the game is built using vanilla web technologies, you can run it locally without any installation or compile steps:

### Option 1: Direct File Opening
Simply open `src/index.html` directly in any modern web browser.

### Option 2: Python Local Server (Recommended)
If you want to run it via a local HTTP server:
1. Open your terminal in the project directory.
2. Start Python's built-in HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000/src/](http://localhost:8000/src/)

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
