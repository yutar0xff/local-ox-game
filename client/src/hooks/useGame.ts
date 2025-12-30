import { useEffect, useState, useRef } from 'react';
import { getSocket } from '../infrastructure/socket';
import { GameState, EVENTS, Player } from '@local-ox-game/shared';
import { Socket } from 'socket.io-client';

export const useGame = (roomId: string | null, options: { asSpectator?: boolean } = {}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let currentSocket: Socket | null = null;
    let isMounted = true;

    const setupSocket = async () => {
      try {
        currentSocket = await getSocket();
        socketRef.current = currentSocket;

        if (!currentSocket.connected) {
          currentSocket.connect();
        }

        const onConnect = () => {
          if (isMounted) {
            setIsConnected(true);
            currentSocket?.emit(EVENTS.JOIN_ROOM, { roomId, asSpectator: options.asSpectator });
          }
        };

        const onDisconnect = () => {
          if (isMounted) setIsConnected(false);
        };

        const onUpdateGameState = (game: GameState) => {
          if (isMounted) {
            setGameState(game);
            if (game.players.O === currentSocket?.id) setMyPlayer('O');
            else if (game.players.X === currentSocket?.id) setMyPlayer('X');
            else setMyPlayer(null);
          }
        };

        const onError = ({ message }: { message: string }) => {
          if (isMounted) setError(message);
        };

        currentSocket.on('connect', onConnect);
        currentSocket.on('disconnect', onDisconnect);
        currentSocket.on(EVENTS.UPDATE_GAME_STATE, onUpdateGameState);
        currentSocket.on(EVENTS.ERROR, onError);

        if (currentSocket.connected) {
          currentSocket.emit(EVENTS.JOIN_ROOM, { roomId, asSpectator: options.asSpectator });
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to connect to server');
          console.error(err);
        }
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (currentSocket) {
        currentSocket.off('connect');
        currentSocket.off('disconnect');
        currentSocket.off(EVENTS.UPDATE_GAME_STATE);
        currentSocket.off(EVENTS.ERROR);
        currentSocket.disconnect();
      }
    };
  }, [roomId]);

  const makeMove = (index: number) => {
    if (!roomId || !socketRef.current) return;
    socketRef.current.emit(EVENTS.MAKE_MOVE, { roomId, index });
  };

  const resetGame = () => {
    if (!roomId || !socketRef.current) return;
    socketRef.current.emit(EVENTS.RESET_GAME, { roomId });
  };

  return { gameState, error, isConnected, myPlayer, makeMove, resetGame };
};
