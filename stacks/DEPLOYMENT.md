# Contract Deployment Information

## 🚀 Live Deployment Status

**Network**: Stacks Testnet  
**Deployment Address**: `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7`  
**Deployment Date**: December 2024  
**Total Cost**: 0.460030 STX  

## 📋 Contract Addresses

| Contract | Address | Cost (STX) | Status |
|----------|---------|------------|--------|
| **Registry** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry` | 0.188320 | ✅ Live |
| **Shooter Game** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game` | 0.178630 | ✅ Live |
| **NFT Trait** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait` | 0.042250 | ✅ Live |
| **FT Trait** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait` | 0.050830 | ✅ Live |

## 🔗 Quick Links

### Explorers
- [Stacks Explorer](https://explorer.stacks.co/?chain=testnet&address=ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7)
- [Hiro Explorer](https://explorer.hiro.so/?chain=testnet&address=ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7)

### API Endpoints
- **Base URL**: `https://api.testnet.hiro.so`
- **Contract Read**: `POST /v2/contracts/call-read/{address}/{contract}/{function}`
- **Broadcast TX**: `POST /v2/transactions`

## 🛠️ Quick Start Commands

### Check Registry Stats
```bash
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7/registry/get-registry-stats
```

### Get Game Module Info
```bash
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7/registry/get-game-module \
  -H "Content-Type: application/json" \
  -d '{"sender": "ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7", "arguments": ["0"]}'
```

## 📊 Technical Details

- **Clarity Version**: 3
- **Epoch**: 3.2
- **Anchor Block Only**: true
- **Deployment Fee Rate**: 10 microSTX per byte
- **Confirmation Time**: ~10 minutes

## 🔧 Integration Examples

### Register Game Module (Clarity)
```clarity
(contract-call? 
  'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry
  register-game-module
  "My Game"
  "Game description"
  "1.0.0"
  'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game
  "action"
  u50
  u4
)
```

### Start Game Session (Clarity)
```clarity
(contract-call?
  'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game
  start-session
  tx-sender
  (some u1)
)
```

---

**Note**: This deployment is on Stacks Testnet. For production use, deploy to Mainnet with appropriate security considerations.
