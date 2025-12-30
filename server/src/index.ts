import http from 'http';
import os from 'os';
import { SocketServer } from './socket';

const PORT = process.env.PORT || 3000;
const CLIENT_PORT = process.env.CLIENT_PORT || 5173;

// Get WSL IP address (eth0 interface)
function getWslIpAddress(): string | null {
  const interfaces = os.networkInterfaces();
  // Look for eth0 (WSL default interface)
  const eth0 = interfaces.eth0;
  if (eth0) {
    const ipv4 = eth0.find(addr => addr.family === 'IPv4' && !addr.internal);
    if (ipv4) {
      return ipv4.address;
    }
  }
  // Fallback: find first non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    const addrs = interfaces[name];
    if (addrs) {
      const ipv4 = addrs.find(addr => addr.family === 'IPv4' && !addr.internal);
      if (ipv4) {
        return ipv4.address;
      }
    }
  }
  return null;
}

const wslIp = getWslIpAddress();

const httpServer = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/ip') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      ip: wslIp,
      clientPort: CLIENT_PORT,
      serverPort: PORT
    }));
    return;
  }

  res.writeHead(200);
  res.end('Health Check OK');
});

new SocketServer(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  if (wslIp) {
    console.log(`WSL IP Address: ${wslIp}`);
    console.log(`Client URL: http://${wslIp}:${CLIENT_PORT}`);
  } else {
    console.log('Warning: Could not detect WSL IP address');
  }
});
