import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		console.log('[Debug API] Fetching from:', `${SERVER_URL}/api/debug/users`);
		const response = await fetch(`${SERVER_URL}/api/debug/users`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});

		console.log('[Debug API] Response status:', response.status);

		if (!response.ok) {
			console.error('[Debug API] Server returned error:', response.status);
			return NextResponse.json(
				{ error: 'Failed to fetch users' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log('[Debug API] Data received:', data);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[Debug API] Fetch error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch users', details: (error as Error).message },
			{ status: 500 }
		);
	}
}

