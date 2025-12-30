import { GameState, getInitialBoard } from '@local-ox-game/shared';
import { gameRepository } from '../game.repository';

export class JoinRoomUseCase {
  execute(roomId: string, socketId: string, asSpectator: boolean = false): GameState {
    let game = gameRepository.findById(roomId);

    if (!game) {
      // Create new game
      game = {
        roomId,
        board: getInitialBoard(),
        turn: 'O',
        status: 'waiting',
        winner: null,
        winLine: null,
        players: {
          O: asSpectator ? null : socketId,
          X: null
        }
      };
      gameRepository.create(game);
    } else {
      // Join existing game
      if (asSpectator) {
        // Just return current state for spectators
        return game;
      }

      // Check if re-joining
      if (game.players.O === socketId || game.players.X === socketId) {
         return game;
      }

      // Try to assign player
      const updatedPlayers = { ...game.players };
      if (!updatedPlayers.O) {
        updatedPlayers.O = socketId;
      } else if (!updatedPlayers.X) {
        updatedPlayers.X = socketId;
      } else {
        // Room is full, treat as spectator instead of throwing error
        return game;
      }

      game = {
        ...game,
        players: updatedPlayers,
        status: (updatedPlayers.O && updatedPlayers.X) ? 'playing' : 'waiting'
      };
      gameRepository.update(game);
    }

    return game;
  }
}

export const joinRoomUseCase = new JoinRoomUseCase();
