import { Board, Player, WinLine } from './types';

export const WINNING_COMBINATIONS: WinLine[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export function checkWinner(board: Board): { winner: Player | null, winLine: WinLine | null } {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winLine: combination };
    }
  }
  return { winner: null, winLine: null };
}

export function isDraw(board: Board): boolean {
  return board.every(cell => cell !== null);
}

export function getInitialBoard(): Board {
  return Array(9).fill(null);
}
