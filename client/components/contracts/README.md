# Contracts Interface

Interface for interacting with deployed contracts in Stacks Testnet.

## Deployed Contracts

All contracts are deployed in Stacks Testnet at address `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7`:

| Contract | Address | Cost | Status |
|----------|---------|------|--------|
| **Registry** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry` | 0.188320 STX | ✅ Live |
| **Shooter Game** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game` | 0.178630 STX | ✅ Live |
| **NFT Trait** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait` | 0.042250 STX | ✅ Live |
| **FT Trait** | `ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait` | 0.050830 STX | ✅ Live |

**Total deployment cost:** 0.460030 STX

## Components

### 1. ContractManager
Main component for managing all contracts.

**Functions:**
- View all deployed contracts
- Network and deployment cost information
- Contract selection for interaction
- Switching between contract interfaces

### 2. RegistryInterface
Interface for working with Registry contract.

**Functions:**
- View registered game modules
- Register new game modules
- Module statistics
- Game category management

### 3. ShooterGameInterface
Interface for working with Shooter Game contract.

**Functions:**
- Start new game sessions
- Submit game results
- View session history
- NFT management in games

### 4. NFTInterface
Interface for working with NFT contract.

**Functions:**
- View NFT collection
- Create new NFTs
- NFT trait management
- Switch between "My NFTs" and "All NFTs"

### 5. FTInterface
Interface for working with FT contract.

**Functions:**
- View FT tokens and balances
- Create new FT tokens
- Transfer tokens between addresses
- Tokenomics management

## Usage

### Access to Interface
1. Go to "Community" → "Contracts" section in the main menu
2. Or directly at `/contracts` address

### Main Actions

#### Registry
- Register game module
- View existing modules
- Category management

#### Shooter Game
- Connect player address
- Start game session
- Submit results

#### NFT
- Create NFT with traits
- View collection
- Use NFTs in games

#### FT Tokens
- Create game tokens
- Transfer between players
- Balance management

## API Endpoints

All components use the updated `BlockchainService` with the following methods:

### Registry
- `getGameModules()` - get modules
- `registerModule(moduleData)` - register module

### Game Sessions
- `startGameSession(playerAddress, gameType, nftTokenId)` - start session
- `getPlayerSessions(playerAddress)` - get player sessions
- `submitResult(playerAddress, score, gameType, metadata)` - submit result

### NFT
- `getPlayerNFTs(playerAddress)` - get player NFTs
- `createNFT(nftData)` - create NFT

### FT Tokens
- `getPlayerFTBalances(playerAddress)` - get balances
- `getFTTokens()` - get all tokens
- `createFTToken(tokenData)` - create token
- `transferFTTokens(tokenId, from, to, amount)` - transfer tokens

### General
- `getStatus()` - blockchain status
- `getContractInfo(contractAddress)` - contract information
- `callContractFunction(contractAddress, functionName, args)` - call function

## Configuration

### Server Side
Make sure the server is configured to work with contracts:
- Environment variables for Stacks are configured
- Server keys for transaction signing
- API endpoints for contract interaction

### Client Side
- Connect Stacks player address
- Network configuration (Testnet/Mainnet)
- Check blockchain integration status

## Security

- All transactions are signed with server keys
- Access control for administrative functions
- Input data validation
- Blockchain error handling

## Development

### Adding New Contract
1. Add contract information to `ContractManager`
2. Create new interface component
3. Add methods to `BlockchainService`
4. Update main page `/contracts`

### Testing
- Use Stacks Testnet for development
- Test all functions with mock data
- Test error handling
- Check integration with existing games

## Support

If problems occur:
1. Check blockchain integration status
2. Verify contract addresses are correct
3. Check server logs
4. Ensure you have STX for fees
