// simulate_flow.js
// End-to-end flow simulation for shooter-game contract

require('dotenv').config();
const { generateTestData, createReportResultTx } = require('./sign_payload.js');

/**
 * Simulates the complete game flow from session start to reward claim
 */
class ShooterGameFlowSimulator {
  constructor() {
    this.sessions = new Map();
    this.trustedServers = new Set();
    this.processedResults = new Set();
  }
  
  /**
   * Simulate starting a game session
   */
  startSession(player, gameId) {
    const sessionId = this.sessions.size;
    const session = {
      id: sessionId,
      player,
      gameId,
      startBlock: Date.now(),
      endBlock: null,
      canonicalScore: null,
      resultHash: null,
      status: 'open'
    };
    
    this.sessions.set(sessionId, session);
    console.log(`Session ${sessionId} started for player ${player}`);
    return sessionId;
  }
  
  /**
   * Simulate off-chain gameplay and result generation
   */
  simulateGameplay(sessionId, gameResult) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (session.status !== 'open') {
      throw new Error(`Session ${sessionId} is not open`);
    }
    
    // Simulate game logic
    const finalScore = gameResult.score + Math.floor(Math.random() * 100);
    const finalKills = gameResult.kills + Math.floor(Math.random() * 5);
    
    const result = {
      ...gameResult,
      sessionId,
      score: finalScore,
      kills: finalKills,
      timestamp: Date.now()
    };
    
    console.log(`Gameplay completed for session ${sessionId}:`, {
      score: finalScore,
      kills: finalKills
    });
    
    return result;
  }
  
  /**
   * Simulate server signing the result
   */
  signResult(gameResult, serverPrivateKey) {
    // Use environment server keys or generate new ones
    let serverPubkey, serverPrivkey;
    
    if (process.env.SERVER_PUBLIC_KEY && process.env.SERVER_PRIVATE_KEY) {
      serverPubkey = process.env.SERVER_PUBLIC_KEY.replace('0x', '');
      serverPrivkey = process.env.SERVER_PRIVATE_KEY.replace('0x', '');
      console.log("Using server keys from environment variables");
    } else {
      const testData = generateTestData();
      serverPubkey = testData.publicKey;
      serverPrivkey = testData.privateKey;
      console.log("Generated new server keys (set SERVER_* environment variables to use your keys)");
    }
    
    // Generate result hash and signature
    const testData = generateTestData();
    const { resultHash, signature } = testData;
    
    // Store server public key as trusted
    this.trustedServers.add(serverPubkey);
    
    console.log(`Server signed result for session ${gameResult.sessionId}`);
    console.log(`Result hash: ${resultHash}`);
    console.log(`Signature: ${signature}`);
    console.log(`Server public key: ${serverPubkey}`);
    
    return {
      resultHash,
      signature,
      publicKey: serverPubkey,
      serverPrivateKey: serverPrivkey
    };
  }
  
  /**
   * Simulate player submitting result to contract
   */
  submitResult(sessionId, resultHash, signature, publicKey, meta = null) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Check if server is trusted
    if (!this.trustedServers.has(publicKey)) {
      throw new Error('Untrusted server');
    }
    
    // Check for replay
    if (this.processedResults.has(resultHash)) {
      throw new Error('Replay attack detected');
    }
    
    // Mark result as processed
    this.processedResults.add(resultHash);
    
    // Update session
    session.endBlock = Date.now();
    session.resultHash = resultHash;
    session.status = 'finalized';
    
    console.log(`Result submitted for session ${sessionId}`);
    console.log(`Session status: ${session.status}`);
    
    return true;
  }
  
  /**
   * Simulate claiming reward
   */
  claimReward(sessionId, ftContract = null, amount) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (session.status !== 'finalized') {
      throw new Error(`Session ${sessionId} is not finalized`);
    }
    
    // Use environment default reward amount if not specified
    const rewardAmount = amount || parseInt(process.env.DEFAULT_REWARD_AMOUNT) || 1000000;
    
    const reward = {
      sessionId,
      player: session.player,
      ftContract,
      amount: rewardAmount,
      claimedAt: Date.now()
    };
    
    console.log(`Reward claimed for session ${sessionId}:`, {
      player: session.player,
      amount: rewardAmount,
      token: ftContract || 'STX'
    });
    
    return reward;
  }
  
  /**
   * Simulate opening a dispute
   */
  openDispute(sessionId, reason) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Check dispute window (simplified)
    const disputeWindow = 120 * 1000; // 120 seconds in this simulation
    const timeSinceEnd = Date.now() - (session.endBlock || 0);
    
    if (timeSinceEnd > disputeWindow) {
      throw new Error('Dispute window expired');
    }
    
    session.status = 'disputed';
    console.log(`Dispute opened for session ${sessionId}: ${reason}`);
    
    return true;
  }
  
  /**
   * Get session details
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
  
  /**
   * List all sessions
   */
  listSessions() {
    return Array.from(this.sessions.values());
  }
}

/**
 * Run complete flow simulation
 */
function runCompleteSimulation() {
  console.log("=== Shooter Game Flow Simulation ===\n");
  
  const simulator = new ShooterGameFlowSimulator();
  
  try {
    // 1. Start session
    const sessionId = simulator.startSession(
      "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
      1
    );
    
    // 2. Simulate gameplay
    const gameResult = simulator.simulateGameplay(sessionId, {
      score: 1000,
      kills: 15,
      player: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
      gameId: 1
    });
    
    // 3. Server signs result
    const serverKey = Buffer.from('a'.repeat(64), 'hex');
    const signedResult = simulator.signResult(gameResult, serverKey);
    
    // 4. Player submits result
    simulator.submitResult(
      sessionId,
      signedResult.resultHash,
      signedResult.signature,
      signedResult.publicKey
    );
    
    // 5. Claim reward
    const reward = simulator.claimReward(sessionId, null, 1000000);
    
    // 6. Show final session state
    const finalSession = simulator.getSession(sessionId);
    console.log("\n=== Final Session State ===");
    console.log(JSON.stringify(finalSession, null, 2));
    
    console.log("\n=== Transaction Data for Contract ===");
    const txData = createReportResultTx(
      sessionId,
      signedResult.resultHash,
      signedResult.signature,
      signedResult.publicKey
    );
    console.log(JSON.stringify(txData, null, 2));
    
  } catch (error) {
    console.error("Simulation failed:", error.message);
  }
}

/**
 * Run dispute simulation
 */
function runDisputeSimulation() {
  console.log("\n=== Dispute Simulation ===\n");
  
  const simulator = new ShooterGameFlowSimulator();
  
  try {
    // Start session and complete it
    const sessionId = simulator.startSession("SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9", 1);
    const gameResult = simulator.simulateGameplay(sessionId, { score: 1000, kills: 15, player: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9", gameId: 1 });
    const signedResult = simulator.signResult(gameResult, Buffer.from('a'.repeat(64), 'hex'));
    simulator.submitResult(sessionId, signedResult.resultHash, signedResult.signature, signedResult.publicKey);
    
    // Open dispute
    simulator.openDispute(sessionId, "Suspicious score");
    
    const disputedSession = simulator.getSession(sessionId);
    console.log("Disputed session:", disputedSession);
    
  } catch (error) {
    console.error("Dispute simulation failed:", error.message);
  }
}

// Export for use in other scripts
module.exports = {
  ShooterGameFlowSimulator,
  runCompleteSimulation,
  runDisputeSimulation
};

// Run simulations if called directly
if (require.main === module) {
  runCompleteSimulation();
  runDisputeSimulation();
}
