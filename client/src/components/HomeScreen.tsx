import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useGame } from '../hooks/useGame';

interface HomeScreenProps {
  onJoin: (roomId: string) => void;
}

interface ServerIpInfo {
  ip: string;
  clientPort: number;
  serverPort: number;
}

export function HomeScreen({ onJoin }: HomeScreenProps) {
  const [inputRoomId, setInputRoomId] = useState('');
  const [serverIp, setServerIp] = useState<string | null>(null);
  const [clientPort, setClientPort] = useState<number>(5173);
  // Generate a random room ID for hosting
  const [hostRoomId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  // Monitor room status as spectator to show player count
  const { gameState } = useGame(hostRoomId, { asSpectator: true });
  const playerCount = gameState ? (gameState.players.O ? 1 : 0) + (gameState.players.X ? 1 : 0) : 0;

  useEffect(() => {
    // Fetch WSL IP address from server
    const fetchServerIp = async () => {
      try {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const serverPort = 3000;
        const response = await fetch(`${protocol}//${hostname}:${serverPort}/api/ip`);
        const data: ServerIpInfo = await response.json();
        if (data.ip) {
          setServerIp(data.ip);
          setClientPort(data.clientPort);
        }
      } catch (error) {
        console.warn('Could not fetch server IP, using localhost:', error);
      }
    };
    fetchServerIp();
  }, []);

  // Use WSL IP if available, otherwise fallback to current host
  const getJoinUrl = () => {
    const roomParam = `?room=${hostRoomId}`;
    if (serverIp) {
      return `http://${serverIp}:${clientPort}${roomParam}`;
    }
    return `${window.location.protocol}//${window.location.host}${roomParam}`;
  };

  const joinUrl = getJoinUrl();

  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-md mx-auto">
      <h1 className="text-4xl font-black text-blue-600 tracking-tight">Tic Tac Toe</h1>

      <div className="w-full bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Host a Game</h2>
        <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
          <QRCode value={joinUrl} size={160} />
        </div>
        <p className="text-sm text-center text-gray-500 break-all px-4">
          Scan to join room: <br/>
          <span className="font-mono font-bold text-gray-700">{hostRoomId}</span>
          <span className="block mt-2 text-blue-600 font-bold">
            Players: {playerCount} / 2
          </span>
          {serverIp && (
            <>
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                IP: {serverIp}:{clientPort}
              </span>
            </>
          )}
        </p>
        <button
          onClick={() => onJoin(hostRoomId)}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold shadow hover:bg-blue-600 transition-colors"
        >
          Enter Room as Host
        </button>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-100 text-gray-500">OR</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Join a Game</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
            placeholder="Enter Room ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={() => inputRoomId && onJoin(inputRoomId)}
            disabled={!inputRoomId}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
