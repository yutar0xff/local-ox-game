import { GameState, Player, getInitialBoard, checkWinner, isDraw } from '@local-ox-game/shared';
import { gameRepository } from '../game.repository';

export class MakeMoveUseCase {
  execute(roomId: string, socketId: string, index: number): GameState {
    const game = gameRepository.findById(roomId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'playing') {
      throw new Error('Game is not active');
    }

    const playerSymbol = game.players.O === socketId ? 'O' : game.players.X === socketId ? 'X' : null;
    if (!playerSymbol) {
      throw new Error('Player not in game');
    }

    if (game.turn !== playerSymbol) {
      throw new Error('Not your turn');
    }

    if (game.board[index] !== null) {
      throw new Error('Cell already taken');
    }

    // Clone board to modify
    const newBoard = [...game.board];
    newBoard[index] = playerSymbol;

    const { winner, winLine } = checkWinner(newBoard);
    let status: GameState['status'] = game.status;
    let nextTurn = game.turn;

    if (winner) {
      status = 'finished';
    } else if (isDraw(newBoard)) {
      status = 'finished';
    } else {
      nextTurn = game.turn === 'O' ? 'X' : 'O';
    }

    const updatedGame: GameState = {
      ...game,
      board: newBoard,
      turn: nextTurn,
      status: status,
      winner: winner,
      winLine: winLine
    };

    gameRepository.update(updatedGame);
    return updatedGame;
  }
}

export const makeMoveUseCase = new MakeMoveUseCase();
