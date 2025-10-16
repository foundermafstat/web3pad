# Shooter Game Module - Stacks Clarity Contract

## Overview

The Shooter Game Module is a production-ready Clarity smart contract for the Stacks blockchain that manages game sessions, signature verification, replay protection, and reward distribution. It's designed to integrate with the Launchpad Registry and supports both STX and SIP-010 token rewards.

## Architecture

### On-Chain Components
- **Session Management**: Track game sessions with player, game ID, and status
- **Signature Verification**: Verify server-signed results using secp256k1
- **Replay Protection**: Prevent duplicate result submissions
- **Reward Distribution**: Handle STX and SIP-010 token payouts
- **Dispute Mechanism**: Allow disputes within a configurable window

### Off-Chain Components
- **Game Server**: Handles real-time gameplay and result generation
- **Canonical Payload**: Standardized JSON format for game results
- **Signature Generation**: Server signs canonical payloads with secp256k1
- **Result Storage**: IPFS/Arweave for full payload storage

## Contract API

### Core Functions

#### `start-session`
```clarity
(define-public (start-session (player principal) (game-id uint)))
```
Creates a new game session for the specified player and game.

**Parameters:**
- `player`: Principal address of the player
- `game-id`: Unique identifier for the game type

**Returns:** `uint` - Session ID

#### `report-result`
```clarity
(define-public (report-result 
  (session-id uint) 
  (result-hash (buff 32)) 
  (sig (buff 65)) 
  (server-pubkey (buff 33)) 
  (meta (optional (buff 128)))
))
```
Submits a server-signed game result to finalize a session.

**Parameters:**
- `session-id`: ID of the session to finalize
- `result-hash`: SHA256 hash of canonical JSON payload
- `sig`: secp256k1 signature (64 or 65 bytes)
- `server-pubkey`: Compressed public key of trusted server
- `meta`: Optional metadata (first 8 bytes = canonical score)

#### `claim-reward`
```clarity
(define-public (claim-reward 
  (session-id uint) 
  (ft-contract (optional principal)) 
  (amount uint)
))
```
Claims rewards for a finalized session.

**Parameters:**
- `session-id`: ID of the session
- `ft-contract`: Optional SIP-010 token contract (null for STX)
- `amount`: Reward amount in microSTX or token units

### Administrative Functions

#### `set-trusted-server`
```clarity
(define-public (set-trusted-server (pubkey (buff 33)) (enabled bool)))
```
Manages trusted server public keys (owner only).

#### `refund`
```clarity
(define-public (refund 
  (session-id uint) 
  (recipient principal) 
  (ft-contract (optional principal)) 
  (amount uint)
))
```
Emergency refund function (owner only).

### Read-Only Functions

#### `get-session`
```clarity
(define-read-only (get-session (session-id uint)))
```
Retrieves session details.

#### `get-pending-reward`
```clarity
(define-read-only (get-pending-reward (session-id uint)))
```
Retrieves pending reward information.

## Data Structures

### Session
```clarity
{
  player: principal,
  game-id: uint,
  start-block: uint,
  end-block: (optional uint),
  canonical-score: (optional uint),
  result-hash: (optional (buff 32)),
  status: (string-ascii 16) ;; "open", "finalized", "disputed"
}
```

### Player Stats
```clarity
{
  total-score: uint,
  total-kills: uint,
  last-play-block: uint
}
```

### NFT Stats
```clarity
{
  exp: uint,
  level: uint,
  durability: uint
}
```

## Off-Chain Payload Schema

### Canonical JSON Format
```json
{
  "sessionId": 0,
  "player": "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
  "gameId": 1,
  "score": 1500,
  "kills": 25,
  "timestamp": 1640995200000,
  "metadata": {
    "level": 5,
    "difficulty": "hard"
  }
}
```

### Canonicalization Rules
1. Sort object keys alphabetically
2. Use consistent number formatting
3. Remove unnecessary whitespace
4. Use UTF-8 encoding

## Signing Procedure

