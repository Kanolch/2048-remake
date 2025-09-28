document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('grid-container');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');
  const gameOverEl = document.getElementById('game-over');
  const restartBtn = document.getElementById('restart-btn');

  const winModal = document.getElementById('win-modal');
  const winRestartBtn = document.getElementById('win-restart-btn');
  const winContinueBtn = document.getElementById('win-continue-btn');

  let board = Array(16).fill(0);
  let score = 0;
  let highScore = localStorage.getItem('highScore') || 0;
  highScoreEl.textContent = highScore;
  let hasWon = false;

  function createBoard() {
    gridContainer.innerHTML = '';
    board.forEach(val => {
      const tile = document.createElement('div');
      tile.className = `tile tile-${val}`;
      tile.textContent = val === 0 ? '' : val;
      gridContainer.appendChild(tile);
    });
  }

  function generateTile() {
    const empty = board.map((v,i) => v === 0 ? i : null).filter(i => i !== null);
    if (empty.length === 0) return;
    const index = empty[Math.floor(Math.random() * empty.length)];
    board[index] = Math.random() < 0.9 ? 2 : 4;
    createBoard();
  }

  function slide(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1] && arr[i] < 131072) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
        if (arr[i] === 2048 && !hasWon) {
          hasWon = true;
          winModal.classList.remove('hidden');
        }
      }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function moveLeft() {
    for (let i = 0; i < 16; i += 4)
      board.splice(i, 4, ...slide(board.slice(i, i + 4)));
  }
  function moveRight() {
    for (let i = 0; i < 16; i += 4)
      board.splice(i, 4, ...slide(board.slice(i, i + 4).reverse()).reverse());
  }
  function moveUp() {
    for (let i = 0; i < 4; i++) {
      const col = [board[i], board[i + 4], board[i + 8], board[i + 12]];
      const newCol = slide(col);
      for (let j = 0; j < 4; j++) board[i + j * 4] = newCol[j];
    }
  }
  function moveDown() {
    for (let i = 0; i < 4; i++) {
      const col = [board[i], board[i + 4], board[i + 8], board[i + 12]].reverse();
      const newCol = slide(col).reverse();
      for (let j = 0; j < 4; j++) board[i + j * 4] = newCol[j];
    }
  }

  function checkGameOver() {
    if (board.includes(0)) return false;
    for (let i = 0; i < 16; i += 4)
      for (let j = 0; j < 3; j++)
        if (board[i + j] === board[i + j + 1] && board[i + j] < 131072) return false;
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        if (board[i + j * 4] === board[i + (j + 1) * 4] && board[i + j * 4] < 131072) return false;

    gameOverEl.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    return true;
  }

  function restartGame() {
    board = Array(16).fill(0);
    score = 0;
    hasWon = false;
    scoreEl.textContent = score;
    gameOverEl.classList.add('hidden');
    restartBtn.classList.add('hidden');
    winModal.classList.add('hidden');
    createBoard();
    generateTile();
    generateTile();
  }

  document.addEventListener('keydown', e => {
    if (checkGameOver()) return;
    const oldBoard = [...board];
    switch (e.key) {
      case 'ArrowLeft': moveLeft(); break;
      case 'ArrowRight': moveRight(); break;
      case 'ArrowUp': moveUp(); break;
      case 'ArrowDown': moveDown(); break;
      default: return;
    }
    if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
      generateTile();
      scoreEl.textContent = score;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreEl.textContent = highScore;
      }
      checkGameOver();
    }
  });

  // --- Mobile swipe support ---
  const SWIPE_THRESHOLD = 30; // px, adjust for sensitivity
  let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

  gridContainer.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  });

  gridContainer.addEventListener('touchend', function(e) {
    if (e.changedTouches.length === 1) {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > SWIPE_THRESHOLD) {
          moveRight();
        } else if (dx < -SWIPE_THRESHOLD) {
          moveLeft();
        } else {
          return;
        }
      } else {
        // Vertical swipe
        if (dy > SWIPE_THRESHOLD) {
          moveDown();
        } else if (dy < -SWIPE_THRESHOLD) {
          moveUp();
        } else {
          return;
        }
      }

      // After move, same logic as keyboard
      scoreEl.textContent = score;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreEl.textContent = highScore;
      }
      generateTile();
      checkGameOver();
    }
  });

  restartBtn.addEventListener('click', restartGame);

  winRestartBtn.addEventListener('click', () => {
    restartGame();
    winModal.classList.add('hidden');
  });

  winContinueBtn.addEventListener('click', () => {
    winModal.classList.add('hidden');
    // Allow game to continue after win
  });

  // Initialize
  createBoard();
  generateTile();
  generateTile();
});