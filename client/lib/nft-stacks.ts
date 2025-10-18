import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksNetwork, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { ENV_CONFIG } from '../env.config';

// Network configuration
const getNetwork = (): StacksNetwork => {
  if (ENV_CONFIG.NETWORK === 'mainnet') {
    return STACKS_MAINNET;
  }
  return STACKS_TESTNET;
};

// NFT Contract addresses (replace with actual deployed contracts)
const NFT_CONTRACTS = {
  testnet: {
    registry: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.registry',
    nft: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.game-nft',
    ft: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.game-ft',
  },
  mainnet: {
    registry: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.registry',
    nft: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.game-nft',
    ft: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.game-ft',
  },
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  external_url?: string;
  background_color?: string;
  animation_url?: string | null;
  youtube_url?: string | null;
  game_type?: string;
  game_stats?: any;
}

export interface MintNFTParams {
  recipient: string;
  tokenUri: string;
  memo?: string;
}

export interface GameAchievement {
  name: string;
  description: string;
  gameType: string;
  score: number;
  level: number;
  timestamp: number;
  imageFile?: File;
}

export interface GameItem {
  name: string;
  description: string;
  gameType: string;
  itemType: 'character' | 'weapon' | 'powerup' | 'skin';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: Record<string, number>;
  imageFile?: File;
}

// Get contract address
export function getContractAddress(contract: 'registry' | 'nft' | 'ft'): string {
  const network = ENV_CONFIG.NETWORK as 'testnet' | 'mainnet';
  return NFT_CONTRACTS[network][contract];
}

// Mint NFT function
export async function mintNFT(
  params: MintNFTParams,
  privateKey: string
): Promise<{ txId: string; tokenId: number }> {
  try {
    const network = getNetwork();
    const contractAddress = getContractAddress('nft');

    // Create mint transaction
    const txOptions = {
      contractAddress,
      contractName: 'game-nft',
      functionName: 'mint',
      functionArgs: [
        params.recipient,
        params.tokenUri,
        params.memo || '',
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    // Extract token ID from transaction result (this would need to be implemented based on your contract)
    const tokenId = Math.floor(Math.random() * 1000000); // Placeholder - should be extracted from transaction

    return {
      txId: broadcastResponse.txid,
      tokenId,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT');
  }
}

// Register game module in registry
export async function registerGameModule(
  moduleData: {
    name: string;
    description: string;
    version: string;
    contractAddress: string;
    category: string;
    minStake: number;
    maxPlayers: number;
  },
  privateKey: string
): Promise<{ txId: string; moduleId: number }> {
  try {
    const network = getNetwork();
    const contractAddress = getContractAddress('registry');

    const txOptions = {
      contractAddress,
      contractName: 'registry',
      functionName: 'register-game-module',
      functionArgs: [
        moduleData.name,
        moduleData.description,
        moduleData.version,
        moduleData.contractAddress,
        moduleData.category,
        moduleData.minStake,
        moduleData.maxPlayers,
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    const moduleId = Math.floor(Math.random() * 1000); // Placeholder - should be extracted from transaction

    return {
      txId: broadcastResponse.txid,
      moduleId,
    };
  } catch (error) {
    console.error('Error registering game module:', error);
    throw new Error('Failed to register game module');
  }
}

// Register NFT contract in registry
export async function registerNFTContract(
  nftData: {
    contractAddress: string;
    name: string;
    symbol: string;
    description: string;
    traitVersion: string;
    supportedModules: number[];
  },
  privateKey: string
): Promise<{ txId: string }> {
  try {
    const network = getNetwork();
    const contractAddress = getContractAddress('registry');

    const txOptions = {
      contractAddress,
      contractName: 'registry',
      functionName: 'register-nft-contract',
      functionArgs: [
        nftData.contractAddress,
        nftData.name,
        nftData.symbol,
        nftData.description,
        nftData.traitVersion,
        nftData.supportedModules,
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    return {
      txId: broadcastResponse.txid,
    };
  } catch (error) {
    console.error('Error registering NFT contract:', error);
    throw new Error('Failed to register NFT contract');
  }
}

// Get NFT data
export async function getNFTData(tokenId: number): Promise<{
  owner: string;
  tokenUri: string;
  metadata: NFTMetadata | null;
}> {
  try {
    // This would typically involve calling contract read-only functions
    // For now, return placeholder data
    return {
      owner: '',
      tokenUri: '',
      metadata: null,
    };
  } catch (error) {
    console.error('Error getting NFT data:', error);
    throw new Error('Failed to get NFT data');
  }
}

// Get user's NFTs
export async function getUserNFTs(userAddress: string): Promise<Array<{
  tokenId: number;
  tokenUri: string;
  metadata: NFTMetadata | null;
}>> {
  try {
    // This would typically involve calling contract read-only functions
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting user NFTs:', error);
    throw new Error('Failed to get user NFTs');
  }
}

// Transfer NFT
export async function transferNFT(
  tokenId: number,
  from: string,
  to: string,
  privateKey: string,
  memo?: string
): Promise<{ txId: string }> {
  try {
    const network = getNetwork();
    const contractAddress = getContractAddress('nft');

    const txOptions = {
      contractAddress,
      contractName: 'game-nft',
      functionName: 'transfer',
      functionArgs: [
        tokenId,
        from,
        to,
        memo || '',
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      throw new Error(`Transaction failed: ${broadcastResponse.error}`);
    }

    return {
      txId: broadcastResponse.txid,
    };
  } catch (error) {
    console.error('Error transferring NFT:', error);
    throw new Error('Failed to transfer NFT');
  }
}

// Utility function to format address
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Utility function to validate Stacks address
export function isValidStacksAddress(address: string): boolean {
  const stacksAddressRegex = /^[SM][0-9A-HJ-NP-Z]{38,39}$/;
  return stacksAddressRegex.test(address);
}
