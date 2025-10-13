import express from 'express';
import { ethers } from 'ethers';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Verify MetaMask signature and authenticate user
router.post('/metamask', async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate wallet address format
        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Verify the signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            
            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        } catch (error) {
            console.error('Signature verification failed:', error);
            return res.status(401).json({ error: 'Invalid signature format' });
        }

        // Find existing user by wallet address
        let user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
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
                    email: `${username}@metamask.local`, // Placeholder email
                    username,
                    password: await bcrypt.hash(walletAddress, 10), // Use wallet address as password hash
                    displayName: `MetaMask User ${walletAddress.slice(-6)}`,
                    walletAddress: walletAddress.toLowerCase(),
                },
            });
        }

        // Return user data for session
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            walletAddress: user.walletAddress,
            level: user.level,
            experience: user.experience,
            coins: user.coins,
        });

    } catch (error) {
        console.error('MetaMask auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