### 1. Create Canonical Payload
```javascript
const payload = JSON.stringify(gameResult, Object.keys(gameResult).sort());
```

### 2. Compute SHA256 Hash
```javascript
const hash = crypto.createHash('sha256').update(payload, 'utf8').digest();
```

### 3. Sign with secp256k1
```javascript
const signature = secp256k1.ecdsaSign(hash, privateKey);
```

### 4. Submit to Contract
```javascript
const tx = {
  contractAddress: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
  contractName: "shooter-game",
  functionName: "report-result",
  functionArgs: [
    { type: "uint", value: sessionId.toString() },
    { type: "buff", value: "0x" + hash.toString('hex') },
    { type: "buff", value: "0x" + signature.signature.toString('hex') },
    { type: "buff", value: "0x" + publicKey.toString('hex') },
    { type: "optional", value: null }
  ]
};
```

## Dispute Process

### Opening a Dispute
1. Any user can call `open-dispute` within the dispute window (120 blocks)
2. Session status changes to "disputed"
3. Dispute reason is stored for review

### Dispute Resolution
- Currently requires manual intervention by contract owner
- Future versions may implement automated dispute resolution
- Disputed sessions cannot be claimed for rewards

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 100 | err-unauthorised | Unauthorized access |
| 101 | err-session-not-found | Session does not exist |
| 102 | err-session-closed | Session is not open |
| 103 | err-invalid-sig | Invalid signature |
| 104 | err-untrusted-server | Server not trusted |
| 105 | err-replay | Replay attack detected |
| 106 | err-no-rewards | No rewards available |
| 107 | err-nft-mismatch | NFT mismatch |
| 108 | err-invalid-params | Invalid parameters |
| 109 | err-transfer-failed | Token transfer failed |

## Security Considerations

### Signature Verification
- Uses secp256k1-verify builtin for signature validation
- Supports both 64 and 65 byte signatures
- Requires 32-byte message hash (SHA256)

### Replay Protection
- Each result hash can only be processed once
- Processed results are permanently stored
- Prevents duplicate reward claims

### Access Control
- Only session owners can submit results
- Only trusted servers can sign results
- Only contract owner can manage trusted servers

## Gas Optimization

### Storage Minimization
- Store only essential data on-chain
- Use hashes for large payloads
- Minimize long-term storage requirements

### Gas Usage Estimates
- `start-session`: ~5,000 gas units
- `report-result`: ~15,000 gas units
- `claim-reward`: ~8,000 gas units
- `open-dispute`: ~3,000 gas units

## Testing

### Unit Tests
Run unit tests with Clarinet:
```bash
clarinet test
```

### Integration Tests
Run integration tests:
```bash
clarinet test --test integration-tests
```

### Helper Scripts
Generate test data and simulate flows:
```bash
node scripts/sign_payload.js
node scripts/simulate_flow.js
```

## Deployment

### Prerequisites
1. Stacks CLI installed
2. Testnet account with STX
3. Contract compiled and tested

### Deployment Steps
1. Deploy contract to testnet
2. Set trusted server public keys
3. Test with sample transactions
4. Deploy to mainnet

### Post-Deployment
1. Verify trusted servers are set
2. Test complete flow with real transactions
3. Monitor contract events
4. Set up monitoring and alerts

## Integration with Launchpad Registry

### Registration Requirements
1. Contract must be deployed and verified
2. All tests must pass
3. Security audit completed
4. Documentation provided

### Registry Integration
1. Submit contract for review
2. Provide integration examples
3. Document API usage
4. Maintain compatibility

## Support and Maintenance

### Monitoring
- Track session creation and completion rates
- Monitor reward distribution
- Watch for dispute patterns
- Monitor gas usage

### Updates
- Contract is not upgradeable (by design)
- New versions require new deployment
- Registry manages version compatibility
- Migration tools provided for major updates

## License

This contract is released under the MIT License. See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request
5. Address review feedback

## Contact

For questions and support:
- GitHub Issues: [Repository Issues]
- Discord: [Community Discord]
- Email: [Support Email]
