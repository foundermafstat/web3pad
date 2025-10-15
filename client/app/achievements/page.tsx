import { AchievementsView } from '@/components/achievements/AchievementsView';

export default function AchievementsPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
					<p className="text-muted-foreground mt-2">
						Unlock rewards by playing and improving your skills
					</p>
				</div>
				<AchievementsView />
			</div>
		</div>
	);
}
