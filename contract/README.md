# Shooter Game Module - Stacks Blockchain Launchpad Registry

A modular, interoperable smart contract for real-time shooter games on the Stacks blockchain, designed for integration with a multi-game Launchpad Registry.

## Overview

The Shooter Game Module provides a comprehensive framework for managing real-time game sessions with off-chain verification, NFT progression, reward distribution, and dispute resolution. It's built with modularity in mind to support multiple game types within a unified Launchpad Registry ecosystem.

## Key Features

### 🎮 Game Session Management
- **Lifecycle**: `open` → `finalized` → `disputed`
- **Real-time**: Off-chain game processing with on-chain result verification
- **Secure**: secp256k1 signature verification for all game results
- **Replay Protection**: Result hash registry prevents duplicate submissions

### 🏆 NFT Progression System
- **Experience Points**: Configurable EXP gain per game session
- **Level System**: Automatic level calculation based on accumulated EXP
- **Durability**: NFT durability tracking for game mechanics
- **Statistics**: Comprehensive game statistics per NFT

### 💰 Reward System
- **Multi-asset**: Support for both STX and Fungible Token (FT) rewards
- **Claim Mechanism**: Secure reward claiming with replay protection
- **Owner Control**: Admin-controlled reward distribution
- **Tracking**: Complete reward distribution history

### 🛡️ Security & Dispute Resolution
- **Trusted Servers**: Whitelist-based game server authentication
- **Dispute Window**: Time-limited dispute period for game results
- **Owner Resolution**: Admin-controlled dispute resolution
- **Audit Trail**: Complete transaction and dispute history

### 🔧 Modular Architecture
- **Launchpad Integration**: Ready for multi-game registry integration
- **Game Module Registry**: Support for multiple game types
- **Extensible**: Easy addition of new game modules
- **Interoperable**: Standardized interfaces for cross-game compatibility

## Contract Architecture

### Core Data Structures

#### Sessions
```clarity
{
  player: principal,
  game-module-id: uint,
  start-block: uint,
  end-block: (optional uint),
  canonical-score: (optional uint),
  result-hash: (optional (buff 32)),
  status: (string-ascii 16),
  nft-token-id: (optional uint),
  exp-gained: (optional uint)
}
```

#### NFT Stats
```clarity
{
  exp: uint,
  level: uint,
  durability: uint,
  games-played: uint,
  total-score: uint
}
```

#### Player Stats
```clarity
{
  total-score: uint,
  total-kills: uint,
  total-games-played: uint,
  last-play-block: uint,
  preferred-game-module: uint
}
```

## Module Registration

### Adding New Game Modules

To register a new game module in the Launchpad Registry:

```clarity
(register-game-module 
  module-id: uint,
  name: (string-ascii 32),
  contract-address: principal,
  min-score: uint,
  max-score: uint
)
```

**Example:**
```typescript
// Register a strategy game module
await contractCall("shooter-game", "register-game-module", [
  types.uint(2),
  types.ascii("Strategy Game"),
  types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
  types.uint(0),
  types.uint(10000)
], deployer.address);
```

### Trusted Server Management

Add trusted game servers for result verification:

```clarity
(set-trusted-server 
  pubkey: (buff 33),
  enabled: bool,
  server-name: (string-ascii 32)
)
```

## Off-Chain Signing Workflow

### 1. Game Session Creation
```typescript
// Player starts a game session
const sessionId = await contractCall("shooter-game", "start-session", [
  types.principal(player.address),
  types.some(types.uint(nftTokenId)) // Optional NFT
], player.address);
```

### 2. Off-Chain Game Processing
```typescript
// Game server processes the game and creates result
const gameResult = {
  sessionId: 0,
  score: 1500,
  expGained: 50,
  kills: 3,
  timestamp: Date.now()
};

// Create canonical result hash
const canonicalPayload = JSON.stringify(gameResult);
const resultHash = sha256(canonicalPayload);

// Sign the result hash with server private key
const signature = secp256k1.sign(resultHash, serverPrivateKey);
```

### 3. On-Chain Result Submission
```typescript
// Player submits the signed result
await contractCall("shooter-game", "report-result", [
  types.uint(sessionId),
  types.buff(resultHash),
  types.buff(signature),
  types.buff(serverPublicKey),
  types.uint(gameResult.score),
  types.uint(gameResult.expGained),
  types.none() // Optional metadata
], player.address);
```

### 4. Verification Process
The contract automatically:
- Verifies the server signature using `secp256k1-verify`
- Checks replay protection (result hash not previously used)
- Validates server is in trusted whitelist
- Updates NFT and player statistics
- Marks session as finalized

## Reward Claiming

### Setting Up Rewards

Game administrators can set up rewards for completed sessions:

```typescript
// STX reward
await contractCall("shooter-game", "setup-reward", [
  types.uint(sessionId),
  types.none(), // None = STX
  types.uint(1000000) // 1 STX in micro-STX
], admin.address);

// FT reward
await contractCall("shooter-game", "setup-reward", [
  types.uint(sessionId),
  types.some(types.principal(ftContractAddress)),
  types.uint(100) // 100 tokens
], admin.address);
```

### Claiming Rewards

Players claim their rewards:

```typescript
await contractCall("shooter-game", "claim-reward", [
  types.uint(sessionId)
], player.address);
```

## Dispute Resolution

### Opening a Dispute

Players can dispute game results within the dispute window:

