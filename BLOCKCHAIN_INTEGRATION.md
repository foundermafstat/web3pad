# Blockchain Integration Guide

## Overview

This project integrates with the Stacks blockchain to store game results and manage player rewards. The integration includes:

- Game result submission to smart contracts
- Player address management
- Reward distribution
- Session tracking on blockchain

## Architecture

### Server Components

1. **StacksIntegrationService** (`server/lib/stacks-integration.js`)
   - Handles blockchain communication
   - Signs game results with server private key
   - Manages transaction broadcasting

2. **Blockchain Routes** (`server/routes/blockchain.js`)
   - API endpoints for blockchain operations
   - Player address management
   - Transaction status checking

3. **Enhanced BaseGame** (`server/games/baseGame.js`)
   - Integrated blockchain session management
   - Automatic result submission
   - Player address tracking

### Client Components

1. **BlockchainService** (`client/lib/blockchain.ts`)
   - Client-side API for blockchain operations
   - Transaction status monitoring
   - Address management

2. **BlockchainAddressModal** (`client/components/BlockchainAddressModal.tsx`)
   - UI for setting player blockchain addresses
   - NFT token ID input
   - Connection status display

3. **BlockchainStatus** (`client/components/BlockchainStatus.tsx`)
   - Real-time blockchain status display
   - Transaction tracking
   - Player connection status

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Stacks Blockchain Integration
STACKS_SERVER_PRIVATE_KEY="your-server-private-key-hex"
STACKS_SERVER_PUBLIC_KEY="your-server-public-key-hex"
STACKS_REGISTRY_CONTRACT="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
STACKS_SHOOTER_CONTRACT="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
```

### 2. Generate Server Keys

Generate a new keypair for the server:

```bash
# Using Stacks CLI
stacks-cli generate-sk

# Or using Node.js
node -e "
const crypto = require('crypto');
const privateKey = crypto.randomBytes(32);
const publicKey = crypto.createHash('sha256').update(privateKey).digest();
console.log('Private Key:', privateKey.toString('hex'));
console.log('Public Key:', publicKey.toString('hex'));
"
```

### 3. Install Dependencies

```bash
cd server
npm install @stacks/network @stacks/transactions secp256k1
```

### 4. Deploy Smart Contracts

Deploy the smart contracts to Stacks:

```bash
cd stacks
clarinet deploy --testnet
```

Update the contract addresses in your environment variables.

## Smart Contracts

### Registry Contract (`stacks/contracts/registry.clar`)

Central registry for game modules and assets:

- Game module registration
- NFT/FT contract management
- Trusted server authorization
- Cross-game session tracking

### Shooter Game Contract (`stacks/contracts/shooter-game.clar`)

Game-specific contract for shooter game:

- Session management
- Result verification with signatures
- NFT progression system
- Reward distribution
- Dispute resolution

## API Endpoints

### Blockchain Status
```
GET /api/blockchain/status
```

### Set Player Address
```
POST /api/blockchain/set-address
{
  "roomId": "string",
  "playerId": "string", 
  "address": "string",
  "nftTokenId": number (optional)
}
```

### Get Transaction Status
```
GET /api/blockchain/tx/:txId/status
```

### Get Session Data
```
GET /api/blockchain/room/:roomId/session-data
```

### Submit Game Result
```
POST /api/blockchain/submit-result
{
  "playerAddress": "string",
  "score": number,
  "gameType": "string",
  "metadata": object (optional)
}
```

## Game Integration

### Adding Blockchain to New Games

1. Extend BaseGame class
2. Call `setPlayerAddress()` when player joins
3. Results are automatically sent to blockchain via `sendResultsToBlockchain()`

### Example Usage

```javascript
// In your game class
class MyGame extends BaseGame {
  constructor(gameId, config) {
    super(gameId, { ...config, blockchainEnabled: true });
  }
  
  async addPlayer(playerId, playerName, playerAddress) {
    const player = super.addPlayer(playerId, playerName);
    
    // Set blockchain address if provided
    if (playerAddress) {
      this.setPlayerAddress(playerId, playerAddress);
    }
    
    return player;
  }
}
```

## Security Considerations

1. **Private Key Security**: Store server private key securely
2. **Signature Verification**: All game results are cryptographically signed
3. **Replay Protection**: Result hashes prevent duplicate submissions
4. **Access Control**: Only trusted servers can submit results

## Testing

### Testnet Setup

1. Use Stacks testnet for development
2. Get testnet STX from faucet
3. Deploy contracts to testnet
4. Test with testnet addresses

### Local Testing

```bash
# Start blockchain integration in test mode
NODE_ENV=test npm run dev

# Test with mock data
curl -X POST http://localhost:3001/api/blockchain/submit-result \
  -H "Content-Type: application/json" \
  -d '{
    "playerAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "score": 1500,
    "gameType": "quiz"
  }'
```

## Troubleshooting

### Common Issues

1. **"Blockchain integration disabled"**
   - Check environment variables
   - Verify server keys are set

2. **"Failed to broadcast transaction"**
   - Check network connectivity
   - Verify contract addresses
   - Ensure sufficient STX for fees

3. **"Invalid signature"**
   - Verify server keys match
   - Check result hash generation

### Debug Mode

Enable debug logging:

```javascript
// In stacks-integration.js
console.log('Debug mode enabled');
console.log('Network:', this.network.coreApiUrl);
console.log('Contract:', this.shooterGameContractAddress);
```

## Production Deployment

1. Use mainnet contracts
2. Set up proper key management
3. Monitor transaction fees
4. Implement error handling and retries
5. Set up blockchain monitoring

## Future Enhancements

- NFT rewards integration
- Cross-game achievements
- Tournament management
- DAO governance
- Layer 2 scaling solutions
