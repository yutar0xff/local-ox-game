import { Board as BoardType, WinLine } from '@local-ox-game/shared';

interface BoardProps {
  board: BoardType;
  onCellClick: (index: number) => void;
  disabled: boolean;
  winLine: WinLine | null;
}

export function Board({ board, onCellClick, disabled, winLine }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto">
      {board.map((cell, index) => {
        const isWinningCell = winLine?.includes(index);
        return (
          <button
            key={index}
            className={`
              h-20 text-4xl font-bold flex items-center justify-center rounded-lg shadow-sm transition-colors
              ${cell === 'O' ? 'text-blue-500 bg-white' : cell === 'X' ? 'text-red-500 bg-white' : 'bg-gray-200 hover:bg-gray-300'}
              ${isWinningCell ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''}
              ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onCellClick(index)}
            disabled={disabled || cell !== null}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
}
