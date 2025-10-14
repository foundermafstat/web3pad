// Stacks blockchain integration types

export interface StacksWalletInfo {
  address: string;
  connected: boolean;
  network: 'mainnet' | 'testnet';
}

export interface StacksConnectionStatus {
  address: string | null;
  connected: boolean;
}

export interface StacksAuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatar?: string;
    walletAddress?: string | null;
    stacksAddress?: string | null;
    stacksConnected: boolean;
    level: number;
    experience: number;
    coins: number;
  };
  message?: string;
}

export interface StacksConnectRequest {
  stacksAddress: string;
  signature: string;
  message: string;
  userId: string;
}

export interface StacksDisconnectRequest {
  userId: string;
}

export interface LeatherWalletResponse {
  addresses: Array<{
    address: string;
    publicKey: string;
    network: string;
  }>;
}

export interface LeatherSignatureResponse {
  signature: string;
  publicKey: string;
}

// Stacks network configuration
export const STACKS_NETWORKS = {
  mainnet: {
    coreApiUrl: 'https://api.stacks.co',
    explorerUrl: 'https://explorer.stacks.co',
    networkId: 1,
  },
  testnet: {
    coreApiUrl: 'https://api.testnet.stacks.co',
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    networkId: 2147483648,
  },
} as const;

export type StacksNetworkType = keyof typeof STACKS_NETWORKS;

// Validation utilities
export const validateStacksAddress = (address: string): boolean => {
  if (!address) return false;
  
  // Stacks addresses start with SP (mainnet) or ST (testnet) followed by 39 characters
  const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(address);
  
  return isValidFormat;
};

export const getStacksNetworkFromAddress = (address: string): StacksNetworkType | null => {
  if (!address) return null;
  
  if (address.startsWith('SP')) {
    return 'mainnet';
  } else if (address.startsWith('ST')) {
    return 'testnet';
  }
  
  return null;
};

export const formatStacksAddress = (address: string): string => {
  if (!address || address.length < 16) return address;
  
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
};
