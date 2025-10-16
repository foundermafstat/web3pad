import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        console.log('🔍 Checking for user_e6f410e7...');
        
        const user = await prisma.user.findUnique({
            where: { username: 'user_e6f410e7' },
            select: { 
                id: true, 
                username: true, 
                displayName: true, 
                stacksAddress: true,
                email: true,
                level: true,
                experience: true,
                coins: true
            }
        });
        
        if (user) {
            console.log('✅ User found:', user);
        } else {
            console.log('❌ User not found');
            
            // Check if user exists with stacksAddress
            const userByAddress = await prisma.user.findUnique({
                where: { stacksAddress: 'st1g646ab7vakzp6p6sva7s8p2h6t3z07e6f410e7' },
                select: { 
                    id: true, 
                    username: true, 
                    displayName: true, 
                    stacksAddress: true 
                }
            });
            
            if (userByAddress) {
                console.log('✅ User found by address:', userByAddress);
            } else {
                console.log('❌ User not found by address either');
                
                // List all users
                const allUsers = await prisma.user.findMany({
                    select: { id: true, username: true, stacksAddress: true }
                });
                console.log('📋 All users in database:', allUsers);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
