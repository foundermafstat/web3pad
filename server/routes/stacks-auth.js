import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Network configuration will be handled by the client-side Stacks.js library

// Connect Stacks wallet to existing user
router.post('/connect', async (req, res) => {
    try {
        const { stacksAddress, signature, message, userId } = req.body;

        if (!stacksAddress || !signature || !message || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Basic signature validation - in production, implement full signature verification
        if (!signature || signature.length < 10) {
            return res.status(401).json({ error: 'Invalid signature format' });
        }

        // TODO: Implement full signature verification using Stacks.js
        // For now, we trust the client-side verification

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if Stacks address is already connected to another user
        const existingUser = await prisma.user.findUnique({
            where: { stacksAddress: stacksAddress.toLowerCase() },
        });

        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ error: 'Stacks address already connected to another account' });
        }

        // Update user with Stacks address
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                stacksAddress: stacksAddress.toLowerCase(),
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

        res.json({
            success: true,
            user: updatedUser,
            message: 'Stacks wallet connected successfully',
        });

    } catch (error) {
        console.error('Stacks connect error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Disconnect Stacks wallet
router.post('/disconnect', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Update user to disconnect Stacks wallet
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                stacksAddress: null,
                stacksConnected: false,
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

        res.json({
            success: true,
            user: updatedUser,
            message: 'Stacks wallet disconnected successfully',
        });

    } catch (error) {
        console.error('Stacks disconnect error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Stacks connection status
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

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

        res.json({
            stacksAddress: user.stacksAddress,
            stacksConnected: user.stacksConnected,
        });

    } catch (error) {
        console.error('Stacks status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Stacks address format
router.post('/verify-address', async (req, res) => {
    try {
        const { stacksAddress } = req.body;

        if (!stacksAddress) {
            return res.status(400).json({ error: 'Stacks address is required' });
        }

        // Basic validation for Stacks address format
        // Stacks addresses typically start with 'SP' (mainnet) or 'ST' (testnet)
        const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(stacksAddress);

        if (!isValidFormat) {
            return res.status(400).json({ 
                error: 'Invalid Stacks address format',
                valid: false 
            });
        }

        // Check if address is already connected
        const existingUser = await prisma.user.findUnique({
            where: { stacksAddress: stacksAddress.toLowerCase() },
        });

        res.json({
            valid: true,
            available: !existingUser,
            message: existingUser ? 'Address already connected' : 'Address is available',
        });

    } catch (error) {
        console.error('Stacks address verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
