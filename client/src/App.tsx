import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';

function App() {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for room
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomId(room);
    }
  }, []);

  const handleJoin = (id: string) => {
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    window.history.pushState({}, '', url);
    setRoomId(id);
  };

  const handleLeave = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url);
    setRoomId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 font-sans text-gray-900">
      {roomId ? (
        <GameScreen roomId={roomId} onLeave={handleLeave} />
      ) : (
        <HomeScreen onJoin={handleJoin} />
      )}
    </div>
  );
}

export default App;
