// get_keys_from_seed.js
// Script to get private and public keys from mnemonic seed phrase

require('dotenv').config();
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

/**
 * Generate private key from mnemonic seed phrase
 * @param {string} mnemonic - 12 or 24 word mnemonic phrase
 * @param {string} derivationPath - BIP44 derivation path (default for Stacks)
 * @returns {Buffer} - Private key buffer
 */
function getPrivateKeyFromSeed(mnemonic, derivationPath = "m/44'/5757'/0'/0/0") {
  // For simplicity, we'll use a basic approach
  // In production, you should use a proper BIP39/BIP44 library like 'bip39' and 'bip32'
  
  // Create a hash from the mnemonic phrase
  const seed = crypto.createHash('sha256').update(mnemonic, 'utf8').digest();
  
  // Generate private key from seed (simplified approach)
  const privateKey = crypto.createHash('sha256').update(seed).digest();
  
  return privateKey;
}

/**
 * Get public key from private key
 * @param {Buffer} privateKey - Private key buffer
 * @returns {Buffer} - Public key buffer
 */
function getPublicKeyFromPrivate(privateKey) {
  return secp256k1.publicKeyCreate(privateKey);
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
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔑 Get Keys from Mnemonic Seed Phrase');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/get_keys_from_seed.js "word1 word2 word3 ..."');
    console.log('  node scripts/get_keys_from_seed.js "engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar"');
    console.log('');
    console.log('Or set MNEMONIC in .env file and run:');
    console.log('  node scripts/get_keys_from_seed.js');
    console.log('');
    console.log('Options:');
    console.log('  --save-env    Save keys to .env file');
    console.log('  --mainnet     Generate mainnet address');
    console.log('');
    return;
  }
  
  const saveEnv = args.includes('--save-env');
  const isMainnet = args.includes('--mainnet');
  const mnemonicArg = args.find(arg => !arg.startsWith('--'));
  
  let mnemonic;
  
  if (mnemonicArg) {
    mnemonic = mnemonicArg;
  } else if (process.env.MNEMONIC) {
    mnemonic = process.env.MNEMONIC;
    console.log('Using mnemonic from .env file');
  } else {
    console.error('❌ Error: No mnemonic phrase provided');
    console.log('Usage: node scripts/get_keys_from_seed.js "word1 word2 word3 ..."');
    process.exit(1);
  }
  
  // Validate mnemonic length
  const words = mnemonic.trim().split(/\s+/);
  if (words.length !== 12 && words.length !== 24) {
    console.error('❌ Error: Mnemonic must be 12 or 24 words');
    console.log(`Provided: ${words.length} words`);
    process.exit(1);
  }
  
  try {
    // Generate private key from mnemonic
    const privateKeyBuffer = getPrivateKeyFromSeed(mnemonic);
    const publicKeyBuffer = getPublicKeyFromPrivate(privateKeyBuffer);
    
    const keys = {
      privateKey: '0x' + privateKeyBuffer.toString('hex'),
      publicKey: '0x' + publicKeyBuffer.toString('hex'),
      address: generateStacksAddress(publicKeyBuffer, isMainnet ? 'mainnet' : 'testnet')
    };
    
    console.log('=== Generated Keys from Mnemonic ===');
    console.log(`Network: ${isMainnet ? 'mainnet' : 'testnet'}`);
    console.log(`Mnemonic: ${words.slice(0, 4).join(' ')} ... (${words.length} words)`);
    console.log(`Private Key: ${keys.privateKey}`);
    console.log(`Public Key: ${keys.publicKey}`);
    console.log(`Address: ${keys.address}`);
    
    if (saveEnv) {
      const envContent = `# Generated from mnemonic seed phrase
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
STACKS_NETWORK=${isMainnet ? 'mainnet' : 'testnet'}
STACKS_RPC_URL=${isMainnet ? 'https://stacks-node-api.mainnet.stacks.co' : 'https://stacks-node-api.testnet.stacks.co'}
`;
      
      require('fs').writeFileSync('.env', envContent);
      console.log('\n✅ Keys saved to .env file');
    }
    
    console.log('\n=== Usage ===');
    console.log('1. Copy the keys above to your .env file');
    console.log('2. Or run: node scripts/get_keys_from_seed.js --save-env');
    console.log('3. Then run: npm run sign');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  getPrivateKeyFromSeed,
  getPublicKeyFromPrivate,
  generateStacksAddress
};

// Run if called directly
if (require.main === module) {
  main();
}
