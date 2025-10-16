# Shooter Game Contract - Setup Guide

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **Clarinet** (installed globally) - Required for testing
3. **Stacks CLI** (for deployment) - Optional
4. **Rust** (for Clarinet installation) - If using cargo install

## Installation

### 1. Install Clarinet (if not already installed)

**Option 1: Download Binary (Recommended for Windows)**
```bash
# Download from GitHub releases
# Visit: https://github.com/hirosystems/clarinet/releases
# Download the Windows binary and add to PATH
```

**Option 2: Using Cargo (if Rust is installed)**
```bash
cargo install clarinet
```

**Option 3: Using npm (if available)**
```bash
npm install -g clarinet
```

**Note**: Clarinet is only required for testing and deployment. The helper scripts work without it.

### 2. Install Contract Dependencies
```bash
cd contract
npm install
```

### 3. Verify Installation
```bash
# Check Node.js
node --version

# Check Clarinet (optional for helper scripts)
npm run check:clarinet

# Test helper scripts (work without Clarinet)
npm run sign
npm run simulate
```

## Quick Start

### 1. Generate Test Data (No Clarinet Required)
```bash
npm run sign
```
This generates test signatures and transaction data for testing.

### 2. Run Flow Simulation (No Clarinet Required)
```bash
npm run simulate
```
This simulates the complete game flow from session start to reward claim.

### 3. Run Tests (Requires Clarinet)
```bash
# First install Clarinet
cargo install clarinet

# Then run tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
```

### 4. Deploy Contract (Requires Clarinet)
```bash
# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

## Project Structure

```
contract/
├── contracts/
│   └── shooter-game.clar          # Main Clarity contract
├── tests/
│   ├── shooter-game-tests.ts      # Unit tests
│   └── integration-tests.ts       # Integration tests
├── scripts/
│   ├── sign_payload.js            # Payload signing helper
│   └── simulate_flow.js           # Flow simulation
├── dev/shooter-module/
│   └── README.md                  # Comprehensive documentation
├── security-audit.md              # Security audit report
├── test-vectors.json              # Test vectors and examples
├── package.json                   # Node.js dependencies
├── Clarinet.toml                  # Clarinet configuration
└── SETUP.md                       # This file
```

## Available Scripts

| Script | Description | Requires Clarinet |
|--------|-------------|-------------------|
| `npm run sign` | Generate test signatures and transaction data | ❌ No |
| `npm run simulate` | Run complete flow simulation | ❌ No |
| `npm run check:clarinet` | Check if Clarinet is installed | ❌ No |
| `npm test` | Run all Clarinet tests | ✅ Yes |
| `npm run test:unit` | Run unit tests only | ✅ Yes |
| `npm run test:integration` | Run integration tests only | ✅ Yes |
| `npm run build` | Build the contract | ✅ Yes |
| `npm run deploy:testnet` | Deploy to testnet | ✅ Yes |
| `npm run deploy:mainnet` | Deploy to mainnet | ✅ Yes |

## What You Can Do Right Now (No Additional Installation)

### ✅ Available Immediately
- **Generate Test Data**: `npm run sign` - Creates real signatures and transaction data
- **Simulate Game Flow**: `npm run simulate` - Complete end-to-end simulation
- **Check Status**: `npm run check:clarinet` - Verify Clarinet installation status
- **Review Documentation**: All documentation and examples are available
- **Examine Contract**: The Clarity contract is fully readable and documented
- **Test Integration**: Use generated data to test your application integration

### ❌ Requires Clarinet Installation
- **Run Unit Tests**: `npm test` - Contract testing
- **Build Contract**: `npm run build` - Compile contract
- **Deploy Contract**: `npm run deploy:testnet` - Deploy to blockchain
- **Integration Testing**: Full contract integration tests

### 🎯 For Development Work
You can start developing and testing your application integration immediately using the helper scripts, even without Clarinet installed.

## Testing

### Unit Tests (Requires Clarinet)
The unit tests cover:
- Session creation and management
- Signature verification
- Replay protection
- Access control
- Error handling

### Integration Tests (Requires Clarinet)
The integration tests cover:
- Complete game flow simulation
- NFT stats updates
- Dispute handling
- Multiple session scenarios

### Helper Scripts (No Clarinet Required)
- **sign_payload.js**: Generates test signatures and transaction data
- **simulate_flow.js**: Simulates complete game flow with error handling

## Security

Before production deployment:
1. Review the security audit report (`security-audit.md`)
2. Fix critical issues identified
3. Run comprehensive tests
4. Deploy to testnet first

## Deployment

### Testnet Deployment
```bash
npm run deploy:testnet
```

### Mainnet Deployment
```bash
npm run deploy:mainnet
```

## Troubleshooting

### Common Issues

1. **Clarinet not found**
   ```bash
   npm run install:clarinet
   ```

2. **Node.js version too old**
   ```bash
   # Update to Node.js 16 or higher
   ```

3. **Permission errors on Windows**
   ```bash
   # Run PowerShell as Administrator
   ```

### Getting Help

- Check the comprehensive documentation in `dev/shooter-module/README.md`
- Review test vectors in `test-vectors.json`
- Examine security audit in `security-audit.md`

## Next Steps

1. **Development**: Use the helper scripts to test your integration
2. **Testing**: Run the complete test suite
3. **Security**: Address critical issues from the audit
4. **Deployment**: Deploy to testnet for additional testing
5. **Production**: Deploy to mainnet after thorough testing

## Support

For questions and support:
- Review the documentation in `dev/shooter-module/README.md`
- Check the implementation summary in `IMPLEMENTATION_SUMMARY.md`
- Examine the security audit for known issues
