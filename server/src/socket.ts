import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { EVENTS, GameState } from '@local-ox-game/shared';
import { joinRoomUseCase } from './usecases/join-room';
import { makeMoveUseCase } from './usecases/make-move';
import { resetGameUseCase } from './usecases/reset-game';

export class SocketServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*", // Allow all for local dev, especially with mobile IP access
        methods: ["GET", "POST"]
      }
    });

    this.setupSocket();
  }

  private setupSocket() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on(EVENTS.JOIN_ROOM, ({ roomId, asSpectator }: { roomId: string, asSpectator?: boolean }) => {
        try {
          const game = joinRoomUseCase.execute(roomId, socket.id, asSpectator);
          socket.join(roomId);
          this.io.to(roomId).emit(EVENTS.UPDATE_GAME_STATE, game);
          console.log(`User ${socket.id} joined room ${roomId} (spectator: ${!!asSpectator})`);
        } catch (error: any) {
          socket.emit(EVENTS.ERROR, { message: error.message });
        }
      });

      socket.on(EVENTS.MAKE_MOVE, ({ roomId, index }: { roomId: string, index: number }) => {
        try {
          const game = makeMoveUseCase.execute(roomId, socket.id, index);
          this.io.to(roomId).emit(EVENTS.UPDATE_GAME_STATE, game);
        } catch (error: any) {
          socket.emit(EVENTS.ERROR, { message: error.message });
        }
      });

      socket.on(EVENTS.RESET_GAME, ({ roomId }: { roomId: string }) => {
        try {
          const game = resetGameUseCase.execute(roomId);
          this.io.to(roomId).emit(EVENTS.UPDATE_GAME_STATE, game);
        } catch (error: any) {
          socket.emit(EVENTS.ERROR, { message: error.message });
        }
      });

      socket.on(EVENTS.DISCONNECT, () => {
        console.log(`User disconnected: ${socket.id}`);
        // TODO: Handle player disconnect (maybe notify other player or auto-forfeit)
      });
    });
  }
}
