/**
 * Blockchain Integration Service for Client
 * Handles communication with Stacks blockchain through server API
 */

export interface BlockchainSessionData {
  blockchainEnabled: boolean;
  blockchainSessionId: string | null;
  playerAddresses: Record<string, string>;
  blockchainResults: Array<{
    playerId: string;
    sessionId: string;
    txId: string;
    resultHash: string;
  }>;
}

export interface BlockchainStatus {
  enabled: boolean;
  network: string;
  registryContract: string;
  shooterContract: string;
}

export interface TransactionStatus {
  success: boolean;
  status?: string;
  data?: any;
  error?: string;
}

export class BlockchainService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/blockchain';
  }

  /**
   * Get blockchain integration status
   */
  async getStatus(): Promise<BlockchainStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Failed to get blockchain status:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      return null;
    }
  }

  /**
   * Set player blockchain address
   */
  async setPlayerAddress(
    roomId: string, 
    playerId: string, 
    address: string, 
    nftTokenId?: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/set-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          playerId,
          address,
          nftTokenId
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting player address:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/tx/${txId}/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get game session blockchain data
   */
  async getSessionData(roomId: string): Promise<BlockchainSessionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/room/${roomId}/session-data`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Failed to get session data:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  /**
   * Submit manual game result (for testing)
   */
  async submitResult(
    playerAddress: string,
    score: number,
    gameType: string,
    metadata?: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerAddress,
          score,
          gameType,
          metadata
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting result:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Setup reward for session (admin only)
   */
  async setupReward(
    sessionId: string,
    playerAddress: string,
    amount: number,
    ftContract?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/setup-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          playerAddress,
          amount,
          ftContract
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting up reward:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Register game module (admin only)
   */
  async registerModule(moduleData: {
    name: string;
    description: string;
    version: string;
    contractAddress: string;
    category: string;
    minStake?: number;
    maxPlayers?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/register-module`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering module:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
