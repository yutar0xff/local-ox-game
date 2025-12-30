import { GameState } from '@local-ox-game/shared';

export class GameRepository {
  private games: Map<string, GameState> = new Map();

  create(game: GameState): void {
    this.games.set(game.roomId, game);
  }

  findById(roomId: string): GameState | undefined {
    return this.games.get(roomId);
  }

  update(game: GameState): void {
    this.games.set(game.roomId, game);
  }

  delete(roomId: string): void {
    this.games.delete(roomId);
  }
}

export const gameRepository = new GameRepository();
