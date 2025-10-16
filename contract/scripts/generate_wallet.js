// generate_wallet.js
// Wallet generation utility for Stacks blockchain

require('dotenv').config();
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

/**
 * Generate a new Stacks wallet
 * @param {string} network - 'testnet' or 'mainnet'
 * @returns {Object} - Wallet object with keys and address
 */
function generateStacksWallet(network = 'testnet') {
  // Generate private key (32 bytes)
  const privateKey = crypto.randomBytes(32);
  
  // Generate public key (compressed, 33 bytes)
  const publicKey = secp256k1.publicKeyCreate(privateKey);
  
  // Generate Stacks address
  const address = generateStacksAddress(publicKey, network);
  
  return {
    privateKey: '0x' + privateKey.toString('hex'),
    publicKey: '0x' + publicKey.toString('hex'),
    address: address,
    network: network
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
  // For now, we'll generate a mock address based on the public key
  const keyHash = crypto.createHash('sha256').update(publicKey).digest('hex');
  const prefix = network === 'mainnet' ? 'SP' : 'ST';
  return prefix + keyHash.substring(0, 40).toUpperCase();
}

/**
 * Generate multiple wallets
 * @param {number} count - Number of wallets to generate
 * @param {string} network - 'testnet' or 'mainnet'
 * @returns {Array} - Array of wallet objects
 */
function generateMultipleWallets(count = 1, network = 'testnet') {
  const wallets = [];
  for (let i = 0; i < count; i++) {
    wallets.push(generateStacksWallet(network));
  }
  return wallets;
}

/**
 * Generate .env file content
 * @param {Object} wallet - Wallet object
 * @param {Object} serverWallet - Server wallet object (optional)
 * @returns {string} - .env file content
 */
function generateEnvFile(wallet, serverWallet = null) {
  const server = serverWallet || generateStacksWallet(wallet.network);
  
  return `# Generated wallet configuration
# Generated on: ${new Date().toISOString()}

# Wallet Configuration
WALLET_PRIVATE_KEY=${wallet.privateKey}
WALLET_PUBLIC_KEY=${wallet.publicKey}
WALLET_ADDRESS=${wallet.address}

# Server Configuration
SERVER_PRIVATE_KEY=${server.privateKey}
SERVER_PUBLIC_KEY=${server.publicKey}

# Contract Configuration
CONTRACT_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9
CONTRACT_NAME=shooter-game

# Game Configuration
DEFAULT_GAME_ID=1
DEFAULT_REWARD_AMOUNT=1000000
DISPUTE_WINDOW_BLOCKS=120

# Network Configuration
STACKS_NETWORK=${wallet.network}
STACKS_RPC_URL=${wallet.network === 'mainnet' 
  ? 'https://stacks-node-api.mainnet.stacks.co' 
  : 'https://stacks-node-api.testnet.stacks.co'
}
`;
}

/**
 * Save wallet to .env file
 * @param {Object} wallet - Wallet object
 * @param {string} filename - Output filename (default: '.env')
 */
function saveWalletToEnv(wallet, filename = '.env') {
  const fs = require('fs');
  const envContent = generateEnvFile(wallet);
  fs.writeFileSync(filename, envContent);
  console.log(`✅ Wallet saved to ${filename}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const network = args.includes('--mainnet') ? 'mainnet' : 'testnet';
  const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 1;
  const saveEnv = args.includes('--save-env');
  
  console.log(`🔑 Generating ${count} ${network} wallet(s)...\n`);
  
  if (count === 1) {
    const wallet = generateStacksWallet(network);
    
    console.log('=== Generated Wallet ===');
    console.log(`Network: ${wallet.network}`);
    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log(`Public Key: ${wallet.publicKey}`);
    console.log(`Public Key (hex): ${wallet.publicKey.replace('0x', '')}`);
    
    if (saveEnv) {
      saveWalletToEnv(wallet);
    }
    
    console.log('\n=== Usage ===');
    console.log('1. Copy the keys above to your .env file');
    console.log('2. Or run: node scripts/generate_wallet.js --save-env');
    console.log('3. Then run: npm run sign');
    
  } else {
    const wallets = generateMultipleWallets(count, network);
    
    console.log(`=== Generated ${count} Wallets ===`);
    wallets.forEach((wallet, index) => {
      console.log(`\nWallet ${index + 1}:`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Private Key: ${wallet.privateKey}`);
      console.log(`  Public Key: ${wallet.publicKey}`);
    });
  }
}

// Export functions for use in other scripts
module.exports = {
  generateStacksWallet,
  generateMultipleWallets,
  generateEnvFile,
  saveWalletToEnv
};

// Run if called directly
if (require.main === module) {
  main();
}
