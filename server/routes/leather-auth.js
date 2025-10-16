import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { verifyMessageSignature } from '@stacks/transactions';

const router = express.Router();

// Leather wallet authentication endpoint for NextAuth
router.post('/leather', async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate Stacks address format
        const isValidFormat = /^(SP|ST)[0-9A-Z]{39}$/.test(walletAddress);
        if (!isValidFormat) {
            return res.status(400).json({ 
                error: 'Invalid Stacks address format',
                valid: false 
            });
        }

        // Verify signature using Stacks.js
        try {
            const isValid = verifyMessageSignature({
                message: message,
                signature: signature,
                address: walletAddress,
            });
            
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            console.log('Stacks signature verification successful:', {
                address: walletAddress.toLowerCase(),
                hasSignature: !!signature,
                messageLength: message?.length || 0
            });
        } catch (error) {
            console.error('Signature verification failed:', error);
            return res.status(401).json({ error: 'Signature verification failed' });
        }

        // Check if user exists with this wallet address
        let user = await prisma.user.findUnique({
            where: { 
                stacksAddress: walletAddress.toLowerCase()
            },
        });

        // If user doesn't exist, create a new one
        if (!user) {
            // Generate a unique username based on wallet address
            const baseUsername = `user_${walletAddress.slice(-8).toLowerCase()}`;
            let username = baseUsername;
            let counter = 1;
            
            // Check if username exists and increment counter if needed
            while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}_${counter}`;
                counter++;
            }

            // Create user with minimal required fields
            user = await prisma.user.create({
                data: {
                    email: `${username}@stacks.local`, // Placeholder email
                    username,
                    password: await bcrypt.hash(walletAddress, 10), // Use wallet address as password hash
                    displayName: `Stacks User ${walletAddress.slice(-6)}`,
                    stacksAddress: walletAddress.toLowerCase(),
                    stacksConnected: true,
                    level: 1,
                    experience: 0,
                    coins: 100, // Starting coins for new users
                },
            });
        } else {
            // Update existing user's stacks address if needed
            if (!user.stacksAddress || user.stacksAddress !== walletAddress.toLowerCase()) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        stacksAddress: walletAddress.toLowerCase(),
                        stacksConnected: true,
                    },
                });
            }
        }

        // Return user data for session
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            walletAddress: user.stacksAddress,
            level: user.level,
            experience: user.experience,
            coins: user.coins,
        });

    } catch (error) {
        console.error('Leather auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Legacy endpoint for backward compatibility
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

        // Verify signature using Stacks.js
        try {
            const isValid = verifyMessageSignature({
                message: message,
                signature: signature,
                address: address,
            });
            
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            console.log('Stacks signature verification successful:', {
                address: address.toLowerCase(),
                hasSignature: !!signature,
                messageLength: message?.length || 0
            });
        } catch (error) {
            console.error('Signature verification failed:', error);
            return res.status(401).json({ error: 'Signature verification failed' });
        }

        // Check if user exists with this wallet address
        let user = await prisma.user.findUnique({
            where: { 
                stacksAddress: address.toLowerCase()
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatar: true,
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
                stacksAddress: true,
                stacksConnected: true,
                level: true,
                experience: true,
                coins: true,
            },
        });

        console.log('New user created from Stacks wallet:', {
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
                stacksAddress: address.toLowerCase()
            },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatar: true,
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
                stacksAddress: address.toLowerCase()
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
