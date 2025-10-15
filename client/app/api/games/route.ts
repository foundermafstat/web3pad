import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		const response = await fetch(`${SERVER_URL}/api/games`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error('Failed to fetch games from server');
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching games from server:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch games' },
			{ status: 500 }
		);
	}
}
