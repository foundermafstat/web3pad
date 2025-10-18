import { uploadNFTAssets, generateGameAchievementMetadata, generateGameItemMetadata } from './ipfs-client';
import { mintNFT, getContractAddress, type GameAchievement, type GameItem, type MintNFTParams } from './nft-demo';

export class NFTService {
  private static instance: NFTService;
  private userPrivateKey: string | null = null;

  private constructor() {}

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  // Set user private key for transactions
  public setUserPrivateKey(privateKey: string): void {
    this.userPrivateKey = privateKey;
  }

  // Clear user private key
  public clearUserPrivateKey(): void {
    this.userPrivateKey = null;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.userPrivateKey !== null;
  }

  // Mint NFT for game achievement
  public async mintAchievementNFT(
    achievement: GameAchievement,
    userAddress: string
  ): Promise<{ txId: string; tokenId: number; metadataUrl: string }> {
    if (!this.userPrivateKey) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate metadata
      const metadata = generateGameAchievementMetadata(achievement);

      // Upload assets to IPFS
      const { metadataHash, metadataUrl } = await uploadNFTAssets(
        achievement.imageFile || new Blob(), // Create empty blob if no image
        metadata
      );

      // Mint NFT
      const mintParams: MintNFTParams = {
        recipient: userAddress,
        tokenUri: metadataUrl,
        memo: `Achievement: ${achievement.name}`,
      };

      const { txId, tokenId } = await mintNFT(mintParams, this.userPrivateKey);

      return {
        txId,
        tokenId,
        metadataUrl,
      };
    } catch (error) {
      console.error('Error minting achievement NFT:', error);
      throw new Error('Failed to mint achievement NFT');
    }
  }

  // Mint NFT for game item
  public async mintItemNFT(
    item: GameItem,
    userAddress: string
  ): Promise<{ txId: string; tokenId: number; metadataUrl: string }> {
    if (!this.userPrivateKey) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate metadata
      const metadata = generateGameItemMetadata(item);

      // Upload assets to IPFS
      const { metadataHash, metadataUrl } = await uploadNFTAssets(
        item.imageFile || new Blob(), // Create empty blob if no image
        metadata
      );

      // Mint NFT
      const mintParams: MintNFTParams = {
        recipient: userAddress,
        tokenUri: metadataUrl,
        memo: `Item: ${item.name}`,
      };

      const { txId, tokenId } = await mintNFT(mintParams, this.userPrivateKey);

      return {
        txId,
        tokenId,
        metadataUrl,
      };
    } catch (error) {
      console.error('Error minting item NFT:', error);
      throw new Error('Failed to mint item NFT');
    }
  }

  // Mint custom NFT
  public async mintCustomNFT(
    name: string,
    description: string,
    imageFile: File,
    attributes: Array<{ trait_type: string; value: string | number }>,
    userAddress: string,
    gameType?: string,
    gameStats?: any
  ): Promise<{ txId: string; tokenId: number; metadataUrl: string }> {
    if (!this.userPrivateKey) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate metadata
      const metadata = {
        name,
        description,
        attributes,
        gameType,
        gameStats,
      };

      // Upload assets to IPFS
      const { metadataHash, metadataUrl } = await uploadNFTAssets(imageFile, metadata);

      // Mint NFT
      const mintParams: MintNFTParams = {
        recipient: userAddress,
        tokenUri: metadataUrl,
        memo: `Custom NFT: ${name}`,
      };

      const { txId, tokenId } = await mintNFT(mintParams, this.userPrivateKey);

      return {
        txId,
        tokenId,
        metadataUrl,
      };
    } catch (error) {
      console.error('Error minting custom NFT:', error);
      throw new Error('Failed to mint custom NFT');
    }
  }

  // Generate achievement NFT from game session
  public generateAchievementFromSession(
    gameType: string,
    score: number,
    level: number,
    sessionData: any
  ): GameAchievement {
    const achievements = [
      {
        name: 'First Steps',
        description: 'Completed your first game session',
        minScore: 0,
        rarity: 'common',
      },
      {
        name: 'Rising Star',
        description: 'Scored over 500 points',
        minScore: 500,
        rarity: 'rare',
      },
      {
        name: 'Game Master',
        description: 'Scored over 1000 points',
        minScore: 1000,
        rarity: 'epic',
      },
      {
        name: 'Legendary Player',
        description: 'Scored over 2000 points',
        minScore: 2000,
        rarity: 'legendary',
      },
    ];

    const achievement = achievements
      .filter(a => score >= a.minScore)
      .sort((a, b) => b.minScore - a.minScore)[0];

    return {
      name: achievement.name,
      description: achievement.description,
      gameType,
      score,
      level,
      timestamp: Date.now(),
    };
  }

  // Generate item NFT from game session
  public generateItemFromSession(
    gameType: string,
    sessionData: any
  ): GameItem | null {
    // Simple logic to determine if player earned an item
    const score = sessionData.score || 0;
    const level = sessionData.level || 1;

    if (score < 100) return null; // No item for low scores

    const items = [
      {
        name: 'Basic Weapon',
        description: 'A simple weapon for beginners',
        itemType: 'weapon' as const,
        rarity: 'common' as const,
        minScore: 100,
        stats: { damage: 10, speed: 5 },
      },
      {
        name: 'Power Shield',
        description: 'A protective shield that absorbs damage',
        itemType: 'powerup' as const,
        rarity: 'rare' as const,
        minScore: 500,
        stats: { defense: 20, duration: 30 },
      },
      {
        name: 'Legendary Sword',
        description: 'A powerful sword with magical properties',
        itemType: 'weapon' as const,
        rarity: 'legendary' as const,
        minScore: 1500,
        stats: { damage: 50, speed: 10, magic: 25 },
      },
    ];

    const item = items
      .filter(i => score >= i.minScore)
      .sort((a, b) => b.minScore - a.minScore)[0];

    if (!item) return null;

    return {
      name: item.name,
      description: item.description,
      gameType,
      itemType: item.itemType,
      rarity: item.rarity,
      stats: item.stats,
    };
  }

  // Get contract addresses
  public getContractAddresses() {
    return {
      registry: getContractAddress('registry'),
      nft: getContractAddress('nft'),
      ft: getContractAddress('ft'),
    };
  }
}

// Export singleton instance
export const nftService = NFTService.getInstance();
