'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';

// Static imports for better reliability
let connect: any = null;
let isConnected: any = null;
let disconnect: any = null;
let getLocalStorage: any = null;
let request: any = null;

// Load the library once
const loadStacksConnect = async () => {
    if (typeof window === 'undefined') return false;
    
    try {
        // Use dynamic import but cache the result
        if (!connect) {
            const stacksConnect = await import('@stacks/connect');
            connect = stacksConnect.connect;
            isConnected = stacksConnect.isConnected;
            disconnect = stacksConnect.disconnect;
            getLocalStorage = stacksConnect.getLocalStorage;
            request = stacksConnect.request;
        }
        return true;
    } catch (error) {
        console.error('Failed to load @stacks/connect:', error);
        return false;
    }
};

interface OfficialStacksConnectorProps {
    user: {
        id: string;
        username: string;
    };
    onSuccess: (user: any) => void;
    disabled?: boolean;
}

export const OfficialStacksConnector: React.FC<OfficialStacksConnectorProps> = ({
    user,
    onSuccess,
    disabled = false
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [userAddresses, setUserAddresses] = useState<any>(null);
    const [libraryLoaded, setLibraryLoaded] = useState(false);

    // Load library on mount
    useEffect(() => {
        const initializeLibrary = async () => {
            const loaded = await loadStacksConnect();
            setLibraryLoaded(loaded);
            
            if (loaded) {
                checkConnectionStatus();
            }
        };
        
        initializeLibrary();
    }, []);

    const checkConnectionStatus = () => {
        if (!isConnected) return;
        
        try {
            const connected = isConnected();
            setIsWalletConnected(connected);
            
            if (connected && getLocalStorage) {
                const userData = getLocalStorage();
                setUserAddresses(userData);
                console.log('Wallet already connected:', userData);
            }
        } catch (error) {
            console.error('Error checking connection status:', error);
        }
    };

    const connectWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!libraryLoaded) {
                throw new Error('Stacks Connect library is still loading. Please wait...');
            }

            if (!connect) {
                throw new Error('Stacks Connect library failed to load. Please refresh the page.');
            }

            console.log('Attempting to connect to Stacks wallet...');

            // Check if already connected
            if (isConnected && isConnected()) {
                console.log('Already authenticated');
                checkConnectionStatus();
                return;
            }

            // Connect to wallet
            const response = await connect();
            console.log('Wallet connected:', response);

            if (response && response.addresses) {
                setUserAddresses(response);
                setIsWalletConnected(true);
                
                // Extract STX address
                let stxAddress: string | null = null;
                
                if (response.addresses.stx && Array.isArray(response.addresses.stx)) {
                    stxAddress = response.addresses.stx[0]?.address;
                } else if (response.addresses && Array.isArray(response.addresses)) {
                    stxAddress = response.addresses[0]?.address;
                } else if (typeof response.addresses === 'string') {
                    stxAddress = response.addresses;
                }
                
                if (!stxAddress) {
                    throw new Error('No STX address found in wallet response');
                }
                
                console.log('STX Address:', stxAddress);

                // Create authentication message
                const message = `Connect Stacks wallet to W3P account: ${user.username}`;
                const timestamp = Date.now();
                const fullMessage = `${message}\nTimestamp: ${timestamp}`;

                // Try to get signature (optional)
                let signature = null;
                try {
                    if (request) {
                        console.log('Requesting signature...');
                        const signatureResponse = await request('stx_signMessage', {
                            message: fullMessage,
                            address: stxAddress,
                        });
                        signature = signatureResponse?.signature;
                        console.log('Signature obtained:', !!signature);
                    }
                } catch (signError) {
                    console.log('Signature not available, continuing without:', signError);
                }

                // Send to server
                console.log('Sending connection request to server...');
                const connectResponse = await fetch('/api/stacks/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        stacksAddress: stxAddress,
                        signature,
                        message: fullMessage,
                        userId: user.id,
                        timestamp,
                    }),
                });

                const connectData = await connectResponse.json();
                console.log('Server response:', connectData);

                if (connectResponse.ok && connectData.success) {
                    console.log('Wallet connected successfully to server');
                    onSuccess(connectData.user);
                } else {
                    throw new Error(connectData.error || 'Failed to connect wallet to server');
                }
            } else {
                throw new Error('Failed to get addresses from wallet');
            }

        } catch (error: any) {
            console.error('Wallet connection error:', error);
            
            // Handle specific error cases
            if (error.message.includes('User rejected') || error.message.includes('User denied')) {
                setError('Connection cancelled by user');
            } else if (error.message.includes('No wallet') || error.message.includes('not found')) {
                setError('No Stacks wallet found. Please install Leather wallet extension.');
            } else if (error.message.includes('library')) {
                setError('Library loading error. Please refresh the page and try again.');
            } else {
                setError(error.message || 'Failed to connect wallet');
            }
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!libraryLoaded || !disconnect) {
                throw new Error('Stacks Connect library not loaded');
            }

            // Disconnect from Stacks Connect
            disconnect();
            console.log('Wallet disconnected from Stacks Connect');

            // Also disconnect from server
            const response = await fetch('/api/stacks/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUserAddresses(null);
                setIsWalletConnected(false);
                onSuccess(data.user);
                console.log('Wallet disconnected from server');
            } else {
                throw new Error(data.error || 'Failed to disconnect wallet from server');
            }
        } catch (error: any) {
            console.error('Disconnect error:', error);
            setError(error.message || 'Failed to disconnect wallet');
        } finally {
            setLoading(false);
        }
    };

    // Show connected state
    if (isWalletConnected && userAddresses) {
        let stxAddress = null;
        
        if (userAddresses.addresses?.stx && Array.isArray(userAddresses.addresses.stx)) {
            stxAddress = userAddresses.addresses.stx[0]?.address;
        } else if (userAddresses.addresses && Array.isArray(userAddresses.addresses)) {
            stxAddress = userAddresses.addresses[0]?.address;
        }
        
        return (
            <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-green-400 font-medium">Stacks Wallet Connected</p>
                            {stxAddress && (
                                <p className="text-green-300 text-sm font-mono">
                                    {stxAddress.slice(0, 8)}...{stxAddress.slice(-8)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <Button
                    onClick={disconnectWallet}
                    disabled={loading || disabled || !libraryLoaded}
                    variant="outline"
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Disconnecting...
                        </>
                    ) : (
                        <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Disconnect Stacks Wallet
                        </>
                    )}
                </Button>
            </div>
        );
    }

    // Show not connected state
    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <Button
                onClick={connectWallet}
                disabled={loading || disabled || !libraryLoaded}
                className="w-full"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Connecting...
                    </>
                ) : !libraryLoaded ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Loading Library...
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Stacks Wallet
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                {!libraryLoaded 
                    ? 'Loading Stacks Connect library...'
                    : 'Connect your Leather or other Stacks wallet to access blockchain features'
                }
            </p>
        </div>
    );
};
