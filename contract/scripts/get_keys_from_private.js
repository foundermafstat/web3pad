// get_keys_from_private.js
// Script to get public key from private key

require('dotenv').config();
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

/**
 * Get public key from private key
 * @param {string} privateKeyHex - Private key in hex format (with or without 0x)
 * @returns {Object} - Object with private and public keys
 */
function getKeysFromPrivate(privateKeyHex) {
  // Clean the private key (remove 0x prefix if present)
  const cleanPrivateKey = privateKeyHex.replace('0x', '');
  
  // Validate private key length (should be 64 hex characters = 32 bytes)
  if (cleanPrivateKey.length !== 64) {
    throw new Error('Private key must be 64 hex characters (32 bytes)');
  }
  
  // Convert to Buffer
  const privateKeyBuffer = Buffer.from(cleanPrivateKey, 'hex');
  
  // Generate public key
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);
  
  // Generate Stacks address (simplified version)
  const address = generateStacksAddress(publicKeyBuffer, 'testnet');
  
  return {
    privateKey: '0x' + privateKeyBuffer.toString('hex'),
    publicKey: '0x' + publicKeyBuffer.toString('hex'),
    address: address
  };
}

/**
 * Generate Stacks address from public key
 * @param {Buffer} publicKey - 33-byte compressed public key
 * @param {string} network - 'testnet' or 'mainnet'
 * @returns {string} - Stacks address
 */
function generateStacksAddress(publicKey, network = 'testnet') {
  // This is a simplified version - in production you'd use the actual Stacks address generation
  const keyHash = crypto.createHash('sha256').update(publicKey).digest('hex');
  const prefix = network === 'mainnet' ? 'SP' : 'ST';
  return prefix + keyHash.substring(0, 40).toUpperCase();
}

/**
 * Create .env file content
 * @param {Object} keys - Keys object
 * @returns {string} - .env file content
 */
function createEnvContent(keys) {
  return `# Generated from existing private key
# Generated on: ${new Date().toISOString()}

# Wallet Configuration
WALLET_PRIVATE_KEY=${keys.privateKey}
WALLET_PUBLIC_KEY=${keys.publicKey}
WALLET_ADDRESS=${keys.address}

# Server Configuration (generated new)
SERVER_PRIVATE_KEY=0x${crypto.randomBytes(32).toString('hex')}
SERVER_PUBLIC_KEY=0x${secp256k1.publicKeyCreate(crypto.randomBytes(32)).toString('hex')}

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
`;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔑 Get Public Key from Private Key');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/get_keys_from_private.js YOUR_PRIVATE_KEY');
    console.log('  node scripts/get_keys_from_private.js 0x1234567890abcdef...');
    console.log('');
    console.log('Or set WALLET_PRIVATE_KEY in .env file and run:');
    console.log('  node scripts/get_keys_from_private.js');
    console.log('');
    console.log('Options:');
    console.log('  --save-env    Save keys to .env file');
    console.log('  --mainnet     Generate mainnet address');
    console.log('');
    return;
  }
  
  const saveEnv = args.includes('--save-env');
  const isMainnet = args.includes('--mainnet');
  const privateKeyArg = args.find(arg => !arg.startsWith('--'));
  
  let privateKey;
  
  if (privateKeyArg) {
    privateKey = privateKeyArg;
  } else if (process.env.WALLET_PRIVATE_KEY) {
    privateKey = process.env.WALLET_PRIVATE_KEY;
    console.log('Using private key from .env file');
  } else {
    console.error('❌ Error: No private key provided');
    console.log('Usage: node scripts/get_keys_from_private.js YOUR_PRIVATE_KEY');
    process.exit(1);
  }
  
  try {
    const keys = getKeysFromPrivate(privateKey);
    
    console.log('=== Extracted Keys ===');
    console.log(`Network: ${isMainnet ? 'mainnet' : 'testnet'}`);
    console.log(`Private Key: ${keys.privateKey}`);
    console.log(`Public Key: ${keys.publicKey}`);
    console.log(`Address: ${keys.address}`);
    
    if (saveEnv) {
      const envContent = createEnvContent(keys);
      require('fs').writeFileSync('.env', envContent);
      console.log('\n✅ Keys saved to .env file');
    }
    
    console.log('\n=== Usage ===');
    console.log('1. Copy the keys above to your .env file');
    console.log('2. Or run: node scripts/get_keys_from_private.js --save-env');
    console.log('3. Then run: npm run sign');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  getKeysFromPrivate,
  generateStacksAddress
};

// Run if called directly
if (require.main === module) {
  main();
}
