import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';

interface ProfilePageProps {
	params: { username: string };
}

async function getProfile(username: string) {
	try {
		console.log('[Profile Page] Fetching profile for:', username);
		const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profile/${username}`;
		console.log('[Profile Page] API URL:', url);
		
		const response = await fetch(url, { cache: 'no-store' });

		console.log('[Profile Page] Response status:', response.status);
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('[Profile Page] Error response:', errorData);
			return null;
		}

		const data = await response.json();
		console.log('[Profile Page] Profile data received:', data.user?.username);
		return data;
	} catch (error) {
		console.error('[Profile Page] Failed to fetch profile:', error);
		return null;
	}
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const session = await auth();
	const { username } = await params;
	
	console.log('[Profile Page] Requested username:', username);
	console.log('[Profile Page] Current session user:', session?.user?.username || session?.user?.email);
	
	const profileData = await getProfile(username);

	if (!profileData) {
		console.error('[Profile Page] Profile data not found for:', username);
		notFound();
	}

	const isOwnProfile = session?.user?.username === username || session?.user?.id === username;
	console.log('[Profile Page] Is own profile:', isOwnProfile);

	return (
		<div className="min-h-screen bg-background">
			<ProfileView
				profileData={profileData}
				isOwnProfile={isOwnProfile}
				currentUser={session?.user}
			/>
		</div>
	);
}

