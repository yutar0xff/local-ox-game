export type Player = 'O' | 'X';
export type Cell = Player | null;
export type Board = Cell[];

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type WinLine = [number, number, number];

export interface GameState {
  roomId: string;
  board: Board;
  turn: Player;
  status: GameStatus;
  winner: Player | null;
  winLine: WinLine | null; // 勝った時のライン
  players: {
    O: string | null; // socketId
    X: string | null; // socketId
  };
}

export interface PlayerInfo {
  socketId: string;
  symbol: Player;
}
