import { useGame } from '../hooks/useGame';
import { Board } from './Board';

interface GameScreenProps {
  roomId: string;
  onLeave: () => void;
}

export function GameScreen({ roomId, onLeave }: GameScreenProps) {
  const { gameState, error, isConnected, myPlayer, makeMove, resetGame } = useGame(roomId);

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-red-500 text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{error}</p>
        <button onClick={onLeave} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Back to Home
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const playerCount = (gameState.players.O ? 1 : 0) + (gameState.players.X ? 1 : 0);
  const isSpectator = myPlayer === null;
  const isMyTurn = gameState.status === 'playing' && gameState.turn === myPlayer;

  let gameStatusText = '';
  if (gameState.status === 'waiting') {
    gameStatusText = `Waiting for players... (${playerCount}/2)`;
  } else if (gameState.status === 'finished') {
    gameStatusText = gameState.winner ? `Winner: ${gameState.winner}` : 'Draw!';
  } else {
    // playing
    if (isSpectator) {
      gameStatusText = `Turn: ${gameState.turn}`;
    } else {
      gameStatusText = `Turn: ${gameState.turn} ${isMyTurn ? '(You)' : ''}`;
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-md mx-auto">
      <div className="w-full flex justify-between items-center">
        <button onClick={onLeave} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Leave
        </button>
        <span className={`text-sm font-mono ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Room: {roomId}</h2>
        <p className="text-lg font-medium text-gray-700">{gameStatusText}</p>

        {isSpectator ? (
          <p className="text-sm text-blue-500 font-semibold mt-1">Spectating (Host Mode)</p>
        ) : (
          <p className="text-sm text-gray-500">You are: {myPlayer}</p>
        )}

        {gameState.status === 'waiting' && (
          <div className="mt-2 text-xs text-gray-400">
            Players connected: {playerCount}/2
          </div>
        )}
      </div>

      <Board
        board={gameState.board}
        onCellClick={makeMove}
        disabled={isSpectator || !isMyTurn || gameState.status !== 'playing'}
        winLine={gameState.winLine}
      />

      {gameState.status === 'finished' && (
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-blue-500 text-white rounded-full font-bold shadow-md hover:bg-blue-600 transition-transform active:scale-95"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
