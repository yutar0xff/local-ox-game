import { GameState, getInitialBoard } from '@local-ox-game/shared';
import { gameRepository } from '../game.repository';

export class ResetGameUseCase {
  execute(roomId: string): GameState {
    const game = gameRepository.findById(roomId);
    if (!game) {
      throw new Error('Game not found');
    }

    const updatedGame: GameState = {
      ...game,
      board: getInitialBoard(),
      turn: 'O',
      status: (game.players.O && game.players.X) ? 'playing' : 'waiting',
      winner: null,
      winLine: null
    };

    gameRepository.update(updatedGame);
    return updatedGame;
  }
}

export const resetGameUseCase = new ResetGameUseCase();
