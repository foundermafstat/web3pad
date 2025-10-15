import { GamesListView } from '@/components/games/GamesListView';

export default function GameHistoryPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">Game History</h1>
					<p className="text-muted-foreground mt-2">
						View all completed game sessions
					</p>
				</div>
				<GamesListView />
			</div>
		</div>
	);
}