```typescript
await contractCall("shooter-game", "open-dispute", [
  types.uint(sessionId),
  types.buff("0x726561736f6e") // "reason" in hex
], player.address);
```

### Resolving Disputes

Contract owners can resolve disputes:

```typescript
// Uphold the dispute (revert session to open)
await contractCall("shooter-game", "resolve-dispute", [
  types.uint(sessionId),
  types.bool(true) // uphold dispute
], owner.address);

// Reject the dispute (keep session finalized)
await contractCall("shooter-game", "resolve-dispute", [
  types.uint(sessionId),
  types.bool(false) // reject dispute
], owner.address);
```

## NFT Progression System

### Experience and Leveling

NFTs gain experience points from game sessions and automatically level up:

```typescript
// Check NFT stats
const nftStats = await contractCall("shooter-game", "get-nft-stats", [
  types.uint(tokenId)
], player.address);

// Returns:
// {
//   exp: uint,
//   level: uint,
//   durability: uint,
//   games-played: uint,
//   total-score: uint
// }
```

### Level Calculation
- Level = min(EXP / 100, 100)
- Each level requires 100 experience points
- Maximum level is 100

## Security Considerations

### Trusted Server Whitelist
- Only whitelisted servers can sign game results
- Server public keys are stored on-chain
- Regular server key rotation recommended

### Replay Protection
- Result hashes are stored permanently
- Each result hash can only be used once
- Prevents duplicate reward claims

### Signature Verification
- All game results must be signed by trusted servers
- Uses secp256k1 signature verification
- Protects against result tampering

### Dispute Window
- 24-hour window for disputes (configurable)
- Prevents indefinite dispute periods
- Balances player protection with finality

## Testing

Run the comprehensive test suite:

```bash
clarinet test
```

The test suite covers:
- Contract deployment and initialization
- Trusted server management
- Game session lifecycle
- Result reporting and verification
- NFT progression system
- Reward claiming
- Dispute resolution
- Replay protection
- Integration scenarios

## Deployment

### Prerequisites
- Clarinet v1.7.1+
- Stacks 2.5+ runtime
- Clarity v2.1 compatibility

### Deployment Steps

1. **Configure Clarinet.toml**
```toml
[project]
name = "shooter-game"
requirements = ["SIP-010"]

[contracts.shooter-game]
path = "contracts/shooter-game.clar"
```

2. **Deploy to Testnet**
```bash
clarinet deploy --testnet
```

3. **Deploy to Mainnet**
```bash
clarinet deploy --mainnet
```

## Future Extensions

### Additional Game Modules

The modular design supports easy addition of new game types:

1. **Strategy Games**: Turn-based strategy with different scoring
2. **Racing Games**: Time-based scoring with different mechanics
3. **Card Games**: Hand-based games with different reward structures
4. **Arena Games**: Multiplayer competitive games

### Registry Integration

Future Launchpad Registry features:
- Cross-game NFT compatibility
- Unified reward pools
- Tournament systems
- Seasonal competitions

### Advanced Features

Planned enhancements:
- Tournament brackets
- Seasonal leaderboards
- Cross-game achievements
- NFT marketplace integration
- Governance token integration

## API Reference

### Public Functions

#### Session Management
- `start-session(player: principal, nft-token-id: (optional uint))` → `(response uint uint)`
- `report-result(...)` → `(response bool uint)`
- `open-dispute(session-id: uint, reason: (buff 16))` → `(response bool uint)`

#### Rewards
- `setup-reward(session-id: uint, ft-contract: (optional principal), amount: uint)` → `(response bool uint)`
- `claim-reward(session-id: uint)` → `(response bool uint)`

#### Administration
- `set-trusted-server(pubkey: (buff 33), enabled: bool, server-name: (string-ascii 32))` → `(response bool uint)`
- `register-game-module(...)` → `(response bool uint)`
- `resolve-dispute(session-id: uint, uphold-dispute: bool)` → `(response bool uint)`

### Read-Only Functions

- `get-session(session-id: uint)` → `(optional {player: principal, ...})`
- `get-player-stats(player: principal)` → `(optional {total-score: uint, ...})`
- `get-nft-stats(token-id: uint)` → `(optional {exp: uint, ...})`
- `get-contract-stats()` → `{total-sessions: uint, ...}`

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 100 | err-unauthorised | Caller not authorized for this action |
| 101 | err-session-not-found | Session ID does not exist |
| 102 | err-session-closed | Session is not in expected state |
| 103 | err-invalid-sig | Signature verification failed |
| 104 | err-untrusted-server | Server not in trusted whitelist |
| 105 | err-replay | Result hash already processed |
| 106 | err-no-rewards | No rewards available for session |
| 107 | err-nft-mismatch | NFT does not match session |
| 108 | err-invalid-params | Invalid function parameters |
| 109 | err-transfer-failed | Token transfer failed |
| 110 | err-invalid-game-id | Invalid game module ID |
| 111 | err-insufficient-balance | Insufficient contract balance |
| 112 | err-dispute-expired | Dispute window has expired |
| 113 | err-already-claimed | Reward already claimed |

## License

This contract is released under the MIT License. See LICENSE file for details.

## Support

For technical support and questions:
- GitHub Issues: [Repository Issues]
- Documentation: [Project Documentation]
- Community: [Stacks Community Discord]

---

**Built for the Stacks ecosystem with ❤️**