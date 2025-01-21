// Sudoku utilities
export function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

export function solveSudoku(board: number[][]): boolean {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }

  if (!isEmpty) return true;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = 0;
    }
  }

  return false;
}

export function generateSudoku(): number[][] {
  const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill diagonal boxes first
  for (let box = 0; box < 9; box += 3) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let num;
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isValid(board, box + i, box + j, num));
        board[box + i][box + j] = num;
      }
    }
  }

  solveSudoku(board);

  // Remove numbers to create puzzle
  const clues = 30; // Adjust difficulty by changing number of clues
  let count = 81 - clues;
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      count--;
    }
  }

  return board;
}