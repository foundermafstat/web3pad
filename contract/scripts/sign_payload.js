// sign_payload.js
// Helper script to create test signatures for shooter-game contract

require('dotenv').config();
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

/**
 * Creates a canonical JSON payload for game results
 * @param {Object} gameResult - The game result data
 * @returns {string} - Canonical JSON string
 */
function createCanonicalPayload(gameResult) {
  // Ensure consistent key ordering and formatting
  const canonical = {
    sessionId: gameResult.sessionId,
    player: gameResult.player,
    gameId: gameResult.gameId,
    score: gameResult.score,
    kills: gameResult.kills,
    timestamp: gameResult.timestamp,
    metadata: gameResult.metadata || {}
  };
  
  // Sort keys and stringify with no spaces
  return JSON.stringify(canonical, Object.keys(canonical).sort());
}

/**
 * Computes SHA256 hash of the canonical payload
 * @param {string} payload - Canonical JSON payload
 * @returns {Buffer} - 32-byte hash
 */
function computeResultHash(payload) {
  return crypto.createHash('sha256').update(payload, 'utf8').digest();
}

/**
 * Signs a message hash with a private key
 * @param {Buffer} messageHash - 32-byte message hash
 * @param {Buffer} privateKey - 32-byte private key
 * @returns {Buffer} - 64-byte signature (r + s)
 */
function signMessage(messageHash, privateKey) {
  const signature = secp256k1.ecdsaSign(messageHash, privateKey);
  return signature.signature; // Returns 64-byte signature
}

/**
 * Gets compressed public key from private key
 * @param {Buffer} privateKey - 32-byte private key
 * @returns {Buffer} - 33-byte compressed public key
 */
function getCompressedPublicKey(privateKey) {
  const publicKey = secp256k1.publicKeyCreate(privateKey);
  return publicKey; // Already compressed (33 bytes)
}

/**
 * Main function to generate test data
 */
function generateTestData() {
  // Use environment variables or generate new keys
  let privateKey, publicKey, playerAddress;
  
  if (process.env.WALLET_PRIVATE_KEY && process.env.WALLET_PUBLIC_KEY && process.env.WALLET_ADDRESS) {
    // Use provided keys from environment
    privateKey = Buffer.from(process.env.WALLET_PRIVATE_KEY.replace('0x', ''), 'hex');
    
    // Handle different public key formats
    let publicKeyHex = process.env.WALLET_PUBLIC_KEY.replace('0x', '');
    if (publicKeyHex.includes(',')) {
      // Convert comma-separated format to hex
      const bytes = publicKeyHex.split(',').map(b => parseInt(b.trim()).toString(16).padStart(2, '0')).join('');
      publicKey = Buffer.from(bytes, 'hex');
    } else {
      publicKey = Buffer.from(publicKeyHex, 'hex');
    }
    
    playerAddress = process.env.WALLET_ADDRESS;
    console.log("Using wallet keys from environment variables");
  } else {
    // Generate new test keys
    privateKey = crypto.randomBytes(32);
    publicKey = getCompressedPublicKey(privateKey);
    playerAddress = "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9";
    console.log("Generated new test keys (set environment variables to use your keys)");
  }
  
  // Create test game result
  const gameResult = {
    sessionId: parseInt(process.env.DEFAULT_GAME_ID) || 0,
    player: playerAddress,
    gameId: parseInt(process.env.DEFAULT_GAME_ID) || 1,
    score: 1500,
    kills: 25,
    timestamp: Date.now(),
    metadata: {
      level: 5,
      difficulty: "hard"
    }
  };
  
  // Create canonical payload
  const payload = createCanonicalPayload(gameResult);
  console.log("Canonical Payload:", payload);
  
  // Compute hash
  const resultHash = computeResultHash(payload);
  console.log("Result Hash (hex):", resultHash.toString('hex'));
  
  // Sign the hash
  const signature = signMessage(resultHash, privateKey);
  console.log("Signature (hex):", signature.toString('hex'));
  
  // Get public key
  console.log("Public Key (hex):", publicKey.toString('hex'));
  
  // Verify signature
  const isValid = secp256k1.ecdsaVerify(signature, resultHash, publicKey);
  console.log("Signature Valid:", isValid);
  
  return {
    payload,
    resultHash: resultHash.toString('hex'),
    signature: signature.toString('hex'),
    publicKey: publicKey.toString('hex'),
    privateKey: privateKey.toString('hex')
  };
}

/**
 * Create transaction call data for report-result
 */
function createReportResultTx(sessionId, resultHash, signature, publicKey, meta = null) {
  const txData = {
    contractAddress: process.env.CONTRACT_ADDRESS || "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
    contractName: process.env.CONTRACT_NAME || "shooter-game",
    functionName: "report-result",
    functionArgs: [
      {
        type: "uint",
        value: sessionId.toString()
      },
      {
        type: "buff",
        value: "0x" + resultHash
      },
      {
        type: "buff", 
        value: "0x" + signature
      },
      {
        type: "buff",
        value: "0x" + publicKey
      },
      meta ? {
        type: "optional",
        value: {
          type: "buff",
          value: "0x" + meta
        }
      } : {
        type: "optional",
        value: null
      }
    ]
  };
  
  return txData;
}

// Export functions for use in other scripts
module.exports = {
  createCanonicalPayload,
  computeResultHash,
  signMessage,
  getCompressedPublicKey,
  generateTestData,
  createReportResultTx
};

// Run if called directly
if (require.main === module) {
  console.log("=== Shooter Game Test Data Generator ===");
  const testData = generateTestData();
  
  console.log("\n=== Transaction Call Data ===");
  const txData = createReportResultTx(
    0,
    testData.resultHash,
    testData.signature,
    testData.publicKey
  );
  console.log(JSON.stringify(txData, null, 2));
}
