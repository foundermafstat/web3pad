import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProfileView } from '@/components/profile/ProfileView';

interface ProfilePageProps {
	params: { username: string };
}

async function getProfile(username: string) {
	try {
		const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/profile/${username}`;
		const response = await fetch(url, { cache: 'no-store' });

		if (!response.ok) {
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error('[Profile] Failed to fetch profile:', error);
		return null;
	}
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const session = await auth();
	const { username } = await params;
	const profileData = await getProfile(username);

	if (!profileData) {
		notFound();
	}

	const isOwnProfile = session?.user?.username === username || session?.user?.id === username;

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

