# Configuration Guide - Environment Variables

This guide explains how to configure the shooter game contract scripts using environment variables.

## Quick Setup

1. **Copy the example file**:
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file** with your values:
   ```bash
   # Edit .env file with your wallet and server keys
   ```

3. **Run the scripts**:
   ```bash
   npm run sign
   npm run simulate
   ```

## Environment Variables

### Wallet Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `WALLET_PRIVATE_KEY` | 32-byte private key (hex) | `0x1234...` | No* |
| `WALLET_PUBLIC_KEY` | 33-byte compressed public key (hex) | `0x02abcd...` | No* |
| `WALLET_ADDRESS` | Stacks principal address | `SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9` | No* |

*If not provided, new test keys will be generated

### Server Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SERVER_PRIVATE_KEY` | 32-byte server private key (hex) | `0xabcd...` | No* |
| `SERVER_PUBLIC_KEY` | 33-byte server public key (hex) | `0x03abcd...` | No* |

*If not provided, new test keys will be generated

### Contract Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CONTRACT_ADDRESS` | Contract deployment address | `SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9` | No |
| `CONTRACT_NAME` | Contract name | `shooter-game` | No |

### Game Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEFAULT_GAME_ID` | Default game ID | `1` | No |
| `DEFAULT_REWARD_AMOUNT` | Default reward in microSTX | `1000000` | No |
| `DISPUTE_WINDOW_BLOCKS` | Dispute window in blocks | `120` | No |

### Network Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STACKS_NETWORK` | Network (testnet/mainnet) | `testnet` | No |
| `STACKS_RPC_URL` | RPC endpoint | `https://stacks-node-api.testnet.stacks.co` | No |

## Key Generation

### Generate New Keys

If you don't have keys, the scripts will generate new ones automatically:

```bash
npm run sign
# Output: "Generated new test keys (set environment variables to use your keys)"
```

### Use Existing Keys

1. **Get your private key** from your wallet
2. **Convert to hex format** (32 bytes, 64 hex characters)
3. **Generate public key** using secp256k1
4. **Set environment variables**:

```bash
# Example .env file
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
WALLET_PUBLIC_KEY=0x02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
WALLET_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9
```

## Usage Examples

### Basic Usage (Auto-generated keys)
```bash
# No .env file needed
npm run sign
npm run simulate
```

### Custom Wallet Keys
```bash
# .env file with wallet keys
WALLET_PRIVATE_KEY=0x1234...
WALLET_PUBLIC_KEY=0x02abcd...
WALLET_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9

npm run sign
# Output: "Using wallet keys from environment variables"
```

### Custom Server Keys
```bash
# .env file with server keys
SERVER_PRIVATE_KEY=0xabcd...
SERVER_PUBLIC_KEY=0x03abcd...

npm run simulate
# Output: "Using server keys from environment variables"
```

### Custom Contract Address
```bash
# .env file with custom contract
CONTRACT_ADDRESS=SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE
CONTRACT_NAME=my-shooter-game

npm run sign
# Uses custom contract address
```

## Security Notes

### ⚠️ Important Security Considerations

1. **Never commit .env files** to version control
2. **Use testnet keys** for development
3. **Keep private keys secure** and never share them
4. **Use different keys** for different environments

### .gitignore

Make sure your `.env` file is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

## Troubleshooting

### Common Issues

1. **Invalid key format**:
   ```
   Error: Invalid private key format
   ```
   - Ensure keys are 32 bytes (64 hex characters)
   - Remove '0x' prefix or add it consistently

2. **Missing environment variables**:
   ```
   Generated new test keys (set environment variables to use your keys)
   ```
   - This is normal if no .env file is provided
   - Scripts will work with generated test keys

3. **Invalid address format**:
   ```
   Error: Invalid Stacks address
   ```
   - Ensure address starts with 'SP' for mainnet or 'ST' for testnet
   - Check address format and length

### Getting Help

- Check the [Development Guide](DEVELOPMENT_GUIDE.md) for usage examples
- Review the [API Documentation](dev/shooter-module/README.md) for contract details
- Examine the [Setup Guide](SETUP.md) for installation instructions

## Example .env File

```bash
# Wallet Configuration
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
WALLET_PUBLIC_KEY=0x02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
WALLET_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9

# Server Configuration
SERVER_PRIVATE_KEY=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
SERVER_PUBLIC_KEY=0x03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# Contract Configuration
CONTRACT_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9
CONTRACT_NAME=shooter-game

# Game Configuration
DEFAULT_GAME_ID=1
DEFAULT_REWARD_AMOUNT=1000000
DISPUTE_WINDOW_BLOCKS=120

# Network Configuration
STACKS_NETWORK=testnet
STACKS_RPC_URL=https://stacks-node-api.testnet.stacks.co
```
