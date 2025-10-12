import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
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
	],
	pages: {
		signIn: '/auth/signin',
		error: '/auth/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
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
				console.log('[NextAuth JWT] User data:', {
					id: user.id,
					username: (user as any).username,
					email: user.email,
				});
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				(session.user as any).username = token.username;
				console.log('[NextAuth Session] Session user:', {
					id: session.user.id,
					username: (session.user as any).username,
					email: session.user.email,
				});
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

