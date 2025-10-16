import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Leather wallet authentication endpoint
router.post('/authenticate', async (req, res) => {
    try {
        const { address, signature, message, timestamp } = req.body;

        if (!address || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate Stacks address format
        const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(address);
        if (!isValidFormat) {
            return res.status(400).json({ 
                error: 'Invalid Stacks address format',
                valid: false 
            });
        }

        // TODO: Implement signature verification using Stacks.js
        // For now, we trust the client-side verification
        console.log('Leather authentication attempt:', {
            address: address.toLowerCase(),
            hasSignature: !!signature,
            messageLength: message?.length || 0
        });

        // Check if user exists with this wallet address
        let user = await prisma.user.findUnique({
            where: { 
                OR: [
                    { stacksAddress: address.toLowerCase() },
                    { walletAddress: address.toLowerCase() }
                ]
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatar: true,
                walletAddress: true,
                stacksAddress: true,
                stacksConnected: true,
                level: true,
                experience: true,
                coins: true,
            },
        });

        // If user exists, update their stacks address if needed
        if (user) {
            if (!user.stacksAddress || user.stacksAddress !== address.toLowerCase()) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        stacksAddress: address.toLowerCase(),
                        stacksConnected: true,
                    },
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        walletAddress: true,
                        stacksAddress: true,
                        stacksConnected: true,
                        level: true,
                        experience: true,
                        coins: true,
                    },
                });
            }

            return res.json({
                success: true,
                user,
                message: 'Wallet authentication successful',
                isNewUser: false,
            });
        }

        // If no user exists, create a new user based on wallet address
        const username = `user_${address.slice(-8).toLowerCase()}`;
        const displayName = `Player ${address.slice(-6).toUpperCase()}`;

        user = await prisma.user.create({
            data: {
                email: `${address.toLowerCase()}@wallet.local`, // Temporary email
                username,
                displayName,
                stacksAddress: address.toLowerCase(),
                stacksConnected: true,
                level: 1,
                experience: 0,
                coins: 100, // Starting coins for new users
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatar: true,
                walletAddress: true,
                stacksAddress: true,
                stacksConnected: true,
                level: true,
                experience: true,
                coins: true,
            },
        });

        console.log('New user created from Leather wallet:', {
            userId: user.id,
            address: address.toLowerCase(),
            username: user.username
        });

        return res.json({
            success: true,
            user,
            message: 'New account created and wallet connected',
            isNewUser: true,
        });

    } catch (error) {
        console.error('Leather authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by wallet address
router.get('/user/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        const user = await prisma.user.findUnique({
            where: { 
                OR: [
                    { stacksAddress: address.toLowerCase() },
                    { walletAddress: address.toLowerCase() }
                ]
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatar: true,
                walletAddress: true,
                stacksAddress: true,
                stacksConnected: true,
                level: true,
                experience: true,
                coins: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error('Get user by address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify wallet connection
router.post('/verify', async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        // Validate address format
        const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(address);
        if (!isValidFormat) {
            return res.status(400).json({ 
                error: 'Invalid Stacks address format',
                valid: false 
            });
        }

        // Check if address is already connected
        const existingUser = await prisma.user.findUnique({
            where: { 
                OR: [
                    { stacksAddress: address.toLowerCase() },
                    { walletAddress: address.toLowerCase() }
                ]
            },
            select: {
                id: true,
                username: true,
                stacksConnected: true,
            },
        });

        res.json({
            valid: true,
            connected: !!existingUser,
            user: existingUser,
            message: existingUser ? 'Wallet is connected to an account' : 'Wallet is not connected',
        });

    } catch (error) {
        console.error('Wallet verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
