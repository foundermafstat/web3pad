import prisma from '../lib/prisma.js';

// Middleware to check if user has Stacks wallet connected
export const requireStacksConnection = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.body?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                stacksAddress: true,
                stacksConnected: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.stacksConnected || !user.stacksAddress) {
            return res.status(403).json({ 
                error: 'Stacks wallet connection required',
                requiresStacks: true,
            });
        }

        // Add Stacks info to request
        req.stacksInfo = {
            address: user.stacksAddress,
            connected: user.stacksConnected,
        };

        next();
    } catch (error) {
        console.error('Stacks middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check Stacks connection status (optional)
export const checkStacksConnection = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.body?.userId;

        if (!userId) {
            return next(); // Skip check if no user
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                stacksAddress: true,
                stacksConnected: true,
            },
        });

        if (user) {
            req.stacksInfo = {
                address: user.stacksAddress,
                connected: user.stacksConnected,
            };
        }

        next();
    } catch (error) {
        console.error('Stacks check middleware error:', error);
        next(); // Continue even if check fails
    }
};

// Utility function to validate Stacks address format
export const validateStacksAddress = (address) => {
    if (!address) return false;
    
    // Basic validation for Stacks address format
    // Stacks addresses typically start with 'SP' (mainnet) or 'ST' (testnet)
    const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(address);
    
    return isValidFormat;
};

// Utility function to get network info from address
export const getStacksNetworkInfo = (address) => {
    if (!address) return null;
    
    if (address.startsWith('SP')) {
        return { network: 'mainnet', chain: 'stacks' };
    } else if (address.startsWith('ST')) {
        return { network: 'testnet', chain: 'stacks' };
    }
    
    return null;
};
