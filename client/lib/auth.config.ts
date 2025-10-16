import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { isValidStacksAddress } from './leather';

export const authConfig: NextAuthConfig = {
	trustHost: true,
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}),
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								email: credentials.email,
								password: credentials.password,
							}),
						}
					);

					if (!response.ok) {
						return null;
					}

					const user = await response.json();
					return user;
				} catch (error) {
					console.error('Auth error:', error);
					return null;
				}
			},
		}),
		Credentials({
			id: 'leather',
			name: 'Leather',
			credentials: {
				walletAddress: { label: 'Wallet Address', type: 'text' },
				signature: { label: 'Signature', type: 'text' },
				message: { label: 'Message', type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials?.walletAddress || !credentials?.signature || !credentials?.message) {
					return null;
				}

				// Validate Stacks wallet address format
				if (!isValidStacksAddress(credentials.walletAddress)) {
					return null;
				}

				try {
					// Verify signature on server
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/leather`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								walletAddress: credentials.walletAddress,
								signature: credentials.signature,
								message: credentials.message,
							}),
						}
					);

					if (!response.ok) {
						return null;
					}

					const user = await response.json();
					return {
						id: user.id,
						email: user.email,
						name: user.displayName,
						username: user.username,
						image: user.avatar,
						walletAddress: user.stacksAddress,
					};
				} catch (error) {
					console.error('Leather auth error:', error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
		error: '/auth/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			// Leather sign in - already handled in authorize
			if (account?.provider === 'leather') {
				return true;
			}
			
			// OAuth sign in
			if (account?.provider === 'google' || account?.provider === 'github') {
				try {
					// Register/login OAuth user on server
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/oauth`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								provider: account.provider,
								providerId: account.providerAccountId,
								email: user.email,
								name: user.name,
								image: user.image,
							}),
						}
					);

					if (!response.ok) {
						console.error('OAuth registration failed');
						return false;
					}

					const serverUser = await response.json();
					
					// Merge server user data
					user.id = serverUser.id;
					user.username = serverUser.username;
					user.image = serverUser.avatar || user.image; // Use server avatar
					
					return true;
				} catch (error) {
					console.error('OAuth error:', error);
					return false;
				}
			}

			return true;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.username = (user as any).username;
				token.email = user.email;
				token.picture = user.image; // Store avatar in token
				token.walletAddress = (user as any).walletAddress; // Store wallet address
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				(session.user as any).username = token.username;
				session.user.image = token.picture as string; // Set avatar from token
				(session.user as any).walletAddress = token.walletAddress as string; // Set wallet address
			}
			return session;
		},
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
};

