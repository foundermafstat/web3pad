import { STACKS_TESTNET } from '@stacks/network';
import { 
  broadcastTransaction, 
  makeContractCall, 
  AnchorMode, 
  PostConditionMode,
  createAssetInfo,
  FungibleConditionCode,
  makeStandardFungiblePostCondition
} from '@stacks/transactions';
import { createHash, randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';

/**
 * Stacks Blockchain Integration Service
 * Handles sending game results to smart contracts
 */
export class StacksIntegrationService {
  constructor(config = {}) {
    // Network configuration
    this.network = config.network === 'mainnet' 
      ? { coreApiUrl: 'https://api.stacks.co' }
      : STACKS_TESTNET;
    
    // Contract addresses
    this.registryContractAddress = config.registryContractAddress || process.env.STACKS_REGISTRY_CONTRACT || 'ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.registry';
    this.shooterGameContractAddress = config.shooterGameContractAddress || process.env.STACKS_SHOOTER_CONTRACT || 'ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.shooter-game';
    
    // Server configuration
    this.serverPrivateKey = config.serverPrivateKey || process.env.STACKS_SERVER_PRIVATE_KEY;
    this.serverPublicKey = config.serverPublicKey || process.env.STACKS_SERVER_PUBLIC_KEY;
    
    // Contract names
    this.registryContractName = 'registry';
    this.shooterGameContractName = 'shooter-game';
    
    if (!this.serverPrivateKey || !this.serverPublicKey) {
      console.warn('[StacksIntegration] Server keys not configured - blockchain integration disabled');
      this.enabled = false;
    } else {
      this.enabled = true;
      console.log('[StacksIntegration] Service initialized with network:', this.network.coreApiUrl);
    }
  }

  /**
   * Generate a unique session ID for blockchain
   */
  generateSessionId() {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  /**
   * Create a result hash for game verification
   */
  createResultHash(gameData) {
    const dataString = JSON.stringify({
      sessionId: gameData.sessionId,
      player: gameData.player,
      score: gameData.score,
      gameType: gameData.gameType,
      timestamp: gameData.timestamp,
      metadata: gameData.metadata
    });
    
    return createHash('sha256').update(dataString).digest();
  }

  /**
   * Sign game result with server private key
   */
  signResult(resultHash) {
    if (!this.enabled) {
      throw new Error('Stacks integration not enabled - server keys not configured');
    }

    try {
      const privateKeyBuffer = Buffer.from(this.serverPrivateKey, 'hex');
      const hashBuffer = Buffer.isBuffer(resultHash) ? resultHash : Buffer.from(resultHash, 'hex');
      
      const signature = secp256k1.ecdsaSign(hashBuffer, privateKeyBuffer);
      return signature.signature;
    } catch (error) {
      console.error('[StacksIntegration] Error signing result:', error);
      throw error;
    }
  }

  /**
   * Send game result to shooter game contract
   */
  async sendGameResult(gameResult) {
    if (!this.enabled) {
      console.warn('[StacksIntegration] Blockchain integration disabled - skipping result submission');
      return { success: false, error: 'Blockchain integration disabled' };
    }

    try {
      // Prepare game data
      const sessionId = this.generateSessionId();
      const resultHash = this.createResultHash({
        sessionId,
        player: gameResult.playerAddress,
        score: gameResult.score,
        gameType: gameResult.gameType,
        timestamp: Date.now(),
        metadata: gameResult.metadata || {}
      });

      // Sign the result
      const signature = this.signResult(resultHash);

      // Calculate experience gained (simplified formula)
      const expGained = Math.floor(gameResult.score / 10) + 1;

      // Create contract call
      const contractCall = await makeContractCall({
        contractAddress: this.shooterGameContractAddress,
        contractName: this.shooterGameContractName,
        functionName: 'report-result',
        functionArgs: [
          { type: 'uint', value: sessionId.toString() },
          { type: 'buff', value: resultHash },
          { type: 'buff', value: signature },
          { type: 'buff', value: Buffer.from(this.serverPublicKey, 'hex') },
          { type: 'uint', value: gameResult.score.toString() },
          { type: 'uint', value: expGained.toString() },
          { type: 'optional', value: { type: 'buff', value: Buffer.from(JSON.stringify(gameResult.metadata || {})) } }
        ],
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 1000, // 1000 microSTX fee
        senderKey: this.serverPrivateKey
      });

      // Broadcast transaction
      const broadcastResult = await broadcastTransaction(contractCall, this.network);
      
      if (broadcastResult) {
        console.log(`[StacksIntegration] Game result submitted for session ${sessionId}:`, {
          txId: broadcastResult.txid,
          score: gameResult.score,
          player: gameResult.playerAddress
        });

        return {
          success: true,
          sessionId,
          txId: broadcastResult.txid,
          resultHash: resultHash.toString('hex')
        };
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (error) {
      console.error('[StacksIntegration] Error sending game result:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start a game session on blockchain
   */
  async startGameSession(playerAddress, gameType = 'shooter', nftTokenId = null) {
    if (!this.enabled) {
      console.warn('[StacksIntegration] Blockchain integration disabled - skipping session start');
      return { success: false, error: 'Blockchain integration disabled' };
    }

    try {
      const sessionId = this.generateSessionId();

      // Create contract call to start session
      const contractCall = await makeContractCall({
        contractAddress: this.shooterGameContractAddress,
        contractName: this.shooterGameContractName,
        functionName: 'start-session',
        functionArgs: [
          { type: 'principal', value: playerAddress },
          { type: 'optional', value: nftTokenId ? { type: 'uint', value: nftTokenId.toString() } : null }
        ],
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 500, // 500 microSTX fee
        senderKey: this.serverPrivateKey
      });

      // Broadcast transaction
      const broadcastResult = await broadcastTransaction(contractCall, this.network);
      
      if (broadcastResult) {
        console.log(`[StacksIntegration] Game session started:`, {
          sessionId,
          txId: broadcastResult.txid,
          player: playerAddress
        });

        return {
          success: true,
          sessionId,
          txId: broadcastResult.txid
        };
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (error) {
      console.error('[StacksIntegration] Error starting game session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Setup reward for a completed session
   */
  async setupReward(sessionId, playerAddress, rewardAmount, ftContract = null) {
    if (!this.enabled) {
      console.warn('[StacksIntegration] Blockchain integration disabled - skipping reward setup');
      return { success: false, error: 'Blockchain integration disabled' };
    }

    try {
      // Create contract call to setup reward
      const contractCall = await makeContractCall({
        contractAddress: this.shooterGameContractAddress,
        contractName: this.shooterGameContractName,
        functionName: 'setup-reward',
        functionArgs: [
          { type: 'uint', value: sessionId.toString() },
          { type: 'optional', value: ftContract ? { type: 'principal', value: ftContract } : null },
          { type: 'uint', value: rewardAmount.toString() }
        ],
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 500, // 500 microSTX fee
        senderKey: this.serverPrivateKey
      });

      // Broadcast transaction
      const broadcastResult = await broadcastTransaction(contractCall, this.network);
      
      if (broadcastResult) {
        console.log(`[StacksIntegration] Reward setup for session ${sessionId}:`, {
          txId: broadcastResult.txid,
          amount: rewardAmount,
          player: playerAddress
        });

        return {
          success: true,
          txId: broadcastResult.txid
        };
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (error) {
      console.error('[StacksIntegration] Error setting up reward:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register a game module in the registry
   */
  async registerGameModule(moduleData) {
    if (!this.enabled) {
      console.warn('[StacksIntegration] Blockchain integration disabled - skipping module registration');
      return { success: false, error: 'Blockchain integration disabled' };
    }

    try {
      // Create contract call to register game module
      const contractCall = await makeContractCall({
        contractAddress: this.registryContractAddress,
        contractName: this.registryContractName,
        functionName: 'register-game-module',
        functionArgs: [
          { type: 'string-ascii', value: moduleData.name },
          { type: 'string-utf8', value: moduleData.description },
          { type: 'string-ascii', value: moduleData.version },
          { type: 'principal', value: moduleData.contractAddress },
          { type: 'string-ascii', value: moduleData.category },
          { type: 'uint', value: moduleData.minStake.toString() },
          { type: 'uint', value: moduleData.maxPlayers.toString() }
        ],
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 2000, // 2000 microSTX fee
        senderKey: this.serverPrivateKey
      });

      // Broadcast transaction
      const broadcastResult = await broadcastTransaction(contractCall, this.network);
      
      if (broadcastResult) {
        console.log(`[StacksIntegration] Game module registered:`, {
          txId: broadcastResult.txid,
          name: moduleData.name,
          category: moduleData.category
        });

        return {
          success: true,
          txId: broadcastResult.txid
        };
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (error) {
      console.error('[StacksIntegration] Error registering game module:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId) {
    try {
      const response = await fetch(`${this.network.coreApiUrl}/extended/v1/tx/${txId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: data.tx_status,
          data
        };
      } else {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }
    } catch (error) {
      console.error('[StacksIntegration] Error getting transaction status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const stacksIntegration = new StacksIntegrationService({
  network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
  registryContractAddress: process.env.STACKS_REGISTRY_CONTRACT,
  shooterGameContractAddress: process.env.STACKS_SHOOTER_CONTRACT,
  serverPrivateKey: process.env.STACKS_SERVER_PRIVATE_KEY,
  serverPublicKey: process.env.STACKS_SERVER_PUBLIC_KEY
});

export default stacksIntegration;
