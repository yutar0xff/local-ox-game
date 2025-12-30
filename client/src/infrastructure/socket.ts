import { io, Socket } from 'socket.io-client';

const PORT = 3000;

// Cache server IP to avoid repeated fetches
let cachedServerIp: string | null = null;

async function getServerHostname(): Promise<string> {
  // If we're on localhost, stick to localhost for stability on the host machine
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.hostname;
  }

  // If accessing via IP (e.g., from mobile), use that IP
  // We don't need to fetch IP from server anymore because if we can load the page,
  // we are already using the correct IP/hostname.
  return window.location.hostname;
}

export const getSocket = async (): Promise<Socket> => {
  const hostname = await getServerHostname();
  const SERVER_URL = `http://${hostname}:${PORT}`;

  return io(SERVER_URL, {
    autoConnect: false,
  });
};
