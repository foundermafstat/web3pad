// Test script for shooter game connection
import WebSocket from 'ws';

const roomId = 'test_room_123';
const walletAddress = 'SP1TEST123456789';
const playerName = 'TestPlayer';

console.log('Testing shooter game connection...');
console.log('Room ID:', roomId);
console.log('Wallet Address:', walletAddress);

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to server');
  
  // Send shooter auth
  const authData = {
    type: 'shooter:auth',
    roomId: roomId,
    walletAddress: walletAddress,
    playerName: playerName
  };
  
  console.log('Sending auth data:', authData);
  ws.send(JSON.stringify(authData));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received message:', message);
  
  if (message.type === 'shooter:auth:success') {
    console.log('✅ Authentication successful!');
    console.log('Player data:', message.playerData);
    
    // Test sending input
    setTimeout(() => {
      console.log('Sending test input...');
      ws.send(JSON.stringify({
        type: 'shooter:input',
        input: { x: 0.5, y: 0.3 }
      }));
    }, 1000);
    
    setTimeout(() => {
      console.log('Sending test shoot...');
      ws.send(JSON.stringify({
        type: 'shooter:shoot'
      }));
    }, 2000);
    
  } else if (message.type === 'shooter:auth:error') {
    console.log('❌ Authentication failed:', message.message);
  } else if (message.type === 'gameState') {
    console.log('📊 Game state received');
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log('Connection closed:', code, reason.toString());
});

// Keep the script running for a few seconds
setTimeout(() => {
  console.log('Test completed');
  ws.close();
  process.exit(0);
}, 10000);
